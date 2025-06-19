
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import type { UserRole } from '@/types';
import type { NavItem } from './sidebar-nav'; // Import NavItem type

interface AppSidebarContentProps {
  currentActualRole: UserRole | null | undefined;
  navItems: NavItem[];
  onLinkClick?: () => void; // Optional: for mobile to close sheet
}

export function AppSidebarContent({ currentActualRole, navItems, onLinkClick }: AppSidebarContentProps) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(item => {
    if (currentActualRole && item.roles.includes(currentActualRole)) {
      if (item.href === '/hall-of-fame') return true; 
      return item.href.startsWith(`/${currentActualRole.toLowerCase()}`);
    }
    if (pathname.startsWith('/hall-of-fame') && item.href === '/hall-of-fame' && currentActualRole && item.roles.includes(currentActualRole)) {
       return true;
    }
    return false;
  });

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => {
        const isActive = item.href === '/hall-of-fame' 
                          ? pathname === item.href 
                          : pathname.startsWith(item.href);
        const IconComponent = item.icon;

        return (
          <SidebarMenuItem key={item.href + item.label}>
            <Link href={item.href} asChild>
              <SidebarMenuButton // Note: asChild is NOT used here
                isActive={isActive}
                className={cn(
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90'
                )}
                tooltip={item.tooltip || item.label}
                onClick={onLinkClick}
              >
                {/* Icon and label are direct children of SidebarMenuButton */}
                {IconComponent && <IconComponent />}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

    