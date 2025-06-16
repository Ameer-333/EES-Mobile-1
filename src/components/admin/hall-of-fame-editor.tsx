
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
import { PlusCircle, Trash2, Save, Loader2, ImageUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, addDoc, deleteDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';

const HALL_OF_FAME_COLLECTION = 'hall_of_fame_items';

const hallOfFameItemSchema = z.object({
  id: z.string().optional(), // Firestore document ID
  category: z.enum(['founder', 'co-founder', 'principal', 'school-award', 'founder-award', 'student-achievement'], { required_error: "Category is required."}),
  name: z.string().min(3, "Name must be at least 3 characters."),
  title: z.string().optional().or(z.literal('')),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.string().url("Must be a valid URL for the image. Use https://placehold.co for placeholders."),
  year: z.string().optional().or(z.literal('')),
  dataAiHint: z.string().optional().or(z.literal('')),
  // createdAt: z.any().optional(), // For Firestore serverTimestamp
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
        const q = query(collection(firestore, HALL_OF_FAME_COLLECTION), orderBy("name")); // Add ordering if desired
        const querySnapshot = await getDocs(q);
        const fetchedItems: HallOfFameItem[] = [];
        const ids = new Set<string>();
        querySnapshot.forEach((doc) => {
          fetchedItems.push({ id: doc.id, ...doc.data() } as HallOfFameItem);
          ids.add(doc.id);
        });
        replace(fetchedItems); // Use replace to set the form field array
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
    const currentItemIds = new Set<string>();

    try {
      for (const item of values.items) {
        const { id, ...itemData } = item;
        // Ensure empty optional fields are not sent as empty strings if Firestore expects them to be absent or null
        const cleanItemData = {
            ...itemData,
            title: itemData.title || null, // Store null if empty
            year: itemData.year || null,
            dataAiHint: itemData.dataAiHint || null,
        };

        if (id) { // Existing item
          const docRef = doc(firestore, HALL_OF_FAME_COLLECTION, id);
          batch.set(docRef, cleanItemData, { merge: true }); // Use set with merge to update or create if ID exists but doc was deleted
          currentItemIds.add(id);
        } else { // New item
          const docRef = doc(collection(firestore, HALL_OF_FAME_COLLECTION)); // Auto-generate ID
          batch.set(docRef, { ...cleanItemData /*, createdAt: serverTimestamp() */ });
          // currentItemIds.add(docRef.id); // Not strictly needed for deletion logic if only tracking initial IDs
        }
      }

      // Delete items that were removed from the form
      initialItemIds.forEach(id => {
        let foundInForm = false;
        for (const formItem of values.items) {
            if (formItem.id === id) {
                foundInForm = true;
                break;
            }
        }
        if (!foundInForm) {
            const docRef = doc(firestore, HALL_OF_FAME_COLLECTION, id);
            batch.delete(docRef);
        }
      });
      
      await batch.commit();

      // Re-fetch or update initialItemIds based on new state
      const newInitialIds = new Set<string>();
      values.items.forEach(item => { if(item.id) newInitialIds.add(item.id) });
      // New items added in this batch won't have their IDs in `values.items` yet.
      // A full re-fetch after save (like in useEffect) is more robust for updating initialItemIds and form.
      // For now, we'll rely on the onSnapshot if it were implemented or manual refresh for perfect ID sync of new items.

      toast({
        title: 'Hall of Fame Updated',
        description: 'The Hall of Fame content has been successfully saved to Firestore.',
      });
       // Manually trigger a re-fetch to get new IDs and sync state
        const q = query(collection(firestore, HALL_OF_FAME_COLLECTION), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const fetchedItems: HallOfFameItem[] = [];
        const ids = new Set<string>();
        querySnapshot.forEach((doc) => {
          fetchedItems.push({ id: doc.id, ...doc.data() } as HallOfFameItem);
          ids.add(doc.id);
        });
        replace(fetchedItems);
        setInitialItemIds(ids);

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
    const itemToRemove = fields[index];
    // If itemToRemove.id exists, it means it's an item from Firestore.
    // Deletion from Firestore will be handled by the onSubmit logic by comparing initialItemIds and currentItemIds.
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
