
'use client';

import { TeacherProfileDetails } from '@/components/teacher/teacher-profile-details';
import { TeacherSalaryView } from '@/components/teacher/teacher-salary-view';
import type { Teacher } from '@/types';
import { User, DollarSign, Briefcase } from 'lucide-react'; // Added Briefcase and DollarSign for tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for demonstration
const mockTeacherData: Teacher = {
  id: 'T001',
  authUid: 'T001_auth', 
  name: 'Priya Sharma',
  email: 'priya.sharma@ees.com',
  phoneNumber: '+91 98765 43210',
  address: '456 Park Avenue, Bangalore, Karnataka',
  yearOfJoining: 2018,
  totalYearsWorked: new Date().getFullYear() - 2018,
  subjectsTaught: ['English', 'Social Science'],
  profilePictureUrl: 'https://placehold.co/150x150.png',
  salaryHistory: [
    { id: 'sal1', monthYear: 'June 2024', dateIssued: '2024-07-01', amountIssued: 50000, amountDeducted: 1000, daysAbsent: 1, reasonForAbsence: 'Sick leave' },
    { id: 'sal2', monthYear: 'May 2024', dateIssued: '2024-06-01', amountIssued: 50000, amountDeducted: 0, daysAbsent: 0 },
  ],
  currentAppraisalStatus: "Appraised", 
  lastAppraisalDate: "2024-03-15",    
  lastAppraisalDetails: "Excellent performance in Q1, salary increased by 10%.",
};

export default function TeacherProfilePage() {
  // In a real app, teacher data would be fetched here based on authenticated user
  const teacher = mockTeacherData;

  return (
    <div className="container mx-auto p-0 md:p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">My Profile</h1>
        <User className="h-8 w-8 text-primary" />
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="details" className="gap-2">
            <Briefcase className="h-4 w-4" /> Profile Details
          </TabsTrigger>
          <TabsTrigger value="salary" className="gap-2">
            <DollarSign className="h-4 w-4" /> Salary & Appraisal
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <TeacherProfileDetails teacher={teacher} />
        </TabsContent>
        <TabsContent value="salary">
          <TeacherSalaryView salaryHistory={teacher.salaryHistory} teacherProfile={teacher} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
