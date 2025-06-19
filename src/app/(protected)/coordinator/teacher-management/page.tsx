
import { ManageTeacherProfiles } from '@/components/admin/manage-teacher-profiles';
import { TeacherAssignmentView } from '@/components/admin/teacher-assignment-view';
import { Users, Briefcase, ClipboardList } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CoordinatorTeacherManagementPage() {
  // Coordinators can use the same interface as Admins for editing teacher HR profiles.
  // The ManageTeacherProfiles component now has role-based logic for this.
  // The TeacherAssignmentView will also need role-based logic for edit vs. view-only if implemented fully.
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Teacher Management (Coordinator)</h1>
        <Users className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">
        View and edit teacher profiles and manage their assignments. Coordinators cannot add or delete teachers.
      </p>
      
      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profiles" className="gap-2"><Briefcase className="h-4 w-4"/>Teacher Profiles</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2"><ClipboardList className="h-4 w-4"/>Manage Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="profiles">
          <ManageTeacherProfiles />
        </TabsContent>
        <TabsContent value="assignments">
          {/* This view will eventually allow coordinators to edit assignments. For now, it's a placeholder. */}
          {/* In a full implementation, TeacherAssignmentView would need to know the current user's role */}
          {/* to enable/disable editing features, similar to ManageTeacherProfiles. */}
          <TeacherAssignmentView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
