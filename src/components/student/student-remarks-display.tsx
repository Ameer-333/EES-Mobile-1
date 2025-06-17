
'use client';

import type { StudentRemark, SubjectName } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, Smile, Frown, Meh, BookOpen, CalendarDays, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import { useMemo } from 'react';

// Mock data for demonstration with new structure
const mockRemarks: StudentRemark[] = [
  { id: 'r1', teacherName: 'Ms. Priya Sharma', teacherSubject: 'English', remark: 'Ravi has shown excellent improvement in English grammar this term. Keep up the great work!', date: '2024-05-15', sentiment: 'good' },
  { id: 'r2', teacherName: 'Mr. Anand Singh', teacherSubject: 'Maths', remark: 'Needs to focus more during math class to grasp complex concepts.', date: '2024-05-10', sentiment: 'bad' },
  { id: 'r3', teacherName: 'Ms. Kavita Rao', teacherSubject: 'Science', remark: 'Submitted a well-researched project on renewable energy.', date: '2024-04-20', sentiment: 'good' },
  { id: 'r4', teacherName: 'Ms. Priya Sharma', teacherSubject: 'English', remark: 'Participation in class discussions is satisfactory.', date: '2024-04-25', sentiment: 'neutral' },
  { id: 'r5', teacherName: 'Mr. Anand Singh', teacherSubject: 'Maths', remark: 'Struggled with the recent algebra test. Recommended extra practice.', date: '2024-06-01', sentiment: 'bad' },
  { id: 'r6', teacherName: 'Ms. Kavita Rao', teacherSubject: 'Science', remark: 'Actively participates in lab experiments and shows curiosity.', date: '2024-06-05', sentiment: 'good' },
];

interface StudentRemarksDisplayProps {
  remarks?: StudentRemark[];
}

const sentimentIconsAndColors = {
  good: { icon: Smile, color: 'text-green-500', fill: 'hsl(var(--chart-2))' }, // Green
  bad: { icon: Frown, color: 'text-red-500', fill: 'hsl(var(--chart-1))' },     // Red
  neutral: { icon: Meh, color: 'text-yellow-500', fill: 'hsl(var(--chart-3))' }, // Yellow
};

const chartConfig = {
  good: { label: "Good", color: sentimentIconsAndColors.good.fill },
  bad: { label: "Needs Improvement", color: sentimentIconsAndColors.bad.fill },
  neutral: { label: "Neutral", color: sentimentIconsAndColors.neutral.fill },
};


export function StudentRemarksDisplay({ remarks = mockRemarks }: StudentRemarksDisplayProps) {

  const remarksChartData = useMemo(() => {
    if (!remarks || remarks.length === 0) return [];
    
    const remarksByMonth: Record<string, { good: number; bad: number; neutral: number }> = {};

    remarks.forEach(remark => {
      const monthYear = remark.date.substring(0, 7); // YYYY-MM
      if (!remarksByMonth[monthYear]) {
        remarksByMonth[monthYear] = { good: 0, bad: 0, neutral: 0 };
      }
      remarksByMonth[monthYear][remark.sentiment]++;
    });

    return Object.entries(remarksByMonth)
      .map(([month, counts]) => ({ month, ...counts }))
      .sort((a, b) => a.month.localeCompare(b.month)); // Sort by month
  }, [remarks]);


  if (!remarks || remarks.length === 0) {
    return (
      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <MessageSquareText className="mr-2 h-6 w-6" /> Student Remarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No remarks available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <BarChart3 className="mr-2 h-6 w-6" /> Remarks Overview
          </CardTitle>
          <CardDescription>Monthly trend of remarks received.</CardDescription>
        </CardHeader>
        <CardContent>
          {remarksChartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <RechartsBarChart data={remarksChartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  tickFormatter={(value) => {
                    const date = new Date(value + "-01"); // Ensure it's a valid date for formatting
                    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
                  }}
                />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="good" fill="var(--color-good)" radius={4} stackId="a">
                  <LabelList dataKey="good" position="top" offset={5} fontSize={10} formatter={(value: number) => value > 0 ? value : ''} />
                </Bar>
                <Bar dataKey="bad" fill="var(--color-bad)" radius={4} stackId="a">
                   <LabelList dataKey="bad" position="top" offset={5} fontSize={10} formatter={(value: number) => value > 0 ? value : ''} />
                </Bar>
                <Bar dataKey="neutral" fill="var(--color-neutral)" radius={4} stackId="a">
                  <LabelList dataKey="neutral" position="top" offset={5} fontSize={10} formatter={(value: number) => value > 0 ? value : ''} />
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground text-center py-4">Not enough data to display the chart.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <MessageSquareText className="mr-2 h-6 w-6" /> Detailed Remarks
          </CardTitle>
          <CardDescription>Feedback from your teachers.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-3">
            <div className="space-y-4">
              {remarks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((remark) => {
                const SentimentIcon = sentimentIconsAndColors[remark.sentiment].icon;
                const sentimentColor = sentimentIconsAndColors[remark.sentiment].color;
                return (
                  <div key={remark.id} className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className={`absolute top-0 right-0 p-1.5 opacity-20 ${sentimentIconsAndColors[remark.sentiment].color.replace('text-','bg-').replace('-500','-100')} rounded-bl-lg`}>
                        <SentimentIcon className={`h-6 w-6 ${sentimentColor}`} />
                    </div>
                    <div className="flex items-start space-x-3">
                      <Avatar className="mt-1 h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={`https://placehold.co/40x40/E6E6FA/300130.png?text=${remark.teacherName.charAt(0)}`} alt={remark.teacherName} data-ai-hint="teacher avatar"/>
                        <AvatarFallback>{remark.teacherName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-foreground">{remark.teacherName}</p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <CalendarDays className="h-3 w-3 mr-1" />
                            {new Date(remark.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center mb-1">
                          <BookOpen className="h-3 w-3 mr-1 text-primary" />
                          Subject: {remark.teacherSubject}
                        </p>
                        <p className="text-sm text-foreground/80 leading-relaxed">{remark.remark}</p>
                        <div className="mt-2 flex items-center">
                           <SentimentIcon className={`h-4 w-4 mr-1.5 ${sentimentColor}`} />
                           <span className={`text-xs font-medium ${sentimentColor}`}>
                             {remark.sentiment.charAt(0).toUpperCase() + remark.sentiment.slice(1)}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
