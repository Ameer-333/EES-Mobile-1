
'use client';

import type { StudentRemark } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, Smile, Frown, Meh, BookOpen, CalendarDays, Info, PieChartIcon } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LabelList } from "recharts";
import { useMemo } from 'react';
import Image from 'next/image';

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
  profilePictureUrl?: string | null;
  studentName?: string;
}

const sentimentDetails = {
  good: { icon: Smile, color: 'text-green-500', fill: 'hsl(var(--chart-sentiment-good))', label: 'Good' },
  bad: { icon: Frown, color: 'text-red-500', fill: 'hsl(var(--chart-sentiment-bad))', label: 'Needs Improvement' },
  neutral: { icon: Meh, color: 'text-yellow-500', fill: 'hsl(var(--chart-sentiment-neutral))', label: 'Neutral' },
};

const chartConfig = {
  good: { label: sentimentDetails.good.label, color: sentimentDetails.good.fill },
  bad: { label: sentimentDetails.bad.label, color: sentimentDetails.bad.fill },
  neutral: { label: sentimentDetails.neutral.label, color: sentimentDetails.neutral.fill },
};


export function StudentRemarksDisplay({ remarks = mockRemarks, profilePictureUrl, studentName = "Student" }: StudentRemarksDisplayProps) {

  const remarksSentimentData = useMemo(() => {
    if (!remarks || remarks.length === 0) return [];
    
    const sentimentCounts = { good: 0, bad: 0, neutral: 0 };
    remarks.forEach(remark => {
      sentimentCounts[remark.sentiment]++;
    });

    return Object.entries(sentimentCounts).map(([key, value]) => ({
      name: key as 'good' | 'bad' | 'neutral',
      value: value,
      fill: sentimentDetails[key as 'good' | 'bad' | 'neutral'].fill,
    })).filter(item => item.value > 0);
  }, [remarks]);


  if (!remarks || remarks.length === 0) {
    return (
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="items-center text-center">
           {profilePictureUrl && (
             <Avatar className="h-24 w-24 mb-4 border-4 border-primary/30 shadow-md">
                <AvatarImage src={profilePictureUrl} alt={`${studentName}'s profile picture`} data-ai-hint="student portrait"/>
                <AvatarFallback>{studentName ? studentName.charAt(0) : 'S'}</AvatarFallback>
             </Avatar>
            )}
          <CardTitle className="text-xl font-semibold text-primary flex items-center justify-center">
            <MessageSquareText className="mr-2 h-6 w-6" /> {studentName}'s Remarks
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
  
  const totalRemarks = remarksSentimentData.reduce((acc, curr) => acc + curr.value, 0);
  const donutInnerRadius = 70; 


  return (
    <div className="space-y-8">
      <Card className="shadow-xl border-primary/10 rounded-lg">
        <CardHeader className="items-center text-center">
           {profilePictureUrl && (
             <Avatar className="h-24 w-24 mb-4 border-4 border-primary/30 shadow-md">
                <AvatarImage src={profilePictureUrl} alt={`${studentName}'s profile picture`} data-ai-hint="student portrait"/>
                <AvatarFallback>{studentName ? studentName.charAt(0) : 'S'}</AvatarFallback>
             </Avatar>
            )}
          <CardTitle className="text-2xl font-headline text-primary flex items-center justify-center">
            <PieChartIcon className="mr-3 h-7 w-7" /> Remarks Sentiment Overview
          </CardTitle>
          <CardDescription>Overall distribution of feedback sentiment for {studentName}.</CardDescription>
        </CardHeader>
        <CardContent>
          {remarksSentimentData.length > 0 ? (
            <div className="relative h-[300px] w-full max-w-md mx-auto">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <ChartTooltip
                      cursor={{ fill: 'hsl(var(--accent))', radius: 4 }}
                      content={<ChartTooltipContent 
                          nameKey="name" 
                          formatter={(value, name) => {
                              if (!name || !chartConfig[name as keyof typeof chartConfig]) return null;
                              return (
                                <div className="flex items-center">
                                   <span className="mr-2 h-2.5 w-2.5 rounded-full" style={{backgroundColor: chartConfig[name as keyof typeof chartConfig]?.color}} />
                                   {chartConfig[name as keyof typeof chartConfig]?.label}: {value} ({( (value / totalRemarks) * 100 ).toFixed(1)}%)
                                </div>
                              );
                          }}
                      />}
                    />
                    <Pie
                      data={remarksSentimentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110} 
                      innerRadius={donutInnerRadius} 
                      paddingAngle={2}
                      labelLine={false}
                    >
                      {remarksSentimentData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} stroke={entry.fill} />
                      ))}
                       <LabelList
                          dataKey="value"
                          position="outside"
                          offset={15}
                          formatter={(value: number, entry: any) => {
                             if (!entry || !entry.name || !chartConfig[entry.name as keyof typeof chartConfig]) return null;
                             const percentage = ((value / totalRemarks) * 100).toFixed(0);
                             if (parseInt(percentage) < 8) return null; 
                             return `${chartConfig[entry.name as keyof typeof chartConfig]?.label}: ${percentage}%`;
                          }}
                          className="fill-foreground text-xs"
                          stroke="none"
                       />
                    </Pie>
                    <ChartLegend 
                      content={<ChartLegendContent nameKey="name" className="mt-4" />} 
                      wrapperStyle={{paddingTop: '20px'}}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
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
          <ScrollArea className="h-[400px] pr-3 -mr-3"> 
            <div className="space-y-5">
              {remarks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((remark) => {
                const sentimentInfo = sentimentDetails[remark.sentiment];
                
                return (
                  <div key={remark.id} className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow duration-200 ease-in-out relative overflow-hidden group">
                    <div 
                        className="absolute top-0 right-0 h-full w-1.5"
                        style={{ backgroundColor: sentimentInfo.fill }}
                    />
                    <div className="flex items-start space-x-4">
                      <Avatar className="mt-1 h-12 w-12 border-2 border-primary/30 flex-shrink-0">
                        <AvatarImage src={`https://placehold.co/48x48.png`} alt={remark.teacherName} data-ai-hint="teacher avatar"/>
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
                        <div className={`mt-2 flex items-center px-2 py-1 rounded-md text-xs font-medium w-fit ${sentimentInfo.color.replace('text-','bg-').replace('-500','-100')} ${sentimentInfo.color}`}>
                           <sentimentInfo.icon className={`h-4 w-4 mr-1.5`} />
                           {sentimentInfo.label} Feedback
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
