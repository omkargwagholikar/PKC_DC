// components/SolutionForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from './FileUpload';
import { ACCEPTED_FILE_TYPES, PROGRAMMING_LANGUAGES, SolutionFormData } from './types';
import { toast } from '@/hooks/use-toast';
// import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  language: z.string().min(1, 'Please select a programming language'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  files: z.array(z.any()).refine((files) => 
    files.some(file => file.type === 'code'), 
    'You must upload at least one code file'
  )
});

interface SolutionFormProps {
  problemId: string;
  onSubmit: (data: SolutionFormData) => Promise<void>;
}

export const SolutionForm: React.FC<SolutionFormProps> = ({  onSubmit }) => {
  const form = useForm<SolutionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: '',
      description: '',
      files: []
    }
  });

  const handleSubmit = async (data: SolutionFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      toast({
        title: 'Success',
        description: 'Your solution has been submitted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit solution. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Your Solution</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programming Language</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROGRAMMING_LANGUAGES.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
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
              name="files"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-6">
                    <FileUpload
                      label="Solution Code"
                      acceptedTypes={ACCEPTED_FILE_TYPES.code}
                      files={field.value.filter(f => f.type === 'code')}
                      onChange={files => {
                        const otherFiles = field.value.filter(f => f.type !== 'code');
                        field.onChange([...otherFiles, ...files]);
                      }}
                      maxFiles={5}
                      type="code"
                    />

                    <FileUpload
                      label="Documentation"
                      acceptedTypes={ACCEPTED_FILE_TYPES.documentation}
                      files={field.value.filter(f => f.type === 'documentation')}
                      onChange={files => {
                        const otherFiles = field.value.filter(f => f.type !== 'documentation');
                        field.onChange([...otherFiles, ...files]);
                      }}
                      type="documentation"
                    />

                    <FileUpload
                      label="Additional Files"
                      acceptedTypes={ACCEPTED_FILE_TYPES.additional}
                      files={field.value.filter(f => f.type === 'additional')}
                      onChange={files => {
                        const otherFiles = field.value.filter(f => f.type !== 'additional');
                        field.onChange([...otherFiles, ...files]);
                      }}
                      maxFiles={5}
                      type="additional"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solution Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your solution approach, implementation details, and any assumptions made..."
                      className="min-h-[150px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Submitting...' : 'Submit Solution'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};