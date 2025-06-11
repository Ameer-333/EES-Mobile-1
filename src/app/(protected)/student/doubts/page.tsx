import { AiDoubtAssistance } from '@/components/student/ai-doubt-assistance';

export default function StudentDoubtsPage() {
  return (
    <div className="container mx-auto p-0 md:p-4 h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex flex-col">
      <h1 className="text-3xl font-headline font-bold mb-6">AI Doubt Assistance</h1>
      <div className="flex-grow">
        <AiDoubtAssistance />
      </div>
    </div>
  );
}
