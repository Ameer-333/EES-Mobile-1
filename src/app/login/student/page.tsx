
'use client';

import React from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { LogoIcon } from '@/components/icons/logo-icon';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getGeneralSettingsDocPath } from '@/lib/firestore-paths';

export default function StudentLoginPage() {
  const [appName, setAppName] = useState('EES Education');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppSettings = async () => {
      setIsLoading(true);
      if (!firestore) {
        console.warn("Firestore instance not available in StudentLoginPage. Using defaults.");
        setAppName('EES Education');
        setLogoUrl(null);
        setIsLoading(false);
        return;
      }
      try {
        const settingsDocPath = getGeneralSettingsDocPath();
        const settingsDocRef = doc(firestore, settingsDocPath);
        const settingsDocSnap = await getDoc(settingsDocRef);
        if (settingsDocSnap.exists()) {
          const appData = settingsDocSnap.data();
          setAppName(appData.appName || 'EES Education');
          setLogoUrl(appData.logoUrl || null);
        } else {
          console.warn("App settings document not found for StudentLoginPage. Using defaults.");
          setAppName('EES Education');
          setLogoUrl(null);
        }
      } catch (error) {
        console.error("Error fetching app settings for student login page:", error);
        setAppName('EES Education');
        setLogoUrl(null);
      }
      setIsLoading(false);
    };

    fetchAppSettings();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-accent/30 p-4">
      <div className="mb-8 text-center">
        {isLoading ? (
          <LogoIcon className="h-20 w-20 text-primary mx-auto mb-2 animate-pulse" />
        ) : logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${appName} Logo`}
            width={80}
            height={80}
            className="mx-auto mb-2 rounded-md object-contain"
            data-ai-hint="school logo custom"
            onError={() => setLogoUrl(null)}
          />
        ) : (
          <LogoIcon className="h-20 w-20 text-primary mx-auto mb-2" />
        )}
        <h1 className="text-4xl font-headline font-bold text-primary">
           {isLoading ? 'Loading...' : appName}
        </h1>
        <p className="text-muted-foreground">Excellent English School</p>
      </div>
      <LoginForm role="Student" />
      <Button asChild variant="outline" className="mt-8">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}

    
