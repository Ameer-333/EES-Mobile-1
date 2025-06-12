
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
import { firestore } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const APP_SETTINGS_COLLECTION = 'app_settings';
const GENERAL_SETTINGS_DOC_ID = 'general';

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
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const settingsDocRef = doc(firestore, APP_SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC_ID);
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAppName(data.appName || 'EES Education');
          setLogoUrl(data.logoUrl || '');
          // Potentially load other settings like defaultLanguage, maintenanceMode if stored
        } else {
          // Set default values if doc doesn't exist
          setAppName('EES Education');
          setLogoUrl('');
        }
      } catch (error) {
        console.error("Error fetching app settings from Firestore:", error);
        toast({
          title: "Error Loading Settings",
          description: "Could not fetch app settings from Firestore. Using defaults.",
          variant: "destructive",
        });
        setAppName('EES Education');
        setLogoUrl('');
      }
      setIsLoadingSettings(false);
    };
    fetchSettings();
  }, [toast]);

  const handleSaveGeneralSettings = async () => {
    if (logoUrl && !logoUrl.startsWith('http://') && !logoUrl.startsWith('https://') && !logoUrl.startsWith('/')) {
      toast({
        title: "Invalid Logo URL",
        description: "Logo URL must be a web URL (http:// or https://) or a local public path (starting with /). Example: /logo.png or https://example.com/logo.png. Leave blank for default.",
        variant: "destructive",
      });
      return;
    }

    try {
      const settingsDocRef = doc(firestore, APP_SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC_ID);
      await setDoc(settingsDocRef, { appName, logoUrl: logoUrl || "" }, { merge: true }); // Save empty string if logoUrl is falsy
      toast({
        title: "Settings Saved",
        description: `General settings (App Name, Logo URL) have been updated in Firestore.`,
      });
    } catch (error) {
      console.error("Error saving general settings to Firestore:", error);
      toast({
        title: "Save Failed",
        description: "Could not save general settings to Firestore.",
        variant: "destructive",
      });
    }
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
            {isLoadingSettings ? (
              <CardContent className="space-y-6">
                <p>Loading settings...</p>
              </CardContent>
            ) : (
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input id="appName" value={appName} onChange={(e) => setAppName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">School Logo URL (Web URL or local path like /logo.png)</Label>
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="/school_logo.png or https://example.com/logo.png" />
                  </div>
                  {logoUrl && (logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('/')) && (
                    <div className="mt-2 p-2 border rounded-md flex justify-center items-center bg-muted/50 max-h-32">
                      {/* Using <img> for preview as next/image needs public paths or configured hostnames, preview is simpler with img */}
                      <img src={logoUrl} alt="Logo Preview" className="max-h-28 object-contain rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.remove(); // Remove potential error message
                          const errorMsg = document.createElement('p');
                          errorMsg.textContent = 'Preview failed to load. Ensure URL is correct and image is accessible.';
                          errorMsg.className = 'text-xs text-destructive';
                          target.parentElement?.appendChild(errorMsg);
                        }}
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
            )}
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

