
'use client';

import { StudentRecords } from '@/components/student/student-records';
import { useEffect, useState } from 'react';
import type { Student, ExamRecord } from '@/types';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, BookCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/app/(protected)/layout'; 

const STUDENT_DATA_ROOT_COLLECTION = 'student_data_by_class';
const PROFILES_SUBCOLLECTION_NAME = 'profiles';

// Helper function to get the path to a student's document
const getStudentDocPath = (classId: string, studentProfileId: string): string => {
  if (!classId || !studentProfileId) throw new Error("classId and studentProfileId are required to determine student document path");
  return `${STUDENT_DATA_ROOT_COLLECTION}/${classId}/${PROFILES_SUBCOLLECTION_NAME}/${studentProfileId}`;
};


export default function StudentRecordsPage() {
  const { userProfile, isLoadingAuth } = useAppContext(); 
  const [examRecords, setExamRecords] = useState<ExamRecord[] | undefined>(undefined);
  const [studentName, setStudentName] = useState<string | undefined>(undefined);
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
        toast({ title: "Error", description: "Student class or profile ID missing. Cannot fetch records.", variant: "destructive" });
        setIsLoadingPageData(false);
        setExamRecords([]);
        return;
      }
      
      setIsLoadingPageData(true);
      try {
        const studentDocPath = getStudentDocPath(userProfile.classId, userProfile.studentProfileId);
        const studentDocRef = doc(firestore, studentDocPath);
        const studentDocSnap = await getDoc(studentDocRef);

        if (studentDocSnap.exists()) {
          const studentData = studentDocSnap.data() as Student;
          setExamRecords(studentData.examRecords || []);
          setStudentName(studentData.name);
        } else {
          toast({ title: "No Student Record", description: "Student profile not found in their class collection.", variant: "destructive" });
          setExamRecords([]);
        }
      } catch (error) {
        console.error("Error fetching student records:", error);
        toast({ title: "Error", description: "Could not fetch academic records.", variant: "destructive" });
        setExamRecords([]);
      }
      setIsLoadingPageData(false);
    };

    if (!isLoadingAuth) {
        fetchStudentData();
    }
  }, [userProfile, isLoadingAuth, toast]);

  if (isLoadingAuth || isLoadingPageData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading academic records...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-0 md:p-4 space-y-6">
      <h1 className="text-3xl font-headline font-bold">My Academic Records {studentName && `- ${studentName}`}</h1>
      {examRecords !== undefined ? (
        <StudentRecords examRecords={examRecords} studentName={studentName} />
      ) : (
        <div className="text-center py-10">
            <BookCheck className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Could not load records or no records available.</p>
        </div>
      )}
    </div>
  );
}
    

    