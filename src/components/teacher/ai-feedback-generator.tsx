'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateFeedback } from '@/ai/flows/ai-feedback-generator';
import type { GenerateFeedbackInput, GenerateFeedbackOutput } from '@/ai/flows/ai-feedback-generator';
import type { Student, SubjectName } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockStudents: Pick<Student, 'id' | 'name'>[] = [
  { id: 'S001', name: 'Aarav Sharma' },
  { id: 'S002', name: 'Bhavna Singh' },
  { id: 'S003', name: 'Chetan Reddy' },
];
const subjectNames: SubjectName[] = ['English', 'Kannada', 'Hindi', 'Science', 'Maths', 'Social Science'];

const formSchema = z.object({
  studentId: z.string().min(1, 'Student is required.'),
  subject: z.custom<SubjectName>(val => subjectNames.includes(val as SubjectName), 'Subject is required.'),
  performanceDetails: z.string().min(10, { message: 'Performance details must be at least 10 characters long.' }),
});

export function AiFeedbackGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedFeedback, setGeneratedFeedback] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      performanceDetails: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedFeedback(null);
    
    const studentName = mockStudents.find(s => s.id === values.studentId)?.name || 'The student';
    const input: GenerateFeedbackInput = { 
      studentName,
      subject: values.subject,
      performanceDetails: values.performanceDetails
    };

    try {
      const result: GenerateFeedbackOutput = await generateFeedback(input);
      setGeneratedFeedback(result.feedbackComment);
      toast({ title: "Feedback Generated", description: "AI has successfully generated feedback."});
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate AI feedback. Please try again."});
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">AI Feedback Generator</CardTitle>
            <CardDescription>Generate personalized feedback for students based on their performance.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                      <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockStudents.map(student => (
                        <SelectItem key={student.id} value={student.id}>{student.name} ({student.id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjectNames.map(subject => (
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
              name="performanceDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Performance Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter student's performance summary, achievements, areas for improvement, etc."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Feedback
            </Button>
          </form>
        </Form>

        {generatedFeedback && (
          <div className="mt-8 p-4 border rounded-md bg-accent/50">
            <h3 className="text-lg font-semibold mb-2 text-primary flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" /> Generated Feedback:
            </h3>
            <p className="text-sm whitespace-pre-wrap">{generatedFeedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
