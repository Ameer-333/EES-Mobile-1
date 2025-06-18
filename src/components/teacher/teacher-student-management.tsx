
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

const STUDENT_DATA_ROOT_COLLECTION = 'student_data_by_class';
const PROFILES_SUBCOLLECTION_NAME = 'profiles';
const USERS_COLLECTION = 'users'; 

// Helper function to get the path to a class's profiles subcollection
const getStudentProfilesCollectionPath = (classId: string): string => {
  if (!classId) {
    console.warn("Attempted to get student profiles collection path with undefined classId");
    return `${STUDENT_DATA_ROOT_COLLECTION}/unknown_class/${PROFILES_SUBCOLLECTION_NAME}`; // Fallback
  }
  return `${STUDENT_DATA_ROOT_COLLECTION}/${classId}/${PROFILES_SUBCOLLECTION_NAME}`;
};

// Helper function to get the path to a student's document
const getStudentDocPath = (classId: string, studentProfileId: string): string => {
    if (!classId || !studentProfileId) throw new Error("classId and studentProfileId are required to determine student document path");
    return `${STUDENT_DATA_ROOT_COLLECTION}/${classId}/${PROFILES_SUBCOLLECTION_NAME}/${studentProfileId}`;
  };


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
    let allFetchedStudentsMap: Map<string, Student> = new Map();

    const uniqueClassIds = Array.from(new Set(teacherAssignments.map(a => a.classId).filter(Boolean as unknown as (value: string | undefined) => value is string)));


    if (uniqueClassIds.length === 0) {
        setIsLoading(false);
        setAssignedStudents([]);
        return;
    }

    uniqueClassIds.forEach(classId => {
      const studentProfilesCollectionPath = getStudentProfilesCollectionPath(classId);
      const studentsCollectionRef = collection(firestore, studentProfilesCollectionPath);
      
      const unsubscribe = onSnapshot(studentsCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
        snapshot.docChanges().forEach((change) => {
            const studentData = {
                id: change.doc.id, // This is the studentProfileId
                ...change.doc.data(),
              } as Student;
            if (change.type === "added" || change.type === "modified") {
                allFetchedStudentsMap.set(studentData.authUid, studentData); // Use authUid as key for global uniqueness
            } else if (change.type === "removed") {
                allFetchedStudentsMap.delete(studentData.authUid);
            }
        });
        
        const currentlyAssigned = Array.from(allFetchedStudentsMap.values()).filter(student => {
            return teacherAssignments.some(assignment => {
                if (student.classId !== assignment.classId) return false;
                if (['mother_teacher', 'class_teacher', 'subject_teacher'].includes(assignment.type)) {
                    return assignment.sectionId ? student.sectionId === assignment.sectionId : true;
                }
                if (['nios_teacher', 'nclp_teacher'].includes(assignment.type)) {
                    return assignment.groupId ? student.groupId === assignment.groupId : true;
                }
                return false;
            });
        });
        setAssignedStudents(currentlyAssigned);
        setIsLoading(false); 
      }, (error) => {
        console.error(`Error fetching students from ${studentProfilesCollectionPath}:`, error);
        toast({
          title: `Error Loading Students from ${classId}`,
          description: `Could not fetch student data from ${studentProfilesCollectionPath}.`,
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
    const studentDocPath = getStudentDocPath(student.classId, student.id);
    try {
      const studentDocRef = doc(firestore, studentDocPath);
      await deleteDoc(studentDocRef);

      const userDocRef = doc(firestore, USERS_COLLECTION, student.authUid);
      await deleteDoc(userDocRef);
      
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
    setIsAddStudentDialogOpen(false);
  };

  const handleStudentEdited = (editedStudent: Student) => {
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
                <TableRow key={student.authUid || student.id}> 
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
                            record for {student.name || 'this student'} from its class subcollection ({getStudentProfilesCollectionPath(student.classId)}) and their user link from Firestore.
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

    

    