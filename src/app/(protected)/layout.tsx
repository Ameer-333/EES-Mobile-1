
// src/app/(protected)/layout.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
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
import { cn } from '@/lib/utils';


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
  // Use static defaults to avoid build-time Firestore fetch for these
  const [appName, setAppName] = useState('EES Education');
  const [logoUrl, setLogoUrl] = useState<string | null>(null); // Default to null, or a local path like '/default-logo.png'
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoadingAuth(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          if (!firestore) {
            console.error("Firestore instance is not available in AppProvider for fetching user profile.");
            // Potentially set userProfile to null or a default, and redirect or show error.
            // For now, this path leads to potential redirect if profile not found.
            throw new Error("Firestore not initialized");
          }
          const userDocRef = doc(firestore, getUserDocPath(firebaseUser.uid));
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profileData = userDocSnap.data() as ManagedUser;
            setUserProfile(profileData);

            // Role-based redirect logic
            const currentPath = window.location.pathname; // Use window.location.pathname for client-side routing checks
            const currentBasePath = currentPath.split('/')[1]?.toLowerCase();
            const userRolePath = profileData.role.toLowerCase();

            // Only redirect if not already on a login page, the root page, or a valid role path for the user
            if (currentBasePath && currentBasePath !== userRolePath) {
                // Check if the current path is not one of the allowed public/login paths or special paths like /hall-of-fame
                const isLoginPath = /^\/login\/(admin|teacher|student|coordinator)$/.test(currentPath);
                const isRootPath = currentPath === '/';
                const isHallOfFame = currentPath.startsWith('/hall-of-fame');


                if (!isLoginPath && !isRootPath && !isHallOfFame && !currentPath.startsWith(`/${userRolePath}/`)) {
                    console.log(`Redirecting to ${profileData.role} dashboard from ${currentPath} as currentBasePath (${currentBasePath}) !== userRolePath (${userRolePath}).`);
                    router.push(`/${userRolePath}/dashboard`);
                }
            }

          } else {
            setUserProfile(null);
            console.error("User profile not found in Firestore for UID:", firebaseUser.uid);
            // If user is authenticated but profile is missing, sign out and redirect to root
            // unless they are trying to access a login page or the root page.
             if (!window.location.pathname.startsWith('/login/') && window.location.pathname !== '/') {
                await firebaseSignOut(auth);
                router.push('/'); // Redirect to landing page after sign out
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
          // If there's an error fetching profile (e.g., Firestore unavailable), sign out and redirect
          if (!window.location.pathname.startsWith('/login/') && window.location.pathname !== '/') {
            await firebaseSignOut(auth); // Sign out the user
            router.push('/'); // Redirect to landing page
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        // If not authenticated, redirect to landing page, unless already on a public page
        if (!pathname.startsWith('/login/') && pathname !== '/') {
            router.push('/');
        }
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [router, pathname]); // Added pathname to dependencies

  // Removed useEffect that fetches appName and logoUrl from Firestore to improve build stability.
  // AppName and logoUrl now use static defaults.

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
    // Determine current role context based on path and user's actual role
    const pathSegments = pathname.split('/');
    if (pathSegments.length > 1) {
        const roleSegment = pathSegments[1].toLowerCase();
        // If on a role-specific path matching user's role, or on hall-of-fame, use user's role
        if (roleSegment === userProfile.role.toLowerCase() || roleSegment === 'hall-of-fame') {
            return userProfile.role;
        }
        // Fallback or if on a non-role-specific path but still protected, use user's role
    }
    return userProfile.role; // Default to user's actual role if path doesn't clearly indicate another context
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

  // If still loading or no user/profile, and not on a public page, show loading/redirect.
  // This check needs to be robust.
  if (!user || !userProfile) {
    // Allow access to public pages like login or root even if user is not fully loaded or missing profile.
    const isPublicPage = pathname.startsWith('/login/') || pathname === '/';
    if (!isPublicPage) {
        // If not on a public page and no user/profile, implies a redirect might be needed or in progress.
        // Show a generic loading state to avoid rendering protected content prematurely.
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-4 p-4">
                <Loader2 className="h-16 w-16 animate-spin text-destructive" />
                <p className="text-lg text-muted-foreground">Redirecting to login...</p>
            </div>
        );
    }
     // If on a public page and still loading/no user, show a simple loader.
     // This case is less common if redirects are handled above but serves as a fallback.
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-4 p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading...</p>
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

  // Function to determine the page title based on navigation items and current path
  const getPageTitle = () => {
    // Try to find an exact match or a parent match in navItems
    // Note: navItems are filtered by role in AppSidebarContent, this is a general lookup
    const item = navItems.find(navItem => {
        // Direct match or if path starts with navItem.href (for nested routes)
        if (pathname === navItem.href || pathname === `${navItem.href}/`) return true;
        if (navItem.href !== '/' && pathname.startsWith(navItem.href + '/')) return true;
        // Special case for Hall of Fame as it's a shared route
        if (navItem.href === '/hall-of-fame' && pathname.startsWith('/hall-of-fame')) return true;
        return false;
    });

    if (item) return item.label;

    // Fallback: Construct title from path segments if a role context exists
    if (currentRole) {
        const rolePath = `/${currentRole.toLowerCase()}`;
        if (pathname.startsWith(`${rolePath}/dashboard`)) return "Dashboard";
        if (pathname.startsWith(`${rolePath}/`)) {
            // Attempt to create a title from the first segment after the role
            const section = pathname.substring(rolePath.length + 1).split('/')[0];
            return section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');
        }
    }
    // Default title if no specific match is found
    return 'EES Education';
  };

  const pageTitle = getPageTitle();

  // This check should ideally not be hit if AppProvider handles unauthorized access
  if (!userProfile) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-4 p-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading user session...</p>
        </div>
    );
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
             {/* Pass currentActualRole to ensure correct nav items are displayed */}
             <AppSidebarContent currentActualRole={currentRole} navItems={navItems} />
          </SidebarContent>
          <SidebarFooter className="p-2 border-t border-sidebar-border">
            <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]/sidebar-wrapper:justify-center">
                <LogOut />
                <span className="group-data-[collapsible=icon]/sidebar-wrapper:hidden">Sign Out</span>
            </Button>
          </SidebarFooter>
      </Sidebar>

      {/* Main content wrapper: flex-1 ensures it takes remaining space. w-0 helps flex-1 behave correctly. */}
      <div className={cn(
          "flex flex-col flex-1 w-0 min-h-screen"
          // Apply left margin based on sidebar state for desktop if sidebar is not 'inset' or 'floating'
          // Adjust as per your Sidebar component's actual behavior if it pushes content
          // "md:group-data-[variant=sidebar]/sidebar-wrapper:group-data-[state=expanded]/sidebar-wrapper:ml-[var(--sidebar-width)]",
          // "md:group-data-[variant=sidebar]/sidebar-wrapper:group-data-[state=collapsed]/sidebar-wrapper:ml-[var(--sidebar-width-icon)]",
          // "transition-[margin-left] ease-in-out duration-300" // Smooth transition for margin change
        )}>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 shadow-sm">
            {/* Mobile Menu Button */}
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
            {/* Desktop Sidebar Trigger (if your sidebar component has one) */}
            <SidebarTrigger className="hidden md:flex" /> {/* Example, adjust if your sidebar has a different trigger mechanism */}
            <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
            </div>
            <UserNav userProfile={userProfile} signOut={signOut} />
        </header>
        <main className="flex-1 p-4 md:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

function UserNav({ userProfile, signOut }: { userProfile: ManagedUser; signOut: () => Promise<void>; }) {
  if (!userProfile) return null; // Should not happen if AppProvider logic is correct

  const userName = userProfile.name || "User";
  const userEmail = userProfile.email || "No email";
  const avatarFallbackChar = userName && userName.length > 0 ? userName.charAt(0).toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-auto px-2 space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
                src={userProfile.profilePictureUrl || `https://placehold.co/40x40.png`} // Provide a default placeholder
                alt={userName + " Avatar"}
                data-ai-hint="user avatar small"/>
            <AvatarFallback>{avatarFallbackChar}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
             <span className="text-sm font-medium text-foreground">{userName}</span>
             <span className="text-xs text-muted-foreground -mt-0.5">{userProfile.role}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-1 hidden sm:block"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
            {/* Ensure dynamic path based on role */}
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


