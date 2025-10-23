import { genkit } from 'genkit';
import { gemini, googleAI } from '@genkit-ai/googleai';

const GEMINI_25_FLASH_LITE = gemini('gemini-2.5-flash-lite');

export function createAI(apiKey: string) {
  return genkit({
    model: GEMINI_25_FLASH_LITE,
    plugins: [
      googleAI({
        apiKey,
        models: [GEMINI_25_FLASH_LITE],
      }),
    ],
  });
}
