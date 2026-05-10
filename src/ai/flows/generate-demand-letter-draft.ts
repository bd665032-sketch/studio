'use server';
/**
 * @fileOverview A Genkit flow for generating a draft of a formal demand letter.
 *
 * - generateDemandLetterDraft - A function that handles the demand letter generation process.
 * - GenerateDemandLetterDraftInput - The input type for the generateDemandLetterDraft function.
 * - GenerateDemandLetterDraftOutput - The return type for the generateDemandLetterDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const GenerateDemandLetterDraftInputSchema = z.object({
  letterDate: z.string().describe('The date of the letter, in YYYY-MM-DD format.'),
  toCompany: z.string().describe('The name of the recipient company.'),
  subject: z.string().describe('The subject line of the demand letter.'),
  body: z.string().describe('The main purpose or content of the demand letter.'),
  mobileNumber: z.string().describe('The mobile number for contact details.'),
  emailAddress: z.string().describe('The email address for contact details.'),
  language: z.enum(['en', 'bn']).describe('The desired language of the letter: "en" for English, "bn" for Bengali.'),
});
export type GenerateDemandLetterDraftInput = z.infer<typeof GenerateDemandLetterDraftInputSchema>;

// Output Schema
const GenerateDemandLetterDraftOutputSchema = z.object({
  letterContent: z.string().describe('The professionally worded demand letter.'),
});
export type GenerateDemandLetterDraftOutput = z.infer<typeof GenerateDemandLetterDraftOutputSchema>;

// Wrapper function
export async function generateDemandLetterDraft(
  input: GenerateDemandLetterDraftInput
): Promise<GenerateDemandLetterDraftOutput> {
  return generateDemandLetterDraftFlow(input);
}

// Prompt definition
const prompt = ai.definePrompt({
  name: 'demandLetterDraftPrompt',
  input: {schema: GenerateDemandLetterDraftInputSchema},
  output: {schema: GenerateDemandLetterDraftOutputSchema},
  prompt: `You are an AI assistant specialized in drafting formal demand letters for "MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION".
Your task is to compose a professional and clear demand letter based on the provided details.
The letter should be formatted as a standard business letter.

Draft the letter in {{{language}}} (use Bengali for 'bn', English for 'en').

Here are the details for the letter:

Date: {{{letterDate}}}

To: {{{toCompany}}}

Subject: {{{subject}}}

Body/Main Purpose: {{{body}}}

Contact Information:
Mobile: {{{mobileNumber}}}
Email: {{{emailAddress}}}

Please ensure the tone is formal and professional. The output should only contain the letter content, without any introductory or concluding remarks from you.
The letter should start directly with the date.
`
});

// Flow definition
const generateDemandLetterDraftFlow = ai.defineFlow(
  {
    name: 'generateDemandLetterDraftFlow',
    inputSchema: GenerateDemandLetterDraftInputSchema,
    outputSchema: GenerateDemandLetterDraftOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
