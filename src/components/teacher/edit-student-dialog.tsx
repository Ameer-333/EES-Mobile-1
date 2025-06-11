
'use client';

import { useEffect, useState } from 'react';
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

const editStudentSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  satsNumber: z.string().min(3, { message: 'SATS number must be at least 3 characters.' }),
  class: z.string().min(1, { message: 'Class is required.' }),
  section: z.string().min(1, { message: 'Section is required (e.g., A, B).' }).max(2),
  caste: z.string().min(1, { message: 'Caste is required.' }),
  religion: z.string().min(1, { message: 'Religion is required.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
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
    defaultValues: {
      name: '',
      satsNumber: '',
      class: '',
      section: '',
      caste: '',
      religion: '',
      address: '',
    },
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
      });
    }
  }, [studentToEdit, isOpen, form]);

  async function onSubmit(values: EditStudentFormValues) {
    if (!studentToEdit) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const editedStudent: Student = {
      id: studentToEdit.id, // Keep existing ID
      ...values,
    };
    onStudentEdited(editedStudent);
    setIsSubmitting(false);
    onOpenChange(false); // Close dialog
    toast({
        title: "Student Updated",
        description: `${editedStudent.name}'s details have been successfully updated.`,
    });
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
                    <Input placeholder="e.g. Priya Sharma" {...field} />
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
                    <Input placeholder="e.g. SAT00123" {...field} />
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
                    <Input placeholder="e.g. 10th" {...field} />
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
                    <Input placeholder="e.g. A" {...field} />
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
                    <Input placeholder="e.g. General" {...field} />
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
                    <Input placeholder="e.g. Hinduism" {...field} />
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
                    <Textarea placeholder="Enter student's full address" {...field} className="min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => form.reset()}>
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
