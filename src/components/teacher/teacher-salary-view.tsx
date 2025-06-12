
'use client';

import type { TeacherSalaryRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, FileText, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

// Mock data for demonstration
const mockSalaryHistory: TeacherSalaryRecord[] = [
  { id: 'sal1', monthYear: 'June 2024', dateIssued: '2024-07-01', amountIssued: 50000, amountDeducted: 1000, daysAbsent: 1, reasonForAbsence: 'Sick leave' },
  { id: 'sal2', monthYear: 'May 2024', dateIssued: '2024-06-01', amountIssued: 50000, amountDeducted: 0, daysAbsent: 0 },
  { id: 'sal3', monthYear: 'April 2024', dateIssued: '2024-05-01', amountIssued: 48000, amountDeducted: 2000, daysAbsent: 2, reasonForAbsence: 'Personal emergency, pre-approved.' },
];

interface TeacherSalaryViewProps {
  salaryHistory?: TeacherSalaryRecord[];
  onUpdateReason?: (recordId: string, reason: string) => Promise<void>; // Simulate update
}

export function TeacherSalaryView({ salaryHistory = mockSalaryHistory, onUpdateReason }: TeacherSalaryViewProps) {
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState('');
  const { toast } = useToast();

  const handleEditReason = (record: TeacherSalaryRecord) => {
    setEditingRecordId(record.id);
    setReasonText(record.reasonForAbsence || '');
  };

  const handleSaveReason = async () => {
    if (!editingRecordId) return;
    // In a real app, call onUpdateReason here
    console.log(`Saving reason for ${editingRecordId}: ${reasonText}`);
    // Simulate API call & update mock data locally
    const recordIndex = salaryHistory.findIndex(r => r.id === editingRecordId); // Use salaryHistory prop
    if (recordIndex !== -1) {
      salaryHistory[recordIndex].reasonForAbsence = reasonText;
    }
    
    toast({ title: 'Reason Updated', description: 'Your reason for absence has been submitted.' });
    setEditingRecordId(null);
  };

  if (!salaryHistory || salaryHistory.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <DollarSign className="mr-2 h-6 w-6" /> Salary History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No salary records available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
          <DollarSign className="mr-2 h-6 w-6" /> Salary History
        </CardTitle>
        <CardDescription>Your past salary statements and attendance details.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month/Year</TableHead>
                <TableHead className="text-right">Issued (₹)</TableHead>
                <TableHead className="text-right">Deducted (₹)</TableHead>
                <TableHead className="text-center">Days Absent</TableHead>
                <TableHead>Reason for Absence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.monthYear}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">₹{record.amountIssued.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-red-600">₹{record.amountDeducted.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{record.daysAbsent}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {record.reasonForAbsence || (record.daysAbsent > 0 ? <span className="text-muted-foreground italic">Not specified</span> : 'N/A')}
                  </TableCell>
                  <TableCell className="text-right">
                    {record.daysAbsent > 0 && (
                       <Dialog open={editingRecordId === record.id} onOpenChange={(isOpen) => !isOpen && setEditingRecordId(null) }>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEditReason(record)}>
                            <Edit className="mr-1 h-3 w-3" /> {record.reasonForAbsence ? 'Edit Reason' : 'Add Reason'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reason for Absence ({record.monthYear})</DialogTitle>
                            <DialogDescription>
                              Please provide or update the reason for your absence of {record.daysAbsent} day(s).
                            </DialogDescription>
                          </DialogHeader>
                          <Textarea
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                            placeholder="Enter reason..."
                            rows={3}
                          />
                          <DialogFooter>
                            <DialogClose asChild><Button variant="outline" onClick={() => setEditingRecordId(null)}>Cancel</Button></DialogClose>
                            <Button onClick={handleSaveReason}>Save Reason</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
