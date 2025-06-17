
'use client';

import type { SubjectMarks, SubjectName, ExamRecord, ExamName } from '@/types';
import { subjectNamesArray, examNamesArray } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { BookCheck, BarChart3, TrendingUp, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

// Function to generate mock marks for a single exam
const generateExamMarks = (examName: ExamName): ExamRecord => {
  const marks: SubjectMarks[] = subjectNamesArray.map(subject => ({
    subjectName: subject,
    // Random marks between 50 and 95 for variety, max 100
    marks: Math.floor(Math.random() * (95 - 50 + 1)) + 50, 
    maxMarks: 100,
  }));
  return { examName, subjectMarks: marks };
};

// Generate mock data for all exams
const mockExamRecords: ExamRecord[] = examNamesArray.map(examName => generateExamMarks(examName));

const chartConfig = {
  marks: { label: "Marks Obtained", color: "hsl(var(--chart-1))" },
  averageMarks: { label: "Average Marks", color: "hsl(var(--chart-2))" }
};

interface StudentRecordsProps {
  examRecords?: ExamRecord[]; // Prop to potentially pass data, defaults to mock
}

export function StudentRecords({ examRecords = mockExamRecords }: StudentRecordsProps) {
  
  // Calculate overall average marks
  const overallAverageMarks: { subjectName: SubjectName; averageMarks: number; maxMarks: number }[] = [];
  if (examRecords.length > 0) {
    subjectNamesArray.forEach(subject => {
      let totalMarksForSubject = 0;
      let examsWithSubjectCount = 0;
      examRecords.forEach(exam => {
        const foundSubject = exam.subjectMarks.find(sm => sm.subjectName === subject);
        if (foundSubject) {
          totalMarksForSubject += foundSubject.marks;
          examsWithSubjectCount++;
        }
      });
      overallAverageMarks.push({
        subjectName: subject,
        averageMarks: examsWithSubjectCount > 0 ? parseFloat((totalMarksForSubject / examsWithSubjectCount).toFixed(2)) : 0,
        maxMarks: 100, // Assuming max marks for average is also 100
      });
    });
  }
  
  const overallAverageChartData = overallAverageMarks.map(s => ({ name: s.subjectName, averageMarks: s.averageMarks }));

  if (!examRecords || examRecords.length === 0) {
    return (
        <div className="text-center py-10">
            <BookCheck className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-semibold text-primary mb-2">No Academic Records Found</h1>
            <p className="text-muted-foreground">There are currently no marks or exam records available.</p>
        </div>
    );
  }

  return (
    <div className="space-y-10">
      {examRecords.map((examRecord) => {
        const examChartData = examRecord.subjectMarks.map(subject => ({
          name: subject.subjectName,
          marks: subject.marks,
        }));

        return (
          <Card key={examRecord.examName} className="w-full shadow-xl rounded-lg border-primary/10">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <Layers className="mr-3 h-7 w-7" /> Academic Performance - {examRecord.examName}
              </CardTitle>
              <CardDescription>Detailed breakdown of marks for {examRecord.examName}.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <MarksTable marks={examRecord.subjectMarks} examName={examRecord.examName} />
              <Card className="shadow-md rounded-md border-accent/50">
                <CardHeader>
                  <CardTitle className="text-xl font-medium flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-primary"/> {examRecord.examName} - Subject Marks Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={examChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
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
            </CardContent>
          </Card>
        );
      })}

      {/* Overall Academic Summary Section */}
      {overallAverageMarks.length > 0 && (
        <Card className="w-full shadow-2xl rounded-lg border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/5">
          <CardHeader className="rounded-t-lg">
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <TrendingUp className="mr-3 h-7 w-7" /> Overall Academic Summary
            </CardTitle>
            <CardDescription>Average performance across all exams.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
             <Card className="shadow-md rounded-md border-accent/50">
                <CardHeader>
                  <CardTitle className="text-xl font-medium flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-primary"/> Average Marks Per Subject
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={overallAverageChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="name" tickMargin={10} angle={-15} textAnchor="end" height={50} interval={0} />
                        <YAxis domain={[0, 100]} allowDataOverflow={true} unit=" avg"/>
                        <ChartTooltip 
                            content={<ChartTooltipContent 
                                formatter={(value, name, props) => [`${value} avg`, name]}
                            />} 
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="averageMarks" fill="var(--color-averageMarks)" radius={[4, 4, 0, 0]} barSize={40}>
                            <LabelList dataKey="averageMarks" position="top" offset={5} fontSize={12} />
                        </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MarksTableProps {
  marks: SubjectMarks[];
  examName: ExamName;
}

function MarksTable({ marks, examName }: MarksTableProps) {
  if (marks.length === 0) {
    return <p className="text-muted-foreground italic">No marks data available for {examName}.</p>;
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
            const percentage = subject.maxMarks > 0 ? (subject.marks / subject.maxMarks) * 100 : 0;
            return (
              <TableRow key={`${examName}-${subject.subjectName}`}>
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
