
'use client';

import { ScholarshipInfoDisplay } from '@/components/student/scholarship-info-display';
import type { Student, Scholarship, ReligionType, SubjectName } from '@/types';
import { Award } from 'lucide-react';

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
    { id: 'r1', teacherName: 'Ms. Priya Sharma', teacherSubject: 'English' as SubjectName, remark: 'Excellent improvement!', date: '2024-05-15', sentiment: 'good' },
  ],
  scholarships: [
    { id: 's1', organisationName: 'National Talent Search Examination (NTSE)', amount: 1250, yearReceived: 2023, details: 'Awarded for academic excellence at the national level. This prestigious scholarship recognizes outstanding talent and provides monthly financial support.' },
    { id: 's2', organisationName: 'State Merit Scholarship', amount: 5000, yearReceived: 2022, details: 'For topping the district in 8th grade examinations. A one-time award celebrating academic achievement within the state.' },
    { id: 's3', organisationName: 'Tech Innovators Grant', amount: 25000, yearReceived: 2023, details: 'Awarded for a promising project in the inter-school science and technology fair. Supports further development of the innovation.' },
    { id: 's4', organisationName: 'Young Artist Award', amount: 10000, yearReceived: 2021, details: 'Recognized for exceptional talent in visual arts at the state level competition.' },
  ],
  backgroundInfo: "Loves coding and cricket."
};

export default function StudentScholarshipsPage() {
  const student = mockStudentData; // In a real app, fetch student data here

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-primary/20 pb-4">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary flex items-center">
          <Award className="mr-3 h-8 w-8 md:h-10 md:w-10" /> My Scholarships
        </h1>
        <p className="text-muted-foreground mt-2 sm:mt-0 text-sm sm:text-base">
          Details of all scholarships awarded to {student.name}.
        </p>
      </div>
      
      <ScholarshipInfoDisplay 
        scholarships={student.scholarships} 
        studentName={student.name}
        isDedicatedPage={true}
      />
    </div>
  );
}
