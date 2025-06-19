
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, Award, Loader2, SettingsIcon } from 'lucide-react';
import { LogoIcon } from '@/components/icons/logo-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserRole, ManagedUser } from '@/types';
import { auth, firestore } from '@/lib/firebase';
import { signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { getGeneralSettingsDocPath, getUserDocPath } from '@/lib/firestore-paths';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar, 
} from '@/components/ui/sidebar';
import { AppSidebarContent } from '@/components/shared/app-sidebar-content';
import { navItems } from '@/components/shared/sidebar-nav';


interface UserProfileContextData extends ManagedUser {
  photoURL?: string | null;
}

interface AppContextType {
  authUser: FirebaseUser | null;
  userProfile: UserProfileContextData | null;
  isLoadingAuth: boolean;
  currentAppName: string;
  currentLogoUrl: string | null;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

function getExpectedRoleFromPathname(pathname: string): UserRole | null {
  if (pathname.startsWith('/student/')) return 'Student';
  if (pathname.startsWith('/teacher/')) return 'Teacher';
  if (pathname.startsWith('/admin/')) return 'Admin';
  if (pathname.startsWith('/coordinator/')) return 'Coordinator';
  return null;
}

function getDashboardTitle(pathname: string, actualRole: UserRole | null, appName: string): string {
    const rolePrefix = actualRole ? actualRole.toLowerCase() : '';

    if (pathname === `/${rolePrefix}/dashboard`) return `${actualRole} Dashboard`;
    if (pathname === `/${rolePrefix}/profile`) return `${actualRole} Profile`;
    if (pathname === `/${rolePrefix}/records`) return `My Academic Records`;
    if (pathname === `/${rolePrefix}/attendance`) return `My Attendance`;
    if (pathname === `/${rolePrefix}/remarks`) return `My Remarks`;
    if (pathname === `/${rolePrefix}/events`) return `Upcoming Events`;
    if (pathname === `/${rolePrefix}/scholarships`) return `My Scholarships`;
    if (pathname === `/${rolePrefix}/students`) return `Manage Students`;
    if (pathname === `/${rolePrefix}/data-entry`) return `Student Data Entry`;
    if (pathname === `/${rolePrefix}/give-remark`) return `Provide Student Remark`;
    if (pathname === `/${rolePrefix}/messaging`) return `Send Messages`;
    if (pathname === `/admin/user-management`) return `User Management`;
    if (pathname === `/admin/teacher-management`) return `Teacher Management`;
    if (pathname === `/admin/hall-of-fame-management`) return `Manage Hall of Fame`;
    if (pathname === `/admin/analytics`) return `System Analytics`;
    if (pathname === `/admin/settings`) return `Admin Settings`;
    if (pathname === `/coordinator/students`) return `All Student Management`;
    if (pathname === `/coordinator/teacher-management`) return `All Teacher Management`; 
    if (pathname === `/coordinator/data-entry`) return `Global Student Data Entry`;
    if (pathname.startsWith(`/hall-of-fame`)) return `EES Hall of Fame`;
    return actualRole ? `${actualRole} View` : appName;
}

function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileContextData | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentAppName, setCurrentAppName] = useState('EES Education');
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAppSettings = async () => {
      const settingsDocPath = getGeneralSettingsDocPath();
      const settingsDocRef = doc(firestore, settingsDocPath);
      try {
        const settingsDocSnap = await getDoc(settingsDocRef);
        if (settingsDocSnap.exists()) {
          const appData = settingsDocSnap.data();
          setCurrentAppName(appData.appName || 'EES Education');
          setCurrentLogoUrl(appData.logoUrl || null);
        } else {
          setCurrentAppName('EES Education'); 
          setCurrentLogoUrl(null);
        }
      } catch (error) {
        console.error("Error fetching app settings for layout:", error);
      }
    };
    fetchAppSettings(); 

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoadingAuth(true); 
      if (user) {
        setAuthUser(user);
        const userDocPath = getUserDocPath(user.uid);
        const userDocRef = doc(firestore, userDocPath);
        let userDocSnap = await getDoc(userDocRef); 

        if (!userDocSnap.exists() && user.metadata.creationTime) {
          const now = new Date().getTime();
          const creationTimestamp = new Date(user.metadata.creationTime).getTime();
          if (now - creationTimestamp < 5000) { 
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            userDocSnap = await getDoc(userDocRef); 
          }
        }

        if (userDocSnap.exists()) {
          const userDataFromFirestore = userDocSnap.data() as ManagedUser; 
          const profile: UserProfileContextData = {
            ...userDataFromFirestore, 
            id: user.uid, 
            email: user.email || userDataFromFirestore.email, 
            displayName: userDataFromFirestore.name || user.displayName || user.email?.split('@')[0] || "User",
            photoURL: user.photoURL, 
          };
          setUserProfile(profile);
          const roleFromDb = profile.role;

          if (roleFromDb && ['Admin', 'Teacher', 'Student', 'Coordinator'].includes(roleFromDb)) {
            const expectedRole = getExpectedRoleFromPathname(pathname);
            if (pathname.startsWith('/hall-of-fame') && !expectedRole) {
               setIsLoadingAuth(false); return; 
            }
            if (expectedRole && roleFromDb !== expectedRole) {
              toast({ title: "Access Denied", description: `Your role (${roleFromDb}) does not permit access to this ${expectedRole} page. Redirecting...`, variant: "destructive" });
              router.push('/'); 
            } else if (!expectedRole && !pathname.startsWith('/hall-of-fame') && !pathname.startsWith('/login') && pathname !== '/') {
               toast({ title: "Page Not Found", description: `The page (${pathname}) you are trying to access is not valid for your role. Redirecting...`, variant: "destructive" });
               router.push('/');
            }
          } else {
            toast({ title: "Role Configuration Error", description: `Your user role ('${roleFromDb || 'Not Set'}') is not configured correctly. Please contact an administrator.`, variant: "destructive" });
            await signOut(auth); 
            setAuthUser(null); setUserProfile(null);
            router.push('/'); 
          }
        } else {
          toast({ 
            title: "Profile Error", 
            description: `Your user profile (${user.email}) was not found in Firestore. This is required for app access. Please contact an administrator to ensure your profile is correctly set up. You will be logged out.`, 
            variant: "destructive",
            duration: 10000 
          });
          await signOut(auth);
          setAuthUser(null); setUserProfile(null);
          router.push('/'); 
        }
      } else {
        setAuthUser(null); setUserProfile(null);
        if (!pathname.startsWith('/login') && pathname !== '/') { 
            router.push('/'); 
        }
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [pathname, router, toast]); 

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      setAuthUser(null); setUserProfile(null);
      router.push('/'); 
    } catch (error) {
      console.error('Logout Error:', error);
      toast({ title: 'Logout Failed', description: 'Could not log you out.', variant: 'destructive' });
    }
  };
  
  return (
    <AppContext.Provider value={{ authUser, userProfile, isLoadingAuth, currentAppName, currentLogoUrl, logout: handleLogout }}>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AppContext.Provider>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </AppProvider>
  );
}

