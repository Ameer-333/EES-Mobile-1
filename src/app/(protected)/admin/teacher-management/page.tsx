
import { TeacherPayrollManagement } from '@/components/admin/teacher-payroll-management';
import { ManageTeacherProfiles } from '@/components/admin/manage-teacher-profiles'; // New import
import { Users, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AdminTeacherManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Teacher Management</h1>
        <Users className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">
        Manage teacher profiles, payroll, attendance records, and other administrative tasks related to teachers.
      </p>
      
      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profiles" className="gap-2"><Briefcase className="h-4 w-4"/>Teacher Profiles</TabsTrigger>
          <TabsTrigger value="payroll" className="gap-2"><Users className="h-4 w-4"/>Payroll & Attendance</TabsTrigger>
        </TabsList>
        <TabsContent value="profiles">
          <ManageTeacherProfiles />
        </TabsContent>
        <TabsContent value="payroll">
          <TeacherPayrollManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
