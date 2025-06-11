
export interface Student {
  id: string;
  name: string;
  satsNumber: string;
  class: string;
  section: string;
  caste: string;
  religion: string;
  address: string;
}

export type SubjectName = 'English' | 'Kannada' | 'Hindi' | 'Science' | 'Maths' | 'Social Science';

export interface SubjectMarks {
  subjectName: SubjectName;
  marks: number;
  maxMarks: number;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent';
}

export interface StudentSubjectAttendance {
  subjectName: SubjectName;
  records: AttendanceRecord[];
  totalClasses: number;
  attendedClasses: number;
}

export type UserRole = 'Admin' | 'Teacher' | 'Student';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string; // Should be a date string, or N/A
}

// Fields for Add/Edit Student forms by Teacher
export interface StudentFormData {
  name: string;
  satsNumber: string;
  class: string;
  section: string;
  caste: string;
  religion: string;
  address: string;
}
