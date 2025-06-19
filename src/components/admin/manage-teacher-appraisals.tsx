
'use client';

import { useState, useEffect } from 'react';
import type { TeacherAppraisalRequest, Teacher } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, Loader2, TrendingUp, MessageSquare, CalendarDays, UserCheck, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { getTeacherDocPath } from '@/lib/firestore-paths';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const APPRAISAL_REQUESTS_COLLECTION = 'teacher_appraisal_requests';

export function ManageTeacherAppraisals() {
  const [requests, setRequests] = useState<TeacherAppraisalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<TeacherAppraisalRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newSalary, setNewSalary] = useState<number | string>('');
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const requestsCollectionRef = collection(firestore, APPRAISAL_REQUESTS_COLLECTION);
    const q = query(requestsCollectionRef, orderBy("requestDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherAppraisalRequest));
      setRequests(fetchedRequests);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching appraisal requests:", error);
      toast({ title: "Error", description: "Could not load appraisal requests.", variant: "destructive" });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleProcessRequest = async (request: TeacherAppraisalRequest, newStatus: "Approved" | "Rejected") => {
    setSelectedRequest(request); // For dialog
    setIsProcessing(true);

    if (newStatus === "Approved" && (typeof newSalary !== 'number' || newSalary <= 0)) {
        toast({ title: "Invalid Salary", description: "Please enter a valid new salary amount for approval.", variant: "destructive" });
        setIsProcessing(false);
        return;
    }

    try {
      const requestDocRef = doc(firestore, APPRAISAL_REQUESTS_COLLECTION, request.id);
      await updateDoc(requestDocRef, {
        status: newStatus,
        adminNotes: adminNotes || "Processed by Admin.",
        processedDate: new Date().toISOString(),
      });

      // Update teacher's profile
      const teacherDocRef = doc(firestore, getTeacherDocPath(request.teacherId));
      const updateData: Partial<Teacher> = {
        currentAppraisalStatus: newStatus === "Approved" ? "Appraised" : newStatus,
        lastAppraisalDate: new Date().toISOString().split('T')[0],
        lastAppraisalDetails: `${newStatus} by Admin. Notes: ${adminNotes || 'N/A'}`
      };
      
      // If approved and new salary is provided, update salary (this is a simplified update)
      // A more robust system would update the latest salary record or create a new one.
      if (newStatus === "Approved" && typeof newSalary === 'number' && newSalary > 0) {
         updateData.lastAppraisalDetails += ` New salary (illustrative): ${newSalary}.`;
         // Here you would typically fetch the teacher's salaryHistory, add/update a record,
         // and then save it back. For this example, we'll just update the details string.
         // Example: update teacher's current salary field if it exists, or add to salary history
         // For now, this is a conceptual update as full salary management is complex.
      }

      await updateDoc(teacherDocRef, updateData);

      toast({ title: `Request ${newStatus}`, description: `Appraisal request for ${request.teacherName} has been ${newStatus.toLowerCase()}.` });
      setSelectedRequest(null);
      setAdminNotes('');
      setNewSalary('');
    } catch (error) {
      console.error("Error processing appraisal request:", error);
      toast({ title: "Processing Failed", description: "Could not process the request.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading appraisal requests...</span></div>;
  }

  return (
    <Card className="w-full shadow-lg rounded-lg border-primary/10">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-7 w-7 text-primary" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">Manage Teacher Appraisals</CardTitle>
            <CardDescription>Review and process salary appraisal requests submitted by coordinators.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400"/>
            No pending or processed appraisal requests found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="font-medium">{req.teacherName}</div>
                    <div className="text-xs text-muted-foreground">ID: {req.teacherId.substring(0,10)}...</div>
                  </TableCell>
                  <TableCell>
                    <div>{req.coordinatorName}</div>
                    <div className="text-xs text-muted-foreground">Coord. ID: {req.requestedByCoordinatorId.substring(0,10)}...</div>
                  </TableCell>
                  <TableCell>{new Date(req.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      req.status === "Pending Admin Review" ? "secondary" :
                      req.status === "Approved" ? "default" : "destructive"
                    }>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm"><Eye className="mr-1 h-3.5 w-3.5"/> View Details</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Appraisal Request Details</DialogTitle>
                          <DialogDescription>For: <strong>{req.teacherName}</strong></DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-2 text-sm">
                          <p><strong>Requested by:</strong> {req.coordinatorName}</p>
                          <p><strong>Date:</strong> {new Date(req.requestDate).toLocaleString()}</p>
                          <p><strong>Status:</strong> {req.status}</p>
                          <div><strong>Justification:</strong> <p className="text-muted-foreground bg-muted/50 p-2 rounded-md whitespace-pre-wrap">{req.justification}</p></div>
                          {req.adminNotes && <div><strong>Admin Notes:</strong> <p className="text-muted-foreground bg-muted/50 p-2 rounded-md whitespace-pre-wrap">{req.adminNotes}</p></div>}
                          {req.processedDate && <p><strong>Processed:</strong> {new Date(req.processedDate).toLocaleString()}</p>}
                        </div>
                        {req.status === "Pending Admin Review" && (
                            <>
                            <div className="space-y-1 mt-2">
                                <label htmlFor="adminNotes" className="text-sm font-medium">Admin Notes (Optional)</label>
                                <Textarea id="adminNotes" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Notes for approval/rejection..." />
                            </div>
                             <div className="space-y-1 mt-2">
                                <label htmlFor="newSalary" className="text-sm font-medium">New Salary (If Approving, Optional)</label>
                                <Input id="newSalary" type="number" value={newSalary} onChange={(e) => setNewSalary(e.target.value ? parseFloat(e.target.value) : '')} placeholder="Enter new salary amount" />
                            </div>
                            <DialogFooter className="mt-4">
                                <Button variant="destructive" onClick={() => handleProcessRequest(req, "Rejected")} disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <XCircle className="mr-1 h-4 w-4"/>} Reject
                                </Button>
                                <Button onClick={() => handleProcessRequest(req, "Approved")} disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="mr-1 h-4 w-4"/>} Approve
                                </Button>
                            </DialogFooter>
                            </>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
