
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, Bell, Palette, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const handleSaveChanges = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been successfully updated. (Demo action)`,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Admin Settings</h1>
        <Settings className="h-8 w-8 text-primary" />
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="general-settings" className="border rounded-lg shadow-md">
          <AccordionTrigger className="p-6 hover:no-underline">
            <div className="flex items-center space-x-3">
              <Palette className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">General Settings</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input id="appName" defaultValue="EES Education" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="defaultLanguage">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="kn">Kannada</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between space-y-2 border p-4 rounded-md">
                <div>
                  <Label htmlFor="maintenanceMode" className="font-medium">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily take the application offline for users.</p>
                </div>
                <Switch id="maintenanceMode" />
              </div>
              <Button onClick={() => handleSaveChanges("General")} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" /> Save General Settings
              </Button>
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notification-settings" className="border rounded-lg shadow-md">
          <AccordionTrigger className="p-6 hover:no-underline">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Notification Settings</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
             <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-y-2 border p-4 rounded-md">
                  <div>
                    <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Enable or disable system-wide email notifications.</p>
                  </div>
                  <Switch id="emailNotifications" defaultChecked />
                </div>
                 <div className="flex items-center justify-between space-y-2 border p-4 rounded-md">
                  <div>
                    <Label htmlFor="smsNotifications" className="font-medium">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Enable or disable system-wide SMS alerts.</p>
                  </div>
                  <Switch id="smsNotifications" />
                </div>
                <Button onClick={() => handleSaveChanges("Notification")} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" /> Save Notification Settings
                </Button>
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="security-settings" className="border rounded-lg shadow-md">
          <AccordionTrigger className="p-6 hover:no-underline">
            <div className="flex items-center space-x-3">
              <Lock className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Security Settings</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input id="sessionTimeout" type="number" defaultValue="30" />
                </div>
                <div className="flex items-center justify-between space-y-2 border p-4 rounded-md">
                  <div>
                    <Label htmlFor="twoFactorAuth" className="font-medium">Two-Factor Authentication (2FA)</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts.</p>
                  </div>
                  <Switch id="twoFactorAuth" defaultChecked />
                </div>
                <Button onClick={() => handleSaveChanges("Security")} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" /> Save Security Settings
                </Button>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
