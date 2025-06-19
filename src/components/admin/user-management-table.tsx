
'use client';

import type { UserRole, ManagedUser } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Search, UserPlus, Trash2, ShieldCheck, School, User, Loader2, Users as UsersIcon } from 'lucide-react'; // Changed ClipboardUser to UsersIcon
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
import { EditUserDialog } from '@/components/admin/edit-user-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { firestore } from '@/lib/firebase';
import { collection, deleteDoc, doc, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { getUsersCollectionPath, getUserDocPath } from '@/lib/firestore-paths';

const roleIcons: Record<UserRole, React.ElementType> = {
  Admin: ShieldCheck,
  Teacher: School,
  Student: User,
  Coordinator: UsersIcon, // Changed from ClipboardUser
};

export function UserManagementTable() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState<ManagedUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const usersCollectionPath = getUsersCollectionPath();
    const usersCollectionRef = collection(firestore, usersCollectionPath);
    
    const unsubscribe = onSnapshot(usersCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const fetchedUsers = snapshot.docs.map(docSnap => ({ 
        id: docSnap.id,
        ...docSnap.data(),
      } as ManagedUser));
      setUsers(fetchedUsers);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching users from Firestore:", error);
      toast({
        title: "Error Loading Users",
        description: "Could not fetch user data from Firestore.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []); 

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        ((user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
         (user.id || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
        (roleFilter === 'All' || user.role === roleFilter)
    );
  }, [users, searchTerm, roleFilter]);

  const handleOpenEditDialog = (user: ManagedUser) => {
    setCurrentUserToEdit(user);
    setIsEditUserDialogOpen(true);
  };
  
  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const userDocPath = getUserDocPath(userId);
      const userDocRef = doc(firestore, userDocPath);
      await deleteDoc(userDocRef);
      toast({ title: "User Deleted", description: `User ${userName} has been removed.` });
    } catch (error) {
      console.error("Error deleting user from Firestore:", error);
      toast({
        title: "Deletion Failed",
        description: "Could not delete user from Firestore.",
        variant: "destructive",
      });
    }
  };

  const handleUserAdded = (newUser: ManagedUser) => {
    // Dialog will manage its own closing after displaying credentials.
    // The onSnapshot listener will update the table.
    // console.log("User added in parent:", newUser);
  };

  const handleUserEdited = (editedUser: ManagedUser) => {
    // The onSnapshot listener will update the table.
    setIsEditUserDialogOpen(false);
  };
  
  if (isLoading) {
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
                     <TableCell colSpan={7} className="p-4">
                        <div className="flex items-center justify-center">
                           <Loader2 className="h-6 w-6 animate-spin text-primary" />
                           <span className="ml-2">Loading users...</span>
                        </div>
                     </TableCell>
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
              <CardDescription>View, search, and manage all system users from Firestore.</CardDescription>
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
                <SelectItem value="Coordinator">Coordinator</SelectItem>
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
                    <TableCell className="font-medium truncate max-w-[100px]">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin' || user.role === 'Coordinator' ? 'default' : 'secondary'} className="capitalize flex items-center gap-1">
                        {RoleIcon && <RoleIcon className="h-3.5 w-3.5" />}
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
                          <Button variant="destructive" size="sm" disabled={user.role === 'Admin' && users.filter(u => u.role === 'Admin').length <= 1 && user.id === users.find(u => u.role === 'Admin')?.id}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user profile for <strong>{user.name} ({user.email})</strong> from Firestore. This does not delete their authentication account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id, user.name || 'this user')}>
                              Yes, delete user profile
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )}) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      No users found matching your criteria or no users in Firestore.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length > 0 && (
            <div className="mt-4 text-right text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} total users from Firestore.
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

