
'use client';

import { StudentRemarksDisplay } from '@/components/student/student-remarks-display';
import type { Student, StudentRemark, ReligionType, SubjectName } from '@/types'; // Import necessary types

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
  remarks: [
    { id: 'r1', teacherName: 'Ms. Priya Sharma', teacherSubject: 'English' as SubjectName, remark: 'Ravi has shown excellent improvement in English grammar this term. Keep up the great work!', date: '2024-05-15', sentiment: 'good' },
    { id: 'r2', teacherName: 'Mr. Anand Singh', teacherSubject: 'Maths' as SubjectName, remark: 'Needs to focus more during math class to grasp complex concepts.', date: '2024-05-10', sentiment: 'bad' },
    { id: 'r3', teacherName: 'Ms. Kavita Rao', teacherSubject: 'Science' as SubjectName, remark: 'Submitted a well-researched project on renewable energy.', date: '2024-04-20', sentiment: 'good' },
    { id: 'r4', teacherName: 'Ms. Priya Sharma', teacherSubject: 'English' as SubjectName, remark: 'Participation in class discussions is satisfactory.', date: '2024-04-25', sentiment: 'neutral' },
    { id: 'r5', teacherName: 'Mr. Anand Singh', teacherSubject: 'Maths' as SubjectName, remark: 'Struggled with the recent algebra test. Recommended extra practice.', date: '2024-06-01', sentiment: 'bad' },
    { id: 'r6', teacherName: 'Ms. Kavita Rao', teacherSubject: 'Science' as SubjectName, remark: 'Actively participates in lab experiments and shows curiosity.', date: '2024-06-05', sentiment: 'good' },
  ],
  scholarships: [
    { id: 's1', organisationName: 'National Talent Search Examination (NTSE)', amount: 1250, yearReceived: 2023, details: 'Awarded for academic excellence at the national level.' },
  ],
  backgroundInfo: "Ravi comes from a supportive family background. His father is an engineer and his mother is a homemaker. He has one younger sibling. Ravi enjoys playing cricket and is an active member of the school's science club. He aspires to become a software developer."
};

export default function StudentRemarksPage() {
  // In a real app, student data (especially remarks) would be fetched here
  const student = mockStudentData;

  return (
    <div className="container mx-auto p-0 md:p-4 space-y-6">
      {/* Header for the page could be added in ProtectedLayout or here if specific */}
      {/* <h1 className="text-3xl font-headline font-bold">My Remarks</h1> */}
      <StudentRemarksDisplay remarks={student.remarks} />
    </div>
  );
}
