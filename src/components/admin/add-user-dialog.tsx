
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { UserRole, ManagedUser } from '@/types';
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
import { firestore, auth as firebaseAuth } from '@/lib/firebase'; // Import firebaseAuth
import { doc, setDoc } from 'firebase/firestore'; // Import setDoc
import { createUserWithEmailAndPassword, type FirebaseError } from 'firebase/auth'; // Import createUserWithEmailAndPassword and FirebaseError
import { useToast } from "@/hooks/use-toast";
import { getUsersCollectionPath } from '@/lib/firestore-paths';
import { Card, CardHeader as UICardHeader, CardContent as UICardContent, CardTitle as UICardTitle } from '@/components/ui/card';

const addUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'This email will be used for login. Ensure it is unique.' }),
  role: z.custom<UserRole>(val => ['Admin', 'Teacher', 'Student', 'Coordinator'].includes(val as UserRole), 'Role is required.'),
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
      role: 'Student', // Default role
    },
  });

  async function onSubmit(values: AddUserFormValues) {
    setIsSubmitting(true);
    setGeneratedCredentials(null);

    const loginEmail = values.email;
    const roleNameCapitalized = values.role.charAt(0).toUpperCase() + values.role.slice(1);
    const defaultPassword = `${roleNameCapitalized}Default@${new Date().getFullYear()}`;

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, loginEmail, defaultPassword);
      const authUid = userCredential.user.uid;

      // 2. Prepare Firestore data
      const newUserFirestoreData: ManagedUser = {
        id: authUid, // Ensure Firestore document ID and 'id' field match Auth UID
        name: values.name,
        email: loginEmail,
        role: values.role,
        status: 'Active',
        lastLogin: 'N/A',
        classId: values.role === 'Student' ? 'TO_BE_ASSIGNED' : undefined,
        studentProfileId: values.role === 'Student' ? 'TO_BE_ASSIGNED' : undefined,
        assignments: values.role === 'Teacher' ? [] : undefined,
      };

      // 3. Save user profile to Firestore, using authUid as document ID
      const usersCollectionPath = getUsersCollectionPath();
      const userDocRef = doc(firestore, usersCollectionPath, authUid);
      await setDoc(userDocRef, newUserFirestoreData);
      
      onUserAdded(newUserFirestoreData); 
      setGeneratedCredentials({ email: loginEmail, password: defaultPassword });
      
      // Simplified toast message
      toast({
        title: "User Account Created!",
        description: (
          <div>
            <p>Account for {values.name} ({values.role}) created.</p>
            <p className="mt-2"><strong>Login Email:</strong> {loginEmail}</p>
            <p><strong>Default Password:</strong> {defaultPassword}</p>
            <p className="text-xs mt-1 text-destructive">Advise user to change password on first login.</p>
          </div>
        ),
        duration: 20000,
      });
      
    } catch (error: any) {
      console.error("Error adding user or creating auth account:", error);
      let errMsg = "Could not create user account. Please check the console for more details.";
      if (error instanceof FirebaseError) { // More specific Firebase error check
        switch (error.code) {
          case 'auth/email-already-in-use':
            errMsg = `The email ${loginEmail} is already in use. Please use a different email.`;
            break;
          case 'auth/weak-password':
            errMsg = "The auto-generated password is too weak (this is a system issue). Please contact support.";
            break;
          case 'auth/invalid-email':
            errMsg = `The email ${loginEmail} is not valid. Please check and try again.`;
            break;
          default:
            errMsg = `Firebase Auth Error: ${error.message} (Code: ${error.code})`;
            break;
        }
      } else if (error.message) {
        errMsg = error.message;
      }
      toast({
        title: "Error Adding User",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCloseDialog = () => {
    if (!isSubmitting) { // Only allow close if not submitting
        form.reset();
        setGeneratedCredentials(null);
        onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User Account</DialogTitle>
          <DialogDescription>
            Enter details to create a Firestore profile and a Firebase Authentication login.
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
                      <SelectItem value="Admin">Admin</SelectItem>
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

