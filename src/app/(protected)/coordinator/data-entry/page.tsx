
import { CoordinatorDataEntryView } from '@/components/coordinator/coordinator-data-entry-view';
import { Edit3 } from 'lucide-react';

export default function CoordinatorDataEntryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Global Student Data Entry</h1>
        <Edit3 className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">
        Enter academic marks and attendance for any student in the system.
      </p>
      <CoordinatorDataEntryView />
    </div>
  );
}
