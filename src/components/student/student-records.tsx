
'use client';

import type { SubjectMarks, SubjectName, ExamRecord, ExamName, GradeType } from '@/types';
import { subjectNamesArray, examNamesArray } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookCheck, BarChart3, Layers, CheckCircle, Award, CircleSlash, ChevronsRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip as RechartsChartTooltip, ChartTooltipContent as RechartsChartTooltipContent, ChartLegend as RechartsChartLegend, ChartLegendContent as RechartsChartLegendContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import React from 'react';

// Helper to calculate grade and overall percentage
const calculateGradeAndOverallPercentage = (subjectMarks: SubjectMarks[]): { grade: GradeType; overallPercentage: number; failingSubjects: SubjectName[] } => {
  let totalMarksObtained = 0;
  let totalMaxMarks = 0;
  const failingSubjects: SubjectName[] = [];

  if (!subjectMarks || subjectMarks.length === 0) {
    return { grade: 'Not Completed', overallPercentage: 0, failingSubjects: [] };
  }

  for (const subject of subjectMarks) {
    totalMarksObtained += subject.marks;
    totalMaxMarks += subject.maxMarks;
    if (subject.maxMarks > 0 && (subject.marks / subject.maxMarks) * 100 < 35) {
      failingSubjects.push(subject.subjectName);
    }
  }

  if (totalMaxMarks === 0) {
    return { grade: 'Not Completed', overallPercentage: 0, failingSubjects: subjectMarks.map(s => s.subjectName) };
  }

  const overallPercentage = (totalMarksObtained / totalMaxMarks) * 100;

  if (failingSubjects.length > 0) {
    return { grade: 'Not Completed', overallPercentage, failingSubjects };
  }

  if (overallPercentage >= 85) return { grade: 'Distinction', overallPercentage, failingSubjects };
  if (overallPercentage >= 60) return { grade: 'First Class', overallPercentage, failingSubjects };
  if (overallPercentage >= 50) return { grade: 'Second Class', overallPercentage, failingSubjects };
  if (overallPercentage >= 35) return { grade: 'Pass Class', overallPercentage, failingSubjects };
  return { grade: 'Not Completed', overallPercentage, failingSubjects };
};

const gradeStyles: Record<GradeType, { color: string; icon: React.ElementType; badgeVariant: "default" | "secondary" | "destructive" | "outline" }> = {
  'Distinction': { color: 'text-green-600 dark:text-green-400', icon: Award, badgeVariant: 'default' },
  'First Class': { color: 'text-blue-600 dark:text-blue-400', icon: CheckCircle, badgeVariant: 'secondary' },
  'Second Class': { color: 'text-yellow-600 dark:text-yellow-400', icon: CheckCircle, badgeVariant: 'outline' },
  'Pass Class': { color: 'text-orange-600 dark:text-orange-400', icon: CheckCircle, badgeVariant: 'outline' },
  'Not Completed': { color: 'text-red-600 dark:text-red-400', icon: CircleSlash, badgeVariant: 'destructive' },
};

// Helper to generate mock marks for one exam
const generateExamMarks = (examName: ExamName): SubjectMarks[] => {
  return subjectNamesArray.map(subjectName => {
    const maxMarks = 100;
    let marks;
    if (examName === 'SA2' && (subjectName === 'Maths' || subjectName === 'Science')) {
      marks = Math.floor(Math.random() * 10) + 25; // 25-34 (likely fail)
    } else if (examName === 'SA1' && subjectName === 'English') {
      marks = Math.floor(Math.random() * 15) + 85; // 85-100 (Distinction)
    } else {
      marks = Math.floor(Math.random() * 50) + 40; // 40-89 (Covers various pass grades)
    }
    return { subjectName, marks, maxMarks };
  });
};

// Generate mock data for all exams
const mockExamRecordsInitial: ExamRecord[] = examNamesArray.map(examName => ({
  examName,
  subjectMarks: generateExamMarks(examName),
}));

