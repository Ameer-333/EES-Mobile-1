
'use client';

import { StudentProfileCard } from '@/components/student/student-profile-card';
// StudentRecords component is now focused on Marks, so its name is still appropriate here.
import { StudentRecords } from '@/components/student/student-records';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, LogIn, BarChartHorizontalBig, CalendarCheck, Award as AwardIcon, CalendarClock } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StudentBackgroundDisplay } from '@/components/student/student-background-display';
import type { Student, StudentRemark, Scholarship, ReligionType, SubjectName } from '@/types';

// Mock data - in a real app, this would be fetched from a central service or context
// Updated mock data to include fields expected by the enhanced StudentProfileCard
const mockStudentData: Student = {
  id: 'S12345',
  name: 'Ravi Kumar Sharma',
  satsNumber: 'SAT00123',
  class: '10th Grade',
  section: 'A',
  dateOfBirth: '2008-07-15',
  fatherName: 'Rajesh Kumar Sharma',
  motherName: 'Sunita Sharma',
  fatherOccupation: 'Software Engineer',
  motherOccupation: 'Teacher',
  parentsAnnualIncome: 1200000,
  parentContactNumber: '+91 9876543210',
  email: 'ravi.sharma.student@ees.ac.in',
  caste: 'Brahmin',
  religion: 'Hindu' as ReligionType,
  address: '123, Vidyanagar, Silicon City, Bangalore, Karnataka - 560001',
  siblingReference: 'Sister: Priya Sharma, Class 8B',
  profilePictureUrl: 'https://placehold.co/150x150/E6E6FA/300130.png?text=RS',
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
            {/* Simplified profile card for dashboard, full details on profile page */}
            <StudentProfileCard student={student} isFullPage={false} /> 
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
             <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <CalendarClock className="mr-2 h-6 w-6" /> My Attendance
                    </CardTitle>
                    <CardDescription>Review your attendance records for all subjects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Monitor your attendance in the "My Attendance" section.
                    </p>
                    <Button asChild>
                        <Link href="/student/attendance">
                            Go to My Attendance
                        </Link>
                    </Button>
                </CardContent>
            </Card>
             <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <AwardIcon className="mr-2 h-6 w-6" /> My Scholarships
                    </CardTitle>
                    <CardDescription>View details of scholarships you have received.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Explore your scholarship achievements in the dedicated "My Scholarships" section.
                    </p>
                    <Button asChild>
                        <Link href="/student/scholarships">
                            Go to My Scholarships
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
       </div>

      <StudentRecords /> 
      {student.backgroundInfo && <StudentBackgroundDisplay backgroundInfo={student.backgroundInfo} />}

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
