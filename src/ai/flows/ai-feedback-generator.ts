// src/ai/flows/ai-feedback-generator.ts
'use server';

/**
 * @fileOverview AI tool to auto-generate feedback comments for teachers based on student performance.
 *
 * - generateFeedback - A function that generates feedback based on student performance.
 * - GenerateFeedbackInput - The input type for the generateFeedback function.
 * - GenerateFeedbackOutput - The return type for the generateFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFeedbackInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  subject: z.string().describe('The subject for which feedback is being generated (e.g., English, Math).'),
  performanceDetails: z.string().describe('Detailed performance data for the student in the specified subject.'),
});

export type GenerateFeedbackInput = z.infer<typeof GenerateFeedbackInputSchema>;

const GenerateFeedbackOutputSchema = z.object({
  feedbackComment: z.string().describe('The generated feedback comment for the student.'),
});

export type GenerateFeedbackOutput = z.infer<typeof GenerateFeedbackOutputSchema>;

export async function generateFeedback(input: GenerateFeedbackInput): Promise<GenerateFeedbackOutput> {
  return generateFeedbackFlow(input);
}

const generateFeedbackPrompt = ai.definePrompt({
  name: 'generateFeedbackPrompt',
  input: {schema: GenerateFeedbackInputSchema},
  output: {schema: GenerateFeedbackOutputSchema},
  prompt: `You are an AI assistant that helps teachers by generating personalized feedback comments for students based on their performance in a specific subject.

  Student Name: {{studentName}}
  Subject: {{subject}}
  Performance Details: {{performanceDetails}}

  Based on the provided information, generate a concise and helpful feedback comment for the student.
  The feedback should be encouraging and constructive, highlighting both strengths and areas for improvement.
  Ensure the feedback is tailored to the specific subject and performance details provided, determining the most relevant and appropriate points to address.
`,
});

const generateFeedbackFlow = ai.defineFlow(
  {
    name: 'generateFeedbackFlow',
    inputSchema: GenerateFeedbackInputSchema,
    outputSchema: GenerateFeedbackOutputSchema,
  },
  async input => {
    const {output} = await generateFeedbackPrompt(input);
    return output!;
  }
);
