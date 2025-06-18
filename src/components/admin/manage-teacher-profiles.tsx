
'use client';

import type { Teacher, ManagedUser, TeacherAssignment } from '@/types'; // Added TeacherAssignment
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Search, UserPlus, Trash2, Loader2, Briefcase } from 'lucide-react'; // Added Briefcase
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
import { collection, onSnapshot, deleteDoc, doc, QuerySnapshot, DocumentData, getDoc } from 'firebase/firestore'; // Added getDoc
import { getTeachersCollectionPath, getUserDocPath, getTeacherDocPath } from '@/lib/firestore-paths'; // Added getTeacherDocPath

interface TeacherWithAssignments extends Teacher {
    assignments?: TeacherAssignment[];
}


export function ManageTeacherProfiles() {
  const [teachersWithAssignments, setTeachersWithAssignments] = useState<TeacherWithAssignments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null); // Keep as Teacher, form dialog handles fetching assignments for edit
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const teachersCollectionPath = getTeachersCollectionPath();
    const teachersCollectionRef = collection(firestore, teachersCollectionPath);

    const unsubscribe = onSnapshot(teachersCollectionRef, async (teachersSnapshot: QuerySnapshot<DocumentData>) => {
      const fetchedTeachersPromises = teachersSnapshot.docs.map(async (teacherDoc) => {
        const teacherData = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;
        // Fetch assignments from the 'users' collection
        const userDocRef = doc(firestore, getUserDocPath(teacherData.authUid));
        const userDocSnap = await getDoc(userDocRef);
        const assignments = userDocSnap.exists() ? (userDocSnap.data() as ManagedUser).assignments || [] : [];
        return { ...teacherData, assignments };
      });
      
      const resolvedTeachers = await Promise.all(fetchedTeachersPromises);
      setTeachersWithAssignments(resolvedTeachers);
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
    return teachersWithAssignments.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.authUid && teacher.authUid.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (teacher.subjectsTaught && teacher.subjectsTaught.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (teacher.assignments && teacher.assignments.some(a => 
            (a.className && a.className.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.classId && a.classId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.sectionId && a.sectionId.toLowerCase().includes(searchTerm.toLowerCase()))
        ))
    );
  }, [teachersWithAssignments, searchTerm]);

  const handleAddTeacher = () => {
    setTeacherToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => { // Parameter remains Teacher
    setTeacherToEdit(teacher);
    setIsFormOpen(true);
  };

  const handleDeleteTeacher = async (teacherAuthUid: string, teacherName: string) => {
    try {
      // Delete from 'teachers' (HR Profile) collection
      const teacherHRDocPath = getTeacherDocPath(teacherAuthUid);
      await deleteDoc(doc(firestore, teacherHRDocPath));

      // Delete from 'users' (Auth Supplemental) collection
      const userDocPath = getUserDocPath(teacherAuthUid);
      await deleteDoc(doc(firestore, userDocPath));

      // Note: Firebase Auth account needs manual deletion from Firebase Console.
      // This is a common practice as deleting auth users programmatically from client/admin panel can be risky.

      toast({
          title: "Teacher Records Deleted",
          description: (
            React.createElement('div', null,
              React.createElement('p', null, `HR profile and user data for `, React.createElement('strong', null, teacherName), ` (Auth ID: ${teacherAuthUid}) removed from Firestore.`),
              React.createElement('p', {className: "text-xs mt-1 text-destructive"}, `IMPORTANT: The Firebase Authentication account for this teacher needs to be deleted manually from the Firebase console if completely removing the teacher.`)
            )
          ),
          duration: 15000,
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
     // Snapshot listener will update the UI automatically.
    if (isEditing) {
      setIsFormOpen(false);
    }
  };
  
  const getAssignmentSummary = (assignments?: TeacherAssignment[]): string => {
    if (!assignments || assignments.length === 0) return "No assignments";
    if (assignments.length > 2) return `${assignments.length} assignments`;
    return assignments.map(a => `${a.className || a.classId}${a.sectionId ? `-${a.sectionId}`: ''} (${a.type})`).join(', ');
  }


  if (isLoading) {
    return (
      <Card className="w-full shadow-lg rounded-lg border-accent/50 mt-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-72" /></div>
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="mt-4"><Skeleton className="h-10 w-full md:w-1/2" /></div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
             <Table>
              <TableHeader><TableRow>{Array(7).fill(0).map((_, i) => <TableHead key={`skel-th-${i}`}><Skeleton className="h-5 w-full"/></TableHead>)}</TableRow></TableHeader>
              <TableBody>{Array(3).fill(0).map((_, i) => (
                  <TableRow key={`skel-row-${i}`}><TableCell colSpan={7} className="p-4">
                      <div className="flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Loading teacher profiles...</span></div></TableCell></TableRow>))}</TableBody>
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
              <CardDescription>Manage teacher HR info, contact details, and teaching assignments. Auth accounts are created/managed via this interface.</CardDescription>
            </div>
            <Button onClick={handleAddTeacher} className="bg-primary hover:bg-primary/90">
              <UserPlus className="mr-2 h-4 w-4" /> Add New Teacher
            </Button>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by Auth ID, name, email, subject, or assignment class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-2/3"
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
                  <TableHead><Briefcase className="inline-block h-4 w-4 mr-1"/>Assignments</TableHead>
                  <TableHead>Qualified Subjects</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.authUid}>
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
                    <TableCell className="font-medium truncate max-w-[100px] text-xs">{teacher.authUid}</TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{teacher.email}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={teacher.assignments?.map(a => `${a.className || a.classId}${a.sectionId ? `-${a.sectionId}`: ''} (${a.type})`).join(', ')}>
                        {getAssignmentSummary(teacher.assignments)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {teacher.subjectsTaught && teacher.subjectsTaught.slice(0,3).map(subject => ( // Show first 3
                          <Badge key={subject} variant="secondary" className="text-xs">{subject}</Badge>
                        ))}
                        {teacher.subjectsTaught && teacher.subjectsTaught.length > 3 && <Badge variant="outline" className="text-xs">+{teacher.subjectsTaught.length - 3} more</Badge>}
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
                              This will permanently delete the HR profile from the 'teachers' collection and the user record (role, assignments) from the 'users' collection for <strong>{teacher.name}</strong> (Auth ID: {teacher.authUid}).
                              <br/><strong className="text-destructive mt-2 block">The Firebase Authentication account (login credentials) must be deleted manually from the Firebase Console.</strong>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTeacher(teacher.authUid, teacher.name)}>
                              Yes, delete Firestore records
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      {isLoading ? 'Loading teachers...' : 'No teachers found matching your criteria or no teachers in Firestore.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredTeachers.length > 0 && (
            <div className="mt-4 text-right text-sm text-muted-foreground">
              Showing {filteredTeachers.length} of {teachersWithAssignments.length} total teacher profiles from Firestore.
            </div>
          )}
        </CardContent>
      </Card>

      <TeacherProfileFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onTeacherSaved={handleTeacherSaved}
        teacherToEdit={teacherToEdit} // Pass Teacher; dialog fetches assignments
      />
    </>
  );
}
