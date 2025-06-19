
'use client';

// Icon imports remain critical for navItems
import {
  Home, User, BookOpen, Edit, Settings, Shield, Users as UsersIcon, LineChart,
  MessageSquarePlus, Mail, Award, Building, MessageSquareText,
  CalendarCheck, CalendarClock, ClipboardUser
} from 'lucide-react';
import type { UserRole } from '@/types'; // Assuming UserRole is correctly defined in @/types

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  tooltip?: string; // Added for collapsed sidebar
}

// All icons used here are confirmed to be in the import list above.
export const navItems: NavItem[] = [
  // Student
  { href: '/student/dashboard', label: 'Dashboard', icon: Home, roles: ['Student'], tooltip: 'Dashboard' },
  { href: '/student/profile', label: 'Profile & Activities', icon: User, roles: ['Student'], tooltip: 'Profile' },
  { href: '/student/records', label: 'Academic Records', icon: BookOpen, roles: ['Student'], tooltip: 'Records' },
  { href: '/student/attendance', label: 'My Attendance', icon: CalendarClock, roles: ['Student'], tooltip: 'Attendance' },
  { href: '/student/remarks', label: 'My Remarks', icon: MessageSquareText, roles: ['Student'], tooltip: 'Remarks' },
  { href: '/student/events', label: 'Upcoming Events', icon: CalendarCheck, roles: ['Student'], tooltip: 'Events' },
  { href: '/student/scholarships', label: 'My Scholarships', icon: Award, roles: ['Student'], tooltip: 'Scholarships' },

  // Teacher
  { href: '/teacher/dashboard', label: 'Dashboard', icon: Home, roles: ['Teacher'], tooltip: 'Dashboard' },
  { href: '/teacher/students', label: 'Manage Students', icon: UsersIcon, roles: ['Teacher'], tooltip: 'Students' },
  { href: '/teacher/data-entry', label: 'Student Data Entry', icon: Edit, roles: ['Teacher'], tooltip: 'Data Entry' },
  { href: '/teacher/give-remark', label: 'Give Student Remarks', icon: MessageSquarePlus, roles: ['Teacher'], tooltip: 'Give Remark' },
  { href: '/teacher/messaging', label: 'Send Messages', icon: Mail, roles: ['Teacher'], tooltip: 'Messages' },
  { href: '/teacher/profile', label: 'My Profile & Salary', icon: User, roles: ['Teacher'], tooltip: 'Profile' },

  // Admin
  { href: '/admin/dashboard', label: 'Dashboard', icon: Shield, roles: ['Admin'], tooltip: 'Dashboard' },
  { href: '/admin/user-management', label: 'User Management', icon: UsersIcon, roles: ['Admin'], tooltip: 'Users' },
  { href: '/admin/teacher-management', label: 'Teacher Management', icon: UsersIcon, roles: ['Admin'], tooltip: 'Teachers' },
  { href: '/admin/hall-of-fame-management', label: 'Manage Hall of Fame', icon: Building, roles: ['Admin'], tooltip: 'Hall of Fame Mgt.' },
  { href: '/admin/analytics', label: 'Analytics', icon: LineChart, roles: ['Admin'], tooltip: 'Analytics' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['Admin'], tooltip: 'Settings' },

  // Coordinator
  { href: '/coordinator/dashboard', label: 'Dashboard', icon: ClipboardUser, roles: ['Coordinator'], tooltip: 'Dashboard' },
  { href: '/coordinator/students', label: 'All Student Management', icon: UsersIcon, roles: ['Coordinator'], tooltip: 'Students' },
  { href: '/coordinator/teacher-management', label: 'All Teacher Management', icon: UsersIcon, roles: ['Coordinator'], tooltip: 'Teachers' },
  { href: '/coordinator/data-entry', label: 'Global Data Entry', icon: Edit, roles: ['Coordinator'], tooltip: 'Data Entry' },

  // Shared
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Building, roles: ['Student', 'Teacher', 'Admin', 'Coordinator'], tooltip: 'Hall of Fame' },
];
