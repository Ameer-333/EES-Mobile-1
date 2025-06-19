
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ClipboardUser, Users, Edit3, Home, LogIn, Building } from "lucide-react";

export default function CoordinatorDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Coordinator Dashboard</h1>
        <ClipboardUser className="h-10 w-10 text-primary" />
      </div>

      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-primary">
            Welcome, Coordinator!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg">
            This is your dashboard for overseeing student progress, managing teacher data, and coordinating academic activities.
          </CardDescription>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardActionCard
          title="Student Management (All)"
          description="View and manage profiles, academic records, and remarks for all students across classes."
          icon={<Users className="h-8 w-8 text-primary" />}
          link="/coordinator/students"
          linkText="Manage Students"
        />
        <DashboardActionCard
          title="Teacher Management"
          description="View teacher profiles, assignments, and add new teachers to the system."
          icon={<Users className="h-8 w-8 text-primary" />}
          link="/coordinator/teacher-management"
          linkText="Manage Teachers"
        />
         <DashboardActionCard
          title="Data Entry (All Students)"
          description="Enter marks and attendance for any student in the system."
          icon={<Edit3 className="h-8 w-8 text-primary" />}
          link="/coordinator/data-entry"
          linkText="Enter Student Data"
        />
         <DashboardActionCard
          title="Hall of Fame"
          description="View the school's hall of fame."
          icon={<Building className="h-8 w-8 text-primary" />}
          link="/hall-of-fame"
          linkText="View Hall of Fame"
        />
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
         <Button asChild variant="outline">
          <Link href="/login/coordinator">
            <LogIn className="mr-2 h-4 w-4" />
            Back to Login Page
          </Link>
        </Button>
      </div>
    </div>
  );
}

interface DashboardActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
}

function DashboardActionCard({ title, description, icon, link, linkText }: DashboardActionCardProps) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-start space-x-4 pb-2">
        <div className="p-2 bg-primary/10 rounded-md">{icon}</div>
        <div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardContent className="pt-0">
        <Button asChild className="w-full">
          <Link href={link}>
            {linkText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
