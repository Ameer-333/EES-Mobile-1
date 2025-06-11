
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student } from '@/types'; // Assuming you have a basic Student type
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquarePlus, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockStudents: Pick<Student, 'id' | 'name' | 'class' | 'section'>[] = [
  { id: 'S12345', name: 'Ravi Kumar', class: '10th Grade', section: 'A' },
  { id: 'S67890', name: 'Sunita Reddy', class: '9th Grade', section: 'B' },
  { id: 'S11223', name: 'Amit Patel', class: '10th Grade', section: 'A' },
];

const remarkSchema = z.object({
  studentId: z.string().min(1, 'Student selection is required.'),
  remarkText: z.string().min(10, 'Remark must be at least 10 characters.').max(500, 'Remark cannot exceed 500 characters.'),
});

type RemarkFormValues = z.infer<typeof remarkSchema>;

export function GiveStudentRemarkForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<RemarkFormValues>({
    resolver: zodResolver(remarkSchema),
    defaultValues: {
      studentId: '',
      remarkText: '',
    },
  });

  async function onSubmit(values: RemarkFormValues) {
    setIsSubmitting(true);
    // Simulate API call to save the remark
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Submitting remark:', values);
    const student = mockStudents.find(s => s.id === values.studentId);
    toast({
      title: 'Remark Submitted',
      description: `Your remark for ${student?.name || 'the student'} has been recorded.`,
    });
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary flex items-center">
          <MessageSquarePlus className="mr-2 h-7 w-7" /> Provide Student Remark
        </CardTitle>
        <CardDescription>Select a student and write your feedback or observations.</CardDescription>
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
                      <SelectTrigger>
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
              name="remarkText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remark / Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your remark here (e.g., academic progress, behavior, participation)..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
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
