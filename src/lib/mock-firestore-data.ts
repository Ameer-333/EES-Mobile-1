
/**
 * @fileOverview Mock data representing the expected Firestore database structure.
 * This file serves as a blueprint for understanding how data should be organized
 * in Firestore based on the application's types and collection paths.
 *
 * You can use this as a reference to manually create documents in your
 * Firestore console or to write scripts for initial data population.
 */

import type {
  ManagedUser,
  UserRole,
  Teacher,
  TeacherAssignment,
  TeacherAssignmentType,
  Student,
  StudentRemark,
  Scholarship,
  ExamRecord,
  SubjectMarks,
  RawAttendanceRecord,
  ReligionType,
  SubjectName,
  ExamName,
  HallOfFameItem,
  AppraisalStatus,
  TeacherSalaryRecord,
  TeacherAppraisalRequest
} from '@/types';

// --- Mock UIDs and IDs for linking ---
const adminAuthUid = 'admin001AuthUid';
const teacher1AuthUid = 'teacher001AuthUid';
const teacher2AuthUid = 'teacher002AuthUid';
const student1AuthUid = 'student001AuthUid';
const student2AuthUid = 'student002AuthUid';
const student3AuthUid = 'student003AuthUid';
const coordinatorAuthUid = 'coordinator001AuthUid';

const student1ProfileId = 'studentProfileS001'; // Unique ID for student1's profile in their class
const student2ProfileId = 'studentProfileS002';
const student3ProfileId = 'studentProfileS003';

const classId10A = 'CLASS_10_A';
const classIdLKG = 'CLASS_LKG_SUN';

// --- 1. `users` Collection Data (Array of ManagedUser) ---
export const mockManagedUsers: ManagedUser[] = [
  {
    id: adminAuthUid,
    name: 'Dr. Evelyn Reed',
    email: 'admin.evelyn@eesedu.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-06-19T10:00:00Z',
  },
  {
    id: teacher1AuthUid,
    name: 'Mr. Arjun Sharma',
    email: 'teacher.arjun@eesedu.com',
    role: 'Teacher',
    status: 'Active',
    lastLogin: '2024-06-19T09:30:00Z',
    assignments: [
      { id: 'assignT1_1', type: 'class_teacher', classId: classId10A, className: 'Class 10 A', sectionId: 'A' },
      { id: 'assignT1_2', type: 'subject_teacher', classId: classId10A, className: 'Class 10 A', sectionId: 'A', subjectId: 'Maths' },
      { id: 'assignT1_3', type: 'subject_teacher', classId: classId10A, className: 'Class 10 A', sectionId: 'A', subjectId: 'Science' },
    ],
  },
  {
    id: teacher2AuthUid,
    name: 'Ms. Priya Patel',
    email: 'teacher.priya@eesedu.com',
    role: 'Teacher',
    status: 'Active',
    lastLogin: '2024-06-18T14:15:00Z',
    assignments: [
      { id: 'assignT2_1', type: 'mother_teacher', classId: classIdLKG, className: 'LKG Sunshine', sectionId: 'Sunshine' },
      { id: 'assignT2_2', type: 'subject_teacher', classId: classIdLKG, className: 'LKG Sunshine', sectionId: 'Sunshine', subjectId: 'English' },
    ],
  },
  {
    id: student1AuthUid,
    name: 'Rohan Verma',
    email: 'student.rohan.s001@eesedu.com',
    role: 'Student',
    status: 'Active',
    lastLogin: '2024-06-19T08:00:00Z',
    classId: classId10A,
    studentProfileId: student1ProfileId,
  },
  {
    id: student2AuthUid,
    name: 'Aisha Khan',
    email: 'student.aisha.s002@eesedu.com',
    role: 'Student',
    status: 'Active',
    lastLogin: '2024-06-18T11:00:00Z',
    classId: classId10A,
    studentProfileId: student2ProfileId,
  },
  {
    id: student3AuthUid,
    name: 'Leo Das',
    email: 'student.leo.s003@eesedu.com',
    role: 'Student',
    status: 'Active',
    lastLogin: '2024-06-19T07:45:00Z',
    classId: classIdLKG,
    studentProfileId: student3ProfileId,
  },
  {
    id: coordinatorAuthUid,
    name: 'Ms. Sofia Singh',
    email: 'coordinator.sofia@eesedu.com',
    role: 'Coordinator',
    status: 'Active',
    lastLogin: '2024-06-19T09:00:00Z',
  },
];

