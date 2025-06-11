
import { GiveStudentRemarkForm } from '@/components/teacher/give-student-remark-form';

export default function TeacherGiveRemarkPage() {
  return (
    <div className="container mx-auto p-0 md:p-4 space-y-6">
      <h1 className="text-3xl font-headline font-bold">Provide Student Remark</h1>
      <GiveStudentRemarkForm />
    </div>
  );
}
