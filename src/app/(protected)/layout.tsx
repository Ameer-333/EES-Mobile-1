// src/app/(protected)/layout.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, firestore } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { ManagedUser, UserRole } from '@/types';
import { getGeneralSettingsDocPath, getUserDocPath } from '@/lib/firestore-paths';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, LogOut, Settings, UserCircle2, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogoIcon } from '@/components/icons/logo-icon';
import Link from 'next/link';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { AppSidebarContent } from '@/components/shared/app-sidebar-content';
import { navItems } from '@/components/shared/sidebar-nav';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';


interface AppContextType {
  user: FirebaseUser | null;
  userProfile: ManagedUser | null;
  isLoadingAuth: boolean;
  appName: string;
  logoUrl: string | null;
  signOut: () => Promise<void>;
  currentRole: UserRole | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<ManagedUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [appName, setAppName] = useState('EES Education');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoadingAuth(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(firestore, getUserDocPath(firebaseUser.uid));
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profileData = userDocSnap.data() as ManagedUser;
            setUserProfile(profileData);

            const currentBasePath = pathname.split('/')[1]?.toLowerCase(); 
            const userRolePath = profileData.role.toLowerCase();

            if (currentBasePath && currentBasePath !== userRolePath) {
              if (pathname !== `/login/${userRolePath}` && !pathname.startsWith(`/${userRolePath}/`)) {
                if (pathname.startsWith('/hall-of-fame')) {
                  // Allow access to /hall-of-fame from any role's context
                } else {
                  toast({ title: "Redirecting", description: `Accessing restricted area. Redirecting to your ${profileData.role} dashboard.`, variant: "default", duration: 4000 });
                  router.push(`/${userRolePath}/dashboard`);
                }
              }
            }
          } else {
            setUserProfile(null);
            toast({ title: "Profile Error", description: "User profile not found. Please contact support.", variant: "destructive" });
            await firebaseSignOut(auth);
            router.push('/'); 
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast({ title: "Error", description: "Failed to load user profile. Please try logging in again.", variant: "destructive" });
          setUserProfile(null);
          await firebaseSignOut(auth);
          router.push('/');
        }
      } else {
        setUser(null);
        setUserProfile(null);
        if (!pathname.startsWith('/login/') && pathname !== '/') {
            router.push('/');
        }
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [router, pathname, toast]);


  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        const settingsDocRef = doc(firestore, getGeneralSettingsDocPath());
        const settingsDocSnap = await getDoc(settingsDocRef);
        if (settingsDocSnap.exists()) {
          const appData = settingsDocSnap.data();
          setAppName(appData.appName || 'EES Education');
          setLogoUrl(appData.logoUrl || null);
        }
      } catch (error) {
        console.error("Error fetching app settings:", error);
      }
    };
    fetchAppSettings();
  }, []);

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({ title: 'Sign Out Error', description: 'Failed to sign out.', variant: 'destructive' });
    }
  };
  
  const currentRole = useMemo(() => {
    if (!userProfile) return null;
    const pathSegments = pathname.split('/');
    if (pathSegments.length > 1) {
        const roleSegment = pathSegments[1].toLowerCase();
        // Ensure the current path segment matches the user's role, or it's a general access page like hall-of-fame
        if (roleSegment === userProfile.role.toLowerCase() || roleSegment === 'hall-of-fame') {
            return userProfile.role;
        }
    }
    return userProfile.role; // Fallback to profile role if path is ambiguous or doesn't match
  }, [pathname, userProfile]);


  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-4 p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Authenticating & Loading Profile...</p>
        <Skeleton className="h-8 w-3/4 max-w-md mt-2" />
        <Skeleton className="h-6 w-1/2 max-w-sm" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-4 p-4">
            <Loader2 className="h-16 w-16 animate-spin text-destructive" />
            <p className="text-lg text-muted-foreground">Redirecting to login...</p>
        </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, userProfile, isLoadingAuth, appName, logoUrl, signOut: handleSignOut, currentRole }}>
      {children}
    </AppContext.Provider>
  );
}


