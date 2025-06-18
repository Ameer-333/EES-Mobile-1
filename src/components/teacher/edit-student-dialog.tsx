
'use client';

import { useEffect, useState } from 'react';
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getStudentDocPath as getStudentDocPathFromUtil, getUserDocPath, getStudentProfilesCollectionPath } from '@/lib/firestore-paths';


const editStudentSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  satsNumber: z.string().min(3, { message: 'SATS number must be at least 3 characters.' }),
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

type EditStudentFormValues = z.infer<typeof editStudentSchema>;

interface EditStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStudentEdited: (editedStudent: Student) => void;
  studentToEdit: Student | null; 
}

export function EditStudentDialog({ isOpen, onOpenChange, onStudentEdited, studentToEdit }: EditStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClassChangeWarning, setShowClassChangeWarning] = useState(false);
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
      setShowClassChangeWarning(false); 
    }
  }, [studentToEdit, isOpen, form]);

  const watchedClassId = form.watch("classId");

  useEffect(() => {
    if (studentToEdit && watchedClassId !== studentToEdit.classId) {
      setShowClassChangeWarning(true);
    } else {
      setShowClassChangeWarning(false);
    }
  }, [watchedClassId, studentToEdit]);


  async function onSubmit(values: EditStudentFormValues) {
    if (!studentToEdit || !studentToEdit.id || !studentToEdit.classId || !studentToEdit.authUid) {
        toast({ title: "Error", description: "Student data is incomplete for editing.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    const originalClassId = studentToEdit.classId;
    const studentDocPath = getStudentDocPathFromUtil(originalClassId, studentToEdit.id);

    try {
      const studentDocRef = doc(firestore, studentDocPath);

      const studentDataToUpdate: Partial<Omit<Student, 'id' | 'authUid' | 'remarks' | 'scholarships' | 'examRecords' | 'rawAttendanceRecords'>> = {
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
        profilePictureUrl: values.profilePictureUrl || studentToEdit.profilePictureUrl || `https://placehold.co/150x150.png?text=${values.name.charAt(0)}`,
        backgroundInfo: values.backgroundInfo || undefined,
      };

      await setDoc(studentDocRef, studentDataToUpdate, { merge: true });

      if (values.classId !== originalClassId || values.name !== studentToEdit.name) {
        const userDocRef = doc(firestore, getUserDocPath(studentToEdit.authUid));
        const userUpdateData: Partial<ManagedUser> = {
            name: values.name, 
        };
        if (values.classId !== originalClassId) {
            userUpdateData.classId = values.classId;
        }
        await setDoc(userDocRef, userUpdateData, { merge: true });
        
        if (values.classId !== originalClassId) {
            toast({
                title: "Class ID Changed - Manual Migration Needed",
                description: `Student ${values.name}'s class was changed from ${originalClassId} to ${values.classId}. Their profile data in Firestore has its classId field updated but the document itself HAS NOT been moved to the new class's subcollection. Please perform manual data migration if this student has fully moved classes. This record will no longer appear under the original class for this teacher if their assignments don't cover the new classId.`,
                variant: "destructive",
                duration: 20000,
            });
        }
      }

      const updatedStudentForCallback: Student = {
        ...studentToEdit,
        ...studentDataToUpdate,
        classId: values.classId, 
      };
      onStudentEdited(updatedStudentForCallback);

      if (values.classId === originalClassId) { // Only show simple success if classId wasn't changed
        toast({
            title: "Student Updated",
            description: `${values.name}'s details have been successfully updated.`,
        });
      }
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
      if (!open) {
        form.reset();
        setShowClassChangeWarning(false);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student: {studentToEdit.name}</DialogTitle>
          <DialogDescription>
            Modify the student's details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-3 pr-2">
            {showClassChangeWarning && (
                <div className="p-3 my-2 border border-destructive/50 bg-destructive/10 rounded-md text-sm text-destructive flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong>Warning: Changing Class ID.</strong>
                        <p>The student's data will remain in the original class subcollection ({getStudentProfilesCollectionPath(studentToEdit.classId.toString())}). Only the 'classId' field within their record and their 'users' record will be updated. A manual data migration will be needed to move the record to the new class's subcollection (student_data_by_class/{form.getValues('classId')}/profiles).</p>
                    </div>
                </div>
            )}
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
                <FormItem><FormLabel>Class ID (System, e.g., 10, LKG)</FormLabel><FormControl><Input placeholder="e.g. 10, LKG, NIOS, 10TH_PASSOUT_2025" {...field} /></FormControl><FormMessage /></FormItem>
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
    

    
