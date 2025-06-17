
import { StudentProfileCard } from '@/components/student/student-profile-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { StudentRemarksDisplay } from '@/components/student/student-remarks-display';
import { UpcomingEventsDisplay } from '@/components/student/upcoming-events-display';
import { ScholarshipInfoDisplay } from '@/components/student/scholarship-info-display';
import { StudentBackgroundDisplay } from '@/components/student/student-background-display';
import type { Student, StudentRemark, UpcomingEvent, Scholarship, ReligionType } from '@/types';

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
    { id: 'r1', source: 'teacher', authorName: 'Ms. Priya Sharma', remark: 'Ravi has shown excellent improvement in English grammar this term. Keep up the great work!', date: '2024-05-15' },
    { id: 'r2', source: 'parent', authorName: 'Mr. Kumar (Parent)', remark: 'We are very happy with Ravi\'s progress. He is enjoying his science projects.', date: '2024-05-20' },
  ],
  scholarships: [
    { id: 's1', organisationName: 'National Talent Search Examination (NTSE)', amount: 1250, yearReceived: 2023, details: 'Awarded for academic excellence at the national level.' },
  ],
  backgroundInfo: "Ravi comes from a supportive family background. His father is an engineer and his mother is a homemaker. He has one younger sibling. Ravi enjoys playing cricket and is an active member of the school's science club. He aspires to become a software developer."
};

const mockUpcomingEventsData: UpcomingEvent[] = [
  { id: 'e1', name: 'Annual Sports Day', date: '2024-08-15', time: '09:00 AM', day: 'Thursday', description: 'Track and field events, team games.', location: 'School Ground' },
  { id: 'e2', name: 'Science Exhibition', date: '2024-09-05', time: '10:00 AM - 04:00 PM', day: 'Thursday', description: 'Student projects showcase.', location: 'School Auditorium' },
];


export default function StudentProfilePage() {
  // In a real app, student data and events would be fetched here
  const student = mockStudentData;
  const upcomingEvents = mockUpcomingEventsData;

  return (
    <div className="container mx-auto p-0 md:p-4 space-y-8">
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-headline font-bold">My Profile & Activities</h1>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
                <CardHeader className="items-center text-center">
                    <Image 
                        src={student.profilePictureUrl || `https://placehold.co/150x150.png?text=${student.name.charAt(0)}`} 
                        alt={`${student.name}'s Profile Picture`}
                        width={150} 
                        height={150} 
                        className="rounded-full border-4 border-primary shadow-md"
                        data-ai-hint="student portrait" 
                    />
                </CardHeader>
                <CardContent className="text-center">
                    <CardTitle className="text-xl font-headline text-primary mt-2">{student.name}</CardTitle>
                    <p className="text-muted-foreground">{student.class} - Section {student.section}</p>
                </CardContent>
            </Card>
            <StudentProfileCard student={student} />
        </div>
        <div className="lg:col-span-2 space-y-6">
            <StudentRemarksDisplay remarks={student.remarks} />
            <UpcomingEventsDisplay events={upcomingEvents} />
        </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScholarshipInfoDisplay scholarships={student.scholarships} studentName={student.name} />
        <StudentBackgroundDisplay backgroundInfo={student.backgroundInfo} />
      </div>
    </div>
  );
}
