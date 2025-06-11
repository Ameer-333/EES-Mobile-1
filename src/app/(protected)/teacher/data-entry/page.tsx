import { TeacherDataEntry } from '@/components/teacher/teacher-data-entry';

export default function TeacherDataEntryPage() {
  return (
    <div className="container mx-auto p-0 md:p-4 space-y-6">
      <h1 className="text-3xl font-headline font-bold">Enter Student Data</h1>
      <TeacherDataEntry />
    </div>
  );
}
