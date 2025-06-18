
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, SubjectName, StudentRemark, TeacherAssignment } from '@/types';
import { subjectNamesArray } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquarePlus, Loader2, Send, BookOpen, Smile, Frown, Meh, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, firestore } from '@/lib/firebase'; 
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, query, orderBy, DocumentReference, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { useAppContext } from '@/app/(protected)/layout';


const STUDENT_DATA_ROOT_COLLECTION = 'student_data_by_class';
const PROFILES_SUBCOLLECTION_NAME = 'profiles';
const USERS_COLLECTION = 'users'; // For fetching teacher's name

// Helper function to get the path to a class's profiles subcollection
const getStudentProfilesCollectionPath = (classId: string): string => {
  if (!classId) {
     console.warn("Attempted to get student profiles collection path with undefined classId for remarks");
    return `${STUDENT_DATA_ROOT_COLLECTION}/unknown_class/${PROFILES_SUBCOLLECTION_NAME}`;
  }
  return `${STUDENT_DATA_ROOT_COLLECTION}/${classId}/${PROFILES_SUBCOLLECTION_NAME}`;
};

// Helper function to get the path to a student's document
const getStudentDocRef = (classId: string, studentProfileId: string): DocumentReference => {
  if (!classId || !studentProfileId) throw new Error("classId and studentProfileId are required to get student document reference for remarks");
  const path = `${STUDENT_DATA_ROOT_COLLECTION}/${classId}/${PROFILES_SUBCOLLECTION_NAME}/${studentProfileId}`;
  return doc(firestore, path);
};


const remarkSchema = z.object({
  studentId: z.string().min(1, 'Student selection is required.'), // This will be studentProfileId
  classId: z.string().min(1, "Class ID is required for student context."), // Student's classId
  teacherSubject: z.custom<SubjectName>(val => subjectNamesArray.includes(val as SubjectName), 'Subject is required.'),
  remarkText: z.string().min(10, 'Remark must be at least 10 characters.').max(500, 'Remark cannot exceed 500 characters.'),
  sentiment: z.enum(['good', 'bad', 'neutral'], { required_error: 'Please select the remark sentiment.'}),
});

type RemarkFormValues = z.infer<typeof remarkSchema>;

