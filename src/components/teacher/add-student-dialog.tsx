
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, ReligionType, ManagedUser, TeacherAssignment } from '@/types';
import { religionOptions } from '@/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Info, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { firestore, auth as firebaseAuth } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser, type User as FirebaseAuthUser } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getStudentProfilesCollectionPath, getUserDocPath } from '@/lib/firestore-paths';
import { useAppContext } from '@/app/(protected)/layout';

const addStudentSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  satsNumber: z.string().min(3, { message: 'SATS number must be at least 3 characters.' }).regex(/^[a-zA-Z0-9]+$/, "SATS number should be alphanumeric."),
  assignedClassInfo: z.string().min(1, "You must select an assigned class/section for the student."),
  sectionIdManual: z.string().max(3).optional().or(z.literal('')),
  groupId: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  fatherName: z.string().optional().or(z.literal('')),
  motherName: z.string().optional().or(z.literal('')),
  fatherOccupation: z.string().optional().or(z.literal('')),
  motherOccupation: z.string().optional().or(z.literal('')),
  parentsAnnualIncome: z.coerce.number().nonnegative("Income must be a positive number").optional().default(0),
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
  const { userProfile } = useAppContext();
  const teacherAssignments = userProfile?.role === 'Teacher' ? userProfile.assignments || [] : [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{email: string, password: string} | null>(null);
  const { toast } = useToast();

  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: '', satsNumber: '', assignedClassInfo: '', sectionIdManual: '', groupId: '',
      dateOfBirth: '', fatherName: '', motherName: '', fatherOccupation: '', motherOccupation: '',
      parentsAnnualIncome: 0, parentContactNumber: '', email: '', caste: '', religion: 'Hindu',
      address: '', siblingReference: '', profilePictureUrl: '', backgroundInfo: '',
    },
  });
  
  const teacherAddableClasses = useMemo(() => {
    return teacherAssignments
      .filter(a => a.type === 'class_teacher' || a.type === 'mother_teacher')
      .map(a => ({
        value: `${a.classId}|${a.sectionId || ''}|${a.className || a.classId}`,
        label: `${a.className || a.classId}${a.sectionId ? ` - Section ${a.sectionId}` : ''} (${a.type === 'mother_teacher' ? 'Mother Teacher' : 'Class Teacher'})`
      }));
  }, [teacherAssignments]);

  const selectedAssignedClassInfo = form.watch('assignedClassInfo');
  const needsManualSection = useMemo(() => {
      if (!selectedAssignedClassInfo) return false;
      const [_classId, sectionId, _className] = selectedAssignedClassInfo.split('|');
      return !sectionId; 
  }, [selectedAssignedClassInfo]);


  async function onSubmit(values: AddStudentFormValues) {
    setIsSubmitting(true);
    setGeneratedCredentials(null);

    if (!values.assignedClassInfo) {
        toast({ title: "Error", description: "Assigned class information is missing.", variant: "destructive"});
        setIsSubmitting(false);
        return;
    }
    
    const [classId, assignedSectionId, classNameFromAssignment] = values.assignedClassInfo.split('|');
    const finalClassName = classNameFromAssignment || classId;
    const finalSectionId = assignedSectionId || values.sectionIdManual || undefined;

    if (!classId) {
        toast({ title: "Error", description: "Class ID is missing. Cannot add student.", variant: "destructive"});
        setIsSubmitting(false);
        return;
    }
    
    const generatedLoginEmail = `${values.satsNumber.toLowerCase().replace(/[^a-z0-9]/gi, '')}.student@eesedu.com`;
    const generatedPassword = `${values.satsNumber.toUpperCase()}Default@123`;
    
    const studentProfilesCollectionPath = getStudentProfilesCollectionPath(classId);
    let firebaseAuthUser: FirebaseAuthUser | null = null;
    let userDocCreated = false;
    let studentProfileDocCreated = false;

    try {
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, generatedLoginEmail, generatedPassword);
      firebaseAuthUser = userCredential.user;
      const authUid = firebaseAuthUser.uid;

      // Step 2: Prepare student profile data
      const studentProfileDataForDb: any = {
        authUid: authUid, name: values.name, satsNumber: values.satsNumber,
        className: finalClassName, classId: classId, class: finalClassName, 
        section: finalSectionId || 'N/A', caste: values.caste, religion: values.religion,
        address: values.address,
        profilePictureUrl: values.profilePictureUrl || `https://placehold.co/150x150.png?text=${values.name.charAt(0)}`,
        parentsAnnualIncome: values.parentsAnnualIncome,
        remarks: [], scholarships: [], examRecords: [], rawAttendanceRecords: [],
      };
      if (finalSectionId) studentProfileDataForDb.sectionId = finalSectionId;
      if (values.groupId) studentProfileDataForDb.groupId = values.groupId;
      if (values.dateOfBirth) studentProfileDataForDb.dateOfBirth = values.dateOfBirth;
      if (values.fatherName) studentProfileDataForDb.fatherName = values.fatherName;
      if (values.motherName) studentProfileDataForDb.motherName = values.motherName;
      if (values.fatherOccupation) studentProfileDataForDb.fatherOccupation = values.fatherOccupation;
      if (values.motherOccupation) studentProfileDataForDb.motherOccupation = values.motherOccupation;
      if (values.parentContactNumber) studentProfileDataForDb.parentContactNumber = values.parentContactNumber;
      if (values.email) studentProfileDataForDb.email = values.email;
      if (values.siblingReference) studentProfileDataForDb.siblingReference = values.siblingReference;
      if (values.backgroundInfo) studentProfileDataForDb.backgroundInfo = values.backgroundInfo;
      
      // Step 3: Create student profile document in /student_data_by_class/.../profiles
      const studentDocRef = await addDoc(collection(firestore, studentProfilesCollectionPath), studentProfileDataForDb as Omit<Student, 'id'>);
      const studentProfileId = studentDocRef.id; 
      studentProfileDocCreated = true;

      // Step 4: Create user document in /users
      const userDocData: Partial<ManagedUser> = { 
        name: values.name, email: generatedLoginEmail, role: 'Student', status: 'Active',
        classId: classId, studentProfileId: studentProfileId,
      };
      await setDoc(doc(firestore, getUserDocPath(authUid)), userDocData); 
      userDocCreated = true;

      const newStudentForCallback: Student = { ...studentProfileDataForDb, id: studentProfileId };
      onStudentAdded(newStudentForCallback);

      setGeneratedCredentials({ email: generatedLoginEmail, password: generatedPassword });
      toast({
          title: "Student Added Successfully!",
          description: (
            React.createElement('div', null,
              React.createElement('p', null, `${values.name} added to class ${finalClassName} ${finalSectionId ? `Section ${finalSectionId}` : ''} and auth account created.`),
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
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = `The login email ${generatedLoginEmail} is already in use. This student (SATS: ${values.satsNumber}) might already exist or there's an email conflict. Please verify.`;
            firebaseAuthUser = null; 
            break;
          // Add other specific Firebase Auth error codes if needed
          default:
            errorMessage = `Firebase error: ${error.message} (Code: ${error.code})`;
            break;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (firebaseAuthUser && (!userDocCreated || !studentProfileDocCreated)) {
        try {
          await deleteUser(firebaseAuthUser);
          errorMessage += " Firebase Auth user creation was rolled back.";
           toast({
            title: "Student Creation Failed (Rolled Back)",
            description: errorMessage,
            variant: "destructive",
            duration: 10000,
          });
        } catch (rollbackError: any) {
          console.error("Error rolling back Firebase Auth user:", rollbackError);
          errorMessage += " Failed to roll back Firebase Auth user. Please check Firebase console.";
           toast({
            title: "Student Creation Failed (Rollback Failed)",
            description: errorMessage,
            variant: "destructive",
            duration: 15000,
          });
        }
      } else if (!firebaseAuthUser) { // Auth creation itself failed
         toast({
          title: "Error Adding Student",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const noAddableClasses = teacherAddableClasses.length === 0;

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setGeneratedCredentials(null);
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isSubmitting) { // Prevent reset if dialog closed due to submission success
          form.reset();
          setGeneratedCredentials(null);
        }
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student to Your Class</DialogTitle>
          <DialogDescription>
            Enter student details. Login email & password will be auto-generated using SATS number.
          </DialogDescription>
        </DialogHeader>
        {noAddableClasses && (
             <div className="p-3 my-2 border border-amber-500/50 bg-amber-500/10 rounded-md text-sm text-amber-700 flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-amber-600" />
                <div>
                    <strong>No Assignable Classes:</strong> You are not currently assigned as a Class Teacher or Mother Teacher to any specific class/section, or your assignments lack section details if required by system configuration for student addition. Please contact an administrator if you believe this is an error.
                </div>
            </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-3 pr-2">
             <FormField
              control={form.control}
              name="assignedClassInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to Class/Section</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={noAddableClasses || isSubmitting || !!generatedCredentials}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={noAddableClasses ? "No assignable classes" : "Select your class/section"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teacherAddableClasses.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {needsManualSection && selectedAssignedClassInfo && (
                 <FormField control={form.control} name="sectionIdManual" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Enter Section ID for {selectedAssignedClassInfo.split('|')[2] || selectedAssignedClassInfo.split('|')[0]}</FormLabel>
                        <FormControl><Input placeholder="e.g. A, B, Sunshine" {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            )}
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g. Priya Sharma" {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="satsNumber" render={({ field }) => (
              <FormItem><FormLabel>SATS Number (Alphanumeric)</FormLabel><FormControl><Input placeholder="e.g. SAT00123" {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="groupId" render={({ field }) => (
                <FormItem><FormLabel>Group ID (Optional, for NIOS/NCLP specific sub-groups)</FormLabel><FormControl><Input placeholder="e.g. Alpha, Batch1" {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Student Personal Email (Optional)</FormLabel><FormControl><Input type="email" placeholder="student.personal@example.com" {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
              <FormItem><FormLabel>Date of Birth (Optional, YYYY-MM-DD)</FormLabel><FormControl><Input type="date" {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="caste" render={({ field }) => (
                <FormItem><FormLabel>Caste</FormLabel><FormControl><Input placeholder="e.g. General" {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="religion" render={({ field }) => (
                <FormItem><FormLabel>Religion</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting || !!generatedCredentials}><FormControl><SelectTrigger><SelectValue placeholder="Select religion" /></SelectTrigger></FormControl>
                    <SelectContent>{religionOptions.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
            </div>
            <FormField control={form.control} name="fatherName" render={({ field }) => (
              <FormItem><FormLabel>Father's Name (Optional)</FormLabel><FormControl><Input {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="fatherOccupation" render={({ field }) => (
              <FormItem><FormLabel>Father's Occupation (Optional)</FormLabel><FormControl><Input {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="motherName" render={({ field }) => (
              <FormItem><FormLabel>Mother's Name (Optional)</FormLabel><FormControl><Input {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="motherOccupation" render={({ field }) => (
              <FormItem><FormLabel>Mother's Occupation (Optional)</FormLabel><FormControl><Input {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="parentsAnnualIncome" render={({ field }) => (
              <FormItem><FormLabel>Parents' Annual Income (Optional, INR)</FormLabel><FormControl><Input type="number" placeholder="e.g. 500000" {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="parentContactNumber" render={({ field }) => (
              <FormItem><FormLabel>Parent's Contact Number (Optional)</FormLabel><FormControl><Input type="tel" placeholder="+91..." {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Enter student's full address" {...field} className="min-h-[80px]" disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="siblingReference" render={({ field }) => (
              <FormItem><FormLabel>Sibling Reference (Optional)</FormLabel><FormControl><Input placeholder="e.g., Sister: Ananya, Class 8B" {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="profilePictureUrl" render={({ field }) => (
              <FormItem><FormLabel>Profile Picture URL (Optional)</FormLabel><FormControl><Input placeholder="https://placehold.co/100x100.png" {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="backgroundInfo" render={({ field }) => (
              <FormItem><FormLabel>Background Info (Optional)</FormLabel><FormControl><Textarea placeholder="Any additional notes or background..." {...field} disabled={isSubmitting || !!generatedCredentials} /></FormControl><FormMessage /></FormItem>
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
               <Button type="button" variant="outline" onClick={() => {
                    form.reset();
                    setGeneratedCredentials(null);
                    onOpenChange(false);
                }} disabled={isSubmitting}>
                  {generatedCredentials ? "Close" : "Cancel"}
                </Button>
              {!generatedCredentials && (
                <Button type="submit" disabled={isSubmitting || noAddableClasses || !!generatedCredentials}>
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
