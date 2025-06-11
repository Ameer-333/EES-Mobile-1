
import { TeacherMessagingInterface } from '@/components/teacher/teacher-messaging-interface';

export default function TeacherMessagingPage() {
  return (
    <div className="container mx-auto p-0 md:p-4 space-y-6">
      <h1 className="text-3xl font-headline font-bold">Send Messages</h1>
      <TeacherMessagingInterface />
    </div>
  );
}
