
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
  // { href: '/student/doubts', label: 'AI Doubts Helper', icon: MessageCircle, roles: ['Student']}, // Removed
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Award, roles: ['Student'] },
  
  // Teacher
  { href: '/teacher/dashboard', label: 'Dashboard', icon: Home, roles: ['Teacher'] },
  { href: '/teacher/students', label: 'Manage Students', icon: UsersIcon, roles: ['Teacher'] }, 
  { href: '/teacher/data-entry', label: 'Student Data Entry', icon: Edit, roles: ['Teacher'] },
  { href: '/teacher/give-remark', label: 'Give Student Remarks', icon: MessageSquarePlus, roles: ['Teacher'] },
  { href: '/teacher/messaging', label: 'Send Messages', icon: Mail, roles: ['Teacher'] },
  { href: '/teacher/feedback', label: 'AI Feedback Gen', icon: MessageCircle, roles: ['Teacher']}, 
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
    return item.roles.includes('Student') || item.roles.includes('Teacher') || item.roles.includes('Admin'); 
  });
  
  return (
    <nav className="flex flex-col space-y-1">
      {navItems.filter(item => {
        if (currentRole && item.roles.includes(currentRole)) return true;
        return false; 
      }).map((item) => (
        <Button
          key={item.href + (currentRole || '')} 
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


export function SidebarNav_Corrected() {
  const pathname = usePathname();
  const role = usePathname().split('/')[1] as UserRole | undefined; 

  if (!role || !['student', 'teacher', 'admin'].includes(role)) {
    return null; 
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
            'w-full justify-start text-sm h-9', 
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