export function GiveStudentRemarkForm() {
  const { userProfile: teacherUserProfile } = useAppContext();
  const teacherAssignments = teacherUserProfile?.role === 'Teacher' ? teacherUserProfile.assignments : [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingRemarkCheck, setIsLoadingRemarkCheck] = useState(false);
  
  const [allAssignedStudents, setAllAssignedStudents] = useState<Student[]>([]);
  const [selectedStudentData, setSelectedStudentData] = useState<Student | null>(null); // Full student data for the selected one
  
  const [remarkAlreadySubmittedThisMonth, setRemarkAlreadySubmittedThisMonth] = useState(false);
  const [currentTeacherName, setCurrentTeacherName] = useState<string>("Teacher");

  const { toast } = useToast();

  useEffect(() => {
    if (teacherUserProfile?.name) {
        setCurrentTeacherName(teacherUserProfile.name);
    }
  }, [teacherUserProfile]);


  const form = useForm<RemarkFormValues>({
    resolver: zodResolver(remarkSchema),
    defaultValues: {
      studentId: '',
      classId: '',
      teacherSubject: undefined,
      remarkText: '',
      sentiment: 'neutral',
    },
  });

  const watchedStudentId = form.watch('studentId'); // This is studentProfileId
  const watchedSubject = form.watch('teacherSubject');

  useEffect(() => {
    if (teacherUserProfile?.role !== 'Teacher' || !teacherAssignments || teacherAssignments.length === 0) {
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
            id: change.doc.id, // studentProfileId
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
        console.error(`Error fetching students from ${studentProfilesPath} for remarks:`, error);
        setIsLoadingStudents(false);
      });
      unsubscribers.push(unsubscribe);
    });
    return () => unsubscribers.forEach(unsub => unsub());
  }, [teacherUserProfile, teacherAssignments]);


  useEffect(() => {
    const checkExistingRemark = async () => {
      if (!watchedStudentId || !watchedSubject || !currentTeacherName || currentTeacherName === "Teacher") {
        setRemarkAlreadySubmittedThisMonth(false);
        setSelectedStudentData(null); 
        form.setValue("classId", "");
        return;
      }
      
      const studentFromList = allAssignedStudents.find(s => s.id === watchedStudentId);
      if (!studentFromList) {
        setSelectedStudentData(null);
        form.setValue("classId", "");
        setRemarkAlreadySubmittedThisMonth(false);
        return;
      }
      
      setSelectedStudentData(studentFromList); // Set full student data
      form.setValue("classId", studentFromList.classId); // Ensure classId is set in form for submission

      setIsLoadingRemarkCheck(true);
      setRemarkAlreadySubmittedThisMonth(false); 

      try {
        // The studentFromList already has remarks, no need to fetch again unless it's stale
        const existingRemarks = studentFromList.remarks || [];
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const hasRemark = existingRemarks.some(remark => {
          const remarkDate = new Date(remark.date);
          return remark.teacherSubject === watchedSubject &&
                 remark.teacherName === currentTeacherName && 
                 remarkDate.getMonth() === currentMonth &&
                 remarkDate.getFullYear() === currentYear;
        });
        setRemarkAlreadySubmittedThisMonth(hasRemark);
      } catch (error) {
        console.error("Error processing existing remark check:", error);
        toast({ title: "Error", description: "Could not verify existing remarks.", variant: "destructive" });
      }
      setIsLoadingRemarkCheck(false);
    };

    if (currentTeacherName !== "Teacher" && allAssignedStudents.length > 0) {
      checkExistingRemark();
    }
  }, [watchedStudentId, watchedSubject, currentTeacherName, toast, allAssignedStudents, form]);

  // Filter subjects based on teacher's role and assignments for the selected student
  const availableSubjectsForSelectedStudent = useMemo(() => {
    if (!selectedStudentData || !teacherAssignments) return subjectNamesArray;

    let relevantSubjects: Set<SubjectName> = new Set();
    teacherAssignments.forEach(assignment => {
      if (assignment.classId === selectedStudentData.classId && 
          (!assignment.sectionId || assignment.sectionId === selectedStudentData.sectionId)) {
        if (assignment.type === 'mother_teacher' || assignment.type === 'class_teacher') {
          subjectNamesArray.forEach(s => relevantSubjects.add(s));
        } else if (assignment.type === 'subject_teacher' && assignment.subjectId) {
          relevantSubjects.add(assignment.subjectId);
        } else if (['nios_teacher', 'nclp_teacher'].includes(assignment.type)) {
           subjectNamesArray.forEach(s => relevantSubjects.add(s));
        }
      }
    });
    return Array.from(relevantSubjects).length > 0 ? Array.from(relevantSubjects) : subjectNamesArray;
  }, [selectedStudentData, teacherAssignments]);


  async function onSubmit(values: RemarkFormValues) {
    if (remarkAlreadySubmittedThisMonth) {
      toast({
        title: "Submission Blocked",
        description: `A remark for ${values.teacherSubject} for this student has already been submitted this month by you.`,
        variant: "destructive",
      });
      return;
    }
    if (!selectedStudentData || !values.classId) {
      toast({ title: "Error", description: "Student data or Class ID not loaded. Cannot submit remark.", variant: "destructive"});
      return;
    }
     if (currentTeacherName === "Teacher") {
      toast({ title: "Error", description: "Teacher details not loaded. Please try again.", variant: "destructive"});
      return;
    }

    setIsSubmitting(true);
    
    const newRemark: StudentRemark = {
      id: `remark_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      teacherName: currentTeacherName,
      teacherSubject: values.teacherSubject,
      remark: values.remarkText,
      date: new Date().toISOString().split('T')[0], 
      sentiment: values.sentiment,
    };

    try {
      const studentDocRef = getStudentDocRef(values.classId, values.studentId); // values.studentId is studentProfileId
      await updateDoc(studentDocRef, {
        remarks: arrayUnion(newRemark)
      });
      
      toast({
        title: 'Remark Submitted Successfully!',
        description: `Your ${values.sentiment} remark for ${selectedStudentData.name} regarding ${values.teacherSubject} has been saved.`,
      });
      form.reset({studentId: '', classId: '', teacherSubject: undefined, remarkText: '', sentiment: 'neutral'});
      setSelectedStudentData(null); 
      setRemarkAlreadySubmittedThisMonth(false); 
    } catch (error) {
      console.error("Error saving remark to Firestore:", error);
      toast({
        title: "Save Failed",
        description: "Could not save the remark to Firestore. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isFormDisabled = isSubmitting || isLoadingRemarkCheck || remarkAlreadySubmittedThisMonth || currentTeacherName === "Teacher";

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg border-primary/20">
      <CardHeader className="bg-primary/5 rounded-t-lg">
        <CardTitle className="text-2xl font-headline text-primary flex items-center">
          <MessageSquarePlus className="mr-3 h-7 w-7" /> Provide Student Remark
        </CardTitle>
        <CardDescription>Select a student, subject, sentiment, and write your feedback. Remarks are limited to one per subject, per student, per month by the same teacher ({currentTeacherName}).</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoadingStudents ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading assigned students...</p>
          </div>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="studentId" // This is studentProfileId
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Student</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      const student = allAssignedStudents.find(s => s.id === value);
                      setSelectedStudentData(student || null); 
                      form.setValue("classId", student?.classId || "");
                      form.setValue("teacherSubject", undefined); // Reset subject
                      setRemarkAlreadySubmittedThisMonth(false);
                    }} 
                    defaultValue={field.value}
                    disabled={allAssignedStudents.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={allAssignedStudents.length === 0 ? "No assigned students found" : "Choose a student..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allAssignedStudents.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.className} {student.sectionId || ''} - {student.satsNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teacherSubject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><BookOpen className="mr-2 h-4 w-4 text-muted-foreground"/>Subject of Remark</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                       field.onChange(value);
                       setRemarkAlreadySubmittedThisMonth(false); 
                    }} 
                    value={field.value || ''}
                    disabled={!selectedStudentData}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={!selectedStudentData ? "Select student first" : "Select subject"} />
                      </SelectTrigger>
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

            {isLoadingRemarkCheck && (
              <div className="flex items-center text-sm text-muted-foreground p-2 border rounded-md bg-muted/50">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking for existing remarks this month...
              </div>
            )}

            {remarkAlreadySubmittedThisMonth && !isLoadingRemarkCheck && (
              <div className="flex items-center text-sm text-destructive p-3 border border-destructive/50 bg-destructive/10 rounded-md">
                <AlertTriangle className="h-5 w-5 mr-2" />
                A remark for {form.getValues('teacherSubject')} for {selectedStudentData?.name || 'this student'} has already been submitted this month by you.
              </div>
            )}

            <FormField
              control={form.control}
              name="sentiment"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Remark Sentiment</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-1"
                      disabled={isFormDisabled}
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="good" id="good" /></FormControl>
                        <FormLabel htmlFor="good" className="font-normal flex items-center text-green-600"><Smile className="h-5 w-5 mr-1.5"/>Good</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="neutral" id="neutral" /></FormControl>
                        <FormLabel htmlFor="neutral" className="font-normal flex items-center text-yellow-600"><Meh className="h-5 w-5 mr-1.5"/>Neutral</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="bad" id="bad" /></FormControl>
                        <FormLabel htmlFor="bad" className="font-normal flex items-center text-red-600"><Frown className="h-5 w-5 mr-1.5"/>Needs Improvement</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarkText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remark / Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your remark here (e.g., academic progress, behavior, participation)..."
                      className="min-h-[120px] bg-background"
                      {...field}
                      disabled={isFormDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isFormDisabled || allAssignedStudents.length === 0} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting || isLoadingRemarkCheck ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Submitting...' : isLoadingRemarkCheck ? 'Checking...' : 'Submit Remark'}
            </Button>
            {allAssignedStudents.length === 0 && !isLoadingStudents && (
                 <p className="text-sm text-destructive text-center">No assigned students found. Cannot submit remarks.</p>
            )}
             {currentTeacherName === "Teacher" && !isLoadingStudents && (
                 <p className="text-sm text-orange-500 text-center">Loading teacher details for remark validation...</p>
            )}
          </form>
        </Form>
        )}
      </CardContent>
    </Card>
  );
}
    

    