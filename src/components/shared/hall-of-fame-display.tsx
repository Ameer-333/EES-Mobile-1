
'use client';

import type { HallOfFameItem, UserRole } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, Briefcase, Building, Edit, Crown } from 'lucide-react'; // Changed UserTie to Briefcase
import { Button } from '../ui/button';
import Link from 'next/link';

// Mock data for demonstration - typically passed as prop
const defaultMockItems: HallOfFameItem[] = [
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

const categoryIcons: Record<HallOfFameItem['category'] | 'Founders & Visionaries', React.ElementType> = {
  'founder': Briefcase, // Changed from UserTie
  'co-founder': Briefcase, // Changed from UserTie
  'principal': Briefcase, // Changed from UserTie
  'school-award': Award,
  'founder-award': Award,
  'student-achievement': Crown,
  'Founders & Visionaries': Briefcase, // Changed from UserTie
};

const categoryTitles: Record<HallOfFameItem['category'], string> = {
    founder: 'Founders & Visionaries', 
    'co-founder': 'Founders & Visionaries', 
    principal: 'Leadership',
    'school-award': 'School Accolades',
    'founder-award': 'Founder Accolades',
    'student-achievement': 'Student Achievements',
}

export function HallOfFameDisplay({ items = defaultMockItems, currentRole }: HallOfFameDisplayProps) {
  
  const mainFounder = items.find(item => item.category === 'founder');
  const otherItems = mainFounder ? items.filter(item => item.id !== mainFounder.id) : items;

  const groupedOtherItems = otherItems.reduce((acc, item) => {
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
      <div className="text-center mb-12 pt-4">
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

      {mainFounder && (
        <section className="mb-16 p-6 md:p-10 bg-gradient-to-br from-primary/5 via-background to-accent/10 rounded-xl shadow-2xl border border-primary/20">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-shrink-0 w-full max-w-xs lg:max-w-sm lg:w-2/5 mx-auto">
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl border-4 border-primary/30">
                <Image
                  src={mainFounder.imageUrl}
                  alt={mainFounder.name}
                  layout="fill"
                  objectFit="cover"
                  className="transform transition-transform duration-500 hover:scale-105"
                  data-ai-hint={mainFounder.dataAiHint || "founder portrait"}
                />
              </div>
            </div>
            <div className="lg:w-3/5 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-3 tracking-tight">
                {mainFounder.name}
              </h2>
              <p className="text-xl font-semibold text-muted-foreground mb-6">
                {mainFounder.title || 'Founder & Visionary Leader'}
              </p>
              <blockquote className="text-lg text-foreground/80 leading-relaxed border-l-4 border-accent pl-6 italic">
                {mainFounder.description && mainFounder.description.length > 50 ? mainFounder.description : 
                "With unwavering dedication and a pioneering spirit, " + mainFounder.name + " laid the foundation for EES Education, transforming a bold vision into a beacon of knowledge and excellence. Their tireless efforts continue to inspire generations, shaping futures and fostering a community where every student can achieve their highest potential."}
              </blockquote>
            </div>
          </div>
        </section>
      )}

      {orderedCategories.map(categoryKey => {
        let itemsToDisplayThisCategory: HallOfFameItem[] = [];
        let currentDisplayTitle = "";
        let IconToUse: React.ElementType = Award; 
        let sectionKey = categoryKey; 

        if (categoryKey === 'founder') {
          const otherFoundersList = groupedOtherItems['founder'] || [];
          const coFoundersList = groupedOtherItems['co-founder'] || [];
          itemsToDisplayThisCategory = [...otherFoundersList, ...coFoundersList];
          currentDisplayTitle = "Founders & Visionaries";
          IconToUse = categoryIcons['Founders & Visionaries'];
          sectionKey = 'founders-visionaries'; 
          if (itemsToDisplayThisCategory.length === 0) return null;
        } else if (categoryKey === 'co-founder') {
          if (groupedOtherItems['founder'] && groupedOtherItems['founder'].length > 0) {
            return null; 
          }
          itemsToDisplayThisCategory = groupedOtherItems['co-founder'] || [];
          currentDisplayTitle = "Founders & Visionaries"; 
          IconToUse = categoryIcons['Founders & Visionaries'];
          sectionKey = 'co-founders-standalone';
          if (itemsToDisplayThisCategory.length === 0) return null;
        } else {
          itemsToDisplayThisCategory = groupedOtherItems[categoryKey] || [];
          currentDisplayTitle = categoryTitles[categoryKey] || categoryKey;
          IconToUse = categoryIcons[categoryKey] || Award;
          if (itemsToDisplayThisCategory.length === 0) return null;
        }
        
        return (
            <section key={sectionKey} className="mb-12">
                <h2 className="text-3xl font-semibold text-primary mb-8 flex items-center border-b-2 border-primary/20 pb-3">
                    {IconToUse && <IconToUse className="mr-3 h-7 w-7"/>} {currentDisplayTitle}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                    {itemsToDisplayThisCategory.map(item => (
                        <Card key={item.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col group bg-card rounded-lg border border-border/50 hover:border-primary/30">
                            <div className="relative w-full h-60 md:h-64"> 
                                <Image 
                                    src={item.imageUrl} 
                                    alt={item.name} 
                                    layout="fill" 
                                    objectFit="cover"
                                    className="transform transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={item.dataAiHint || 'hall of fame image'}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <CardHeader className="flex-grow pb-2 pt-4 px-4">
                                <CardTitle className="text-xl text-primary group-hover:text-primary/90 transition-colors">{item.name}</CardTitle>
                                {item.title && <CardDescription className="text-md text-muted-foreground">{item.title}</CardDescription>}
                                {item.year && <CardDescription className="text-sm text-muted-foreground">Year: {item.year}</CardDescription>}
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-sm text-foreground/80 line-clamp-3 group-hover:line-clamp-none transition-all">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        );
      })}
    </div>
  );
}
