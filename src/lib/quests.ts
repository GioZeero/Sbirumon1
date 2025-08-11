
'use server';

import type { Fighter } from "@/types/battle";
import type { Quest, QuestId, QuestState, QuestDbData, QuestGiver } from "@/types/quests";
import { getAllGameAttacks } from "@/config/fighters";
import { ALL_CONSUMABLES } from "@/config/consumables";
import { getPlayerProfileData, savePlayer, setPlayerCreature } from "./fighter-repository";
import { Book, Skull, Wand2, Store, Users, type LucideIcon } from "lucide-react";
import { COVO_CONFIG } from "@/config/locations";


// --- Quest Generation Functions ---

function generateGranMaestroQuest(unlockedAttackIds: string[]): QuestDbData {
  const allMoves = getAllGameAttacks();
  const availableMoves = allMoves.filter(move => unlockedAttackIds.includes(move.id) && move.rarity !== 'Legendary');
  
  const randomMove = availableMoves.length > 0 
    ? availableMoves[Math.floor(Math.random() * availableMoves.length)] 
    : allMoves.find(m => m.id === 'graffio')!; // Fallback

  return {
    id: 'gran_maestro_quest',
    title: 'Studio Approfondito',
    description: `Il Gran Maestro è interessato alla mossa "${randomMove.name}". Se gliela porti, ti ricompenserà con 1000 monete, ma la tua creatura la dimenticherà per sempre.`,
    giver: 'Gran Maestro',
    reward: 1000,
    isCompleted: false,
    requiredMoveId: randomMove.id,
    requiredMoveName: randomMove.name,
  };
}

function generateSorcererQuest(): QuestDbData {
  const requiredStats = 131;
  return {
    id: 'sorcerer_quest',
    title: 'Essenza Vitale',
    description: `Lo Stregone ha bisogno dell'essenza di una creatura di livello 5 con una somma totale di statistiche di almeno ${requiredStats}. In cambio del sacrificio, riceverai 1000 monete e potrai iniziare una nuova avventura con un altro Sbirulino.`,
    giver: 'Stregone',
    reward: 1000,
    isCompleted: false,
    requiredSacrificeTotalStats: requiredStats,
  };
}

function generateMasterSorcererQuest(): QuestDbData {
  const remains = ALL_CONSUMABLES.filter(c => c.category === 'Resti');
  const randomRemain = remains[Math.floor(Math.random() * remains.length)];
  return {
    id: 'master_sorcerer_quest',
    title: 'Resti Potenti',
    description: `Il Maestro Stregone cerca un ${randomRemain.name} per un potente rituale. Il rito costerà 1000 monete oltre al resto.`,
    giver: 'Maestro Stregone',
    reward: 1000,
    isCompleted: false,
    requiredRemainId: randomRemain.id,
    requiredRemainName: randomRemain.name,
  };
}

function generateShopkeeperQuest(previousLevel = 14): QuestDbData {
    const newLevel = 15;
    return {
        id: 'shopkeeper_quest',
        title: 'Prova di Resistenza',
        description: `Il Gestore del Negozio ti sfida: porta la tua creatura attuale al livello ${newLevel} senza usare alcun oggetto consumabile su di essa. Se ci riesci, ti aspetta una ricompensa.`,
        giver: 'Gestore Negozio',
        reward: 1000,
        isCompleted: false,
        requiredLevel: newLevel,
    };
}

function generateNerdBossQuest(): QuestDbData {
    const totalSmall = 5 * 3;
    const totalMedium = 10 * 7;
    const totalLarge = 20 * 13;
    return {
        id: 'nerd_boss_quest',
        title: 'La Prova del Vero Nerd',
        description: `Il Capo dei Nerd lancia una sfida per i più tenaci: sconfiggi ogni singolo avversario in tutti i tentativi disponibili per ogni covo (Piccolo: ${totalSmall}, Medio: ${totalMedium}, Grande: ${totalLarge}) prima di mettere piede in una palestra e vincere la tua prima medaglia.`,
        giver: 'Capo dei Nerd',
        reward: 1000,
        isCompleted: false,
    };
}


