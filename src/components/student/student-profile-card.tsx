
import type { Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { User, MapPin, BookUser, Users, Landmark, Church, Cake, Briefcase, Phone, Mail, UsersRound, Edit3, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import NextImage from 'next/image'; // Keep NextImage for non-placeholders

interface StudentProfileCardProps {
  student: Student;
  isFullPage?: boolean;
}

const mockStudent: Student = {
  id: 'S12345',
  name: 'Ravi Kumar Sharma',
  satsNumber: 'SAT00123',
  class: '10th Grade',
  section: 'A',
  dateOfBirth: '2008-07-15',
  fatherName: 'Rajesh Kumar Sharma',
  motherName: 'Sunita Sharma',
  fatherOccupation: 'Software Engineer',
  motherOccupation: 'Teacher',
  parentsAnnualIncome: 1200000,
  parentContactNumber: '+91 9876543210',
  email: 'ravi.sharma.student@ees.ac.in',
  caste: 'Brahmin',
  religion: 'Hindu',
  address: '123, Vidyanagar, Silicon City, Bangalore, Karnataka - 560001',
  siblingReference: 'Sister: Priya Sharma, Class 8B',
  profilePictureUrl: 'https://placehold.co/150x150.png',
  remarks: [],
  scholarships: [],
  backgroundInfo: "A bright and inquisitive student with a passion for science and coding.",
  authUid: "mockAuthUid"
};


export function StudentProfileCard({ student = mockStudent, isFullPage = false }: StudentProfileCardProps) {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const profileSrc = student.profilePictureUrl || `https://placehold.co/${isFullPage ? '140x140' : '100x100'}.png`;
  const useRegularImg = profileSrc.includes('placehold.co');

  return (
    <Card className={cn("w-full shadow-xl rounded-xl border-primary/10 overflow-hidden", isFullPage ? " " : "lg:col-span-1")}>
      <CardHeader className="bg-gradient-to-br from-primary/15 via-primary/5 to-background p-6 relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative flex-shrink-0">
            {useRegularImg ? (
              <img
                src={profileSrc}
                alt={`${student.name || 'Student'}'s Profile Picture`}
                width={isFullPage ? 140 : 100}
                height={isFullPage ? 140 : 100}
                className="rounded-full border-4 border-primary/50 shadow-lg object-cover"
                data-ai-hint="student portrait placeholder"
              />
            ) : (
              <NextImage
                src={profileSrc}
                alt={`${student.name || 'Student'}'s Profile Picture`}
                width={isFullPage ? 140 : 100}
                height={isFullPage ? 140 : 100}
                className="rounded-full border-4 border-primary/50 shadow-lg object-cover"
                data-ai-hint="student portrait"
                priority
              />
            )}
          </div>
          <div className="text-center sm:text-left pt-1">
            <CardTitle className={cn("font-headline text-primary tracking-tight", isFullPage ? "text-3xl md:text-4xl" : "text-2xl")}>
              {student.name}
            </CardTitle>
            <p className={cn("text-muted-foreground", isFullPage ? "text-lg" : "text-md")}>
              {student.class} - Section {student.section}
            </p>
            <p className="text-xs text-muted-foreground mt-1">SATS ID: {student.satsNumber}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <Section title="Personal Details" icon={User} isFullPage={isFullPage}>
          <ProfileItem icon={Cake} label="Date of Birth" value={formatDate(student.dateOfBirth)} />
          <ProfileItem icon={Church} label="Religion" value={student.religion} />
          <ProfileItem icon={Users} label="Caste" value={student.caste} />
          {isFullPage && student.email && <ProfileItem icon={Mail} label="Student Email" value={student.email} className="md:col-span-2"/>}
        </Section>

        <Section title="Family Information" icon={UsersRound} isFullPage={isFullPage}>
          <ProfileItem icon={User} label="Father's Name" value={student.fatherName} />
          <ProfileItem icon={Briefcase} label="Father's Occupation" value={student.fatherOccupation} />
          <ProfileItem icon={User} label="Mother's Name" value={student.motherName} />
          <ProfileItem icon={Briefcase} label="Mother's Occupation" value={student.motherOccupation} />
          {isFullPage && <ProfileItem icon={Banknote} label="Parents' Annual Income" value={formatCurrency(student.parentsAnnualIncome)} className="md:col-span-2" />}
        </Section>

        <Section title="Contact Information" icon={Phone} isFullPage={isFullPage}>
          {isFullPage && student.parentContactNumber && <ProfileItem icon={Phone} label="Parent's Contact" value={student.parentContactNumber}/>}
          <ProfileItem icon={MapPin} label="Address" value={student.address} className="md:col-span-2" />
        </Section>

        {isFullPage && student.siblingReference && (
            <Section title="School Reference" icon={BookUser} isFullPage={isFullPage}>
                <ProfileItem icon={Users} label="Sibling in School" value={student.siblingReference} className="md:col-span-2"/>
            </Section>
        )}

        {!isFullPage && (
            <div className="mt-4 pt-4 border-t border-muted/30">
                 <ProfileItem icon={MapPin} label="Address" value={student.address} className="text-sm"/>
            </div>
        )}

      </CardContent>
    </Card>
  );
}

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isFullPage: boolean;
}

function Section({ title, icon: Icon, children, isFullPage }: SectionProps) {
  if (!isFullPage && (title === "Family Information" || title === "School Reference")) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary/90 flex items-center border-b border-primary/10 pb-2 mb-3">
        <Icon className="h-5 w-5 mr-2" /> {title}
      </h3>
      <div className={cn(isFullPage ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" : "space-y-3")}>
        {children}
      </div>
    </div>
  );
}


interface ProfileItemProps {
  icon: React.ElementType;
  label: string;
  value?: string;
  className?: string;
}

function ProfileItem({ icon: Icon, label, value, className }: ProfileItemProps) {
  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground">{value || 'N/A'}</p>
      </div>
    </div>
  );
}
