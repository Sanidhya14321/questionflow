"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ASSESSMENT_CATEGORIES } from "@/lib/constants";
import type { AssessmentCategory } from "@/lib/types";
import { PlusCircle, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const questionSchema = z.object({
  questionText: z.string().min(10, "Question text must be at least 10 characters."),
  options: z.array(z.string().min(1, "Option cannot be empty.")).min(2, "Must have at least 2 options.").max(5, "Cannot have more than 5 options."),
  correctAnswer: z.string().min(1, "Correct answer must be selected."),
  type: z.enum(["multiple-choice", "true-false"]),
});

const addAssessmentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  category: z.enum(ASSESSMENT_CATEGORIES as [AssessmentCategory, ...AssessmentCategory[]], {
    error: "Please select a valid category.",
  }),
  description: z.string().min(20, "Description must be at least 20 characters."),
  durationMinutes: z.number().int().positive().optional(),
  questions: z.array(questionSchema).min(1, "At least one question is required."),
});

type AddAssessmentFormValues = z.infer<typeof addAssessmentSchema>;

async function createAssessmentAction(data: AddAssessmentFormValues) {
  const payload = {
    ...data,
    questions: data.questions.map((question, index) => ({
      ...question,
      id: `q-${index + 1}`,
    })),
  };

  const response = await fetch("/api/assessments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.message || "Failed to save assessment. Please try again.");
  }

  return { success: true, message: "Assessment created successfully." };
}


export function AddAssessmentForm() {
  const { toast } = useToast();
  const form = useForm<AddAssessmentFormValues>({
    resolver: zodResolver(addAssessmentSchema),
    defaultValues: {
      title: "",
      category: undefined,
      description: "",
      questions: [{ questionText: "", options: ["", ""], correctAnswer: "", type: "multiple-choice" }],
    },
  });

  const watchedQuestions = useWatch({ control: form.control, name: "questions" });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  async function onSubmit(data: AddAssessmentFormValues) {
    try {
      const response = await createAssessmentAction(data);
      if (response.success) {
        toast({
          title: "Success!",
          description: response.message,
        });
        form.reset();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create assessment.",
          variant: "destructive",
        });
      }
    } catch (error) {
       toast({
        title: "Submission Error",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.5 }}>
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Create New Assessment</CardTitle>
          <CardDescription>Fill in the details below to add a new assessment to the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Assessment Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Advanced JavaScript Concepts" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {ASSESSMENT_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Duration (Minutes, Optional)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 30" {...field} value={field.value ?? ""} onChange={event => field.onChange(event.target.value === "" ? undefined : +event.target.value)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Description</FormLabel>
                    <FormControl><Textarea placeholder="Provide a brief overview of the assessment..." {...field} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h3 className="text-xl font-headline font-semibold mb-4">Questions</h3>
                {fields.map((field, index) => (
                  <motion.div 
                    key={field.id} 
                    className="p-6 border rounded-lg mb-6 bg-card-foreground/5 relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <FormLabel className="text-md font-semibold block mb-2">Question {index + 1}</FormLabel>
                    <FormField
                      control={form.control}
                      name={`questions.${index}.questionText`}
                      render={({ field: qField }) => (
                        <FormItem className="mb-3">
                          <FormLabel>Question Text</FormLabel>
                          <FormControl><Textarea placeholder="Enter the question" {...qField} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`questions.${index}.type`}
                      render={({ field: typeField }) => (
                        <FormItem className="mb-3">
                          <FormLabel>Question Type</FormLabel>
                           <Select 
                              onValueChange={(value) => {
                                typeField.onChange(value as "multiple-choice" | "true-false");
                                if (value === "true-false") {
                                  form.setValue(`questions.${index}.options`, ["True", "False"]);
                                  form.setValue(`questions.${index}.correctAnswer`, "True"); // Default
                                } else {
                                  // Reset to default for multiple choice if previously true-false
                                  if (form.getValues(`questions.${index}.options`).join(',') === "True,False") {
                                    form.setValue(`questions.${index}.options`, ["", ""]);
                                    form.setValue(`questions.${index}.correctAnswer`, "");
                                  }
                                }
                              }} 
                              value={typeField.value}
                            >
                            <FormControl><SelectTrigger><SelectValue placeholder="Select question type" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchedQuestions[index]?.type === "multiple-choice" && (
                       <div className="mb-3">
                          <FormLabel>Options</FormLabel>
                          {form.getValues(`questions.${index}.options`).map((_, optIndex) => (
                            <FormField
                              key={`${field.id}-option-${optIndex}`}
                              control={form.control}
                              name={`questions.${index}.options.${optIndex}`}
                              render={({ field: optField }) => (
                                <FormItem className="flex items-center gap-2 mb-1">
                                  <FormControl><Input aria-label={`Question ${index + 1} option ${optIndex + 1}`} placeholder={`Option ${optIndex + 1}`} {...optField} /></FormControl>
                                   {form.getValues(`questions.${index}.options`).length > 2 && (
                                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove option ${optIndex + 1}`} onClick={() => {
                                      const currentOptions = form.getValues(`questions.${index}.options`);
                                      currentOptions.splice(optIndex, 1);
                                      form.setValue(`questions.${index}.options`, currentOptions);
                                    }}>
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  )}
                                </FormItem>
                              )}
                            />
                          ))}
                          {form.getValues(`questions.${index}.options`).length < 5 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => {
                                const currentOptions = form.getValues(`questions.${index}.options`);
                                form.setValue(`questions.${index}.options`, [...currentOptions, ""]);
                              }} className="mt-1">
                              <PlusCircle className="w-4 h-4 mr-1" /> Add Option
                            </Button>
                          )}
                        </div>
                    )}

                    <FormField
                      control={form.control}
                      name={`questions.${index}.correctAnswer`}
                      render={({ field: caField }) => (
                        <FormItem>
                          <FormLabel>Correct Answer</FormLabel>
                           <Select onValueChange={caField.onChange} defaultValue={caField.value} value={caField.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select correct answer" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {form.getValues(`questions.${index}.options`).map((opt, optIdx) => (
                                opt && <SelectItem key={`${field.id}-correct-${optIdx}`} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="sm" disabled={fields.length === 1} onClick={() => remove(index)} className="absolute top-4 right-4">
                      <Trash2 className="w-4 h-4 mr-1" /> Remove Question
                    </Button>
                  </motion.div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ questionText: "", options: ["", ""], correctAnswer: "", type: "multiple-choice" })} className="mt-4">
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Question
                </Button>
              </div>

              <Button type="submit" size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/80 text-primary-foreground" disabled={form.formState.isSubmitting}>
                <Save className="w-5 h-5 mr-2" /> 
                {form.formState.isSubmitting ? "Saving..." : "Save Assessment"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
