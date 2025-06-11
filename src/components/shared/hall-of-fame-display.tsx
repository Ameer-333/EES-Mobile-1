
'use client';

import type { HallOfFameItem, UserRole } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, UserTie, Building, Edit, Crown } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

// Mock data for demonstration
const mockHallOfFameItems: HallOfFameItem[] = [
  { id: 'hof1', category: 'founder', name: 'Dr. Aramane Manjunath', title: 'Founder & Chairman', description: 'Visionary leader who established EES Education with a dream to provide quality education for all.', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'founder portrait elderly man' },
  { id: 'hof2', category: 'co-founder', name: 'Mrs. Sumitra Devi', title: 'Co-Founder & Director', description: 'Instrumental in shaping the curriculum and fostering a nurturing learning environment.', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'co-founder portrait woman' },
  { id: 'hof3', category: 'principal', name: 'Mr. Ramesh Gowda', title: 'Principal', description: 'Leading the school with dedication and commitment to academic excellence since 2010.', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'principal portrait man' },
  { id: 'hof4', category: 'school-award', name: 'Best School Award - District Level', year: 2022, description: 'Recognized for outstanding academic performance and infrastructure.', imageUrl: 'https://placehold.co/400x250.png', dataAiHint: 'award trophy' },
  { id: 'hof5', category: 'founder-award', name: 'Lifetime Achievement in Education', year: 2020, description: 'Awarded to Dr. Aramane Manjunath for his contributions to the field of education.', imageUrl: 'https://placehold.co/400x250.png', dataAiHint: 'certificate award' },
  { id: 'hof6', category: 'student-achievement', name: 'National Robotics Champions', year: 2023, description: 'Our students won the National Level Robotics Competition.', imageUrl: 'https://placehold.co/400x250.png', dataAiHint: 'students robotics' },
];

interface HallOfFameDisplayProps {
  items?: HallOfFameItem[];
  currentRole?: UserRole | null;
}

const categoryIcons = {
  founder: UserTie,
  'co-founder': UserTie,
  principal: UserTie,
  'school-award': Award,
  'founder-award': Award,
  'student-achievement': Crown,
};

const categoryTitles = {
    founder: 'Founders & Visionaries',
    'co-founder': 'Founders & Visionaries',
    principal: 'Leadership',
    'school-award': 'School Accolades',
    'founder-award': 'Founder Accolades',
    'student-achievement': 'Student Achievements',
}

export function HallOfFameDisplay({ items = mockHallOfFameItems, currentRole }: HallOfFameDisplayProps) {
  
  const groupedItems = items.reduce((acc, item) => {
    const key = item.category;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<HallOfFameItem['category'], HallOfFameItem[]>);

  const orderedCategories: HallOfFameItem['category'][] = ['founder', 'co-founder', 'principal', 'school-award', 'founder-award', 'student-achievement'];


  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center">
          <Building className="mr-3 h-10 w-10 md:h-12 md:w-12" /> EES Excellent Hall of Fame
        </h1>
        <p className="text-lg text-muted-foreground mt-2">Celebrating our legacy and achievements.</p>
        {currentRole === 'Admin' && (
            <Button asChild className="mt-6">
                <Link href="/admin/hall-of-fame-management"><Edit className="mr-2 h-4 w-4"/>Manage Hall of Fame</Link>
            </Button>
        )}
      </div>

      {orderedCategories.map(categoryKey => {
        const categoryItems = groupedItems[categoryKey];
        if (!categoryItems || categoryItems.length === 0) return null;
        
        const CategoryIcon = categoryIcons[categoryKey] || Award;
        const displayTitle = categoryTitles[categoryKey] || categoryKey.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        // Special handling to show Founders and Co-founders under one heading
        if (categoryKey === 'co-founder' && groupedItems['founder']?.length > 0) return null;
        let actualItems = categoryItems;
        let finalTitle = displayTitle;

        if (categoryKey === 'founder' && groupedItems['co-founder']?.length > 0) {
            actualItems = [...(groupedItems['founder'] || []), ...(groupedItems['co-founder'] || [])];
            finalTitle = "Founders & Visionaries";
        }


        return (
            <section key={categoryKey} className="mb-12">
                <h2 className="text-3xl font-semibold text-primary mb-6 flex items-center">
                    <CategoryIcon className="mr-3 h-7 w-7"/> {finalTitle}
                </h2>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${['school-award', 'founder-award', 'student-achievement'].includes(categoryKey) ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6`}>
                    {actualItems.map(item => (
                        <Card key={item.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                            <div className="relative w-full h-60 md:h-72">
                                <Image 
                                    src={item.imageUrl} 
                                    alt={item.name} 
                                    layout="fill" 
                                    objectFit="cover"
                                    data-ai-hint={item.dataAiHint || 'hall of fame image'}
                                />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl text-primary">{item.name}</CardTitle>
                                {item.title && <CardDescription className="text-base">{item.title}</CardDescription>}
                                {item.year && <CardDescription className="text-sm">Year: {item.year}</CardDescription>}
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        )
      })}
    </div>
  );
}
