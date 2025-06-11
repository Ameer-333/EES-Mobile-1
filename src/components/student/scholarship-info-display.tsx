
'use client';

import type { Scholarship } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Award, DollarSign, Banknote } from 'lucide-react';

// Mock data for demonstration
const mockScholarships: Scholarship[] = [
  { id: 's1', organisationName: 'National Talent Search Examination (NTSE)', amount: 1250, yearReceived: 2023, details: 'Awarded for academic excellence at the national level.' },
  { id: 's2', organisationName: 'State Merit Scholarship', amount: 500, yearReceived: 2022, details: 'For topping the district in 8th grade.' },
];

interface ScholarshipInfoDisplayProps {
  scholarships?: Scholarship[];
  studentName?: string;
}

export function ScholarshipInfoDisplay({ scholarships = mockScholarships, studentName = "Ravi Kumar" }: ScholarshipInfoDisplayProps) {
  const hasScholarships = scholarships && scholarships.length > 0;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
          <Award className="mr-2 h-6 w-6" /> Scholarship Information
        </CardTitle>
        <CardDescription>Details of scholarships awarded to {studentName}.</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasScholarships ? (
          <p className="text-muted-foreground">No scholarships recorded for {studentName}.</p>
        ) : (
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-4">
              {scholarships.map((scholarship) => (
                <div key={scholarship.id} className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{scholarship.organisationName}</h3>
                      <p className="text-sm text-muted-foreground">Year: {scholarship.yearReceived}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-green-600 flex items-center justify-end">
                            <Banknote className="h-5 w-5 mr-1 text-green-500"/> 
                            ₹{scholarship.amount.toLocaleString()}{scholarship.organisationName.includes('NTSE') ? '/month' : ''}
                        </p>
                    </div>
                  </div>
                  {scholarship.details && <p className="text-xs text-muted-foreground mt-2">{scholarship.details}</p>}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
