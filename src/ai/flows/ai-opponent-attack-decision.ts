
// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Determines the computer-controlled opponent's next attack using AI.
 *
 * - decideAttack - A function that determines the AI opponent's next attack.
 * - DecideAttackInput - The input type for the decideAttack function.
 * - DecideAttackOutput - The return type for the decideAttack function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BattleStateSchema = z.object({
  playerHealth: z.number().describe('The player fighter health.'),
  opponentHealth: z.number().describe('The opponent fighter health.'),
  playerStatusEffects: z.array(z.string()).describe('The player fighter status effects.'),
  opponentStatusEffects: z.array(z.string()).describe('The opponent fighter status effects.'),
  availableAttacks: z.array(z.string()).describe('The opponent fighter available attacks.'),
});

const DecideAttackInputSchema = z.object({
  battleState: BattleStateSchema.describe('The current state of the battle.'),
});
export type DecideAttackInput = z.infer<typeof DecideAttackInputSchema>;

const DecideAttackOutputSchema = z.object({
  attack: z.string().describe('The name of the attack the opponent should use.'),
});
export type DecideAttackOutput = z.infer<typeof DecideAttackOutputSchema>;

export async function decideAttack(input: DecideAttackInput): Promise<DecideAttackOutput> {
  return decideAttackFlow(input);
}

const decideAttackPrompt = ai.definePrompt({
  name: 'decideAttackPrompt',
  input: {schema: DecideAttackInputSchema},
  output: {schema: DecideAttackOutputSchema},
  prompt: `You are an expert battle strategist for a Pokemon-like battle game. Given the current battle state, you must decide which attack the computer-controlled opponent should use.

Current Battle State:
Player Health: {{{battleState.playerHealth}}}
Opponent Health: {{{battleState.opponentHealth}}}
Player Status Effects: {{#each battleState.playerStatusEffects}}{{{this}}}, {{/each}}
Opponent Status Effects: {{#each battleState.opponentStatusEffects}}{{{this}}}, {{/each}}
Available Attacks: {{#each battleState.availableAttacks}}{{{this}}}, {{/each}}

Consider the following when making your decision:
- The goal is to defeat the player.
- Choose the attack that will do the most damage to the player, considering their health and status effects.
- If the opponent's health is low, prioritize attacks that have a high chance of success.

Based on this analysis, which attack should the opponent use? Return your answer as a JSON object.
`,
});

const decideAttackFlow = ai.defineFlow(
  {
    name: 'decideAttackFlow',
    inputSchema: DecideAttackInputSchema,
    outputSchema: DecideAttackOutputSchema,
  },
  async input => {
    const {output} = await decideAttackPrompt(input);
    return output!;
  }
);

