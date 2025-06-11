import { StudentProfileCard } from '@/components/student/student-profile-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function StudentProfilePage() {
  return (
    <div className="container mx-auto p-0 md:p-4 space-y-6">
       <h1 className="text-3xl font-headline font-bold">My Profile</h1>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
            <Card className="shadow-lg">
                <CardHeader className="items-center text-center">
                    <Image 
                        src="https://placehold.co/150x150.png" 
                        alt="Student Profile Picture" 
                        width={150} 
                        height={150} 
                        className="rounded-full border-4 border-primary shadow-md"
                        data-ai-hint="student portrait" 
                    />
                </CardHeader>
                <CardContent className="text-center">
                    <CardTitle className="text-xl font-headline text-primary mt-2">Ravi Kumar</CardTitle>
                    <p className="text-muted-foreground">10th Grade - Section A</p>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <StudentProfileCard />
        </div>
       </div>
    </div>
  );
}
