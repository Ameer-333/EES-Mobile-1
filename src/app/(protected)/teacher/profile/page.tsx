
import { TeacherProfileDetails } from '@/components/teacher/teacher-profile-details';
import { TeacherSalaryView } from '@/components/teacher/teacher-salary-view';
import type { Teacher, TeacherSalaryRecord } from '@/types';
import { User } from 'lucide-react';

// Mock data for demonstration
const mockTeacherData: Teacher = {
  id: 'T001',
  name: 'Priya Sharma',
  email: 'priya.sharma@ees.com',
  phoneNumber: '+91 98765 43210',
  address: '456 Park Avenue, Bangalore, Karnataka',
  yearOfJoining: 2018,
  totalYearsWorked: 6, // Assuming current year is 2024
  subjectsTaught: ['English', 'Social Science'],
  profilePictureUrl: 'https://placehold.co/150x150.png',
  salaryHistory: [
    { id: 'sal1', monthYear: 'June 2024', dateIssued: '2024-07-01', amountIssued: 50000, amountDeducted: 1000, daysAbsent: 1, reasonForAbsence: 'Sick leave' },
    { id: 'sal2', monthYear: 'May 2024', dateIssued: '2024-06-01', amountIssued: 50000, amountDeducted: 0, daysAbsent: 0 },
  ],
};

export default function TeacherProfilePage() {
  // In a real app, teacher data would be fetched here
  const teacher = mockTeacherData;

  return (
    <div className="container mx-auto p-0 md:p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">My Profile</h1>
        <User className="h-8 w-8 text-primary" />
      </div>
      
      <TeacherProfileDetails teacher={teacher} />
      <TeacherSalaryView salaryHistory={teacher.salaryHistory} />
      
      {/* Potential future sections:
        - Update personal details form
        - Professional development records
      */}
    </div>
  );
}
