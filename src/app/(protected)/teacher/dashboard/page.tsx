
import { TeacherStudentManagement } from '@/components/teacher/teacher-student-management';
import { TeacherDataEntry } from '@/components/teacher/teacher-data-entry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Edit3, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TeacherDashboardPage() {
  return (
    <div className="container mx-auto p-0 md:p-4">
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-6">
          <TabsTrigger value="students" className="gap-2"><Users className="h-4 w-4"/>Students</TabsTrigger>
          <TabsTrigger value="dataEntry" className="gap-2"><Edit3 className="h-4 w-4"/>Data Entry</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <TeacherStudentManagement />
        </TabsContent>
        <TabsContent value="dataEntry">
          <TeacherDataEntry />
        </TabsContent>
      </Tabs>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login/teacher">
            <LogIn className="mr-2 h-4 w-4" />
            Back to Login Page
          </Link>
        </Button>
      </div>
    </div>
  );
}

