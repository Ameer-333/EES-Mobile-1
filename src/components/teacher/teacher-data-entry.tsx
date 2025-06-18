
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, SubjectName, ExamName, ExamRecord, RawAttendanceRecord, TeacherAssignment } from '@/types';
import { subjectNamesArray, examNamesArray } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, CheckSquare, Edit3, UploadCloud, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, QuerySnapshot, DocumentData, doc, getDoc, updateDoc, arrayUnion, DocumentReference, query } from 'firebase/firestore';
import { useAppContext } from '@/app/(protected)/layout';
import { getStudentProfilesCollectionPath, getStudentDocPath as getStudentDocRefFromUtil } from '@/lib/firestore-paths';

const marksSchema = z.object({
  studentId: z.string().min(1, 'Student is required.'), // This will be studentProfileId
  classId: z.string().min(1, 'Class ID for the student is required.'), // Student's classId
  examName: z.custom<ExamName>(val => examNamesArray.includes(val as ExamName), 'Exam Name is required.'),
  subjectName: z.custom<SubjectName>(val => subjectNamesArray.includes(val as SubjectName), 'Subject is required.'),
  marks: z.coerce.number().min(0, 'Marks cannot be negative.').max(100, 'Marks cannot exceed 100.'),
  maxMarks: z.coerce.number().min(1, 'Max marks must be at least 1.').max(100, 'Max marks cannot exceed 100.').default(100),
});

const attendanceSchema = z.object({
  studentId: z.string().min(1, 'Student is required.'), // This will be studentProfileId
  classId: z.string().min(1, 'Class ID for the student is required.'), // Student's classId
  subjectName: z.custom<SubjectName>(val => subjectNamesArray.includes(val as SubjectName), 'Subject is required.'),
  date: z.date({ required_error: "Date is required."}),
  status: z.enum(['Present', 'Absent'], { required_error: "Status is required."}),
});

