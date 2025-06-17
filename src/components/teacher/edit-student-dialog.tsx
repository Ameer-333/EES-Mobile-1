
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, ReligionType } from '@/types';
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore'; 

const STUDENTS_COLLECTION = 'students';

const editStudentSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  satsNumber: z.string().min(3, { message: 'SATS number must be at least 3 characters.' }),
  class: z.string().min(1, { message: 'Class is required.' }),
  section: z.string().min(1, { message: 'Section is required (e.g., A, B).' }).max(2),
  caste: z.string().min(1, { message: 'Caste is required.' }),
  religion: z.custom<ReligionType>(val => religionOptions.includes(val as ReligionType), 'Religion is required.'),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
  profilePictureUrl: z.string().url({ message: "Invalid URL format. Please enter a full URL (e.g., https://example.com/image.png)" }).optional().or(z.literal('')),
});

type EditStudentFormValues = z.infer<typeof editStudentSchema>;

interface EditStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStudentEdited: (editedStudent: Student) => void; 
  studentToEdit: Student | null;
}

export function EditStudentDialog({ isOpen, onOpenChange, onStudentEdited, studentToEdit }: EditStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditStudentFormValues>({
    resolver: zodResolver(editStudentSchema),
  });

  useEffect(() => {
    if (studentToEdit && isOpen) {
      form.reset({
        name: studentToEdit.name,
        satsNumber: studentToEdit.satsNumber,
        class: studentToEdit.class,
        section: studentToEdit.section,
        caste: studentToEdit.caste,
        religion: studentToEdit.religion,
        address: studentToEdit.address,
        profilePictureUrl: studentToEdit.profilePictureUrl || '',
      });
    }
  }, [studentToEdit, isOpen, form]);

  async function onSubmit(values: EditStudentFormValues) {
    if (!studentToEdit) return;

    setIsSubmitting(true);
    try {
      const studentDocRef = doc(firestore, STUDENTS_COLLECTION, studentToEdit.id);
      
      const studentDataToUpdate: Partial<Student> = {
        ...values,
        profilePictureUrl: values.profilePictureUrl || null,
      };

      await setDoc(studentDocRef, studentDataToUpdate, { merge: true });
      
      const updatedStudentForCallback: Student = {
        ...studentToEdit, 
        ...studentDataToUpdate, 
        profilePictureUrl: studentDataToUpdate.profilePictureUrl ?? undefined, 
      };
      onStudentEdited(updatedStudentForCallback);

      toast({
          title: "Student Updated",
          description: `${values.name}'s details have been successfully updated in Firestore.`,
      });
      onOpenChange(false); 
    } catch (error) {
      console.error("Error updating student in Firestore:", error);
      toast({
        title: "Update Failed",
        description: "Could not update student details in Firestore.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (!studentToEdit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) form.reset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Student: {studentToEdit.name}</DialogTitle>
          <DialogDescription>
            Modify the student's details below. Click save when you're done.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {religionOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Textarea placeholder="Enter student's full address" {...field} className="min-h-[80px]" disabled={isSubmitting} />
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
                    <Input placeholder="https://example.com/student.png" {...field} disabled={isSubmitting} />
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
