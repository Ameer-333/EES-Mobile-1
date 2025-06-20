import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

interface CreateUserAccountData {
  email: string;
  password?: string;
  name: string;
  role: 'Student' | 'Teacher' | 'Coordinator';
}

export const createUserAccount = functions.https.onCall(
  async (data: CreateUserAccountData, context: functions.https.CallableContext) => {
    // 1. Check if the caller is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const callerUid = context.auth.uid;

    // 2. Verify the caller is an Admin
    try {
      const userDoc = await db.collection('users').doc(callerUid).get();
      if (!userDoc.exists || userDoc.data()?.role !== 'Admin') {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Caller is not an administrator.'
        );
      }
    } catch (error) {
      console.error('Error verifying admin role:', callerUid, error);
      throw new functions.https.HttpsError(
        'internal',
        'Could not verify admin role.'
      );
    }

    const { email, name, role } = data;
    let { password } = data;

    if (!password) {
      const roleNameCapitalized = role.charAt(0).toUpperCase() + role.slice(1);
      password = `${roleNameCapitalized}Default@${new Date().getFullYear()}`;
    }

    let newUserRecord;
    try {
      newUserRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
        emailVerified: false,
      });
    } catch (error: any) {
      console.error('Error creating Auth user:', error);
      if (error.code === 'auth/email-already-exists') {
        throw new functions.https.HttpsError(
          'already-exists',
          'The email address is already in use by another account.'
        );
      } else if (error.code === 'auth/invalid-password') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `The password must be a string with at least six characters. Received: ${password}`
        );
      }
      throw new functions.https.HttpsError(
        'internal',
        'Failed to create authentication user: ' + error.message
      );
    }

    const newUid = newUserRecord.uid;
    const batch = db.batch();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // User doc in /users
    const userDocRef = db.collection('users').doc(newUid);
    const userDocData: { [key: string]: any } = {
      id: newUid,
      name,
      email,
      role,
      status: 'Active',
      lastLogin: 'N/A',
      createdAt: timestamp,
    };

    if (role === 'Student') {
      userDocData.classId = 'TO_BE_ASSIGNED';
      userDocData.studentProfileId = 'TO_BE_ASSIGNED';
    } else if (role === 'Teacher') {
      userDocData.assignments = [];
    }

    batch.set(userDocRef, userDocData);

    // Role-specific collection
    if (role === 'Teacher') {
      const teacherDocRef = db.collection('teachers').doc(newUid);
      batch.set(teacherDocRef, {
        id: newUid,
        authUid: newUid,
        name,
        email,
        phoneNumber: '',
        address: '',
        yearOfJoining: new Date().getFullYear(),
        subjectsTaught: [],
        salaryHistory: [],
        currentAppraisalStatus: 'No Active Appraisal',
        createdAt: timestamp,
      });
    } else if (role === 'Coordinator') {
      const coordinatorDocRef = db.collection('coordinators').doc(newUid);
      batch.set(coordinatorDocRef, {
        id: newUid,
        authUid: newUid,
        name,
        email,
        role: 'Coordinator',
        status: 'Active',
        createdAt: timestamp,
      });
    }

    try {
      await batch.commit();
      return {
        success: true,
        message: `User ${name} (${role}) created successfully with UID: ${newUid}.`,
        uid: newUid,
        generatedPassword: data.password ? undefined : password,
      };
    } catch (firestoreError: any) {
      console.error('Error committing Firestore batch for UID:', newUid, firestoreError);
      try {
        await admin.auth().deleteUser(newUid);
        console.log(`Rolled back Auth user creation for UID: ${newUid}`);
      } catch (rollbackError: any) {
        console.error('CRITICAL rollback error for UID:', newUid, rollbackError);
        throw new functions.https.HttpsError(
          'internal',
          `Manual cleanup required for Auth user ${email}. Original error: ${firestoreError.message}`
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        `Failed to create Firestore docs for ${email}. Auth user was rolled back.`
      );
    }
  }
);
