
export interface StudentRemark {
  id: string;
  teacherName: string; 
  teacherSubject: SubjectName;
  remark: string;
  date: string; 
  sentiment: 'good' | 'bad' | 'neutral';
}

export interface UpcomingEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "10:00 AM"
  day: string; // e.g., "Monday"
  note?: string; 
  location?: string;
  imageUrl?: string; 
  dataAiHint?: string; 
}

export interface Scholarship {
  id: string;
  organisationName: string;
  amount: number;
  yearReceived: number;
  details?: string;
}

export type ReligionType = 'Hindu' | 'Muslim' | 'Christian' | 'Sikh' | 'Jain' | 'Buddhist' | 'Other';
export const religionOptions: ReligionType[] = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'];

export interface Student {
  id: string; 
  name: string;
  satsNumber: string;
  class: string;
  section: string;
  dateOfBirth?: string; // YYYY-MM-DD
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  parentsAnnualIncome?: number; // Store as number, format for display
  parentContactNumber?: string;
  email?: string;
  caste: string;
  religion: ReligionType;
  address: string;
  siblingReference?: string; // e.g., "Sister: Ananya, Class 8B"
  profilePictureUrl?: string | null;
  remarks?: StudentRemark[];
  scholarships?: Scholarship[];
  backgroundInfo?: string;
  authUid?: string; 
}

export type SubjectName = 'English' | 'Kannada' | 'Hindi' | 'Science' | 'Maths' | 'Social Science';
export const subjectNamesArray: SubjectName[] = ['English', 'Kannada', 'Hindi', 'Science', 'Maths', 'Social Science'];

export type ExamName = 'FA1' | 'FA2' | 'SA1' | 'FA3' | 'FA4' | 'SA2';
export const examNamesArray: ExamName[] = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];

export interface SubjectMarks {
  subjectName: SubjectName;
  marks: number;
  maxMarks: number;
}

export interface ExamRecord {
  examName: ExamName;
  subjectMarks: SubjectMarks[];
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
  lastLogin: string; 
  studentProfileId?: string; 
}

export interface StudentFormData {
  name: string;
  satsNumber: string;
  class: string;
  section: string;
  caste: string;
  religion: ReligionType;
  address: string;
  profilePictureUrl?: string;
  authUid?: string; 
  // Add new fields for data entry if needed
  dateOfBirth?: string;
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  parentsAnnualIncome?: number;
  parentContactNumber?: string;
  email?: string;
  siblingReference?: string;
}

export interface TeacherSalaryRecord {
  id: string;
  monthYear: string; 
  dateIssued: string; // YYYY-MM-DD
  amountIssued: number;
  amountDeducted: number;
  daysAbsent: number;
  reasonForAbsence?: string;
}

export interface Teacher {
  id: string; 
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  yearOfJoining: number;
  totalYearsWorked?: number;
  subjectsTaught: SubjectName[];
  profilePictureUrl?: string | null;
  salaryHistory?: TeacherSalaryRecord[];
  daysPresentThisMonth?: number;
  daysAbsentThisMonth?: number;
}

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
  id: string; 
  category: 'founder' | 'co-founder' | 'principal' | 'school-award' | 'founder-award' | 'student-achievement';
  name: string;
  title?: string;
  description: string;
  imageUrl: string;
  year?: string | number;
  dataAiHint?: string;
}
