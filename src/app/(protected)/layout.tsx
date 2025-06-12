
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

// Simplified and more direct role extraction from pathname
function getExpectedRoleFromPathname(pathname: string): UserRole | null {
  if (pathname.startsWith('/student/')) return 'Student';
  if (pathname.startsWith('/teacher/')) return 'Teacher';
  if (pathname.startsWith('/admin/')) return 'Admin';
  // For shared pages like /hall-of-fame directly under /protected, no specific role is "expected" by path alone.
  // The /hall-of-fame path itself does not imply a role like /admin/hall-of-fame does.
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
      setIsLoading(true); // Start loading whenever auth state might change
      if (user) {
        setAuthUser(user);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const roleFromDb = userData.role;

          if (roleFromDb && ['Admin', 'Teacher', 'Student'].includes(roleFromDb)) {
            const fetchedRole = roleFromDb as UserRole;
            setUserRole(fetchedRole);
            const expectedRole = getExpectedRoleFromPathname(pathname);

            // Allow access to /hall-of-fame for any authenticated user with a valid role,
            // if no more specific sub-path role (like /admin/hall-of-fame) is expected.
            if (pathname.startsWith('/hall-of-fame') && !expectedRole) {
               setIsLoading(false);
               return; // User has a valid role and is on /hall-of-fame, allow access.
            }

            if (expectedRole && fetchedRole !== expectedRole) {
              toast({ title: "Access Denied", description: `Your role (${fetchedRole}) does not permit access to this ${expectedRole} page.`, variant: "destructive" });
              router.push('/'); 
            } else if (!expectedRole && !pathname.startsWith('/hall-of-fame') && !pathname.startsWith('/login') && pathname !== '/') {
               // This case handles if a user is logged in, has a role, but tries to access a path that doesn't have an "expectedRole"
               // and isn't a known shared path like /hall-of-fame. E.g. /protected/unknown-page
               // This situation should ideally not happen with current nav, but acts as a safeguard.
               toast({ title: "Page Not Found", description: `The page (${pathname}) you are trying to access is not valid for your role.`, variant: "destructive" });
               router.push('/');
            }
             else {
              // Role matches, or no specific role expected by path and user has a valid role (e.g. navigating to /hall-of-fame which is fine)
              setIsLoading(false);
            }
          } else {
            // Role is missing from Firestore or is not a valid UserRole string
            toast({ title: "Access Denied", description: `Your user role ('${roleFromDb || 'Not Set'}') is not configured correctly in the database. Please contact admin.`, variant: "destructive" });
            await signOut(auth); 
            setAuthUser(null);
            setUserRole(null);
            router.push('/'); 
          }
        } else {
          // User document doesn't exist in Firestore (meaning no role assigned)
          toast({ title: "Access Denied", description: "User role not found in database. Please contact admin.", variant: "destructive" });
          await signOut(auth);
          setAuthUser(null);
          setUserRole(null);
          router.push('/'); 
        }
      } else {
        // No user logged in
        setAuthUser(null);
        setUserRole(null);
        // Only redirect if not on a public page or login page
        // (Currently all pages under /protected require auth)
        if (!pathname.startsWith('/login') && pathname !== '/') { 
            router.push('/'); 
        } else {
          setIsLoading(false); // On landing or login page, stop loading
        }
      }
       // Fallback to stop loading if no other path explicitly did.
       // This timeout helps prevent content flashing if redirects are quick.
       setTimeout(() => setIsLoading(false), 100);
    });

    return () => unsubscribe();
  }, [pathname, router, toast]); 

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


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verifying access...</p>
      </div>
    );
  }

  // If after loading, there's no authenticated user with a role, and we're not on a public page (like /login or /)
  // This case should ideally be caught by the onAuthStateChanged logic redirecting,
  // but as a final check before rendering children.
  if (!authUser && !pathname.startsWith('/login') && pathname !=='/') {
      // Redirect already handled in useEffect, this is a safeguard display before redirect effect takes place
      return (
        <div className="flex items-center justify-center min-h-screen">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
             <p className="ml-4 text-lg">Redirecting to login...</p>
        </div>
      );
  }
  
  // Render children only if user is authenticated and has a role (or if on a page that doesn't need role check like /hall-of-fame for any authenticated user)
  const canRenderChildren = authUser && userRole && 
                           ( (getExpectedRoleFromPathname(pathname) === null && pathname.startsWith('/hall-of-fame')) || 
                             (getExpectedRoleFromPathname(pathname) === userRole) );


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
          {/* Render children if authorized and not loading */}
          {!isLoading && canRenderChildren && children}
          {/* Consider a specific message if role check failed, though current logic redirects */}
        </main>
      </div>
    </div>
  );
}

    
