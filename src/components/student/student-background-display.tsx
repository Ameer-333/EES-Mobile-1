
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info } from 'lucide-react';

// Mock data for demonstration
const mockBackgroundInfo: string = "Ravi comes from a supportive family background. His father is an engineer and his mother is a homemaker. He has one younger sibling. Ravi enjoys playing cricket and is an active member of the school's science club. He aspires to become a software developer.";

interface StudentBackgroundDisplayProps {
  backgroundInfo?: string;
}

export function StudentBackgroundDisplay({ backgroundInfo = mockBackgroundInfo }: StudentBackgroundDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
          <Info className="mr-2 h-6 w-6" /> Student Background
        </CardTitle>
        <CardDescription>Additional information about the student.</CardDescription>
      </CardHeader>
      <CardContent>
        {backgroundInfo ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{backgroundInfo}</p>
        ) : (
          <p className="text-muted-foreground">No background information available.</p>
        )}
      </CardContent>
    </Card>
  );
}
