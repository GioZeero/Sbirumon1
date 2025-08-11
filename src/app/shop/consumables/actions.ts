'use server';

import type { Fighter } from '@/types/battle';
import { getPlayerProfileData, updatePlayerMoney, updatePlayerPersistentInventory } from '@/lib/fighter-repository';
import { ALL_CONSUMABLES } from '@/config/consumables';

export async function buyConsumable(trainerName: string, itemId: string, cost: number): Promise<{ success: boolean; message: string; updatedPlayer?: Fighter; }> {
    const player = await getPlayerProfileData(trainerName);
    if (!player) {
        return { success: false, message: 'Impossibile trovare i dati del giocatore.' };
    }
    if (player.money === undefined || player.money < cost) {
        return { success: false, message: 'Fondi insufficienti.' };
    }
    const itemToBuy = ALL_CONSUMABLES.find(item => item.id === itemId);
    if (!itemToBuy) {
        return { success: false, message: 'Oggetto non trovato.' };
    }
    try {
        const playerAfterPurchase = await updatePlayerMoney(trainerName, -cost);
        if (!playerAfterPurchase) throw new Error("Failed to update money");
        const finalPlayerState = await updatePlayerPersistentInventory(trainerName, itemId, 1);
        if (!finalPlayerState) {
            await updatePlayerMoney(trainerName, cost);
            throw new Error("Failed to add item to inventory after purchase.");
        }
        return { 
            success: true, 
            message: `Hai acquistato: ${itemToBuy.name}!`,
            updatedPlayer: finalPlayerState
        };
    } catch (error) {
        console.error("Error buying consumable:", error);
        return { success: false, message: 'Si è verificato un errore durante l\'acquisto.' };
    }
}

export async function sellConsumable(trainerName: string, itemId: string, price: number): Promise<{ success: boolean; message: string; updatedPlayer?: Fighter; }> {
    const player = await getPlayerProfileData(trainerName);
    if (!player) {
        return { success: false, message: 'Impossibile trovare i dati del giocatore.' };
    }
    const itemInInventory = player.inventory?.[itemId];
    if (!itemInInventory || itemInInventory.quantity <= 0) {
        return { success: false, message: 'Non possiedi questo oggetto.' };
    }
    const itemToSell = ALL_CONSUMABLES.find(item => item.id === itemId);
    if (!itemToSell) {
        return { success: false, message: 'Oggetto non trovato.' };
    }
    try {
        const playerAfterSale = await updatePlayerMoney(trainerName, price);
        if (!playerAfterSale) throw new Error("Failed to update money");
        const finalPlayerState = await updatePlayerPersistentInventory(trainerName, itemId, -1, playerAfterSale);
        if (!finalPlayerState) {
            await updatePlayerMoney(trainerName, -price);
            throw new Error("Failed to remove item from inventory after sale.");
        }
        return {
            success: true,
            message: `Hai venduto: ${itemToSell.name}!`,
            updatedPlayer: finalPlayerState
        };
    } catch (error) {
        console.error("Error selling consumable:", error);
        return { success: false, message: 'Si è verificato un errore durante la vendita.' };
    }
}
