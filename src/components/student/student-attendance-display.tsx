
'use client';

import type { StudentSubjectAttendance, SubjectName } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, LineChart, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

// Mock data - in a real app, this would be fetched or passed as props
const mockAttendance: StudentSubjectAttendance[] = [
  { subjectName: 'English', totalClasses: 60, attendedClasses: 55, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Kannada', totalClasses: 50, attendedClasses: 48, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Hindi', totalClasses: 45, attendedClasses: 40, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Science', totalClasses: 70, attendedClasses: 68, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Maths', totalClasses: 75, attendedClasses: 75, records: [{date: '2023-10-01', status: 'Present'}] },
  { subjectName: 'Social Science', totalClasses: 55, attendedClasses: 50, records: [{date: '2023-10-01', status: 'Present'}] },
];

const chartConfigAttendance = {
  percentage: { label: "Attendance %", color: "hsl(var(--chart-2))" },
};

interface StudentAttendanceDisplayProps {
  attendance?: StudentSubjectAttendance[];
  studentName?: string;
}

export function StudentAttendanceDisplay({ attendance = mockAttendance, studentName = "Student" }: StudentAttendanceDisplayProps) {
  
  const attendanceChartData = attendance.map(record => ({
    name: record.subjectName,
    percentage: record.totalClasses > 0 ? parseFloat(((record.attendedClasses / record.totalClasses) * 100).toFixed(2)) : 0,
  }));

  if (!attendance || attendance.length === 0) {
    return (
      <div className="text-center py-10">
        <CalendarDays className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold text-primary mb-2">No Attendance Data</h1>
        <p className="text-muted-foreground">There is currently no attendance information available for {studentName}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="w-full shadow-lg rounded-lg border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <CalendarDays className="mr-3 h-7 w-7" /> {studentName}'s Attendance Overview
          </CardTitle>
          <CardDescription>Summary of your attendance records by subject.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AttendanceTable attendance={attendance} />
           {attendance.length > 0 && (
            <Card className="shadow-md rounded-md border-accent/50">
              <CardHeader>
                <CardTitle className="text-xl font-medium flex items-center"><LineChart className="mr-2 h-5 w-5 text-primary"/>Subject Attendance Percentage</CardTitle>
                <CardDescription>Visual representation of attendance percentage in each subject.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigAttendance} className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                      <XAxis dataKey="name" tickMargin={10} angle={-15} textAnchor="end" height={50} interval={0} />
                      <YAxis domain={[0, 100]} unit="%" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="percentage" fill="var(--color-percentage)" radius={[4, 4, 0, 0]} barSize={40}>
                        <LabelList dataKey="percentage" position="top" offset={5} fontSize={12} formatter={(value: number) => `${value}%`} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AttendanceTable({ attendance }: { attendance: StudentSubjectAttendance[] }) {
  if (attendance.length === 0) {
    return <p className="text-muted-foreground">No attendance data available.</p>;
  }
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
                      indicatorClassName={
                        percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                       }
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
