
'use client';

import { StudentRemarksDisplay } from '@/components/student/student-remarks-display';
import type { Student, StudentRemark } from '@/types';
import { useEffect, useState } from 'react';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, MessageSquareText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/app/(protected)/layout'; 

const STUDENT_DATA_ROOT_COLLECTION = 'student_data_by_class';
const PROFILES_SUBCOLLECTION_NAME = 'profiles';

// Helper function to get the path to a student's document
const getStudentDocPath = (classId: string, studentProfileId: string): string => {
  if (!classId || !studentProfileId) throw new Error("classId and studentProfileId are required to determine student document path");
  return `${STUDENT_DATA_ROOT_COLLECTION}/${classId}/${PROFILES_SUBCOLLECTION_NAME}/${studentProfileId}`;
};


export default function StudentRemarksPage() {
  const { userProfile, isLoadingAuth } = useAppContext(); 
  const [remarks, setRemarks] = useState<StudentRemark[] | undefined>(undefined);
  const [studentName, setStudentName] = useState<string | undefined>(undefined);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null | undefined>(undefined);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (isLoadingAuth || !userProfile || userProfile.role !== 'Student') {
        if (!isLoadingAuth && userProfile && userProfile.role !== 'Student') {
          toast({ title: "Access Denied", description: "Only students can view this page.", variant: "destructive" });
        }
        setIsLoadingPageData(false);
        return;
      }
      
      if (!userProfile.classId || !userProfile.studentProfileId) {
        toast({ title: "Error", description: "Student class or profile ID missing. Cannot fetch remarks.", variant: "destructive" });
        setRemarks([]);
        setProfilePictureUrl(null);
        setIsLoadingPageData(false);
        return;
      }

      setIsLoadingPageData(true);
      try {
        const studentDocPath = getStudentDocPath(userProfile.classId, userProfile.studentProfileId);
        const studentDocRef = doc(firestore, studentDocPath);
        const studentDocSnap = await getDoc(studentDocRef);

        if (studentDocSnap.exists()) {
          const studentDataFromDb = studentDocSnap.data() as Student;
          setRemarks(studentDataFromDb.remarks || []);
          setStudentName(studentDataFromDb.name);
          setProfilePictureUrl(studentDataFromDb.profilePictureUrl || null);
        } else {
          toast({ title: "No Student Record", description: "Student profile not found in their class collection.", variant: "destructive" });
          setRemarks([]);
          setProfilePictureUrl(null);
        }
      } catch (error) {
        console.error("Error fetching student remarks:", error);
        toast({ title: "Error", description: "Could not fetch remarks.", variant: "destructive" });
        setRemarks([]);
        setProfilePictureUrl(null);
      }
      setIsLoadingPageData(false);
    };

    if(!isLoadingAuth) {
        fetchStudentData();
    }
  }, [userProfile, isLoadingAuth, toast]);

  if (isLoadingAuth || isLoadingPageData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading remarks...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-0 md:p-4 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-primary/20 pb-4">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary flex items-center">
          <MessageSquareText className="mr-3 h-8 w-8 md:h-10 md:w-10" /> My Remarks
        </h1>
        <p className="text-muted-foreground mt-2 sm:mt-0 text-sm sm:text-base">
          Feedback and comments from your teachers.
        </p>
      </div>
      <StudentRemarksDisplay 
        remarks={remarks} 
        profilePictureUrl={profilePictureUrl}
        studentName={studentName}
      />
    </div>
  );
}

    

    