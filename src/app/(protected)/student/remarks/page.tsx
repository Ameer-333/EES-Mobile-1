
'use client';

import { StudentRemarksDisplay } from '@/components/student/student-remarks-display';
import type { Student, StudentRemark } from '@/types';
import { useEffect, useState } from 'react';
import { auth, firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { Loader2, MessageSquareText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STUDENTS_COLLECTION = 'students';

export default function StudentRemarksPage() {
  const [remarks, setRemarks] = useState<StudentRemark[] | undefined>(undefined);
  const [studentName, setStudentName] = useState<string | undefined>(undefined);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast({ title: "Authentication Error", description: "Please log in to view remarks.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      try {
        const studentsRef = collection(firestore, STUDENTS_COLLECTION);
        const q = query(studentsRef, where("authUid", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0];
          const studentData = studentDoc.data() as Student;
          setRemarks(studentData.remarks || []);
          setStudentName(studentData.name);
          setProfilePictureUrl(studentData.profilePictureUrl || null);
        } else {
          toast({ title: "No Student Record", description: "No student profile found linked to your account.", variant: "destructive" });
          setRemarks([]);
          setProfilePictureUrl(null);
        }
      } catch (error) {
        console.error("Error fetching student remarks:", error);
        toast({ title: "Error", description: "Could not fetch remarks.", variant: "destructive" });
        setRemarks([]);
        setProfilePictureUrl(null);
      }
      setIsLoading(false);
    };

    fetchStudentData();
  }, [toast]);

  if (isLoading) {
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
