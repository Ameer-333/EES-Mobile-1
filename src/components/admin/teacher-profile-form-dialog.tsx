
'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Teacher, TeacherFormData, SubjectName, TeacherAssignment, TeacherAssignmentType, ManagedUser, NIOSSubjectName, NCLPSubjectName } from '@/types';
import { allSubjectNamesArray, standardSubjectNamesArray, niosSubjectNamesArray, nclpSubjectNamesArray, assignmentTypeLabels, motherTeacherCoreSubjects, nclpAllSubjects, nclpGroupBSubjectsNoHindi } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, PlusCircle, Trash2, Info, Briefcase, GraduationCap, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firestore, auth as firebaseAuth } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader as UICardHeader, CardContent as UICardContent, CardTitle as UICardTitle, CardDescription as UICardDescription } from '@/components/ui/card';
import { getUsersCollectionPath, getTeacherDocPath } from '@/lib/firestore-paths';
import { v4 as uuidv4 } from 'uuid';

// Top-level helper function
function getSubjectOptions(assignmentType?: TeacherAssignmentType): SubjectName[] {
  if (assignmentType === 'nios_teacher') return niosSubjectNamesArray as SubjectName[];
  if (assignmentType === 'nclp_teacher') return nclpSubjectNamesArray as SubjectName[];
  return standardSubjectNamesArray as SubjectName[];
}

const teacherAssignmentItemSchema = z.object({
  id: z.string().default(() => uuidv4()),
  type: z.custom<TeacherAssignmentType>(val => Object.keys(assignmentTypeLabels).includes(val as TeacherAssignmentType), 'Assignment type is required.'),
  classId: z.string().min(1, 'Class ID or Program ID is required (e.g., LKG, 9, NIOS_A, NCLP_B).'),
  className: z.string().optional().or(z.literal('')),
  sectionId: z.string().optional().or(z.literal('')),
  subjectId: z.custom<SubjectName>(val => allSubjectNamesArray.includes(val as SubjectName)).optional(),
  groupId: z.string().optional().or(z.literal('')),
}).refine(data => {
  if (data.type === 'subject_teacher' && !data.subjectId) {
    return false;
  }
  return true;
}, {
  message: "Subject is required for 'Subject Teacher' assignment type.",
  path: ["subjectId"],
});

const teacherProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid contact email address." }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }).max(15, "Phone number too long."),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  yearOfJoining: z.coerce.number().min(1980, "Year too early.").max(new Date().getFullYear(), `Year cannot be in the future.`),
  subjectsTaught: z.array(z.custom<SubjectName>((val) => allSubjectNamesArray.includes(val as SubjectName)))
    .min(1, { message: "At least one general subject qualification must be selected." }),
  profilePictureUrl: z.string().url({ message: "Invalid URL format for profile picture." }).optional().or(z.literal('')),
  assignments: z.array(teacherAssignmentItemSchema).optional().default([]),
});

type TeacherProfileFormValues = z.infer<typeof teacherProfileSchema>;

interface TeacherProfileFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTeacherSaved: (teacherData: Teacher, isEditing: boolean) => void;
  teacherToEdit?: Teacher | null;
}

