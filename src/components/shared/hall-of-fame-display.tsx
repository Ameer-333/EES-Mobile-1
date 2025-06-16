
'use client';

import type { HallOfFameItem, UserRole } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, Briefcase, Building, Edit, Crown, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const HALL_OF_FAME_COLLECTION = 'hall_of_fame_items';

interface HallOfFameDisplayProps {
  currentRole?: UserRole | null;
}

const categoryIcons: Record<HallOfFameItem['category'] | 'Founders & Visionaries', React.ElementType> = {
  'founder': Briefcase,
  'co-founder': Briefcase,
  'principal': Briefcase,
  'school-award': Award,
  'founder-award': Award,
  'student-achievement': Crown,
  'Founders & Visionaries': Briefcase,
};

const categoryTitles: Record<HallOfFameItem['category'], string> = {
    founder: 'Founders & Visionaries',
    'co-founder': 'Founders & Visionaries',
    principal: 'Leadership',
    'school-award': 'School Accolades',
    'founder-award': 'Founder Accolades',
    'student-achievement': 'Student Achievements',
}

export function HallOfFameDisplay({ currentRole }: HallOfFameDisplayProps) {
  const [items, setItems] = useState<HallOfFameItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(firestore, HALL_OF_FAME_COLLECTION), orderBy("name")); // Basic ordering
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedItems: HallOfFameItem[] = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() } as HallOfFameItem);
      });
      setItems(fetchedItems);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching Hall of Fame items:", error);
      toast({
        title: "Error Loading Hall of Fame",
        description: "Could not fetch Hall of Fame data. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading Hall of Fame...</p>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
     return (
      <div className="text-center py-10">
        <Building className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold text-primary mb-2">Hall of Fame is Empty</h1>
        <p className="text-muted-foreground mb-6">No entries have been added to the Hall of Fame yet.</p>
        {currentRole === 'Admin' && (
            <Button asChild>
                <Link href="/admin/hall-of-fame-management"><Edit className="mr-2 h-4 w-4"/>Manage Hall of Fame</Link>
            </Button>
        )}
      </div>
    );
  }

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
                  fill // Use fill for responsive images with aspect ratio
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transform transition-transform duration-500 hover:scale-105"
                  data-ai-hint={mainFounder.dataAiHint || "founder portrait"}
                  priority // Prioritize loading for LCP element
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
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transform transition-transform duration-300 group-hover:scale-105"
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
