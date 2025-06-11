
'use client';

import type { Teacher } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCircle, Phone, Home, Briefcase, CalendarPlus, School, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const mockTeacher: Teacher = {
  id: 'T001',
  name: 'Priya Sharma',
  email: 'priya.sharma@ees.com',
  phoneNumber: '+91 98765 43210',
  address: '456 Park Avenue, Bangalore, Karnataka',
  yearOfJoining: 2018,
  totalYearsWorked: 6, // Assuming current year is 2024
  subjectsTaught: ['English', 'Social Science'],
  profilePictureUrl: 'https://placehold.co/150x150/E6E6FA/300130.png?text=PS',
};

interface TeacherProfileDetailsProps {
  teacher?: Teacher;
}

export function TeacherProfileDetails({ teacher = mockTeacher }: TeacherProfileDetailsProps) {
  return (
    <Card className="shadow-lg rounded-lg w-full">
      <CardHeader className="bg-primary/10 rounded-t-lg p-6">
        <div className="flex flex-col items-center md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <Image
            src={teacher.profilePictureUrl || `https://placehold.co/150x150.png?text=${teacher.name.charAt(0)}`}
            alt={`${teacher.name}'s profile picture`}
            width={120}
            height={120}
            className="rounded-full border-4 border-primary shadow-md"
            data-ai-hint="teacher portrait"
          />
          <div className="text-center md:text-left pt-2">
            <CardTitle className="text-3xl font-headline text-primary">{teacher.name}</CardTitle>
            <CardDescription className="text-lg">{teacher.email}</CardDescription>
            {teacher.subjectsTaught && teacher.subjectsTaught.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                    {teacher.subjectsTaught.map(subject => (
                        <Badge key={subject} variant="secondary" className="text-sm">{subject}</Badge>
                    ))}
                </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <ProfileItem icon={Phone} label="Phone Number" value={teacher.phoneNumber} />
        <ProfileItem icon={Home} label="Address" value={teacher.address} />
        <ProfileItem icon={CalendarPlus} label="Year of Joining" value={teacher.yearOfJoining.toString()} />
        <ProfileItem icon={Briefcase} label="Total Years Worked" value={`${teacher.totalYearsWorked} years`} />
      </CardContent>
    </Card>
  );
}

interface ProfileItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}

function ProfileItem({ icon: Icon, label, value, className }: ProfileItemProps) {
  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base text-foreground">{value}</p>
      </div>
    </div>
  );
}
