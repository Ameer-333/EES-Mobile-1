
'use client';

import type { Scholarship } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Award, DollarSign, CalendarClock, Info, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScholarshipInfoDisplayProps {
  scholarships?: Scholarship[];
  studentName?: string;
  isDedicatedPage?: boolean; // To control layout variations if needed
}

const mockScholarships: Scholarship[] = [
  { id: 's1', organisationName: 'National Talent Search Examination (NTSE)', amount: 1250, yearReceived: 2023, details: 'Awarded for academic excellence at the national level. This prestigious scholarship recognizes outstanding talent and provides monthly financial support.' },
  { id: 's2', organisationName: 'State Merit Scholarship', amount: 5000, yearReceived: 2022, details: 'For topping the district in 8th grade examinations. A one-time award celebrating academic achievement within the state.' },
  { id: 's3', organisationName: 'Tech Innovators Grant', amount: 25000, yearReceived: 2023, details: 'Awarded for a promising project in the inter-school science and technology fair. Supports further development of the innovation.' },
];


export function ScholarshipInfoDisplay({ 
  scholarships = mockScholarships, 
  studentName = "Student",
  isDedicatedPage = false
}: ScholarshipInfoDisplayProps) {
  const hasScholarships = scholarships && scholarships.length > 0;

  if (!hasScholarships && isDedicatedPage) {
    return (
      <div className="text-center py-10">
        <Award className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold text-primary mb-2">No Scholarships Recorded</h1>
        <p className="text-muted-foreground">There are currently no scholarship details available for {studentName}.</p>
      </div>
    );
  }
  
  if (!hasScholarships) {
     return (
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary flex items-center">
                <Award className="mr-2 h-6 w-6" /> Scholarship Information
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">No scholarships recorded for {studentName}.</p>
        </CardContent>
      </Card>
    );
  }

  if (!isDedicatedPage) { // Compact view for dashboard/profile
    return (
      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <Award className="mr-2 h-6 w-6" /> My Scholarships
          </CardTitle>
          <CardDescription>Summary of scholarships awarded to {studentName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[150px] pr-3 -mr-3">
            <div className="space-y-3">
              {scholarships.map((scholarship) => (
                <div key={scholarship.id} className="p-3 border rounded-md bg-muted/30 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{scholarship.organisationName} ({scholarship.yearReceived})</span>
                    <span className="font-semibold text-green-600">₹{scholarship.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  // Dedicated page view - more detailed cards
  return (
    <div className="space-y-6">
      {scholarships.map((scholarship) => (
        <Card key={scholarship.id} className="shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out overflow-hidden border border-primary/10 rounded-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="text-2xl font-headline text-primary mb-1">{scholarship.organisationName}</CardTitle>
                <Badge variant="secondary" className="flex items-center w-fit">
                  <CalendarClock className="mr-1.5 h-4 w-4 text-muted-foreground" />
                  Awarded: {scholarship.yearReceived}
                </Badge>
              </div>
              <div className="mt-2 sm:mt-0 text-right">
                <p className="text-3xl font-bold text-green-600 flex items-center justify-end">
                  <Banknote className="h-8 w-8 mr-2 opacity-80" />
                  ₹{scholarship.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {scholarship.organisationName.includes('NTSE') ? 'per month' : 'one-time grant'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {scholarship.details && (
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Reason / Details:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{scholarship.details}</p>
                </div>
              </div>
            )}
            {!scholarship.details && <p className="text-sm text-muted-foreground italic">No specific details provided for this scholarship.</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
