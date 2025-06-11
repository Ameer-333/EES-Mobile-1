import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-medium">
            Welcome, Admin!
          </CardTitle>
          <ShieldCheck className="h-8 w-8 text-primary" />
        </CardHeader>
        <CardContent>
          <CardDescription>
            This is the central hub for managing the EES Education application. 
            You have administrative privileges to oversee users, content, and system settings.
          </CardDescription>
          <p className="mt-4 text-muted-foreground">
            More features for system configuration, user management, and analytics will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder for other admin pages to satisfy sidebar links
export function AdminSettingsPage() {
   return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Admin Settings</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure application settings here. (Placeholder)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

