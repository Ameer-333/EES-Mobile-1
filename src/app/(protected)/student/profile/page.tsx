
'use client';

import { StudentProfileCard } from '@/components/student/student-profile-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StudentBackgroundDisplay } from '@/components/student/student-background-display';
import type { Student, Scholarship, ReligionType, SubjectName } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChartHorizontalBig, CalendarCheck, Award as AwardIcon, CalendarClock, UserCircle2 } from 'lucide-react';

// Mock data - updated with new fields
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


export default function StudentProfilePage() {
  const student = mockStudentData;

  return (
    <div className="container mx-auto p-0 md:p-4 space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-primary/20 pb-4">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary flex items-center">
          <UserCircle2 className="mr-3 h-8 w-8 md:h-10 md:w-10" /> My Complete Profile
        </h1>
        <p className="text-muted-foreground mt-2 sm:mt-0 text-sm sm:text-base">
          Your comprehensive student information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Card - takes up more space on larger screens */}
        <div className="lg:col-span-2">
            <StudentProfileCard student={student} isFullPage={true} />
        </div>

        {/* Sidebar for other links */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <CalendarCheck className="mr-2 h-6 w-6" /> View Upcoming Events
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Explore all school events, holidays, and important dates.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/student/events">
                            Go to Upcoming Events
                        </Link>
                    </Button>
                </CardContent>
            </Card>
             <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <BarChartHorizontalBig className="mr-2 h-6 w-6" /> View My Remarks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Access all feedback and observations from your teachers.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/student/remarks">
                            Go to My Remarks
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <CalendarClock className="mr-2 h-6 w-6" /> View My Attendance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Review your attendance records for all subjects.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/student/attendance">
                            Go to My Attendance
                        </Link>
                    </Button>
                </CardContent>
            </Card>
             <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <AwardIcon className="mr-2 h-6 w-6" /> View My Scholarships
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Review all scholarships you have been awarded.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/student/scholarships">
                            Go to My Scholarships
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
       </div>
      {student.backgroundInfo && <StudentBackgroundDisplay backgroundInfo={student.backgroundInfo} />}
    </div>
  );
}