// Ensure SA2 has a specific scenario for testing "Detained"
const sa2Index = mockExamRecordsInitial.findIndex(e => e.examName === 'SA2');
if (sa2Index !== -1) {
    mockExamRecordsInitial[sa2Index].subjectMarks = subjectNamesArray.map(subjectName => {
        const maxMarks = 100;
        let marks;
        if (subjectName === 'Maths') marks = 30; // Fail
        else if (subjectName === 'Science') marks = 34; // Fail
        else if (subjectName === 'English') marks = 70; // Pass
        else marks = Math.floor(Math.random() * 30) + 50; // Pass (50-79)
        return { subjectName, marks, maxMarks };
    });
}


const chartConfig = {
  marks: { label: "Marks Obtained", color: "hsl(var(--chart-1))" },
  averageMarks: { label: "Average Marks", color: "hsl(var(--chart-2))" }
};

interface MarksTableProps {
  marks: SubjectMarks[];
  examName: ExamName;
  failingSubjects: SubjectName[];
}

function MarksTable({ marks, examName, failingSubjects }: MarksTableProps) {
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
            const isFailing = failingSubjects.includes(subject.subjectName);
            return (
              <TableRow key={`${examName}-${subject.subjectName}`} className={cn(isFailing ? "bg-destructive/10 hover:bg-destructive/15" : "")}>
                <TableCell className={cn(isFailing && "text-destructive font-medium")}>{subject.subjectName}</TableCell>
                <TableCell className={cn("text-center", isFailing && "text-destructive font-medium")}>{subject.marks}</TableCell>
                <TableCell className="text-center">{subject.maxMarks}</TableCell>
                <TableCell className={cn("text-center", isFailing && "text-destructive font-medium")}>
                  <div className="flex items-center justify-center space-x-2">
                    <span>{percentage.toFixed(2)}%</span>
                    <Progress value={percentage} className="w-24 h-2"
                       indicatorClassName={
                        isFailing ? 'bg-destructive' :
                        percentage >= 85 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
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

interface StudentRecordsProps {
  examRecords?: ExamRecord[];
}

export function StudentRecords({ examRecords = mockExamRecordsInitial }: StudentRecordsProps) {
  const overallAverageMarksData = subjectNamesArray.map(subjectName => {
    let totalMarks = 0;
    let count = 0;
    examRecords.forEach(exam => {
      const subjectMark = exam.subjectMarks.find(sm => sm.subjectName === subjectName);
      if (subjectMark) {
        totalMarks += subjectMark.marks;
        count++;
      }
    });
    return {
      name: subjectName,
      averageMarks: count > 0 ? parseFloat((totalMarks / count).toFixed(2)) : 0,
    };
  });

  const sa2Record = examRecords.find(er => er.examName === 'SA2');
  let sa2GradeResult: ReturnType<typeof calculateGradeAndOverallPercentage> | null = null;
  let promotionStatus: 'Promoted to Next Class' | 'Detained' = 'Detained'; // Default to Detained
  let promotionStatusDetails: { color: string; icon: React.ElementType; message: string } = {
    color: 'text-red-600 dark:text-red-400',
    icon: ShieldAlert,
    message: 'Detained. Performance requires attention.',
  };

  if (sa2Record) {
    sa2GradeResult = calculateGradeAndOverallPercentage(sa2Record.subjectMarks);
    if (sa2GradeResult.grade !== 'Not Completed') {
      promotionStatus = 'Promoted to Next Class';
    }
  }

  if (promotionStatus === 'Promoted to Next Class') {
    promotionStatusDetails = {
      color: 'text-green-600 dark:text-green-400',
      icon: ShieldCheck,
      message: 'Promoted to Next Class. Congratulations!',
    };
  }

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
        const { grade, overallPercentage, failingSubjects } = calculateGradeAndOverallPercentage(examRecord.subjectMarks);
        const GradeIcon = gradeStyles[grade].icon;

        return (
          <Card key={examRecord.examName} className="shadow-xl rounded-lg border-primary/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle className="text-2xl font-headline text-primary">{examRecord.examName} Exam Results</CardTitle>
                  <CardDescription>Detailed marks for {examRecord.examName}.</CardDescription>
                </div>
                <Badge variant={gradeStyles[grade].badgeVariant} className={`px-3 py-1.5 text-sm mt-2 sm:mt-0 ${gradeStyles[grade].color} border-${gradeStyles[grade].badgeVariant === 'destructive' ? 'destructive' : gradeStyles[grade].badgeVariant === 'default' ? 'primary' : 'secondary' }/50`}>
                  <GradeIcon className="mr-1.5 h-4 w-4" /> Grade: {grade} ({overallPercentage.toFixed(2)}%)
                </Badge>
              </div>
              {grade === 'Not Completed' && failingSubjects.length > 0 && (
                <p className="text-xs text-destructive mt-1.5">
                  Failing subjects: {failingSubjects.join(', ')}.
                </p>
              )}
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <MarksTable marks={examRecord.subjectMarks} examName={examRecord.examName} failingSubjects={failingSubjects} />
              {examRecord.subjectMarks.length > 0 && (
                <Card className="shadow-md rounded-md border-accent/50">
                  <CardHeader>
                    <CardTitle className="text-xl font-medium flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Subject Performance Chart</CardTitle>
                    <CardDescription>Visual representation of marks obtained in each subject for {examRecord.examName}.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={examChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tickMargin={10} angle={-15} textAnchor="end" height={50} interval={0} />
                          <YAxis domain={[0, 100]} />
                          <RechartsChartTooltip content={<RechartsChartTooltipContent />} />
                          <RechartsChartLegend content={<RechartsChartLegendContent />} />
                          <Bar dataKey="marks" fill="var(--color-marks)" radius={[4, 4, 0, 0]} barSize={30}>
                             <LabelList dataKey="marks" position="top" offset={5} fontSize={12} />
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        );
      })}

      {sa2Record && sa2GradeResult && (
        <Card className="shadow-xl rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary flex items-center justify-center">
                <ChevronsRight className="mr-2 h-8 w-8"/> Final Result & Promotion Status
            </CardTitle>
            <CardDescription>Based on SA2 Examination Performance</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4 p-6">
            <div className="mb-3">
              <p className="text-sm text-muted-foreground">SA2 Exam Grade</p>
              <Badge variant={gradeStyles[sa2GradeResult.grade].badgeVariant} className={`px-4 py-2 text-lg ${gradeStyles[sa2GradeResult.grade].color} border-${gradeStyles[sa2GradeResult.grade].badgeVariant === 'destructive' ? 'destructive' : gradeStyles[sa2GradeResult.grade].badgeVariant === 'default' ? 'primary' : 'secondary' }/60`}>
                {React.createElement(gradeStyles[sa2GradeResult.grade].icon, { className: "mr-2 h-5 w-5" })}
                {sa2GradeResult.grade} ({sa2GradeResult.overallPercentage.toFixed(2)}%)
              </Badge>
              {sa2GradeResult.grade === 'Not Completed' && sa2GradeResult.failingSubjects.length > 0 && (
                <p className="text-xs text-destructive mt-1.5">
                  Failing subjects in SA2: {sa2GradeResult.failingSubjects.join(', ')}.
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Promotion Status</p>
              <div className={`flex items-center justify-center text-2xl font-semibold ${promotionStatusDetails.color}`}>
                <promotionStatusDetails.icon className="mr-2 h-7 w-7"/>
                {promotionStatusDetails.message}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-xl rounded-lg border-accent/50">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <Layers className="mr-3 h-7 w-7"/> Overall Academic Summary
          </CardTitle>
          <CardDescription>Average performance across all subjects and exams.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
           <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={overallAverageMarksData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickMargin={10} angle={-15} textAnchor="end" height={50} interval={0} />
              <YAxis domain={[0, 100]} />
              <RechartsChartTooltip content={<RechartsChartTooltipContent />} />
              <RechartsChartLegend content={<RechartsChartLegendContent />} />
              <Bar dataKey="averageMarks" fill="var(--color-averageMarks)" radius={[4, 4, 0, 0]} barSize={30}>
                <LabelList dataKey="averageMarks" position="top" offset={5} fontSize={12} formatter={(value: number) => value.toFixed(2)} />
              </Bar>
            </RechartsBarChart>
           </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
      