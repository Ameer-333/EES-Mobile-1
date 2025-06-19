
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Users, Shield, LineChart, Settings, Building, UserCheck, UserCog } from 'lucide-react';
import { useAppContext } from '@/app/(protected)/layout'; // Assuming layout exports useAppContext

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
  colorClass?: string;
}

function StatCard({ title, value, icon: Icon, description, colorClass = "text-primary" }: StatCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 card-hover-effect">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

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
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-semibold text-primary group-hover:text-primary/90">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full group-hover:border-primary group-hover:text-primary transition-colors">
          <Link href={href}>Go to {title}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { userProfile } = useAppContext(); // Get userProfile for greeting

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome, {userProfile?.name || 'Admin'}! Manage and oversee the EES Education system.
          </p>
        </div>
        <Shield className="h-12 w-12 text-primary hidden sm:block" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Users" value="180" icon={Users} description="All registered users" colorClass="text-blue-500" />
        <StatCard title="Teachers" value="25" icon={UserCheck} description="Active teaching staff" colorClass="text-green-500" />
        <StatCard title="Students" value="150" icon={UserCog} description="Enrolled students" colorClass="text-indigo-500" />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ActionCard 
            title="User Management" 
            description="Add, edit, or remove user accounts (Admins, Teachers, Students, Coordinators)."
            href="/admin/user-management"
            icon={Users}
          />
          <ActionCard 
            title="Teacher Management" 
            description="Manage teacher HR profiles, payroll, assignments, and attendance."
            href="/admin/teacher-management"
            icon={UserCheck}
          />
          <ActionCard 
            title="System Analytics" 
            description="View system usage statistics, user registrations, and engagement metrics."
            href="/admin/analytics"
            icon={LineChart}
          />
          <ActionCard 
            title="Application Settings" 
            description="Configure general settings, notifications, and security parameters."
            href="/admin/settings"
            icon={Settings}
          />
          <ActionCard 
            title="Hall of Fame" 
            description="Manage and update the school's Hall of Fame entries."
            href="/admin/hall-of-fame-management"
            icon={Building}
          />
        </div>
      </div>
    </div>
  );
}
