
export type StandardSubjectName = 'English' | 'Kannada' | 'Hindi' | 'Science' | 'Maths' | 'Social Science' | 'EVS';
export type NIOSSubjectName = 'Data Entry' | 'Painting' | 'Indian Culture and Heritage' | 'Home Science' | 'English (NIOS)'; // NIOS English distinct if needed
export type NCLPSubjectName = 'English (NCLP)' | 'Kannada (NCLP)' | 'Hindi (NCLP)' | 'Maths (NCLP)' | 'EVS (NCLP)'; // NCLP subjects distinct if needed

export type SubjectName = StandardSubjectName | NIOSSubjectName | NCLPSubjectName;

export const standardSubjectNamesArray: StandardSubjectName[] = ['English', 'Kannada', 'Hindi', 'Science', 'Maths', 'Social Science', 'EVS'];
export const niosSubjectNamesArray: NIOSSubjectName[] = ['Data Entry', 'Painting', 'Indian Culture and Heritage', 'Home Science', 'English (NIOS)'];
export const nclpSubjectNamesArray: NCLPSubjectName[] = ['English (NCLP)', 'Kannada (NCLP)', 'Hindi (NCLP)', 'Maths (NCLP)', 'EVS (NCLP)'];

// Combined list for general dropdowns, specific lists for specific assignment types
export const allSubjectNamesArray: SubjectName[] = [
    ...standardSubjectNamesArray,
    ...niosSubjectNamesArray,
    ...nclpSubjectNamesArray,
].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates if any overlap


export type ExamName = 'FA1' | 'FA2' | 'SA1' | 'FA3' | 'FA4' | 'SA2' | 'Unit Test' | 'Mid Term' | 'Final Exam';
export const examNamesArray: ExamName[] = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2', 'Unit Test', 'Mid Term', 'Final Exam'];

export type ReligionType = 'Hindu' | 'Muslim' | 'Christian' | 'Sikh' | 'Jain' | 'Buddhist' | 'Other';
export const religionOptions: ReligionType[] = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'];

export type UserRole = 'Admin' | 'Teacher' | 'Student' | 'Coordinator';

export type TeacherAssignmentType = 
  | 'class_teacher'       // For a specific class and section (e.g., 9A Class Teacher)
  | 'subject_teacher'     // For a specific subject across one or more classes/sections
  | 'mother_teacher'      // For LKG-4th, primary teacher for a class/section
  | 'nios_teacher'        // Teacher for NIOS students/groups
  | 'nclp_teacher';       // Teacher for NCLP students/groups

export interface TeacherAssignment {
  id: string; // Unique ID for the assignment itself (e.g., UUID)
  type: TeacherAssignmentType;
  classId: string;        // e.g., "LKG", "1", "10", "NIOS_A", "NCLP_B" (System ID for the class/group)
  className?: string;      // e.g., "LKG Alpha", "Class 10 A", "NIOS Group A" (Display name)
  sectionId?: string;      // e.g., "A", "B" (If applicable, standard sections)
  subjectId?: SubjectName; // Only for subject_teacher (and potentially for NIOS/NCLP specific subject assignments)
  groupId?: string;        // More specific grouping within a classId, e.g., "NCLP_B_Math_Group1"
                           // For NIOS/NCLP, classId might be "NIOS" and groupId "GroupA" or "PaintingBatch1"
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
  remarks: StudentRemark[]; 
  scholarships: Scholarship[]; 
  examRecords: ExamRecord[]; 
  rawAttendanceRecords: RawAttendanceRecord[]; 
  backgroundInfo?: string;
  authUid: string; 
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
  lastLogin?: string;

  classId?: string; 
  studentProfileId?: string; 

  assignments?: TeacherAssignment[];
}

// Specific profile for Coordinators, if different fields are needed than ManagedUser
// For now, it can mirror ManagedUser, but a separate type allows future customization.
export interface CoordinatorProfile {
  id: string; // AuthUID
  authUid: string;
  name: string;
  email: string; // Login email
  role: 'Coordinator'; // Explicitly set role
  status: 'Active' | 'Inactive' | 'Pending';
  // Add any other coordinator-specific fields here if needed in the future
  // e.g., departmentsOverseeing?: string[];
  // lastActivityReportDate?: string;
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

export type AppraisalStatus = "Pending Review" | "Appraised" | "Rejected" | "No Active Appraisal";

export interface Teacher {
  id: string; 
  authUid: string; 
  name: string;
  email: string; 
  phoneNumber: string;
  address: string;
  yearOfJoining: number;
  totalYearsWorked?: number;
  subjectsTaught: SubjectName[]; // General qualification
  profilePictureUrl?: string | null;
  salaryHistory?: TeacherSalaryRecord[];
  daysPresentThisMonth?: number;
  daysAbsentThisMonth?: number;
  currentAppraisalStatus?: AppraisalStatus;
  lastAppraisalDate?: string; // YYYY-MM-DD
  lastAppraisalDetails?: string; // Notes from admin or coordinator
}

// Used by TeacherProfileFormDialog
export interface TeacherFormData {
  name: string;
  email: string; // Contact Email, will be used for Auth if new
  phoneNumber: string;
  address: string;
  yearOfJoining: number;
  subjectsTaught: SubjectName[]; // General qualifications
  profilePictureUrl?: string;
  assignments: TeacherAssignment[]; // Specific teaching duties
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

export const motherTeacherCoreSubjects: StandardSubjectName[] = ['English', 'EVS', 'Maths'];
export const nclpAllSubjects: NCLPSubjectName[] = ['English (NCLP)', 'Kannada (NCLP)', 'Hindi (NCLP)', 'Maths (NCLP)', 'EVS (NCLP)'];
export const nclpGroupBSubjectsNoHindi: NCLPSubjectName[] = ['English (NCLP)', 'Kannada (NCLP)', 'Maths (NCLP)', 'EVS (NCLP)'];
export const niosSubjectsForAssignment: NIOSSubjectName[] = ['Data Entry', 'Painting', 'Indian Culture and Heritage', 'Home Science', 'English (NIOS)'];


export const assignmentTypeLabels: Record<TeacherAssignmentType, string> = {
  class_teacher: "Class Teacher",
  subject_teacher: "Subject Teacher",
  mother_teacher: "Mother Teacher (LKG-4th)",
  nios_teacher: "NIOS Program Teacher",
  nclp_teacher: "NCLP Program Teacher",
};

export interface TeacherAppraisalRequest {
  id: string; // Firestore document ID
  teacherId: string; // AuthUID of the teacher
  teacherName: string;
  requestedByCoordinatorId: string;
  coordinatorName: string;
  requestDate: string; // ISO Date string
  justification: string;
  status: "Pending Admin Review" | "Approved" | "Rejected";
  adminNotes?: string;
  processedDate?: string; // ISO Date string
}
