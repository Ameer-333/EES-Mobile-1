
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { UserRole, ManagedUser, Teacher } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Info } from 'lucide-react';
import { firestore, auth as firebaseAuth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser, type User as FirebaseAuthUser } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useToast } from "@/hooks/use-toast";
import { getUsersCollectionPath, getTeacherDocPath } from '@/lib/firestore-paths';
import { Card, CardHeader as UICardHeader, CardContent as UICardContent, CardTitle as UICardTitle } from '@/components/ui/card';

const addUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'This email will be used for login. Ensure it is unique.' }),
  role: z.custom<UserRole>(val => ['Teacher', 'Student', 'Coordinator'].includes(val as UserRole), 'Role is required. Admin role cannot be created here.'),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUserAdded: (newUser: ManagedUser) => void;
}

export function AddUserDialog({ isOpen, onOpenChange, onUserAdded }: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{email: string, password: string} | null>(null);
  const { toast } = useToast();

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Student',
    },
  });

  async function onSubmit(values: AddUserFormValues) {
    setIsSubmitting(true);
    setGeneratedCredentials(null);

    const loginEmail = values.email;
    const roleNameCapitalized = values.role.charAt(0).toUpperCase() + values.role.slice(1);
    const defaultPassword = `${roleNameCapitalized}Default@${new Date().getFullYear()}`;
    let firebaseAuthUser: FirebaseAuthUser | null = null;
    let userDocCreated = false;
    let teacherDocCreated = false;

    try {
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, loginEmail, defaultPassword);
      firebaseAuthUser = userCredential.user;
      const authUid = firebaseAuthUser.uid;

      // Step 2: Create Firestore document in /users collection
      const newUserFirestoreData: Partial<ManagedUser> = {
        id: authUid,
        name: values.name,
        email: loginEmail,
        role: values.role,
        status: 'Active',
        lastLogin: 'N/A',
      };

      if (values.role === 'Student') {
        newUserFirestoreData.classId = 'TO_BE_ASSIGNED';
        newUserFirestoreData.studentProfileId = 'TO_BE_ASSIGNED';
      }
      if (values.role === 'Teacher') {
        newUserFirestoreData.assignments = [];
      }
      
      const usersCollectionPath = getUsersCollectionPath();
      const userDocRef = doc(firestore, usersCollectionPath, authUid);
      await setDoc(userDocRef, newUserFirestoreData);
      userDocCreated = true;
      
      let additionalActionsMessage = `User account for ${values.name} (${values.role}) created.`;

      // Step 3: If role is Teacher, create document in /teachers collection
      if (values.role === 'Teacher') {
        const teacherHRProfile: Partial<Teacher> = {
          id: authUid,
          authUid: authUid,
          name: values.name,
          email: loginEmail,
          phoneNumber: "", 
          address: "",     
          yearOfJoining: new Date().getFullYear(),
          subjectsTaught: [],
          salaryHistory: [],
          currentAppraisalStatus: 'No Active Appraisal',
        };
        const teacherDocFirestorePath = getTeacherDocPath(authUid);
        await setDoc(doc(firestore, teacherDocFirestorePath), teacherHRProfile);
        teacherDocCreated = true;
        additionalActionsMessage += " Basic teacher HR profile also created.";
      }
      
      onUserAdded(newUserFirestoreData as ManagedUser); 
      setGeneratedCredentials({ email: loginEmail, password: defaultPassword });
      
      toast({
        title: "User Account Created!",
        description: (
          React.createElement('div', null,
            React.createElement('p', null, additionalActionsMessage),
            React.createElement('p', {className: "mt-2"}, React.createElement('strong', null, "Login Email: "), loginEmail),
            React.createElement('p', null, React.createElement('strong', null, "Default Password: "), defaultPassword),
            React.createElement('p', {className: "text-xs mt-1 text-destructive"}, "Advise user to change password on first login.")
          )
        ),
        duration: 20000,
      });
      
    } catch (error: any) {
      console.error("Error adding user or creating auth account:", error);
      let errMsg = "Could not create user account. Please check the console for more details.";
      if (error instanceof FirebaseError) { 
        switch (error.code) {
          case 'auth/email-already-in-use':
            errMsg = `The email ${loginEmail} is already in use. Please use a different email.`;
            firebaseAuthUser = null; // Auth user creation failed, no rollback needed for auth user
            break;
          case 'auth/weak-password':
            errMsg = "The auto-generated password is too weak (this is a system issue). Please contact support.";
            firebaseAuthUser = null;
            break;
          case 'auth/invalid-email':
            errMsg = `The email ${loginEmail} is not valid. Please check and try again.`;
            firebaseAuthUser = null;
            break;
          default:
            errMsg = `Firebase Auth Error: ${error.message} (Code: ${error.code})`;
            // If firebaseAuthUser is set, it means Auth user was created but a subsequent Firestore write failed.
            break;
        }
      } else if (error.message) {
        errMsg = error.message;
      }

      // Rollback: If Firebase Auth user was created but Firestore operations failed
      if (firebaseAuthUser && (!userDocCreated || (values.role === 'Teacher' && !teacherDocCreated))) {
        try {
          await deleteUser(firebaseAuthUser);
          errMsg += " Firebase Auth user creation was rolled back.";
          toast({
            title: "User Creation Failed (Rolled Back)",
            description: errMsg,
            variant: "destructive",
            duration: 10000,
          });
        } catch (rollbackError: any) {
          console.error("Error rolling back Firebase Auth user:", rollbackError);
          errMsg += " Failed to roll back Firebase Auth user. Please check Firebase console.";
           toast({
            title: "User Creation Failed (Rollback Failed)",
            description: errMsg,
            variant: "destructive",
            duration: 15000,
          });
        }
      } else if (!firebaseAuthUser) { // Auth creation itself failed
        toast({
          title: "Error Adding User",
          description: errMsg,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCloseDialog = () => {
    if (!isSubmitting) {
        form.reset();
        setGeneratedCredentials(null);
        onOpenChange(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setGeneratedCredentials(null);
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User Account</DialogTitle>
          <DialogDescription>
            Enter details to create a Firestore profile and a Firebase Authentication login. Admins must be created manually in Firebase console.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} disabled={isSubmitting || !!generatedCredentials}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g. john.doe@example.com" {...field} disabled={isSubmitting || !!generatedCredentials}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting || !!generatedCredentials}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Coordinator">Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {generatedCredentials && (
              <Card className="mt-4 p-4 border-green-500 bg-green-50/80 rounded-md text-sm shadow-md">
                <UICardHeader className='p-0 pb-2'>
                  <UICardTitle className="text-md font-semibold text-green-700 flex items-center"><Info className="h-5 w-5 mr-2"/>Credentials Generated</UICardTitle>
                </UICardHeader>
                <UICardContent className='p-0'>
                  <p><span className="font-medium">Login Email:</span> {generatedCredentials.email}</p>
                  <p><span className="font-medium">Default Password:</span> {generatedCredentials.password}</p>
                  <p className="text-xs mt-1 text-destructive">Advise user to change password on first login.</p>
                </UICardContent>
              </Card>
            )}

            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                  {generatedCredentials ? "Close" : "Cancel"}
                </Button>
              {!generatedCredentials && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create User Account
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
    
