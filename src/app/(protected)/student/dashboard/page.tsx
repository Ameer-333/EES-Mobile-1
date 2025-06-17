
'use client';

import { StudentProfileCard } from '@/components/student/student-profile-card';
import { StudentRecords } from '@/components/student/student-records';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, LogIn, BarChartHorizontalBig, CalendarCheck } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// UpcomingEventsDisplay removed from here
import { ScholarshipInfoDisplay } from '@/components/student/scholarship-info-display';
import { StudentBackgroundDisplay } from '@/components/student/student-background-display';
import type { Student, StudentRemark, Scholarship, ReligionType, SubjectName } from '@/types';

// Mock data - in a real app, this would be fetched from a central service or context
const mockStudentData: Student = {
  id: 'S12345',
  name: 'Ravi Kumar',
  satsNumber: 'SAT00123',
  class: '10th Grade',
  section: 'A',
  caste: 'General',
  religion: 'Hindu' as ReligionType,
  address: '123 Main Street, Bangalore, Karnataka',
  profilePictureUrl: 'https://placehold.co/150x150/E6E6FA/300130.png?text=RK',
  remarks: [ 
    { id: 'r1', teacherName: 'Ms. Priya Sharma', teacherSubject: 'English' as SubjectName, remark: 'Ravi has shown excellent improvement in English grammar this term. Keep up the great work!', date: '2024-05-15', sentiment: 'good' },
    { id: 'r2', teacherName: 'Mr. Anand Singh', teacherSubject: 'Maths' as SubjectName, remark: 'Needs to focus more during math class to grasp complex concepts.', date: '2024-05-10', sentiment: 'bad' },
  ],
  scholarships: [
    { id: 's1', organisationName: 'National Talent Search Examination (NTSE)', amount: 1250, yearReceived: 2023, details: 'Awarded for academic excellence at the national level.' },
  ],
  backgroundInfo: "Ravi comes from a supportive family background. His father is an engineer and his mother is a homemaker. He has one younger sibling. Ravi enjoys playing cricket and is an active member of the school's science club. He aspires to become a software developer."
};


export default function StudentDashboardPage() {
  const student = mockStudentData;

  return (
    <div className="container mx-auto p-0 md:p-4 space-y-8">
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-headline font-bold">My Dashboard & Activities</h1>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-primary/10">
                <CardHeader className="items-center text-center p-4 bg-primary/5 rounded-t-lg">
                    <Image 
                        src={student.profilePictureUrl || `https://placehold.co/150x150.png?text=${student.name ? student.name.charAt(0) : 'S'}`} 
                        alt={`${student.name || 'Student'}'s Profile Picture`}
                        width={120} 
                        height={120} 
                        className="rounded-full border-4 border-primary/50 shadow-md"
                        data-ai-hint="student portrait" 
                    />
                </CardHeader>
                <CardContent className="text-center p-4">
                    <CardTitle className="text-xl font-headline text-primary mt-2">{student.name}</CardTitle>
                    <p className="text-muted-foreground">{student.class} - Section {student.section}</p>
                </CardContent>
            </Card>
            <StudentProfileCard student={student} /> 
        </div>
        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <CalendarCheck className="mr-2 h-6 w-6" /> Upcoming Events
                    </CardTitle>
                    <CardDescription>Discover school activities, holidays, and important dates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Stay updated with all school events. Check the "Upcoming Events" section in the sidebar for details.
                    </p>
                    <Button asChild>
                        <Link href="/student/events">
                            Go to Upcoming Events
                        </Link>
                    </Button>
                </CardContent>
            </Card>
             <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <BarChartHorizontalBig className="mr-2 h-6 w-6" /> My Remarks
                    </CardTitle>
                    <CardDescription>View detailed feedback from your teachers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Check the "My Remarks" section in the sidebar to see your progress and feedback.
                    </p>
                    <Button asChild>
                        <Link href="/student/remarks">
                            Go to My Remarks
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
       </div>

      <StudentRecords /> 

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScholarshipInfoDisplay scholarships={student.scholarships} studentName={student.name} />
        <StudentBackgroundDisplay backgroundInfo={student.backgroundInfo} />
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
