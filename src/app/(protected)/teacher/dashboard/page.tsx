import { TeacherStudentManagement } from '@/components/teacher/teacher-student-management';
import { TeacherDataEntry } from '@/components/teacher/teacher-data-entry';
import { AiFeedbackGenerator } from '@/components/teacher/ai-feedback-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Edit3, Bot } from 'lucide-react';

export default function TeacherDashboardPage() {
  return (
    <div className="container mx-auto p-0 md:p-4">
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
          <TabsTrigger value="students" className="gap-2"><Users className="h-4 w-4"/>Students</TabsTrigger>
          <TabsTrigger value="dataEntry" className="gap-2"><Edit3 className="h-4 w-4"/>Data Entry</TabsTrigger>
          <TabsTrigger value="aiFeedback" className="gap-2"><Bot className="h-4 w-4"/>AI Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <TeacherStudentManagement />
        </TabsContent>
        <TabsContent value="dataEntry">
          <TeacherDataEntry />
        </TabsContent>
        <TabsContent value="aiFeedback">
          <AiFeedbackGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
