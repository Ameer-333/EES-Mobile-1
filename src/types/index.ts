
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
  classId: string; // e.g., "LKG", "1", "10", "NIOS"
  sectionId?: string; // e.g., "A", "B"
  subjectId?: SubjectName; // Only for subject_teacher
  groupId?: string; // e.g., "Alpha" (for NIOS/NCLP groups)
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

// This interface represents the data stored in class-specific collections like 'students_lkg', 'students_1', etc.
// The 'id' field here is the document ID within that specific class collection.
export interface Student {
  id: string; // Document ID in the class-specific collection (e.g., students_lkg)
  name: string;
  satsNumber: string;

  className: string; // e.g., "10th Grade", "LKG" (for display)
  classId: string;   // e.g., "10", "LKG", "NIOS" (for logic, determines collection)
  sectionId?: string; // e.g., "A", "B"
  groupId?: string;   // e.g., "NIOS-Alpha", "NCLP-Batch1" (for special groupings)

  // Old fields, kept for now for smoother transition, ideally phased out by ensuring all code uses new fields.
  class: string; // To be replaced by className/classId
  section: string; // To be replaced by sectionId

  dateOfBirth?: string;
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  parentsAnnualIncome?: number;
  parentContactNumber?: string;
  email?: string; // Student's personal email, optional
  caste: string;
  religion: ReligionType;
  address: string;
  siblingReference?: string;
  profilePictureUrl?: string | null;
  remarks: StudentRemark[]; // Should be initialized as []
  scholarships: Scholarship[]; // Should be initialized as []
  examRecords: ExamRecord[]; // Should be initialized as []
  rawAttendanceRecords: RawAttendanceRecord[]; // Should be initialized as []
  backgroundInfo?: string;
  authUid: string; // Firebase Auth UID, links to 'users' collection entry
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

// This interface is for documents in the 'users' collection
export interface ManagedUser {
  id: string; // Firestore document ID (which is the Firebase Auth UID)
  name: string;
  email: string; // Auth email
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin?: string;

  // Student-specific fields if role is 'Student'
  classId?: string; // e.g., "LKG", "1", "NIOS" - helps find their collection
  studentProfileId?: string; // The document ID of their profile in the 'students_<classId>' collection

  // Teacher-specific fields if role is 'Teacher'
  assignments?: TeacherAssignment[];
}

export interface StudentFormData {
  name: string;
  satsNumber: string;

  className: string; // e.g., "10th Grade"
  classId: string;   // e.g., "10", "LKG" (used to determine collection)
  sectionId?: string;
  groupId?: string;

  caste: string;
  religion: ReligionType;
  address: string;
  profilePictureUrl?: string;
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

// This interface is for documents in the 'teachers' (HR) collection
export interface Teacher {
  id: string; // Firestore document ID (should be authUid for teachers)
  authUid: string; // Firebase Auth UID, links to 'users' collection entry
  name: string;
  email: string; // Contact email, may differ from auth email
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
  assignments?: TeacherAssignment[];
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

    