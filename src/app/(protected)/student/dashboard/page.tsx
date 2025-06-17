
'use client';

import { StudentProfileCard } from '@/components/student/student-profile-card';
import { StudentRecords } from '@/components/student/student-records';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, LogIn, BarChartHorizontalBig, CalendarCheck, Award as AwardIcon, CalendarClock, BookOpen, Edit3, Users, MessageSquareHeart } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StudentBackgroundDisplay } from '@/components/student/student-background-display';
import type { Student, StudentRemark, Scholarship, ReligionType, SubjectName } from '@/types';
import { Separator } from '@/components/ui/separator';

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

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

function ActionCard({ title, description, href, icon: Icon }: ActionCardProps) {
  return (
    <Card className="card-hover-effect flex flex-col group">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-semibold text-primary group-hover:text-primary/90">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full group-hover:border-primary group-hover:text-primary transition-colors">
          <Link href={href}>View {title}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function StudentDashboardPage() {
  const student = mockStudentData;

  return (
    <div className="container mx-auto p-0 md:p-2 space-y-8">
       <div className="mb-8">
         <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-foreground tracking-tight">My Dashboard</h1>
         <p className="text-lg text-muted-foreground">Overview of your academic journey and activities.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <StudentProfileCard student={student} isFullPage={false} /> 
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ActionCard 
              title="Academic Records" 
              description="View your exam marks and overall performance." 
              href="/student/records" 
              icon={BookOpen} 
            />
            <ActionCard 
              title="My Attendance" 
              description="Review your attendance records for all subjects." 
              href="/student/attendance" 
              icon={CalendarClock} 
            />
            <ActionCard 
              title="My Remarks" 
              description="View detailed feedback and remarks from your teachers." 
              href="/student/remarks" 
              icon={MessageSquareHeart} // Changed icon
            />
            <ActionCard 
              title="Upcoming Events" 
              description="Discover school activities, holidays, and important dates." 
              href="/student/events" 
              icon={CalendarCheck} 
            />
            <ActionCard 
              title="My Scholarships" 
              description="View details of scholarships you have received." 
              href="/student/scholarships" 
              icon={AwardIcon} 
            />
        </div>
       </div>
      
      {student.backgroundInfo && (
        <Card className="shadow-lg border-border/70 mt-8">
           <CardHeader>
                <CardTitle className="text-xl font-semibold text-primary">Student Background</CardTitle>
           </CardHeader>
           <CardContent>
             <StudentBackgroundDisplay backgroundInfo={student.backgroundInfo} />
           </CardContent>
        </Card>
      )}


      <div className="mt-10 pt-8 border-t border-border/70 flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline" className="hover:border-primary hover:text-primary">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" className="hover:border-primary hover:text-primary">
          <Link href="/login/student">
            <LogIn className="mr-2 h-4 w-4" />
            Back to Login Page
          </Link>
        </Button>
      </div>
    </div>
  );
}
