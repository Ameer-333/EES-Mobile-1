
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, SubjectName } from '@/types';
import { subjectNamesArray } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquarePlus, Loader2, Send, BookOpen, Smile, Frown, Meh } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration - in a real app, students would be fetched
const mockStudents: Pick<Student, 'id' | 'name' | 'class' | 'section'>[] = [
  { id: 'S12345', name: 'Ravi Kumar', class: '10th Grade', section: 'A' },
  { id: 'S67890', name: 'Sunita Reddy', class: '9th Grade', section: 'B' },
  { id: 'S11223', name: 'Amit Patel', class: '10th Grade', section: 'A' },
];

const remarkSchema = z.object({
  studentId: z.string().min(1, 'Student selection is required.'),
  teacherSubject: z.custom<SubjectName>(val => subjectNamesArray.includes(val as SubjectName), 'Subject is required.'),
  remarkText: z.string().min(10, 'Remark must be at least 10 characters.').max(500, 'Remark cannot exceed 500 characters.'),
  sentiment: z.enum(['good', 'bad', 'neutral'], { required_error: 'Please select the remark sentiment.'}),
});

type RemarkFormValues = z.infer<typeof remarkSchema>;

export function GiveStudentRemarkForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  // In a real app, teacher's name would come from auth context
  const teacherName = "Priya Sharma (Demo Teacher)"; 

  const form = useForm<RemarkFormValues>({
    resolver: zodResolver(remarkSchema),
    defaultValues: {
      studentId: '',
      teacherSubject: undefined,
      remarkText: '',
      sentiment: 'neutral',
    },
  });

  async function onSubmit(values: RemarkFormValues) {
    setIsSubmitting(true);
    // Simulate API call to save the remark
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const remarkToSave = {
      ...values,
      teacherName: teacherName,
      date: new Date().toISOString().split('T')[0], // Current date
      id: `remark_${Date.now()}` // Mock ID
    };
    console.log('Submitting remark:', remarkToSave);
    
    const student = mockStudents.find(s => s.id === values.studentId);
    toast({
      title: 'Remark Submitted',
      description: `Your ${values.sentiment} remark for ${student?.name || 'the student'} regarding ${values.teacherSubject} has been recorded.`,
    });
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg border-primary/20">
      <CardHeader className="bg-primary/5 rounded-t-lg">
        <CardTitle className="text-2xl font-headline text-primary flex items-center">
          <MessageSquarePlus className="mr-3 h-7 w-7" /> Provide Student Remark
        </CardTitle>
        <CardDescription>Select a student, subject, sentiment, and write your feedback or observations.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Student</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Choose a student..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockStudents.map(student => (
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
                  <FormLabel className="flex items-center"><BookOpen className="mr-2 h-4 w-4 text-muted-foreground"/>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                    <FormControl>
                      <SelectTrigger className="bg-background"><SelectValue placeholder="Select subject of remark" /></SelectTrigger>
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Remark
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
