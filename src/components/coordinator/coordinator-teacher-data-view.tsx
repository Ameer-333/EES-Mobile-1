
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Teacher, TeacherSalaryRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Loader2, UserCircle, TrendingUp, CalendarX2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getTeachersCollectionPath } from '@/lib/firestore-paths';
import { Skeleton } from '@/components/ui/skeleton';

export function CoordinatorTeacherDataView() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const teachersCollectionPath = getTeachersCollectionPath();
    const q = query(collection(firestore, teachersCollectionPath), orderBy("name"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTeachers = snapshot.docs.map(doc => ({
        id: doc.id,
        authUid: doc.id, // Assuming teacher doc ID is authUid
        ...doc.data(),
      } as Teacher));
      setTeachers(fetchedTeachers);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching teachers for coordinator view:", error);
      toast({
        title: "Error Loading Teachers",
        description: "Could not fetch teacher data from Firestore.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher =>
      (teacher.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (teacher.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (teacher.authUid?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (teacher.subjectsTaught?.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [teachers, searchTerm]);

  const getAttendanceSummary = (salaryHistory?: TeacherSalaryRecord[]): string => {
    if (!salaryHistory || salaryHistory.length === 0) return "N/A";
    // Assuming salaryHistory is sorted with the latest first, or find the latest one.
    const latestRecord = salaryHistory.sort((a,b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime())[0];
    if (!latestRecord) return "N/A";
    return `${latestRecord.daysAbsent} days absent (${latestRecord.monthYear})`;
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg rounded-lg border-primary/10">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileText className="h-7 w-7 text-primary" />
            <div>
                <Skeleton className="h-7 w-72 mb-1.5" />
                <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-10 w-1/2" />
          </div>
        </CardHeader>
        <CardContent className="min-h-[300px]">
             <div className="rounded-md border">
                 <Table>
                    <TableHeader><TableRow>{Array(5).fill(0).map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full"/></TableHead>)}</TableRow></TableHeader>
                    <TableBody>{Array(3).fill(0).map((_, i) => (
                        <TableRow key={`skel-coord-teacher-${i}`}><TableCell colSpan={5} className="p-4">
                            <div className="flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2">Loading teacher data...</span></div>
                        </TableCell></TableRow>))}</TableBody>
                 </Table>
             </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg rounded-lg border-primary/10">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <FileText className="h-7 w-7 text-primary" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">
              Teacher Data & Progress Overview
            </CardTitle>
            <CardDescription>
              View teacher qualifications, recent attendance summaries, and appraisal statuses.
            </CardDescription>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, Auth ID, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-2/3 lg:w-1/2"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <UserCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            No teachers found matching your criteria or no teachers in the system.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Qualified Subjects</TableHead>
                  <TableHead className="text-center">Recent Attendance</TableHead>
                  <TableHead className="text-center">Appraisal Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.authUid}>
                    <TableCell>
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {teacher.authUid ? teacher.authUid.substring(0, 10) + '...' : 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div>{teacher.email}</div>
                      <div className="text-xs text-muted-foreground">{teacher.phoneNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {teacher.subjectsTaught?.slice(0, 3).map(sub => <Badge key={sub} variant="secondary" className="text-xs">{sub}</Badge>)}
                        {teacher.subjectsTaught && teacher.subjectsTaught.length > 3 && <Badge variant="outline" className="text-xs">+{teacher.subjectsTaught.length - 3} more</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getAttendanceSummary(teacher.salaryHistory).startsWith("0 days") ? "secondary" : "outline"} className="text-xs whitespace-nowrap">
                        <CalendarX2 className="h-3 w-3 mr-1 opacity-70"/>
                        {getAttendanceSummary(teacher.salaryHistory)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          teacher.currentAppraisalStatus === "Appraised" ? "default" :
                          teacher.currentAppraisalStatus === "Pending Review" ? "secondary" :
                          teacher.currentAppraisalStatus === "Rejected" ? "destructive" : "outline"
                        }
                        className="text-xs"
                      >
                        <TrendingUp className="h-3 w-3 mr-1 opacity-70"/>
                        {teacher.currentAppraisalStatus || "No Active Appraisal"}
                      </Badge>
                       {teacher.lastAppraisalDate && <div className="text-xs text-muted-foreground mt-0.5">({new Date(teacher.lastAppraisalDate).toLocaleDateString()})</div>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
         {filteredTeachers.length > 0 && (
            <div className="mt-4 text-right text-sm text-muted-foreground">
                Showing {filteredTeachers.length} of {teachers.length} total teachers.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
