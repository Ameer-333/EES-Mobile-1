
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, ReligionType, StudentFormData, ManagedUser } from '@/types';
import { religionOptions } from '@/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { firestore, auth as firebaseAuth } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const STUDENT_DATA_ROOT_COLLECTION = 'student_data_by_class';
const PROFILES_SUBCOLLECTION_NAME = 'profiles';
const USERS_COLLECTION = 'users';

// Helper function to get the path to a class's profiles subcollection
const getStudentProfilesCollectionPath = (classId: string): string => {
  if (!classId) throw new Error("classId is required to determine student profiles collection path");
  return `${STUDENT_DATA_ROOT_COLLECTION}/${classId}/${PROFILES_SUBCOLLECTION_NAME}`;
};

const addStudentSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  satsNumber: z.string().min(3, { message: 'SATS number must be at least 3 characters.' }).regex(/^[a-zA-Z0-9]+$/, "SATS number should be alphanumeric."),
  className: z.string().min(1, { message: 'Class Name (e.g., 10th Grade, LKG) is required.' }),
  classId: z.string().min(1, { message: 'Class ID (e.g., 10, LKG, NIOS - used for collection path) is required.' }),
  sectionId: z.string().max(2).optional().or(z.literal('')),
  groupId: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  fatherName: z.string().optional().or(z.literal('')),
  motherName: z.string().optional().or(z.literal('')),
  fatherOccupation: z.string().optional().or(z.literal('')),
  motherOccupation: z.string().optional().or(z.literal('')),
  parentsAnnualIncome: z.coerce.number().nonnegative("Income must be a positive number").optional().or(z.literal(0)),
  parentContactNumber: z.string().optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  caste: z.string().min(1, { message: 'Caste is required.' }),
  religion: z.custom<ReligionType>(val => religionOptions.includes(val as ReligionType), 'Religion is required.'),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
  siblingReference: z.string().optional().or(z.literal('')),
  profilePictureUrl: z.string().url({ message: "Invalid URL format. Use https://placehold.co for placeholders." }).optional().or(z.literal('')),
  backgroundInfo: z.string().optional().or(z.literal('')),
});

type AddStudentFormValues = z.infer<typeof addStudentSchema>;

interface AddStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStudentAdded: (newStudent: Student) => void;
}

