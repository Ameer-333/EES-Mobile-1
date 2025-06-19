
import { ManageTeacherProfiles } from '@/components/admin/manage-teacher-profiles';
import { TeacherAssignmentView } from '@/components/admin/teacher-assignment-view';
import { RequestTeacherAppraisalForm } from '@/components/coordinator/request-teacher-appraisal-form'; // New Import
import { Users, Briefcase, ClipboardList, TrendingUp } from 'lucide-react'; // Added TrendingUp
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CoordinatorTeacherManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Teacher Management (Coordinator)</h1>
        <Users className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">
        View and edit teacher profiles, manage their assignments, and request salary appraisals. Coordinators cannot add, delete, or manage payroll for teachers.
      </p>
      
      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profiles" className="gap-2"><Briefcase className="h-4 w-4"/>Teacher Profiles</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2"><ClipboardList className="h-4 w-4"/>Manage Assignments</TabsTrigger>
          <TabsTrigger value="appraisals" className="gap-2"><TrendingUp className="h-4 w-4"/>Request Appraisal</TabsTrigger>
        </TabsList>
        <TabsContent value="profiles">
          <ManageTeacherProfiles />
        </TabsContent>
        <TabsContent value="assignments">
          <TeacherAssignmentView />
        </TabsContent>
        <TabsContent value="appraisals">
          <RequestTeacherAppraisalForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

