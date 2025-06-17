
'use client';

import type { SubjectMarks, SubjectName } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { BookCheck, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";


// Mock data
const mockMarks: SubjectMarks[] = [
  { subjectName: 'English', marks: 85, maxMarks: 100 },
  { subjectName: 'Kannada', marks: 78, maxMarks: 100 },
  { subjectName: 'Hindi', marks: 72, maxMarks: 100 },
  { subjectName: 'Science', marks: 90, maxMarks: 100 },
  { subjectName: 'Maths', marks: 95, maxMarks: 100 },
  { subjectName: 'Social Science', marks: 80, maxMarks: 100 },
];

const chartConfigMarks = {
  marks: { label: "Marks Obtained", color: "hsl(var(--chart-1))" },
};


export function StudentRecords({ marks = mockMarks }: { marks?: SubjectMarks[] }) {
  
  const marksChartData = marks.map(subject => ({
    name: subject.subjectName,
    marks: subject.marks,
    maxMarks: subject.maxMarks,
  }));

  return (
    <div className="space-y-8">
      {/* Academic Performance Section */}
      <Card className="w-full shadow-lg rounded-lg border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <BookCheck className="mr-3 h-7 w-7" /> Academic Performance
          </CardTitle>
          <CardDescription>Detailed breakdown of your marks by subject.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <MarksTable marks={marks} />
          {marks.length > 0 && (
            <Card className="shadow-md rounded-md border-accent/50">
              <CardHeader>
                <CardTitle className="text-xl font-medium flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Subject Marks Overview</CardTitle>
                <CardDescription>Visual representation of marks obtained in each subject.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigMarks} className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marksChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickMargin={10} angle={-15} textAnchor="end" height={50} interval={0} />
                      <YAxis domain={[0, 100]} allowDataOverflow={true}/>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="marks" fill="var(--color-marks)" radius={[4, 4, 0, 0]} barSize={40}>
                        <LabelList dataKey="marks" position="top" offset={5} fontSize={12} />
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

function MarksTable({ marks }: { marks: SubjectMarks[] }) {
  if (marks.length === 0) {
    return <p className="text-muted-foreground">No marks data available.</p>;
  }
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
