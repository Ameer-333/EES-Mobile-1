
'use client';

import type { Teacher, TeacherSalaryRecord } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Search, DollarSign, Save, Loader2 } from 'lucide-react';
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
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, QuerySnapshot, DocumentData, arrayUnion } from 'firebase/firestore';

const TEACHERS_COLLECTION = 'teachers';

const salaryRecordSchema = z.object({
  monthYear: z.string().min(1, "Month/Year is required (e.g., July 2024)"),
  amountIssued: z.coerce.number().min(0, "Amount issued must be positive."),
  amountDeducted: z.coerce.number().min(0, "Amount deducted must be positive.").optional().default(0),
  daysAbsent: z.coerce.number().min(0, "Days absent must be non-negative.").max(31),
  reasonForAbsence: z.string().optional(),
});
type SalaryRecordFormValues = z.infer<typeof salaryRecordSchema>;

export function TeacherPayrollManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [isSubmittingSalary, setIsSubmittingSalary] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const teachersCollectionRef = collection(firestore, TEACHERS_COLLECTION);
    
    const unsubscribe = onSnapshot(teachersCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const fetchedTeachers = snapshot.docs.map(docSnapshot => ({ // Renamed doc to docSnapshot
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Teacher));
      setTeachers(fetchedTeachers);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching teachers from Firestore:", error);
      toast({
        title: "Error Loading Teachers",
        description: "Could not fetch teacher data from Firestore.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

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
    // Try to find existing salary for this month for this teacher to prefill, or use defaults
    const existingSalaryForMonth = teacher.salaryHistory?.find(s => s.monthYear === currentMonthYear);

    form.reset({
        monthYear: currentMonthYear,
        amountIssued: existingSalaryForMonth?.amountIssued || teacher.salaryHistory?.[0]?.amountIssued || 50000,
        amountDeducted: existingSalaryForMonth?.amountDeducted || 0,
        daysAbsent: existingSalaryForMonth?.daysAbsent !== undefined ? existingSalaryForMonth.daysAbsent : (teacher.daysAbsentThisMonth || 0),
        reasonForAbsence: existingSalaryForMonth?.reasonForAbsence || ''
    });
    setIsSalaryDialogOpen(true);
  };

  const handleSaveSalaryRecord = async (values: SalaryRecordFormValues) => {
    if (!selectedTeacher) return;
    setIsSubmittingSalary(true);

    try {
        const teacherDocRef = doc(firestore, TEACHERS_COLLECTION, selectedTeacher.id);
        const newRecord: TeacherSalaryRecord = {
            id: `sal_${selectedTeacher.id}_${values.monthYear.replace(/\s+/g, '_')}_${Date.now()}`, // More unique ID
            dateIssued: new Date().toISOString().split('T')[0], // Today's date
            ...values,
            amountDeducted: values.amountDeducted || 0, // Ensure default if not provided
        };

        // Update the salary history: remove old record for the same monthYear if exists, then add new one.
        const updatedSalaryHistory = (selectedTeacher.salaryHistory || []).filter(
            (record) => record.monthYear !== values.monthYear
        );
        updatedSalaryHistory.unshift(newRecord); // Add new record to the beginning

        await updateDoc(teacherDocRef, {
            salaryHistory: updatedSalaryHistory,
            daysAbsentThisMonth: values.daysAbsent, // Update current month's absence count
        });
        
        // onSnapshot will update the local state of `teachers`
        toast({ title: "Salary Record Updated", description: `Salary for ${values.monthYear} for ${selectedTeacher.name} updated in Firestore.` });
        setIsSalaryDialogOpen(false);
    } catch (error) {
        console.error("Error updating salary record in Firestore:", error);
        toast({
            title: "Update Failed",
            description: "Could not update salary record in Firestore.",
            variant: "destructive",
        });
    } finally {
        setIsSubmittingSalary(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full shadow-xl rounded-lg border-primary/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <Skeleton className="h-8 w-1/2 mb-1" />
                <Skeleton className="h-4 w-3/4" />
            </div>
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
                  <TableRow key={`skel-payroll-row-${i}`}>
                     <TableCell colSpan={6} className="p-4">
                        <div className="flex items-center justify-center">
                           <Loader2 className="h-6 w-6 animate-spin text-primary" />
                           <span className="ml-2">Loading payroll data...</span>
                        </div>
                     </TableCell>
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
              <CardDescription>Manage teacher salary details and monthly attendance from Firestore.</CardDescription>
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
                    <TableCell className="font-medium truncate max-w-[100px]">{teacher.id}</TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell className="text-muted-foreground">{teacher.email}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={ (teacher.daysAbsentThisMonth || 0) > 0 ? "destructive" : "secondary"}>
                            {teacher.daysAbsentThisMonth || 0} days
                        </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        {lastSalary ? `₹${(lastSalary.amountIssued - (lastSalary.amountDeducted || 0)).toLocaleString()}` : 'N/A'}
                        {lastSalary && <div className="text-xs text-muted-foreground">({lastSalary.monthYear})</div>}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenSalaryDialog(teacher)}>
                        <DollarSign className="h-3.5 w-3.5 mr-1" /> Process/Update Salary
                      </Button>
                    </TableCell>
                  </TableRow>
                )}) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      {isLoading ? 'Loading...' : 'No teachers found matching your criteria or no teachers in Firestore.'}
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
              <DialogDescription>Enter or update salary and attendance details for the selected month.</DialogDescription>
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
                    <FormItem><FormLabel>Amount Deducted (₹) (Optional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="reasonForAbsence" render={({ field }) => (
                    <FormItem><FormLabel>Reason for Absence/Deduction (Optional)</FormLabel><FormControl><Input placeholder="e.g., Sick leave" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <DialogFooter className="pt-3">
                  <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmittingSalary}>Cancel</Button></DialogClose>
                  <Button type="submit" disabled={isSubmittingSalary}>
                    {isSubmittingSalary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
                     Save Record
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

    