function ProtectedLayoutContent({ children }: { children: React.ReactNode }) {
  const { userProfile, appName, logoUrl, signOut, currentRole } = useAppContext();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    const item = navItems.find(navItem => {
        // More specific matching for dashboard/root paths of a role
        if (pathname === navItem.href || pathname === `${navItem.href}/`) return true;
        // General startsWith for sub-pages, but exclude if it's just a prefix of another item
        if (navItem.href !== '/' && pathname.startsWith(navItem.href + '/')) return true;
        // Handle /hall-of-fame specifically if it's not the root
        if (navItem.href === '/hall-of-fame' && pathname.startsWith('/hall-of-fame')) return true;
        return false;
    });
    
    if (item) return item.label;

    // Fallback for paths not directly in navItems (e.g. /admin/user-management/edit/some-id)
    if (currentRole) {
        const rolePath = `/${currentRole.toLowerCase()}`;
        if (pathname.startsWith(`${rolePath}/dashboard`)) return "Dashboard";
        if (pathname.startsWith(`${rolePath}/`)) { // General fallback for the role
            const section = pathname.substring(rolePath.length + 1).split('/')[0];
            return section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');
        }
    }
    return 'EES Education';
  };
  
  const pageTitle = getPageTitle();

  if (!userProfile) { 
    return <div className="flex items-center justify-center h-screen">Critical Error: No user profile available.</div>;
  }

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon" side="left" className="border-sidebar-border bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-3 flex items-center justify-between border-b border-sidebar-border h-16">
            <Link href="/" className="flex items-center gap-2 group/sidebar-header-logo-link overflow-hidden" aria-label={`${appName} Home`}>
              {logoUrl ? (
                  <Image src={logoUrl} alt={`${appName} Logo`} width={36} height={36} className="rounded-md object-contain flex-shrink-0" data-ai-hint="school logo small"/>
              ) : (
                  <LogoIcon className="h-9 w-9 text-sidebar-primary flex-shrink-0" />
              )}
              <h1 className="text-xl font-headline font-semibold text-sidebar-primary group-data-[collapsible=icon]/sidebar-wrapper:hidden transition-opacity duration-300 truncate">
                {appName}
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex-1 p-2">
             <AppSidebarContent currentActualRole={currentRole} navItems={navItems} />
          </SidebarContent>
          <SidebarFooter className="p-2 border-t border-sidebar-border">
            <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]/sidebar-wrapper:justify-center">
                <LogOut />
                <span className="group-data-[collapsible=icon]/sidebar-wrapper:hidden">Sign Out</span>
            </Button>
          </SidebarFooter>
      </Sidebar>

      <div className="flex flex-col flex-1 min-h-screen peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)] md:peer-data-[state=expanded]:peer-data-[variant=inset]:ml-[calc(var(--sidebar-width)_+_theme(spacing.4)_+2px)] md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 shadow-sm">
            <div className="md:hidden">
                <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0 w-[calc(var(--sidebar-width)_-_2rem)] bg-sidebar text-sidebar-foreground">
                        <div className="p-3 border-b border-sidebar-border h-16 flex items-center gap-2">
                             {logoUrl ? (
                                <Image src={logoUrl} alt={`${appName} Logo`} width={32} height={32} className="rounded-md object-contain" data-ai-hint="school logo small"/>
                            ) : (
                                <LogoIcon className="h-8 w-8 text-sidebar-primary" />
                            )}
                            <span className="font-semibold text-lg text-sidebar-primary">{appName}</span>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-2">
                             <AppSidebarContent currentActualRole={currentRole} navItems={navItems} onLinkClick={() => setIsMobileSheetOpen(false)} />
                        </nav>
                         <div className="p-2 border-t border-sidebar-border">
                             <Button variant="ghost" onClick={() => { signOut(); setIsMobileSheetOpen(false);}} className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                <LogOut /> Sign Out
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <SidebarTrigger className="hidden md:flex" />
            <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
            </div>
            <UserNav userProfile={userProfile} signOut={signOut} />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/20">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

function UserNav({ userProfile, signOut }: { userProfile: ManagedUser; signOut: () => Promise<void>; }) {
  if (!userProfile) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-auto px-2 space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userProfile.profilePictureUrl || `https://placehold.co/40x40.png?text=${userProfile.name.charAt(0)}`} alt={userProfile.name} data-ai-hint="user avatar small"/>
            <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
             <span className="text-sm font-medium text-foreground">{userProfile.name}</span>
             <span className="text-xs text-muted-foreground -mt-0.5">{userProfile.role}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-1 hidden sm:block"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userProfile.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
            <Link href={`/${userProfile.role.toLowerCase()}/profile`} className="cursor-pointer">
                <UserCircle2 className="mr-2 h-4 w-4" />
                Profile
            </Link>
        </DropdownMenuItem>
        {userProfile.role === 'Admin' && (
            <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Link>
            </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </AppProvider>
  );
}
