
import type { Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, MapPin, BookUser, Users, Landmark, Church, Cake, Briefcase, భారతీయ రూపాయిల గుర్తు, Phone, Mail, UsersRound, Edit3 } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface StudentProfileCardProps {
  student: Student;
  isFullPage?: boolean; // To control styling for dashboard vs full profile page
}

// Comprehensive mock data for demonstration
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
  profilePictureUrl: 'https://placehold.co/150x150/E6E6FA/300130.png?text=RS',
  remarks: [],
  scholarships: [],
  backgroundInfo: "A bright and inquisitive student with a passion for science and coding."
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

  return (
    <Card className={cn("w-full shadow-xl rounded-xl border-primary/10 overflow-hidden", isFullPage ? " " : "lg:col-span-1")}>
      <CardHeader className="bg-gradient-to-br from-primary/15 via-primary/5 to-background p-6 relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative flex-shrink-0">
            <Image
              src={student.profilePictureUrl || `https://placehold.co/120x120.png?text=${student.name ? student.name.charAt(0) : 'S'}`}
              alt={`${student.name || 'Student'}'s Profile Picture`}
              width={isFullPage ? 140 : 100}
              height={isFullPage ? 140 : 100}
              className="rounded-full border-4 border-primary/50 shadow-lg object-cover"
              data-ai-hint="student portrait"
              priority
            />
            {isFullPage && (
                <Button variant="outline" size="icon" className="absolute bottom-1 right-1 h-8 w-8 bg-background/80 hover:bg-background border-primary/30">
                    <Edit3 className="h-4 w-4 text-primary" />
                    <span className="sr-only">Edit Profile Picture</span>
                </Button>
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
        {/* Personal Details */}
        <Section title="Personal Details" icon={User} isFullPage={isFullPage}>
          <ProfileItem icon={Cake} label="Date of Birth" value={formatDate(student.dateOfBirth)} />
          <ProfileItem icon={Church} label="Religion" value={student.religion} />
          <ProfileItem icon={Users} label="Caste" value={student.caste} />
          {isFullPage && student.email && <ProfileItem icon={Mail} label="Student Email" value={student.email} className="md:col-span-2"/>}
        </Section>

        {/* Family Details */}
        <Section title="Family Information" icon={UsersRound} isFullPage={isFullPage}>
          <ProfileItem icon={User} label="Father's Name" value={student.fatherName} />
          <ProfileItem icon={Briefcase} label="Father's Occupation" value={student.fatherOccupation} />
          <ProfileItem icon={User} label="Mother's Name" value={student.motherName} />
          <ProfileItem icon={Briefcase} label="Mother's Occupation" value={student.motherOccupation} />
          {isFullPage && <ProfileItem icon={Landmark} label="Parents' Annual Income" value={formatCurrency(student.parentsAnnualIncome)} className="md:col-span-2" />}
        </Section>

        {/* Contact Details */}
        <Section title="Contact Information" icon={Phone} isFullPage={isFullPage}>
          {isFullPage && student.parentContactNumber && <ProfileItem icon={Phone} label="Parent's Contact" value={student.parentContactNumber}/>}
          <ProfileItem icon={MapPin} label="Address" value={student.address} className="md:col-span-2" />
        </Section>
        
        {isFullPage && student.siblingReference && (
            <Section title="School Reference" icon={BookUser} isFullPage={isFullPage}>
                <ProfileItem icon={Users} label="Sibling in School" value={student.siblingReference} className="md:col-span-2"/>
            </Section>
        )}
        
        {!isFullPage && ( // Show minimal info for dashboard
            <div className="mt-4 pt-4 border-t border-muted/30">
                 <ProfileItem icon={MapPin} label="Address" value={student.address} className="text-sm"/>
            </div>
        )}

      </CardContent>
      {isFullPage && (
          <CardFooter className="p-6 border-t border-muted/20 justify-end">
            <Button variant="outline"><Edit3 className="mr-2 h-4 w-4"/> Edit Profile Details</Button>
          </CardFooter>
      )}
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

// Dummy Button for placeholder
const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string, size?: string}) => (
    <button {...props} className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        props.variant === "outline" ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90",
        props.size === "icon" ? "h-10 w-10" : "h-9 px-3 py-2",
        props.className
    )}>
        {children}
    </button>
);

// Indian Rupee icon (if Lucide doesn't have one suitable)
const LandmarkRupeeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("lucide lucide-landmark", className)}>
    <line x1="3" x2="21" y1="22" y2="22" />
    <line x1="6" x2="6" y1="18" y2="11" />
    <line x1="10" x2="10" y1="18" y2="11" />
    <line x1="14" x2="14" y1="18" y2="11" />
    <line x1="18" x2="18" y1="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
    {/* Rupee part - simplified */}
    <path d="M6 10c0-1.1.9-2 2-2h1.5c1.93 0 3.5 1.57 3.5 3.5S11.43 15 9.5 15H6Z" />
    <path d="M7 12h2.5" />
    <path d="M7 12L11 8" />
  </svg>
);
