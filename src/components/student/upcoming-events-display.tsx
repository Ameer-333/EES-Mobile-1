
'use client';

import type { UpcomingEvent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarClock, MapPin } from 'lucide-react';

// Mock data for demonstration
const mockEvents: UpcomingEvent[] = [
  { id: 'e1', name: 'Annual Sports Day', date: '2024-08-15', time: '09:00 AM', day: 'Thursday', description: 'Track and field events, team games.', location: 'School Ground' },
  { id: 'e2', name: 'Science Exhibition', date: '2024-09-05', time: '10:00 AM - 04:00 PM', day: 'Thursday', description: 'Student projects showcase.', location: 'School Auditorium' },
  { id: 'e3', name: 'Parent-Teacher Meeting (Classes 9-10)', date: '2024-09-21', time: '02:00 PM - 05:00 PM', day: 'Saturday', location: 'Respective Classrooms' },
  { id: 'e4', name: 'Cultural Fest Rehearsals', date: '2024-10-01', time: '04:00 PM', day: 'Tuesday', description: 'Dance and Drama practice.', location: 'Activity Hall' },
];

interface UpcomingEventsDisplayProps {
  events?: UpcomingEvent[];
}

export function UpcomingEventsDisplay({ events = mockEvents }: UpcomingEventsDisplayProps) {
  if (!events || events.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <CalendarClock className="mr-2 h-6 w-6" /> Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No upcoming events scheduled at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
          <CalendarClock className="mr-2 h-6 w-6" /> Upcoming Events
        </CardTitle>
        <CardDescription>Stay updated with school activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-foreground">{event.name}</h3>
                <p className="text-sm text-primary">{event.day}, {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} @ {event.time}</p>
                {event.location && <p className="text-xs text-muted-foreground flex items-center mt-1"><MapPin className="h-3 w-3 mr-1"/>{event.location}</p>}
                {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
