
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Users, Edit3, Building, ClipboardUser } from 'lucide-react'; // Users can be for both students and teachers
import { useAppContext } from '@/app/(protected)/layout';

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

function ActionCard({ title, description, href, icon: Icon }: ActionCardProps) {
  return (
    <Card className="card-hover-effect flex flex-col group">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-semibold text-primary group-hover:text-primary/90">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full group-hover:border-primary group-hover:text-primary transition-colors">
          <Link href={href}>Access {title}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CoordinatorDashboardPage() {
  const { userProfile } = useAppContext();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
            Coordinator Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome, {userProfile?.name || 'Coordinator'}! Access your tools and manage system data.
          </p>
        </div>
        <ClipboardUser className="h-12 w-12 text-primary hidden sm:block" />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Key Management Areas</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ActionCard 
            title="All Student Management" 
            description="View and manage records for all students across the entire system."
            href="/coordinator/students"
            icon={Users}
          />
          <ActionCard 
            title="Teacher Management" 
            description="View and manage teacher profiles and their assignments system-wide."
            href="/coordinator/teacher-management"
            icon={Users} 
          />
          <ActionCard 
            title="Global Data Entry" 
            description="Enter or update academic marks and attendance for any student in the system."
            href="/coordinator/data-entry"
            icon={Edit3}
          />
          <ActionCard 
            title="View Hall of Fame" 
            description="Explore the school's legacy and achievements in the Hall of Fame."
            href="/hall-of-fame" 
            icon={Building}
          />
        </div>
      </div>

      <Card className="mt-8 bg-accent/50 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Coordinator Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>Oversee comprehensive student data and progress.</li>
            <li>Coordinate with teachers and manage their assignments.</li>
            <li>Ensure accuracy and completeness of academic data through global entry.</li>
            <li>Facilitate communication between administration, teachers, and students.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
