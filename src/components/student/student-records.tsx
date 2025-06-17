
'use client';

import type { SubjectMarks, SubjectName, ExamRecord, ExamName, GradeType } from '@/types';
import { subjectNamesArray, examNamesArray } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookCheck, BarChart3, TrendingUp, Layers, Percent, CheckCircle, XCircle, Award, TrendingDown, CircleSlash, ChevronsRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// Function to generate mock marks for a single exam
const generateExamMarks = (examName: ExamName): ExamRecord => {
  const marks: SubjectMarks[] = subjectNamesArray.map(subject => ({
    subjectName: subject,
    marks: Math.floor(Math.random() * (95 - (examName === 'SA2' ? 20 : 25) + 1)) + (examName === 'SA2' ? 20 : 25), // Random marks, ensure SA2 can fail
    maxMarks: 100,
  }));
  return { examName, subjectMarks: marks };
};

const mockExamRecords: ExamRecord[] = examNamesArray.map(examName => generateExamMarks(examName));
// Ensure at least one student fails SA2 for testing "Detained"
if (mockExamRecords.find(e => e.examName === 'SA2')) {
  const sa2Index = mockExamRecords.findIndex(e => e.examName === 'SA2');
  if (sa2Index !== -1 && mockExamRecords[sa2Index].subjectMarks.length > 0) {
     // Forcing a fail in one subject for SA2 for demonstration if all subjects are passing by chance
    let sa2Record = mockExamRecords[sa2Index];
    const { grade } = calculateGradeAndOverallPercentage(sa2Record.subjectMarks);
    if (grade !== 'Not Completed') { // if SA2 is not already failing, force one subject to fail
        sa2Record.subjectMarks[0].marks = 20; // Fail the first subject
    }
  }
}


const chartConfig = {
  marks: { label: "Marks Obtained", color: "hsl(var(--chart-1))" },
  averageMarks: { label: "Average Marks", color: "hsl(var(--chart-2))" }
};

export const calculateGradeAndOverallPercentage = (subjectMarks: SubjectMarks[]): { grade: GradeType; overallPercentage: number; failingSubjects: SubjectName[] } => {
  let totalMarksObtained = 0;
  let totalMaxMarks = 0;
  const failingSubjects: SubjectName[] = [];

  for (const subject of subjectMarks) {
    totalMarksObtained += subject.marks;
    totalMaxMarks += subject.maxMarks;
    if (subject.maxMarks > 0 && (subject.marks / subject.maxMarks) * 100 < 35) {
      failingSubjects.push(subject.subjectName);
    }
  }

  if (totalMaxMarks === 0 && subjectMarks.length > 0) { // If there are subjects but no max marks, it's problematic
    return { grade: 'Not Completed', overallPercentage: 0, failingSubjects: subjectMarks.map(s => s.subjectName) };
  }
  if (totalMaxMarks === 0) { // No subjects or no max marks for any subject
    return { grade: 'Not Completed', overallPercentage: 0, failingSubjects };
  }


  const overallPercentage = (totalMarksObtained / totalMaxMarks) * 100;

  if (failingSubjects.length > 0) {
    return { grade: 'Not Completed', overallPercentage, failingSubjects };
  }

  if (overallPercentage >= 85) return { grade: 'Distinction', overallPercentage, failingSubjects };
  if (overallPercentage >= 60) return { grade: 'First Class', overallPercentage, failingSubjects };
  if (overallPercentage >= 50) return { grade: 'Second Class', overallPercentage, failingSubjects };
  if (overallPercentage >= 35) return { grade: 'Pass Class', overallPercentage, failingSubjects };
  return { grade: 'Not Completed', overallPercentage, failingSubjects }; // Should be caught by failingSubjects check
};

const gradeStyles: Record<GradeType, { color: string; icon: React.ElementType; badgeVariant: "default" | "secondary" | "destructive" | "outline" }> = {
  'Distinction': { color: 'text-green-600 dark:text-green-400', icon: Award, badgeVariant: 'default' },
  'First Class': { color: 'text-blue-600 dark:text-blue-400', icon: CheckCircle, badgeVariant: 'secondary' },
  'Second Class': { color: 'text-yellow-600 dark:text-yellow-400', icon: CheckCircle, badgeVariant: 'outline' },
  'Pass Class': { color: 'text-orange-600 dark:text-orange-400', icon: CheckCircle, badgeVariant: 'outline' },
  'Not Completed': { color: 'text-red-600 dark:text-red-400', icon: CircleSlash, badgeVariant: 'destructive' },
};


