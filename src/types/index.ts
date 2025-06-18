
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
  // For LKG-10th: classId (e.g., "LKG", "1", "10") and sectionId (e.g., "A", "B")
  // For NIOS/NCLP: classId (e.g., "NIOS", "NCLP") and potentially groupId if further division is needed.
  classId: string; 
  sectionId?: string;
  subjectId?: SubjectName; // Only for 'subject_teacher'
  groupId?: string; // For NIOS/NCLP specific groups if not covered by classId/sectionId
}

export interface StudentRemark {
  id: string;
  teacherName: string; 
  teacherSubject: SubjectName; // This was correct
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
  
  className: string; // For display, e.g., "10th Grade", "LKG", "NIOS Group Alpha"
  classId: string;   // For matching logic, e.g., "10", "LKG", "NIOS"
  sectionId?: string; // For matching logic, e.g., "A", "B"
  groupId?: string;   // For NIOS/NCLP further grouping, e.g., "Alpha", "Batch1"

  // Keeping old fields for compatibility during transition, but new logic will prefer Id fields
  class: string; // Old field, to be deprecated. Use className for display.
  section: string; // Old field, to be deprecated. Use sectionId.

  dateOfBirth?: string; // YYYY-MM-DD
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
  date: string; // YYYY-MM-DD
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
  assignments?: TeacherAssignment[]; // Added for teachers
}

export interface StudentFormData {
  name: string;
  satsNumber: string;
  
  className: string; // Display name like "10th Grade"
  classId: string;   // Stored ID like "10"
  sectionId?: string; // Stored ID like "A"
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
  dateIssued: string; // YYYY-MM-DD
  amountIssued: number;
  amountDeducted: number;
  daysAbsent: number;
  reasonForAbsence?: string;
}

// This Teacher type is for the 'teachers' collection which might store payroll, specific HR data.
// The 'assignments' are better placed on the 'users' collection document for the teacher for auth rules.
export interface Teacher {
  id: string; // Corresponds to a doc ID in 'teachers' collection, might be same as auth UID
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  yearOfJoining: number;
  totalYearsWorked?: number;
  subjectsTaught: SubjectName[]; // This might be general qualification, specific assignments are separate
  profilePictureUrl?: string | null;
  salaryHistory?: TeacherSalaryRecord[];
  daysPresentThisMonth?: number; // Example of attendance tracking for teacher
  daysAbsentThisMonth?: number;
  // assignments?: TeacherAssignment[]; // Assignments are now primarily on the ManagedUser (users collection)
}

export interface TeacherFormData { // For forms related to the 'teachers' collection
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
