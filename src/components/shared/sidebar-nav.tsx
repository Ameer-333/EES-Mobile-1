
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, User, BookOpen, Edit, Settings, Shield, Users as UsersIcon, LineChart, MessageSquarePlus, Mail, Award, MessageCircle, Building, BarChartHorizontalBig, CalendarCheck, DollarSign, CalendarClock, ClipboardList, ClipboardUser } from 'lucide-react'; 
import type { UserRole } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Student
  { href: '/student/dashboard', label: 'Dashboard', icon: Home, roles: ['Student'] },
  { href: '/student/profile', label: 'Profile & Activities', icon: User, roles: ['Student'] },
  { href: '/student/records', label: 'Academic Records', icon: BookOpen, roles: ['Student'] },
  { href: '/student/attendance', label: 'My Attendance', icon: CalendarClock, roles: ['Student'] },
  { href: '/student/remarks', label: 'My Remarks', icon: BarChartHorizontalBig, roles: ['Student'] },
  { href: '/student/events', label: 'Upcoming Events', icon: CalendarCheck, roles: ['Student'] },
  { href: '/student/scholarships', label: 'My Scholarships', icon: Award, roles: ['Student'] },
  
  // Teacher
  { href: '/teacher/dashboard', label: 'Dashboard', icon: Home, roles: ['Teacher'] },
  { href: '/teacher/students', label: 'Manage Students', icon: UsersIcon, roles: ['Teacher'] }, 
  { href: '/teacher/data-entry', label: 'Student Data Entry', icon: Edit, roles: ['Teacher'] },
  { href: '/teacher/give-remark', label: 'Give Student Remarks', icon: MessageSquarePlus, roles: ['Teacher'] },
  { href: '/teacher/messaging', label: 'Send Messages', icon: Mail, roles: ['Teacher'] },
  { href: '/teacher/profile', label: 'My Profile & Salary', icon: User, roles: ['Teacher'] },

  // Admin
  { href: '/admin/dashboard', label: 'Dashboard', icon: Shield, roles: ['Admin'] },
  { href: '/admin/user-management', label: 'User Management', icon: UsersIcon, roles: ['Admin'] },
  { href: '/admin/teacher-management', label: 'Teacher Management', icon: UsersIcon, roles: ['Admin'] },
  { href: '/admin/hall-of-fame-management', label: 'Manage Hall of Fame', icon: Building, roles: ['Admin'] },
  { href: '/admin/analytics', label: 'Analytics', icon: LineChart, roles: ['Admin'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['Admin'] },
  
  // Coordinator
  { href: '/coordinator/dashboard', label: 'Dashboard', icon: ClipboardUser, roles: ['Coordinator'] },
  { href: '/coordinator/students', label: 'All Students', icon: UsersIcon, roles: ['Coordinator'] }, // Placeholder, will link to a modified student management page
  { href: '/coordinator/teachers', label: 'All Teachers', icon: UsersIcon, roles: ['Coordinator'] }, // Placeholder, will link to a modified teacher management page
  { href: '/coordinator/data-entry', label: 'Global Data Entry', icon: Edit, roles: ['Coordinator'] }, // Placeholder

  // Shared
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Building, roles: ['Student', 'Teacher', 'Admin', 'Coordinator'] },
];


function getCurrentRole(pathname: string): UserRole | null {
  if (pathname.startsWith('/student')) return 'Student';
  if (pathname.startsWith('/teacher')) return 'Teacher';
  if (pathname.startsWith('/admin')) return 'Admin';
  if (pathname.startsWith('/coordinator')) return 'Coordinator';
  return null; 
}

export function SidebarNav() {
  const pathname = usePathname();
  const currentRole = getCurrentRole(pathname);
  
  const getEffectiveRoleForFiltering = () => {
    if (pathname.startsWith('/student')) return 'Student';
    if (pathname.startsWith('/teacher')) return 'Teacher';
    if (pathname.startsWith('/admin')) return 'Admin';
    if (pathname.startsWith('/coordinator')) return 'Coordinator';
    return currentRole; 
  }

  const effectiveRole = getEffectiveRoleForFiltering();

  const filteredNavItems = navItems.filter(item => {
    if (effectiveRole) return item.roles.includes(effectiveRole);
    return false; 
  });
  
  return (
    <nav className="flex flex-col space-y-1">
      {navItems.filter(item => {
        if (currentRole && item.roles.includes(currentRole)) return true;
        if (item.href === '/hall-of-fame' && pathname.startsWith('/hall-of-fame') && currentRole) return true;
        return false; 
      }).map((item) => (
        <Button
          key={item.href + (currentRole || '')} 
          asChild
          variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start text-sm h-9',
            pathname.startsWith(item.href) && 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90'
          )}
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}


export function SidebarNav_Corrected() {
  const pathname = usePathname();
  const rolePathSegment = usePathname().split('/')[1] as UserRole | undefined; 

  let currentActualRole: UserRole | null = null;
  if (rolePathSegment && ['student', 'teacher', 'admin', 'coordinator'].includes(rolePathSegment)) {
    currentActualRole = rolePathSegment.charAt(0).toUpperCase() + rolePathSegment.slice(1) as UserRole;
  } else if (pathname.startsWith('/hall-of-fame')) {
    // Logic for /hall-of-fame without a role prefix
  }


  return (
    <nav className="flex flex-col space-y-1">
      {navItems.filter(item => {
        if (currentActualRole && item.roles.includes(currentActualRole)) {
            if (item.href === '/hall-of-fame') return true;
            // For other role-specific items
            return item.href.startsWith(`/${currentActualRole.toLowerCase()}`) || item.href === '/hall-of-fame';
        }
        if (pathname.startsWith('/hall-of-fame') && item.href === '/hall-of-fame') {
           return true;
        }
        return false;
      }).map((item) => {
          const isActive = item.href === '/hall-of-fame' 
                            ? pathname === item.href 
                            : pathname.startsWith(item.href);

          return (
            <Button
              key={item.href + item.label + (currentActualRole || '')} 
              asChild
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start text-sm h-9', 
                isActive && 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90'
              )}
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
    </nav>
  );
}
