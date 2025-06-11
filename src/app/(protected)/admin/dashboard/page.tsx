
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ShieldCheck, Users, Settings, LineChart, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
        <ShieldCheck className="h-10 w-10 text-primary" />
      </div>

      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-primary">
            Welcome, Admin!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg">
            This is the central hub for managing the EES Education application.
            You have administrative privileges to oversee users, content, and system settings.
          </CardDescription>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardActionCard
          title="User Management"
          description="Manage student, teacher, and admin accounts. View, edit, and create users."
          icon={<Users className="h-8 w-8 text-primary" />}
          link="/admin/user-management"
          linkText="Go to User Management"
        />
        <DashboardActionCard
          title="System Configuration"
          description="Configure application settings, manage academic years, and customize system parameters."
          icon={<Settings className="h-8 w-8 text-primary" />}
          link="/admin/settings"
          linkText="Go to Settings"
        />
        <DashboardActionCard
          title="Analytics & Reports"
          description="View system usage statistics, generate reports on student performance, and monitor application health."
          icon={<LineChart className="h-8 w-8 text-primary" />}
          link="/admin/dashboard" // Placeholder, ideally a dedicated analytics page
          linkText="View Analytics (Coming Soon)"
          disabled
        />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-medium">System Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Users" value="150+" icon={<Users className="h-6 w-6 text-primary" />} />
          <StatCard title="Active Teachers" value="25" icon={<Users className="h-6 w-6 text-primary" />} />
          <StatCard title="System Health" value="Optimal" icon={<ShieldCheck className="h-6 w-6 text-green-500" />} />
        </CardContent>
      </Card>
    </div>
  );
}

interface DashboardActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
  disabled?: boolean;
}

function DashboardActionCard({ title, description, icon, link, linkText, disabled }: DashboardActionCardProps) {
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
        <Button asChild className="w-full" disabled={disabled}>
          <Link href={link}>
            {linkText} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="p-4 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-muted rounded-md">{icon}</div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
