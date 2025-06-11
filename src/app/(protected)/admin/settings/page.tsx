import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
   return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Admin Settings</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure application settings here. (Placeholder for EES Education settings)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
