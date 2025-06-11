
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, User, BookOpen, Edit, Settings, Shield, Users as UsersIcon, LineChart, MessageSquarePlus, Mail, Award, MessageCircle, Building } from 'lucide-react';
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
  { href: '/student/doubts', label: 'AI Doubts Helper', icon: MessageCircle, roles: ['Student']}, // Existing one
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Award, roles: ['Student'] },
  
  // Teacher
  { href: '/teacher/dashboard', label: 'Dashboard', icon: Home, roles: ['Teacher'] },
  { href: '/teacher/students', label: 'Manage Students', icon: UsersIcon, roles: ['Teacher'] }, 
  { href: '/teacher/data-entry', label: 'Student Data Entry', icon: Edit, roles: ['Teacher'] },
  { href: '/teacher/give-remark', label: 'Give Student Remarks', icon: MessageSquarePlus, roles: ['Teacher'] },
  { href: '/teacher/messaging', label: 'Send Messages', icon: Mail, roles: ['Teacher'] },
  { href: '/teacher/feedback', label: 'AI Feedback Gen', icon: MessageCircle, roles: ['Teacher']}, // Existing one
  { href: '/teacher/profile', label: 'My Profile & Salary', icon: User, roles: ['Teacher'] },
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Award, roles: ['Teacher'] },

  // Admin
  { href: '/admin/dashboard', label: 'Dashboard', icon: Shield, roles: ['Admin'] },
  { href: '/admin/user-management', label: 'User Management', icon: UsersIcon, roles: ['Admin'] },
  { href: '/admin/teacher-management', label: 'Teacher Payroll', icon: UsersIcon, roles: ['Admin'] },
  { href: '/admin/hall-of-fame-management', label: 'Manage Hall of Fame', icon: Building, roles: ['Admin'] },
  { href: '/admin/analytics', label: 'Analytics', icon: LineChart, roles: ['Admin'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['Admin'] },
  { href: '/hall-of-fame', label: 'View Hall of Fame', icon: Award, roles: ['Admin'] },
];

function getCurrentRole(pathname: string): UserRole | null {
  if (pathname.startsWith('/student')) return 'Student';
  if (pathname.startsWith('/teacher')) return 'Teacher';
  if (pathname.startsWith('/admin')) return 'Admin';
  // For /hall-of-fame, it could be any role, so it will appear if user's role matches
  return null; 
}

export function SidebarNav() {
  const pathname = usePathname();
  const currentRole = getCurrentRole(pathname);
  
  // For /hall-of-fame, we need to know the actual role of the logged-in user
  // This is a simplification. In a real app, role would come from auth context.
  // For now, if we are on /hall-of-fame, it's shown based on the links defined above.
  // The logic here is to filter items *based on the current page's role prefix* OR if the item is common.

  const getEffectiveRoleForFiltering = () => {
    if (pathname.startsWith('/student')) return 'Student';
    if (pathname.startsWith('/teacher')) return 'Teacher';
    if (pathname.startsWith('/admin')) return 'Admin';
    // If on a shared page like /hall-of-fame, we'd ideally get the role from context.
    // For now, this part of the logic might need refinement if the role isn't in the path.
    // Let's assume the links are defined to show for the correct roles.
    // To make /hall-of-fame link work, we need to check if any of its allowed roles match a hypothetical "actualUserRole".
    // Since we don't have "actualUserRole" from context here, this filtering is primarily path-based.
    // A simpler approach for this prototype: SidebarNav is usually already inside a role-specific layout.
    return currentRole; 
  }

  const effectiveRole = getEffectiveRoleForFiltering();

  const filteredNavItems = navItems.filter(item => {
    // If current path has a role prefix, show only items for that role.
    if (effectiveRole) return item.roles.includes(effectiveRole);
    // If no role prefix (e.g. on /hall-of-fame visited directly), this logic is tricky.
    // Let's assume the user is authenticated and their role allows viewing the item.
    // This part is hard to solve correctly without actual auth context.
    // The current navItems structure with explicit roles per item handles this.
    // The primary filtering should be based on a known current user role.
    // The current getCurrentRole based on path prefix is sufficient for navigating within a role's section.
    return item.roles.includes('Student') || item.roles.includes('Teacher') || item.roles.includes('Admin'); // Fallback, needs real role
  });
  
  // A more robust filter if we had user.role from context:
  // const actualUserRole = getUserRoleFromAuthContext(); // Hypothetical
  // const filteredNavItems = navItems.filter(item => actualUserRole && item.roles.includes(actualUserRole));


  return (
    <nav className="flex flex-col space-y-1">
      {navItems.filter(item => {
        // Show item if current path is within a role section and item belongs to that role
        if (currentRole && item.roles.includes(currentRole)) return true;
        // Special case for /hall-of-fame: show if path is /hall-of-fame AND item's role matches a potential general logged-in role.
        // This requires knowing the *actual* logged-in user's role, not just inferred from path.
        // For now, we list /hall-of-fame multiple times with specific roles.
        // Let's refine: the sidebar is rendered within a protected layout, which *should* know the role.
        return false; // If no currentRole (e.g. on a generic page), this needs proper auth context.
      }).map((item) => (
        <Button
          key={item.href + (currentRole || '')} // Ensure unique key if same href used by diff roles in future
          asChild
          variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start text-sm',
            pathname.startsWith(item.href) && 'bg-accent text-accent-foreground hover:bg-accent/90'
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

// Corrected Sidebar Logic (Simplified based on context)

// This SidebarNav component is rendered within (protected)/layout.tsx, which *does* determine a role.
// So, we can rely on `currentRole` being one of Student, Teacher, or Admin.

export function SidebarNav_Corrected() {
  const pathname = usePathname();
  const role = usePathname().split('/')[1] as UserRole | undefined; // student, teacher, admin

  if (!role || !['student', 'teacher', 'admin'].includes(role)) {
    return null; // Or a default nav if role is unknown/guest
  }
  const currentActualRole = role.charAt(0).toUpperCase() + role.slice(1) as UserRole;


  return (
    <nav className="flex flex-col space-y-1">
      {navItems.filter(item => item.roles.includes(currentActualRole)).map((item) => (
        <Button
          key={item.href + item.label} 
          asChild
          variant={pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href)) ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start text-sm h-9', // Adjusted height
            (pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href))) && 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90'
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
// We should replace the original SidebarNav with SidebarNav_Corrected.
// However, the XML format takes the whole file. I'll embed the corrected logic within the original function.

