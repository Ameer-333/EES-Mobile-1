
/**
 * @fileOverview Firestore Database Structure Blueprint
 * This file serves as a blueprint and example for the intended structure of your
 * Firestore database. It uses the TypeScript types defined in `src/types/index.ts`
 * to illustrate the fields expected within each document of your collections.
 *
 * Use this as a reference guide for:
 *  - Manually creating initial documents in the Firebase Firestore console.
 *  - Writing scripts for data population or migration.
 *  - Understanding the data relationships and schema of the application.
 *
 * Each top-level exported constant (e.g., `exampleUsersData`) represents sample
 * documents that would reside in the corresponding Firestore collection.
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

// --- Example UIDs and IDs for linking records ---
const adminAuthUid = 'admin001AuthUid';
const teacher1AuthUid = 'teacher001AuthUid';
const teacher2AuthUid = 'teacher002AuthUid';
const student1AuthUid = 'student001AuthUid';
const student2AuthUid = 'student002AuthUid';
const student3AuthUid = 'student003AuthUid';
const coordinatorAuthUid = 'coordinator001AuthUid';

const student1ProfileId = 'studentProfileS001'; // Unique ID for student1's profile within their class's subcollection
const student2ProfileId = 'studentProfileS002';
const student3ProfileId = 'studentProfileS003';

const classId10A = 'CLASS_10_A'; // Example: Document ID for "Class 10 A" in 'student_data_by_class'
const classIdLKG = 'CLASS_LKG_SUN'; // Example: Document ID for "LKG Sunshine" in 'student_data_by_class'

// --- 1. `users` Collection: Document Structure Examples ---
// Collection Path: /users/{authUid}
export const exampleUsersData: ManagedUser[] = [
  {
    id: adminAuthUid, // Document ID is the authUid
    name: 'Dr. Evelyn Reed',
    email: 'admin.evelyn@eesedu.com', // Login email
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-06-19T10:00:00Z',
    // classId, studentProfileId, assignments are not applicable for Admin
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
    // classId, studentProfileId are not applicable for Teacher
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
    classId: classId10A, // Links to student_data_by_class/{classId10A}
    studentProfileId: student1ProfileId, // Links to student_data_by_class/{classId10A}/profiles/{student1ProfileId}
    // assignments are not applicable for Student
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
    // classId, studentProfileId, assignments might be used differently or not at all for Coordinator
  },
];

// --- 2. `teachers` Collection: Document Structure Examples (HR Profiles) ---
// Collection Path: /teachers/{authUid}
export const exampleTeachersData: Teacher[] = [
  {
    id: teacher1AuthUid, // Document ID is the authUid, same as ManagedUser ID
    authUid: teacher1AuthUid,
    name: 'Mr. Arjun Sharma',
    email: 'arjun.sharma.contact@eesedu.com', // HR contact email
    phoneNumber: '+919876543210',
    address: '123, Knowledge Park, Bangalore, India',
    yearOfJoining: 2015,
    totalYearsWorked: new Date().getFullYear() - 2015,
    subjectsTaught: ['Maths', 'Science', 'Physics' as SubjectName],
    profilePictureUrl: 'https://placehold.co/100x100.png?text=AS',
    salaryHistory: [
      { id: 'salArjun1', monthYear: 'May 2024', dateIssued: '2024-06-01', amountIssued: 60000, amountDeducted: 500, daysAbsent: 1, reasonForAbsence: 'Sick leave' },
    ],
    daysPresentThisMonth: 20, // Example optional field
    daysAbsentThisMonth: 1,   // Example optional field
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
    // daysPresentThisMonth, daysAbsentThisMonth could be undefined or null
  },
];

// --- 3. `student_data_by_class` Collection: Document Structure Examples ---
// This collection contains documents where each document ID is a `classId`.
// Each class document then has a `profiles` subcollection.

// Example Student Profile document structure (these go into the 'profiles' subcollection)
const studentProfile1_Data: Student = {
  id: student1ProfileId, // Document ID for this profile within its class's 'profiles' subcollection
  authUid: student1AuthUid,
  name: 'Rohan Verma',
  satsNumber: 'SATS001RV',
  className: 'Class 10 A', // Display name
  classId: classId10A,   // System ID for the class
  sectionId: 'A',        // System ID for the section
  // groupId: undefined, // Optional, for NIOS/NCLP further grouping
  class: 'Class 10 A', // Compatibility field
  section: 'A',        // Compatibility field
  dateOfBirth: '2008-05-10',
  fatherName: 'Mr. Suresh Verma',
  motherName: 'Mrs. Anita Verma',
  fatherOccupation: 'Engineer',
  motherOccupation: 'Homemaker',
  parentsAnnualIncome: 800000,
  parentContactNumber: '+919988776655',
  email: 'rohan.verma.personal@example.com', // Personal email
  caste: 'General',
  religion: 'Hindu' as ReligionType,
  address: '789 Learning Street, Bangalore',
  siblingReference: 'Sister: Anya Verma, Class 7B',
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
    { subjectName: 'Science', date: '2024-06-18', status: 'Present' },
  ],
  backgroundInfo: 'Active in school debate club.',
};

const studentProfile2_Data: Student = {
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
  // Optional fields can be omitted or set to undefined
  // fatherOccupation: undefined,
  // parentsAnnualIncome: undefined,
};

const studentProfile3_Data: Student = {
  id: student3ProfileId,
  authUid: student3AuthUid,
  name: 'Leo Das',
  satsNumber: 'SATS003LD',
  className: 'LKG Sunshine', // Display name for LKG
  classId: classIdLKG,     // System ID for LKG
  sectionId: 'Sunshine',   // Specific section name for LKG
  class: 'LKG Sunshine',
  section: 'Sunshine',
  dateOfBirth: '2019-03-15',
  caste: 'Christian',
  religion: 'Christian' as ReligionType,
  address: '22 Joyful Road, Bangalore',
  profilePictureUrl: 'https://placehold.co/100x100.png?text=LD',
  remarks: [], scholarships: [], examRecords: [], rawAttendanceRecords: [],
};

// Firestore structure for `student_data_by_class`:
// student_data_by_class (collection)
//   -- {classId10A} (document)
//        --> profiles (subcollection)
//             -- {student1ProfileId} (document, data: studentProfile1_Data)
//             -- {student2ProfileId} (document, data: studentProfile2_Data)
//   -- {classIdLKG} (document)
//        --> profiles (subcollection)
//             -- {student3ProfileId} (document, data: studentProfile3_Data)

// This object illustrates the data, not the exact Firebase SDK calls to create it.
export const exampleStudentDataByClassStructure = {
  [classId10A]: { // Document ID for the class in 'student_data_by_class'
    // This document itself might have class-level metadata if needed, e.g.:
    // classNameDisplay: "Class 10 Section A", academicYear: "2024-2025"
    // The 'profiles' subcollection is nested under this document.
    profiles: { // This key represents the subcollection name.
      [student1ProfileId]: studentProfile1_Data, // Document ID: student1ProfileId, Data: studentProfile1_Data
      [student2ProfileId]: studentProfile2_Data,
    }
  },
  [classIdLKG]: {
    profiles: {
      [student3ProfileId]: studentProfile3_Data,
    }
  }
};


// --- 4. `app_settings` Collection: Document Structure Example ---
// Collection Path: /app_settings/general
// Document ID: "general" (typically a fixed ID for general settings)
export const exampleAppSettingsGeneralData = {
  appName: 'EES Education Portal',
  logoUrl: '/default-school-logo.png', // Example local path, or a full HTTPS URL
  defaultLanguage: 'en',
  maintenanceMode: false,
  // Add other global settings here
};

// --- 5. `hall_of_fame_items` Collection: Document Structure Examples ---
// Collection Path: /hall_of_fame_items/{itemId}
export const exampleHallOfFameItemsData: HallOfFameItem[] = [
  {
    id: 'hofItem001', // Document ID
    category: 'founder',
    name: 'Mr. Rajesh Kumar',
    title: 'Founder & Visionary',
    description: 'Laid the foundation of EES Education with a vision for excellence and accessible quality education for all.',
    imageUrl: 'https://placehold.co/400x300.png?text=Founder+Rajesh',
    year: '1995',
    dataAiHint: 'founder portrait man',
  },
  {
    id: 'hofItem002',
    category: 'school-award',
    name: 'National Award for Educational Excellence',
    title: 'Awarded by the Ministry of Education',
    description: 'Recognized for outstanding contribution to primary and secondary education, innovative teaching methodologies, and community engagement.',
    imageUrl: 'https://placehold.co/400x300.png?text=National+Award',
    year: 2020,
    dataAiHint: 'award trophy certificate',
  },
  {
    id: 'hofItem003',
    category: 'student-achievement',
    name: 'Priya Singh - International Math Olympiad Gold Medalist',
    title: 'Represented India and achieved Gold',
    description: 'Secured the first rank globally in the prestigious International Math Olympiad, showcasing exceptional talent and dedication.',
    imageUrl: 'https://placehold.co/400x300.png?text=Priya+Singh+IMO',
    year: 2022,
    dataAiHint: 'student medal achievement',
  },
];

// --- 6. `teacher_appraisal_requests` Collection: Document Structure Examples ---
// Collection Path: /teacher_appraisal_requests/{requestId}
export const exampleTeacherAppraisalRequestsData: TeacherAppraisalRequest[] = [
  {
    id: 'appraisalRequest001', // Document ID
    teacherId: teacher1AuthUid,
    teacherName: 'Mr. Arjun Sharma',
    requestedByCoordinatorId: coordinatorAuthUid,
    coordinatorName: 'Ms. Sofia Singh',
    requestDate: '2024-06-15T10:00:00Z', // ISO Date string
    justification: 'Mr. Sharma has consistently exceeded expectations in student performance for Class 10 Maths and Science. He has also taken initiative in organizing the science fair and mentoring junior teachers. His dedication warrants a salary review.',
    status: 'Pending Admin Review',
    // adminNotes and processedDate would be undefined or null initially
  },
  {
    id: 'appraisalRequest002',
    teacherId: teacher2AuthUid,
    teacherName: 'Ms. Priya Patel',
    requestedByCoordinatorId: coordinatorAuthUid,
    coordinatorName: 'Ms. Sofia Singh',
    requestDate: '2024-05-20T14:30:00Z',
    justification: 'Ms. Patel has shown excellent dedication as a mother teacher for LKG Sunshine. Parent feedback has been overwhelmingly positive, highlighting her nurturing approach and innovative teaching methods for early learners. Requesting a review for salary increment.',
    status: 'Approved',
    adminNotes: 'Approved. Performance review was excellent. Salary increment of 8% processed. Updated in teacher\'s HR profile.',
    processedDate: '2024-05-25T11:00:00Z',
  },
];

/**
 * Guide to Mapping this Data to Firestore:
 *
 * 1. `exampleUsersData`:
 *    - Each object in this array represents a document in the `users` collection.
 *    - The `id` field of each object should be used as the Document ID in Firestore.
 *    - Collection Path: `users/{id}` (e.g., `users/admin001AuthUid`)
 *
 * 2. `exampleTeachersData`:
 *    - Each object represents a document in the `teachers` collection (HR profiles).
 *    - The `id` (which is also `authUid`) field is the Document ID.
 *    - Collection Path: `teachers/{id}` (e.g., `teachers/teacher001AuthUid`)
 *
 * 3. `exampleStudentDataByClassStructure`:
 *    - This object's top-level keys (e.g., `CLASS_10_A`) are Document IDs in the `student_data_by_class` collection.
 *      - Collection Path: `student_data_by_class/{classId}`
 *    - Inside each class document, the `profiles` key represents a **subcollection** named "profiles".
 *    - The keys within `profiles` (e.g., `studentProfileS001`) are Document IDs for individual student profiles within that class's subcollection.
 *      - Subcollection Path: `student_data_by_class/{classId}/profiles/{studentProfileId}`
 *    - The data for each student profile document is the corresponding object (e.g., `studentProfile1_Data`).
 *
 * 4. `exampleAppSettingsGeneralData`:
 *    - This object's data goes into a single document, typically named "general", within the `app_settings` collection.
 *    - Document Path: `app_settings/general`
 *
 * 5. `exampleHallOfFameItemsData`:
 *    - Each object is a document in the `hall_of_fame_items` collection.
 *    - The `id` field can be used as the Document ID, or Firestore can auto-generate one.
 *    - Collection Path: `hall_of_fame_items/{id}`
 *
 * 6. `exampleTeacherAppraisalRequestsData`:
 *    - Each object is a document in the `teacher_appraisal_requests` collection.
 *    - The `id` field can be used as the Document ID, or Firestore can auto-generate one.
 *    - Collection Path: `teacher_appraisal_requests/{id}`
 */
