
'use client';

import React from 'react'; // Keep React import for JSX
import Link from 'next/link';
// Removed useState, useEffect, firestore, doc, getDoc, getGeneralSettingsDocPath as they are no longer used here for dynamic settings
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { LogoIcon } from '@/components/icons/logo-icon';
import { ArrowRight, User, Briefcase, Shield, Users } from 'lucide-react';

export default function LandingPage() {
  // Using static defaults directly, removed Firestore fetch for build stability diagnosis
  const appName = 'EES Education';
  const logoUrl: string | null = null; // Or your actual default local path like '/default-school-logo.png' if you have one
  const isLoading = false; // No longer loading from Firestore here

  // isLoading state is removed as we are using static values now.
  // The original loading skeleton for dynamic appName/logoUrl is also removed for simplicity in this diagnostic step.

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
            // Removed onError={() => setLogoUrl(null)} as logoUrl is static or null here
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

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl w-full px-4">
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
          role="Coordinator"
          description="Oversee student progress, manage teacher data, and coordinate activities."
          href="/login/coordinator"
          icon={Users} 
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
  if (!Icon) {
    console.error(`LoginOptionCard for role "${role}" received an undefined icon.`);
    return null;
  }

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
