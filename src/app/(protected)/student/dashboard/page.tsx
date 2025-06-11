import { StudentProfileCard } from '@/components/student/student-profile-card';
import { StudentRecords } from '@/components/student/student-records';
import { AiDoubtAssistance } from '@/components/student/ai-doubt-assistance';

export default function StudentDashboardPage() {
  // In a real app, student data would be fetched here
  // const student = await getStudentData(); 

  return (
    <div className="container mx-auto p-0 md:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <StudentProfileCard />
          <StudentRecords />
        </div>
        {/* 
          The doubt assistance could be a modal or a separate page if this layout is too crowded.
          For now, placing it here. Or it can be navigated to via sidebar.
          Let's assume it's on a separate page /student/doubts and remove it from dashboard.
        */}
      </div>
    </div>
  );
}
