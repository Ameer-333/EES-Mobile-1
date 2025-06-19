
import { CoordinatorStudentView } from '@/components/coordinator/coordinator-student-view';
import { Users } from 'lucide-react';

export default function CoordinatorStudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">All Student Management</h1>
        <Users className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">
        View and manage records for all students across the system.
      </p>
      <CoordinatorStudentView />
    </div>
  );
}
