
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export function TeacherAssignmentView() {
  return (
    <Card className="w-full shadow-lg rounded-lg border-primary/10">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <ClipboardList className="h-7 w-7 text-primary" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">
              Teacher Assignment Management
            </CardTitle>
            <CardDescription>
              View and manage teacher assignments to classes, subjects, and programs.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-[300px] flex items-center justify-center">
        <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
          <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">
            Assignment Management Feature Coming Soon
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            This section will allow administrators to view, assign, and modify teacher responsibilities.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
