
'use client';

import type { StudentRemark } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, User } from 'lucide-react';

// Mock data for demonstration
const mockRemarks: StudentRemark[] = [
  { id: 'r1', source: 'teacher', authorName: 'Ms. Priya Sharma', remark: 'Ravi has shown excellent improvement in English grammar this term. Keep up the great work!', date: '2024-05-15' },
  { id: 'r2', source: 'parent', authorName: 'Mr. Kumar (Parent)', remark: 'We are very happy with Ravi\'s progress. He is enjoying his science projects.', date: '2024-05-20' },
  { id: 'r3', source: 'teacher', authorName: 'Mr. Anand Singh', remark: 'Needs to focus more during math class to grasp complex concepts.', date: '2024-05-10' },
];

interface StudentRemarksDisplayProps {
  remarks?: StudentRemark[];
}

export function StudentRemarksDisplay({ remarks = mockRemarks }: StudentRemarksDisplayProps) {
  if (!remarks || remarks.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <MessageSquareText className="mr-2 h-6 w-6" /> Student Remarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No remarks available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
          <MessageSquareText className="mr-2 h-6 w-6" /> Student Remarks
        </CardTitle>
        <CardDescription>Feedback from your teachers and parents.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {remarks.map((remark) => (
              <div key={remark.id} className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <Avatar className="mt-1">
                    <AvatarImage src={remark.source === 'teacher' ? `https://placehold.co/40x40/E6E6FA/300130.png?text=${remark.authorName.charAt(0)}` : `https://placehold.co/40x40/FFF0E6/FF8C00.png?text=${remark.authorName.charAt(0)}`} alt={remark.authorName} data-ai-hint={remark.source === 'teacher' ? "teacher avatar" : "parent avatar"}/>
                    <AvatarFallback>{remark.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-foreground">{remark.authorName} <span className="text-xs text-muted-foreground">({remark.source})</span></p>
                      <p className="text-xs text-muted-foreground">{new Date(remark.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{remark.remark}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
