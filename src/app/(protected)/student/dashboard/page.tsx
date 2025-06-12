
import { StudentProfileCard } from '@/components/student/student-profile-card';
import { StudentRecords } from '@/components/student/student-records';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, LogIn } from 'lucide-react';

export default function StudentDashboardPage() {
  // In a real app, student data would be fetched here
  // const student = await getStudentData(); 

  return (
    <div className="container mx-auto p-0 md:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <StudentProfileCard />
          <StudentRecords />
        </div>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login/student">
            <LogIn className="mr-2 h-4 w-4" />
            Back to Login Page
          </Link>
        </Button>
      </div>
    </div>
  );
}
