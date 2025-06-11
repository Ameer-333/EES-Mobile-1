'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, User, BookOpen, Edit, Settings, Shield } from 'lucide-react';
import type { UserRole } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: '/student/dashboard', label: 'Dashboard', icon: Home, roles: ['Student'] },
  { href: '/student/profile', label: 'Profile', icon: User, roles: ['Student'] },
  { href: '/student/records', label: 'Records', icon: BookOpen, roles: ['Student'] },
  
  { href: '/teacher/dashboard', label: 'Dashboard', icon: Home, roles: ['Teacher'] },
  { href: '/teacher/students', label: 'Manage Students', icon: User, roles: ['Teacher'] },
  { href: '/teacher/data-entry', label: 'Data Entry', icon: Edit, roles: ['Teacher'] },

  { href: '/admin/dashboard', label: 'Dashboard', icon: Shield, roles: ['Admin'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['Admin'] },
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

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentRole!));

  return (
    <nav className="flex flex-col space-y-2">
      {filteredNavItems.map((item) => (
        <Button
          key={item.href}
          asChild
          variant={pathname === item.href ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start',
            pathname === item.href && 'bg-accent text-accent-foreground hover:bg-accent/90'
          )}
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-5 w-5" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
