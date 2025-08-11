'use server';

import type { Fighter } from '@/types/battle';
import { randomizePlayerStats as rerollPlayerStatsInRepo, evolvePlayerCreatureWithDebuff, getPlayerProfileData, updatePlayerPersistentInventory, updatePlayerMoney } from '@/lib/fighter-repository';
import { GameBalance } from '@/config/game-balance';

export async function rerollStats(trainerName: string): Promise<{ success: boolean; message: string; updatedPlayer?: Fighter }> {
  const player = await getPlayerProfileData(trainerName);
  if (!player) {
    return { success: false, message: 'Giocatore non trovato.' };
  }
  if ((player.money ?? 0) < 1000) {
    return { success: false, message: 'Non hai abbastanza monete.' };
  }
  try {
    const playerAfterPayment = await updatePlayerMoney(trainerName, -1000);
    if (!playerAfterPayment) {
        throw new Error('Payment failed');
    }
    const result = await rerollPlayerStatsInRepo(trainerName);
    if (result.success && result.updatedPlayer) {
       return { success: true, message: result.message, updatedPlayer: result.updatedPlayer };
    } else {
       await updatePlayerMoney(trainerName, 1000); // Refund on failure
       return { success: false, message: result.message || 'Errore durante la randomizzazione.' };
    }
  } catch (error) {
    console.error('Failed to reroll stats:', error);
    await updatePlayerMoney(trainerName, 1000);
    return { success: false, message: 'Errore durante la randomizzazione delle statistiche.' };
  }
}

export async function evolveWithRemains(
  trainerName: string,
  itemToConsumeId: string
): Promise<{ success: boolean; message: string; updatedPlayer?: Fighter }> {
  try {
    const player = await getPlayerProfileData(trainerName);
    if (!player) {
      return { success: false, message: 'Giocatore non trovato.' };
    }
    if ((player.money ?? 0) < 1000) {
        return { success: false, message: 'Non hai abbastanza monete per il rito.' };
    }
     if (player.isEvolved) {
        return { success: false, message: 'Il tuo Sbirumon è già evoluto.' };
    }
    if (!player.inventory || !player.inventory[itemToConsumeId] || player.inventory[itemToConsumeId].quantity <= 0) {
        return { success: false, message: 'Non possiedi l\'oggetto necessario.' };
    }
    
    // Consume item and money first
    const playerAfterPayment = await updatePlayerMoney(trainerName, -1000);
    if (!playerAfterPayment) {
        throw new Error("Payment failed");
    }
    const playerAfterConsume = await updatePlayerPersistentInventory(trainerName, itemToConsumeId, -1);
    if (!playerAfterConsume) {
      await updatePlayerMoney(trainerName, 1000); // Refund
      throw new Error("Failed to consume item.");
    }

    if (Math.random() < GameBalance.REMAINS_EVOLVE_CHANCE) {
      const result = await evolvePlayerCreatureWithDebuff(trainerName);
      if(result) {
        return { success: true, message: `Incredibile! ${player.name} si è evoluto, ma sembra perennemente spaventato...`, updatedPlayer: result };
      } else {
        await updatePlayerMoney(trainerName, 1000); // Refund
        return { success: false, message: 'Evoluzione fallita.' };
      }
    } else {
      return { success: true, message: `Hai usato il resto, ma non è successo nulla...`, updatedPlayer: playerAfterConsume };
    }
  } catch (error) {
    console.error('Failed to evolve with remains:', error);
    return { success: false, message: 'Errore durante l\'evoluzione.' };
  }
}
