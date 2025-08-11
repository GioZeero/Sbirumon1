'use server';

import type { AttackRarity, Fighter } from '@/types/battle';
import { getPlayerProfileData, updatePlayerMoney, addUnlockedAttack } from '@/lib/fighter-repository';
import { getAllGameAttacks } from '@/config/fighters';

const BOOK_COSTS: Record<AttackRarity, number> = {
    Common: 50,
    Rare: 100,
    Epic: 250,
    Legendary: 1000,
};

export async function buyMoveBook(trainerName: string, rarity: AttackRarity): Promise<{ success: boolean; message: string; updatedPlayer?: Fighter; }> {
    const player = await getPlayerProfileData(trainerName);
    if (!player) {
        return { success: false, message: 'Impossibile trovare i dati del giocatore.' };
    }
    const cost = BOOK_COSTS[rarity];
    if (player.money === undefined || player.money < cost) {
        return { success: false, message: 'Fondi insufficienti.' };
    }
    const allGameAttacks = getAllGameAttacks();
    const playerUnlockedIds = new Set(player.unlockedAttackIds || player.attacks.map(a => a.id));
    const potentialNewMoves = allGameAttacks.filter(
        attack => attack.rarity === rarity && !playerUnlockedIds.has(attack.id)
    );
    if (potentialNewMoves.length === 0) {
        return { success: true, message: `Hai già sbloccato tutte le mosse di rarità ${rarity}!` };
    }
    const newMoveToUnlock = potentialNewMoves[Math.floor(Math.random() * potentialNewMoves.length)];
    try {
        const playerAfterPurchase = await updatePlayerMoney(trainerName, -cost);
        if (!playerAfterPurchase) throw new Error("Failed to update money");
        const finalPlayerState = await addUnlockedAttack(trainerName, newMoveToUnlock.id);
        if (!finalPlayerState) throw new Error("Failed to add unlocked attack");
        return { 
            success: true, 
            message: `Hai sbloccato una nuova mossa: ${newMoveToUnlock.name}!`,
            updatedPlayer: finalPlayerState
        };
    } catch (error) {
        console.error("Error buying move book:", error);
        return { success: false, message: 'Si è verificato un errore durante l\'acquisto.' };
    }
}
