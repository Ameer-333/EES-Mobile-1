
'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Teacher, TeacherFormData, SubjectName, TeacherAssignment, TeacherAssignmentType, ManagedUser } from '@/types';
import { subjectNamesArray } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
import { Loader2, Save, PlusCircle, Trash2, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firestore, auth as firebaseAuth } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader as UICardHeader, CardContent as UICardContent, CardTitle as UICardTitle } from '@/components/ui/card';


const TEACHERS_COLLECTION = 'teachers'; // For HR specific data
const USERS_COLLECTION = 'users'; // For auth supplemental data, roles, assignments
const currentYear = new Date().getFullYear();

const teacherAssignmentItemSchema = z.object({
  type: z.custom<TeacherAssignmentType>(val => ['mother_teacher', 'class_teacher', 'subject_teacher', 'nios_teacher', 'nclp_teacher'].includes(val as TeacherAssignmentType), 'Assignment type is required.'),
  classId: z.string().min(1, 'Class ID is required (e.g., LKG, 5, NIOS).'),
  sectionId: z.string().optional().or(z.literal('')),
  subjectId: z.custom<SubjectName>(val => subjectNamesArray.includes(val as SubjectName)).optional(),
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
  email: z.string().email({ message: "Invalid contact email address." }), // This is for contact, auth email will be derived or same
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }).max(15, "Phone number too long."),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  yearOfJoining: z.coerce.number().min(1980, "Year too early.").max(currentYear, `Year cannot be in the future.`),
  subjectsTaught: z.array(z.custom<SubjectName>((val) => subjectNamesArray.includes(val as SubjectName)))
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

  const form = useForm<TeacherProfileFormValues>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      yearOfJoining: currentYear,
      subjectsTaught: [],
      profilePictureUrl: '',
      assignments: [],
    },
  });

  const { fields: assignmentFields, append: appendAssignment, remove: removeAssignment } = useFieldArray({
    control: form.control,
    name: "assignments",
  });

  useEffect(() => {
    const loadTeacherData = async () => {
      if (teacherToEdit && isOpen) {
        setIsLoadingAssignments(true);
        form.reset({
          name: teacherToEdit.name,
          email: teacherToEdit.email, // Contact email
          phoneNumber: teacherToEdit.phoneNumber,
          address: teacherToEdit.address,
          yearOfJoining: teacherToEdit.yearOfJoining,
          subjectsTaught: teacherToEdit.subjectsTaught || [],
          profilePictureUrl: teacherToEdit.profilePictureUrl || '',
          assignments: [], // Default to empty, will be fetched
        });

        // Fetch assignments from 'users' collection
        // teacherToEdit.id is the authUid if teachers collection is keyed by authUid
        const authUidToFetch = teacherToEdit.authUid || teacherToEdit.id;
        if (authUidToFetch) {
          try {
            const userDocRef = doc(firestore, USERS_COLLECTION, authUidToFetch);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as ManagedUser; // Assuming ManagedUser has assignments
              form.setValue('assignments', userData.assignments || []);
            }
          } catch (e) {
            console.error("Error fetching teacher assignments for editing:", e);
            toast({ title: "Error", description: "Could not load teacher's assignments.", variant: "destructive"});
          }
        }
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
  }, [teacherToEdit, isOpen, form, isEditing, toast]);

  async function onSubmit(values: TeacherProfileFormValues) {
    setIsSubmitting(true);
    setGeneratedCredentials(null);
    const totalYearsWorked = currentYear - values.yearOfJoining;

    try {
      let authUid = teacherToEdit?.authUid || teacherToEdit?.id; // If id is authUid
      let finalAuthEmail = isEditing && authUid ? (await getDoc(doc(firestore, USERS_COLLECTION, authUid))).data()?.email : '';


      if (!isEditing) { // Adding new teacher
        // 1. Create Firebase Auth user
        finalAuthEmail = values.email; // Using contact email as auth email for new teachers for simplicity
        const defaultPassword = `${values.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/gi, '')}@EES${new Date().getFullYear().toString().slice(-2)}`;

        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, finalAuthEmail, defaultPassword);
            authUid = userCredential.user.uid;
            setGeneratedCredentials({ email: finalAuthEmail, password: defaultPassword });
        } catch (authError: any) {
            if (authError.code === 'auth/email-already-in-use') {
                toast({ title: "Authentication Error", description: `The email ${finalAuthEmail} is already in use for authentication. Please use a different contact email or ensure uniqueness.`, variant: "destructive", duration: 7000 });
            } else {
                toast({ title: "Authentication Error", description: authError.message, variant: "destructive" });
            }
            setIsSubmitting(false);
            return;
        }

        // 2. Create 'users' collection document
        const userProfileData: Omit<ManagedUser, 'id' | 'lastLogin' | 'studentProfileId'> = {
          name: values.name,
          email: finalAuthEmail, // Auth email
          role: "Teacher",
          status: "Active",
          assignments: values.assignments || [],
        };
        await setDoc(doc(firestore, USERS_COLLECTION, authUid!), userProfileData);

        // 3. Create 'teachers' collection document (HR details)
        // Document ID is authUid for consistency
        const teacherHRData: Omit<Teacher, 'id'> = {
          authUid: authUid, // Store authUid here as well
          name: values.name,
          email: values.email, // Contact email from form
          phoneNumber: values.phoneNumber,
          address: values.address,
          yearOfJoining: values.yearOfJoining,
          totalYearsWorked: totalYearsWorked >= 0 ? totalYearsWorked : 0,
          subjectsTaught: values.subjectsTaught,
          profilePictureUrl: values.profilePictureUrl || null,
          salaryHistory: [], // Initialize
        };
        await setDoc(doc(firestore, TEACHERS_COLLECTION, authUid!), teacherHRData);

        onTeacherSaved({ ...teacherHRData, id: authUid! }, false);
        // Toast for success is handled by the appearance of the generatedCredentials block
        // This is preferred so Admin can copy credentials before closing.

      } else { // Editing existing teacher
        if (!authUid) {
            toast({title: "Error", description: "Teacher Auth ID missing. Cannot update.", variant: "destructive"});
            setIsSubmitting(false);
            return;
        }
        // 1. Update 'teachers' collection (HR details)
        const teacherHRDataToUpdate: Partial<Teacher> = {
          name: values.name,
          email: values.email, // Contact email
          phoneNumber: values.phoneNumber,
          address: values.address,
          yearOfJoining: values.yearOfJoining,
          totalYearsWorked: totalYearsWorked >= 0 ? totalYearsWorked : 0,
          subjectsTaught: values.subjectsTaught,
          profilePictureUrl: values.profilePictureUrl || null,
          // authUid field in 'teachers' collection should already exist and not be changed.
        };
        await setDoc(doc(firestore, TEACHERS_COLLECTION, authUid), teacherHRDataToUpdate, { merge: true });

        // 2. Update 'users' collection (assignments, name if changed)
        const userProfileUpdates: Partial<ManagedUser> = {
            name: values.name, // Keep name in sync if changed
            assignments: values.assignments || [],
            // email (auth email) and role typically don't change often via this form
        };
        await setDoc(doc(firestore, USERS_COLLECTION, authUid), userProfileUpdates, { merge: true });

        onTeacherSaved({ ...teacherToEdit!, ...teacherHRDataToUpdate, id: authUid }, true);
        toast({ title: "Teacher Updated", description: `${values.name}'s profile and assignments have been updated.` });
        onOpenChange(false); // Close dialog on successful edit
      }

    } catch (error) {
      console.error("Error saving teacher:", error);
      toast({ title: "Save Failed", description: "Could not save teacher profile.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const assignmentTypeOptions: { value: TeacherAssignmentType; label: string }[] = [
    { value: 'mother_teacher', label: 'Mother Teacher (LKG-4th)' },
    { value: 'class_teacher', label: 'Class Teacher (5th-10th)' },
    { value: 'subject_teacher', label: 'Subject Teacher (5th-10th)' },
    { value: 'nios_teacher', label: 'NIOS Teacher' },
    { value: 'nclp_teacher', label: 'NCLP Teacher' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) { // When dialog is about to close
        form.reset(); // Reset form state
        setGeneratedCredentials(null); // Clear any displayed credentials
      }
      onOpenChange(open); // Propagate open state change
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Teacher Profile & Assignments" : "Add New Teacher & Assign Roles"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify details and assignments." : "Enter details, assign roles/classes. Login credentials will be generated using contact email."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2 pb-4 pr-1">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
                <TabsTrigger value="assignments">Class/Subject Assignments</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g. Priya Sharma" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Contact Email (used for login if new teacher)</FormLabel><FormControl><Input type="email" placeholder="e.g. priya.sharma@example.com" {...field} /></FormControl><FormMessage /></FormItem>
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
                    <FormItem><FormLabel>General Subject Qualifications</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                        {subjectNamesArray.map((subject) => (
                        <FormField key={subject} control={form.control} name="subjectsTaught" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
                {isLoadingAssignments && <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin" /> Loading assignments...</div>}
                {!isLoadingAssignments && assignmentFields.map((item, index) => (
                  <Card key={item.id} className="p-3 border-dashed">
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel className="text-sm font-medium">Assignment {index + 1}</FormLabel>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeAssignment(index)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField control={form.control} name={`assignments.${index}.type`} render={({ field }) => (
                        <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                            <SelectContent>{assignmentTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                        </Select><FormMessage /></FormItem> )}/>
                      <FormField control={form.control} name={`assignments.${index}.classId`} render={({ field }) => (
                        <FormItem><FormLabel>Class ID</FormLabel><FormControl><Input placeholder="e.g., 5, LKG, NIOS" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                      <FormField control={form.control} name={`assignments.${index}.sectionId`} render={({ field }) => (
                        <FormItem><FormLabel>Section ID (Opt.)</FormLabel><FormControl><Input placeholder="e.g., A, B" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                      <FormField control={form.control} name={`assignments.${index}.groupId`} render={({ field }) => (
                        <FormItem><FormLabel>Group ID (Opt.)</FormLabel><FormControl><Input placeholder="e.g., Alpha" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                       <Controller
                          control={form.control}
                          name={`assignments.${index}.subjectId`}
                          render={({ field }) => (
                            <FormItem style={{ display: form.getValues(`assignments.${index}.type`) === 'subject_teacher' ? 'block' : 'none' }}>
                              <FormLabel>Subject</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl>
                                <SelectContent>{subjectNamesArray.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                              </Select>
                              {form.formState.errors.assignments?.[index]?.subjectId && <FormMessage />}
                            </FormItem>
                          )}
                        />
                    </div>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={() => appendAssignment({type: 'class_teacher', classId: '', sectionId: '', subjectId: undefined, groupId: '' })} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Assignment
                </Button>
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
