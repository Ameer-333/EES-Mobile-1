
'use client';

import type { Student } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Search, UserPlus, Trash2, Loader2 } from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AddStudentDialog } from '@/components/teacher/add-student-dialog';
import { EditStudentDialog } from '@/components/teacher/edit-student-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, QuerySnapshot, DocumentData } from 'firebase/firestore';

const STUDENTS_COLLECTION = 'students';

export function TeacherStudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [currentStudentToEdit, setCurrentStudentToEdit] = useState<Student | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const studentsCollectionRef = collection(firestore, STUDENTS_COLLECTION);
    
    const unsubscribe = onSnapshot(studentsCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const fetchedStudents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Student));
      setStudents(fetchedStudents);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching students from Firestore:", error);
      toast({
        title: "Error Loading Students",
        description: "Could not fetch student data from Firestore.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [toast]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.satsNumber && student.satsNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [students, searchTerm]);

  const handleOpenEditDialog = (student: Student) => {
    setCurrentStudentToEdit(student);
    setIsEditStudentDialogOpen(true);
  };
  
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    try {
      const studentDocRef = doc(firestore, STUDENTS_COLLECTION, studentId);
      await deleteDoc(studentDocRef);
      // The onSnapshot listener will automatically update the local state
      toast({ title: "Student Record Deleted", description: `Student ${studentName} has been removed from Firestore.` });
    } catch (error) {
      console.error("Error deleting student from Firestore:", error);
      toast({
        title: "Deletion Failed",
        description: "Could not delete student from Firestore.",
        variant: "destructive",
      });
    }
  };

  const handleStudentAdded = (newStudent: Student) => {
    // Firestore listener updates the table. Toast is in AddStudentDialog.
    setIsAddStudentDialogOpen(false);
  };

  const handleStudentEdited = (editedStudent: Student) => {
    // Firestore listener updates the table. Toast is in EditStudentDialog.
    setIsEditStudentDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg rounded-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="mt-4 relative">
            <Skeleton className="h-10 w-full md:w-1/2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array(7).fill(0).map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="p-4">
                      <div className="flex items-center justify-center">
                         <Loader2 className="h-6 w-6 animate-spin text-primary" />
                         <span className="ml-2">Loading students...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
            <CardTitle className="text-2xl font-headline text-primary">Student Management</CardTitle>
            <CardDescription>View, search, and manage student records from Firestore.</CardDescription>
          </div>
          <Button onClick={() => setIsAddStudentDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add New Student
          </Button>
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or SATS number..."
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
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SATS No.</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Image
                      src={student.profilePictureUrl || `https://placehold.co/40x40.png?text=${student.name.charAt(0)}`}
                      alt={student.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                      data-ai-hint="student avatar"
                    />
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-[100px]">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.satsNumber}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.section}</TableCell>
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
                            record for {student.name} from Firestore.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteStudent(student.id, student.name)}>
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
                    No students found matching your criteria or no students in Firestore.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredStudents.length > 0 && (
          <div className="mt-4 text-right text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students from Firestore.
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
