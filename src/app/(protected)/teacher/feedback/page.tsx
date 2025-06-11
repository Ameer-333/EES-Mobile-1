import { AiFeedbackGenerator } from '@/components/teacher/ai-feedback-generator';

export default function TeacherFeedbackPage() {
  return (
    <div className="container mx-auto p-0 md:p-4 space-y-6">
      <h1 className="text-3xl font-headline font-bold">AI Feedback Generator</h1>
      <AiFeedbackGenerator />
    </div>
  );
}
