
'use client';

import type { Student, TeacherAssignment } from '@/types';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Search, UserPlus, Trash2, Loader2, Filter } from 'lucide-react';
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

// Helper function to generate student collection name
const getStudentCollectionName = (classId: string): string => {
  if (!classId) {
    // This case should ideally not happen if classId is always present
    console.warn("Attempted to get collection name with undefined classId");
    return 'students_unknown'; // Fallback, though likely problematic
  }
  return `students_${classId.toLowerCase().replace(/[^a-z0-9_]/gi, '_')}`;
};

const USERS_COLLECTION = 'users'; // To delete the user's link if student is deleted

export function TeacherStudentManagement() {
  const { userProfile } = useAppContext();
  const teacherAssignments = userProfile?.role === 'Teacher' ? userProfile.assignments : [];

  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [currentStudentToEdit, setCurrentStudentToEdit] = useState<Student | null>(null);

  useEffect(() => {
    if (userProfile?.role !== 'Teacher' || !teacherAssignments || teacherAssignments.length === 0) {
      setIsLoading(false);
      setAssignedStudents([]);
      return;
    }

    setIsLoading(true);
    const unsubscribers: (() => void)[] = [];
    let allFetchedStudents: Record<string, Student> = {}; // Use an object to handle potential duplicates by ID across snapshots

    const uniqueClassIds = Array.from(new Set(teacherAssignments.map(a => a.classId).filter(Boolean)));

    if (uniqueClassIds.length === 0) {
        setIsLoading(false);
        setAssignedStudents([]);
        return;
    }

    uniqueClassIds.forEach(classId => {
      const studentCollectionName = getStudentCollectionName(classId);
      const studentsCollectionRef = collection(firestore, studentCollectionName);
      
      // Filter by section/group if applicable for this classId based on assignments
      // This query part is complex if assignments have different section/group criteria for the same classId.
      // For simplicity, this example fetches all from the classId collection and filters client-side.
      // A more optimized approach might involve more specific queries if assignments are granular.
      const q = studentsCollectionRef; // Potentially add where clauses here based on assignments

      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        snapshot.docs.forEach(docSnapshot => {
          allFetchedStudents[docSnapshot.id] = {
            id: docSnapshot.id, // This is the ID from the students_<classId> collection
            ...docSnapshot.data(),
          } as Student;
        });
        
        // Filter all fetched students based on all assignments
        const currentlyAssigned = Object.values(allFetchedStudents).filter(student => {
            return teacherAssignments.some(assignment => {
                if (student.classId !== assignment.classId) return false;
                // For mother_teacher, class_teacher, subject_teacher - match sectionId if present
                if (['mother_teacher', 'class_teacher', 'subject_teacher'].includes(assignment.type)) {
                    return assignment.sectionId ? student.sectionId === assignment.sectionId : true;
                }
                // For nios_teacher, nclp_teacher - match groupId if present
                if (['nios_teacher', 'nclp_teacher'].includes(assignment.type)) {
                    return assignment.groupId ? student.groupId === assignment.groupId : true;
                }
                return false;
            });
        });
        setAssignedStudents(currentlyAssigned);
        setIsLoading(false); // Set loading to false after first successful fetch/merge
      }, (error) => {
        console.error(`Error fetching students from ${studentCollectionName}:`, error);
        toast({
          title: `Error Loading Students from ${classId}`,
          description: `Could not fetch student data from ${studentCollectionName}.`,
          variant: "destructive",
        });
        setIsLoading(false);
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [userProfile, teacherAssignments, toast]);


  const filteredStudentsToDisplay = useMemo(() => {
    if (!searchTerm) return assignedStudents;
    return assignedStudents.filter(
      (student) =>
        (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.id && student.id.toLowerCase().includes(searchTerm.toLowerCase())) || // student.id is doc ID in students_<classId>
        (student.satsNumber && student.satsNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.className && student.className.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [assignedStudents, searchTerm]);

  const handleOpenEditDialog = (student: Student) => {
    setCurrentStudentToEdit(student); // student object here contains its original classId
    setIsEditStudentDialogOpen(true);
  };
  
  const handleDeleteStudent = async (student: Student) => {
    if (!student.id || !student.classId || !student.authUid) {
        toast({ title: "Error", description: "Student data is incomplete for deletion.", variant: "destructive" });
        return;
    }
    const studentCollectionName = getStudentCollectionName(student.classId);
    try {
      // Delete from class-specific student collection
      const studentDocRef = doc(firestore, studentCollectionName, student.id);
      await deleteDoc(studentDocRef);

      // Delete from 'users' collection (the link to auth)
      const userDocRef = doc(firestore, USERS_COLLECTION, student.authUid);
      await deleteDoc(userDocRef);
      
      // Note: Deleting Firebase Auth user itself is not done here.
      toast({ title: "Student Record Deleted", description: `Student ${student.name || 'Unknown'} and their user link have been removed from Firestore.` });
    } catch (error) {
      console.error("Error deleting student from Firestore:", error);
      toast({
        title: "Deletion Failed",
        description: "Could not delete student records from Firestore.",
        variant: "destructive",
      });
    }
  };

  const handleStudentAdded = (newStudent: Student) => {
    // Firestore onSnapshot will handle UI updates.
    setIsAddStudentDialogOpen(false);
  };

  const handleStudentEdited = (editedStudent: Student) => {
     // Firestore onSnapshot will handle UI updates.
    setIsEditStudentDialogOpen(false);
    // If classId changed, the useEffect for fetching students should ideally re-trigger
    // or we need to manually refetch/resort. For now, rely on existing snapshot behavior.
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
                  <TableRow key={i}><TableCell colSpan={7} className="p-4">
                      <div className="flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Loading students...</span></div>
                  </TableCell></TableRow>))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-headline text-primary">My Assigned Students</CardTitle>
            <CardDescription>
              {userProfile?.role === 'Teacher' && (!teacherAssignments || teacherAssignments.length === 0)
                ? "You are not currently assigned to any classes. Please contact an administrator."
                : "View, search, and manage records for students in your assigned classes."}
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddStudentDialogOpen(true)} disabled={userProfile?.role === 'Teacher' && (!teacherAssignments || teacherAssignments.length === 0)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add New Student
          </Button>
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, SATS, or class display name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-1/2"
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
                <TableHead>Class ID (System)</TableHead>
                <TableHead>Section ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudentsToDisplay.length > 0 ? filteredStudentsToDisplay.map((student) => (
                <TableRow key={student.authUid || student.id}> {/* Use authUid if available, else student.id */}
                  <TableCell>
                    <Image
                      src={student.profilePictureUrl || `https://placehold.co/40x40.png?text=${student.name && student.name.length > 0 ? student.name.charAt(0) : 'S'}`}
                      alt={student.name || 'Student'}
                      width={40}
                      height={40}
                      className="rounded-full"
                      data-ai-hint="student avatar"
                    />
                  </TableCell>
                  <TableCell>{student.name || 'N/A'}</TableCell>
                  <TableCell>{student.satsNumber || 'N/A'}</TableCell>
                  <TableCell>{student.className || 'N/A'}</TableCell>
                  <TableCell className="font-mono text-xs">{student.classId || 'N/A'}</TableCell>
                  <TableCell>{student.sectionId || 'N/A'}</TableCell>
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
                            record for {student.name || 'this student'} from its class collection ({getStudentCollectionName(student.classId)}) and their user link from Firestore.
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
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    {userProfile?.role === 'Teacher' && (!teacherAssignments || teacherAssignments.length === 0)
                      ? "No classes assigned."
                      : "No students found matching your assignments or search criteria."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredStudentsToDisplay.length > 0 && (
          <div className="mt-4 text-right text-sm text-muted-foreground">
            Showing {filteredStudentsToDisplay.length} students based on your assignments and filters.
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

    