interface StudentRecordsProps {
  examRecords?: ExamRecord[];
}

export function StudentRecords({ examRecords = mockExamRecords }: StudentRecordsProps) {
  
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
        maxMarks: 100, 
      });
    });
  }
  
  const overallAverageChartData = overallAverageMarks.map(s => ({ name: s.subjectName, averageMarks: s.averageMarks }));

  const sa2Record = examRecords.find(er => er.examName === 'SA2');
  let sa2Grade: GradeType | null = null;
  let sa2FailingSubjects: SubjectName[] = [];
  let promotionStatus: "Promoted to Next Class" | "Detained" | "Pending SA2 Results" = "Pending SA2 Results";
  let promotionStatusIcon: React.ElementType = ShieldAlert;
  let promotionStatusColor = "text-yellow-600";

  if (sa2Record) {
    const { grade, failingSubjects } = calculateGradeAndOverallPercentage(sa2Record.subjectMarks);
    sa2Grade = grade;
    sa2FailingSubjects = failingSubjects;
    if (grade === 'Not Completed') {
      promotionStatus = "Detained";
      promotionStatusIcon = ShieldAlert;
      promotionStatusColor = "text-red-600";
    } else {
      promotionStatus = "Promoted to Next Class";
      promotionStatusIcon = ShieldCheck;
      promotionStatusColor = "text-green-600";
    }
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
          <Card key={examRecord.examName} className="w-full shadow-xl rounded-lg border-primary/10">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle className="text-2xl font-headline text-primary flex items-center">
                    <Layers className="mr-3 h-7 w-7" /> {examRecord.examName} - Performance
                  </CardTitle>
                  <CardDescription>Detailed breakdown of marks for {examRecord.examName}.</CardDescription>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                    <Badge variant={gradeStyles[grade].badgeVariant} className={cn("text-lg px-3 py-1.5", gradeStyles[grade].color.replace('text-','bg-').replace('-600', '-100').replace('-400', '-900/20'), gradeStyles[grade].color )}>
                        <GradeIcon className="mr-2 h-5 w-5" /> {grade}
                    </Badge>
                    <p className={cn("text-sm font-medium mt-1", gradeStyles[grade].color)}>
                        Overall: {overallPercentage.toFixed(2)}%
                    </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <MarksTable marks={examRecord.subjectMarks} examName={examRecord.examName} failingSubjects={failingSubjects} />
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
               {failingSubjects.length > 0 && (
                <CardDescription className="text-sm text-destructive flex items-center">
                  <XCircle className="mr-2 h-4 w-4" />
                  The grade "Not Completed" is due to scoring less than 35% in: {failingSubjects.join(', ')}.
                </CardDescription>
              )}
            </CardContent>
          </Card>
        );
      })}

      {sa2Record && sa2Grade && (
        <Card className="w-full shadow-2xl rounded-lg border-primary/20 bg-gradient-to-br from-accent/10 via-background to-background">
           <CardHeader className="rounded-t-lg">
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <ChevronsRight className="mr-3 h-7 w-7" /> Final Result & Promotion Status (Based on SA2)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">SA2 Exam Grade:</p>
               <Badge variant={gradeStyles[sa2Grade].badgeVariant} className={cn("text-xl px-4 py-2", gradeStyles[sa2Grade].color.replace('text-','bg-').replace('-600', '-100').replace('-400', '-900/20'), gradeStyles[sa2Grade].color )}>
                  <gradeStyles[sa2Grade].icon className="mr-2 h-6 w-6" /> {sa2Grade}
               </Badge>
            </div>
             {sa2Grade === 'Not Completed' && sa2FailingSubjects.length > 0 && (
                <p className="text-sm text-destructive">
                  Reason for "Not Completed" in SA2: Failed in {sa2FailingSubjects.join(', ')}.
                </p>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Promotion Status:</p>
              <div className={cn("text-2xl font-bold flex items-center justify-center", promotionStatusColor)}>
                <promotionStatusIcon className="mr-2 h-7 w-7" /> {promotionStatus}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

