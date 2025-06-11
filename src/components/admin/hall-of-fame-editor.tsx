
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { HallOfFameItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, Save, Loader2, ImageUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const hallOfFameItemSchema = z.object({
  id: z.string().optional(), // Optional for new items
  category: z.enum(['founder', 'co-founder', 'principal', 'school-award', 'founder-award', 'student-achievement'], { required_error: "Category is required."}),
  name: z.string().min(3, "Name must be at least 3 characters."),
  title: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.string().url("Must be a valid URL for the image."),
  year: z.string().optional(), // Keep as string for input, can be coerced later
  dataAiHint: z.string().optional(),
});

const hallOfFameSchema = z.object({
  items: z.array(hallOfFameItemSchema),
});

type HallOfFameFormValues = z.infer<typeof hallOfFameSchema>;

// Mock data for initial state
const initialMockItems: HallOfFameItem[] = [
  { id: 'hof1', category: 'founder', name: 'Dr. Aramane Manjunath', title: 'Founder & Chairman', description: 'Visionary leader who established EES Education with a dream to provide quality education for all.', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'founder portrait elderly man' },
  { id: 'hof2', category: 'co-founder', name: 'Mrs. Sumitra Devi', title: 'Co-Founder & Director', description: 'Instrumental in shaping the curriculum and fostering a nurturing learning environment.', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'co-founder portrait woman' },
];

interface HallOfFameEditorProps {
  initialData?: HallOfFameItem[];
  onSave?: (data: HallOfFameFormValues) => Promise<void>;
}

export function HallOfFameEditor({ initialData = initialMockItems, onSave }: HallOfFameEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<HallOfFameFormValues>({
    resolver: zodResolver(hallOfFameSchema),
    defaultValues: {
      items: initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  async function onSubmit(values: HallOfFameFormValues) {
    setIsSubmitting(true);
    console.log('Saving Hall of Fame Data:', values);
    // Simulate API call
    if (onSave) {
        await onSave(values);
    } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    toast({
      title: 'Hall of Fame Updated',
      description: 'The Hall of Fame content has been successfully saved.',
    });
    setIsSubmitting(false);
  }

  const addNewItem = () => {
    append({
      category: 'founder', // Default category
      name: '',
      title: '',
      description: '',
      imageUrl: 'https://placehold.co/300x200.png', // Default placeholder
      year: new Date().getFullYear().toString(),
      dataAiHint: 'new item placeholder'
    });
  };

  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Edit Hall of Fame</CardTitle>
        <CardDescription>Manage the content displayed in the Excellent Hall of Fame.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 border-dashed">
                  <CardHeader className="p-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-2">
                    <FormField control={form.control} name={`items.${index}.category`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Category</FormLabel>
                        <Select onValueChange={itemField.onChange} defaultValue={itemField.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="founder">Founder</SelectItem>
                                <SelectItem value="co-founder">Co-Founder</SelectItem>
                                <SelectItem value="principal">Principal</SelectItem>
                                <SelectItem value="school-award">School Award</SelectItem>
                                <SelectItem value="founder-award">Founder Award</SelectItem>
                                <SelectItem value="student-achievement">Student Achievement</SelectItem>
                            </SelectContent>
                        </Select><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.name`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Name / Title of Award</FormLabel><FormControl><Input placeholder="e.g., Dr. John Doe or Best School Trophy" {...itemField} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.title`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Sub-Title (Optional, e.g., Principal, Co-Founder)</FormLabel><FormControl><Input placeholder="e.g., Principal" {...itemField} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.description`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Brief description..." {...itemField} rows={3}/></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.imageUrl`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...itemField} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name={`items.${index}.dataAiHint`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Image AI Hint (Optional, 1-2 keywords)</FormLabel><FormControl><Input placeholder="e.g. person award" {...itemField} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.year`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Year (Optional)</FormLabel><FormControl><Input placeholder="e.g., 2023" {...itemField} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <Button type="button" variant="outline" onClick={addNewItem}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save All Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