export async function initializeQuestsForPlayer(): Promise<QuestState> {
  const gmQuestDb = generateGranMaestroQuest([]);
  const sQuestDb = generateSorcererQuest();
  const msQuestDb = generateMasterSorcererQuest();
  const skQuestDb = generateShopkeeperQuest();
  const nbQuestDb = generateNerdBossQuest();
  
  return {
    gran_maestro_quest: { ...gmQuestDb, iconName: 'Book' },
    sorcerer_quest: { ...sQuestDb, iconName: 'Skull' },
    master_sorcerer_quest: { ...msQuestDb, iconName: 'Wand2' },
    shopkeeper_quest: { ...skQuestDb, iconName: 'Store' },
    nerd_boss_quest: { ...nbQuestDb, iconName: 'Users' },
  };
}

// --- Quest Completion Logic ---

export async function completeQuest(trainerName: string, questId: QuestId): Promise<{ success: boolean; message: string; updatedPlayer?: Fighter }> {
    const player = await getPlayerProfileData(trainerName);
    if (!player || !player.activeQuests) {
        return { success: false, message: 'Giocatore o quest non trovate.' };
    }

    const quest = player.activeQuests[questId];
    if (!quest || quest.isCompleted) {
        return { success: false, message: 'Quest non valida o già completata.' };
    }
    
    let playerAfterUpdate: Fighter | null = player;

    // Check completion criteria
    switch (questId) {
        case 'gran_maestro_quest':
            if (!quest.requiredMoveId || !player.unlockedAttackIds?.includes(quest.requiredMoveId) || player.attacks.some(a => a.id === quest.requiredMoveId)) {
                return { success: false, message: `Non puoi completare la missione se la mossa è equipaggiata.` };
            }
            player.unlockedAttackIds = player.unlockedAttackIds.filter(id => id !== quest.requiredMoveId);
            player.activeQuests.gran_maestro_quest = { ...generateGranMaestroQuest(player.unlockedAttackIds), iconName: 'Book' };
            break;
        
        case 'sorcerer_quest':
             const totalStats = player.attackStat + player.defenseStat + player.specialAttackStat + player.specialDefenseStat + player.speedStat + player.luckStat;
             if (player.level !== 5 || totalStats < quest.requiredSacrificeTotalStats!) {
                return { success: false, message: `La creatura non soddisfa i requisiti dello Stregone.` };
             }
             playerAfterUpdate = await setPlayerCreature(trainerName, player); // This effectively "sacrifices" the creature
             if (playerAfterUpdate) {
                playerAfterUpdate.activeQuests!.sorcerer_quest = { ...generateSorcererQuest(), iconName: 'Skull' };
             }
             break;

        case 'master_sorcerer_quest':
            if (!quest.requiredRemainId || !player.inventory?.[quest.requiredRemainId] || player.inventory[quest.requiredRemainId].quantity <= 0) {
                return { success: false, message: `Non possiedi il resto richiesto: ${quest.requiredRemainName}.` };
            }
            player.inventory[quest.requiredRemainId].quantity--;
            if (player.inventory[quest.requiredRemainId].quantity <= 0) {
                delete player.inventory[quest.requiredRemainId];
            }
            player.activeQuests.master_sorcerer_quest = { ...generateMasterSorcererQuest(), iconName: 'Wand2' };
            break;
        
        case 'shopkeeper_quest':
            if (player.level < quest.requiredLevel! || !player.didNotUseConsumables) {
                return { success: false, message: `Non hai soddisfatto le condizioni del Gestore.` };
            }
            player.activeQuests.shopkeeper_quest = { ...generateShopkeeperQuest(quest.requiredLevel), iconName: 'Store' };
            break;
        
        case 'nerd_boss_quest':
            const defeated = player.covoOpponentsDefeated;
            const requiredSmall = 5 * 3;
            const requiredMedium = 10 * 7;
            const requiredLarge = 20 * 13;
            if (!defeated || defeated.small < requiredSmall || defeated.medium < requiredMedium || defeated.large < requiredLarge || (player.highestGymBeaten ?? 0) > 0) {
                 return { success: false, message: 'Non hai ancora sconfitto tutti gli avversari di tutti i tentativi dei covi prima di vincere una medaglia.' };
            }
            quest.isCompleted = true;
            break;
    }
    
    // Apply reward and save
    if (playerAfterUpdate) {
        if (!quest.isCompleted) { // Avoid double reward if already marked completed
             playerAfterUpdate.money = (playerAfterUpdate.money || 0) + quest.reward;
        }
        await savePlayer(trainerName, playerAfterUpdate);
    } else {
        return { success: false, message: 'Errore durante l\'aggiornamento del giocatore.' };
    }
    
    return { success: true, message: `Quest completata! Hai guadagnato ${quest.reward} monete.`, updatedPlayer: playerAfterUpdate };
}
