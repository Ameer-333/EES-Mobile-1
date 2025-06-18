
'use client';

import type { Teacher, ManagedUser } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Search, UserPlus, Trash2, Loader2 } from 'lucide-react';
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
import { TeacherProfileFormDialog } from './teacher-profile-form-dialog';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, QuerySnapshot, DocumentData } from 'firebase/firestore';

const TEACHERS_COLLECTION = 'teachers'; // Collection for HR-specific teacher data
const USERS_COLLECTION = 'users'; // Collection for auth supplemental data (roles, assignments)

export function ManageTeacherProfiles() {
  const [teachers, setTeachers] = useState<Teacher[]>([]); // Stores data from 'teachers' collection
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    // Listen to 'teachers' collection (HR profiles)
    // Document IDs in 'teachers' are now the authUid
    const teachersCollectionRef = collection(firestore, TEACHERS_COLLECTION);

    const unsubscribe = onSnapshot(teachersCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const fetchedTeachers = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id, // This ID is the authUid
        ...docSnapshot.data(),
      } as Teacher));
      setTeachers(fetchedTeachers);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching teachers from Firestore:", error);
      toast({
        title: "Error Loading Teachers",
        description: "Could not fetch teacher data from Firestore.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.id.toLowerCase().includes(searchTerm.toLowerCase()) || // id is authUid
        (teacher.subjectsTaught && teacher.subjectsTaught.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [teachers, searchTerm]);

  const handleAddTeacher = () => {
    setTeacherToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    // teacher.id here is the authUid, which is the doc ID in 'teachers' collection
    // teacherToEdit.authUid is also the same for clarity if needed in the form.
    setTeacherToEdit(teacher);
    setIsFormOpen(true);
  };

  const handleDeleteTeacher = async (teacherAuthUid: string, teacherName: string) => {
    // teacherAuthUid is the ID for both 'teachers' and 'users' documents.
    try {
      // 1. Delete from 'teachers' (HR profiles) collection
      const teacherDocRef = doc(firestore, TEACHERS_COLLECTION, teacherAuthUid);
      await deleteDoc(teacherDocRef);

      // 2. Delete from 'users' (auth supplemental data, roles, assignments) collection
      const userDocRef = doc(firestore, USERS_COLLECTION, teacherAuthUid);
      await deleteDoc(userDocRef);

      // Note: Deleting Firebase Auth user needs Admin SDK or Cloud Function, not done client-side.
      // This should be communicated to the admin.
      toast({
          title: "Teacher Records Deleted",
          description: (
            React.createElement('div', null,
              React.createElement('p', null, `HR profile and user data for `, React.createElement('strong', null, teacherName), ` removed from Firestore.`),
              React.createElement('p', {className: "text-xs mt-1 text-destructive"}, `Firebase Authentication account needs manual deletion from the Firebase console if required.`)
            )
          ),
          duration: 10000,
      });
    } catch (error) {
      console.error("Error deleting teacher records from Firestore:", error);
      toast({
        title: "Deletion Failed",
        description: `Could not delete records for teacher ${teacherName} from Firestore.`,
        variant: "destructive",
      });
    }
  };

  const handleTeacherSaved = (savedTeacher: Teacher, isEditing: boolean) => {
    // Firestore onSnapshot will handle UI updates.
    // The form dialog now handles its own closing for new teacher credential display.
    // If it's an edit, we can close it here.
    if (isEditing) {
      setIsFormOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg rounded-lg border-accent/50 mt-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
            </div>
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
                  <TableRow key={`skel-row-${i}`}>
                    <TableCell colSpan={6} className="p-4">
                        <div className="flex items-center justify-center">
                           <Loader2 className="h-6 w-6 animate-spin text-primary" />
                           <span className="ml-2">Loading teacher profiles...</span>
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
      <Card className="w-full shadow-lg rounded-lg border-accent/50 mt-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-headline text-primary">Teacher HR Profiles & Assignments</CardTitle>
              <CardDescription>Manage teacher information, contact details, and class/subject assignments. Auth accounts are created/managed here.</CardDescription>
            </div>
            <Button onClick={handleAddTeacher} className="bg-primary hover:bg-primary/90">
              <UserPlus className="mr-2 h-4 w-4" /> Add New Teacher
            </Button>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by Auth ID, name, email, or subject..."
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
                  <TableHead>Auth ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Subjects Qualified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}> {/* teacher.id is now authUid */}
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
                    <TableCell className="font-medium truncate max-w-[100px]">{teacher.id}</TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell className="text-muted-foreground">{teacher.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjectsTaught && teacher.subjectsTaught.map(subject => (
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
                              This action cannot be undone. This will permanently delete the HR profile and user data (assignments, role) for <strong>{teacher.name}</strong> (Auth ID: {teacher.id}) from Firestore. The Firebase Authentication account will need to be deleted manually from the Firebase console if required.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}>
                              Yes, delete records
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      {isLoading ? 'Loading teachers...' : 'No teachers found matching your criteria or no teachers in Firestore.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredTeachers.length > 0 && (
            <div className="mt-4 text-right text-sm text-muted-foreground">
              Showing {filteredTeachers.length} of {teachers.length} total teacher profiles from Firestore.
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
