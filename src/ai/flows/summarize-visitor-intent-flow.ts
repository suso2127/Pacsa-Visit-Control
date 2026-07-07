'use server';
/**
 * @fileOverview A Genkit flow for summarizing a visitor's intent.
 *
 * - summarizeVisitorIntent - A function that summarizes a visitor's declared purpose.
 * - SummarizeVisitorIntentInput - The input type for the summarizeVisitorIntent function.
 * - SummarizeVisitorIntentOutput - The return type for the summarizeVisitorIntent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeVisitorIntentInputSchema = z.object({
  purpose: z
    .string()
    .describe("The visitor's declared purpose of visit in free-text form."),
});
export type SummarizeVisitorIntentInput = z.infer<
  typeof SummarizeVisitorIntentInputSchema
>;

const SummarizeVisitorIntentOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the visitor's intent."),
  category: z
    .string()
    .describe(
      'A category for the visitor\'s intent (e.g., "Delivery", "Meeting", "Social Visit", "Maintenance", "Other").'
    ),
});
export type SummarizeVisitorIntentOutput = z.infer<
  typeof SummarizeVisitorIntentOutputSchema
>;

export async function summarizeVisitorIntent(
  input: SummarizeVisitorIntentInput
): Promise<SummarizeVisitorIntentOutput> {
  return summarizeVisitorIntentFlow(input);
}

const summarizeVisitorIntentPrompt = ai.definePrompt({
  name: 'summarizeVisitorIntentPrompt',
  input: {schema: SummarizeVisitorIntentInputSchema},
  output: {schema: SummarizeVisitorIntentOutputSchema},
  prompt: `You are an AI assistant specialized in visitor management for residential properties. Your task is to analyze a visitor's declared purpose of visit and provide a concise summary along with a categorization of their intent.

Visitor's declared purpose: {{{purpose}}}

Please provide a summary and a category for this visit. Possible categories include: "Delivery", "Meeting", "Social Visit", "Maintenance", "Other".`,
});

const summarizeVisitorIntentFlow = ai.defineFlow(
  {
    name: 'summarizeVisitorIntentFlow',
    inputSchema: SummarizeVisitorIntentInputSchema,
    outputSchema: SummarizeVisitorIntentOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeVisitorIntentPrompt(input);
    if (!output) {
      throw new Error('Failed to summarize visitor intent.');
    }
    return output;
  }
);
