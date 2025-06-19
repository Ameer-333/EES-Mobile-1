
'use client';

// This page mirrors the Admin Analytics page for view-only purposes.
// For actual data and more complex role-based views, backend integration
// and more sophisticated frontend logic would be required.

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, LineChartIcon, Users, Activity, PieChartIcon, User, UserCheck, UserCog, Shield, HeartPulse, Database } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, Line, Pie, PieChart as RechartsPieChart, LineChart as RechartsLineChart, BarChart as RechartsBarChart, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend } from "recharts";
import { LabelList } from "recharts";

// Initial Mock Data (Client-side generated for dynamic effect on some charts)
const initialStudentEnrollmentData: { month: string; students: number }[] = [
  { month: "Jan", students: 0 }, { month: "Feb", students: 0 }, { month: "Mar", students: 0 },
  { month: "Apr", students: 0 }, { month: "May", students: 0 }, { month: "Jun", students: 0 },
];

const initialDailyActiveStudentsData: { date: string; activeStudents: number }[] = [
  { date: "Day 1", activeStudents: 0 }, { date: "Day 2", activeStudents: 0 }, { date: "Day 3", activeStudents: 0 },
  { date: "Day 4", activeStudents: 0 }, { date: "Day 5", activeStudents: 0 }, { date: "Day 6", activeStudents: 0 },
];

const initialSystemHealthData: { day: string; healthScore: number }[] = [
    { day: "Mon", healthScore: 0}, { day: "Tue", healthScore: 0}, { day: "Wed", healthScore: 0},
    { day: "Thu", healthScore: 0}, { day: "Fri", healthScore: 0}, { day: "Sat", healthScore: 0}, { day: "Sun", healthScore: 0}
];

// Representative Firebase Free Tier Limits (Manual - keep updated if Firebase changes them)
const firebaseFreeTierLimits = {
  firestoreReadsPerDay: 50000,
  firestoreWritesPerDay: 20000,
  firestoreStorageGB: 1,
};

const firebaseUsageConfig = {
  reads: { label: "Doc Reads/Day", color: "hsl(var(--chart-1))" },
  writes: { label: "Doc Writes/Day", color: "hsl(var(--chart-2))" },
  storage: { label: "Storage (GB)", color: "hsl(var(--chart-3))" },
};

// Static Mock Data for Firebase Usage (Simulating a weekly snapshot)
const staticFirebaseUsageData = [
    { name: 'Firestore Reads', usage: 35200, limit: firebaseFreeTierLimits.firestoreReadsPerDay, unit: 'reads/day', fill: firebaseUsageConfig.reads.color },
    { name: 'Firestore Writes', usage: 12500, limit: firebaseFreeTierLimits.firestoreWritesPerDay, unit: 'writes/day', fill: firebaseUsageConfig.writes.color },
    { name: 'Firestore Storage', usage: 0.45, limit: firebaseFreeTierLimits.firestoreStorageGB, unit: 'GB', fill: firebaseUsageConfig.storage.color },
];


const chartConfigStudentEnrollment = {
  students: { label: "New Students", color: "hsl(var(--chart-1))" },
};

const chartConfigRoleDist = {
  Students: { label: "Students", color: "hsl(var(--chart-1))" },
  Teachers: { label: "Teachers", color: "hsl(var(--chart-2))" },
  Admins: { label: "Admins", color: "hsl(var(--chart-3))" },
  Coordinators: { label: "Coordinators", color: "hsl(var(--chart-4))" },
};

const chartConfigActiveStudents = {
  activeStudents: { label: "Active Students", color: "hsl(var(--chart-2))" },
};

const chartConfigSystemHealth = {
  healthScore: { label: "Health Score (%)", color: "hsl(var(--chart-5))" },
};


