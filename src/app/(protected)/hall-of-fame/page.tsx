
'use client';

import { HallOfFameDisplay } from '@/components/shared/hall-of-fame-display';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/types';

export default function HallOfFamePage() {
  const pathname = usePathname();
  // In a real app, you'd get the user's role from an auth context.
  // For this prototype, we infer from the path if on a role-specific subpath.
  let role: UserRole | null = null;
  if (pathname.includes('/admin/')) role = 'Admin';
  else if (pathname.includes('/teacher/')) role = 'Teacher';
  else if (pathname.includes('/student/')) role = 'Student';

  // The HallOfFameDisplay component now fetches its own data.
  return (
    <div className="container mx-auto p-4 md:p-8">
      <HallOfFameDisplay currentRole={role} />
    </div>
  );
}
