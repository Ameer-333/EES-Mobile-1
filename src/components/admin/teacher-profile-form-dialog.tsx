
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Teacher, TeacherFormData, SubjectName } from '@/types';
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
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const TEACHERS_COLLECTION = 'teachers';
const currentYear = new Date().getFullYear();

const teacherProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }).max(15, "Phone number too long."),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  yearOfJoining: z.coerce.number().min(1980, "Year too early.").max(currentYear, `Year cannot be in the future.`),
  subjectsTaught: z.array(z.custom<SubjectName>((val) => subjectNamesArray.includes(val as SubjectName)))
    .min(1, { message: "At least one subject must be selected." }),
  profilePictureUrl: z.string().url({ message: "Invalid URL format for profile picture." }).optional().or(z.literal('')),
});

type TeacherProfileFormValues = z.infer<typeof teacherProfileSchema>;

interface TeacherProfileFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTeacherSaved: (teacherData: Teacher, isEditing: boolean) => void; // Callback still useful for UI updates/dialog close
  teacherToEdit?: Teacher | null;
}

export function TeacherProfileFormDialog({
  isOpen,
  onOpenChange,
  onTeacherSaved,
  teacherToEdit,
}: TeacherProfileFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    },
  });

  useEffect(() => {
    if (teacherToEdit && isOpen) {
      form.reset({
        name: teacherToEdit.name,
        email: teacherToEdit.email,
        phoneNumber: teacherToEdit.phoneNumber,
        address: teacherToEdit.address,
        yearOfJoining: teacherToEdit.yearOfJoining,
        subjectsTaught: teacherToEdit.subjectsTaught || [],
        profilePictureUrl: teacherToEdit.profilePictureUrl || '',
      });
    } else if (!isEditing && isOpen) {
      form.reset({
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        yearOfJoining: currentYear,
        subjectsTaught: [],
        profilePictureUrl: '',
      });
    }
  }, [teacherToEdit, isOpen, form, isEditing]);

  async function onSubmit(values: TeacherProfileFormValues) {
    setIsSubmitting(true);
    try {
      const totalYearsWorked = currentYear - values.yearOfJoining;
      const teacherDataForFirestore: Omit<Teacher, 'id' | 'totalYearsWorked' | 'salaryHistory'> & Partial<Pick<Teacher, 'totalYearsWorked' | 'salaryHistory'>> = {
        ...values,
        profilePictureUrl: values.profilePictureUrl || undefined, // Store undefined if empty
        totalYearsWorked: totalYearsWorked >= 0 ? totalYearsWorked : 0,
        // salaryHistory, daysPresentThisMonth, daysAbsentThisMonth are not part of this form initially.
        // They will be managed by the payroll component or kept as default if new.
      };

      let docId = teacherToEdit?.id;

      if (isEditing && docId) {
        const teacherDocRef = doc(firestore, TEACHERS_COLLECTION, docId);
        // Merge with existing document to preserve salaryHistory etc.
        await setDoc(teacherDocRef, teacherDataForFirestore, { merge: true });
      } else {
        // Add new teacher, initialize optional fields
        const completeNewTeacherData: Omit<Teacher, 'id'> = {
            ...teacherDataForFirestore,
            salaryHistory: [], // Initialize as empty array for new teachers
            daysPresentThisMonth: 0,
            daysAbsentThisMonth: 0,
        };
        const docRef = await addDoc(collection(firestore, TEACHERS_COLLECTION), completeNewTeacherData);
        docId = docRef.id;
      }
      
      // The onSnapshot listener in ManageTeacherProfiles will pick up the changes.
      // onTeacherSaved can be used to close the dialog.
      onTeacherSaved({ ...teacherDataForFirestore, id: docId!, salaryHistory: teacherToEdit?.salaryHistory || [] }, isEditing);

      toast({
        title: isEditing ? "Teacher Updated" : "Teacher Added",
        description: `${values.name}'s profile has been ${isEditing ? 'updated in' : 'added to'} Firestore.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving teacher to Firestore:", error);
      toast({
        title: "Save Failed",
        description: "Could not save teacher profile to Firestore.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) form.reset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Teacher Profile" : "Add New Teacher"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify the teacher's details below." : "Enter the details for the new teacher."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2 pb-4">
            <div className="space-y-4"> 
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g. Priya Sharma" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="e.g. priya.sharma@example.com" {...field} /></FormControl><FormMessage /></FormItem>
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
              <FormField
                control={form.control}
                name="subjectsTaught"
                render={() => (
                  <FormItem>
                    <FormLabel>Subjects Taught</FormLabel>
                    <div className="grid grid-cols-2 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                      {subjectNamesArray.map((subject) => (
                        <FormField
                          key={subject}
                          control={form.control}
                          name="subjectsTaught"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(subject)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), subject])
                                        : field.onChange(
                                            (field.value || []).filter(
                                              (value) => value !== subject
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">{subject}</FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-6">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isEditing ? "Save Changes" : "Add Teacher"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    