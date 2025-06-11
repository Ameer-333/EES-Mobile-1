'use client';

import type { Student } from '@/types';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Search, UserPlus, Trash2 } from 'lucide-react';
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

const mockStudents: Student[] = [
  { id: 'S001', name: 'Aarav Sharma', satsNumber: 'SAT001', class: '10', section: 'A', caste: 'General', religion: 'Hindu', address: '1st Street' },
  { id: 'S002', name: 'Bhavna Singh', satsNumber: 'SAT002', class: '10', section: 'B', caste: 'OBC', religion: 'Hindu', address: '2nd Street' },
  { id: 'S003', name: 'Chetan Reddy', satsNumber: 'SAT003', class: '9', section: 'A', caste: 'General', religion: 'Hindu', address: '3rd Street' },
  { id: 'S004', name: 'Diya Patel', satsNumber: 'SAT004', class: '9', section: 'B', caste: 'OBC', religion: 'Hindu', address: '4th Street' },
  { id: 'S005', name: 'Ethan Dsouza', satsNumber: 'SAT005', class: '10', section: 'A', caste: 'General', religion: 'Christian', address: '5th Street' },
];

export function TeacherStudentManagement() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleEditStudent = (studentId: string) => {
    // Mock edit action
    toast({ title: "Edit Student", description: `Editing student with ID: ${studentId}. (Feature in development)` });
  };
  
  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    toast({ title: "Student Deleted", description: `Student with ID: ${studentId} has been removed.` });
  };

  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-headline text-primary">Student Management</CardTitle>
            <CardDescription>View, search, and manage student records.</CardDescription>
          </div>
          <Button><UserPlus className="mr-2 h-4 w-4" /> Add New Student</Button>
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by ID or name..."
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
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.id}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditStudent(student.id)}>
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
                  <TableCell colSpan={5} className="text-center h-24">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredStudents.length > 5 && (
          <div className="mt-4 text-right text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
