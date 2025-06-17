
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoIcon } from '@/components/icons/logo-icon';
import { ArrowRight, User, Briefcase, Shield } from 'lucide-react';
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
          setAppName('EES Education');
          setLogoUrl(null);
        }
      } catch (error) {
        console.error("Error fetching app settings for landing page:", error);
        setAppName('EES Education');
        setLogoUrl(null);
      }
      setIsLoading(false);
    };

    fetchAppSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-accent/20 p-6">
        <LogoIcon className="h-28 w-28 text-primary mx-auto mb-4 animate-pulse" />
        <h1 className="text-5xl font-headline font-bold text-primary animate-pulse">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-6 overflow-hidden">
      <header className="mb-10 md:mb-16 text-center">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${appName} Logo`}
            width={100}
            height={100}
            className="mx-auto mb-4 rounded-lg object-contain shadow-md"
            data-ai-hint="school logo custom large"
            priority
            onError={() => setLogoUrl(null)} 
          />
        ) : (
          <LogoIcon className="h-24 w-24 md:h-28 md:w-28 text-primary mx-auto mb-4" />
        )}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-extrabold text-primary tracking-tight">
          {appName}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mt-2 max-w-xl mx-auto">
          Excellent English School: Empowering students with knowledge and character.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl w-full px-4">
        <LoginOptionCard
          role="Student"
          description="Access your academic records, attendance, and learning resources."
          href="/login/student"
          icon={User}
        />
        <LoginOptionCard
          role="Teacher"
          description="Manage student data, enter marks, attendance, and access teaching tools."
          href="/login/teacher"
          icon={Briefcase}
        />
        <LoginOptionCard
          role="Admin"
          description="Oversee the application, manage users, and configure system settings."
          href="/login/admin"
          icon={Shield}
        />
      </main>

      <footer className="mt-12 md:mt-20 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
        <p className="mt-1">Designed with care for the EES community.</p>
      </footer>
    </div>
  );
}

interface LoginOptionCardProps {
  role: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

function LoginOptionCard({ role, description, href, icon: Icon }: LoginOptionCardProps) {
  return (
    <Card className="card-hover-effect flex flex-col group bg-card/80 backdrop-blur-sm border-border/50 rounded-xl">
      <CardHeader className="items-center text-center pb-4">
        <div className="p-4 bg-primary/10 text-primary rounded-full mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-headline text-primary group-hover:text-primary/90 transition-colors">
          {role} Portal
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-center">
        <CardDescription className="text-muted-foreground h-16 leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 mt-auto">
        <Button asChild className="w-full text-base py-3 group-hover:bg-primary/90 transition-colors duration-300">
          <Link href={href}>
            Login as {role}
            <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
