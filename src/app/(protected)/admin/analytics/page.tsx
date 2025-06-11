
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, LineChartIcon, Users, Activity, PieChartIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, Line, Pie, PieChart as RechartsPieChart, LineChart as RechartsLineChart, BarChart as RechartsBarChart, Cell } from "recharts";
import { LabelList } from "recharts";

const userRegistrationData = [
  { month: "Jan", users: Math.floor(Math.random() * 100) + 50 },
  { month: "Feb", users: Math.floor(Math.random() * 100) + 60 },
  { month: "Mar", users: Math.floor(Math.random() * 100) + 70 },
  { month: "Apr", users: Math.floor(Math.random() * 100) + 80 },
  { month: "May", users: Math.floor(Math.random() * 100) + 90 },
  { month: "Jun", users: Math.floor(Math.random() * 100) + 100 },
];

const roleDistributionData = [
  { name: "Students", value: 150, fill: "hsl(var(--chart-1))" },
  { name: "Teachers", value: 25, fill: "hsl(var(--chart-2))" },
  { name: "Admins", value: 5, fill: "hsl(var(--chart-3))" },
];

const chartConfigUserReg = {
  users: { label: "New Users", color: "hsl(var(--chart-1))" },
};

const chartConfigRoleDist = {
  Students: { label: "Students", color: "hsl(var(--chart-1))" },
  Teachers: { label: "Teachers", color: "hsl(var(--chart-2))" },
  Admins: { label: "Admins", color: "hsl(var(--chart-3))" },
};


export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">System Analytics</h1>
        <LineChartIcon className="h-8 w-8 text-primary" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Users" value="180" icon={<Users className="h-6 w-6 text-primary" />} description="Overall system users" />
        <StatCard title="Active Sessions" value="45" icon={<Activity className="h-6 w-6 text-primary" />} description="Currently active users" />
        <StatCard title="System Health" value="Optimal" icon={<BarChart className="h-6 w-6 text-green-500" />} description="Current operational status" />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium">User Registrations</CardTitle>
            <CardDescription>New users per month (Mock Data)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigUserReg} className="h-[300px] w-full">
              <RechartsBarChart accessibilityLayer data={userRegistrationData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="var(--color-users)" radius={4}>
                   <LabelList dataKey="users" position="top" offset={5} fontSize={12} />
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
            <ChartContainer config={chartConfigRoleDist} className="h-[300px] w-full max-w-[300px]">
              <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={roleDistributionData} dataKey="value" nameKey="name" labelLine={false}>
                   <LabelList
                    dataKey="name"
                    className="fill-background"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: string) => chartConfigRoleDist[value as keyof typeof chartConfigRoleDist]?.label}
                  />
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name"/>} />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
       <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Engagement Over Time</CardTitle>
            <CardDescription>Daily active users trend (Mock Data - Placeholder)</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{engagement: {label: "Active Users", color: "hsl(var(--chart-2))"}}} className="h-[300px] w-full">
              <RechartsLineChart
                accessibilityLayer
                data={[
                  { date: "2024-07-01", engagement: 50 }, { date: "2024-07-02", engagement: 55 },
                  { date: "2024-07-03", engagement: 60 }, { date: "2024-07-04", engagement: 45 },
                  { date: "2024-07-05", engagement: 70 }, { date: "2024-07-06", engagement: 75 },
                ]}
                 margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent indicator="line"/>} />
                <Line type="monotone" dataKey="engagement" stroke="var(--color-engagement)" strokeWidth={2} dot={true} />
              </RechartsLineChart>
            </ChartContainer>
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

