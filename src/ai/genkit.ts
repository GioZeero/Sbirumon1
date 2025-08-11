import {genkit} from 'genkit';
// import {googleAI} from '@genkit-ai/googleai'; // Removed Google AI

export const ai = genkit({
  plugins: [
    // googleAI() // Removed Google AI plugin
  ],
  // model: 'googleai/gemini-2.0-flash', // Removed default Gemini model
});
