
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, SubjectName, ExamName, ExamRecord, RawAttendanceRecord } from '@/types';
import { subjectNamesArray, examNamesArray } from '@/types'; // Import examNamesArray
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
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, QuerySnapshot, DocumentData, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const STUDENTS_COLLECTION = 'students';

const marksSchema = z.object({
  studentId: z.string().min(1, 'Student is required.'),
  examName: z.custom<ExamName>(val => examNamesArray.includes(val as ExamName), 'Exam Name is required.'),
  subjectName: z.custom<SubjectName>(val => subjectNamesArray.includes(val as SubjectName), 'Subject is required.'),
  marks: z.coerce.number().min(0, 'Marks cannot be negative.').max(100, 'Marks cannot exceed 100.'),
  maxMarks: z.coerce.number().min(1, 'Max marks must be at least 1.').max(100, 'Max marks cannot exceed 100.').default(100),
});

const attendanceSchema = z.object({
  studentId: z.string().min(1, 'Student is required.'),
  subjectName: z.custom<SubjectName>(val => subjectNamesArray.includes(val as SubjectName), 'Subject is required.'),
  date: z.date({ required_error: "Date is required."}),
  status: z.enum(['Present', 'Absent'], { required_error: "Status is required."}),
});

export function TeacherDataEntry() {
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  const [students, setStudents] = useState<Pick<Student, 'id' | 'name'>[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isSubmittingMarks, setIsSubmittingMarks] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);


  useEffect(() => {
    setHasMounted(true);
    const studentsCollectionRef = collection(firestore, STUDENTS_COLLECTION);
    
    const unsubscribe = onSnapshot(studentsCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const fetchedStudents = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Unnamed Student', 
      } as Pick<Student, 'id' | 'name'>));
      setStudents(fetchedStudents);
      setIsLoadingStudents(false);
    }, (error) => {
      console.error("Error fetching students for data entry:", error);
      toast({
        title: "Error Loading Students",
        description: "Could not fetch student list for data entry.",
        variant: "destructive",
      });
      setIsLoadingStudents(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const marksForm = useForm<z.infer<typeof marksSchema>>({
    resolver: zodResolver(marksSchema),
    defaultValues: { studentId: '', marks: 0, maxMarks: 100 },
  });

  const attendanceForm = useForm<z.infer<typeof attendanceSchema>>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: { studentId: '', status: 'Present' },
  });

  async function onMarksSubmit(values: z.infer<typeof marksSchema>) {
    setIsSubmittingMarks(true);
    try {
      const studentDocRef = doc(firestore, STUDENTS_COLLECTION, values.studentId);
      const studentSnap = await getDoc(studentDocRef);

      if (!studentSnap.exists()) {
        toast({ title: 'Error', description: 'Student not found.', variant: 'destructive' });
        setIsSubmittingMarks(false);
        return;
      }

      const studentData = studentSnap.data() as Student;
      let examRecords: ExamRecord[] = studentData.examRecords || [];
      
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

      toast({ title: 'Marks Submitted', description: `Marks for ${values.subjectName} (${values.examName}) recorded for student ${studentData.name}.` });
      marksForm.reset({ 
        studentId: values.studentId,
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
    setIsSubmittingAttendance(true);
    try {
        const studentDocRef = doc(firestore, STUDENTS_COLLECTION, values.studentId);
        const studentSnap = await getDoc(studentDocRef);

        if (!studentSnap.exists()) {
            toast({ title: 'Error', description: 'Student not found.', variant: 'destructive' });
            setIsSubmittingAttendance(false);
            return;
        }
        const studentData = studentSnap.data() as Student;

        const newAttendanceRecord: RawAttendanceRecord = {
            subjectName: values.subjectName,
            date: format(values.date, "yyyy-MM-dd"),
            status: values.status,
        };
        
        // Check if a record for this student, subject, and date already exists
        const existingRecords = studentData.rawAttendanceRecords || [];
        const recordExists = existingRecords.some(
          record => record.subjectName === newAttendanceRecord.subjectName && record.date === newAttendanceRecord.date
        );

        if (recordExists) {
          // Update existing record
          const updatedRecords = existingRecords.map(record =>
            (record.subjectName === newAttendanceRecord.subjectName && record.date === newAttendanceRecord.date)
              ? newAttendanceRecord 
              : record
          );
          await updateDoc(studentDocRef, { rawAttendanceRecords: updatedRecords });
          toast({ title: 'Attendance Updated', description: `Attendance for ${values.subjectName} on ${format(values.date, "PPP")} updated for ${studentData.name}.` });
        } else {
          // Add new record
          await updateDoc(studentDocRef, {
              rawAttendanceRecords: arrayUnion(newAttendanceRecord)
          });
          toast({ title: 'Attendance Submitted', description: `Attendance for ${values.subjectName} on ${format(values.date, "PPP")} recorded for ${studentData.name}.` });
        }
        
        attendanceForm.reset({ 
            studentId: values.studentId, 
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
              <p className="ml-3 text-muted-foreground">Loading student list...</p>
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

  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Data Entry</CardTitle>
        <CardDescription>Upload student marks and attendance records. Students are loaded from Firestore.</CardDescription>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={students.length === 0 || isSubmittingMarks}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={students.length === 0 ? "No students found" : "Select a student"} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students.map(student => (
                            <SelectItem key={student.id} value={student.id}>{student.name} ({student.id})</SelectItem>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value as string} disabled={isSubmittingMarks}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value as string} disabled={isSubmittingMarks}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjectNamesArray.map(subject => (
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
                        <FormControl><Input type="number" placeholder="Enter marks" {...field} disabled={isSubmittingMarks}/></FormControl>
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
                        <FormControl><Input type="number" placeholder="e.g. 100" {...field} disabled={isSubmittingMarks}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto" disabled={students.length === 0 || isSubmittingMarks}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={students.length === 0 || isSubmittingAttendance}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={students.length === 0 ? "No students found" : "Select a student"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students.map(student => (
                            <SelectItem key={student.id} value={student.id}>{student.name} ({student.id})</SelectItem>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value as string} disabled={isSubmittingAttendance}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjectNamesArray.map(subject => (
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
                              disabled={isSubmittingAttendance}
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
                              date > new Date() || date < new Date("2023-01-01") 
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmittingAttendance}>
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
                <Button type="submit" className="w-full md:w-auto" disabled={students.length === 0 || isSubmittingAttendance}>
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
