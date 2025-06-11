
import { HallOfFameEditor } from '@/components/admin/hall-of-fame-editor';
import { Building } from 'lucide-react';

export default function AdminHallOfFameManagementPage() {
  // In a real app, you would fetch existing Hall of Fame data here
  // and pass it to HallOfFameEditor.
  // Also, the onSave prop would point to a server action or API call.

  return (
    <div className="container mx-auto p-0 md:p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold flex items-center">
            <Building className="mr-3 h-8 w-8 text-primary" /> Manage Hall of Fame
        </h1>
      </div>
      <HallOfFameEditor />
    </div>
  );
}
