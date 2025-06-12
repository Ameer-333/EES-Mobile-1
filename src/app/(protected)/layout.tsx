
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
import Image from 'next/image'; // Added for logo

const LOCAL_STORAGE_APP_NAME_KEY = 'eesEducationAppName';
const LOCAL_STORAGE_LOGO_URL_KEY = 'eesEducationLogoUrl';

// Simplified and more direct role extraction from pathname
function getExpectedRoleFromPathname(pathname: string): UserRole | null {
  if (pathname.startsWith('/student/')) return 'Student';
  if (pathname.startsWith('/teacher/')) return 'Teacher';
  if (pathname.startsWith('/admin/')) return 'Admin';
  return null;
}


function getDashboardTitle(pathname: string, actualRole: UserRole | null, appName: string): string {
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

    return actualRole ? `${actualRole} View` : appName;
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
  const [currentAppName, setCurrentAppName] = useState('EES Education');
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const updateAppSettings = () => {
      const storedAppName = localStorage.getItem(LOCAL_STORAGE_APP_NAME_KEY);
      if (storedAppName) setCurrentAppName(storedAppName);
      const storedLogoUrl = localStorage.getItem(LOCAL_STORAGE_LOGO_URL_KEY);
      if (storedLogoUrl) setCurrentLogoUrl(storedLogoUrl);
    };
    updateAppSettings(); // Initial load

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true); 
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

            if (pathname.startsWith('/hall-of-fame') && !expectedRole) {
               setIsLoading(false);
               return; 
            }

            if (expectedRole && fetchedRole !== expectedRole) {
              toast({ title: "Access Denied", description: `Your role (${fetchedRole}) does not permit access to this ${expectedRole} page.`, variant: "destructive" });
              router.push('/'); 
            } else if (!expectedRole && !pathname.startsWith('/hall-of-fame') && !pathname.startsWith('/login') && pathname !== '/') {
               toast({ title: "Page Not Found", description: `The page (${pathname}) you are trying to access is not valid for your role.`, variant: "destructive" });
               router.push('/');
            }
             else {
              setIsLoading(false);
            }
          } else {
            toast({ title: "Access Denied", description: `Your user role ('${roleFromDb || 'Not Set'}') is not configured correctly in the database. Please contact admin.`, variant: "destructive" });
            await signOut(auth); 
            setAuthUser(null);
            setUserRole(null);
            router.push('/'); 
          }
        } else {
          toast({ title: "Access Denied", description: "User role not found in database. Please contact admin.", variant: "destructive" });
          await signOut(auth);
          setAuthUser(null);
          setUserRole(null);
          router.push('/'); 
        }
      } else {
        setAuthUser(null);
        setUserRole(null);
        if (!pathname.startsWith('/login') && pathname !== '/') { 
            router.push('/'); 
        } else {
          setIsLoading(false); 
        }
      }
       setTimeout(() => setIsLoading(false), 100);
    });

    window.addEventListener('appSettingsChanged', updateAppSettings);

    return () => {
      unsubscribe();
      window.removeEventListener('appSettingsChanged', updateAppSettings);
    };
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
  
  const pageTitle = getDashboardTitle(pathname, userRole, currentAppName);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verifying access...</p>
      </div>
    );
  }

  if (!authUser && !pathname.startsWith('/login') && pathname !=='/') {
      return (
        <div className="flex items-center justify-center min-h-screen">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
             <p className="ml-4 text-lg">Redirecting to login...</p>
        </div>
      );
  }
  
  const canRenderChildren = authUser && userRole && 
                           ( (getExpectedRoleFromPathname(pathname) === null && pathname.startsWith('/hall-of-fame')) || 
                             (getExpectedRoleFromPathname(pathname) === userRole) );


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href={userRole ? `/${userRole.toLowerCase()}/dashboard` : "/"} className="flex items-center gap-2 font-semibold text-primary">
              {currentLogoUrl ? (
                 <Image src={currentLogoUrl} alt="Logo" width={24} height={24} className="object-contain rounded-sm" data-ai-hint="school logo custom small" onError={() => setCurrentLogoUrl(null)} />
              ) : (
                <LogoIcon className="h-6 w-6" />
              )}
              <span className="font-headline">{currentAppName}</span>
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
                  {currentLogoUrl ? (
                    <Image src={currentLogoUrl} alt="Logo" width={24} height={24} className="object-contain rounded-sm" data-ai-hint="school logo custom small" onError={() => setCurrentLogoUrl(null)} />
                  ) : (
                    <LogoIcon className="h-6 w-6" />
                  )}
                  <span className="sr-only">{currentAppName}</span>
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
          {!isLoading && canRenderChildren && children}
        </main>
      </div>
    </div>
  );
}