export function TeacherProfileFormDialog({
  isOpen,
  onOpenChange,
  onTeacherSaved,
  teacherToEdit,
}: TeacherProfileFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{email: string, password: string} | null>(null);
  const { toast } = useToast();
  const isEditing = !!teacherToEdit;
  const currentYear = new Date().getFullYear();

  const form = useForm<TeacherProfileFormValues>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      name: '', email: '', phoneNumber: '', address: '',
      yearOfJoining: currentYear, subjectsTaught: [], profilePictureUrl: '', assignments: [],
    },
  });

  const { fields: assignmentFields, append: appendAssignment, remove: removeAssignment, update: updateAssignment } = useFieldArray({
    control: form.control,
    name: "assignments",
  });

  const watchedAssignments = form.watch('assignments');

  useEffect(() => {
    const loadTeacherData = async () => {
      if (teacherToEdit && isOpen) {
        setIsLoadingAssignments(true);
        const userDocRef = doc(firestore, getUsersCollectionPath(), teacherToEdit.authUid);
        const userDocSnap = await getDoc(userDocRef);
        const existingAssignments = userDocSnap.exists() ? (userDocSnap.data() as ManagedUser).assignments || [] : [];

        form.reset({
          name: teacherToEdit.name,
          email: teacherToEdit.email,
          phoneNumber: teacherToEdit.phoneNumber,
          address: teacherToEdit.address,
          yearOfJoining: teacherToEdit.yearOfJoining,
          subjectsTaught: teacherToEdit.subjectsTaught || [],
          profilePictureUrl: teacherToEdit.profilePictureUrl || '',
          assignments: existingAssignments.map(a => ({...a, id: a.id || uuidv4()})),
        });
        setIsLoadingAssignments(false);
      } else if (!isEditing && isOpen) {
        form.reset({
          name: '', email: '', phoneNumber: '', address: '',
          yearOfJoining: currentYear, subjectsTaught: [], profilePictureUrl: '', assignments: [],
        });
        setGeneratedCredentials(null);
      }
    };
    loadTeacherData();
  }, [teacherToEdit, isOpen, form, isEditing, currentYear]);

  const onSubmit = async (values: TeacherProfileFormValues) => {
    setIsSubmitting(true);
    setGeneratedCredentials(null);
    const totalYearsWorked = currentYear - values.yearOfJoining;

    try {
      let authUid = teacherToEdit?.authUid;
      let finalAuthEmail = values.email;

      if (!isEditing) {
        const defaultPassword = `${values.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/gi, '')}@EES${new Date().getFullYear().toString().slice(-2)}`;
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, finalAuthEmail, defaultPassword);
            authUid = userCredential.user.uid;
            setGeneratedCredentials({ email: finalAuthEmail, password: defaultPassword });
        } catch (authError: any) {
            const description = authError.code === 'auth/email-already-in-use'
                ? `The email ${finalAuthEmail} is already in use. Please use a different email for login or contact.`
                : authError.message;
            toast({ title: "Authentication Error", description, variant: "destructive", duration: 7000 });
            setIsSubmitting(false);
            return;
        }
      }

      if (!authUid) {
        toast({title: "Error", description: "Teacher Auth ID missing. Cannot save.", variant: "destructive"});
        setIsSubmitting(false);
        return;
      }

      const userProfileData: Partial<ManagedUser> = {
        name: values.name,
        email: finalAuthEmail,
        role: "Teacher",
        status: "Active",
        assignments: values.assignments.map(a => ({...a, subjectId: a.subjectId || undefined})) || [],
      };
      await setDoc(doc(firestore, getUsersCollectionPath(), authUid), userProfileData, { merge: true });

      const teacherHRData: Omit<Teacher, 'id'> = {
        authUid: authUid,
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        yearOfJoining: values.yearOfJoining,
        totalYearsWorked: totalYearsWorked >= 0 ? totalYearsWorked : 0,
        subjectsTaught: values.subjectsTaught,
        profilePictureUrl: values.profilePictureUrl || null,
        salaryHistory: teacherToEdit?.salaryHistory || [],
      };
      await setDoc(doc(firestore, getTeacherDocPath(authUid)), teacherHRData, { merge: true });

      onTeacherSaved({ ...teacherHRData, id: authUid! }, isEditing);

      if (!isEditing) {
        // Toast with credentials handled by generatedCredentials state effect
      } else {
        toast({ title: "Teacher Updated", description: `${values.name}'s profile and assignments have been updated.` });
        onOpenChange(false);
      }

    } catch (error) {
      console.error("Error saving teacher:", error);
      toast({ title: "Save Failed", description: "Could not save teacher profile.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset();
        setGeneratedCredentials(null);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Teacher Profile & Assignments" : "Add New Teacher & Assign Roles"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify details and assignments." : "Enter details, assign roles/classes. Login credentials will use the contact email."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2 pb-4 pr-1">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="profile"><Users className="mr-2"/>Profile Details</TabsTrigger>
                <TabsTrigger value="assignments"><Briefcase className="mr-2"/>Teaching Assignments</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g. Priya Sharma" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Contact Email (used for login if new)</FormLabel><FormControl><Input type="email" placeholder="e.g. priya.sharma@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="e.g. 9876543210" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Full address" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="yearOfJoining" render={({ field }) => (
                  <FormItem><FormLabel>Year of Joining</FormLabel><FormControl><Input type="number" placeholder={currentYear.toString()} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="profilePictureUrl" render={({ field }) => (
                  <FormItem><FormLabel>Profile Picture URL (Optional)</FormLabel><FormControl><Input placeholder="https://placehold.co/100x100.png" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="subjectsTaught" render={() => (
                    <FormItem><FormLabel>General Subject Qualifications (Tick all applicable)</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-md max-h-48 overflow-y-auto bg-muted/30">
                        {allSubjectNamesArray.map((subject) => (
                        <FormField key={subject} control={form.control} name="subjectsTaught" render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl><Checkbox checked={field.value?.includes(subject)}
                                onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), subject]) : field.onChange((field.value || []).filter(v => v !== subject))}
                            /></FormControl>
                            <FormLabel className="font-normal text-sm">{subject}</FormLabel></FormItem>
                        )}/> ))}
                    </div><FormMessage />
                    </FormItem>
                )}/>
              </TabsContent>

              <TabsContent value="assignments" className="space-y-4">
                <UICard className="bg-accent/30 border-primary/20">
                  <UICardHeader className="pb-3 pt-4 px-4">
                     <UICardTitle className="text-lg text-primary flex items-center"><GraduationCap className="mr-2"/>Current Assignments</UICardTitle>
                     <UICardDescription className="text-xs">Define specific classes, sections, subjects, or programs the teacher is assigned to.</UICardDescription>
                  </UICardHeader>
                  <UICardContent className="px-4 pb-4 space-y-3 max-h-[50vh] overflow-y-auto">
                    {isLoadingAssignments && <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin" /> Loading assignments...</div>}
                    {!isLoadingAssignments && assignmentFields.map((item, index) => {
                      const currentAssignmentType = watchedAssignments?.[index]?.type;
                      const showSubjectField = currentAssignmentType === 'subject_teacher' || ((currentAssignmentType === 'nios_teacher' || currentAssignmentType === 'nclp_teacher') && getSubjectOptions(currentAssignmentType).length > 0) ;
                      return (
                      <Card key={item.id} className="p-3.5 border-dashed bg-card shadow-sm">
                        <div className="flex justify-between items-center mb-2.5">
                          <FormLabel className="text-sm font-medium text-foreground">Assignment {index + 1}</FormLabel>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeAssignment(index)} className="text-destructive hover:text-destructive/80 h-7 px-2">
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <FormField control={form.control} name={`assignments.${index}.type`} render={({ field }) => (
                            <FormItem><FormLabel>Assignment Type</FormLabel><Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    const newType = value as TeacherAssignmentType;
                                    const oldValues = form.getValues(`assignments.${index}`);
                                    updateAssignment(index, {
                                      ...oldValues,
                                      type: newType,
                                      subjectId: (newType !== 'subject_teacher' && newType !== 'nios_teacher' && newType !== 'nclp_teacher') ? undefined : oldValues.subjectId
                                    });
                                }}
                                defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select assignment type" /></SelectTrigger></FormControl>
                                <SelectContent>{Object.entries(assignmentTypeLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                            </Select><FormMessage /></FormItem> )}/>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField control={form.control} name={`assignments.${index}.classId`} render={({ field }) => (
                                <FormItem><FormLabel>Class/Program ID</FormLabel><FormControl><Input placeholder="e.g., LKG, 9, NIOS_A" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name={`assignments.${index}.className`} render={({ field }) => (
                                <FormItem><FormLabel>Display Name (Opt.)</FormLabel><FormControl><Input placeholder="e.g., LKG Sunshine, Class 9B" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             <FormField control={form.control} name={`assignments.${index}.sectionId`} render={({ field }) => (
                                <FormItem><FormLabel>Section ID (Opt.)</FormLabel><FormControl><Input placeholder="e.g., A, B" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                              <FormField control={form.control} name={`assignments.${index}.groupId`} render={({ field }) => (
                                <FormItem><FormLabel>Group ID (Opt. for NIOS/NCLP)</FormLabel><FormControl><Input placeholder="e.g., Alpha, Painting_Batch1" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                          </div>
                          {showSubjectField && (
                            <Controller
                                control={form.control}
                                name={`assignments.${index}.subjectId`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Subject (if applicable)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl>
                                        <SelectContent>{getSubjectOptions(currentAssignmentType).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                    {form.formState.errors.assignments?.[index]?.subjectId && <FormMessage />}
                                    </FormItem>
                                )}
                             />
                           )}
                        </div>
                      </Card>
                    )}})}
                    <Button type="button" variant="outline" onClick={() => appendAssignment({ id: uuidv4(), type: 'class_teacher', classId: '', sectionId: '', subjectId: undefined, groupId: '' })} className="mt-3 w-full border-dashed hover:border-primary">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add New Teaching Assignment
                    </Button>
                  </UICardContent>
                </UICard>
              </TabsContent>
            </Tabs>

            {generatedCredentials && (
              <Card className="mt-4 p-4 border-green-500 bg-green-50/80 rounded-md text-sm shadow-md">
                <UICardHeader className='p-0 pb-2'>
                  <UICardTitle className="text-md font-semibold text-green-700 flex items-center"><Info className="h-5 w-5 mr-2"/>Credentials Generated</UICardTitle>
                </UICardHeader>
                <UICardContent className='p-0'>
                  <p><span className="font-medium">Login Email:</span> {generatedCredentials.email}</p>
                  <p><span className="font-medium">Default Password:</span> {generatedCredentials.password}</p>
                  <p className="text-xs mt-1 text-destructive">Note: Advise teacher to change password on first login.</p>
                </UICardContent>
              </Card>
            )}

            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => {
                form.reset();
                setGeneratedCredentials(null);
                onOpenChange(false);
              }}>
                {generatedCredentials ? "Close" : "Cancel"}
              </Button>
              {!generatedCredentials && (
                <Button type="submit" disabled={isSubmitting || isLoadingAssignments}>
                  {isSubmitting || isLoadingAssignments ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSubmitting ? "Saving..." : isLoadingAssignments ? "Loading..." : (isEditing ? "Save Changes" : "Add Teacher & Create Account")}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
