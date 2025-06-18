
export type SubjectName = 'English' | 'Kannada' | 'Hindi' | 'Science' | 'Maths' | 'Social Science';
export const subjectNamesArray: SubjectName[] = ['English', 'Kannada', 'Hindi', 'Science', 'Maths', 'Social Science'];

export type ExamName = 'FA1' | 'FA2' | 'SA1' | 'FA3' | 'FA4' | 'SA2';
export const examNamesArray: ExamName[] = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];

export type ReligionType = 'Hindu' | 'Muslim' | 'Christian' | 'Sikh' | 'Jain' | 'Buddhist' | 'Other';
export const religionOptions: ReligionType[] = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'];

export type UserRole = 'Admin' | 'Teacher' | 'Student';

export type TeacherAssignmentType = 'mother_teacher' | 'class_teacher' | 'subject_teacher' | 'nios_teacher' | 'nclp_teacher';

export interface TeacherAssignment {
  type: TeacherAssignmentType;
  classId: string; 
  sectionId?: string;
  subjectId?: SubjectName; 
  groupId?: string; 
}

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
  time: string; 
  day: string; 
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

export interface SubjectMarks {
  subjectName: SubjectName;
  marks: number;
  maxMarks: number;
}

export interface ExamRecord {
  examName: ExamName;
  subjectMarks: SubjectMarks[];
}

export interface RawAttendanceRecord {
  subjectName: SubjectName;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent';
}

export interface Student {
  id: string; 
  name: string;
  satsNumber: string;
  
  className: string; 
  classId: string;   
  sectionId?: string; 
  groupId?: string;  

  class: string; 
  section: string; 

  dateOfBirth?: string; 
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  parentsAnnualIncome?: number; 
  parentContactNumber?: string;
  email?: string;
  caste: string;
  religion: ReligionType;
  address: string;
  siblingReference?: string;
  profilePictureUrl?: string | null;
  remarks?: StudentRemark[];
  scholarships?: Scholarship[];
  examRecords?: ExamRecord[];
  rawAttendanceRecords?: RawAttendanceRecord[];
  backgroundInfo?: string;
  authUid?: string; 
}


export type GradeType = 'Distinction' | 'First Class' | 'Second Class' | 'Pass Class' | 'Not Completed';

export interface AttendanceRecord {
  date: string; 
  status: 'Present' | 'Absent';
}

export interface StudentSubjectAttendance { 
  subjectName: SubjectName;
  records: AttendanceRecord[];
  totalClasses: number;
  attendedClasses: number;
}

export interface ManagedUser {
  id: string; 
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string; 
  studentProfileId?: string; 
  assignments?: TeacherAssignment[]; 
}

export interface StudentFormData {
  name: string;
  satsNumber: string;
  
  className: string; 
  classId: string;   
  sectionId?: string; 
  groupId?: string;

  caste: string;
  religion: ReligionType;
  address: string;
  profilePictureUrl?: string;
  authUid?: string; 
  dateOfBirth?: string;
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  parentsAnnualIncome?: number;
  parentContactNumber?: string;
  email?: string;
  siblingReference?: string;
  backgroundInfo?: string;
}

export interface TeacherSalaryRecord {
  id: string;
  monthYear: string; 
  dateIssued: string; 
  amountIssued: number;
  amountDeducted: number;
  daysAbsent: number;
  reasonForAbsence?: string;
}
export interface Teacher {
  id: string; 
  authUid?: string; // To link with Firebase Auth UID and users collection
  name: string;
  email: string; // Contact email, may differ from auth email
  phoneNumber: string;
  address: string;
  yearOfJoining: number;
  totalYearsWorked?: number;
  subjectsTaught: SubjectName[]; // General subjects qualified for
  profilePictureUrl?: string | null;
  salaryHistory?: TeacherSalaryRecord[];
  daysPresentThisMonth?: number; 
  daysAbsentThisMonth?: number;
}

// Updated to include assignments
export interface TeacherFormData { 
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  yearOfJoining: number;
  subjectsTaught: SubjectName[];
  profilePictureUrl?: string;
  assignments?: TeacherAssignment[]; // Added assignments
}


export interface AppMessage {
  id: string;
  senderId: string;
  receiverId: string;
  senderRole: UserRole;
  receiverRole: UserRole;
  content: string;
  timestamp: string; 
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
