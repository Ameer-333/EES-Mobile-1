
// Defines constants for collection names
export const USERS_COLLECTION = 'users';
export const TEACHERS_COLLECTION = 'teachers';
export const COORDINATORS_COLLECTION = 'coordinators'; // New
export const STUDENT_DATA_ROOT_COLLECTION = 'student_data_by_class';
export const PROFILES_SUBCOLLECTION_NAME = 'profiles'; // Subcollection under each class document
export const APP_SETTINGS_COLLECTION = 'app_settings';
export const HALL_OF_FAME_COLLECTION = 'hall_of_fame_items';
export const TEACHER_APPRAISAL_REQUESTS_COLLECTION = 'teacher_appraisal_requests';


// --- Path Helper Functions ---

// Path to the 'users' collection
export const getUsersCollectionPath = (): string => USERS_COLLECTION;

// Path to a specific user document in the 'users' collection
export const getUserDocPath = (authUid: string): string => {
  if (!authUid) throw new Error("authUid is required to get user document path");
  return `${USERS_COLLECTION}/${authUid}`;
};

// Path to the 'teachers' (HR profiles) collection
export const getTeachersCollectionPath = (): string => TEACHERS_COLLECTION;

// Path to a specific teacher document in the 'teachers' collection
export const getTeacherDocPath = (teacherAuthUid: string): string => {
  if (!teacherAuthUid) throw new Error("teacherAuthUid is required to get teacher document path");
  return `${TEACHERS_COLLECTION}/${teacherAuthUid}`;
};

// Path to the 'coordinators' collection
export const getCoordinatorsCollectionPath = (): string => COORDINATORS_COLLECTION;

// Path to a specific coordinator document in the 'coordinators' collection
export const getCoordinatorDocPath = (coordinatorAuthUid: string): string => {
  if (!coordinatorAuthUid) throw new Error("coordinatorAuthUid is required to get coordinator document path");
  return `${COORDINATORS_COLLECTION}/${coordinatorAuthUid}`;
};

// Path to the root collection for student data (student_data_by_class)
export const getStudentDataRootPath = (): string => STUDENT_DATA_ROOT_COLLECTION;

// Path to a specific class document within the student data root
// e.g., student_data_by_class/LKG
export const getClassDocPath = (classId: string): string => {
  if (!classId) throw new Error("classId is required to get class document path");
  return `${STUDENT_DATA_ROOT_COLLECTION}/${classId}`;
};

// Path to the 'profiles' subcollection for a specific class
// e.g., student_data_by_class/LKG/profiles
export const getStudentProfilesCollectionPath = (classId: string): string => {
  if (!classId) throw new Error("classId is required to get student profiles collection path");
  return `${STUDENT_DATA_ROOT_COLLECTION}/${classId}/${PROFILES_SUBCOLLECTION_NAME}`;
};

// Path to a specific student's profile document within their class's 'profiles' subcollection
// e.g., student_data_by_class/LKG/profiles/studentProfile123
export const getStudentDocPath = (classId: string, studentProfileId: string): string => {
  if (!classId || !studentProfileId) throw new Error("classId and studentProfileId are required to get student document path");
  return `${STUDENT_DATA_ROOT_COLLECTION}/${classId}/${PROFILES_SUBCOLLECTION_NAME}/${studentProfileId}`;
};

// Path to the app_settings collection
export const getAppSettingsCollectionPath = (): string => APP_SETTINGS_COLLECTION;

// Path to the general settings document in app_settings
export const getGeneralSettingsDocPath = (): string => {
    const GENERAL_SETTINGS_DOC_ID = 'general'; // As it's often fixed
    return `${APP_SETTINGS_COLLECTION}/${GENERAL_SETTINGS_DOC_ID}`;
};

// Path to the hall_of_fame_items collection
export const getHallOfFameCollectionPath = (): string => HALL_OF_FAME_COLLECTION;

// Path to a specific hall of fame item document
export const getHallOfFameItemDocPath = (itemId: string): string => {
  if (!itemId) throw new Error("itemId is required to get Hall of Fame item document path");
  return `${HALL_OF_FAME_COLLECTION}/${itemId}`;
};

// Path to the teacher_appraisal_requests collection
export const getTeacherAppraisalRequestsCollectionPath = (): string => TEACHER_APPRAISAL_REQUESTS_COLLECTION;

// Path to a specific teacher appraisal request document
export const getTeacherAppraisalRequestDocPath = (requestId: string): string => {
    if (!requestId) throw new Error("requestId is required to get teacher appraisal request document path");
    return `${TEACHER_APPRAISAL_REQUESTS_COLLECTION}/${requestId}`;
};
