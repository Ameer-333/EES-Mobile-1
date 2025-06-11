import { TeacherStudentManagement } from '@/components/teacher/teacher-student-management';

export default function TeacherStudentsPage() {
  return (
    <div className="container mx-auto p-0 md:p-4 space-y-6">
      <h1 className="text-3xl font-headline font-bold">Manage Students</h1>
      <TeacherStudentManagement />
    </div>
  );
}
