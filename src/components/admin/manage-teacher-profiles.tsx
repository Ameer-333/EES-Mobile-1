
'use client';

import type { Teacher } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Search, UserPlus, Trash2, Eye } from 'lucide-react';
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
import { TeacherProfileFormDialog } from './teacher-profile-form-dialog';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

const mockInitialTeachers: Teacher[] = [
  {
    id: 'T001', name: 'Priya Sharma', email: 'priya.sharma@ees.com', phoneNumber: '9876543210',
    address: '123 Park Avenue, Bangalore', yearOfJoining: 2018, totalYearsWorked: 6,
    subjectsTaught: ['English', 'Social Science'], profilePictureUrl: 'https://placehold.co/40x40/E6E6FA/300130.png?text=PS',
    salaryHistory: [{ id: 'sal1-T001', monthYear: 'June 2024', dateIssued: '2024-07-01', amountIssued: 50000, amountDeducted: 2500, daysAbsent: 2, reasonForAbsence: 'Sick leave (approved)' }],
    daysPresentThisMonth: 20, daysAbsentThisMonth: 2,
  },
  {
    id: 'T002', name: 'Anand Singh', email: 'anand.singh@ees.com', phoneNumber: '9876543211',
    address: '456 Lake View Rd, Mysore', yearOfJoining: 2020, totalYearsWorked: 4,
    subjectsTaught: ['Maths', 'Science'], profilePictureUrl: 'https://placehold.co/40x40/FFE0B2/BF360C.png?text=AS',
    salaryHistory: [{ id: 'sal1-T002', monthYear: 'June 2024', dateIssued: '2024-07-01', amountIssued: 45000, amountDeducted: 0, daysAbsent: 0 }],
    daysPresentThisMonth: 22, daysAbsentThisMonth: 0,
  },
];


export function ManageTeacherProfiles() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockInitialTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subjectsTaught.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [teachers, searchTerm]);

  const handleAddTeacher = () => {
    setTeacherToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setTeacherToEdit(teacher);
    setIsFormOpen(true);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    toast({ title: "Teacher Deleted", description: `Teacher profile with ID: ${teacherId} has been removed.` });
  };

  const handleTeacherSaved = (savedTeacher: Teacher, isEditing: boolean) => {
    if (isEditing) {
      setTeachers(prev => prev.map(t => t.id === savedTeacher.id ? savedTeacher : t));
    } else {
      setTeachers(prev => [savedTeacher, ...prev]);
    }
  };
  
  if (!hasMounted) {
    return (
      <Card className="w-full shadow-lg rounded-lg border-accent/50 mt-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-10 w-full md:w-1/2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
             <Table>
              <TableHeader>
                <TableRow>
                  {Array(6).fill(0).map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full"/></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(6).fill(0).map((_,j) => <TableCell key={j}><Skeleton className="h-5 w-full"/></TableCell>)}
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
      <Card className="w-full shadow-lg rounded-lg border-accent/50 mt-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-headline text-primary">Teacher Profiles</CardTitle>
              <CardDescription>Manage teacher information, contact details, and subjects.</CardDescription>
            </div>
            <Button onClick={handleAddTeacher} className="bg-primary hover:bg-primary/90">
              <UserPlus className="mr-2 h-4 w-4" /> Add New Teacher
            </Button>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-1/2"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <Image
                        src={teacher.profilePictureUrl || `https://placehold.co/40x40.png?text=${teacher.name.charAt(0)}`}
                        alt={teacher.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                        data-ai-hint="teacher avatar"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{teacher.id}</TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell className="text-muted-foreground">{teacher.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjectsTaught.map(subject => (
                          <Badge key={subject} variant="secondary" className="text-xs">{subject}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditTeacher(teacher)}>
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the profile for <strong>{teacher.name}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTeacher(teacher.id)}>
                              Yes, delete profile
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No teachers found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredTeachers.length > 0 && (
            <div className="mt-4 text-right text-sm text-muted-foreground">
              Showing {filteredTeachers.length} of {teachers.length} total teacher profiles.
            </div>
          )}
        </CardContent>
      </Card>

      <TeacherProfileFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onTeacherSaved={handleTeacherSaved}
        teacherToEdit={teacherToEdit}
      />
    </>
  );
}
