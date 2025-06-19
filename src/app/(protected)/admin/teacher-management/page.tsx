
import { TeacherPayrollManagement } from '@/components/admin/teacher-payroll-management';
import { ManageTeacherProfiles } from '@/components/admin/manage-teacher-profiles';
import { TeacherAssignmentView } from '@/components/admin/teacher-assignment-view'; // New import
import { Users, Briefcase, ClipboardList } from 'lucide-react'; // Added ClipboardList
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AdminTeacherManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Teacher Management</h1>
        <Users className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">
        Manage teacher profiles, payroll, assignments, attendance records, and other administrative tasks related to teachers.
      </p>
      
      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6"> {/* Updated to grid-cols-3 */}
          <TabsTrigger value="profiles" className="gap-2"><Briefcase className="h-4 w-4"/>Teacher Profiles</TabsTrigger>
          <TabsTrigger value="payroll" className="gap-2"><Users className="h-4 w-4"/>Payroll & Attendance</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2"><ClipboardList className="h-4 w-4"/>Assignments</TabsTrigger> {/* New TabTrigger */}
        </TabsList>
        <TabsContent value="profiles">
          <ManageTeacherProfiles />
        </TabsContent>
        <TabsContent value="payroll">
          <TeacherPayrollManagement />
        </TabsContent>
        <TabsContent value="assignments"> {/* New TabsContent */}
          <TeacherAssignmentView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
