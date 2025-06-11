'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, SubjectName } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, CheckSquare, Edit3, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const mockStudents: Pick<Student, 'id' | 'name'>[] = [
  { id: 'S001', name: 'Aarav Sharma' },
  { id: 'S002', name: 'Bhavna Singh' },
  { id: 'S003', name: 'Chetan Reddy' },
];

const subjectNames: SubjectName[] = ['English', 'Kannada', 'Hindi', 'Science', 'Maths', 'Social Science'];

const marksSchema = z.object({
  studentId: z.string().min(1, 'Student is required.'),
  subjectName: z.custom<SubjectName>(val => subjectNames.includes(val as SubjectName), 'Subject is required.'),
  marks: z.coerce.number().min(0, 'Marks cannot be negative.').max(100, 'Marks cannot exceed 100.'),
});

const attendanceSchema = z.object({
  studentId: z.string().min(1, 'Student is required.'),
  subjectName: z.custom<SubjectName>(val => subjectNames.includes(val as SubjectName), 'Subject is required.'),
  date: z.date({ required_error: "Date is required."}),
  status: z.enum(['Present', 'Absent'], { required_error: "Status is required."}),
});

export function TeacherDataEntry() {
  const { toast } = useToast();

  const marksForm = useForm<z.infer<typeof marksSchema>>({
    resolver: zodResolver(marksSchema),
    defaultValues: { studentId: '', marks: 0 },
  });

  const attendanceForm = useForm<z.infer<typeof attendanceSchema>>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: { studentId: '', status: 'Present' },
  });

  function onMarksSubmit(values: z.infer<typeof marksSchema>) {
    console.log('Marks submitted:', values);
    toast({ title: 'Marks Submitted', description: `Marks for ${values.subjectName} recorded for student ID ${values.studentId}.` });
    marksForm.reset();
  }

  function onAttendanceSubmit(values: z.infer<typeof attendanceSchema>) {
    console.log('Attendance submitted:', values);
    toast({ title: 'Attendance Submitted', description: `Attendance for ${values.subjectName} on ${format(values.date, "PPP")} recorded for student ID ${values.studentId}.` });
    attendanceForm.reset();
  }

  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Data Entry</CardTitle>
        <CardDescription>Upload student marks and attendance records.</CardDescription>
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
                  control={marksForm.control}
                  name="subjectName"
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
                  control={marksForm.control}
                  name="marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marks Obtained</FormLabel>
                      <FormControl><Input type="number" placeholder="Enter marks" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full md:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" /> Submit Marks
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
                  control={attendanceForm.control}
                  name="subjectName"
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
                              date > new Date() || date < new Date("1900-01-01")
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Button type="submit" className="w-full md:w-auto">
                   <UploadCloud className="mr-2 h-4 w-4" /> Submit Attendance
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
