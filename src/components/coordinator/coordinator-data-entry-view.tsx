
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit3 } from "lucide-react";

export function CoordinatorDataEntryView() {
  // This component will be enhanced to allow data entry for any student.
  // For now, it's a placeholder.
  return (
    <Card className="w-full shadow-lg rounded-lg border-primary/10">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Edit3 className="h-7 w-7 text-primary" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">
              Global Data Entry Module
            </CardTitle>
            <CardDescription>
              This section will allow coordinators to enter marks and attendance for any student.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-[300px] flex items-center justify-center">
        <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
          <Edit3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">
            System-Wide Data Entry Feature Coming Soon
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Coordinators will be able to select any student and input their academic data here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
