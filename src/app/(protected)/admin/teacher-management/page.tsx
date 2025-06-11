
import { TeacherPayrollManagement } from '@/components/admin/teacher-payroll-management';
import { Users } from 'lucide-react';

export default function AdminTeacherManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Teacher Management</h1>
        <Users className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">
        Manage teacher profiles, payroll, and attendance records.
      </p>
      <TeacherPayrollManagement />
      {/* Future: Add component for managing teacher profiles (edit name, address etc.) */}
    </div>
  );
}
