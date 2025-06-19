
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, User, BookOpen, Edit, Settings, Shield, Users as UsersIcon, LineChart, MessageSquarePlus, Mail, Award, MessageCircle, Building, BarChartHorizontalBig, CalendarCheck, DollarSign, CalendarClock, ClipboardList } from 'lucide-react'; // Added ClipboardList
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
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Building, roles: ['Student'] },
  
  // Teacher
  { href: '/teacher/dashboard', label: 'Dashboard', icon: Home, roles: ['Teacher'] },
  { href: '/teacher/students', label: 'Manage Students', icon: UsersIcon, roles: ['Teacher'] }, 
  { href: '/teacher/data-entry', label: 'Student Data Entry', icon: Edit, roles: ['Teacher'] },
  { href: '/teacher/give-remark', label: 'Give Student Remarks', icon: MessageSquarePlus, roles: ['Teacher'] },
  { href: '/teacher/messaging', label: 'Send Messages', icon: Mail, roles: ['Teacher'] },
  { href: '/teacher/profile', label: 'My Profile & Salary', icon: User, roles: ['Teacher'] },
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Building, roles: ['Teacher'] },

  // Admin
  { href: '/admin/dashboard', label: 'Dashboard', icon: Shield, roles: ['Admin'] },
  { href: '/admin/user-management', label: 'User Management', icon: UsersIcon, roles: ['Admin'] },
  { href: '/admin/teacher-management', label: 'Teacher Management', icon: UsersIcon, roles: ['Admin'] }, // Updated label
  { href: '/admin/hall-of-fame-management', label: 'Manage Hall of Fame', icon: Building, roles: ['Admin'] },
  { href: '/admin/analytics', label: 'Analytics', icon: LineChart, roles: ['Admin'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['Admin'] },
  { href: '/hall-of-fame', label: 'View Hall of Fame', icon: Building, roles: ['Admin'] },
];

function getCurrentRole(pathname: string): UserRole | null {
  if (pathname.startsWith('/student')) return 'Student';
  if (pathname.startsWith('/teacher')) return 'Teacher';
  if (pathname.startsWith('/admin')) return 'Admin';
  return null; 
}

export function SidebarNav() {
  const pathname = usePathname();
  const currentRole = getCurrentRole(pathname);
  
  const getEffectiveRoleForFiltering = () => {
    if (pathname.startsWith('/student')) return 'Student';
    if (pathname.startsWith('/teacher')) return 'Teacher';
    if (pathname.startsWith('/admin')) return 'Admin';
    return currentRole; 
  }

  const effectiveRole = getEffectiveRoleForFiltering();

  const filteredNavItems = navItems.filter(item => {
    if (effectiveRole) return item.roles.includes(effectiveRole);
    // If no specific role context (e.g. viewing /hall-of-fame directly), 
    // this part might need adjustment based on desired behavior for generic paths.
    // For now, if there's no effective role, no items will be shown by this logic.
    // The SidebarNav_Corrected logic seems more robust for determining items based on path.
    return false; 
  });
  
  return (
    <nav className="flex flex-col space-y-1">
      {navItems.filter(item => {
        if (currentRole && item.roles.includes(currentRole)) return true;
        // Special case for /hall-of-fame to show for any role if they are on that page.
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

  // Determine current actual role based on the path segment
  let currentActualRole: UserRole | null = null;
  if (rolePathSegment && ['student', 'teacher', 'admin'].includes(rolePathSegment)) {
    currentActualRole = rolePathSegment.charAt(0).toUpperCase() + rolePathSegment.slice(1) as UserRole;
  } else if (pathname.startsWith('/hall-of-fame')) {
    // If we are on hall-of-fame, but not under a role prefix, we need to check auth context.
    // For prototype simplicity, let's assume if not under student/teacher/admin and on hall-of-fame,
    // we don't know the role for *sidebar display*, so we might not show role-specific items.
    // The layout.tsx handles actual access. This component just decides what links to show.
    // A better approach would be to get the actual logged-in user's role from context.
    // For now, if not under /student, /teacher, /admin, no role-specific sidebar items are shown
    // unless it's the hall of fame link itself.
  }


  return (
    <nav className="flex flex-col space-y-1">
      {navItems.filter(item => {
        if (currentActualRole && item.roles.includes(currentActualRole)) {
            // If the item is /hall-of-fame, it should be active if the path is /hall-of-fame,
            // not /<role>/hall-of-fame
            if (item.href === '/hall-of-fame') return true;
            // For other role-specific items
            return item.href.startsWith(`/${currentActualRole.toLowerCase()}`) || item.href === '/hall-of-fame';
        }
        // If on /hall-of-fame without a role prefix, only show the /hall-of-fame link
        if (pathname.startsWith('/hall-of-fame') && item.href === '/hall-of-fame') {
           return true; // Show "Hall of Fame" if user is on that page, regardless of prefix.
        }
        return false;
      }).map((item) => {
          const isActive = item.href === '/hall-of-fame' 
                            ? pathname === item.href // Exact match for /hall-of-fame
                            : pathname.startsWith(item.href); // Prefix match for role-specific pages

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
