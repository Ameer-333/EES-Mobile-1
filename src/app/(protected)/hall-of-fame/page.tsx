
'use client';

import { HallOfFameDisplay } from '@/components/shared/hall-of-fame-display';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/types';

// Helper function to determine role (already in protected layout, can be reused or adapted)
function getCurrentRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith('/student')) return 'Student';
  if (pathname.startsWith('/teacher')) return 'Teacher';
  if (pathname.startsWith('/admin')) return 'Admin';
  // If accessing /hall-of-fame directly from a protected context, 
  // this might need to get role from session/auth context in a real app.
  // For now, assume the path prefix is indicative if on a role-specific subpath to /hall-of-fame.
  return null; 
}


export default function HallOfFamePage() {
  const pathname = usePathname();
  // In a real app, you'd get the user's role from an auth context.
  // For this prototype, if we are inside /admin/hall-of-fame, currentRole will be Admin.
  // If it's just /hall-of-fame, we might not know the role easily without context.
  // The HallOfFameDisplay component's currentRole prop is used to show/hide admin edit buttons.
  // We can try to infer from a parent path if one exists.
  let role: UserRole | null = null;
  if (pathname.includes('/admin/')) role = 'Admin';
  else if (pathname.includes('/teacher/')) role = 'Teacher';
  else if (pathname.includes('/student/')) role = 'Student';


  return (
    <div className="container mx-auto p-4 md:p-8">
      <HallOfFameDisplay currentRole={role} />
    </div>
  );
}
