
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, SubjectName, StudentRemark } from '@/types';
import { subjectNamesArray } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquarePlus, Loader2, Send, BookOpen, Smile, Frown, Meh, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, query, orderBy } from 'firebase/firestore';

const STUDENTS_COLLECTION = 'students';

const remarkSchema = z.object({
  studentId: z.string().min(1, 'Student selection is required.'),
  teacherSubject: z.custom<SubjectName>(val => subjectNamesArray.includes(val as SubjectName), 'Subject is required.'),
  remarkText: z.string().min(10, 'Remark must be at least 10 characters.').max(500, 'Remark cannot exceed 500 characters.'),
  sentiment: z.enum(['good', 'bad', 'neutral'], { required_error: 'Please select the remark sentiment.'}),
});

type RemarkFormValues = z.infer<typeof remarkSchema>;

export function GiveStudentRemarkForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingRemarkCheck, setIsLoadingRemarkCheck] = useState(false);
  const [studentsList, setStudentsList] = useState<Pick<Student, 'id' | 'name' | 'class' | 'section'>[]>([]);
  const [selectedStudentData, setSelectedStudentData] = useState<Student | null>(null);
  const [remarkAlreadySubmittedThisMonth, setRemarkAlreadySubmittedThisMonth] = useState(false);

  const { toast } = useToast();
  // In a real app, teacher's name would come from auth context
  const currentTeacherName = "Priya Sharma (Demo Teacher)"; 

  const form = useForm<RemarkFormValues>({
    resolver: zodResolver(remarkSchema),
    defaultValues: {
      studentId: '',
      teacherSubject: undefined,
      remarkText: '',
      sentiment: 'neutral',
    },
  });

  const watchedStudentId = form.watch('studentId');
  const watchedSubject = form.watch('teacherSubject');

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const q = query(collection(firestore, STUDENTS_COLLECTION), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const fetchedStudents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          class: doc.data().class,
          section: doc.data().section,
        } as Pick<Student, 'id' | 'name' | 'class' | 'section'>));
        setStudentsList(fetchedStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({ title: "Error", description: "Could not load students list.", variant: "destructive" });
      }
      setIsLoadingStudents(false);
    };
    fetchStudents();
  }, [toast]);

  useEffect(() => {
    const checkExistingRemark = async () => {
      if (!watchedStudentId || !watchedSubject) {
        setRemarkAlreadySubmittedThisMonth(false);
        setSelectedStudentData(null);
        return;
      }

      setIsLoadingRemarkCheck(true);
      setRemarkAlreadySubmittedThisMonth(false); // Reset

      try {
        const studentDocRef = doc(firestore, STUDENTS_COLLECTION, watchedStudentId);
        const studentDocSnap = await getDoc(studentDocRef);

        if (studentDocSnap.exists()) {
          const studentData = { id: studentDocSnap.id, ...studentDocSnap.data() } as Student;
          setSelectedStudentData(studentData);

          const existingRemarks = studentData.remarks || [];
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();

          const hasRemark = existingRemarks.some(remark => {
            const remarkDate = new Date(remark.date);
            return remark.teacherSubject === watchedSubject &&
                   remark.teacherName === currentTeacherName && // Assuming teacher name is a reliable identifier
                   remarkDate.getMonth() === currentMonth &&
                   remarkDate.getFullYear() === currentYear;
          });
          setRemarkAlreadySubmittedThisMonth(hasRemark);
        } else {
          setSelectedStudentData(null);
          toast({ title: "Error", description: "Selected student not found.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error checking existing remark:", error);
        toast({ title: "Error", description: "Could not verify existing remarks.", variant: "destructive" });
        setSelectedStudentData(null);
      }
      setIsLoadingRemarkCheck(false);
    };

    checkExistingRemark();
  }, [watchedStudentId, watchedSubject, currentTeacherName, toast]);


  async function onSubmit(values: RemarkFormValues) {
    if (remarkAlreadySubmittedThisMonth) {
      toast({
        title: "Submission Blocked",
        description: `A remark for ${values.teacherSubject} for this student has already been submitted this month.`,
        variant: "destructive",
      });
      return;
    }
    if (!selectedStudentData) {
      toast({ title: "Error", description: "Student data not loaded. Cannot submit remark.", variant: "destructive"});
      return;
    }

    setIsSubmitting(true);
    
    const newRemark: StudentRemark = {
      id: `remark_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // More unique ID
      teacherName: currentTeacherName,
      teacherSubject: values.teacherSubject,
      remark: values.remarkText,
      date: new Date().toISOString().split('T')[0], // Current date YYYY-MM-DD
      sentiment: values.sentiment,
    };

    try {
      const studentDocRef = doc(firestore, STUDENTS_COLLECTION, selectedStudentData.id);
      await updateDoc(studentDocRef, {
        remarks: arrayUnion(newRemark)
      });
      
      toast({
        title: 'Remark Submitted Successfully!',
        description: `Your ${values.sentiment} remark for ${selectedStudentData.name} regarding ${values.teacherSubject} has been saved.`,
      });
      form.reset({studentId: '', teacherSubject: undefined, remarkText: '', sentiment: 'neutral'});
      setSelectedStudentData(null); // Reset selected student data
      setRemarkAlreadySubmittedThisMonth(false); // Reset check
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

  const isFormDisabled = isSubmitting || isLoadingRemarkCheck || remarkAlreadySubmittedThisMonth;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg border-primary/20">
      <CardHeader className="bg-primary/5 rounded-t-lg">
        <CardTitle className="text-2xl font-headline text-primary flex items-center">
          <MessageSquarePlus className="mr-3 h-7 w-7" /> Provide Student Remark
        </CardTitle>
        <CardDescription>Select a student, subject, sentiment, and write your feedback. Remarks are limited to one per subject, per student, per month by the same teacher.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoadingStudents ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading student list...</p>
          </div>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Student</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedStudentData(null); // Reset when student changes
                      setRemarkAlreadySubmittedThisMonth(false);
                    }} 
                    defaultValue={field.value}
                    disabled={studentsList.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={studentsList.length === 0 ? "No students available" : "Choose a student..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {studentsList.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.class} - {student.section})
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
                       setRemarkAlreadySubmittedThisMonth(false); // Reset on subject change
                    }} 
                    defaultValue={field.value as string}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background"><SelectValue placeholder="Select subject" /></SelectTrigger>
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
            <Button type="submit" disabled={isFormDisabled || studentsList.length === 0} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting || isLoadingRemarkCheck ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Submitting...' : isLoadingRemarkCheck ? 'Checking...' : 'Submit Remark'}
            </Button>
            {studentsList.length === 0 && !isLoadingStudents && (
                 <p className="text-sm text-destructive text-center">No students found. Cannot submit remarks.</p>
            )}
          </form>
        </Form>
        )}
      </CardContent>
    </Card>
  );
}
    