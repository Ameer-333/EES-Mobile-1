
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, ReligionType, StudentFormData } from '@/types';
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

// Updated schema to use classId, className, sectionId, groupId
const editStudentSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  satsNumber: z.string().min(3, { message: 'SATS number must be at least 3 characters.' }),

  className: z.string().min(1, { message: 'Class Name (e.g., 10th Grade, LKG) is required.' }),
  classId: z.string().min(1, { message: 'Class ID (e.g., 10, LKG) is required.' }),
  sectionId: z.string().min(1, { message: 'Section ID (e.g., A, B) is required.' }).max(2).optional().or(z.literal('')),
  groupId: z.string().optional().or(z.literal('')), // For NIOS/NCLP specific groups

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
  profilePictureUrl: z.string().url({ message: "Invalid URL format. Please enter a full URL (e.g., https://example.com/image.png)" }).optional().or(z.literal('')),
  backgroundInfo: z.string().optional().or(z.literal('')),
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
        
        className: studentToEdit.className,
        classId: studentToEdit.classId,
        sectionId: studentToEdit.sectionId || '',
        groupId: studentToEdit.groupId || '',

        dateOfBirth: studentToEdit.dateOfBirth || '',
        fatherName: studentToEdit.fatherName || '',
        motherName: studentToEdit.motherName || '',
        fatherOccupation: studentToEdit.fatherOccupation || '',
        motherOccupation: studentToEdit.motherOccupation || '',
        parentsAnnualIncome: studentToEdit.parentsAnnualIncome || 0,
        parentContactNumber: studentToEdit.parentContactNumber || '',
        email: studentToEdit.email || '',
        caste: studentToEdit.caste,
        religion: studentToEdit.religion,
        address: studentToEdit.address,
        siblingReference: studentToEdit.siblingReference || '',
        profilePictureUrl: studentToEdit.profilePictureUrl || '',
        backgroundInfo: studentToEdit.backgroundInfo || '',
      });
    }
  }, [studentToEdit, isOpen, form]);

  async function onSubmit(values: EditStudentFormValues) {
    if (!studentToEdit) return;

    setIsSubmitting(true);
    try {
      const studentDocRef = doc(firestore, STUDENTS_COLLECTION, studentToEdit.id);
      
      // Map form values to the Student structure, ensuring undefined for empty optionals
      const studentDataToUpdate: Partial<Omit<Student, 'id'>> = {
        name: values.name,
        satsNumber: values.satsNumber,

        className: values.className,
        classId: values.classId,
        sectionId: values.sectionId || undefined,
        groupId: values.groupId || undefined,
        
        // Update old fields for compatibility if necessary, or derive
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
        profilePictureUrl: values.profilePictureUrl || null,
        backgroundInfo: values.backgroundInfo || undefined,
        // authUid is not editable here
      };

      await setDoc(studentDocRef, studentDataToUpdate, { merge: true });
      
      const updatedStudentForCallback: Student = {
        ...studentToEdit, 
        ...studentDataToUpdate,
        // Ensure all fields from Student type are present
        authUid: studentToEdit.authUid,
        remarks: studentToEdit.remarks || [],
        scholarships: studentToEdit.scholarships || [],
        examRecords: studentToEdit.examRecords || [],
        rawAttendanceRecords: studentToEdit.rawAttendanceRecords || [],
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
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student: {studentToEdit.name}</DialogTitle>
          <DialogDescription>
            Modify the student's details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-3 pr-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g. Priya Sharma" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="satsNumber" render={({ field }) => (
              <FormItem><FormLabel>SATS Number</FormLabel><FormControl><Input placeholder="e.g. SAT00123" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField control={form.control} name="className" render={({ field }) => (
                <FormItem><FormLabel>Class Name (Display)</FormLabel><FormControl><Input placeholder="e.g. 10th Grade, LKG" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="classId" render={({ field }) => (
                <FormItem><FormLabel>Class ID (for system)</FormLabel><FormControl><Input placeholder="e.g. 10, LKG, NIOS" {...field} /></FormControl><FormMessage /></FormItem>
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
              <FormItem><FormLabel>Profile Picture URL (Optional)</FormLabel><FormControl><Input placeholder="https://example.com/student.png" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="backgroundInfo" render={({ field }) => (
              <FormItem><FormLabel>Background Info (Optional)</FormLabel><FormControl><Textarea placeholder="Any additional notes or background..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <DialogFooter className="pt-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    