// --- 2. `teachers` Collection Data (Array of Teacher HR Profiles) ---
export const mockTeachers: Teacher[] = [
  {
    id: teacher1AuthUid, // Same as document ID, and ManagedUser ID
    authUid: teacher1AuthUid,
    name: 'Mr. Arjun Sharma',
    email: 'arjun.sharma.contact@eesedu.com', // Contact email, might differ from login
    phoneNumber: '+919876543210',
    address: '123, Knowledge Park, Bangalore, India',
    yearOfJoining: 2015,
    totalYearsWorked: new Date().getFullYear() - 2015,
    subjectsTaught: ['Maths', 'Science', 'Physics' as SubjectName], // Assuming Physics is added to SubjectName
    profilePictureUrl: 'https://placehold.co/100x100.png?text=AS',
    salaryHistory: [
      { id: 'salArjun1', monthYear: 'May 2024', dateIssued: '2024-06-01', amountIssued: 60000, amountDeducted: 500, daysAbsent: 1, reasonForAbsence: 'Sick leave' },
    ],
    currentAppraisalStatus: 'Appraised',
    lastAppraisalDate: '2024-03-10',
    lastAppraisalDetails: 'Approved for 10% increment based on performance.',
  },
  {
    id: teacher2AuthUid,
    authUid: teacher2AuthUid,
    name: 'Ms. Priya Patel',
    email: 'priya.patel.contact@eesedu.com',
    phoneNumber: '+919123456789',
    address: '456, Wisdom Lane, Bangalore, India',
    yearOfJoining: 2019,
    totalYearsWorked: new Date().getFullYear() - 2019,
    subjectsTaught: ['English', 'EVS'],
    profilePictureUrl: 'https://placehold.co/100x100.png?text=PP',
    salaryHistory: [
      { id: 'salPriya1', monthYear: 'May 2024', dateIssued: '2024-06-01', amountIssued: 52000, amountDeducted: 0, daysAbsent: 0 },
    ],
    currentAppraisalStatus: 'Pending Review',
    lastAppraisalDate: '2023-04-01',
    lastAppraisalDetails: 'Last appraisal completed successfully.',
  },
];

// --- 3. `student_data_by_class` Collection Data ---
// This will be an object where keys are classId
// Each class document contains a `profiles` subcollection (array of Student)

// Example Student Profiles:
const studentProfile1: Student = {
  id: student1ProfileId, // Document ID for this profile
  authUid: student1AuthUid,
  name: 'Rohan Verma',
  satsNumber: 'SATS001RV',
  className: 'Class 10 A',
  classId: classId10A,
  sectionId: 'A',
  class: 'Class 10 A', // compatibility
  section: 'A', // compatibility
  dateOfBirth: '2008-05-10',
  fatherName: 'Mr. Suresh Verma',
  motherName: 'Mrs. Anita Verma',
  caste: 'General',
  religion: 'Hindu' as ReligionType,
  address: '789 Learning Street, Bangalore',
  profilePictureUrl: 'https://placehold.co/100x100.png?text=RV',
  remarks: [
    { id: 'remR1', teacherName: 'Mr. Arjun Sharma', teacherSubject: 'Maths', remark: 'Excellent grasp of concepts.', date: '2024-05-15', sentiment: 'good' },
  ],
  scholarships: [],
  examRecords: [
    {
      examName: 'SA1' as ExamName,
      subjectMarks: [
        { subjectName: 'Maths', marks: 85, maxMarks: 100 },
        { subjectName: 'Science', marks: 78, maxMarks: 100 },
      ],
    },
  ],
  rawAttendanceRecords: [
    { subjectName: 'Maths', date: '2024-06-18', status: 'Present' },
  ],
  backgroundInfo: 'Active in school debate club.',
};

const studentProfile2: Student = {
  id: student2ProfileId,
  authUid: student2AuthUid,
  name: 'Aisha Khan',
  satsNumber: 'SATS002AK',
  className: 'Class 10 A',
  classId: classId10A,
  sectionId: 'A',
  class: 'Class 10 A',
  section: 'A',
  dateOfBirth: '2008-09-22',
  fatherName: 'Mr. Imran Khan',
  motherName: 'Mrs. Fatima Khan',
  caste: 'General',
  religion: 'Muslim' as ReligionType,
  address: '101 Education Avenue, Bangalore',
  profilePictureUrl: 'https://placehold.co/100x100.png?text=AK',
  remarks: [],
  scholarships: [
    { id: 'schA1', organisationName: 'Merit Scholarship Foundation', amount: 5000, yearReceived: 2023, details: 'For academic excellence.'}
  ],
  examRecords: [],
  rawAttendanceRecords: [],
};

const studentProfile3: Student = {
  id: student3ProfileId,
  authUid: student3AuthUid,
  name: 'Leo Das',
  satsNumber: 'SATS003LD',
  className: 'LKG Sunshine',
  classId: classIdLKG,
  sectionId: 'Sunshine',
  class: 'LKG Sunshine',
  section: 'Sunshine',
  dateOfBirth: '2019-03-15',
  caste: 'Christian',
  religion: 'Christian' as ReligionType,
  address: '22 Joyful Road, Bangalore',
  profilePictureUrl: 'https://placehold.co/100x100.png?text=LD',
  remarks: [],
  scholarships: [],
  examRecords: [],
  rawAttendanceRecords: [],
};

