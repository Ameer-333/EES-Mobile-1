
// This is the Firebase Cloud Function code.
// You should copy this entire content into your `functions/index.ts` file
// (or your main Cloud Functions file if named differently).
// Ensure you have firebase-admin and firebase-functions installed in your functions/package.json.

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK - Ensure this is done only once.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

interface CreateUserAccountData {
  email: string;
  password?: string; // Password will be set by client or generated here
  name: string;
  role: "Student" | "Teacher" | "Coordinator";
}

export const createUserAccount = functions.https.onCall(async (data: CreateUserAccountData, context) => {
  // 1. Check if the caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const callerUid = context.auth.uid;

  // 2. Verify the caller is an Admin by checking their Firestore document
  try {
    const userDoc = await db.collection("users").doc(callerUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "Admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Caller is not an administrator."
      );
    }
  } catch (error) {
    console.error("Error verifying admin role:", callerUid, error);
    throw new functions.https.HttpsError(
      "internal",
      "Could not verify admin role."
    );
  }

  const { email, name, role } = data;
  let { password } = data;

  // If password is not provided by client, generate a default one
  // This logic should match what the client expects or what you communicate to the new user
  if (!password) {
    const roleNameCapitalized = role.charAt(0).toUpperCase() + role.slice(1);
    password = `${roleNameCapitalized}Default@${new Date().getFullYear()}`;
  }

  let newUserRecord;
  try {
    // 3. Create Firebase Auth user
    newUserRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
      emailVerified: false, // Set to true if you have an email verification flow
    });
  } catch (error: any) {
    console.error("Error creating Auth user:", error);
    if (error.code === "auth/email-already-exists") {
      throw new functions.https.HttpsError("already-exists", "The email address is already in use by another account.");
    } else if (error.code === "auth/invalid-password") {
        throw new functions.https.HttpsError("invalid-argument", `The password must be a string with at least six characters. Received: ${password}`);
    }
    throw new functions.https.HttpsError("internal", "Failed to create authentication user: " + error.message);
  }

  const newUid = newUserRecord.uid;
  const batch = db.batch();
  const timestamp = admin.firestore.FieldValue.serverTimestamp(); // Use server timestamp for consistency

  // 4. Prepare to add document in /users/{newUid}
  const userDocRef = db.collection("users").doc(newUid);
  const userDocData: { [key: string]: any } = { // Using a general type for flexibility
    id: newUid,
    name: name,
    email: email, // Login email
    role: role,
    status: "Active",
    lastLogin: "N/A", // Or use a server timestamp for creation time
    createdAt: timestamp,
  };

  if (role === 'Student') {
    userDocData.classId = 'TO_BE_ASSIGNED'; // Admin creates a generic student user
    userDocData.studentProfileId = 'TO_BE_ASSIGNED';
    // The detailed student profile in /student_data_by_class/... is expected to be
    // created/updated by a Teacher later when they formally add the student to their class.
  } else if (role === 'Teacher') {
    userDocData.assignments = []; // Teachers start with no assignments by default
  }
  batch.set(userDocRef, userDocData);

  // 5. Depending on the role, create role-specific documents
  if (role === "Teacher") {
    const teacherDocRef = db.collection("teachers").doc(newUid);
    const teacherProfileData = {
      id: newUid, // Mirroring the authUid for consistency
      authUid: newUid,
      name: name,
      email: email, // Initial contact email, admin can update later if different
      phoneNumber: "", // To be filled out by Admin/Teacher via TeacherProfileFormDialog
      address: "",     // To be filled out by Admin/Teacher via TeacherProfileFormDialog
      yearOfJoining: new Date().getFullYear(), // Default to current year
      subjectsTaught: [], // General qualifications, Admin can update
      salaryHistory: [],
      currentAppraisalStatus: "No Active Appraisal", // Default status
      createdAt: timestamp,
    };
    batch.set(teacherDocRef, teacherProfileData);
  } else if (role === "Coordinator") {
    const coordinatorDocRef = db.collection("coordinators").doc(newUid);
    const coordinatorProfileData = {
      id: newUid, // Mirroring the authUid
      authUid: newUid,
      name: name,
      email: email, // Login email
      role: "Coordinator", // Explicitly set for clarity in this record
      status: "Active",
      createdAt: timestamp,
      // Add any other coordinator-specific default fields here
    };
    batch.set(coordinatorDocRef, coordinatorProfileData);
  }

  try {
    await batch.commit();
    return {
      success: true,
      message: `User ${name} (${role}) created successfully with UID: ${newUid}.`,
      uid: newUid,
      // IMPORTANT: If the password was generated by this function (i.e., client didn't send one),
      // you MUST return it so the client-side (Admin panel) can display it to the Admin user.
      generatedPassword: data.password ? undefined : password,
    };
  } catch (firestoreError: any) {
    console.error("Error committing Firestore batch for UID:", newUid, firestoreError);
    // Attempt to delete the Auth user if Firestore writes failed (basic rollback)
    try {
      await admin.auth().deleteUser(newUid);
      console.log(`Successfully rolled back Auth user creation for UID: ${newUid} due to Firestore error.`);
    } catch (rollbackError: any) {
      console.error(`CRITICAL ERROR: Failed to rollback Auth user creation for UID: ${newUid} after Firestore error. Manual cleanup required for Auth user ${email}.`, rollbackError);
      // This is a critical state. The Auth user exists, but Firestore docs don't.
      // The client needs to be informed, and manual cleanup of the Auth user might be needed.
      throw new functions.https.HttpsError(
        "internal",
        `Firestore write failed, AND Auth user rollback FAILED for ${email}. Manual cleanup of Auth user required. Original error: ${firestoreError.message}`
      );
    }
    throw new functions.https.HttpsError("internal", `Failed to create Firestore documents for ${email} (Auth user was rolled back successfully): ${firestoreError.message}`);
  }
});

// You can add other Cloud Functions below if needed.
// For example:
// export const anotherCloudFunction = functions.firestore.document('somePath/{docId}')
//    .onCreate((snap, context) => {
//      // ... your logic
//    });
