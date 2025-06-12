
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, UserCircle, Award, Loader2 } from 'lucide-react';
import { LogoIcon } from '@/components/icons/logo-icon';
import { SidebarNav_Corrected as SidebarNav } from '@/components/shared/sidebar-nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserRole } from '@/types';
import { auth, firestore } from '@/lib/firebase';
import { signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function getExpectedRoleFromPathname(pathname: string): UserRole | null {
  if (pathname.startsWith('/student')) return 'Student';
  if (pathname.startsWith('/teacher')) return 'Teacher';
  if (pathname.startsWith('/admin')) return 'Admin';
  // For /hall-of-fame, access is granted if authenticated, specific role check might be done on page
  // or allow any authenticated user. For now, if it's under a role path, it uses that.
  // Otherwise, this layout implies some role is expected.
  // Let's refine this: if it's just /hall-of-fame, it's special.
  // All other /protected routes imply a specific role path.
  const segments = pathname.split('/');
    if (segments.length > 1 && ['student', 'teacher', 'admin'].includes(segments[1])) {
        return segments[1].charAt(0).toUpperCase() + segments[1].slice(1) as UserRole;
    }
  return null;
}

function getDashboardTitle(pathname: string, actualRole: UserRole | null): string {
    const rolePrefix = actualRole ? actualRole.toLowerCase() : '';

    if (pathname === `/${rolePrefix}/dashboard`) return `${actualRole} Dashboard`;
    if (pathname === `/${rolePrefix}/profile`) return `${actualRole} Profile`;
    if (pathname === `/${rolePrefix}/records`) return `My Academic Records`;
    if (pathname === `/${rolePrefix}/students`) return `Manage Students`;
    if (pathname === `/${rolePrefix}/data-entry`) return `Student Data Entry`;
    if (pathname === `/${rolePrefix}/give-remark`) return `Provide Student Remark`;
    if (pathname === `/${rolePrefix}/messaging`) return `Send Messages`;
    
    if (pathname === `/admin/user-management`) return `User Management`;
    if (pathname === `/admin/teacher-management`) return `Teacher Management`;
    if (pathname === `/admin/hall-of-fame-management`) return `Manage Hall of Fame`;
    if (pathname === `/admin/analytics`) return `System Analytics`;
    if (pathname === `/admin/settings`) return `Admin Settings`;
    
    if (pathname.startsWith(`/hall-of-fame`)) return `Excellent Hall of Fame`;

    return actualRole ? `${actualRole} View` : 'EES Education';
}


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        // Fetch role from Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const fetchedRole = userData.role as UserRole;
          setUserRole(fetchedRole);

          const expectedRole = getExpectedRoleFromPathname(pathname);
          // Allow access to /hall-of-fame for any authenticated user if no specific sub-path role like /admin/hall-of-fame
          if (pathname.startsWith('/hall-of-fame') && !expectedRole) {
             setIsLoading(false);
             return;
          }

          if (expectedRole && fetchedRole !== expectedRole) {
            toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
            router.push('/'); // Redirect to landing if role mismatch
          } else if (!expectedRole && fetchedRole) { 
            // If on a generic /protected path but has a role, redirect to their dashboard (this case might not occur with current routing)
            router.push(`/${fetchedRole.toLowerCase()}/dashboard`);
          } else {
            setIsLoading(false);
          }
        } else {
          // User document doesn't exist in Firestore or no role
          toast({ title: "Access Denied", description: "User role not found. Please contact admin.", variant: "destructive" });
          await signOut(auth); // Sign out the user as their setup is incomplete
          setAuthUser(null);
          setUserRole(null);
          router.push('/'); 
        }
      } else {
        setAuthUser(null);
        setUserRole(null);
        // Only redirect if not on a public part of /hall-of-fame (if we decide to make it partially public)
        // For now, all /protected routes require auth. /hall-of-fame is under /protected implicitly.
        if (!pathname.startsWith('/login')) { // Avoid redirect loop from login pages
            router.push('/'); 
        }
      }
      // Defer setting isLoading to false until after potential immediate redirects
      // to prevent brief flash of content.
      // A small delay might be needed if router.push is too fast.
      // For now, this should mostly work.
      if (isLoading) { // only set if it was true
          setTimeout(() => setIsLoading(false), 50); // Small delay to allow router to push
      }
    });

    return () => unsubscribe();
  }, [pathname, router, toast, isLoading]); // Added isLoading to dependencies

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      setAuthUser(null);
      setUserRole(null);
      router.push('/'); 
    } catch (error) {
      console.error('Logout Error:', error);
      toast({
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const pageTitle = getDashboardTitle(pathname, userRole);
  const sidebarRoleForNav = getExpectedRoleFromPathname(pathname) || userRole;


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading EES Education...</p>
      </div>
    );
  }

  if (!authUser && !pathname.startsWith('/login')) { // Double check to prevent rendering if redirect is slow
      // Already handled by useEffect, but as a safeguard.
      // router.push('/'); // This might cause an infinite loop if not careful with public pages
      return ( // Minimal render before redirect fully kicks in
        <div className="flex items-center justify-center min-h-screen">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
             <p className="ml-4 text-lg">Redirecting...</p>
        </div>
      );
  }


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href={userRole ? `/${userRole.toLowerCase()}/dashboard` : "/"} className="flex items-center gap-2 font-semibold text-primary">
              <LogoIcon className="h-6 w-6" />
              <span className="font-headline">EES Education</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
              {/* Pass the determined role for sidebar navigation */}
              {authUser && userRole && <SidebarNav />}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href={userRole ? `/${userRole.toLowerCase()}/dashboard` : "/"}
                  className="flex items-center gap-2 text-lg font-semibold mb-4 text-primary"
                >
                  <LogoIcon className="h-6 w-6" />
                  <span className="sr-only">EES Education</span>
                </Link>
                {authUser && userRole && <SidebarNav />}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <h1 className="font-semibold text-lg">{pageTitle}</h1>
          </div>
          {authUser && userRole && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={authUser.photoURL || `https://placehold.co/40x40.png?text=${userRole?.charAt(0)}`} alt="User Avatar" data-ai-hint="user avatar generic"/>
                    <AvatarFallback>{userRole?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account ({userRole || 'User'})</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userRole && ['Student', 'Teacher'].includes(userRole) && (
                  <DropdownMenuItem onClick={() => router.push(`/${userRole.toLowerCase()}/profile`)}>Profile</DropdownMenuItem>
                )}
                 {userRole === 'Admin' && (
                  <DropdownMenuItem onClick={() => router.push(`/admin/settings`)}>Settings</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push(`/hall-of-fame`)}>
                  <Award className="mr-2 h-4 w-4" /> Hall of Fame
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-auto">
          {/* Only render children if user is authenticated and role check has passed (or is not needed for this path) */}
          {authUser && userRole && children} 
          {/* Consider a specific message if role check failed but we are not redirecting, though current logic redirects */}
        </main>
      </div>
    </div>
  );
}
