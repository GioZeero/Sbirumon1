import { config } from 'dotenv';
config();

// Since googleAI plugin is removed, ensure this flow does not implicitly depend on it
// or that you have an alternative model provider configured if AI functionality is still desired.
import '@/ai/flows/ai-opponent-attack-decision.ts';
