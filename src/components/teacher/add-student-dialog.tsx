
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, StudentFormData } from '@/types';
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const STUDENTS_COLLECTION = 'students';

const addStudentSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  satsNumber: z.string().min(3, { message: 'SATS number must be at least 3 characters.' }),
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
  onStudentAdded: (newStudent: Student) => void; // Kept for dialog closure, actual data update via listener
}

export function AddStudentDialog({ isOpen, onOpenChange, onStudentAdded }: AddStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    try {
      const studentDataToSave: StudentFormData & { profilePictureUrl?: string } = {
        ...values,
        profilePictureUrl: values.profilePictureUrl || undefined,
      };
      // Remarks, scholarships, backgroundInfo would be empty arrays/undefined initially for a new student.
      // These can be added via the edit functionality or specific forms later.

      const docRef = await addDoc(collection(firestore, STUDENTS_COLLECTION), studentDataToSave);
      
      onStudentAdded({ ...studentDataToSave, id: docRef.id }); // Pass new student with Firestore ID
      
      toast({
          title: "Student Added",
          description: `${values.name} has been successfully added to Firestore.`,
      });
      form.reset();
      onOpenChange(false); 
    } catch (error) {
      console.error("Error adding student to Firestore:", error);
      toast({
        title: "Error Adding Student",
        description: "Could not add student to Firestore.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) form.reset(); // Reset form if dialog is closed without submitting
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the details for the new student. This will create a record in Firestore.
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
                  <FormLabel>SATS Number</FormLabel>
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
            <DialogFooter className="pt-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add Student
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
