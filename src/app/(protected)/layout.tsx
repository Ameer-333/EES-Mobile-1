
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, UserCircle, Award } from 'lucide-react';
import { LogoIcon } from '@/components/icons/logo-icon';
import { SidebarNav_Corrected as SidebarNav } from '@/components/shared/sidebar-nav'; // Use corrected one
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserRole } from '@/types';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

function getCurrentRole(pathname: string): UserRole | null {
  if (pathname.startsWith('/student')) return 'Student';
  if (pathname.startsWith('/teacher')) return 'Teacher';
  if (pathname.startsWith('/admin')) return 'Admin';
  if (pathname.startsWith('/hall-of-fame')) {
    const segments = pathname.split('/');
    if (segments.length > 2 && ['student', 'teacher', 'admin'].includes(segments[1])) {
        return segments[1].charAt(0).toUpperCase() + segments[1].slice(1) as UserRole;
    }
  }
  return null;
}

function getDashboardTitle(pathname: string, role: UserRole | null): string {
    if (pathname.endsWith('/dashboard')) return `${role} Dashboard`;
    if (pathname.includes('/profile')) return `${role} Profile`;
    if (pathname.includes('/records')) return `My Academic Records`;
    if (pathname.includes('/students')) return `Manage Students`;
    if (pathname.includes('/data-entry')) return `Student Data Entry`;
    if (pathname.includes('/give-remark')) return `Provide Student Remark`;
    if (pathname.includes('/messaging')) return `Send Messages`;
    if (pathname.includes('/user-management')) return `User Management`;
    if (pathname.includes('/teacher-management')) return `Teacher Management`;
    if (pathname.includes('/hall-of-fame-management')) return `Manage Hall of Fame`;
    if (pathname.includes('/analytics')) return `System Analytics`;
    if (pathname.includes('/settings')) return `Admin Settings`;
    if (pathname.includes('/hall-of-fame')) return `Excellent Hall of Fame`;

    return role ? `${role} View` : 'EES Education';
}


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const layoutRole = pathname.split('/')[1] as UserRole | undefined;
  const currentActualRole = layoutRole && ['student', 'teacher', 'admin'].includes(layoutRole) 
                            ? layoutRole.charAt(0).toUpperCase() + layoutRole.slice(1) as UserRole 
                            : null;


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      // Redirect to the main landing page or a generic login page after logout
      // For now, let's go to the student login page as a default.
      router.push('/login/student'); 
    } catch (error) {
      console.error('Logout Error:', error);
      toast({
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const pageTitle = getDashboardTitle(pathname, currentActualRole);

  // In a real app, you'd also check if the user is authenticated here.
  // If not authenticated, redirect to login page.
  // For this iteration, we assume if they reach this layout, they are "authenticated" by URL.

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href={currentActualRole ? `/${currentActualRole.toLowerCase()}/dashboard` : "/"} className="flex items-center gap-2 font-semibold text-primary">
              <LogoIcon className="h-6 w-6" />
              <span className="font-headline">EES Education</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
              <SidebarNav />
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
                  href={currentActualRole ? `/${currentActualRole.toLowerCase()}/dashboard` : "/"}
                  className="flex items-center gap-2 text-lg font-semibold mb-4 text-primary"
                >
                  <LogoIcon className="h-6 w-6" />
                  <span className="sr-only">EES Education</span>
                </Link>
                <SidebarNav />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <h1 className="font-semibold text-lg">{pageTitle}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  {/* TODO: Update Avatar based on actual logged-in user */}
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${currentActualRole?.charAt(0)}`} alt="User Avatar" data-ai-hint="user avatar generic"/>
                  <AvatarFallback>{currentActualRole?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account ({currentActualRole || 'User'})</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {currentActualRole && ['Student', 'Teacher'].includes(currentActualRole) && (
                <DropdownMenuItem onClick={() => router.push(`/${currentActualRole.toLowerCase()}/profile`)}>Profile</DropdownMenuItem>
              )}
               {currentActualRole === 'Admin' && (
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
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
