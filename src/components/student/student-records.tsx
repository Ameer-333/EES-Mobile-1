
'use client';

import type { SubjectMarks, SubjectName, ExamRecord, ExamName, GradeType } from '@/types';
// Ensure all necessary types are imported
import { subjectNamesArray, examNamesArray } from '@/types'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookCheck, BarChart3, TrendingUp, Layers, CheckCircle, XCircle, Award, CircleSlash, ChevronsRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip as RechartsChartTooltip, ChartTooltipContent as RechartsChartTooltipContent, ChartLegend as RechartsChartLegend, ChartLegendContent as RechartsChartLegendContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// Helper function definitions (kept for structural completeness, but not strictly used in simplified render)
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
              <TableRow key={`${examName}-${subject.subjectName}`} className={cn(isFailing ? "bg-red-500/10 hover:bg-red-500/15" : "")}>
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

// SIMPLIFIED MOCK DATA (HARDCODED)
const simplifiedMockExamRecords: ExamRecord[] = [
  {
    examName: 'SA2',
    subjectMarks: [
      { subjectName: 'Maths', marks: 80, maxMarks: 100 },
      { subjectName: 'Science', marks: 75, maxMarks: 100 },
    ]
  },
];

interface StudentRecordsProps {
  examRecords?: ExamRecord[];
}

export function StudentRecords({ examRecords = simplifiedMockExamRecords }: StudentRecordsProps) {
  // Minimal JavaScript logic before return.

  if (!examRecords || examRecords.length === 0) {
    return (
        <div className="text-center py-10">
            <BookCheck className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-semibold text-primary mb-2">No Academic Records Found</h1>
            <p className="text-muted-foreground">There are currently no marks or exam records available.</p>
        </div>
    );
  }
  
  // The error typically points to the line where `return (` starts.
  // We are ensuring very little happens directly before this.
  return (
    <div className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Simplified Student Records Test</CardTitle>
          <CardDescription>This is a test to check basic rendering.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Found {examRecords.length} exam record(s). Displaying raw data for test:</p>
          {examRecords.map((exam, index) => (
            <div key={index} className="mt-2 p-2 border rounded">
              <p className="font-semibold">{exam.examName}</p>
              <ul>
                {exam.subjectMarks.map((sm, smIndex) => (
                  <li key={smIndex}>{sm.subjectName}: {sm.marks} / {sm.maxMarks}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
