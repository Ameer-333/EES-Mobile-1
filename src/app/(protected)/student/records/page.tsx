import { StudentRecords } from '@/components/student/student-records';

export default function StudentRecordsPage() {
  return (
    <div className="container mx-auto p-0 md:p-4 space-y-6">
      <h1 className="text-3xl font-headline font-bold">My Academic Records</h1>
      <StudentRecords />
    </div>
  );
}
