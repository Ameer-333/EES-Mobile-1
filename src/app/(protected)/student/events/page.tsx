
'use client';

import { UpcomingEventsDisplay } from '@/components/student/upcoming-events-display';
import { CalendarSearch } from 'lucide-react';

// Mock data could be fetched here in a real app
// For now, UpcomingEventsDisplay uses its own internal mock data if none is passed

export default function StudentEventsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-primary/20 pb-4">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary flex items-center">
          <CalendarSearch className="mr-3 h-8 w-8 md:h-10 md:w-10" /> Upcoming Events & Activities
        </h1>
        <p className="text-muted-foreground mt-2 sm:mt-0 text-sm sm:text-base">
          Stay informed about all school happenings.
        </p>
      </div>
      
      {/* UpcomingEventsDisplay will render the cards.
          In a real app, you might fetch data here and pass it as a prop. */}
      <UpcomingEventsDisplay />

    </div>
  );
}
