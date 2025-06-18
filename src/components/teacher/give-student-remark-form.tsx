
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, SubjectName, StudentRemark, TeacherAssignment } from '@/types';
import { allSubjectNamesArray, standardSubjectNamesArray, niosSubjectNamesArray, nclpSubjectNamesArray, motherTeacherCoreSubjects, nclpAllSubjects, nclpGroupBSubjectsNoHindi, niosSubjectsForAssignment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquarePlus, Loader2, Send, BookOpen, Smile, Frown, Meh, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, query, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { useAppContext } from '@/app/(protected)/layout';
import { getStudentProfilesCollectionPath, getStudentDocPath as getStudentDocRefFromUtil } from '@/lib/firestore-paths';

const remarkSchema = z.object({
  studentId: z.string().min(1, 'Student selection is required.'),
  classId: z.string().min(1, "Class ID is required for student context."),
  teacherSubject: z.custom<SubjectName>(val => allSubjectNamesArray.includes(val as SubjectName), 'Subject is required.'),
  remarkText: z.string().min(10, 'Remark must be at least 10 characters.').max(500, 'Remark cannot exceed 500 characters.'),
  sentiment: z.enum(['good', 'bad', 'neutral'], { required_error: 'Please select the remark sentiment.'}),
});

type RemarkFormValues = z.infer<typeof remarkSchema>;

export function GiveStudentRemarkForm() {
  const { userProfile: teacherUserProfile } = useAppContext();
  const teacherAssignments = teacherUserProfile?.role === 'Teacher' ? teacherUserProfile.assignments || [] : [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingRemarkCheck, setIsLoadingRemarkCheck] = useState(false);
  const [allAssignedStudents, setAllAssignedStudents] = useState<Student[]>([]);
  const [selectedStudentData, setSelectedStudentData] = useState<Student | null>(null);
  const [remarkAlreadySubmittedThisMonth, setRemarkAlreadySubmittedThisMonth] = useState(false);
  const [currentTeacherName, setCurrentTeacherName] = useState<string>("Teacher");
  const { toast } = useToast();

  useEffect(() => {
    if (teacherUserProfile?.name) setCurrentTeacherName(teacherUserProfile.name);
  }, [teacherUserProfile]);

  const form = useForm<RemarkFormValues>({
    resolver: zodResolver(remarkSchema),
    defaultValues: { studentId: '', classId: '', teacherSubject: undefined, remarkText: '', sentiment: 'neutral' },
  });

  const watchedStudentId = form.watch('studentId');
  const watchedSubject = form.watch('teacherSubject');

  useEffect(() => { // Fetching students
    if (teacherUserProfile?.role !== 'Teacher' || teacherAssignments.length === 0) {
      setIsLoadingStudents(false); setAllAssignedStudents([]); return;
    }
    setIsLoadingStudents(true);
    const unsubscribers: (() => void)[] = [];
    const fetchedStudentsMap: Map<string, Student> = new Map();
    const uniqueClassIds = Array.from(new Set(teacherAssignments.map(a => a.classId)));

    if (uniqueClassIds.length === 0) {
        setIsLoadingStudents(false); setAllAssignedStudents([]); return;
    }
    
    let activeListeners = uniqueClassIds.length;
    uniqueClassIds.forEach(classId => {
      const studentProfilesPath = getStudentProfilesCollectionPath(classId);
      const q = query(collection(firestore, studentProfilesPath));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const studentData = { id: change.doc.id, ...change.doc.data() } as Student;
          if (change.type === "added" || change.type === "modified") fetchedStudentsMap.set(studentData.id, studentData);
          else if (change.type === "removed") fetchedStudentsMap.delete(studentData.id);
        });
        const currentFilteredStudents = Array.from(fetchedStudentsMap.values()).filter(student => 
            teacherAssignments.some(assignment => {
                if (student.classId !== assignment.classId) return false;
                if ((assignment.type === 'class_teacher' || assignment.type === 'mother_teacher')) {
                    return !assignment.sectionId || student.sectionId === assignment.sectionId;
                }
                if (assignment.type === 'subject_teacher' || assignment.type === 'nios_teacher' || assignment.type === 'nclp_teacher') {
                    if (assignment.sectionId && student.sectionId !== assignment.sectionId) return false;
                    if (assignment.groupId && student.groupId !== assignment.groupId) return false;
                    return true;
                }
                return false;
            })
        );
        setAllAssignedStudents(currentFilteredStudents);
      }, (error) => console.error(`Error fetching students from ${studentProfilesPath} for remarks:`, error));
      unsubscribers.push(unsubscribe);
    });
    if (activeListeners > 0) {
        const initialLoadCheck = setInterval(() => {
            if (unsubscribers.length === activeListeners) { setIsLoadingStudents(false); clearInterval(initialLoadCheck); }
        }, 500);
        setTimeout(() => { if(isLoadingStudents) setIsLoadingStudents(false); clearInterval(initialLoadCheck); }, 5000);
    } else { setIsLoadingStudents(false); }
    return () => unsubscribers.forEach(unsub => unsub());
  }, [teacherUserProfile, teacherAssignments, isLoadingStudents]);

  useEffect(() => { // Update selectedStudentData and classId in form
    if (watchedStudentId) {
        const student = allAssignedStudents.find(s => s.id === watchedStudentId);
        setSelectedStudentData(student || null);
        if (student) form.setValue("classId", student.classId, { shouldValidate: true, shouldDirty: false });
        else form.setValue("classId", "", { shouldValidate: true, shouldDirty: false });
    } else {
        setSelectedStudentData(null);
        form.setValue("classId", "", { shouldValidate: true, shouldDirty: false });
    }
  }, [watchedStudentId, allAssignedStudents, form]);

  useEffect(() => { // Check for existing remarks
    const checkExistingRemark = async () => {
      if (!watchedStudentId || !watchedSubject || !selectedStudentData || currentTeacherName === "Teacher") {
        setRemarkAlreadySubmittedThisMonth(false); return;
      }
      setIsLoadingRemarkCheck(true); setRemarkAlreadySubmittedThisMonth(false);
      try {
        const existingRemarks = selectedStudentData.remarks || [];
        const currentDate = new Date(); const currentMonth = currentDate.getMonth(); const currentYear = currentDate.getFullYear();
        const hasRemark = existingRemarks.some(remark => {
          const remarkDate = new Date(remark.date);
          return remark.teacherSubject === watchedSubject && remark.teacherName === currentTeacherName &&
                 remarkDate.getMonth() === currentMonth && remarkDate.getFullYear() === currentYear;
        });
        setRemarkAlreadySubmittedThisMonth(hasRemark);
      } catch (error) {
        console.error("Error processing existing remark check:", error);
        toast({ title: "Error", description: "Could not verify existing remarks.", variant: "destructive" });
      }
      setIsLoadingRemarkCheck(false);
    };
    if (currentTeacherName !== "Teacher" && selectedStudentData) {
      checkExistingRemark();
    }
  }, [watchedStudentId, watchedSubject, currentTeacherName, toast, selectedStudentData]);

  const relevantSubjectsForSelectedStudent = useMemo(() => {
    if (!selectedStudentData || teacherAssignments.length === 0) return [];
    let subjects: Set<SubjectName> = new Set();
    const studentSpecificAssignments = teacherAssignments.filter(
      a => a.classId === selectedStudentData.classId &&
           (!a.sectionId || a.sectionId === selectedStudentData.sectionId) &&
           (!a.groupId || a.groupId === selectedStudentData.groupId)
    );
    studentSpecificAssignments.forEach(assignment => {
      switch (assignment.type) {
        case 'mother_teacher': motherTeacherCoreSubjects.forEach(s => subjects.add(s));
            if(studentSpecificAssignments.some(sa => sa.subjectId === 'Hindi' && sa.type === 'subject_teacher')) subjects.add('Hindi');
            if(studentSpecificAssignments.some(sa => sa.subjectId === 'Kannada' && sa.type === 'subject_teacher')) subjects.add('Kannada');
            break;
        case 'class_teacher': standardSubjectNamesArray.forEach(s => subjects.add(s)); break;
        case 'subject_teacher': if (assignment.subjectId) subjects.add(assignment.subjectId); break;
        case 'nios_teacher': 
            (assignment.subjectId ? [assignment.subjectId] : niosSubjectNamesArray).forEach(s => subjects.add(s as NIOSSubjectName));
            break;
        case 'nclp_teacher':
            if (selectedStudentData.groupId?.includes("GROUP_B") && assignment.subjectId === 'Hindi (NCLP)') subjects.add('Hindi (NCLP)');
            else if (selectedStudentData.groupId?.includes("GROUP_B")) nclpGroupBSubjectsNoHindi.forEach(s => subjects.add(s));
            else (assignment.subjectId ? [assignment.subjectId] : nclpSubjectNamesArray).forEach(s => subjects.add(s as NCLPSubjectName));
            break;
      }
    });
    return Array.from(subjects);
  }, [selectedStudentData, teacherAssignments]);


  async function onSubmit(values: RemarkFormValues) {
    if (remarkAlreadySubmittedThisMonth) {
      toast({ title: "Submission Blocked", description: `A remark for ${values.teacherSubject} for this student has already been submitted this month by you.`, variant: "destructive" });
      return;
    }
    if (!selectedStudentData || !values.classId || currentTeacherName === "Teacher") {
      toast({ title: "Error", description: "Student data, Class ID, or Teacher Name not loaded.", variant: "destructive"}); return;
    }
    setIsSubmitting(true);
    const newRemark: StudentRemark = {
      id: `remark_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      teacherName: currentTeacherName, teacherSubject: values.teacherSubject,
      remark: values.remarkText, date: new Date().toISOString().split('T')[0], sentiment: values.sentiment,
    };
    try {
      const studentDocRef = getStudentDocRefFromUtil(values.classId, values.studentId);
      await updateDoc(studentDocRef, { remarks: arrayUnion(newRemark) });
      toast({ title: 'Remark Submitted!', description: `Your ${values.sentiment} remark for ${selectedStudentData.name} for ${values.teacherSubject} saved.` });
      form.reset({studentId: '', classId: '', teacherSubject: undefined, remarkText: '', sentiment: 'neutral'});
      setSelectedStudentData(null); setRemarkAlreadySubmittedThisMonth(false);
    } catch (error) {
      console.error("Error saving remark:", error);
      toast({ title: "Save Failed", description: "Could not save remark.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isFormDisabled = isSubmitting || isLoadingRemarkCheck || remarkAlreadySubmittedThisMonth || currentTeacherName === "Teacher" || !selectedStudentData;
  const noStudentsAssigned = allAssignedStudents.length === 0 && !isLoadingStudents;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg border-primary/20">
      <CardHeader className="bg-primary/5 rounded-t-lg">
        <CardTitle className="text-2xl font-headline text-primary flex items-center"><MessageSquarePlus className="mr-3 h-7 w-7" /> Provide Student Remark</CardTitle>
        <CardDescription>Select student, subject, sentiment, and write feedback. One remark per subject, per student, per month by {currentTeacherName}.</CardDescription>
        {noStudentsAssigned && <p className="text-sm text-destructive mt-2">No students assigned for remarks. Contact admin.</p>}
      </CardHeader>
      <CardContent className="pt-6">
        {isLoadingStudents ? ( <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-3 text-muted-foreground">Loading students...</p></div> ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="studentId" render={({ field }) => (
                <FormItem><FormLabel>Select Student</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue("teacherSubject", undefined); setRemarkAlreadySubmittedThisMonth(false); }} defaultValue={field.value} disabled={noStudentsAssigned}>
                    <FormControl><SelectTrigger className="bg-background"><SelectValue placeholder={noStudentsAssigned ? "No students assigned" : "Choose student..."} /></SelectTrigger></FormControl>
                    <SelectContent>{allAssignedStudents.map(s => (<SelectItem key={s.id} value={s.id}>{s.name} ({s.className} {s.sectionId || s.groupId || ''})</SelectItem>))}</SelectContent>
                </Select><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="teacherSubject" render={({ field }) => (
                <FormItem><FormLabel className="flex items-center"><BookOpen className="mr-2 h-4 w-4 text-muted-foreground"/>Subject</FormLabel><Select onValueChange={(value) => { field.onChange(value); setRemarkAlreadySubmittedThisMonth(false); }} value={field.value || ''} disabled={!selectedStudentData || relevantSubjectsForSelectedStudent.length === 0}>
                    <FormControl><SelectTrigger className="bg-background"><SelectValue placeholder={!selectedStudentData ? "Select student first" : (relevantSubjectsForSelectedStudent.length === 0 ? "No subjects applicable" : "Select subject")} /></SelectTrigger></FormControl>
                    <SelectContent>{relevantSubjectsForSelectedStudent.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                </Select><FormMessage /></FormItem> )}/>
            {isLoadingRemarkCheck && (<div className="flex items-center text-sm text-muted-foreground p-2 border rounded-md bg-muted/50"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Checking remarks...</div>)}
            {remarkAlreadySubmittedThisMonth && !isLoadingRemarkCheck && selectedStudentData && (<div className="flex items-center text-sm text-destructive p-3 border border-destructive/50 bg-destructive/10 rounded-md"><AlertTriangle className="h-5 w-5 mr-2" />Remark for {form.getValues('teacherSubject')} for {selectedStudentData?.name} already submitted this month by you.</div>)}
            <FormField control={form.control} name="sentiment" render={({ field }) => (
                <FormItem className="space-y-3"><FormLabel>Sentiment</FormLabel><FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-1" disabled={isFormDisabled || !selectedStudentData}>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="good" id="good" /></FormControl><FormLabel htmlFor="good" className="font-normal flex items-center text-green-600"><Smile className="h-5 w-5 mr-1.5"/>Good</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="neutral" id="neutral" /></FormControl><FormLabel htmlFor="neutral" className="font-normal flex items-center text-yellow-600"><Meh className="h-5 w-5 mr-1.5"/>Neutral</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="bad" id="bad" /></FormControl><FormLabel htmlFor="bad" className="font-normal flex items-center text-red-600"><Frown className="h-5 w-5 mr-1.5"/>Needs Improvement</FormLabel></FormItem>
                    </RadioGroup></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="remarkText" render={({ field }) => (
                <FormItem><FormLabel>Remark / Feedback</FormLabel><FormControl><Textarea placeholder="Enter remark..." className="min-h-[120px] bg-background" {...field} disabled={isFormDisabled || !selectedStudentData} /></FormControl><FormMessage /></FormItem> )}/>
            <Button type="submit" disabled={isFormDisabled || noStudentsAssigned || !selectedStudentData || relevantSubjectsForSelectedStudent.length === 0} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"> {isSubmitting || isLoadingRemarkCheck ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} {isSubmitting ? 'Submitting...' : isLoadingRemarkCheck ? 'Checking...' : 'Submit Remark'} </Button>
             {currentTeacherName === "Teacher" && !isLoadingStudents && !noStudentsAssigned && (<p className="text-sm text-orange-500 text-center">Loading teacher details...</p>)}
          </form>
        </Form>
        )}
      </CardContent>
    </Card>
  );
}

