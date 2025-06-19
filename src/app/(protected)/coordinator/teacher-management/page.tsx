
import { ManageTeacherProfiles } from '@/components/admin/manage-teacher-profiles';
import { Users } from 'lucide-react';

export default function CoordinatorTeacherManagementPage() {
  // Coordinators can use the same interface as Admins for adding/editing teacher HR profiles.
  // The ManageTeacherProfiles component already has role-based logic for this.
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Teacher Management (Coordinator)</h1>
        <Users className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">
        View teacher profiles and add new teachers to the system.
      </p>
      <ManageTeacherProfiles />
    </div>
  );
}
