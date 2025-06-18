
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, UserCircle, Award, Loader2, SettingsIcon } from 'lucide-react';
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
import type { UserRole, TeacherAssignment, ManagedUser } from '@/types';
import { auth, firestore } from '@/lib/firebase';
import { signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const APP_SETTINGS_COLLECTION = 'app_settings';
const GENERAL_SETTINGS_DOC_ID = 'general';
const USERS_COLLECTION = 'users';

// UserProfile now aligns more with ManagedUser but for the logged-in user's context
interface UserProfileContextData extends ManagedUser {
  // ManagedUser already has id (authUid), email, displayName, role, assignments, classId, studentProfileId
  photoURL?: string | null; // from FirebaseUser
}


interface AppContextType {
  authUser: FirebaseUser | null;
  userProfile: UserProfileContextData | null; // Using the more comprehensive ManagedUser type
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
      const settingsDocRef = doc(firestore, APP_SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC_ID);
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
        const userDocRef = doc(firestore, USERS_COLLECTION, user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userDataFromFirestore = userDocSnap.data() as ManagedUser; // Explicitly type from Firestore
          
          const profile: UserProfileContextData = {
            ...userDataFromFirestore, // Spread all fields from ManagedUser
            id: user.uid, // Ensure id is authUid
            email: user.email || userDataFromFirestore.email, // Prefer auth email, fallback to Firestore
            displayName: userDataFromFirestore.name || user.displayName || user.email?.split('@')[0] || "User",
            photoURL: user.photoURL, // Get from Firebase Auth user object
            // role, assignments, classId, studentProfileId, status, etc., come from userDataFromFirestore
          };
          setUserProfile(profile);

          const roleFromDb = profile.role;

          if (roleFromDb && ['Admin', 'Teacher', 'Student'].includes(roleFromDb)) {
            const expectedRole = getExpectedRoleFromPathname(pathname);
            if (pathname.startsWith('/hall-of-fame') && !expectedRole) {
               setIsLoadingAuth(false);
               return; 
            }
            if (expectedRole && roleFromDb !== expectedRole) {
              toast({ title: "Access Denied", description: `Your role (${roleFromDb}) does not permit access to this ${expectedRole} page.`, variant: "destructive" });
              router.push('/'); 
            } else if (!expectedRole && !pathname.startsWith('/hall-of-fame') && !pathname.startsWith('/login') && pathname !== '/') {
               toast({ title: "Page Not Found", description: `The page (${pathname}) you are trying to access is not valid for your role.`, variant: "destructive" });
               router.push('/');
            }
          } else {
            toast({ title: "Access Denied", description: `Your user role ('${roleFromDb || 'Not Set'}') is not configured correctly. Contact admin.`, variant: "destructive" });
            await signOut(auth); 
            setAuthUser(null); setUserProfile(null);
            router.push('/'); 
          }
        } else {
          toast({ title: "Access Denied", description: "User profile not found in Firestore. Contact admin.", variant: "destructive" });
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
      {children}
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
  const router = useRouter();
  const pathname = usePathname();
  
  const pageTitle = getDashboardTitle(pathname, userProfile?.role || null, currentAppName);

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Verifying access & loading application...</p>
      </div>
    );
  }

  if (!authUser && !pathname.startsWith('/login') && pathname !=='/') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
             <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
             <p className="text-lg text-muted-foreground">Redirecting to login...</p>
        </div>
      );
  }
  
  const canRenderChildren = authUser && userProfile?.role && 
                           ( (getExpectedRoleFromPathname(pathname) === null && pathname.startsWith('/hall-of-fame')) || 
                             (getExpectedRoleFromPathname(pathname) === userProfile?.role) );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] bg-muted/30">
      <div className="hidden border-r bg-sidebar text-sidebar-foreground md:block shadow-md">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b border-sidebar-border px-4 lg:px-6">
            <Link href={userProfile?.role ? `/${userProfile.role.toLowerCase()}/dashboard` : "/"} className="flex items-center gap-3 font-semibold text-primary">
              {currentLogoUrl ? (
                 <Image src={currentLogoUrl} alt="Logo" width={32} height={32} className="object-contain rounded-md" data-ai-hint="school logo custom small" onError={() => { /* Handle error if needed, e.g., revert to LogoIcon */ }} />
              ) : (
                <LogoIcon className="h-7 w-7 text-sidebar-primary" />
              )}
              <span className="font-headline text-lg text-sidebar-primary">{currentAppName}</span>
            </Link>
          </div>
          <div className="flex-1 py-4">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {authUser && userProfile?.role && <SidebarNav />}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t border-sidebar-border">
             <p className="text-xs text-sidebar-foreground/60 text-center">&copy; {new Date().getFullYear()} {currentAppName}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-[60px] items-center gap-4 border-b bg-background px-4 lg:px-6 shadow-sm">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden border-border/70 hover:bg-accent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 bg-sidebar text-sidebar-foreground">
              <div className="flex h-[60px] items-center border-b border-sidebar-border px-4">
                <Link
                    href={userProfile?.role ? `/${userProfile.role.toLowerCase()}/dashboard` : "/"}
                    className="flex items-center gap-3 text-lg font-semibold text-sidebar-primary"
                >
                    {currentLogoUrl ? (
                        <Image src={currentLogoUrl} alt="Logo" width={28} height={28} className="object-contain rounded-md" data-ai-hint="school logo custom small" onError={() => {/* Revert to icon or hide */}} />
                    ) : ( <LogoIcon className="h-6 w-6" /> )}
                    <span className="font-headline">{currentAppName}</span>
                </Link>
              </div>
              <nav className="grid gap-2 text-lg font-medium p-4">
                {authUser && userProfile?.role && <SidebarNav />}
              </nav>
               <div className="mt-auto p-4 border-t border-sidebar-border">
                 <p className="text-xs text-sidebar-foreground/60 text-center">&copy; {new Date().getFullYear()} {currentAppName}</p>
              </div>
            </SheetContent>
          </Sheet>
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
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile.role}
                    </p>
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
                <DropdownMenuItem onClick={() => router.push(`/hall-of-fame`)}>
                  <Award className="mr-2 h-4 w-4 text-muted-foreground" /> Hall of Fame
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 bg-background rounded-tl-lg md:rounded-none overflow-auto shadow-inner-top-left">
          {!isLoadingAuth && canRenderChildren && children}
        </main>
      </div>
    </div>
  );
}

    