
'use client';

import type { Teacher, ManagedUser, TeacherAssignment } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Search, UserPlus, Trash2, Loader2, Briefcase, Info } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Added Tooltip
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, QuerySnapshot, DocumentData, getDoc } from 'firebase/firestore';
import { getTeachersCollectionPath, getUserDocPath, getTeacherDocPath } from '@/lib/firestore-paths';
import { useAppContext } from '@/app/(protected)/layout';

interface TeacherWithAssignments extends Teacher {
    assignments?: TeacherAssignment[];
}


export function ManageTeacherProfiles() {
  const { userProfile } = useAppContext();
  const [teachersWithAssignments, setTeachersWithAssignments] = useState<TeacherWithAssignments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const canAddTeachers = userProfile?.role === 'Admin';
  const canDeleteTeachers = userProfile?.role === 'Admin';
  const canEditTeachers = userProfile?.role === 'Admin' || userProfile?.role === 'Coordinator';

  useEffect(() => {
    setIsLoading(true);
    const teachersCollectionPath = getTeachersCollectionPath();
    const teachersCollectionRef = collection(firestore, teachersCollectionPath);

    const unsubscribe = onSnapshot(teachersCollectionRef, async (teachersSnapshot: QuerySnapshot<DocumentData>) => {
      const fetchedTeachersPromises = teachersSnapshot.docs.map(async (teacherDoc) => {
        const docId = teacherDoc.id;
        const data = teacherDoc.data();

        if (!docId) {
          console.warn("Teacher document found with an invalid ID in 'teachers' collection. Skipping.");
          return null;
        }

        const teacherData: Teacher = {
          ...data,
          id: docId,
          authUid: docId, 
        } as Teacher;

        let assignments: TeacherAssignment[] = [];
        if (teacherData.authUid) {
            try {
                const userDocRef = doc(firestore, getUserDocPath(teacherData.authUid));
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const managedUserData = userDocSnap.data() as ManagedUser;
                    if (managedUserData.role === 'Teacher') { // Ensure it's actually a teacher's user record
                         assignments = managedUserData.assignments || [];
                    } else {
                        console.warn(`User record for Auth ID ${teacherData.authUid} is not a Teacher. Skipping assignments.`);
                    }
                } else {
                     console.warn(`User record not found for teacher Auth ID ${teacherData.authUid}. Assignments will be empty.`);
                }
            } catch (error) {
                console.warn(`Could not fetch assignments for teacher ${teacherData.authUid}:`, error)
            }
        }
        
        return { ...teacherData, assignments };
      });
      
      const resolvedTeachersWithNulls = await Promise.all(fetchedTeachersPromises);
      const resolvedTeachers = resolvedTeachersWithNulls.filter(Boolean) as TeacherWithAssignments[];
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
    if (!canAddTeachers) {
        toast({ title: "Permission Denied", description: "Only Admins can add new teachers.", variant: "destructive" });
        return;
    }
    setTeacherToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
     if (!canEditTeachers) {
        toast({ title: "Permission Denied", description: "You do not have permission to edit teacher profiles.", variant: "destructive" });
        return;
    }
    setTeacherToEdit(teacher);
    setIsFormOpen(true);
  };

  const handleDeleteTeacher = async (teacherAuthUid: string, teacherName: string) => {
    if (!canDeleteTeachers) {
        toast({ title: "Permission Denied", description: "Only Admins can delete teacher records.", variant: "destructive" });
        return;
    }
    if (!teacherAuthUid) {
        toast({ title: "Error", description: "Teacher Auth ID is missing, cannot delete.", variant: "destructive" });
        return;
    }
    try {
      const teacherHRDocPath = getTeacherDocPath(teacherAuthUid);
      await deleteDoc(doc(firestore, teacherHRDocPath));

      const userDocPath = getUserDocPath(teacherAuthUid);
      await deleteDoc(doc(firestore, userDocPath));

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
    setIsFormOpen(false);
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
            {canAddTeachers && <Skeleton className="h-10 w-36" />}
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
    <TooltipProvider>
      <Card className="w-full shadow-lg rounded-lg border-accent/50 mt-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-headline text-primary">Teacher HR Profiles & Assignments</CardTitle>
              <CardDescription>Manage teacher HR info, contact details, and teaching assignments. Auth accounts are created/managed via this interface.</CardDescription>
            </div>
            {canAddTeachers && (
                <Button onClick={handleAddTeacher} className="bg-primary hover:bg-primary/90">
                    <UserPlus className="mr-2 h-4 w-4" /> Add New Teacher
                </Button>
            )}
             {!canAddTeachers && userProfile?.role === 'Coordinator' && (
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={0}>
                            <Button disabled className="cursor-not-allowed">
                                <UserPlus className="mr-2 h-4 w-4" /> Add New Teacher
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent><p>Coordinators cannot add new teachers. Admin only.</p></TooltipContent>
                </Tooltip>
            )}
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
                        src={teacher.profilePictureUrl || `https://placehold.co/40x40.png`}
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
                        {teacher.subjectsTaught && teacher.subjectsTaught.slice(0,3).map(subject => (
                          <Badge key={subject} variant="secondary" className="text-xs">{subject}</Badge>
                        ))}
                        {teacher.subjectsTaught && teacher.subjectsTaught.length > 3 && <Badge variant="outline" className="text-xs">+{teacher.subjectsTaught.length - 3} more</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {canEditTeachers && (
                        <Button variant="outline" size="sm" onClick={() => handleEditTeacher(teacher)}>
                            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                      )}
                      {canDeleteTeachers && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={!teacher.authUid}>
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This will permanently delete the HR profile from the 'teachers' collection and the user record (role, assignments) from the 'users' collection for <strong>{teacher.name}</strong> (Auth ID: {teacher.authUid}).
                                <br/><strong className="text-destructive mt-2 block">The Firebase Authentication account for this teacher needs to be deleted manually from the Firebase Console.</strong>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTeacher(teacher.authUid, teacher.name)} disabled={!teacher.authUid}>
                                Yes, delete Firestore records
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      )}
                       {!canEditTeachers && !canDeleteTeachers && ( 
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span tabIndex={0}> 
                                        <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                                            <Info className="h-3.5 w-3.5 mr-1" /> View Only
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>You have read-only access to teacher profiles.</p>
                                </TooltipContent>
                            </Tooltip>
                       )}
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
        teacherToEdit={teacherToEdit}
      />
    </TooltipProvider>
  );
}
    