export function AddStudentDialog({ isOpen, onOpenChange, onStudentAdded }: AddStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{email: string, password: string} | null>(null);
  const { toast } = useToast();

  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: '', satsNumber: '', className: '', classId: '', sectionId: '', groupId: '',
      dateOfBirth: '', fatherName: '', motherName: '', fatherOccupation: '', motherOccupation: '',
      parentsAnnualIncome: 0, parentContactNumber: '', email: '', caste: '', religion: 'Hindu',
      address: '', siblingReference: '', profilePictureUrl: '', backgroundInfo: '',
    },
  });

  async function onSubmit(values: AddStudentFormValues) {
    setIsSubmitting(true);
    setGeneratedCredentials(null);

    if (!values.classId) {
        toast({ title: "Error", description: "Class ID is missing. Cannot add student.", variant: "destructive"});
        setIsSubmitting(false);
        return;
    }
    
    const generatedLoginEmail = `${values.satsNumber.toLowerCase().replace(/[^a-z0-9]/gi, '')}.student@eesedu.com`;
    const generatedPassword = `${values.satsNumber.toUpperCase()}Default@123`;
    const studentProfilesCollectionPath = getStudentProfilesCollectionPath(values.classId);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, generatedLoginEmail, generatedPassword);
      const authUid = userCredential.user.uid;

      // 2. Prepare and add student document to the class-specific profiles subcollection
      const studentProfileDataForDb: Omit<Student, 'id'> = {
        authUid: authUid,
        name: values.name,
        satsNumber: values.satsNumber,
        className: values.className,
        classId: values.classId,
        sectionId: values.sectionId || undefined,
        groupId: values.groupId || undefined,
        class: values.className, 
        section: values.sectionId || 'N/A',
        dateOfBirth: values.dateOfBirth || undefined,
        fatherName: values.fatherName || undefined,
        motherName: values.motherName || undefined,
        fatherOccupation: values.fatherOccupation || undefined,
        motherOccupation: values.motherOccupation || undefined,
        parentsAnnualIncome: values.parentsAnnualIncome || undefined,
        parentContactNumber: values.parentContactNumber || undefined,
        email: values.email || undefined,
        caste: values.caste,
        religion: values.religion,
        address: values.address,
        siblingReference: values.siblingReference || undefined,
        profilePictureUrl: values.profilePictureUrl || `https://placehold.co/150x150.png?text=${values.name.charAt(0)}`,
        backgroundInfo: values.backgroundInfo || undefined,
        remarks: [],
        scholarships: [],
        examRecords: [],
        rawAttendanceRecords: [],
      };
      const studentDocRef = await addDoc(collection(firestore, studentProfilesCollectionPath), studentProfileDataForDb);
      const studentProfileId = studentDocRef.id; 

      // 3. Create/Update document in 'users' collection to link Auth UID to student profile
      const userDocData: Omit<ManagedUser, 'id' | 'lastLogin' | 'assignments'> = {
        name: values.name,
        email: generatedLoginEmail,
        role: 'Student',
        status: 'Active',
        classId: values.classId,
        studentProfileId: studentProfileId,
      };
      await setDoc(doc(firestore, USERS_COLLECTION, authUid), userDocData);

      const newStudentForCallback: Student = {
        ...studentProfileDataForDb,
        id: studentProfileId, 
      };
      onStudentAdded(newStudentForCallback);

      setGeneratedCredentials({ email: generatedLoginEmail, password: generatedPassword });
      toast({
          title: "Student Added Successfully!",
          description: (
            React.createElement('div', null,
              React.createElement('p', null, `${values.name} added to class ${values.className} and auth account created.`),
              React.createElement('p', {className: "mt-2 font-semibold"}, `Login Email: ${generatedLoginEmail}`),
              React.createElement('p', {className: "font-semibold"}, `Default Password: ${generatedPassword}`),
              React.createElement('p', {className: "text-xs mt-1 text-destructive"}, "Advise student to change password on first login.")
            )
          ),
          duration: 20000,
      });
      form.reset();
    } catch (error: any) {
      console.error("Error adding student or creating auth user:", error);
      let errorMessage = "Could not add student. Please check console for details.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = `The login email ${generatedLoginEmail} is already in use. This might happen if a student with the same SATS number was already created or if there's an issue with email generation uniqueness. Please verify.`;
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The generated password is too weak. This is a system issue, please contact an admin.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Error Adding Student",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setGeneratedCredentials(null);
        }
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter student details. Login email & password will be auto-generated. Student data will be stored in a class-specific subcollection (e.g., student_data_by_class/LKG/profiles).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-3 pr-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g. Priya Sharma" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="satsNumber" render={({ field }) => (
              <FormItem><FormLabel>SATS Number (Alphanumeric)</FormLabel><FormControl><Input placeholder="e.g. SAT00123" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField control={form.control} name="className" render={({ field }) => (
                <FormItem><FormLabel>Class Name (Display)</FormLabel><FormControl><Input placeholder="e.g. 10th Grade, LKG" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="classId" render={({ field }) => (
                <FormItem><FormLabel>Class ID (System, e.g., 10, LKG, NIOS)</FormLabel><FormControl><Input placeholder="e.g. 10, LKG, NIOS, 10TH_PASSOUT_2025" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField control={form.control} name="sectionId" render={({ field }) => (
                <FormItem><FormLabel>Section ID (Optional)</FormLabel><FormControl><Input placeholder="e.g. A, B" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="groupId" render={({ field }) => (
                <FormItem><FormLabel>Group ID (Optional, for NIOS/NCLP)</FormLabel><FormControl><Input placeholder="e.g. Alpha, Batch1" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
             <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Student Personal Email (Optional)</FormLabel><FormControl><Input type="email" placeholder="student.personal@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
              <FormItem><FormLabel>Date of Birth (Optional, YYYY-MM-DD)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="caste" render={({ field }) => (
                <FormItem><FormLabel>Caste</FormLabel><FormControl><Input placeholder="e.g. General" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="religion" render={({ field }) => (
                <FormItem><FormLabel>Religion</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select religion" /></SelectTrigger></FormControl>
                    <SelectContent>{religionOptions.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
            </div>
            <FormField control={form.control} name="fatherName" render={({ field }) => (
              <FormItem><FormLabel>Father's Name (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="fatherOccupation" render={({ field }) => (
              <FormItem><FormLabel>Father's Occupation (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="motherName" render={({ field }) => (
              <FormItem><FormLabel>Mother's Name (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="motherOccupation" render={({ field }) => (
              <FormItem><FormLabel>Mother's Occupation (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="parentsAnnualIncome" render={({ field }) => (
              <FormItem><FormLabel>Parents' Annual Income (Optional, INR)</FormLabel><FormControl><Input type="number" placeholder="e.g. 500000" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="parentContactNumber" render={({ field }) => (
              <FormItem><FormLabel>Parent's Contact Number (Optional)</FormLabel><FormControl><Input type="tel" placeholder="+91..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Enter student's full address" {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="siblingReference" render={({ field }) => (
              <FormItem><FormLabel>Sibling Reference (Optional)</FormLabel><FormControl><Input placeholder="e.g., Sister: Ananya, Class 8B" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="profilePictureUrl" render={({ field }) => (
              <FormItem><FormLabel>Profile Picture URL (Optional)</FormLabel><FormControl><Input placeholder="https://placehold.co/100x100.png" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="backgroundInfo" render={({ field }) => (
              <FormItem><FormLabel>Background Info (Optional)</FormLabel><FormControl><Textarea placeholder="Any additional notes or background..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>

            {generatedCredentials && (
              <div className="mt-4 p-3 border border-green-500 bg-green-50/80 rounded-md text-sm shadow">
                <p className="font-semibold text-green-700 flex items-center"><Info className="h-4 w-4 mr-2"/>Credentials Generated:</p>
                <p><span className="font-medium">Login Email:</span> {generatedCredentials.email}</p>
                <p><span className="font-medium">Password:</span> {generatedCredentials.password}</p>
                <p className="text-xs mt-1 text-red-600">Please share these with the student. They should change their password upon first login.</p>
              </div>
            )}

            <DialogFooter className="pt-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => {
                    onOpenChange(false);
                    form.reset();
                    setGeneratedCredentials(null);
                }} disabled={isSubmitting}>
                  {generatedCredentials ? "Close" : "Cancel"}
                </Button>
              </DialogClose>
              {!generatedCredentials && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : null}
                  Add Student & Create Account
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
    

    