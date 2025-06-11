
import { UserManagementTable } from '@/components/admin/user-management-table';
import { Users } from 'lucide-react';

export default function AdminUserManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">User Management</h1>
        <Users className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">
        Manage all user accounts within the EES Education system, including students, teachers, and other administrators.
      </p>
      <UserManagementTable />
    </div>
  );
}
