'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { askQuestion } from '@/ai/flows/ai-doubt-assistance';
import type { AskQuestionInput, AskQuestionOutput } from '@/ai/flows/ai-doubt-assistance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  question: z.string().min(5, { message: 'Question must be at least 5 characters long.' }),
});

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
}

export function AiDoubtAssistance() {
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const userInput: AskQuestionInput = { question: values.question };

    setChatHistory(prev => [...prev, { id: Date.now().toString(), sender: 'user', content: values.question }]);
    form.reset();

    try {
      const result: AskQuestionOutput = await askQuestion(userInput);
      setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', content: result.answer }]);
    } catch (error) {
      console.error('Error getting AI assistance:', error);
      setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-lg rounded-lg flex flex-col max-h-[70vh]">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">AI Doubt Assistance</CardTitle>
            <CardDescription>Ask any questions related to your coursework.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
        <ScrollArea className="flex-grow p-6">
          <div className="space-y-4">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end space-x-2",
                  msg.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.sender === 'ai' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg shadow",
                    msg.sender === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-muted-foreground rounded-bl-none"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                 {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && chatHistory[chatHistory.length -1]?.sender === 'user' && (
                <div className="flex items-end space-x-2 justify-start">
                     <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-[70%] p-3 rounded-lg shadow bg-muted text-muted-foreground rounded-bl-none">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
             )}
          </div>
        </ScrollArea>
        <div className="p-6 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start space-x-2">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Textarea
                        placeholder="Type your question here..."
                        className="resize-none min-h-[60px]"
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg" className="h-[60px]">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
