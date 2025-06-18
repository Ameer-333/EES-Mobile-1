
'use client';

import { StudentAttendanceDisplay } from '@/components/student/student-attendance-display';
import type { Student, StudentSubjectAttendance, RawAttendanceRecord, SubjectName } from '@/types';
import { subjectNamesArray } from '@/types';
import { CalendarClock, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { auth, firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const STUDENTS_COLLECTION = 'students';

// Helper function to process raw attendance records
function processRawAttendance(rawRecords: RawAttendanceRecord[] | undefined): StudentSubjectAttendance[] {
  if (!rawRecords || rawRecords.length === 0) {
    return subjectNamesArray.map(subjectName => ({
      subjectName,
      totalClasses: 0,
      attendedClasses: 0,
      records: [],
    }));
  }

  const subjectAttendanceMap = new Map<SubjectName, { total: number; attended: number; dailyRecords: { date: string; status: 'Present' | 'Absent' }[] }>();

  subjectNamesArray.forEach(name => {
    subjectAttendanceMap.set(name, { total: 0, attended: 0, dailyRecords: [] });
  });

  rawRecords.forEach(record => {
    const subjectData = subjectAttendanceMap.get(record.subjectName);
    if (subjectData) {
      subjectData.total++;
      if (record.status === 'Present') {
        subjectData.attended++;
      }
      // Storing daily records might be too verbose for the main display,
      // but useful if we add a drill-down feature later.
      subjectData.dailyRecords.push({ date: record.date, status: record.status });
    }
  });

  return Array.from(subjectAttendanceMap.entries()).map(([subjectName, data]) => ({
    subjectName,
    totalClasses: data.total,
    attendedClasses: data.attended,
    records: data.dailyRecords, // Keep for potential future use, though StudentAttendanceDisplay mainly uses totals
  }));
}


export default function StudentAttendancePage() {
  const [attendanceData, setAttendanceData] = useState<StudentSubjectAttendance[] | undefined>(undefined);
  const [studentName, setStudentName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast({ title: "Authentication Error", description: "Please log in to view attendance.", variant: "destructive" });
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
          setStudentName(studentData.name);
          const processedAttendance = processRawAttendance(studentData.rawAttendanceRecords);
          setAttendanceData(processedAttendance);
        } else {
          toast({ title: "No Student Record", description: "No student profile found linked to your account.", variant: "destructive" });
          setAttendanceData(processRawAttendance(undefined)); // Show empty state
        }
      } catch (error) {
        console.error("Error fetching student attendance:", error);
        toast({ title: "Error", description: "Could not fetch attendance records.", variant: "destructive" });
        setAttendanceData(processRawAttendance(undefined)); // Fallback to empty state
      }
      setIsLoading(false);
    };

    fetchStudentData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading attendance records...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-primary/20 pb-4">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary flex items-center">
          <CalendarClock className="mr-3 h-8 w-8 md:h-10 md:w-10" /> My Attendance
        </h1>
        <p className="text-muted-foreground mt-2 sm:mt-0 text-sm sm:text-base">
          Your attendance records for all subjects.
        </p>
      </div>
      <StudentAttendanceDisplay 
        attendance={attendanceData}
        studentName={studentName} 
      />
    </div>
  );
}
