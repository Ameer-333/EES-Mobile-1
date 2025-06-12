
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoIcon } from '@/components/icons/logo-icon';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const APP_SETTINGS_COLLECTION = 'app_settings';
const GENERAL_SETTINGS_DOC_ID = 'general';

export default function LandingPage() {
  const [appName, setAppName] = useState('EES Education');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppSettings = async () => {
      setIsLoading(true);
      try {
        const settingsDocRef = doc(firestore, APP_SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC_ID);
        const settingsDocSnap = await getDoc(settingsDocRef);
        if (settingsDocSnap.exists()) {
          const appData = settingsDocSnap.data();
          setAppName(appData.appName || 'EES Education');
          setLogoUrl(appData.logoUrl || null);
        } else {
          // Defaults if document doesn't exist
          setAppName('EES Education');
          setLogoUrl(null);
        }
      } catch (error) {
        console.error("Error fetching app settings for landing page:", error);
        // Fallback to defaults on error
        setAppName('EES Education');
        setLogoUrl(null);
      }
      setIsLoading(false);
    };

    fetchAppSettings();
  }, []);

  if (isLoading) {
    // You can show a more sophisticated loader here if needed
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-accent/30 p-4">
        <LogoIcon className="h-24 w-24 text-primary mx-auto mb-3 animate-pulse" />
        <h1 className="text-5xl font-headline font-bold text-primary animate-pulse">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-accent/30 p-4">
      <div className="mb-12 text-center">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${appName} Logo`}
            width={96}
            height={96}
            className="mx-auto mb-3 rounded-md object-contain"
            data-ai-hint="school logo custom"
            onError={() => setLogoUrl(null)} // Fallback if image fails to load
          />
        ) : (
          <LogoIcon className="h-24 w-24 text-primary mx-auto mb-3" />
        )}
        <h1 className="text-5xl font-headline font-bold text-primary">{appName}</h1>
        <p className="text-xl text-muted-foreground mt-1">Excellent English School</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <LoginOptionCard
          role="Student"
          description="Access your academic records, attendance, and other resources."
          href="/login/student"
        />
        <LoginOptionCard
          role="Teacher"
          description="Manage student data, enter marks, attendance, and access teaching tools."
          href="/login/teacher"
        />
        <LoginOptionCard
          role="Admin"
          description="Oversee the application, manage users, and configure system settings."
          href="/login/admin"
        />
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
      </footer>
    </div>
  );
}

interface LoginOptionCardProps {
  role: string;
  description: string;
  href: string;
}

function LoginOptionCard({ role, description, href }: LoginOptionCardProps) {
  return (
    <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">{role} Portal</CardTitle>
        <CardDescription className="h-12">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={href}>
            Login as {role}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
