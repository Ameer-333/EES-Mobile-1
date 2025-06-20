
import { CoordinatorTeacherDataView } from '@/components/coordinator/coordinator-teacher-data-view';
import { FileText } from 'lucide-react'; // Changed icon

export default function CoordinatorTeacherDataPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Global Teacher Data & Progress</h1>
        <FileText className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">
        View teacher qualifications, recent attendance summaries, and appraisal statuses across the system. This is a read-only view.
      </p>
      <CoordinatorTeacherDataView />
    </div>
  );
}

