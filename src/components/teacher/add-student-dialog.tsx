
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student } from '@/types';
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
import { Loader2, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { firestore, auth as firebaseAuth } from '@/lib/firebase'; // Import firebaseAuth
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import createUserWithEmailAndPassword

const STUDENTS_COLLECTION = 'students';

// Schema no longer includes authUid as it's auto-generated
const addStudentSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  satsNumber: z.string().min(3, { message: 'SATS number must be at least 3 characters.' }).regex(/^[a-zA-Z0-9]+$/, "SATS number should be alphanumeric."),
  class: z.string().min(1, { message: 'Class is required.' }),
  section: z.string().min(1, { message: 'Section is required (e.g., A, B).' }).max(2),
  caste: z.string().min(1, { message: 'Caste is required.' }),
  religion: z.string().min(1, { message: 'Religion is required.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
  profilePictureUrl: z.string().url({ message: "Invalid URL format. Please enter a full URL (e.g., https://example.com/image.png)" }).optional().or(z.literal('')),
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
      name: '',
      satsNumber: '',
      class: '',
      section: '',
      caste: '',
      religion: '',
      address: '',
      profilePictureUrl: '',
    },
  });

  async function onSubmit(values: AddStudentFormValues) {
    setIsSubmitting(true);
    setGeneratedCredentials(null);

    const generatedEmail = `${values.satsNumber.toUpperCase()}@ees-student.com`;
    const generatedPassword = `${values.satsNumber.toUpperCase()}Default@123`; // Not secure for production

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, generatedEmail, generatedPassword);
      const authUid = userCredential.user.uid;

      // 2. Prepare student data for Firestore, including the new authUid
      const studentDataToSave: Omit<Student, 'id' | 'remarks' | 'scholarships' | 'backgroundInfo'> & { profilePictureUrl: string | null, authUid: string } = {
        name: values.name,
        satsNumber: values.satsNumber,
        class: values.class,
        section: values.section,
        caste: values.caste,
        religion: values.religion,
        address: values.address,
        profilePictureUrl: values.profilePictureUrl || null,
        authUid: authUid, // Add the authUid
      };

      const fullStudentDataForFirestore: Omit<Student, 'id'> = {
        ...studentDataToSave,
        remarks: [], 
        scholarships: [], 
        backgroundInfo: "", 
      };
      
      // 3. Add student profile to Firestore
      const docRef = await addDoc(collection(firestore, STUDENTS_COLLECTION), fullStudentDataForFirestore);
      
      const newStudentForCallback: Student = {
        ...fullStudentDataForFirestore,
        id: docRef.id,
        profilePictureUrl: fullStudentDataForFirestore.profilePictureUrl, 
      };
      onStudentAdded(newStudentForCallback); 
      
      setGeneratedCredentials({ email: generatedEmail, password: generatedPassword });
      toast({
          title: "Student Added Successfully!",
          description: (
            <div>
              <p>{values.name} has been added to Firestore and an authentication account created.</p>
              <p className="mt-2 font-semibold">Generated Email: {generatedEmail}</p>
              <p className="font-semibold">Default Password: {generatedPassword}</p>
              <p className="text-xs mt-1 text-destructive">Note: Advise student to change password on first login.</p>
            </div>
          ),
          duration: 15000, // Longer duration to see credentials
      });
      form.reset();
      // onOpenChange(false); // Keep dialog open to show credentials if desired, or close
    } catch (error: any) {
      console.error("Error adding student or creating auth user:", error);
      let errorMessage = "Could not add student. Please check console for details.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = `The email ${generatedEmail} is already in use. Please check the SATS number or contact an admin.`;
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The generated password is too weak. This is a system issue, please contact an admin.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
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
          setGeneratedCredentials(null); // Reset credentials when dialog closes
        }
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter student details. An email and password will be auto-generated.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-3 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Priya Sharma" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="satsNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SATS Number (Alphanumeric)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. SAT00123" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class (e.g., 10th)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 10th" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. A" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            <FormField
              control={form.control}
              name="caste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caste</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. General" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Religion</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Hinduism" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter student's full address" {...field} className="min-h-[80px]" disabled={isSubmitting}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profilePictureUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/student.png" {...field} disabled={isSubmitting}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {generatedCredentials && (
              <div className="mt-4 p-3 border border-green-500 bg-green-50 rounded-md text-sm">
                <p className="font-semibold text-green-700 flex items-center"><Info className="h-4 w-4 mr-2"/>Credentials Generated:</p>
                <p><span className="font-medium">Email:</span> {generatedCredentials.email}</p>
                <p><span className="font-medium">Password:</span> {generatedCredentials.password}</p>
                <p className="text-xs mt-1 text-destructive-foreground">Please share these with the student. They should change their password upon first login.</p>
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
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
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
