
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
  id: string; // This will often be the Firestore document ID
  name: string;
  satsNumber: string;
  class: string;
  section: string;
  caste: string;
  religion: string;
  address: string;
  profilePictureUrl?: string;
  remarks?: StudentRemark[];
  scholarships?: Scholarship[];
  backgroundInfo?: string;
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
  id: string; // This will be the Firestore document ID
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string; // Should be a date string, or N/A
  // Note: Password is not stored here; it's handled by Firebase Authentication.
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
  profilePictureUrl?: string;
}

export interface TeacherSalaryRecord {
  id: string;
  monthYear: string; // e.g., "July 2024"
  dateIssued: string; // YYYY-MM-DD
  amountIssued: number;
  amountDeducted: number;
  daysAbsent: number;
  reasonForAbsence?: string;
}

export interface Teacher {
  id: string; // This will often be the Firestore document ID
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  yearOfJoining: number;
  totalYearsWorked?: number;
  subjectsTaught: SubjectName[];
  profilePictureUrl?: string;
  salaryHistory?: TeacherSalaryRecord[];
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
  senderId: string;
  receiverId: string;
  senderRole: UserRole;
  receiverRole: UserRole;
  content: string;
  timestamp: string; // ISO Date string
  read: boolean;
  messageType: 'app';
}

export interface HallOfFameItem {
  id: string; // This will often be the Firestore document ID
  category: 'founder' | 'co-founder' | 'principal' | 'school-award' | 'founder-award' | 'student-achievement';
  name: string;
  title?: string;
  description: string;
  imageUrl: string;
  year?: string | number;
  dataAiHint?: string;
}
