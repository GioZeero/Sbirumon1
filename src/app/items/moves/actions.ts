'use server';

import type { Attack, AttackRarity, Fighter } from '@/types/battle';
import { getPlayerProfileData, updateFighterMovesInRepository } from '@/lib/fighter-repository';
import { revalidatePath } from 'next/cache';
import { TentennamentoAttack } from '@/config/fighters';

type RarityCounts = { [key in AttackRarity]: number };

export async function updateSbirulinoMoves(
  trainerName: string,
  newAttacks: Attack[]
): Promise<{ success: boolean; message: string }> {
  
  const player = await getPlayerProfileData(trainerName);
  if (!player) {
      return { success: false, message: "Impossibile trovare i dati del giocatore." };
  }

  const maxMoves = player.isEvolved ? 4 : 3;

  const actualAttacks = newAttacks.filter(attack => attack.id !== TentennamentoAttack.id);

  if (actualAttacks.length > maxMoves) {
      return { success: false, message: `Un combattente non può avere più di ${maxMoves} mosse reali.`};
  }
  if (actualAttacks.length === 0) {
      return { success: false, message: "Un combattente deve avere almeno 1 mossa reale."};
  }

  // Rarity constraint for non-evolved fighters with 3 moves
  if (!player.isEvolved && actualAttacks.length === 3) {
    const counts: RarityCounts = { 'Common': 0, 'Rare': 0, 'Epic': 0, 'Legendary': 0 };
    actualAttacks.forEach(attack => {
      if (attack.rarity) {
        counts[attack.rarity]++;
      }
    });
    if (!(counts['Common'] === 1 && counts['Rare'] === 1 && counts['Epic'] === 1)) {
      return { success: false, message: "Con 3 mosse equipaggiate, devono essere una Comune, una Rara e una Epica." };
    }
  }

  try {
    await updateFighterMovesInRepository(trainerName, newAttacks);
    
    return { success: true, message: 'Mosse aggiornate con successo!' };
  } catch (error) {
    console.error('Failed to update Sbirulino moves:', error);
    return { success: false, message: 'Errore durante il salvataggio delle mosse.' };
  }
}
