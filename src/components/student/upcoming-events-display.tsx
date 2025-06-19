
'use client';

import type { UpcomingEvent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin, Info, Image as ImageIcon } from 'lucide-react';
import NextImageComponent from 'next/image'; // Renamed to avoid conflict with Lucide icon
import { Button } from '@/components/ui/button';

const mockEvents: UpcomingEvent[] = [
  { id: 'e1', name: 'Annual Sports Day Extravaganza', date: '2024-08-15', time: '09:00 AM', day: 'Thursday', note: 'Join us for a day full of exciting track and field events, team games, and friendly competition. Refreshments will be available. Don\'t forget your sports gear!', location: 'Main School Ground', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'sports day' },
  { id: 'e2', name: 'Innovations: Annual Science Exhibition', date: '2024-09-05', time: '10:00 AM - 04:00 PM', day: 'Thursday', note: 'Explore amazing student projects and scientific discoveries. Interactive exhibits and guest speakers. A day of learning and fun for all!', location: 'School Auditorium &amp; Science Labs', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'science exhibition' },
  { id: 'e3', name: 'Parent-Teacher Connect (Classes 9-10)', date: '2024-09-21', time: '02:00 PM - 05:00 PM', day: 'Saturday', note: 'An opportunity to discuss your child\'s progress with their teachers. Please book your slots in advance via the school portal.', location: 'Respective Classrooms', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'meeting classroom' },
  { id: 'e4', name: 'Cultural Fest Rehearsals Kick-off', date: '2024-10-01', time: '04:00 PM onwards', day: 'Tuesday', note: 'First rehearsal for all participants in the upcoming Cultural Fest. Dance, drama, music, and more! Bring your enthusiasm.', location: 'Activity Hall &amp; Music Room', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'cultural event' },
];

interface UpcomingEventsDisplayProps {
  events?: UpcomingEvent[];
}

export function UpcomingEventsDisplay({ events = mockEvents }: UpcomingEventsDisplayProps) {
  if (!events || events.length === 0) {
    return (
      <Card className="shadow-lg col-span-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <CalendarDays className="mr-3 h-7 w-7" /> No Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg">Check back soon for new events and activities!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {events.map((event) => {
        const imgSrc = event.imageUrl || 'https://placehold.co/600x400.png';
        const useRegularImg = imgSrc.includes('placehold.co');
        return (
        <Card key={event.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col group bg-card rounded-lg border border-border/50 hover:border-primary/30">
          <div className="relative w-full h-56 md:h-60 bg-muted/30">
            {useRegularImg ? (
                &lt;img
                    src={imgSrc}
                    alt={event.name}
                    className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={event.dataAiHint || 'event image placeholder'}
                /&gt;
            ) : (
                <NextImageComponent
                    src={imgSrc}
                    alt={event.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={event.dataAiHint || 'event image'}
                />
            )}
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-xl lg:text-2xl font-bold text-primary group-hover:text-primary/90 transition-colors leading-tight">
              {event.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 flex-grow flex flex-col justify-between">
            <div>
              <div className="flex items-center text-sm text-muted-foreground mb-1.5">
                <CalendarDays className="h-4 w-4 mr-2 text-primary/80" />
                &lt;span&gt;{event.day}, {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}&lt;/span&gt;
              </div>
              <div className="flex items-center text-sm text-muted-foreground mb-1.5">
                <Clock className="h-4 w-4 mr-2 text-primary/80" />
                &lt;span&gt;{event.time}&lt;/span&gt;
              </div>
              {event.location && (
                &lt;div className="flex items-center text-sm text-muted-foreground mb-3"&gt;
                  &lt;MapPin className="h-4 w-4 mr-2 text-primary/80" /&gt;
                  &lt;span&gt;{event.location}&lt;/span&gt;
                &lt;/div&gt;
              )}
              {event.note && (
                &lt;p className="text-sm text-foreground/80 mt-2 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all"&gt;
                  {event.note}
                &lt;/p&gt;
              )}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                View Details
                &lt;Info className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100"/&gt;
            </Button>
          </CardContent>
        </Card>
      )})}
    </div>
  );
}