export function TeacherDataEntry() {
  const { userProfile } = useAppContext();
  const teacherAssignments = userProfile?.role === 'Teacher' ? userProfile.assignments : [];
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);

  const [allAssignedStudents, setAllAssignedStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [selectedStudentData, setSelectedStudentData] = useState<Student | null>(null);


  const [isSubmittingMarks, setIsSubmittingMarks] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (userProfile?.role !== 'Teacher' || !teacherAssignments || teacherAssignments.length === 0) {
      setIsLoadingStudents(false);
      setAllAssignedStudents([]);
      return;
    }

    setIsLoadingStudents(true);
    const unsubscribers: (() => void)[] = [];
    let fetchedStudentsMap: Map<string, Student> = new Map();

    const uniqueClassIds = Array.from(new Set(teacherAssignments.map(a => a.classId).filter(Boolean as unknown as (value: string | undefined) => value is string)));

    if (uniqueClassIds.length === 0) {
      setIsLoadingStudents(false);
      setAllAssignedStudents([]);
      return;
    }

    uniqueClassIds.forEach(classId => {
      const studentProfilesPath = getStudentProfilesCollectionPath(classId);
      const q = query(collection(firestore, studentProfilesPath));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const studentData = {
            id: change.doc.id,
            ...change.doc.data(),
          } as Student;

          if (change.type === "added" || change.type === "modified") {
            fetchedStudentsMap.set(studentData.id, studentData);
          } else if (change.type === "removed") {
            fetchedStudentsMap.delete(studentData.id);
          }
        });

        const filteredByAssignment = Array.from(fetchedStudentsMap.values()).filter(student =>
          teacherAssignments.some(assignment => {
            if (student.classId !== assignment.classId) return false;
            if (['mother_teacher', 'class_teacher', 'subject_teacher'].includes(assignment.type)) {
              return assignment.sectionId ? student.sectionId === assignment.sectionId : true;
            }
            if (['nios_teacher', 'nclp_teacher'].includes(assignment.type)) {
              return assignment.groupId ? student.groupId === assignment.groupId : true;
            }
            return false;
          })
        );
        setAllAssignedStudents(filteredByAssignment);
        setIsLoadingStudents(false);
      }, (error) => {
        console.error(`Error fetching students from ${studentProfilesPath}:`, error);
        setIsLoadingStudents(false);
      });
      unsubscribers.push(unsubscribe);
    });

    return () => unsubscribers.forEach(unsub => unsub());
  }, [userProfile, teacherAssignments]);


  const marksForm = useForm<z.infer<typeof marksSchema>>({
    resolver: zodResolver(marksSchema),
    defaultValues: { studentId: '', classId: '', marks: 0, maxMarks: 100 },
  });

  const attendanceForm = useForm<z.infer<typeof attendanceSchema>>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: { studentId: '', classId: '', status: 'Present' },
  });

  const selectedStudentIdForMarks = marksForm.watch("studentId");
  const selectedStudentIdForAttendance = attendanceForm.watch("studentId");

  useEffect(() => {
    if (selectedStudentIdForMarks) {
      const student = allAssignedStudents.find(s => s.id === selectedStudentIdForMarks);
      setSelectedStudentData(student || null);
      if (student) marksForm.setValue("classId", student.classId);
    } else {
      setSelectedStudentData(null);
    }
  }, [selectedStudentIdForMarks, allAssignedStudents, marksForm]);

  useEffect(() => {
    if (selectedStudentIdForAttendance) {
      const student = allAssignedStudents.find(s => s.id === selectedStudentIdForAttendance);
      setSelectedStudentData(student || null);
      if (student) attendanceForm.setValue("classId", student.classId);
    } else {
      setSelectedStudentData(null);
    }
  }, [selectedStudentIdForAttendance, allAssignedStudents, attendanceForm]);


  const availableSubjectsForSelectedStudent = useMemo(() => {
    if (!selectedStudentData || !teacherAssignments || teacherAssignments.length === 0) return [];

    let relevantSubjects: Set<SubjectName> = new Set();
    teacherAssignments.forEach(assignment => {
      if (assignment.classId === selectedStudentData.classId &&
          (!assignment.sectionId || assignment.sectionId === selectedStudentData.sectionId) &&
          (!assignment.groupId || assignment.groupId === selectedStudentData.groupId) ) {
        if (assignment.type === 'mother_teacher' || assignment.type === 'class_teacher') {
          subjectNamesArray.forEach(s => relevantSubjects.add(s));
        } else if (assignment.type === 'subject_teacher' && assignment.subjectId) {
          relevantSubjects.add(assignment.subjectId);
        } else if (['nios_teacher', 'nclp_teacher'].includes(assignment.type)) {
          subjectNamesArray.forEach(s => relevantSubjects.add(s));
        }
      }
    });
    return Array.from(relevantSubjects);
  }, [selectedStudentData, teacherAssignments]);


  async function onMarksSubmit(values: z.infer<typeof marksSchema>) {
    if (!selectedStudentData) {
        toast({ title: 'Error', description: 'No student selected or student data not loaded.', variant: 'destructive' });
        return;
    }
    setIsSubmittingMarks(true);
    try {
      const studentDocRef = getStudentDocRefFromUtil(values.classId, values.studentId);
      const studentSnap = await getDoc(studentDocRef);

      if (!studentSnap.exists()) {
        toast({ title: 'Error', description: 'Student profile not found in the expected class collection.', variant: 'destructive' });
        setIsSubmittingMarks(false);
        return;
      }

      const currentStudentData = studentSnap.data() as Student;
      let examRecords: ExamRecord[] = currentStudentData.examRecords || [];

      let examRecord = examRecords.find(er => er.examName === values.examName);

      if (examRecord) {
        let subjectMark = examRecord.subjectMarks.find(sm => sm.subjectName === values.subjectName);
        if (subjectMark) {
          subjectMark.marks = values.marks;
          subjectMark.maxMarks = values.maxMarks;
        } else {
          examRecord.subjectMarks.push({
            subjectName: values.subjectName,
            marks: values.marks,
            maxMarks: values.maxMarks,
          });
        }
      } else {
        examRecords.push({
          examName: values.examName,
          subjectMarks: [{
            subjectName: values.subjectName,
            marks: values.marks,
            maxMarks: values.maxMarks,
          }],
        });
      }

      await updateDoc(studentDocRef, { examRecords });

      toast({ title: 'Marks Submitted', description: `Marks for ${values.subjectName} (${values.examName}) recorded for student ${currentStudentData.name}.` });
      marksForm.reset({
        studentId: values.studentId,
        classId: values.classId,
        examName: values.examName,
        subjectName: undefined,
        marks: 0,
        maxMarks: 100
      });
    } catch (error) {
      console.error("Error submitting marks:", error);
      toast({ title: "Error", description: "Failed to submit marks.", variant: "destructive" });
    }
    setIsSubmittingMarks(false);
  }

  async function onAttendanceSubmit(values: z.infer<typeof attendanceSchema>) {
     if (!selectedStudentData) {
        toast({ title: 'Error', description: 'No student selected or student data not loaded.', variant: 'destructive' });
        return;
    }
    setIsSubmittingAttendance(true);
    try {
        const studentDocRef = getStudentDocRefFromUtil(values.classId, values.studentId);
        const studentSnap = await getDoc(studentDocRef);

        if (!studentSnap.exists()) {
            toast({ title: 'Error', description: 'Student profile not found in the expected class collection.', variant: 'destructive' });
            setIsSubmittingAttendance(false);
            return;
        }
        const currentStudentData = studentSnap.data() as Student;

        const newAttendanceRecord: RawAttendanceRecord = {
            subjectName: values.subjectName,
            date: format(values.date, "yyyy-MM-dd"),
            status: values.status,
        };

        const existingRecords = currentStudentData.rawAttendanceRecords || [];
        const recordIndex = existingRecords.findIndex(
          record => record.subjectName === newAttendanceRecord.subjectName && record.date === newAttendanceRecord.date
        );

        let updatedRecords;
        if (recordIndex > -1) {
          updatedRecords = [...existingRecords];
          updatedRecords[recordIndex] = newAttendanceRecord;
          toast({ title: 'Attendance Updated', description: `Attendance for ${values.subjectName} on ${format(values.date, "PPP")} updated for ${currentStudentData.name}.` });
        } else {
          updatedRecords = [...existingRecords, newAttendanceRecord];
          toast({ title: 'Attendance Submitted', description: `Attendance for ${values.subjectName} on ${format(values.date, "PPP")} recorded for ${currentStudentData.name}.` });
        }

        await updateDoc(studentDocRef, { rawAttendanceRecords: updatedRecords });

        attendanceForm.reset({
            studentId: values.studentId,
            classId: values.classId,
            subjectName: values.subjectName,
            date: values.date,
            status: 'Present'
        });

    } catch (error) {
        console.error("Error submitting attendance:", error);
        toast({ title: "Error", description: "Failed to submit attendance.", variant: "destructive" });
    }
    setIsSubmittingAttendance(false);
  }

  if (!hasMounted || isLoadingStudents) {
    return (
      <Card className="w-full shadow-lg rounded-lg">
        <CardHeader>
          <Skeleton className="h-8 w-1/2 mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="grid w-full grid-cols-2 mb-6 gap-1">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Loading assigned students...</p>
            </div>
            <Skeleton className="h-4 w-1/4 mb-1" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-1/4 mb-1" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/3 mt-2" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const noStudentsAssigned = allAssignedStudents.length === 0 && !isLoadingStudents;

  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Data Entry</CardTitle>
        <CardDescription>Upload student marks and attendance records for your assigned students.</CardDescription>
         {noStudentsAssigned && <p className="text-sm text-destructive mt-2">You are not currently assigned to any students. Please contact an administrator.</p>}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="marksEntry" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="marksEntry" className="gap-2"><Edit3 className="h-4 w-4" /> Marks Entry</TabsTrigger>
            <TabsTrigger value="attendanceEntry" className="gap-2"><CheckSquare className="h-4 w-4" /> Attendance Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="marksEntry">
            <Form {...marksForm}>
              <form onSubmit={marksForm.handleSubmit(onMarksSubmit)} className="space-y-6">
                <FormField
                  control={marksForm.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Student</FormLabel>
                      <Select
                        onValueChange={(value) => {
                            field.onChange(value);
                            const student = allAssignedStudents.find(s => s.id === value);
                            setSelectedStudentData(student || null);
                            if (student) marksForm.setValue("classId", student.classId);
                            else marksForm.setValue("classId", "");
                            marksForm.setValue("subjectName", undefined);
                        }}
                        defaultValue={field.value}
                        disabled={noStudentsAssigned || isSubmittingMarks}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={noStudentsAssigned ? "No students assigned" : "Select a student"} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allAssignedStudents.map(student => (
                            <SelectItem key={student.id} value={student.id}>{student.name} ({student.className} {student.sectionId || ''} - SATS: {student.satsNumber})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={marksForm.control}
                  name="examName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Exam</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value as string} disabled={isSubmittingMarks || !selectedStudentData}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select an exam" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {examNamesArray.map(exam => (
                            <SelectItem key={exam} value={exam}>{exam}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={marksForm.control}
                  name="subjectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Subject</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        disabled={isSubmittingMarks || !selectedStudentData || availableSubjectsForSelectedStudent.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={!selectedStudentData ? "Select student first" : (availableSubjectsForSelectedStudent.length === 0 ? "No subjects assigned for this student" : "Select a subject")} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSubjectsForSelectedStudent.map(subject => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={marksForm.control}
                    name="marks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marks Obtained</FormLabel>
                        <FormControl><Input type="number" placeholder="Enter marks" {...field} disabled={isSubmittingMarks || !selectedStudentData}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={marksForm.control}
                    name="maxMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Marks</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g. 100" {...field} disabled={isSubmittingMarks || !selectedStudentData}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto" disabled={noStudentsAssigned || isSubmittingMarks || !selectedStudentData || availableSubjectsForSelectedStudent.length === 0}>
                  {isSubmittingMarks ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                  Submit Marks
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="attendanceEntry">
            <Form {...attendanceForm}>
              <form onSubmit={attendanceForm.handleSubmit(onAttendanceSubmit)} className="space-y-6">
                 <FormField
                  control={attendanceForm.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Student</FormLabel>
                      <Select
                        onValueChange={(value) => {
                            field.onChange(value);
                            const student = allAssignedStudents.find(s => s.id === value);
                            setSelectedStudentData(student || null);
                            if (student) attendanceForm.setValue("classId", student.classId);
                            else attendanceForm.setValue("classId", "");
                            attendanceForm.setValue("subjectName", undefined);
                        }}
                        defaultValue={field.value}
                        disabled={noStudentsAssigned || isSubmittingAttendance}
                      >
                        <FormControl>
                          <SelectTrigger>
                             <SelectValue placeholder={noStudentsAssigned ? "No students assigned" : "Select a student"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allAssignedStudents.map(student => (
                           <SelectItem key={student.id} value={student.id}>{student.name} ({student.className} {student.sectionId || ''} - SATS: {student.satsNumber})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={attendanceForm.control}
                  name="subjectName"
                   render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Subject</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        disabled={isSubmittingAttendance || !selectedStudentData || availableSubjectsForSelectedStudent.length === 0}
                        >
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={!selectedStudentData ? "Select student first" : (availableSubjectsForSelectedStudent.length === 0 ? "No subjects assigned for this student" : "Select a subject")} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSubjectsForSelectedStudent.map(subject => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={attendanceForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmittingAttendance || !selectedStudentData}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("2023-01-01") || !selectedStudentData
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={attendanceForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmittingAttendance || !selectedStudentData}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Present">Present</SelectItem>
                          <SelectItem value="Absent">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full md:w-auto" disabled={noStudentsAssigned || isSubmittingAttendance || !selectedStudentData || availableSubjectsForSelectedStudent.length === 0}>
                  {isSubmittingAttendance ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                   Submit Attendance
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
