import { LoginForm } from '@/components/auth/login-form';
import { LogoIcon } from '@/components/icons/logo-icon';

export default function StudentLoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-accent/30 p-4">
      <div className="mb-8 text-center">
        <LogoIcon className="h-20 w-20 text-primary mx-auto mb-2" />
        <h1 className="text-4xl font-headline font-bold text-primary">EES Education</h1>
        <p className="text-muted-foreground">Excellent English School</p>
      </div>
      <LoginForm role="Student" />
    </div>
  );
}
