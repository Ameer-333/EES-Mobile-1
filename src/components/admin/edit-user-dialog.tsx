
'use client';

import { useEffect, useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase'; // Import firestore
import { doc, updateDoc, setDoc } from 'firebase/firestore'; // Import firestore functions

const editUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  // Role is typically not easily editable or has specific logic.
  // For simplicity, we'll allow editing it here, but in a real system, this might be restricted.
  role: z.custom<UserRole>(val => ['Admin', 'Teacher', 'Student'].includes(val as UserRole), 'Role is required.'),
  status: z.enum(['Active', 'Inactive', 'Pending'], { required_error: "Status is required."}),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUserEdited: (editedUser: ManagedUser) => void; // This prop might change or be removed
  userToEdit: ManagedUser | null;
}

const USERS_COLLECTION = 'users';

export function EditUserDialog({ isOpen, onOpenChange, onUserEdited, userToEdit }: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
  });

  useEffect(() => {
    if (userToEdit && isOpen) {
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        status: userToEdit.status,
      });
    }
  }, [userToEdit, isOpen, form]);

  async function onSubmit(values: EditUserFormValues) {
    if (!userToEdit) return;

    setIsSubmitting(true);
    try {
      const userDocRef = doc(firestore, USERS_COLLECTION, userToEdit.id);
      
      const updatedUserProfileData = {
        name: values.name,
        email: values.email,
        role: values.role, // Include role in update
        status: values.status,
        lastLogin: userToEdit.lastLogin, // Preserve lastLogin unless explicitly changed
      };

      await setDoc(userDocRef, updatedUserProfileData, { merge: true }); // Use setDoc with merge to update or create if somehow deleted
      
      // The onSnapshot listener in UserManagementTable will pick up this change.
      onUserEdited({ ...updatedUserProfileData, id: userToEdit.id });

      toast({
        title: "User Profile Updated",
        description: `${values.name}'s profile has been successfully updated in Firestore.`,
      });
      onOpenChange(false); // Close dialog
    } catch (error) {
      console.error("Error updating user profile in Firestore:", error);
      toast({
        title: "Update Failed",
        description: "Could not update user profile in Firestore.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!userToEdit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) form.reset(); 
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Profile: {userToEdit.name}</DialogTitle>
          <DialogDescription>
            Modify the user's profile details below.
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
                    <Input placeholder="e.g. John Doe" {...field} disabled={isSubmitting} />
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
             <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