// Structure for `student_data_by_class`
// In Firestore, this would be:
// student_data_by_class (collection)
//   -- CLASS_10_A (document, classId is the doc ID)
//        -- profiles (subcollection)
//             -- studentProfileS001 (document, studentProfileId is the doc ID, content is studentProfile1)
//             -- studentProfileS002 (document, content is studentProfile2)
//   -- CLASS_LKG_SUN (document)
//        -- profiles (subcollection)
//             -- studentProfileS003 (document, content is studentProfile3)
export const mockStudentDataByClass = {
  [classId10A]: {
    // This document might have class-specific metadata if needed, e.g., { className: "Class 10 A", year: 2024 }
    // But for now, the primary content is the 'profiles' subcollection.
    profiles: {
      [student1ProfileId]: studentProfile1,
      [student2ProfileId]: studentProfile2,
    }
  },
  [classIdLKG]: {
    profiles: {
      [student3ProfileId]: studentProfile3,
    }
  }
};


// --- 4. `app_settings` Collection Data ---
// Document ID: "general"
export const mockAppSettingsGeneral = {
  appName: 'EES Education Portal',
  logoUrl: '/default-logo.png', // Example local path, or a full URL
  defaultLanguage: 'en',
  maintenanceMode: false,
};

// --- 5. `hall_of_fame_items` Collection Data (Array of HallOfFameItem) ---
export const mockHallOfFameItems: HallOfFameItem[] = [
  {
    id: 'hof001',
    category: 'founder',
    name: 'Mr. Rajesh Kumar',
    title: 'Founder & Visionary',
    description: 'Laid the foundation of EES Education with a vision for excellence.',
    imageUrl: 'https://placehold.co/300x200.png?text=Founder',
    year: '1995',
    dataAiHint: 'founder portrait',
  },
  {
    id: 'hof002',
    category: 'school-award',
    name: 'Best School National Award',
    description: 'Recognized for outstanding contribution to education.',
    imageUrl: 'https://placehold.co/300x200.png?text=Award',
    year: 2020,
    dataAiHint: 'school award trophy',
  },
  {
    id: 'hof003',
    category: 'student-achievement',
    name: 'Priya Singh - National Science Olympiad Winner',
    description: 'Secured first rank in the National Science Olympiad.',
    imageUrl: 'https://placehold.co/300x200.png?text=Student',
    year: 2022,
    dataAiHint: 'student achievement medal',
  },
];

// --- 6. `teacher_appraisal_requests` Collection Data ---
export const mockTeacherAppraisalRequests: TeacherAppraisalRequest[] = [
  {
    id: 'appraisalReq001',
    teacherId: teacher1AuthUid,
    teacherName: 'Mr. Arjun Sharma',
    requestedByCoordinatorId: coordinatorAuthUid,
    coordinatorName: 'Ms. Sofia Singh',
    requestDate: '2024-06-15T10:00:00Z',
    justification: 'Mr. Sharma has consistently exceeded expectations in student performance and has taken on additional responsibilities for curriculum development. His Math students have shown significant improvement.',
    status: 'Pending Admin Review',
  },
  {
    id: 'appraisalReq002',
    teacherId: teacher2AuthUid,
    teacherName: 'Ms. Priya Patel',
    requestedByCoordinatorId: coordinatorAuthUid,
    coordinatorName: 'Ms. Sofia Singh',
    requestDate: '2024-05-20T14:30:00Z',
    justification: 'Ms. Patel has shown excellent dedication as a mother teacher for LKG. Parent feedback has been overwhelmingly positive. Requesting a review for salary increment.',
    status: 'Approved',
    adminNotes: 'Approved. Performance review was excellent. Salary increment of 8% processed.',
    processedDate: '2024-05-25T11:00:00Z',
  },
];

/**
 * How to interpret this mock data for Firestore:
 *
 * 1. `mockManagedUsers` -> Each object is a document in the 'users' collection. Doc ID = object.id.
 * 2. `mockTeachers` -> Each object is a document in the 'teachers' collection. Doc ID = object.id.
 * 3. `mockStudentDataByClass` ->
 *    - Top-level keys (e.g., 'CLASS_10_A') are Document IDs in 'student_data_by_class' collection.
 *    - Inside each, `profiles` is a subcollection.
 *    - Keys of `profiles` (e.g., 'studentProfileS001') are Document IDs in that subcollection.
 *    - The value (e.g., studentProfile1) is the data for that student profile document.
 * 4. `mockAppSettingsGeneral` -> Data for a document named 'general' in the 'app_settings' collection.
 * 5. `mockHallOfFameItems` -> Each object is a document in 'hall_of_fame_items'. Doc ID = object.id.
 * 6. `mockTeacherAppraisalRequests` -> Each object is a document in 'teacher_appraisal_requests'. Doc ID = object.id.
 */
