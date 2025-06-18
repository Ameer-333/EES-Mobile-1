
'use client';

import type { HallOfFameItem, UserRole } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, Briefcase, Users as UsersIconLucide, Edit, Crown, Loader2, Star, Building } from 'lucide-react'; // Renamed Users to UsersIconLucide
import { Button } from '../ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { getHallOfFameCollectionPath } from '@/lib/firestore-paths';

interface HallOfFameDisplayProps {
  currentRole?: UserRole | null;
}

const categoryIcons: Record<HallOfFameItem['category'] | 'Founders & Visionaries' | 'Leadership' | 'School Accolades' | 'Founder Accolades' | 'Student Achievements', React.ElementType> = {
  'founder': Briefcase,
  'co-founder': Briefcase,
  'principal': UsersIconLucide, 
  'school-award': Award,
  'founder-award': Star, 
  'student-achievement': Crown,
  'Founders & Visionaries': Briefcase,
  'Leadership': UsersIconLucide,
  'School Accolades': Award,
  'Founder Accolades': Star,
  'Student Achievements': Crown,
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
    const hallOfFamePath = getHallOfFameCollectionPath();
    const q = query(collection(firestore, hallOfFamePath), orderBy("name")); 
    
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
    const displayKey = categoryTitles[item.category] || item.category;
    if (!acc[displayKey]) {
      acc[displayKey] = [];
    }
    acc[displayKey].push(item);
    return acc;
  }, {} as Record<string, HallOfFameItem[]>);
  
  const displayOrder: string[] = [
    'Founders & Visionaries', 
    'Leadership', 
    'School Accolades', 
    'Founder Accolades', 
    'Student Achievements'
  ];


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading Hall of Fame...</p>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
     return (
      <div className="text-center py-16">
        <Building className="mx-auto h-20 w-20 text-muted-foreground/70 mb-6" />
        <h1 className="text-3xl font-semibold text-primary mb-3">Hall of Fame is Empty</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">No entries have been added yet. Check back soon to celebrate our school's legacy!</p>
        {currentRole === 'Admin' && (
            <Button asChild size="lg">
                <Link href="/admin/hall-of-fame-management"><Edit className="mr-2 h-5 w-5"/>Manage Hall of Fame</Link>
            </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 md:space-y-16 py-8">
      <div className="text-center mb-12 md:mb-16">
        <Building className="mx-auto text-primary h-16 w-16 md:h-20 md:w-20 mb-4" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-extrabold text-foreground tracking-tight">
          EES Excellent Hall of Fame
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
          Celebrating the remarkable individuals, achievements, and milestones that define our legacy.
        </p>
        {currentRole === 'Admin' && (
            <Button asChild size="lg" className="mt-8">
                <Link href="/admin/hall-of-fame-management"><Edit className="mr-2 h-5 w-5"/>Manage Hall of Fame</Link>
            </Button>
        )}
      </div>

      {mainFounder && (
        <section className="mb-16 md:mb-20 p-6 md:p-10 bg-gradient-to-br from-primary/5 via-background to-accent/10 rounded-xl shadow-2xl border border-primary/10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-shrink-0 w-full max-w-sm lg:max-w-md lg:w-2/5 mx-auto">
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl border-4 border-primary/20 transform transition-transform duration-500 hover:scale-105">
                <Image
                  src={mainFounder.imageUrl}
                  alt={mainFounder.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  data-ai-hint={mainFounder.dataAiHint || "founder portrait"}
                  priority 
                />
              </div>
            </div>
            <div className="lg:w-3/5 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-3 tracking-tight">
                {mainFounder.name}
              </h2>
              <p className="text-xl font-semibold text-muted-foreground mb-6">
                {mainFounder.title || 'Founder & Visionary Leader'}
              </p>
              <blockquote className="text-lg text-foreground/90 leading-relaxed border-l-4 border-accent pl-6 italic">
                {mainFounder.description && mainFounder.description.length > 50 ? mainFounder.description :
                "With unwavering dedication and a pioneering spirit, " + mainFounder.name + " laid the foundation for EES Education, transforming a bold vision into a beacon of knowledge and excellence. Their tireless efforts continue to inspire generations, shaping futures and fostering a community where every student can achieve their highest potential."}
              </blockquote>
            </div>
          </div>
        </section>
      )}
      
      {displayOrder.map(groupTitle => {
        const itemsInGroup = groupedOtherItems[groupTitle] || [];
        if (itemsInGroup.length === 0) return null;

        const IconToUse = categoryIcons[groupTitle as keyof typeof categoryIcons] || Star;

        return (
            <section key={groupTitle} className="mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8 flex items-center border-b-2 border-primary/20 pb-4">
                    <IconToUse className="mr-3 h-7 w-7 md:h-8 md:w-8 text-primary"/> {groupTitle}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 xl:gap-x-8 xl:gap-y-10">
                    {itemsInGroup.map(item => (
                        <Card key={item.id} className="card-hover-effect overflow-hidden flex flex-col group bg-card rounded-xl border border-border/60">
                            <div className="relative w-full h-60 md:h-64">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={item.dataAiHint || 'hall of fame image'}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <CardHeader className="flex-grow pb-2 pt-5 px-5">
                                <CardTitle className="text-xl font-bold text-primary group-hover:text-primary/90 transition-colors">{item.name}</CardTitle>
                                {item.title && <CardDescription className="text-md text-muted-foreground">{item.title}</CardDescription>}
                                {item.year && <CardDescription className="text-sm text-muted-foreground mt-1">Year: {item.year}</CardDescription>}
                            </CardHeader>
                            <CardContent className="px-5 pb-5">
                                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">{item.description}</p>
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

    