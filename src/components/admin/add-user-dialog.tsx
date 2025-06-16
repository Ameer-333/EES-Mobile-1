
'use client';

import { useState }
from 'react';
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
import { Loader2 } from 'lucide-react';
import { firestore } from '@/lib/firebase'; // Import firestore
import { collection, addDoc } from 'firebase/firestore'; // Import firestore functions
import { useToast } from "@/hooks/use-toast";

const addUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  role: z.custom<UserRole>(val => ['Admin', 'Teacher', 'Student'].includes(val as UserRole), 'Role is required.'),
  // For this prototype, password is not handled here. User creation in Firebase Auth is separate.
  // status will default to 'Pending'
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUserAdded: (newUser: ManagedUser) => void; // This prop might change or be removed if table directly listens to Firestore
}

const USERS_COLLECTION = 'users';

export function AddUserDialog({ isOpen, onOpenChange, onUserAdded }: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    try {
      const newUserProfileData = {
        name: values.name,
        email: values.email,
        role: values.role,
        status: 'Pending' as ManagedUser['status'], // Default status for new users
        lastLogin: 'N/A', // Default last login
      };

      const docRef = await addDoc(collection(firestore, USERS_COLLECTION), newUserProfileData);
      
      // The onSnapshot listener in UserManagementTable will pick up this new user.
      // onUserAdded might still be useful for immediately closing the dialog.
      onUserAdded({ ...newUserProfileData, id: docRef.id }); 
      
      toast({
        title: "User Profile Added",
        description: `${values.name}'s profile has been added to Firestore. Note: Firebase Auth account needs separate creation.`,
      });
      form.reset();
      onOpenChange(false); // Close dialog
    } catch (error) {
      console.error("Error adding user profile to Firestore:", error);
      toast({
        title: "Error Adding User",
        description: "Could not add user profile to Firestore.",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User Profile</DialogTitle>
          <DialogDescription>
            Enter the details for the new user's profile. This will create a record in Firestore.
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
                    <Input placeholder="e.g. John Doe" {...field} disabled={isSubmitting}/>
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g. john.doe@example.com" {...field} disabled={isSubmitting}/>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add User Profile
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
