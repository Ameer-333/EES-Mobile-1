
'use client';

import type { StudentRemark } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, Smile, Frown, Meh, BookOpen, CalendarDays, BarChart3, Info } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, ResponsiveContainer } from "recharts";
import { useMemo } from 'react';

// Mock data for demonstration - in a real app, this would be fetched
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
  good: { icon: Smile, color: 'text-green-500', fill: 'hsl(var(--chart-2))' },
  bad: { icon: Frown, color: 'text-red-500', fill: 'hsl(var(--chart-1))' },
  neutral: { icon: Meh, color: 'text-yellow-500', fill: 'hsl(var(--chart-3))' },
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
      .sort((a, b) => a.month.localeCompare(b.month));
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
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Info className="h-10 w-10 mb-3" />
            <p>No remarks available at the moment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl border-primary/10 rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <BarChart3 className="mr-3 h-7 w-7" /> Remarks Overview
          </CardTitle>
          <CardDescription>A monthly summary of the feedback you've received.</CardDescription>
        </CardHeader>
        <CardContent>
          {remarksChartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={remarksChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10}
                    tickFormatter={(value) => {
                      const date = new Date(value + "-02"); // Use 2nd day to avoid timezone shifts to prev month
                      return date.toLocaleString('default', { month: 'short', year: '2-digit' });
                    }}
                  />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={30}/>
                  <ChartTooltip 
                    cursor={{fill: 'hsl(var(--accent))', radius: 4}}
                    content={<ChartTooltipContent 
                        formatter={(value, name, props) => {
                             if (value === 0) return null; // Hide if count is 0
                             return (
                                <div className="flex items-center">
                                   <span className="mr-2 h-2.5 w-2.5 rounded-full" style={{backgroundColor: props.fill}} />
                                   {chartConfig[name as keyof typeof chartConfig]?.label}: {value}
                                </div>
                             );
                        }}
                    />} 
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="good" fill="var(--color-good)" radius={[4, 4, 0, 0]} stackId="a">
                    <LabelList dataKey="good" position="top" offset={5} fontSize={10} formatter={(value: number) => value > 0 ? value : ''} />
                  </Bar>
                  <Bar dataKey="bad" fill="var(--color-bad)" radius={[4, 4, 0, 0]} stackId="a">
                    <LabelList dataKey="bad" position="top" offset={5} fontSize={10} formatter={(value: number) => value > 0 ? value : ''} />
                  </Bar>
                  <Bar dataKey="neutral" fill="var(--color-neutral)" radius={[4, 4, 0, 0]} stackId="a">
                    <LabelList dataKey="neutral" position="top" offset={5} fontSize={10} formatter={(value: number) => value > 0 ? value : ''} />
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Info className="h-10 w-10 mb-3" />
                <p>Not enough data to display the remarks chart yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xl border-primary/10 rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <MessageSquareText className="mr-3 h-7 w-7" /> Detailed Remarks
          </CardTitle>
          <CardDescription>All feedback from your teachers, sorted by most recent.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-3 -mr-3"> {/* Offset padding for scrollbar */}
            <div className="space-y-5">
              {remarks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((remark) => {
                const SentimentIcon = sentimentIconsAndColors[remark.sentiment].icon;
                const sentimentColor = sentimentIconsAndColors[remark.sentiment].color;
                const sentimentBgColor = sentimentIconsAndColors[remark.sentiment].fill;
                
                return (
                  <div key={remark.id} className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow duration-200 ease-in-out relative overflow-hidden group">
                    <div 
                        className="absolute top-0 right-0 h-full w-1.5"
                        style={{ backgroundColor: sentimentBgColor }}
                    />
                    <div className="flex items-start space-x-4">
                      <Avatar className="mt-1 h-12 w-12 border-2 border-primary/30 flex-shrink-0">
                        <AvatarImage src={`https://placehold.co/48x48/${sentimentBgColor.substring(4,10)}/300130.png?text=${remark.teacherName.charAt(0)}`} alt={remark.teacherName} data-ai-hint="teacher avatar"/>
                        <AvatarFallback>{remark.teacherName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <p className="font-semibold text-foreground text-md">{remark.teacherName}</p>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <BookOpen className="h-3 w-3 mr-1.5 text-primary/70" />
                              Subject: {remark.teacherSubject}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center pt-0.5">
                            <CalendarDays className="h-3 w-3 mr-1.5" />
                            {new Date(remark.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed my-2">{remark.remark}</p>
                        <div className={`mt-2 flex items-center px-2 py-1 rounded-md text-xs font-medium w-fit ${sentimentColor.replace('text-','bg-').replace('-500','-100')} ${sentimentColor}`}>
                           <SentimentIcon className={`h-4 w-4 mr-1.5`} />
                           {remark.sentiment.charAt(0).toUpperCase() + remark.sentiment.slice(1)} Feedback
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
