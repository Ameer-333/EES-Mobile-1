
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, Bell, Palette, Lock, Settings, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_APP_NAME_KEY = 'eesEducationAppName';
const LOCAL_STORAGE_LOGO_URL_KEY = 'eesEducationLogoUrl';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [appName, setAppName] = useState('EES Education');
  const [logoUrl, setLogoUrl] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  useEffect(() => {
    const storedAppName = localStorage.getItem(LOCAL_STORAGE_APP_NAME_KEY);
    if (storedAppName) {
      setAppName(storedAppName);
    }
    const storedLogoUrl = localStorage.getItem(LOCAL_STORAGE_LOGO_URL_KEY);
    if (storedLogoUrl) {
      setLogoUrl(storedLogoUrl);
    }
  }, []);

  const handleSaveGeneralSettings = () => {
    localStorage.setItem(LOCAL_STORAGE_APP_NAME_KEY, appName);
    localStorage.setItem(LOCAL_STORAGE_LOGO_URL_KEY, logoUrl);
    // In a real app, also save defaultLanguage and maintenanceMode
    toast({
      title: "Settings Saved",
      description: `General settings (App Name, Logo URL) have been updated in localStorage.`,
    });
    // Trigger a custom event to notify other parts of the app if needed
    window.dispatchEvent(new CustomEvent('appSettingsChanged'));
  };

  const handleSaveNotificationSettings = () => {
    // In a real app, save emailNotifications and smsNotifications
    toast({
      title: "Settings Saved",
      description: `Notification settings have been successfully updated. (Demo action)`,
    });
  };

  const handleSaveSecuritySettings = () => {
    // In a real app, save sessionTimeout and twoFactorAuth
    toast({
      title: "Settings Saved",
      description: `Security settings have been successfully updated. (Demo action)`,
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
                <Input id="appName" value={appName} onChange={(e) => setAppName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">School Logo URL</Label>
                <div className="flex items-center space-x-2">
                   <ImageIcon className="h-5 w-5 text-muted-foreground" />
                   <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
                </div>
                 {logoUrl && (
                  <div className="mt-2 p-2 border rounded-md flex justify-center items-center bg-muted/50 max-h-32">
                    <img src={logoUrl} alt="Logo Preview" className="max-h-28 object-contain rounded" 
                      onError={(e) => (e.currentTarget.style.display = 'none')} 
                      onLoad={(e) => (e.currentTarget.style.display = 'block')}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
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
                <Switch id="maintenanceMode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <Button onClick={handleSaveGeneralSettings} className="w-full sm:w-auto">
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
                  <Switch id="emailNotifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                 <div className="flex items-center justify-between space-y-2 border p-4 rounded-md">
                  <div>
                    <Label htmlFor="smsNotifications" className="font-medium">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Enable or disable system-wide SMS alerts.</p>
                  </div>
                  <Switch id="smsNotifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                </div>
                <Button onClick={handleSaveNotificationSettings} className="w-full sm:w-auto">
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
                  <Input id="sessionTimeout" type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(parseInt(e.target.value,10))} />
                </div>
                <div className="flex items-center justify-between space-y-2 border p-4 rounded-md">
                  <div>
                    <Label htmlFor="twoFactorAuth" className="font-medium">Two-Factor Authentication (2FA)</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts.</p>
                  </div>
                  <Switch id="twoFactorAuth" checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                </div>
                <Button onClick={handleSaveSecuritySettings} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" /> Save Security Settings
                </Button>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
