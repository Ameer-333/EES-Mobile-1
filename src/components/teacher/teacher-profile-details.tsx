
'use client';

import type { Teacher } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCircle, Phone, Home, Briefcase, CalendarPlus, School, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image'; // Keep NextImage for non-placeholders
import { Badge } from '@/components/ui/badge';

const mockTeacher: Teacher = {
  id: 'T001',
  authUid: 'T001_auth',
  name: 'Priya Sharma',
  email: 'priya.sharma@ees.com',
  phoneNumber: '+91 98765 43210',
  address: '456 Park Avenue, Bangalore, Karnataka',
  yearOfJoining: 2018,
  totalYearsWorked: 6, 
  subjectsTaught: ['English', 'Social Science'],
  profilePictureUrl: 'https://placehold.co/150x150.png', // Removed query param
};

interface TeacherProfileDetailsProps {
  teacher?: Teacher;
}

export function TeacherProfileDetails({ teacher = mockTeacher }: TeacherProfileDetailsProps) {
  const placeholderSrc = `https://placehold.co/150x150.png`; // Clean placeholder
  const imgSrc = teacher.profilePictureUrl || placeholderSrc;
  const useRegularImg = imgSrc.includes('placehold.co');

  return (
    <Card className="shadow-lg rounded-lg w-full">
      <CardHeader className="bg-primary/10 rounded-t-lg p-6">
        <div className="flex flex-col items-center md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {useRegularImg ? (
            &lt;img
              src={imgSrc}
              alt={`${teacher.name}'s profile picture`}
              width={120}
              height={120}
              className="rounded-full border-4 border-primary shadow-md object-cover"
              data-ai-hint="teacher portrait placeholder"
            /&gt;
          ) : (
            <NextImage
              src={imgSrc}
              alt={`${teacher.name}'s profile picture`}
              width={120}
              height={120}
              className="rounded-full border-4 border-primary shadow-md object-cover"
              data-ai-hint="teacher portrait"
            />
          )}
          <div className="text-center md:text-left pt-2">
            <CardTitle className="text-3xl font-headline text-primary">{teacher.name}</CardTitle>
            <CardDescription className="text-lg">{teacher.email}</CardDescription>
            {teacher.subjectsTaught && teacher.subjectsTaught.length > 0 && (
                &lt;div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start"&gt;
                    {teacher.subjectsTaught.map(subject => (
                        <Badge key={subject} variant="secondary" className="text-sm">{subject}</Badge>
                    ))}
                &lt;/div&gt;
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <ProfileItem icon={Phone} label="Phone Number" value={teacher.phoneNumber} />
        <ProfileItem icon={Home} label="Address" value={teacher.address} />
        <ProfileItem icon={CalendarPlus} label="Year of Joining" value={teacher.yearOfJoining.toString()} />
        <ProfileItem icon={Briefcase} label="Total Years Worked" value={`${teacher.totalYearsWorked || (new Date().getFullYear() - teacher.yearOfJoining)} years`} />
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
    &lt;div className={`flex items-start space-x-3 ${className}`}&gt;
      &lt;Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" /&gt;
      &lt;div&gt;
        &lt;p className="text-sm font-medium text-muted-foreground"&gt;{label}&lt;/p&gt;
        &lt;p className="text-base text-foreground"&gt;{value}&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
