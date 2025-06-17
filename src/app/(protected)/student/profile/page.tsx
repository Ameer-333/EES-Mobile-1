
'use client';

import { StudentProfileCard } from '@/components/student/student-profile-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
// ScholarshipInfoDisplay removed
import { StudentBackgroundDisplay } from '@/components/student/student-background-display';
import type { Student, Scholarship, ReligionType, SubjectName } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChartHorizontalBig, CalendarCheck, Award as AwardIcon } from 'lucide-react'; // Added AwardIcon

// Mock data - in a real app, this would be fetched
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
    { id: 'r3', teacherName: 'Ms. Kavita Rao', teacherSubject: 'Science' as SubjectName, remark: 'Submitted a well-researched project on renewable energy.', date: '2024-04-20', sentiment: 'good' },
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
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-headline font-bold">My Profile & Activities</h1>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-primary/10">
                <CardHeader className="items-center text-center p-4 bg-primary/5 rounded-t-lg">
                    <Image 
                        src={student.profilePictureUrl || `https://placehold.co/150x150.png?text=${student.name.charAt(0)}`} 
                        alt={`${student.name}'s Profile Picture`}
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
                        <CalendarCheck className="mr-2 h-6 w-6" /> View Upcoming Events
                    </CardTitle>
                    <CardDescription>Explore all school events, holidays, and important dates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        For a detailed view of all upcoming school activities, please visit the dedicated "Upcoming Events" page from the sidebar.
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
                        <BarChartHorizontalBig className="mr-2 h-6 w-6" /> View My Remarks
                    </CardTitle>
                    <CardDescription>Access all feedback and observations from your teachers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        For a detailed view of your remarks, please visit the dedicated "My Remarks" page from the sidebar.
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
                        <AwardIcon className="mr-2 h-6 w-6" /> View My Scholarships
                    </CardTitle>
                    <CardDescription>Review all scholarships you have been awarded.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        For a detailed list of your scholarships, please visit the dedicated "My Scholarships" page from the sidebar.
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
      <StudentBackgroundDisplay backgroundInfo={student.backgroundInfo} />
    </div>
  );
}
