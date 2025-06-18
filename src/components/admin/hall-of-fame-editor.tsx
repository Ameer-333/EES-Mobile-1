
'use client';

import { useState, useEffect } from 'react';
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
import { PlusCircle, Trash2, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, addDoc, deleteDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { getHallOfFameCollectionPath, getHallOfFameItemDocPath } from '@/lib/firestore-paths';

const hallOfFameItemSchema = z.object({
  id: z.string().optional(),
  category: z.enum(['founder', 'co-founder', 'principal', 'school-award', 'founder-award', 'student-achievement'], { required_error: "Category is required."}),
  name: z.string().min(3, "Name must be at least 3 characters."),
  title: z.string().optional().or(z.literal('')),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.string().url("Must be a valid URL for the image. Use https://placehold.co for placeholders."),
  year: z.string().optional().or(z.literal('')),
  dataAiHint: z.string().optional().or(z.literal('')),
});

const hallOfFameSchema = z.object({
  items: z.array(hallOfFameItemSchema),
});

type HallOfFameFormValues = z.infer<typeof hallOfFameSchema>;

export function HallOfFameEditor() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [initialItemIds, setInitialItemIds] = useState<Set<string>>(new Set());

  const form = useForm<HallOfFameFormValues>({
    resolver: zodResolver(hallOfFameSchema),
    defaultValues: {
      items: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const hallOfFamePath = getHallOfFameCollectionPath();
        const q = query(collection(firestore, hallOfFamePath), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const fetchedItems: HallOfFameItem[] = [];
        const ids = new Set<string>();
        querySnapshot.forEach((docSnap) => {
          fetchedItems.push({ id: docSnap.id, ...docSnap.data() } as HallOfFameItem);
          ids.add(docSnap.id);
        });
        replace(fetchedItems);
        setInitialItemIds(ids);
      } catch (error) {
        console.error("Error fetching Hall of Fame items:", error);
        toast({
          title: "Error Loading Data",
          description: "Could not fetch Hall of Fame items from Firestore.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };
    fetchItems();
  }, [toast, replace]);


  async function onSubmit(values: HallOfFameFormValues) {
    setIsSubmitting(true);
    const batch = writeBatch(firestore);
    const hallOfFamePath = getHallOfFameCollectionPath();

    try {
      for (const item of values.items) {
        const { id, ...itemData } = item;
        const cleanItemData = {
            ...itemData,
            title: itemData.title || null,
            year: itemData.year || null,
            dataAiHint: itemData.dataAiHint || null,
        };

        if (id) {
          const itemDocPath = getHallOfFameItemDocPath(id);
          const docRef = doc(firestore, itemDocPath);
          batch.set(docRef, cleanItemData, { merge: true });
        } else {
          const docRef = doc(collection(firestore, hallOfFamePath));
          batch.set(docRef, { ...cleanItemData });
        }
      }

      const currentItemIdsInForm = new Set(values.items.map(item => item.id).filter(Boolean));
      initialItemIds.forEach(id => {
        if (!currentItemIdsInForm.has(id)) {
            const itemDocPath = getHallOfFameItemDocPath(id);
            const docRef = doc(firestore, itemDocPath);
            batch.delete(docRef);
        }
      });
      
      await batch.commit();

      toast({
        title: 'Hall of Fame Updated',
        description: 'The Hall of Fame content has been successfully saved to Firestore.',
      });
      
      // Re-fetch to update form state including new IDs and reflect deletions
      const q = query(collection(firestore, hallOfFamePath), orderBy("name"));
      const querySnapshot = await getDocs(q);
      const fetchedItems: HallOfFameItem[] = [];
      const newIds = new Set<string>();
      querySnapshot.forEach((docSnap) => {
        fetchedItems.push({ id: docSnap.id, ...docSnap.data() } as HallOfFameItem);
        newIds.add(docSnap.id);
      });
      replace(fetchedItems);
      setInitialItemIds(newIds);

    } catch (error) {
        console.error("Error saving Hall of Fame to Firestore:", error);
        toast({
            title: "Save Failed",
            description: "Could not save Hall of Fame content to Firestore.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const addNewItem = () => {
    append({
      category: 'founder',
      name: '',
      title: '',
      description: '',
      imageUrl: 'https://placehold.co/300x200.png',
      year: new Date().getFullYear().toString(),
      dataAiHint: 'new item placeholder'
    });
  };

  const removeItem = (index: number) => {
    remove(index);
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading Hall of Fame Editor...</p>
        </div>
    );
  }

  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Edit Hall of Fame</CardTitle>
        <CardDescription>Manage the content displayed in the Excellent Hall of Fame. Data is saved to Firestore.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <Card key={field.id || `new-${index}`} className="p-4 border-dashed">
                  <CardHeader className="p-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive/80">
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
                        <FormItem><FormLabel>Sub-Title (Optional)</FormLabel><FormControl><Input placeholder="e.g., Principal, Co-Founder" {...itemField} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.description`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Brief description..." {...itemField} rows={3}/></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.imageUrl`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://placehold.co/300x200.png" {...itemField} /></FormControl><FormMessage /></FormItem>
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
              <Button type="button" variant="outline" onClick={addNewItem} disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoading}>
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

    