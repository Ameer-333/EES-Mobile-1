
'use client';

import React from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { Users, Home } from 'lucide-react'; // Changed ClipboardUser to Users
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getGeneralSettingsDocPath } from '@/lib/firestore-paths';

export default function CoordinatorLoginPage() {
  const [appName, setAppName] = useState('EES Education');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppSettings = async () => {
      setIsLoading(true);
      if (!firestore) {
        console.warn("Firestore instance not available in CoordinatorLoginPage. Using defaults.");
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
          console.warn("App settings document not found for CoordinatorLoginPage. Using defaults.");
          setAppName('EES Education');
          setLogoUrl(null);
        }
      } catch (error) {
        console.error("Error fetching app settings for coordinator login page:", error);
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
          <Users className="h-20 w-20 text-primary mx-auto mb-2 animate-pulse" />
        ) : logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${appName} Logo`}
            width={80}
            height={80}
            className="mx-auto mb-2 rounded-md object-contain"
            data-ai-hint="school logo custom"
            onError={() => setLogoUrl(null)} // Fallback if logo fails to load
          />
        ) : (
          <Users className="h-20 w-20 text-primary mx-auto mb-2" />
        )}
        <h1 className="text-4xl font-headline font-bold text-primary">
           {isLoading ? 'Loading...' : appName}
        </h1>
        <p className="text-muted-foreground">Coordinator Portal</p>
      </div>
      <LoginForm role="Coordinator" />
      <Button asChild variant="outline" className="mt-8">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}

