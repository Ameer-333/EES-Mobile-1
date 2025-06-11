
'use client';

import type { UserRole, ManagedUser } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Search, UserPlus, Trash2, ShieldCheck, School, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // Added import here
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddUserDialog } from '@/components/admin/add-user-dialog';
import { EditUserDialog } from '@/components/admin/edit-user-dialog'; // Import EditUserDialog
import { Skeleton } from '@/components/ui/skeleton';


const mockUsers: ManagedUser[] = [
  { id: 'U001', name: 'Admin User', email: 'admin@ees.com', role: 'Admin', status: 'Active', lastLogin: '2024-07-28' },
  { id: 'U002', name: 'Primary Teacher', email: 'teacher1@ees.com', role: 'Teacher', status: 'Active', lastLogin: '2024-07-27' },
  { id: 'U003', name: 'Ravi Kumar', email: 'ravi.k@example.com', role: 'Student', status: 'Active', lastLogin: '2024-07-28' },
  { id: 'U004', name: 'Secondary Teacher', email: 'teacher2@ees.com', role: 'Teacher', status: 'Inactive', lastLogin: '2024-06-15' },
  { id: 'U005', name: 'Priya Sharma', email: 'priya.s@example.com', role: 'Student', status: 'Pending', lastLogin: 'N/A' },
  { id: 'U006', name: 'Anil Yadav', email: 'anil.y@example.com', role: 'Student', status: 'Active', lastLogin: '2024-07-25' },
];

const roleIcons: Record<UserRole, React.ElementType> = {
  Admin: ShieldCheck,
  Teacher: School,
  Student: User,
};

export function UserManagementTable() {
  const [users, setUsers] = useState<ManagedUser[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false); // State for edit dialog
  const [currentUserToEdit, setCurrentUserToEdit] = useState<ManagedUser | null>(null); // State for user being edited
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (roleFilter === 'All' || user.role === roleFilter)
    );
  }, [users, searchTerm, roleFilter]);

  const handleOpenEditDialog = (user: ManagedUser) => {
    setCurrentUserToEdit(user);
    setIsEditUserDialogOpen(true);
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: "User Deleted", description: `User with ID: ${userId} has been removed.` });
  };

  const handleUserAdded = (newUser: ManagedUser) => {
    setUsers(prevUsers => [newUser, ...prevUsers]); // Add to the beginning of the list
    toast({
      title: "User Added Successfully",
      description: `${newUser.name} (${newUser.role}) has been added to the system.`,
    });
  };

  const handleUserEdited = (editedUser: ManagedUser) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === editedUser.id ? editedUser : user));
    // Toast is handled within EditUserDialog
  };

  if (!hasMounted) {
    return (
      <Card className="w-full shadow-xl rounded-lg border-primary/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-full md:w-[180px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array(7).fill(0).map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(7).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full shadow-xl rounded-lg border-primary/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-headline text-primary">All Users</CardTitle>
              <CardDescription>View, search, and manage all system users.</CardDescription>
            </div>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAddUserDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Add New User
            </Button>
          </div>
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'All')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                  const RoleIcon = roleIcons[user.role];
                  return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'} className="capitalize flex items-center gap-1">
                        <RoleIcon className="h-3.5 w-3.5" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === 'Active' ? 'outline' : user.status === 'Pending' ? 'default': 'destructive'}
                        className={
                            user.status === 'Active' ? 'border-green-500 text-green-600 bg-green-500/10' : 
                            user.status === 'Pending' ? 'border-yellow-500 text-yellow-600 bg-yellow-500/10' : 
                            'border-red-500 text-red-600 bg-red-500/10'}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(user)} className="hover:border-primary hover:text-primary">
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={user.role === 'Admin' && users.filter(u => u.role === 'Admin').length <= 1}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user account for <strong>{user.name} ({user.email})</strong> and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                              Yes, delete user
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )}) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      No users found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length > 0 && (
            <div className="mt-4 text-right text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} total users.
            </div>
          )}
        </CardContent>
      </Card>
      <AddUserDialog 
        isOpen={isAddUserDialogOpen} 
        onOpenChange={setIsAddUserDialogOpen}
        onUserAdded={handleUserAdded}
      />
      <EditUserDialog
        isOpen={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
        onUserEdited={handleUserEdited}
        userToEdit={currentUserToEdit}
      />
    </>
  );
}
