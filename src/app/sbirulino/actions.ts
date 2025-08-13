
'use server';

import { updatePlayerNameInRepository, getPlayerProfileData, savePlayer } from '@/lib/fighter-repository';
import { GameBalance } from '@/config/game-balance';
import { ALL_CONSUMABLES } from '@/config/consumables';
import type { ConsumableItem } from '@/types/items';

export async function updateCreatureName(trainerName: string, newName: string): Promise<{ success: boolean; message: string }> {
  if (!newName || newName.trim().length < 3 || newName.trim().length > 15) {
    return { success: false, message: 'Il nome deve avere tra 3 e 15 caratteri.' };
  }
  try {
    await updatePlayerNameInRepository(trainerName, newName.trim());
    return { success: true, message: 'Nome aggiornato con successo!' };
  } catch (error) {
    console.error('Failed to update creature name:', error);
    return { success: false, message: 'Errore durante l\'aggiornamento del nome.' };
  }
}

export async function sacrificeCreature(trainerName: string): Promise<{ success: boolean; message: string; droppedItem?: ConsumableItem | null }> {
    const player = await getPlayerProfileData(trainerName);
    if (!player) {
        return { success: false, message: 'Giocatore non trovato.' };
    }

    if (player.suicideCount === undefined) {
        player.suicideCount = 0;
    }
    player.suicideCount++;
    
    let droppedItemId: string | null = null;
    let droppedItem: ConsumableItem | null = null;

    if (Math.random() < GameBalance.REMAINS_DROP_CHANCE) {
        switch (player.archetype) {
            case 'Special': droppedItemId = 'piuma'; break;
            case 'Physical': droppedItemId = 'guscio_di_tartaruga'; break;
            case 'Balanced': droppedItemId = 'dente'; break;
        }
    }

    if (droppedItemId) {
        const itemDef = ALL_CONSUMABLES.find(item => item.id === droppedItemId);
        if (itemDef) {
            droppedItem = itemDef;
            if (!player.inventory) player.inventory = {};
            
            if (player.inventory[droppedItemId]) {
                player.inventory[droppedItemId].quantity++;
            } else {
                player.inventory[droppedItemId] = { item: itemDef, quantity: 1 };
            }
        }
    }
    
    // Mark as defeated to trigger new creature selection flow
    player.currentHealth = 0;
    player.defeatedBy = 'sacrificio';

    await savePlayer(trainerName, player);

    return { success: true, message: `${player.name} si è sacrificato.`, droppedItem };
}
