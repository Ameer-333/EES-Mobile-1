
export interface StudentRemark {
  id: string;
  source: 'teacher' | 'parent';
  authorName: string; // e.g., "Ms. Priya Sharma" or "Mr. Anand Kumar (Parent)"
  remark: string;
  date: string; // YYYY-MM-DD
}

export interface UpcomingEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "10:00 AM"
  day: string; // e.g., "Monday"
  description?: string;
  location?: string;
}

export interface Scholarship {
  id: string;
  organisationName: string;
  amount: number;
  yearReceived: number;
  details?: string;
}

export interface Student {
  id: string;
  name: string;
  satsNumber: string;
  class: string;
  section: string;
  caste: string;
  religion: string;
  address: string;
  remarks?: StudentRemark[];
  scholarships?: Scholarship[];
  backgroundInfo?: string; // For the "background of the student" section
}

export type SubjectName = 'English' | 'Kannada' | 'Hindi' | 'Science' | 'Maths' | 'Social Science';
export const subjectNamesArray: SubjectName[] = ['English', 'Kannada', 'Hindi', 'Science', 'Maths', 'Social Science'];


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

export interface TeacherSalaryRecord {
  id: string;
  monthYear: string; // e.g., "July 2024"
  dateIssued: string; // YYYY-MM-DD
  amountIssued: number;
  amountDeducted: number;
  daysAbsent: number;
  reasonForAbsence?: string; // Teacher can fill this
}

export interface Teacher {
  id: string;
  name: string;
  email: string; // For login, assuming email is username
  phoneNumber: string;
  address: string;
  yearOfJoining: number;
  totalYearsWorked?: number; // Admin can update this or it can be calculated
  subjectsTaught: SubjectName[];
  profilePictureUrl?: string;
  salaryHistory?: TeacherSalaryRecord[];
  // For Admin view of teacher attendance/salary
  daysPresentThisMonth?: number;
  daysAbsentThisMonth?: number;
}

// For the teacher profile form
export interface TeacherFormData {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  yearOfJoining: number;
  subjectsTaught: SubjectName[];
  profilePictureUrl?: string;
}


export interface AppMessage {
  id: string;
  senderId: string; // User ID
  receiverId: string; // User ID
  senderRole: UserRole;
  receiverRole: UserRole;
  content: string;
  timestamp: string; // ISO Date string
  read: boolean;
  // For prototype, type will be 'app'. SMS/email are external.
  messageType: 'app';
}

export interface HallOfFameItem {
  id: string;
  category: 'founder' | 'co-founder' | 'principal' | 'school-award' | 'founder-award' | 'student-achievement';
  name: string; // Name of person, award, or achievement
  title?: string; // e.g., "Principal", "Co-Founder"
  description: string;
  imageUrl: string;
  year?: string | number; // Year of award or relevance
  dataAiHint?: string;
}
