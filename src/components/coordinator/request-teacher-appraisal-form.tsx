
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Teacher, TeacherAppraisalRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Loader2, Send, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getTeachersCollectionPath } from '@/lib/firestore-paths'; // Assuming appraisal requests are stored in a new collection
import { useAppContext } from '@/app/(protected)/layout';

const APPRAISAL_REQUESTS_COLLECTION = 'teacher_appraisal_requests';

const appraisalRequestSchema = z.object({
  teacherId: z.string().min(1, 'Teacher selection is required.'),
  justification: z.string().min(20, 'Justification must be at least 20 characters.').max(1000, 'Justification cannot exceed 1000 characters.'),
});

type AppraisalRequestFormValues = z.infer<typeof appraisalRequestSchema>;

export function RequestTeacherAppraisalForm() {
  const { userProfile: coordinatorProfile } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const { toast } = useToast();

  const form = useForm<AppraisalRequestFormValues>({
    resolver: zodResolver(appraisalRequestSchema),
    defaultValues: { teacherId: '', justification: '' },
  });

  useEffect(() => {
    setIsLoadingTeachers(true);
    const teachersCollectionRef = collection(firestore, getTeachersCollectionPath());
    const unsubscribe = onSnapshot(teachersCollectionRef, (snapshot) => {
      const fetchedTeachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
      setTeachers(fetchedTeachers);
      setIsLoadingTeachers(false);
    }, (error) => {
      console.error("Error fetching teachers:", error);
      toast({ title: "Error", description: "Could not load teachers list.", variant: "destructive" });
      setIsLoadingTeachers(false);
    });
    return () => unsubscribe();
  }, [toast]);

  async function onSubmit(values: AppraisalRequestFormValues) {
    if (!coordinatorProfile || coordinatorProfile.role !== 'Coordinator') {
        toast({ title: "Error", description: "Invalid user profile for this action.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    const selectedTeacher = teachers.find(t => t.id === values.teacherId);
    if (!selectedTeacher) {
        toast({ title: "Error", description: "Selected teacher not found.", variant: "destructive"});
        setIsSubmitting(false);
        return;
    }

    const newAppraisalRequest: Omit<TeacherAppraisalRequest, 'id'> = {
        teacherId: selectedTeacher.id, // This is the authUid stored as id in Teacher type
        teacherName: selectedTeacher.name,
        requestedByCoordinatorId: coordinatorProfile.id,
        coordinatorName: coordinatorProfile.name,
        requestDate: new Date().toISOString(),
        justification: values.justification,
        status: "Pending Admin Review",
    };

    try {
      await addDoc(collection(firestore, APPRAISAL_REQUESTS_COLLECTION), newAppraisalRequest);
      toast({
        title: 'Appraisal Request Submitted!',
        description: `Your request for ${selectedTeacher.name} has been sent to the Admin for review.`,
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting appraisal request:", error);
      toast({ title: "Submission Failed", description: "Could not submit appraisal request.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full shadow-lg rounded-lg border-primary/10">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-7 w-7 text-primary" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">Request Salary Appraisal</CardTitle>
            <CardDescription>Submit a request for a teacher's salary appraisal to the administration.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoadingTeachers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" /> Loading teachers...
          </div>
        ) : teachers.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-400"/>
                No teachers found to request appraisal for.
            </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Teacher</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a teacher..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name} ({teacher.email})
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
                name="justification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justification for Appraisal</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why this teacher deserves an appraisal (e.g., outstanding performance, new responsibilities, market adjustment)..."
                        className="min-h-[120px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting || isLoadingTeachers} className="w-full">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Appraisal Request
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
