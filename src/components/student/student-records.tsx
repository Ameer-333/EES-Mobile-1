import type { SubjectMarks, StudentSubjectAttendance, SubjectName } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { BookCheck, Percent, CalendarDays, CheckCircle, XCircle } from 'lucide-react';

// Mock data
const mockMarks: SubjectMarks[] = [
  { subjectName: 'English', marks: 85, maxMarks: 100 },
  { subjectName: 'Kannada', marks: 78, maxMarks: 100 },
  { subjectName: 'Hindi', marks: 72, maxMarks: 100 },
  { subjectName: 'Science', marks: 90, maxMarks: 100 },
  { subjectName: 'Maths', marks: 95, maxMarks: 100 },
  { subjectName: 'Social Science', marks: 80, maxMarks: 100 },
];

const mockAttendance: StudentSubjectAttendance[] = [
  { subjectName: 'English', totalClasses: 60, attendedClasses: 55, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Kannada', totalClasses: 50, attendedClasses: 48, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Hindi', totalClasses: 45, attendedClasses: 40, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Science', totalClasses: 70, attendedClasses: 68, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Maths', totalClasses: 75, attendedClasses: 75, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Social Science', totalClasses: 55, attendedClasses: 50, records: [{date: '2023-10-01', status: 'Present'}] },
];


export function StudentRecords({ marks = mockMarks, attendance = mockAttendance }: { marks?: SubjectMarks[], attendance?: StudentSubjectAttendance[] }) {
  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Academic Records</CardTitle>
        <CardDescription>View your marks and attendance details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="marks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="marks" className="gap-2"><BookCheck className="h-4 w-4" /> Marks</TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2"><CalendarDays className="h-4 w-4" /> Attendance</TabsTrigger>
          </TabsList>
          <TabsContent value="marks">
            <MarksTable marks={marks} />
          </TabsContent>
          <TabsContent value="attendance">
            <AttendanceTable attendance={attendance} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MarksTable({ marks }: { marks: SubjectMarks[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Subject</TableHead>
            <TableHead className="font-semibold text-center">Marks Obtained</TableHead>
            <TableHead className="font-semibold text-center">Max Marks</TableHead>
            <TableHead className="font-semibold text-center">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marks.map((subject) => {
            const percentage = (subject.marks / subject.maxMarks) * 100;
            return (
              <TableRow key={subject.subjectName}>
                <TableCell>{subject.subjectName}</TableCell>
                <TableCell className="text-center">{subject.marks}</TableCell>
                <TableCell className="text-center">{subject.maxMarks}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span>{percentage.toFixed(2)}%</span>
                    <Progress value={percentage} className="w-24 h-2" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function AttendanceTable({ attendance }: { attendance: StudentSubjectAttendance[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Subject</TableHead>
            <TableHead className="font-semibold text-center">Attended</TableHead>
            <TableHead className="font-semibold text-center">Total Classes</TableHead>
            <TableHead className="font-semibold text-center">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendance.map((record) => {
             const percentage = record.totalClasses > 0 ? (record.attendedClasses / record.totalClasses) * 100 : 0;
            return (
              <TableRow key={record.subjectName}>
                <TableCell>{record.subjectName}</TableCell>
                <TableCell className="text-center">{record.attendedClasses}</TableCell>
                <TableCell className="text-center">{record.totalClasses}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span>{percentage.toFixed(2)}%</span>
                    <Progress value={percentage} className="w-24 h-2" 
                      indicatorClassName={percentage < 75 ? 'bg-destructive' : 'bg-primary'}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
