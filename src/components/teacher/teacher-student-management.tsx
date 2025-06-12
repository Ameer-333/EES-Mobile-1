
'use client';

import type { Student } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Search, UserPlus, Trash2 } from 'lucide-react';
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

const mockStudentsData: Student[] = [
  { id: 'S001', name: 'Aarav Sharma', satsNumber: 'SAT001', class: '10th', section: 'A', caste: 'General', religion: 'Hindu', address: '1st Street, Bangalore', profilePictureUrl: 'https://placehold.co/40x40/FFE0B2/BF360C.png?text=AS' , dataAiHint: "student avatar"},
  { id: 'S002', name: 'Bhavna Singh', satsNumber: 'SAT002', class: '10th', section: 'B', caste: 'OBC', religion: 'Hindu', address: '2nd Street, Mysore', profilePictureUrl: 'https://placehold.co/40x40/C8E6C9/2E7D32.png?text=BS' , dataAiHint: "student avatar"},
  { id: 'S003', name: 'Chetan Reddy', satsNumber: 'SAT003', class: '9th', section: 'A', caste: 'General', religion: 'Hindu', address: '3rd Street, Hubli' },
  { id: 'S004', name: 'Diya Patel', satsNumber: 'SAT004', class: '9th', section: 'B', caste: 'OBC', religion: 'Hindu', address: '4th Street, Mangalore', profilePictureUrl: 'https://placehold.co/40x40/B3E5FC/01579B.png?text=DP', dataAiHint: "student avatar" },
  { id: 'S005', name: 'Ethan Dsouza', satsNumber: 'SAT005', class: '10th', section: 'A', caste: 'General', religion: 'Christian', address: '5th Street, Belgaum' },
];

export function TeacherStudentManagement() {
  const [students, setStudents] = useState<Student[]>(mockStudentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [currentStudentToEdit, setCurrentStudentToEdit] = useState<Student | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.satsNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleOpenEditDialog = (student: Student) => {
    setCurrentStudentToEdit(student);
    setIsEditStudentDialogOpen(true);
  };
  
  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    toast({ title: "Student Record Deleted", description: `Student with ID: ${studentId} has been removed.` });
  };

  const handleStudentAdded = (newStudent: Student) => {
    setStudents(prevStudents => [newStudent, ...prevStudents]);
    // Toast is handled within AddStudentDialog
  };

  const handleStudentEdited = (editedStudent: Student) => {
    setStudents(prevStudents => prevStudents.map(s => s.id === editedStudent.id ? editedStudent : s));
    // Toast is handled within EditStudentDialog
  };

  if (!hasMounted) {
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
                    {Array(7).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
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
            <CardDescription>View, search, and manage student records.</CardDescription>
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
                  <TableCell>{student.id}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
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
                            record for {student.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteStudent(student.id)}>
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
                    No students found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredStudents.length > 0 && (
          <div className="mt-4 text-right text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students.
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
