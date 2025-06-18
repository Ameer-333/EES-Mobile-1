
'use client';

import { StudentAttendanceDisplay } from '@/components/student/student-attendance-display';
import type { Student, StudentSubjectAttendance, RawAttendanceRecord, SubjectName } from '@/types';
import { subjectNamesArray } from '@/types';
import { CalendarClock, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/app/(protected)/layout'; 

const STUDENT_DATA_ROOT_COLLECTION = 'student_data_by_class';
const PROFILES_SUBCOLLECTION_NAME = 'profiles';

// Helper function to get the path to a student's document
const getStudentDocPath = (classId: string, studentProfileId: string): string => {
  if (!classId || !studentProfileId) throw new Error("classId and studentProfileId are required to determine student document path");
  return `${STUDENT_DATA_ROOT_COLLECTION}/${classId}/${PROFILES_SUBCOLLECTION_NAME}/${studentProfileId}`;
};

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
      subjectData.dailyRecords.push({ date: record.date, status: record.status });
    }
  });

  return Array.from(subjectAttendanceMap.entries()).map(([subjectName, data]) => ({
    subjectName,
    totalClasses: data.total,
    attendedClasses: data.attended,
    records: data.dailyRecords,
  }));
}


export default function StudentAttendancePage() {
  const { userProfile, isLoadingAuth } = useAppContext(); 
  const [attendanceData, setAttendanceData] = useState<StudentSubjectAttendance[] | undefined>(undefined);
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
        toast({ title: "Error", description: "Student class or profile ID missing. Cannot fetch attendance.", variant: "destructive" });
        setAttendanceData(processRawAttendance(undefined)); 
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
          setStudentName(studentDataFromDb.name);
          const processedAttendance = processRawAttendance(studentDataFromDb.rawAttendanceRecords);
          setAttendanceData(processedAttendance);
        } else {
          toast({ title: "No Student Record", description: "Student profile not found in their class collection.", variant: "destructive" });
          setAttendanceData(processRawAttendance(undefined));
        }
      } catch (error) {
        console.error("Error fetching student attendance:", error);
        toast({ title: "Error", description: "Could not fetch attendance records.", variant: "destructive" });
        setAttendanceData(processRawAttendance(undefined));
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
    

    