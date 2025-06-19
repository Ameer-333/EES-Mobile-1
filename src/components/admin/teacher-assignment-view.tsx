
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Teacher, ManagedUser, TeacherAssignment, TeacherAssignmentType, SubjectName, NIOSSubjectName, NCLPSubjectName } from '@/types';
import { allSubjectNamesArray, standardSubjectNamesArray, niosSubjectNamesArray, nclpSubjectNamesArray, assignmentTypeLabels, motherTeacherCoreSubjects, nclpAllSubjects, nclpGroupBSubjectsNoHindi, niosSubjectsForAssignment } from '@/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle, Edit, Trash2, ClipboardList, Users, UserCog, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { firestore } from '@/lib/firebase';
import { collection, doc, getDocs, onSnapshot, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { getTeachersCollectionPath, getUserDocPath } from '@/lib/firestore-paths';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function at the top-level (similar to teacher-profile-form-dialog)
function getSubjectOptionsForAssignmentType(assignmentType?: TeacherAssignmentType): SubjectName[] {
  if (assignmentType === 'nios_teacher') return niosSubjectsForAssignment;
  if (assignmentType === 'nclp_teacher') return nclpAllSubjects; // Or a more filtered NCLP list if needed
  if (assignmentType === 'subject_teacher') return standardSubjectNamesArray; // Default to standard for general subject teacher
  if (assignmentType === 'class_teacher' || assignmentType === 'mother_teacher') return []; // No specific subject for these types at assignment level
  return []; // Default empty for other/unspecified types
}


const assignmentSchema = z.object({
  id: z.string().default(() => `as_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`),
  type: z.custom<TeacherAssignmentType>(val => Object.keys(assignmentTypeLabels).includes(val as TeacherAssignmentType), 'Assignment type is required.'),
  classId: z.string().min(1, 'Class ID/Program ID is required (e.g., LKG, 9, NIOS_A, NCLP_B).'),
  className: z.string().optional().or(z.literal('')),
  sectionId: z.string().optional().or(z.literal('')),
  subjectId: z.custom<SubjectName>().optional(),
  groupId: z.string().optional().or(z.literal('')),
}).refine(data => {
  const needsSubject = data.type === 'subject_teacher' || data.type === 'nios_teacher' || data.type === 'nclp_teacher';
  const hasSubjectOptions = getSubjectOptionsForAssignmentType(data.type).length > 0;
  if (needsSubject && hasSubjectOptions && !data.subjectId) {
    return false; // Invalid if subject is needed and options exist, but no subject is selected.
  }
  return true;
}, {
  message: "Subject is required for this assignment type if subjects are applicable.",
  path: ["subjectId"],
});


type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export function TeacherAssignmentView() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [managedUsers, setManagedUsers] = useState<Record<string, ManagedUser>>({});
  const [selectedTeacherAuthUid, setSelectedTeacherAuthUid] = useState<string | null>(null);
  const [currentAssignments, setCurrentAssignments] = useState<TeacherAssignment[]>([]);
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TeacherAssignment | null>(null);
  
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { toast } = useToast();

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
  });
  const watchedAssignmentType = form.watch("type");
  const subjectOptionsForForm = useMemo(() => getSubjectOptionsForAssignmentType(watchedAssignmentType), [watchedAssignmentType]);


  // Fetch all teachers (HR profiles for selection)
  useEffect(() => {
    setIsLoadingTeachers(true);
    const teachersPath = getTeachersCollectionPath();
    const q = query(collection(firestore, teachersPath), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTeachers = snapshot.docs.map(doc => ({ id: doc.id, authUid: doc.id, ...doc.data() } as Teacher));
      setTeachers(fetchedTeachers);
      setIsLoadingTeachers(false);
    }, (error) => {
      console.error("Error fetching teachers:", error);
      toast({ title: "Error", description: "Could not load teachers list.", variant: "destructive" });
      setIsLoadingTeachers(false);
    });
    return () => unsubscribe();
  }, [toast]);

  // Fetch assignments for the selected teacher
  useEffect(() => {
    if (!selectedTeacherAuthUid) {
      setCurrentAssignments([]);
      return;
    }
    setIsLoadingAssignments(true);
    const userDocPath = getUserDocPath(selectedTeacherAuthUid);
    const unsubscribe = onSnapshot(doc(firestore, userDocPath), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data() as ManagedUser;
        setManagedUsers(prev => ({ ...prev, [selectedTeacherAuthUid]: userData }));
        setCurrentAssignments(userData.assignments || []);
      } else {
        setCurrentAssignments([]);
        toast({ title: "Info", description: "Selected teacher has no user record for assignments or record not found.", variant: "default", duration: 5000 });
      }
      setIsLoadingAssignments(false);
    }, (error) => {
      console.error("Error fetching teacher assignments:", error);
      toast({ title: "Error", description: "Could not load assignments for selected teacher.", variant: "destructive" });
      setIsLoadingAssignments(false);
    });
    return () => unsubscribe();
  }, [selectedTeacherAuthUid, toast]);

  const handleOpenFormDialog = (assignment?: TeacherAssignment) => {
    setEditingAssignment(assignment || null);
    form.reset(assignment || { type: undefined, classId: '', subjectId: undefined, id: `as_${Date.now()}_${Math.random().toString(36).substring(2,9)}` });
    setIsFormDialogOpen(true);
  };

  const handleSaveAssignment = async (values: AssignmentFormValues) => {
    if (!selectedTeacherAuthUid) {
      toast({ title: "Error", description: "No teacher selected.", variant: "destructive" });
      return;
    }
    setIsSubmittingForm(true);
    const userDocPath = getUserDocPath(selectedTeacherAuthUid);
    const teacherUserRecord = managedUsers[selectedTeacherAuthUid];
    
    let updatedAssignments: TeacherAssignment[];
    if (editingAssignment) {
      updatedAssignments = currentAssignments.map(assign => assign.id === editingAssignment.id ? { ...assign, ...values } : assign);
    } else {
      updatedAssignments = [...currentAssignments, values];
    }

    try {
      await updateDoc(doc(firestore, userDocPath), { assignments: updatedAssignments });
      toast({ title: "Success", description: `Assignment ${editingAssignment ? 'updated' : 'added'} successfully for selected teacher.` });
      setIsFormDialogOpen(false);
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast({ title: "Error", description: "Could not save assignment.", variant: "destructive" });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!selectedTeacherAuthUid) return;
    const userDocPath = getUserDocPath(selectedTeacherAuthUid);
    const updatedAssignments = currentAssignments.filter(assign => assign.id !== assignmentId);
    try {
      await updateDoc(doc(firestore, userDocPath), { assignments: updatedAssignments });
      toast({ title: "Success", description: "Assignment deleted successfully." });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({ title: "Error", description: "Could not delete assignment.", variant: "destructive" });
    }
  };

  const selectedTeacherDetails = teachers.find(t => t.authUid === selectedTeacherAuthUid);


  if (isLoadingTeachers) {
     return (
        <Card className="w-full shadow-lg rounded-lg border-primary/10">
            <CardHeader>
                <Skeleton className="h-8 w-3/5 mb-2"/>
                <Skeleton className="h-4 w-4/5"/>
            </CardHeader>
            <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 <p className="mt-3 text-muted-foreground">Loading teachers list...</p>
            </CardContent>
        </Card>
     );
  }


  return (
    <>
      <Card className="w-full shadow-lg rounded-lg border-primary/10">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <ClipboardList className="h-7 w-7 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline text-primary">Teacher Assignment Management</CardTitle>
              <CardDescription>View, assign, and modify teacher responsibilities and teaching assignments from their user record.</CardDescription>
            </div>
          </div>
           <div className="mt-4 space-y-2">
            <FormLabel htmlFor="teacher-select">Select Teacher</FormLabel>
            <Select onValueChange={setSelectedTeacherAuthUid} value={selectedTeacherAuthUid || ""}>
              <SelectTrigger id="teacher-select" className="w-full md:w-1/2">
                <SelectValue placeholder="Choose a teacher to manage assignments..." />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(teacher => (
                  <SelectItem key={teacher.authUid} value={teacher.authUid}>
                    {teacher.name} ({teacher.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedTeacherAuthUid && teachers.length === 0 && (
                <p className="text-sm text-muted-foreground">No teachers found in the system.</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="mt-2">
          {selectedTeacherAuthUid ? (
            isLoadingAssignments ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading assignments for {selectedTeacherDetails?.name}...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-foreground">
                        Assignments for: <span className="text-primary font-semibold">{selectedTeacherDetails?.name || 'Selected Teacher'}</span>
                    </h3>
                    <Button onClick={() => handleOpenFormDialog()} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Assignment
                    </Button>
                </div>
                {currentAssignments.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                     <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-3"/>
                     <p className="text-muted-foreground">No assignments found for this teacher.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Class/Program ID</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Group ID</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {currentAssignments.map(assign => (
                          <TableRow key={assign.id}>
                            <TableCell>{assignmentTypeLabels[assign.type] || assign.type}</TableCell>
                            <TableCell>{assign.classId}</TableCell>
                            <TableCell>{assign.className || '-'}</TableCell>
                            <TableCell>{assign.sectionId || '-'}</TableCell>
                            <TableCell>{assign.subjectId || '-'}</TableCell>
                            <TableCell>{assign.groupId || '-'}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleOpenFormDialog(assign)}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteAssignment(assign.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="text-center py-10 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-400"/>
                Please select a teacher to view and manage their assignments.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setEditingAssignment(null); setIsFormDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}</DialogTitle>
            <DialogDescription>
              {editingAssignment ? `Modifying assignment for ${selectedTeacherDetails?.name || 'the teacher'}.` : `Adding a new assignment for ${selectedTeacherDetails?.name || 'the teacher'}. Ensure IDs match system records.`}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveAssignment)} className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
              <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Assignment Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmittingForm}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>{Object.entries(assignmentTypeLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="classId" render={({ field }) => (
                  <FormItem><FormLabel>Class/Program ID (System ID)</FormLabel><FormControl><Input placeholder="e.g., LKG, 10, NIOS_PROGRAM, NCLP_PROJECT" {...field} disabled={isSubmittingForm}/></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="className" render={({ field }) => (
                  <FormItem><FormLabel>Class/Program Display Name (Optional)</FormLabel><FormControl><Input placeholder="e.g., LKG Sunshine, Class 10 Bravo" {...field} disabled={isSubmittingForm}/></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="sectionId" render={({ field }) => (
                  <FormItem><FormLabel>Section ID (Optional)</FormLabel><FormControl><Input placeholder="e.g., A, B, Morning_Batch" {...field} disabled={isSubmittingForm}/></FormControl><FormMessage /></FormItem> )}/>
             
              { (watchedAssignmentType === 'subject_teacher' || watchedAssignmentType === 'nios_teacher' || watchedAssignmentType === 'nclp_teacher') && subjectOptionsForForm.length > 0 && (
                <FormField control={form.control} name="subjectId" render={({ field }) => (
                  <FormItem><FormLabel>Subject</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={isSubmittingForm}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl>
                      <SelectContent>{subjectOptionsForForm.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem> )}/>
              )}
               { (watchedAssignmentType === 'subject_teacher' || watchedAssignmentType === 'nios_teacher' || watchedAssignmentType === 'nclp_teacher') && subjectOptionsForForm.length === 0 && (
                 <div className="p-2 text-xs text-muted-foreground border rounded-md bg-muted/50 flex items-center">
                   <AlertTriangle size={14} className="mr-1.5 text-amber-600"/>
                   No specific subjects are predefined for direct assignment under '{assignmentTypeLabels[watchedAssignmentType] || watchedAssignmentType}'. General subject qualifications apply, or define groups.
                 </div>
               )}

              <FormField control={form.control} name="groupId" render={({ field }) => (
                  <FormItem><FormLabel>Group ID (Optional, for NIOS/NCLP sub-groups)</FormLabel><FormControl><Input placeholder="e.g., Group_A_Painting, NCLP_B_Science_Focus" {...field} disabled={isSubmittingForm}/></FormControl><FormMessage /></FormItem> )}/>
              
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmittingForm}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmittingForm}> {isSubmittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingAssignment ? 'Save Changes' : 'Add Assignment')} </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}


