
'use client';

import type { Teacher, TeacherSalaryRecord } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Search, UserPlus, Trash2, DollarSign, CalendarDays, Eye, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';


const mockTeachers: Teacher[] = [
  {
    id: 'T001', name: 'Priya Sharma', email: 'priya.sharma@ees.com', phoneNumber: '9876543210', address: '...', yearOfJoining: 2018, totalYearsWorked: 6, subjectsTaught: ['English'],
    daysPresentThisMonth: 20, daysAbsentThisMonth: 2,
    salaryHistory: [
        { id: 'sal1-T001', monthYear: 'June 2024', dateIssued: '2024-07-01', amountIssued: 50000, amountDeducted: 2500, daysAbsent: 2, reasonForAbsence: 'Sick leave (approved)' },
    ]
  },
  {
    id: 'T002', name: 'Anand Singh', email: 'anand.singh@ees.com', phoneNumber: '9876543211', address: '...', yearOfJoining: 2020, totalYearsWorked: 4, subjectsTaught: ['Maths'],
    daysPresentThisMonth: 22, daysAbsentThisMonth: 0,
    salaryHistory: [
        { id: 'sal1-T002', monthYear: 'June 2024', dateIssued: '2024-07-01', amountIssued: 45000, amountDeducted: 0, daysAbsent: 0 },
    ]
  },
];

const salaryRecordSchema = z.object({
  monthYear: z.string().min(1, "Month/Year is required (e.g., July 2024)"),
  amountIssued: z.coerce.number().min(0, "Amount issued must be positive."),
  amountDeducted: z.coerce.number().min(0, "Amount deducted must be positive."),
  daysAbsent: z.coerce.number().min(0, "Days absent must be non-negative.").max(31),
  reasonForAbsence: z.string().optional(),
});
type SalaryRecordFormValues = z.infer<typeof salaryRecordSchema>;

export function TeacherPayrollManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);


  const form = useForm<SalaryRecordFormValues>({
    resolver: zodResolver(salaryRecordSchema),
    defaultValues: { monthYear: '', amountIssued: 0, amountDeducted: 0, daysAbsent: 0, reasonForAbsence: '' },
  });

  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  const handleOpenSalaryDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    form.reset({
        monthYear: currentMonthYear,
        amountIssued: teacher.salaryHistory?.[0]?.amountIssued || 50000, // Default to last or a common value
        amountDeducted: 0,
        daysAbsent: teacher.daysAbsentThisMonth || 0,
        reasonForAbsence: ''
    });
    setIsSalaryDialogOpen(true);
  };

  const handleSaveSalaryRecord = (values: SalaryRecordFormValues) => {
    if (!selectedTeacher) return;

    const newRecord: TeacherSalaryRecord = {
      id: `sal${Date.now()}-${selectedTeacher.id}`,
      dateIssued: new Date().toISOString().split('T')[0], // Today's date
      ...values,
    };

    setTeachers(prevTeachers =>
      prevTeachers.map(t =>
        t.id === selectedTeacher.id
        ? { ...t, salaryHistory: [newRecord, ...(t.salaryHistory || [])], daysAbsentThisMonth: values.daysAbsent }
        : t
      )
    );
    toast({ title: "Salary Record Added", description: `Salary for ${values.monthYear} for ${selectedTeacher.name} updated.` });
    setIsSalaryDialogOpen(false);
  };

  if (!hasMounted) {
    return (
      <Card className="w-full shadow-xl rounded-lg border-primary/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Skeleton className="h-8 w-1/2" />
          </div>
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-grow" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
             <Table>
              <TableHeader>
                <TableRow>
                  {Array(6).fill(0).map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full"/></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(6).fill(0).map((_,j) => <TableCell key={j}><Skeleton className="h-5 w-full"/></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <>
      <Card className="w-full shadow-xl rounded-lg border-primary/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-headline text-primary">Teacher Payroll & Attendance</CardTitle>
              <CardDescription>Manage teacher salary details and monthly attendance.</CardDescription>
            </div>
          </div>
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by Teacher ID, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Days Absent (Current Month)</TableHead>
                  <TableHead className="text-center">Last Processed Salary (₹)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => {
                  const lastSalary = teacher.salaryHistory && teacher.salaryHistory.length > 0 ? teacher.salaryHistory[0] : null;
                  return (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.id}</TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell className="text-muted-foreground">{teacher.email}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={ (teacher.daysAbsentThisMonth || 0) > 0 ? "destructive" : "secondary"}>
                            {teacher.daysAbsentThisMonth || 0} days
                        </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        {lastSalary ? `₹${(lastSalary.amountIssued - lastSalary.amountDeducted).toLocaleString()}` : 'N/A'}
                        {lastSalary && <div className="text-xs text-muted-foreground">({lastSalary.monthYear})</div>}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenSalaryDialog(teacher)}>
                        <DollarSign className="h-3.5 w-3.5 mr-1" /> Process/Update Salary
                      </Button>
                      {/* <Button variant="ghost" size="sm" onClick={() => { setSelectedTeacher(teacher); }}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View Full History
                      </Button> */}
                    </TableCell>
                  </TableRow>
                )}) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No teachers found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedTeacher && (
        <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Process Salary for {selectedTeacher.name}</DialogTitle>
              <DialogDescription>Enter salary and attendance details for the selected month.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveSalaryRecord)} className="space-y-4 py-2">
                <FormField control={form.control} name="monthYear" render={({ field }) => (
                    <FormItem><FormLabel>Month / Year</FormLabel><FormControl><Input placeholder="e.g., July 2024" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="amountIssued" render={({ field }) => (
                    <FormItem><FormLabel>Gross Amount Issued (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="daysAbsent" render={({ field }) => (
                    <FormItem><FormLabel>Days Absent this month</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="amountDeducted" render={({ field }) => (
                    <FormItem><FormLabel>Amount Deducted (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="reasonForAbsence" render={({ field }) => (
                    <FormItem><FormLabel>Reason for Absence/Deduction (Optional)</FormLabel><FormControl><Input placeholder="e.g., Sick leave" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <DialogFooter className="pt-3">
                  <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                  <Button type="submit"><Save className="mr-2 h-4 w-4"/> Save Record</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
