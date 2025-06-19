
'use client';

import type { Student, TeacherAssignment } from '@/types';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Search, UserPlus, Trash2, Loader2, Filter, Info } from 'lucide-react';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AddStudentDialog } from '@/components/teacher/add-student-dialog';
import { EditStudentDialog } from '@/components/teacher/edit-student-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, QuerySnapshot, DocumentData, query, where } from 'firebase/firestore';
import { useAppContext } from '@/app/(protected)/layout';
import { getStudentProfilesCollectionPath, getStudentDocPath, getUserDocPath } from '@/lib/firestore-paths'; // Ensure getUserDocPath is imported

export function TeacherStudentManagement() {
  const { userProfile } = useAppContext();
  const teacherAssignments = userProfile?.role === 'Teacher' ? userProfile.assignments || [] : [];

  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [currentStudentToEdit, setCurrentStudentToEdit] = useState<Student | null>(null);

  useEffect(() => {
    if (userProfile?.role !== 'Teacher' || teacherAssignments.length === 0) {
      setIsLoading(false);
      setAssignedStudents([]);
      return;
    }

    setIsLoading(true);
    const unsubscribers: (() => void)[] = [];
    const fetchedStudentsMap: Map<string, Student> = new Map(); // Keyed by student.id (studentProfileId)

    // Get unique classIds the teacher is assigned to
    const uniqueClassIdsTeacherIsAssignedTo = Array.from(new Set(teacherAssignments.map(a => a.classId)));

    if (uniqueClassIdsTeacherIsAssignedTo.length === 0) {
        setIsLoading(false);
        setAssignedStudents([]);
        return;
    }
    
    let activeListeners = uniqueClassIdsTeacherIsAssignedTo.length;

    uniqueClassIdsTeacherIsAssignedTo.forEach(classId => {
      const studentProfilesPath = getStudentProfilesCollectionPath(classId);
      const studentsCollectionRef = collection(firestore, studentProfilesPath);
      
      const unsubscribe = onSnapshot(studentsCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
        snapshot.docChanges().forEach((change) => {
            const studentData = { id: change.doc.id, ...change.doc.data() } as Student;
            if (change.type === "added" || change.type === "modified") {
                fetchedStudentsMap.set(studentData.id, studentData);
            } else if (change.type === "removed") {
                fetchedStudentsMap.delete(studentData.id);
            }
        });
        
        // Filter all fetched students based on the teacher's specific assignments
        const currentFilteredStudents = Array.from(fetchedStudentsMap.values()).filter(student => 
            teacherAssignments.some(assignment => {
                if (student.classId !== assignment.classId) return false; // Student must be in an assigned classId

                // For Class/Mother teacher, match sectionId if present in assignment
                if ((assignment.type === 'class_teacher' || assignment.type === 'mother_teacher')) {
                    return !assignment.sectionId || student.sectionId === assignment.sectionId;
                }
                // For Subject teacher, NIOS, NCLP, they see all students in the classId unless further filtered by groupId
                if (assignment.type === 'subject_teacher' || assignment.type === 'nios_teacher' || assignment.type === 'nclp_teacher') {
                    if (assignment.sectionId && student.sectionId !== assignment.sectionId) return false; // if section is specified for these types
                    if (assignment.groupId && student.groupId !== assignment.groupId) return false; // if group is specified
                    return true; // Generally, they see all students in the assigned classId/sectionId/groupId
                }
                return false;
            })
        );
        setAssignedStudents(currentFilteredStudents);
        
      }, (error) => {
        console.error(`Error fetching students from ${studentProfilesPath}:`, error);
        toast({
          title: `Error Loading Students`,
          description: `Could not fetch student data from class ${classId}.`,
          variant: "destructive",
        });
      });
      unsubscribers.push(unsubscribe);
    });
    
    // Initial loading state update after setting up all listeners
    // This might need refinement if listeners update student list incrementally
    if (activeListeners > 0) { // Check if there were any listeners to begin with
        const initialLoadCheck = setInterval(() => {
             // A simple heuristic: if after some time, students are still empty but no errors, 
             // it might mean no students match or collections are empty.
            if (unsubscribers.length === activeListeners) { // Ensure all listeners are attached
                setIsLoading(false);
                clearInterval(initialLoadCheck);
            }
        }, 500); // Check every 500ms, clear after a few seconds or when students load
         setTimeout(() => { // Fallback to stop loading indicator
            if(isLoading) setIsLoading(false);
            clearInterval(initialLoadCheck);
        }, 5000); // Stop after 5 seconds regardless
    } else {
        setIsLoading(false); // No assignments, so not loading
    }


    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [userProfile, teacherAssignments, toast]);


  const filteredStudentsToDisplay = useMemo(() => {
    if (!searchTerm) return assignedStudents;
    return assignedStudents.filter(
      (student) =>
        (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.id && student.id.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (student.satsNumber && student.satsNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.className && student.className.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [assignedStudents, searchTerm]);

  const handleOpenEditDialog = (student: Student) => {
    setCurrentStudentToEdit(student); 
    setIsEditStudentDialogOpen(true);
  };
  
  const handleDeleteStudent = async (student: Student) => {
    if (!student.id || !student.classId || !student.authUid) {
        toast({ title: "Error", description: "Student data is incomplete for deletion.", variant: "destructive" });
        return;
    }
    try {
      const studentDocRef = doc(firestore, getStudentDocPath(student.classId, student.id));
      await deleteDoc(studentDocRef);

      const userDocRef = doc(firestore, getUserDocPath(student.authUid));
      await deleteDoc(userDocRef);
      
      toast({ title: "Student Record Deleted", description: `Student ${student.name || 'Unknown'} and their auth user record have been removed.` });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Deletion Failed",
        description: "Could not delete student records.",
        variant: "destructive",
      });
    }
  };

  const handleStudentAdded = (newStudent: Student) => {
    // The onSnapshot listener should automatically update the list
    setIsAddStudentDialogOpen(false);
  };

  const handleStudentEdited = (editedStudent: Student) => {
    // The onSnapshot listener should automatically update the list
    setIsEditStudentDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg rounded-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div> <Skeleton className="h-8 w-48 mb-2" /> <Skeleton className="h-4 w-72" /> </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="mt-4 relative"> <Skeleton className="h-10 w-full md:w-1/2" /> </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table><TableHeader><TableRow>{Array(7).fill(0).map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}</TableRow></TableHeader>
              <TableBody>{Array(3).fill(0).map((_, i) => (
                  <TableRow key={`skel-stud-${i}`}><TableCell colSpan={6} className="p-4">
                      <div className="flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Loading assigned students...</span></div>
                  </TableCell></TableRow>))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canAddStudents = teacherAssignments.some(a => a.type === 'class_teacher' || a.type === 'mother_teacher');

  return (
    <>
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-headline text-primary">My Assigned Students</CardTitle>
            <CardDescription>
              {teacherAssignments.length === 0
                ? "You are not currently assigned to any classes or students. Please contact an administrator."
                : "View, search, and manage records for students based on your teaching assignments."}
            </CardDescription>
          </div>
          {canAddStudents && (
            <Button onClick={() => setIsAddStudentDialogOpen(true)} disabled={teacherAssignments.length === 0}>
                <UserPlus className="mr-2 h-4 w-4" /> Add New Student
            </Button>
           )}
           {!canAddStudents && teacherAssignments.length > 0 && (
             <div className="text-sm text-muted-foreground p-2 border border-dashed rounded-md flex items-center gap-2">
                <Info size={16} /> Student addition is typically handled by Class/Mother Teachers.
             </div>
           )}
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, SATS, or class display name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-1/2"
            disabled={teacherAssignments.length === 0}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SATS No.</TableHead>
                <TableHead>Class (Display)</TableHead>
                <TableHead>Section/Group</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudentsToDisplay.length > 0 ? filteredStudentsToDisplay.map((student) => (
                <TableRow key={student.id}> 
                  <TableCell>
                    <Image
                      src={student.profilePictureUrl || `https://placehold.co/40x40.png`}
                      alt={student.name || 'Student'}
                      width={40}
                      height={40}
                      className="rounded-full"
                      data-ai-hint="student avatar"
                    />
                  </TableCell>
                  <TableCell>{student.name || 'N/A'}</TableCell>
                  <TableCell>{student.satsNumber || 'N/A'}</TableCell>
                  <TableCell>{student.className || student.classId || 'N/A'}</TableCell>
                  <TableCell>{student.sectionId || student.groupId || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(student)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the student
                            record for {student.name || 'this student'} from Firestore (path: {getStudentDocPath(student.classId, student.id)}) and their main user record (path: {getUserDocPath(student.authUid)}).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteStudent(student)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    {teacherAssignments.length === 0
                      ? "No classes assigned to you."
                      : "No students found matching your assignments or search criteria."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredStudentsToDisplay.length > 0 && (
          <div className="mt-4 text-right text-sm text-muted-foreground">
            Showing {filteredStudentsToDisplay.length} of {assignedStudents.length} total assigned students.
          </div>
        )}
      </CardContent>
    </Card>
    <AddStudentDialog
        isOpen={isAddStudentDialogOpen}
        onOpenChange={setIsAddStudentDialogOpen}
        onStudentAdded={handleStudentAdded}
    />
    <EditStudentDialog
        isOpen={isEditStudentDialogOpen}
        onOpenChange={setIsEditStudentDialogOpen}
        onStudentEdited={handleStudentEdited}
        studentToEdit={currentStudentToEdit}
    />
    </>
  );
}