function ProtectedLayoutContent({ children }: { children: React.ReactNode; }) {
  const { authUser, userProfile, isLoadingAuth, currentAppName, currentLogoUrl, logout } = useAppContext();
  const { setOpenMobile } = useSidebar(); 
  const router = useRouter();
  const pathname = usePathname();
  
  // const pageTitle = getDashboardTitle(pathname, userProfile?.role || null, currentAppName); // Temporarily remove for diagnosis

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Verifying access & loading application (Layout)...</p>
      </div>
    );
  }

  if (!authUser && !pathname.startsWith('/login') && pathname !=='/') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
             <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
             <p className="text-lg text-muted-foreground">Redirecting to login (Layout)...</p>
        </div>
      );
  }
  
  const canRenderChildren = authUser && userProfile?.role && 
                           ( (getExpectedRoleFromPathname(pathname) === null && pathname.startsWith('/hall-of-fame')) || 
                             (getExpectedRoleFromPathname(pathname) === userProfile?.role) );

  // --- TEMPORARY SIMPLIFIED LAYOUT FOR DIAGNOSIS ---
  if (canRenderChildren) {
    return (
        <div style={{ border: '3px dashed blue', padding: '20px', margin: '20px', minHeight: '100vh' }}>
            <h1 style={{ color: 'blue', fontSize: '24px', fontWeight: 'bold' }}>Diagnostic: Simplified Protected Layout Active</h1>
            <p style={{ marginBottom: '10px' }}>App Name: {currentAppName}</p>
            {userProfile && <p>User: {userProfile.displayName} ({userProfile.role})</p>}
            <p>Attempting to render page content below:</p>
            <hr style={{ margin: '10px 0' }} />
            <div style={{ border: '1px solid green', padding: '10px' }}>
                 {children}
            </div>
        </div>
    );
  } else if (!isLoadingAuth) {
    // This case implies authUser might be present, but userProfile or role check failed, or path mismatch
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-lg text-destructive font-semibold">Access Issue or Page Not Found</p>
            <p className="text-md text-muted-foreground">
                Cannot render page content. You might not have permission for this page, or the page doesn't exist.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
                Auth User: {authUser ? 'Logged In' : 'Not Logged In'} <br />
                User Profile: {userProfile ? `Loaded (Role: ${userProfile.role || 'N/A'})` : 'Not Loaded'} <br />
                Path: {pathname} <br/>
                Expected Role: {getExpectedRoleFromPathname(pathname) || 'N/A (e.g., /hall-of-fame or invalid path)'}
            </p>
            <Button onClick={() => router.push('/')} className="mt-4">Go to Home</Button>
            {authUser && <Button onClick={logout} variant="outline" className="mt-2">Logout</Button>}
        </div>
    );
  }
  // Fallback if still loading or other edge cases
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Preparing application...</p>
    </div>
  );


  // --- ORIGINAL COMPLEX LAYOUT (COMMENTED OUT FOR DIAGNOSIS) ---
  /*
  return (
    <>
      <Sidebar collapsible="icon" className="border-r shadow-md bg-sidebar text-sidebar-foreground" variant="sidebar">
        <SidebarHeader className="flex h-[60px] items-center border-b border-sidebar-border px-4 lg:px-6">
          <Link href={userProfile?.role ? `/${userProfile.role.toLowerCase()}/dashboard` : "/"} className="flex items-center gap-3 font-semibold text-sidebar-primary">
            {currentLogoUrl ? (
               <Image src={currentLogoUrl} alt="Logo" width={32} height={32} className="object-contain rounded-md" data-ai-hint="school logo custom small" onError={() => { }} />
            ) : (
              <LogoIcon className="h-7 w-7" />
            )}
            <span className="font-headline text-lg">{currentAppName}</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="py-4">
          {authUser && userProfile?.role && <AppSidebarContent currentActualRole={userProfile.role} navItems={navItems} onLinkClick={() => setOpenMobile(false)} />}
        </SidebarContent>
        <SidebarFooter className="mt-auto p-4 border-t border-sidebar-border">
           <p className="text-xs text-sidebar-foreground/60 text-center">&copy; {new Date().getFullYear()} {currentAppName}</p>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset> 
        <header className="flex h-[60px] items-center gap-4 border-b bg-background px-4 lg:px-6 shadow-sm">
          <SidebarTrigger className="md:hidden border-border/70 hover:bg-accent" />
          
          <div className="w-full flex-1">
            {userProfile?.displayName && (
              <p className="text-sm text-muted-foreground">Hello, {userProfile.displayName}!</p>
            )}
            <h1 className="font-semibold text-lg text-foreground">{pageTitle}</h1>
          </div>

          {authUser && userProfile?.role && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-accent">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userProfile.photoURL || `https://placehold.co/40x40.png?text=${userProfile.role?.charAt(0)}`} alt="User Avatar" data-ai-hint="user avatar generic"/>
                    <AvatarFallback className="bg-muted text-muted-foreground">{userProfile.role?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile.displayName || userProfile.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userProfile.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userProfile.role && (userProfile.role === 'Student' || userProfile.role === 'Teacher') && (
                  <DropdownMenuItem onClick={() => router.push(`/${userProfile.role!.toLowerCase()}/profile`)}>
                    <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Profile
                  </DropdownMenuItem>
                )}
                 {userProfile.role === 'Admin' && (
                  <DropdownMenuItem onClick={() => router.push(`/admin/settings`)}>
                     <SettingsIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Settings
                  </DropdownMenuItem>
                )}
                 {userProfile.role === 'Coordinator' && ( 
                  <DropdownMenuItem onClick={() => router.push(`/admin/settings`)}>
                     <SettingsIcon className="mr-2 h-4 w-4 text-muted-foreground" /> View Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push(`/hall-of-fame`)}>
                  <Award className="mr-2 h-4 w-4 text-muted-foreground" /> Hall of Fame
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 bg-background rounded-tl-lg md:rounded-none overflow-auto">
          {!isLoadingAuth && canRenderChildren && children}
        </main>
      </SidebarInset>
    </>
  );
  */
}
