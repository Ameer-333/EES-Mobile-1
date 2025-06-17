
'use client';

import { StudentAttendanceDisplay } from '@/components/student/student-attendance-display';
import type { Student, StudentSubjectAttendance, ReligionType, SubjectName } from '@/types'; // Import necessary types
import { CalendarClock } from 'lucide-react';

// Mock data - in a real app, this would be fetched based on the logged-in student
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
  remarks: [],
  scholarships: [],
  backgroundInfo: "Loves coding and cricket."
};

const mockAttendanceData: StudentSubjectAttendance[] = [
  { subjectName: 'English', totalClasses: 60, attendedClasses: 55, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Kannada', totalClasses: 50, attendedClasses: 48, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Hindi', totalClasses: 45, attendedClasses: 40, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Science', totalClasses: 70, attendedClasses: 68, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Maths', totalClasses: 75, attendedClasses: 75, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Social Science', totalClasses: 55, attendedClasses: 50, records: [{date: '2023-10-01', status: 'Present'}] },
];

export default function StudentAttendancePage() {
  // In a real app, student data (especially attendance) would be fetched here
  const student = mockStudentData;
  const attendance = mockAttendanceData; // For now, using direct mock data

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-primary/20 pb-4">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary flex items-center">
          <CalendarClock className="mr-3 h-8 w-8 md:h-10 md:w-10" /> My Attendance
        </h1>
        <p className="text-muted-foreground mt-2 sm:mt-0 text-sm sm:text-base">
          Your attendance records for all subjects.
        </p>
      </div>
      <StudentAttendanceDisplay 
        attendance={attendance}
        studentName={student.name} 
      />
    </div>
  );
}
