
'use client';

import { StudentRecords } from '@/components/student/student-records';
import { useEffect, useState } from 'react';
import type { Student, ExamRecord } from '@/types';
import { auth, firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { Loader2, BookCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STUDENTS_COLLECTION = 'students';

export default function StudentRecordsPage() {
  const [examRecords, setExamRecords] = useState<ExamRecord[] | undefined>(undefined);
  const [studentName, setStudentName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast({ title: "Authentication Error", description: "Please log in to view records.", variant: "destructive" });
        setIsLoading(false);
        // Potentially redirect to login
        return;
      }

      try {
        const studentsRef = collection(firestore, STUDENTS_COLLECTION);
        const q = query(studentsRef, where("authUid", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0];
          const studentData = studentDoc.data() as Student;
          setExamRecords(studentData.examRecords || []);
          setStudentName(studentData.name);
        } else {
          toast({ title: "No Student Record", description: "No student profile found linked to your account.", variant: "destructive" });
          setExamRecords([]); // Ensure it's an empty array if no records
        }
      } catch (error) {
        console.error("Error fetching student records:", error);
        toast({ title: "Error", description: "Could not fetch academic records.", variant: "destructive" });
        setExamRecords([]); // Fallback to empty array on error
      }
      setIsLoading(false);
    };

    fetchStudentData();
  }, [toast]);

  if (isLoading) {
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
