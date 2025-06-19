
'use client';

import type { Student, TeacherAssignment } from '@/types';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Search, UserPlus, Trash2, Loader2, Filter, Info } from 'lucide-react';
import NextImage from 'next/image'; // Keep NextImage for non-placeholders
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
import { getStudentProfilesCollectionPath, getStudentDocPath, getUserDocPath } from '@/lib/firestore-paths';

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
    const fetchedStudentsMap: Map<string, Student> = new Map();

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
        
        const currentFilteredStudents = Array.from(fetchedStudentsMap.values()).filter(student => 
            teacherAssignments.some(assignment => {
                if (student.classId !== assignment.classId) return false; 
                if ((assignment.type === 'class_teacher' || assignment.type === 'mother_teacher')) {
                    return !assignment.sectionId || student.sectionId === assignment.sectionId;
                }
                if (assignment.type === 'subject_teacher' || assignment.type === 'nios_teacher' || assignment.type === 'nclp_teacher') {
                    if (assignment.sectionId && student.sectionId !== assignment.sectionId) return false; 
                    if (assignment.groupId && student.groupId !== assignment.groupId) return false; 
                    return true; 
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
    
    if (activeListeners > 0) { 
        const initialLoadCheck = setInterval(() => {
            if (unsubscribers.length === activeListeners) { 
                setIsLoading(false);
                clearInterval(initialLoadCheck);
            }
        }, 500); 
         setTimeout(() => { 
            if(isLoading) setIsLoading(false);
            clearInterval(initialLoadCheck);
        }, 5000); 
    } else {
        setIsLoading(false); 
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
            &lt;div&gt; &lt;Skeleton className="h-8 w-48 mb-2" /&gt; &lt;Skeleton className="h-4 w-72" /&gt; &lt;/div&gt;
            &lt;Skeleton className="h-10 w-40" /&gt;
          </div>
          &lt;div className="mt-4 relative"&gt; &lt;Skeleton className="h-10 w-full md:w-1/2" /&gt; &lt;/div&gt;
        </CardHeader>
        <CardContent>
          &lt;div className="rounded-md border"&gt;
            &lt;Table&gt;&lt;TableHeader&gt;&lt;TableRow&gt;{Array(7).fill(0).map((_, i) =&gt; &lt;TableHead key={i}&gt;&lt;Skeleton className="h-5 w-full" /&gt;&lt;/TableHead&gt;)}&lt;/TableRow&gt;&lt;/TableHeader&gt;
              &lt;TableBody&gt;{Array(3).fill(0).map((_, i) =&gt; (
                  &lt;TableRow key={`skel-stud-${i}`}&gt;&lt;TableCell colSpan={6} className="p-4"&gt;
                      &lt;div className="flex items-center justify-center"&gt;&lt;Loader2 className="h-6 w-6 animate-spin text-primary" /&gt;&lt;span className="ml-2"&gt;Loading assigned students...&lt;/span&gt;&lt;/div&gt;
                  &lt;/TableCell&gt;&lt;/TableRow&gt;))
              }&lt;/TableBody&gt;
            &lt;/Table&gt;
          &lt;/div&gt;
        &lt;/CardContent&gt;
      &lt;/Card&gt;
    );
  }

  const canAddStudents = teacherAssignments.some(a => a.type === 'class_teacher' || a.type === 'mother_teacher');

  return (
    &lt;&gt;
    &lt;Card className="w-full shadow-lg rounded-lg"&gt;
      &lt;CardHeader&gt;
        &lt;div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"&gt;
          &lt;div&gt;
            &lt;CardTitle className="text-2xl font-headline text-primary"&gt;My Assigned Students&lt;/CardTitle&gt;
            &lt;CardDescription&gt;
              {teacherAssignments.length === 0
                ? "You are not currently assigned to any classes or students. Please contact an administrator."
                : "View, search, and manage records for students based on your teaching assignments."}
            &lt;/CardDescription&gt;
          &lt;/div&gt;
          {canAddStudents && (
            &lt;Button onClick={() =&gt; setIsAddStudentDialogOpen(true)} disabled={teacherAssignments.length === 0}&gt;
                &lt;UserPlus className="mr-2 h-4 w-4" /&gt; Add New Student
            &lt;/Button&gt;
           )}
           {!canAddStudents && teacherAssignments.length &gt; 0 && (
             &lt;div className="text-sm text-muted-foreground p-2 border border-dashed rounded-md flex items-center gap-2"&gt;
                &lt;Info size={16} /&gt; Student addition is typically handled by Class/Mother Teachers.
             &lt;/div&gt;
           )}
        &lt;/div&gt;
        &lt;div className="mt-4 relative"&gt;
          &lt;Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /&gt;
          &lt;Input
            placeholder="Search by name, SATS, or class display name..."
            value={searchTerm}
            onChange={(e) =&gt; setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-1/2"
            disabled={teacherAssignments.length === 0}
          /&gt;
        &lt;/div&gt;
      &lt;/CardHeader&gt;
      &lt;CardContent&gt;
        &lt;div className="rounded-md border"&gt;
          &lt;Table&gt;
            &lt;TableHeader&gt;
              &lt;TableRow&gt;
                &lt;TableHead className="w-[60px]"&gt;Avatar&lt;/TableHead&gt;
                &lt;TableHead&gt;Name&lt;/TableHead&gt;
                &lt;TableHead&gt;SATS No.&lt;/TableHead&gt;
                &lt;TableHead&gt;Class (Display)&lt;/TableHead&gt;
                &lt;TableHead&gt;Section/Group&lt;/TableHead&gt;
                &lt;TableHead className="text-right"&gt;Actions&lt;/TableHead&gt;
              &lt;/TableRow&gt;
            &lt;/TableHeader&gt;
            &lt;TableBody&gt;
              {filteredStudentsToDisplay.length &gt; 0 ? filteredStudentsToDisplay.map((student) =&gt; {
                const imgSrc = student.profilePictureUrl || `https://placehold.co/40x40.png`;
                const useRegularImg = imgSrc.includes('placehold.co');
                return (
                &lt;TableRow key={student.id}&gt; 
                  &lt;TableCell&gt;
                    {useRegularImg ? (
                        &lt;img
                          src={imgSrc}
                          alt={student.name || 'Student'}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          data-ai-hint="student avatar placeholder"
                        /&gt;
                      ) : (
                        &lt;NextImage
                          src={imgSrc}
                          alt={student.name || 'Student'}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          data-ai-hint="student avatar"
                        /&gt;
                      )}
                  &lt;/TableCell&gt;
                  &lt;TableCell&gt;{student.name || 'N/A'}&lt;/TableCell&gt;
                  &lt;TableCell&gt;{student.satsNumber || 'N/A'}&lt;/TableCell&gt;
                  &lt;TableCell&gt;{student.className || student.classId || 'N/A'}&lt;/TableCell&gt;
                  &lt;TableCell&gt;{student.sectionId || student.groupId || 'N/A'}&lt;/TableCell&gt;
                  &lt;TableCell className="text-right space-x-2"&gt;
                    &lt;Button variant="outline" size="sm" onClick={() =&gt; handleOpenEditDialog(student)}&gt;
                      &lt;Edit className="h-4 w-4 mr-1" /&gt; Edit
                    &lt;/Button&gt;
                    &lt;AlertDialog&gt;
                      &lt;AlertDialogTrigger asChild&gt;
                        &lt;Button variant="destructive" size="sm"&gt;
                          &lt;Trash2 className="h-4 w-4 mr-1" /&gt; Delete
                        &lt;/Button&gt;
                      &lt;/AlertDialogTrigger&gt;
                      &lt;AlertDialogContent&gt;
                        &lt;AlertDialogHeader&gt;
                          &lt;AlertDialogTitle&gt;Are you sure?&lt;/AlertDialogTitle&gt;
                          &lt;AlertDialogDescription&gt;
                            This action cannot be undone. This will permanently delete the student
                            record for {student.name || 'this student'} from Firestore (path: {getStudentDocPath(student.classId, student.id)}) and their main user record (path: {getUserDocPath(student.authUid)}).
                          &lt;/AlertDialogDescription&gt;
                        &lt;/AlertDialogHeader&gt;
                        &lt;AlertDialogFooter&gt;
                          &lt;AlertDialogCancel&gt;Cancel&lt;/AlertDialogCancel&gt;
                          &lt;AlertDialogAction onClick={() =&gt; handleDeleteStudent(student)}&gt;
                            Continue
                          &lt;/AlertDialogAction&gt;
                        &lt;/AlertDialogFooter&gt;
                      &lt;/AlertDialogContent&gt;
                    &lt;/AlertDialog&gt;
                  &lt;/TableCell&gt;
                &lt;/TableRow&gt;
              )}) : (
                &lt;TableRow&gt;
                  &lt;TableCell colSpan={6} className="text-center h-24 text-muted-foreground"&gt;
                    {teacherAssignments.length === 0
                      ? "No classes assigned to you."
                      : "No students found matching your assignments or search criteria."}
                  &lt;/TableCell&gt;
                &lt;/TableRow&gt;
              )}
            &lt;/TableBody&gt;
          &lt;/Table&gt;
        &lt;/div&gt;
        {filteredStudentsToDisplay.length &gt; 0 && (
          &lt;div className="mt-4 text-right text-sm text-muted-foreground"&gt;
            Showing {filteredStudentsToDisplay.length} of {assignedStudents.length} total assigned students.
          &lt;/div&gt;
        )}
      &lt;/CardContent&gt;
    &lt;/Card&gt;
    &lt;AddStudentDialog
        isOpen={isAddStudentDialogOpen}
        onOpenChange={setIsAddStudentDialogOpen}
        onStudentAdded={handleStudentAdded}
    /&gt;
    &lt;EditStudentDialog
        isOpen={isEditStudentDialogOpen}
        onOpenChange={setIsEditStudentDialogOpen}
        onStudentEdited={handleStudentEdited}
        studentToEdit={currentStudentToEdit}
    /&gt;
    &lt;/&gt;
  );
}

