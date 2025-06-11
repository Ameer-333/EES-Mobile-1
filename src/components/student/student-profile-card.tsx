import type { Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, MapPin, BookUser, Users, Landmark, Church } from 'lucide-react'; // Added more icons
import { cn } from '@/lib/utils';

interface StudentProfileCardProps {
  student: Student;
}

// Mock data for demonstration
const mockStudent: Student = {
  id: 'S12345',
  name: 'Ravi Kumar',
  satsNumber: 'SAT00123',
  class: '10th Grade',
  section: 'A',
  caste: 'General',
  religion: 'Hinduism',
  address: '123 Main Street, Bangalore, Karnataka',
};

export function StudentProfileCard({ student = mockStudent }: StudentProfileCardProps) {
  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader className="bg-primary/10 rounded-t-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary rounded-full">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-headline text-primary">{student.name}</CardTitle>
            <CardDescription>Student ID: {student.id} | SATS: {student.satsNumber}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <ProfileItem icon={BookUser} label="Class" value={`${student.class} - Section ${student.section}`} />
        <ProfileItem icon={Users} label="Caste" value={student.caste} />
        <ProfileItem icon={Church} label="Religion" value={student.religion} />
        <ProfileItem icon={MapPin} label="Address" value={student.address} className="md:col-span-2" />
      </CardContent>
    </Card>
  );
}

interface ProfileItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}

function ProfileItem({ icon: Icon, label, value, className }: ProfileItemProps) {
  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base text-foreground">{value}</p>
      </div>
    </div>
  );
}
