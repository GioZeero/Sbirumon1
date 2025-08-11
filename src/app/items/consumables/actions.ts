'use server';

import { getPlayerProfileData, updatePlayerPersistentInventory, applyStatBoostToPlayer, applyLevelUpToPlayer, applyGrowthBoostToPlayer, evolvePlayerCreatureWithDebuff, setDidUseConsumable } from '@/lib/fighter-repository';
import { ALL_CONSUMABLES } from '@/config/consumables';
import type { Fighter } from '@/types/battle';
import { GameBalance } from '@/config/game-balance';

export async function useConsumableOutOfBattle(trainerName: string, itemId: string): Promise<{ success: boolean; message: string; updatedPlayer?: Fighter; }> {
    const player = await getPlayerProfileData(trainerName);
    if (!player) {
        return { success: false, message: 'Impossibile trovare i dati del giocatore.' };
    }
    const itemInInventory = player.inventory?.[itemId];
    if (!itemInInventory || itemInInventory.quantity <= 0) {
        return { success: false, message: 'Non possiedi questo oggetto.' };
    }
    const itemDefinition = ALL_CONSUMABLES.find(item => item.id === itemId);
    if (!itemDefinition) {
        return { success: false, message: 'Oggetto non trovato.' };
    }
    if (!['Integratore Statistiche', 'Speciale', 'Cura'].includes(itemDefinition.category)) {
        return { success: false, message: 'Questo oggetto non può essere usato in questo menu.' };
    }
    if (itemDefinition.effect.type === 'heal' && player.currentHealth >= player.maxHealth) {
         return { success: false, message: 'La salute è già al massimo.' };
    }
    if (itemDefinition.effect.type === 'capture' || itemDefinition.category === 'Resti' || itemDefinition.category === 'Potenziamenti Illegali') {
        return { success: false, message: 'Questo oggetto può essere usato solo in contesti specifici.' };
    }

    try {
        await setDidUseConsumable(trainerName);

        let playerAfterEffect: Fighter | null = player;
        const effect = itemDefinition.effect;
        let message = `Hai usato: ${itemDefinition.name}!`;

        if (effect.type === 'stat_boost') {
            playerAfterEffect = await applyStatBoostToPlayer(trainerName, effect.stat, effect.percentage);
        } else if (effect.type === 'level_up') {
            playerAfterEffect = await applyLevelUpToPlayer(trainerName, effect.levels);
        } else if (effect.type === 'growth_boost') {
            playerAfterEffect = await applyGrowthBoostToPlayer(trainerName, effect.stat);
        } else if (effect.type === 'heal') {
            let healAmount = 0;
            if (effect.amount) {
                healAmount = effect.amount;
            } else if (effect.percentage) {
                healAmount = Math.round(player.maxHealth * effect.percentage);
            }
            playerAfterEffect.currentHealth = Math.min(player.maxHealth, player.currentHealth + healAmount);
        }

        if (!playerAfterEffect) {
            throw new Error("Failed to apply item effect.");
        }
        const finalPlayerState = await updatePlayerPersistentInventory(trainerName, itemId, -1, playerAfterEffect);
         if (!finalPlayerState) {
            throw new Error("Failed to update inventory after applying effect.");
        }
        return {
            success: true,
            message,
            updatedPlayer: finalPlayerState
        };
    } catch (error) {
        console.error("Error using consumable out of battle:", error);
        return { success: false, message: 'Si è verificato un errore durante l\'uso dell\'oggetto.' };
    }
}
