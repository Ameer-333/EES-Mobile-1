
# Firestore Paths Overview for EES Education App

This document outlines the primary Firestore collection and document paths used within the EES Education application. Understanding these paths is crucial for managing data, setting up security rules, and debugging.

The paths are primarily defined and accessed via helper functions in `src/lib/firestore-paths.ts`.

## Key Collections and Document Structures

1.  **`users` Collection**
    *   **Path Pattern**: `/users/{authUid}`
    *   **Description**: Stores core information for all authenticated users (Admins, Teachers, Students, Coordinators), including their role, status, and links to more specific profiles if applicable.
    *   **Document ID**: Firebase Authentication User ID (`authUid`).
    *   **Accessed From**:
        *   `src/components/admin/add-user-dialog.tsx` (Create)
        *   `src/components/admin/edit-user-dialog.tsx` (Update)
        *   `src/components/admin/user-management-table.tsx` (Read, Delete)
        *   `src/components/teacher/add-student-dialog.tsx` (Create student's user record)
        *   `src/components/teacher/edit-student-dialog.tsx` (Update student's user record for name/classId changes)
        *   `src/app/(protected)/layout.tsx` (Read current user's profile)
        *   `src/components/admin/manage-teacher-profiles.tsx` (Read teacher's user record for assignments)
        *   `src/components/admin/teacher-assignment-view.tsx` (Update teacher's user record for assignments)

2.  **`teachers` Collection**
    *   **Path Pattern**: `/teachers/{teacherAuthUid}`
    *   **Description**: Stores detailed Human Resources (HR) profiles for teachers.
    *   **Document ID**: Firebase Authentication User ID (`teacherAuthUid`) of the teacher.
    *   **Accessed From**:
        *   `src/components/admin/add-user-dialog.tsx` (Create basic HR profile when new teacher user is added)
        *   `src/components/admin/teacher-profile-form-dialog.tsx` (Create/Update full HR profile)
        *   `src/components/admin/manage-teacher-profiles.tsx` (Read, Delete HR profiles)
        *   `src/components/admin/teacher-payroll-management.tsx` (Read, Update salary history)
        *   `src/components/coordinator/request-teacher-appraisal-form.tsx` (Read teacher list for appraisal requests)
        *   `src/components/admin/manage-teacher-appraisals.tsx` (Update teacher's appraisal status in their HR profile)

3.  **`coordinators` Collection** (New)
    *   **Path Pattern**: `/coordinators/{coordinatorAuthUid}`
    *   **Description**: Stores specific profiles for coordinators. May mirror some data from `/users` or hold coordinator-specific fields.
    *   **Document ID**: Firebase Authentication User ID (`coordinatorAuthUid`) of the coordinator.
    *   **Accessed From**:
        *   `src/components/admin/add-user-dialog.tsx` (Create basic profile when new coordinator user is added)
        *   Potentially other coordinator-specific management UIs in the future.

4.  **`student_data_by_class` Collection (Root for Student Profiles)**
    *   **Path Pattern**: `/student_data_by_class/{classId}/profiles/{studentProfileId}`
    *   **Description**: This is a structured way to store detailed student academic and personal profiles.
        *   `/student_data_by_class`: Top-level collection.
        *   `{classId}`: A document ID representing a specific class (e.g., "LKG", "10A", "NIOS_PROGRAM_ID").
        *   `profiles`: A subcollection under each class document.
        *   `{studentProfileId}`: A document ID for a specific student's profile within that class.
    *   **Accessed From**:
        *   `src/components/teacher/add-student-dialog.tsx` (Create student profile)
        *   `src/components/teacher/edit-student-dialog.tsx` (Update student profile)
        *   `src/components/teacher/teacher-student-management.tsx` (Read, Delete student profiles for assigned classes)
        *   `src/components/teacher/teacher-data-entry.tsx` (Update student's exam records and attendance)
        *   `src/components/teacher/give-student-remark-form.tsx` (Update student's remarks)
        *   `src/app/(protected)/student/attendance/page.tsx` (Read student's attendance)
        *   `src/app/(protected)/student/records/page.tsx` (Read student's exam records)
        *   `src/app/(protected)/student/remarks/page.tsx` (Read student's remarks)

5.  **`app_settings` Collection**
    *   **Path Pattern**: `/app_settings/general`
    *   **Description**: Stores global application settings. Currently, a single document named "general" is used.
    *   **Document ID**: "general"
    *   **Accessed From**:
        *   `src/app/(protected)/admin/settings/page.tsx` (Read, Update general settings)
        *   `src/app/(protected)/layout.tsx` (Read app name and logo URL)
        *   Login pages (`src/app/login/.../page.tsx`) and Landing page (`src/app/page.tsx`) (Read app name and logo URL)

6.  **`hall_of_fame_items` Collection**
    *   **Path Pattern**: `/hall_of_fame_items/{itemId}`
    *   **Description**: Stores items for the school's Hall of Fame.
    *   **Document ID**: Auto-generated or a custom unique ID.
    *   **Accessed From**:
        *   `src/components/admin/hall-of-fame-editor.tsx` (Create, Read, Update, Delete)
        *   `src/components/shared/hall-of-fame-display.tsx` (Read)

7.  **`teacher_appraisal_requests` Collection**
    *   **Path Pattern**: `/teacher_appraisal_requests/{requestId}`
    *   **Description**: Stores requests for teacher salary appraisals submitted by coordinators for admin review.
    *   **Document ID**: Auto-generated by Firestore.
    *   **Accessed From**:
        *   `src/components/coordinator/request-teacher-appraisal-form.tsx` (Create appraisal requests)
        *   `src/components/admin/manage-teacher-appraisals.tsx` (Read, Update - approve/reject requests)

## Firestore Path Helper Functions

The file `src/lib/firestore-paths.ts` contains helper functions to consistently generate these paths:

*   `getUsersCollectionPath()` -> `/users`
*   `getUserDocPath(authUid)` -> `/users/{authUid}`
*   `getTeachersCollectionPath()` -> `/teachers`
*   `getTeacherDocPath(teacherAuthUid)` -> `/teachers/{teacherAuthUid}`
*   `getCoordinatorsCollectionPath()` -> `/coordinators` (New)
*   `getCoordinatorDocPath(coordinatorAuthUid)` -> `/coordinators/{coordinatorAuthUid}` (New)
*   `getStudentDataRootPath()` -> `/student_data_by_class`
*   `getClassDocPath(classId)` -> `/student_data_by_class/{classId}`
*   `getStudentProfilesCollectionPath(classId)` -> `/student_data_by_class/{classId}/profiles`
*   `getStudentDocPath(classId, studentProfileId)` -> `/student_data_by_class/{classId}/profiles/{studentProfileId}`
*   `getAppSettingsCollectionPath()` -> `/app_settings`
*   `getGeneralSettingsDocPath()` -> `/app_settings/general`
*   `getHallOfFameCollectionPath()` -> `/hall_of_fame_items`
*   `getHallOfFameItemDocPath(itemId)` -> `/hall_of_fame_items/{itemId}`
*   `getTeacherAppraisalRequestsCollectionPath()` -> `/teacher_appraisal_requests` (New)
*   `getTeacherAppraisalRequestDocPath(requestId)` -> `/teacher_appraisal_requests/{requestId}` (New)

This overview should help in navigating and understanding your application's data storage in Firestore.