export default function CoordinatorAnalyticsPage() {
  const [studentEnrollmentData, setStudentEnrollmentData] = useState(initialStudentEnrollmentData);
  const [dailyActiveStudentsData, setDailyActiveStudentsData] = useState(initialDailyActiveStudentsData);
  const [systemHealthData, setSystemHealthData] = useState(initialSystemHealthData);
  const [firebaseUsageData, setFirebaseUsageData] = useState(staticFirebaseUsageData); // Use static data

  // Mock counts for StatCards - in a real app, these would be fetched
  const totalStudents = 150;
  const totalBoys = 80;
  const totalGirls = 70;
  const totalTeachers = 25;
  const totalAdmins = 5;
  const totalCoordinators = 3;

  const roleDistributionData = [
    { name: "Students", value: totalStudents, fill: chartConfigRoleDist.Students.color },
    { name: "Teachers", value: totalTeachers, fill: chartConfigRoleDist.Teachers.color },
    { name: "Admins", value: totalAdmins, fill: chartConfigRoleDist.Admins.color },
    { name: "Coordinators", value: totalCoordinators, fill: chartConfigRoleDist.Coordinators.color },
  ];

  useEffect(() => {
    // Generate random data only on the client side for dynamic effect (excluding Firebase usage)
    const generatedEnrollment = initialStudentEnrollmentData.map(d => ({ ...d, students: Math.floor(Math.random() * 50) + 20 }));
    setStudentEnrollmentData(generatedEnrollment);

    const generatedActiveStudents = initialDailyActiveStudentsData.map(d => ({ ...d, activeStudents: Math.floor(Math.random() * totalStudents*0.8) + totalStudents*0.1 }));
    setDailyActiveStudentsData(generatedActiveStudents);
    
    const generatedHealth = initialSystemHealthData.map(d => ({ ...d, healthScore: Math.floor(Math.random() * 15) + 85 }));
    setSystemHealthData(generatedHealth);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">System Analytics Overview</h1>
        <LineChartIcon className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">View key metrics and operational insights for the EES Education system. (View-only)</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Students" value={totalStudents.toString()} icon={<Users className="h-6 w-6 text-primary" />} description="Enrolled students" />
        <StatCard title="Total Boys" value={totalBoys.toString()} icon={<User className="h-6 w-6 text-blue-500" />} description="Male students" />
        <StatCard title="Total Girls" value={totalGirls.toString()} icon={<User className="h-6 w-6 text-pink-500" />} description="Female students" />
        <StatCard title="Total Teachers" value={totalTeachers.toString()} icon={<UserCheck className="h-6 w-6 text-green-500" />} description="Active teaching staff" />
        <StatCard title="Total Admins" value={totalAdmins.toString()} icon={<Shield className="h-6 w-6 text-red-500" />} description="System administrators" />
        <StatCard title="Total Coordinators" value={totalCoordinators.toString()} icon={<UserCog className="h-6 w-6 text-purple-500" />} description="System coordinators" />
        <StatCard title="Active Sessions" value="45" icon={<Activity className="h-6 w-6 text-primary" />} description="Currently active users (mock)" />
        <StatCard title="System Health" value="Optimal" icon={<HeartPulse className="h-6 w-6 text-green-500" />} description="Current operational status (mock)" />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Student Enrollment Trends</CardTitle>
            <CardDescription>New students per month (Mock Data)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigStudentEnrollment} className="h-[300px] w-full">
              <RechartsBarChart accessibilityLayer data={studentEnrollmentData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="students" fill="var(--color-students)" radius={4}>
                   <LabelList dataKey="students" position="top" offset={5} fontSize={12} />
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Role Distribution</CardTitle>
            <CardDescription>Breakdown of users by role (Mock Data)</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={chartConfigRoleDist} className="h-[300px] w-full max-w-[350px]">
              <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={roleDistributionData} dataKey="value" nameKey="name" labelLine={false} >
                   <LabelList
                    dataKey="name"
                    className="fill-background"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: string) => chartConfigRoleDist[value as keyof typeof chartConfigRoleDist]?.label}
                  />
                   {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsLegend content={<ChartLegendContent nameKey="name" />} />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-medium">Daily Active Students</CardTitle>
                <CardDescription>Trend of active students daily (Mock Data)</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfigActiveStudents} className="h-[300px] w-full">
                <RechartsLineChart accessibilityLayer data={dailyActiveStudentsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent indicator="line"/>} />
                    <Line type="monotone" dataKey="activeStudents" stroke="var(--color-activeStudents)" strokeWidth={2} dot={true} />
                </RechartsLineChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-medium">System Health Trend</CardTitle>
                <CardDescription>Overall system health score over the past week (Mock Data)</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfigSystemHealth} className="h-[300px] w-full">
                <RechartsLineChart accessibilityLayer data={systemHealthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis domain={[0, 100]} unit="%"/>
                    <ChartTooltip content={<ChartTooltipContent indicator="line"/>} />
                    <Line type="monotone" dataKey="healthScore" stroke="var(--color-healthScore)" strokeWidth={2} dot={true} />
                </RechartsLineChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

       <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium flex items-center">
                <Database className="mr-2 h-5 w-5 text-primary"/> Firebase Usage Monitoring
            </CardTitle>
            <CardDescription>Key Firebase service usage against representative free tier limits. (Static Mock Data - Simulates a weekly snapshot)</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={firebaseUsageConfig} className="h-[350px] w-full">
                 <RechartsBarChart data={firebaseUsageData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <RechartsLegend />
                    <Bar dataKey="usage" name="Current Usage" radius={4}>
                        <LabelList dataKey="usage" position="right" offset={8} fontSize={12} 
                                   formatter={(value: number, props: any) => {
                                    if (props && props.payload && typeof props.payload.limit === 'number' && typeof props.payload.unit === 'string') {
                                      return `${value.toLocaleString()} / ${props.payload.limit.toLocaleString()} ${props.payload.unit.includes('reads') || props.payload.unit.includes('writes') ? props.payload.unit.replace('/day', '') : props.payload.unit}`;
                                    }
                                    return value.toLocaleString(); // Fallback
                                  }}/>
                    </Bar>
                 </RechartsBarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">Note: This is a conceptual representation using hardcoded free tier limits for common services. Actual Firebase limits are more nuanced and can change. For definitive usage and billing, always check your Firebase Console.</p>
          </CardContent>
        </Card>

    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
