
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input'; // For subject line if needed
import { Mail, MessageCircle, Send, Loader2, Smartphone, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Mock data for demonstration
const mockRecipients: { id: string, name: string, role: UserRole, details: string }[] = [
  { id: 'S12345', name: 'Ravi Kumar', role: 'Student', details: '10th Grade - A' },
  { id: 'S67890', name: 'Sunita Reddy', role: 'Student', details: '9th Grade - B' },
  { id: 'P12345', name: 'Parent of Ravi Kumar', role: 'Student', details: 'Contact via Student' }, // Representing Parent
  { id: 'group:10A', name: 'All Students - 10A', role: 'Student', details: 'Group Message' },
];

const messageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient selection is required.'),
  // subject: z.string().optional(), // Optional for in-app, might be useful for email
  messageContent: z.string().min(10, 'Message must be at least 10 characters.').max(1000, 'Message cannot exceed 1000 characters.'),
  messageMethod: z.enum(['app', 'sms', 'email'], { required_error: 'Please select a message method.'}),
});

type MessageFormValues = z.infer<typeof messageSchema>;

export function TeacherMessagingInterface() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      recipientId: '',
      messageContent: '',
      messageMethod: 'app',
    },
  });

  async function onSubmit(values: MessageFormValues) {
    setIsSubmitting(true);
    // Simulate API call to send message
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Sending message:', values);
    
    const recipient = mockRecipients.find(r => r.id === values.recipientId);
    toast({
      title: 'Message Sent (Simulated)',
      description: `Your message to ${recipient?.name || 'the recipient'} via ${values.messageMethod} has been queued.`,
    });
    // form.reset(); // Comment out to allow multiple sends for demo
    setIsSubmitting(false);
  }

  const selectedMethod = form.watch('messageMethod');

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary flex items-center">
          <MessageCircle className="mr-2 h-7 w-7" /> Send Message
        </CardTitle>
        <CardDescription>Communicate with students or their parents.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="recipientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Recipient / Group</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a recipient or group..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockRecipients.map(recipient => (
                        <SelectItem key={recipient.id} value={recipient.id}>
                          {recipient.name} ({recipient.role} - {recipient.details})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="messageMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Send Via</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="app" id="app" />
                        </FormControl>
                        <FormLabel htmlFor="app" className="font-normal flex items-center"><MessageCircle className="h-4 w-4 mr-1.5"/>In-App Message</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="sms" id="sms" />
                        </FormControl>
                        <FormLabel htmlFor="sms" className="font-normal flex items-center"><Smartphone className="h-4 w-4 mr-1.5"/>SMS (Placeholder)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="email" id="email" />
                        </FormControl>
                        <FormLabel htmlFor="email" className="font-normal flex items-center"><Mail className="h-4 w-4 mr-1.5"/>Email (Placeholder)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedMethod === 'email' && (
                 <FormField
                    control={form.control}
                    name="subject" // Assuming you add subject to schema if using email
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Subject (for Email)</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter email subject" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            <FormField
              control={form.control}
              name="messageContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your message here..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <p className="text-xs text-muted-foreground">
              {selectedMethod === 'sms' && "SMS functionality is a placeholder and not active."}
              {selectedMethod === 'email' && "Email functionality is a placeholder and not active."}
            </p>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Message
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
