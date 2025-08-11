

'use server';

import type { Fighter, Attack, FighterBaseStatKeys, AttackRarity, FighterCurrentStatKeys, Archetype, CreatureType } from '@/types/battle';
import { getFighterBases, getCreaturePool, getAllGameAttacks, TentennamentoAttack, getViandanteMaestroPool } from '@/config/fighters';
import { ALL_CONSUMABLES } from '@/config/consumables';
import { GameBalance } from '@/config/game-balance';
import { ALL_GYMS } from '@/config/gyms';
import type { CovoSize } from '@/config/locations';
import { COVO_CONFIG } from '@/config/locations';
import type { ConsumableItem } from '@/types/items';
import { STATUS_EFFECTS } from '@/config/statusEffects';
import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import type { Quest, QuestState, QuestDbData, QuestGiver } from '@/types/quests';
import { initializeQuestsForPlayer } from './quests';
import { Book, Skull, Store, Wand2, Users, type LucideIcon } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/leaderboard';

// Interface for the data structure saved in Firestore.
// This is a slimmed-down version of the Fighter type.
interface FighterDbData {
  trainerName: string;
  name: string;
  baseId: string;
  creatureType: CreatureType;
  archetype?: Archetype | null;
  isUnique?: boolean | null;
  isEvolved?: boolean | null;
  maxHealth: number;
  currentHealth: number;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  attackIds: string[];
  unlockedAttackIds: string[];
  inventory: Record<string, number>; // itemId: quantity
  money: number;
  highestGymBeaten: number;
  trainerRankPoints: number;
  attemptsRemaining: number;
  suicideCount: number;
  battlesWon: number;
  covoAttemptsRemaining: Record<CovoSize, number>;
  covoOpponentsDefeated?: Record<CovoSize, number> | null;
  activeSteroids?: Partial<Record<FighterBaseStatKeys | 'all', { battlesRemaining: number }>> | null;
  viandanteMaestroVisible: boolean;
  viandanteMaestroBattlesRemaining: number;
  sorcererTentVisible: boolean;
  masterSorcererTentVisible: boolean;
  totalTrustPoints: number;
  activeQuests?: Partial<QuestStateDbData> | null;
  attackStat: number;
  defenseStat: number;
  specialAttackStat: number;
  specialDefenseStat: number;
  speedStat: number;
  luckStat: number;
  didNotUseConsumables?: boolean;
  arenaDisclaimerAccepted?: boolean;
  defeatedBy?: string | null;
}

interface QuestStateDbData {
  gran_maestro_quest: QuestDbData;
  sorcerer_quest: QuestDbData;
  master_sorcerer_quest: QuestDbData;
  shopkeeper_quest: QuestDbData;
  nerd_boss_quest: QuestDbData;
}
// --- Helper Functions ---

function mapFighterToDbData(fighter: Fighter): FighterDbData {
  const inventoryDb: Record<string, number> = {};
  if (fighter.inventory) {
    for (const key in fighter.inventory) {
      inventoryDb[key] = fighter.inventory[key].quantity;
    }
  }
  
  let questDbData: Partial<QuestStateDbData> | null = null;
  if (fighter.activeQuests) {
      questDbData = {};
      for (const key in fighter.activeQuests) {
          const questKey = key as keyof QuestState;
          const quest = fighter.activeQuests[questKey];
          if (quest) {
            const { iconName, ...rest } = quest;
            questDbData[questKey] = rest;
          }
      }
  }

  return {
    trainerName: fighter.trainerName || '',
    name: fighter.name,
    baseId: fighter.baseId || '', // Ensure baseId is never undefined
    creatureType: fighter.creatureType,
    archetype: fighter.archetype ?? null,
    isUnique: fighter.isUnique ?? null,
    isEvolved: fighter.isEvolved ?? null,
    maxHealth: fighter.maxHealth,
    currentHealth: fighter.currentHealth,
    level: fighter.level,
    currentXP: fighter.currentXP,
    xpToNextLevel: fighter.xpToNextLevel,
    attackIds: fighter.attacks.map(a => a.id),
    unlockedAttackIds: fighter.unlockedAttackIds || [],
    inventory: inventoryDb,
    money: fighter.money || 0,
    highestGymBeaten: fighter.highestGymBeaten || 0,
    trainerRankPoints: fighter.trainerRankPoints || 0,
    attemptsRemaining: fighter.attemptsRemaining ?? 50,
    suicideCount: fighter.suicideCount || 0,
    battlesWon: fighter.battlesWon || 0,
    covoAttemptsRemaining: fighter.covoAttemptsRemaining || { small: 10, medium: 15, large: 20 },
    covoOpponentsDefeated: fighter.covoOpponentsDefeated ?? { small: 0, medium: 0, large: 0 },
    activeSteroids: fighter.activeSteroids ?? null,
    viandanteMaestroVisible: fighter.viandanteMaestroVisible || false,
    viandanteMaestroBattlesRemaining: fighter.viandanteMaestroBattlesRemaining || 0,
    sorcererTentVisible: fighter.sorcererTentVisible || false,
    masterSorcererTentVisible: fighter.masterSorcererTentVisible || false,
    totalTrustPoints: fighter.totalTrustPoints || 0,
    activeQuests: questDbData,
    attackStat: fighter.attackStat,
    defenseStat: fighter.defenseStat,
    specialAttackStat: fighter.specialAttackStat,
    specialDefenseStat: fighter.specialDefenseStat,
    speedStat: fighter.speedStat,
    luckStat: fighter.luckStat,
    didNotUseConsumables: fighter.didNotUseConsumables ?? true,
    arenaDisclaimerAccepted: fighter.arenaDisclaimerAccepted ?? false,
    defeatedBy: fighter.defeatedBy ?? null,
  };
}


function mapDbDataToFighter(dbData: FighterDbData): Fighter {
  const allAttacks = getAllGameAttacks();
  const allConsumables = ALL_CONSUMABLES;
  const allCreatures = [...getCreaturePool(), ...getViandanteMaestroPool()];

  const attacks = dbData.attackIds.map(id => allAttacks.find(a => a.id === id)).filter(Boolean) as Attack[];
  const inventory: Fighter['inventory'] = {};
  for (const itemId in dbData.inventory) {
    const itemDef = allConsumables.find(c => c.id === itemId);
    if (itemDef) {
      inventory[itemId] = { item: itemDef, quantity: dbData.inventory[itemId] };
    }
  }

  const baseCreature = allCreatures.find(c => c.id === dbData.baseId) || allCreatures[0];

  const fighter: Fighter = {
    ...dbData,
    id: 'player', // The ID in the app is always 'player'
    spriteUrl: baseCreature.spriteUrl,
    spriteUrlDietro: baseCreature.spriteUrlDietro,
    evolvedSpriteUrl: baseCreature.evolvedSpriteUrl,
    spriteAiHint: baseCreature.spriteAiHint,
    attacks,
    inventory,
    statusEffects: [], // Status effects are transient and not stored
    // Current stats are initialized based on base stats
    currentAttackStat: dbData.attackStat,
    currentDefenseStat: dbData.defenseStat,
    currentSpecialAttackStat: dbData.specialAttackStat,
    currentSpecialDefenseStat: dbData.specialDefenseStat,
    currentSpeedStat: dbData.speedStat,
    currentLuckStat: dbData.luckStat,
    trustLevel: 3, // Default trust level for a session
    maxTrustLevel: 10,
    archetype: dbData.archetype ?? undefined,
    isUnique: dbData.isUnique ?? undefined,
    isEvolved: dbData.isEvolved ?? undefined,
    activeSteroids: dbData.activeSteroids ?? undefined,
    didNotUseConsumables: dbData.didNotUseConsumables ?? true,
    arenaDisclaimerAccepted: dbData.arenaDisclaimerAccepted ?? false,
    defeatedBy: dbData.defeatedBy ?? null,
  };
  return fighter;
}


// --- Core Firestore Functions ---

export async function savePlayer(trainerName: string, player: Fighter): Promise<void> {
  const dbData = mapFighterToDbData(player);
  const playerDocRef = doc(db, "players", trainerName);
  await setDoc(playerDocRef, dbData);
}

async function getPlayerFromStore(trainerName: string): Promise<Fighter | null> {
    const playerDocRef = doc(db, "players", trainerName);
    const docSnap = await getDoc(playerDocRef);
    if (docSnap.exists()) {
        const dbData = docSnap.data() as FighterDbData;
        let player = mapDbDataToFighter(dbData);
        
        // Ensure quests are initialized if they don't exist or are incomplete
        const fullQuests = await initializeQuestsForPlayer();
        let questsNeedUpdate = false;
        if (!player.activeQuests) {
          player.activeQuests = fullQuests;
          questsNeedUpdate = true;
        } else {
            for (const key in fullQuests) {
                const questKey = key as keyof QuestState;
                if (!player.activeQuests[questKey]) {
                    player.activeQuests[questKey] = fullQuests[questKey];
                    questsNeedUpdate = true;
                }
            }
        }
        
        if (questsNeedUpdate) {
            await savePlayer(trainerName, player);
        }

        return player;
    }
    return null;
}

async function createInitialPlayer(trainerName: string): Promise<Fighter> {
    const player = await getPlayerFromStore(trainerName);
    if (player) {
      return player;
    }

    const newPlayer: Fighter = {
        id: 'player',
        baseId: '', // IMPORTANT: Initialize as empty, will be set when creature is chosen
        trainerName, 
        money: 0,
        inventory: {},
        attacks: [],
        statusEffects: [],
        name: '',
        spriteUrl: 'https://placehold.co/160x160.png',
        spriteUrlDietro: 'https://placehold.co/160x160.png',
        spriteAiHint: '',
        creatureType: 'Fire',
        archetype: 'Balanced',
        maxHealth: 100,
        currentHealth: 100,
        level: 1,
        currentXP: 0,
        xpToNextLevel: 100,
        unlockedAttackIds: [],
        highestGymBeaten: 0,
        trainerRankPoints: 0,
        attemptsRemaining: 50,
        suicideCount: 0,
        battlesWon: 0,
        covoAttemptsRemaining: { small: 10, medium: 15, large: 20 },
        covoOpponentsDefeated: { small: 0, medium: 0, large: 0 },
        viandanteMaestroVisible: false,
        viandanteMaestroBattlesRemaining: 0,
        sorcererTentVisible: false,
        masterSorcererTentVisible: false,
        attackStat: 10, defenseStat: 10, specialAttackStat: 10, specialDefenseStat: 10, speedStat: 10, luckStat: 10,
        currentAttackStat: 10, currentDefenseStat: 10, currentSpecialAttackStat: 10, currentSpecialDefenseStat: 10, currentSpeedStat: 10, currentLuckStat: 10,
        trustLevel: 3, maxTrustLevel: 10,
        totalTrustPoints: 0,
        isEvolved: false,
        activeQuests: await initializeQuestsForPlayer(),
        didNotUseConsumables: true,
        arenaDisclaimerAccepted: false,
        defeatedBy: null,
    };

    await savePlayer(trainerName, newPlayer);
    return newPlayer;
}


function prepareFighterForBattleInstance(baseFighterData: Fighter, fighterType: 'player' | 'opponent', options?: { persistedState?: Fighter, fixedLevel?: number, opponentType?: 'covo' | 'gym' | 'prairie' | 'viandante' | 'arena' }): Fighter {
  let battleInstance: Fighter;

  // For opponents, always create a fresh, randomized instance from a local template.
  if (fighterType === 'opponent' && options?.opponentType !== 'arena') {
      let opponentTemplate: Fighter;
      if (options?.opponentType === 'viandante') {
          const masterPool = getViandanteMaestroPool();
          opponentTemplate = masterPool[Math.floor(Math.random() * masterPool.length)];
      } else {
          const creaturePool = getCreaturePool();
          opponentTemplate = creaturePool[Math.floor(Math.random() * creaturePool.length)];
      }
      battleInstance = generateRandomizedStatsAndHp(opponentTemplate);
  } else {
      // For players or arena opponents, use the provided data.
      battleInstance = JSON.parse(JSON.stringify(baseFighterData));
  }

  let levelToSet = battleInstance.level;

  if (fighterType === 'opponent' && options?.opponentType !== 'arena') {
      if (options?.opponentType === 'prairie' && options?.fixedLevel) {
          const levelVariation = Math.floor(Math.random() * 5) - 2; // -2 to +2
          levelToSet = Math.max(1, options.fixedLevel + levelVariation);
      } else if (options?.opponentType === 'covo' && options?.fixedLevel) {
          levelToSet = Math.max(1, options.fixedLevel - 4);
      } else if (options?.opponentType === 'viandante' && options?.fixedLevel) {
          levelToSet = Math.max(1, options.fixedLevel - 2);
      } else if (options?.fixedLevel) {
          levelToSet = options.fixedLevel;
      }
  }


  if (levelToSet !== battleInstance.level) {
      const levelsToGain = levelToSet - battleInstance.level;
      if (levelsToGain > 0) {
        for (let i = 0; i < levelsToGain; i++) {
          const newStats = calculateLevelUp(battleInstance);
          Object.assign(battleInstance, newStats);
          battleInstance.level += 1;
        }
      }
      battleInstance.xpToNextLevel = Math.floor(100 * Math.pow(1 + GameBalance.XP_TO_NEXT_LEVEL_INCREASE_FACTOR, battleInstance.level));
      battleInstance.currentXP = 0;
  }

    // Handle opponent evolution chance
  if (fighterType === 'opponent' && !battleInstance.isEvolved) {
    const { level } = battleInstance;
    let evolutionChance = 0;
    if (level >= 35) evolutionChance = GameBalance.OPPONENT_EVOLVED_CHANCE_LVL_35;
    else if (level >= 30) evolutionChance = GameBalance.OPPONENT_EVOLVED_CHANCE_LVL_30;
    else if (level >= 20) evolutionChance = GameBalance.OPPONENT_EVOLVED_CHANCE_LVL_20;
    else if (level >= 15) evolutionChance = GameBalance.OPPONENT_EVOLVED_CHANCE_LVL_15;

    if (Math.random() < evolutionChance) {
      battleInstance.isEvolved = true;
    }
  }
  
  // This is the key correction: prioritize persistedState for HP and Trust
  if (options?.persistedState) {
    battleInstance.currentHealth = options.persistedState.currentHealth;
    battleInstance.trustLevel = options.persistedState.trustLevel; // Keep trust level
    battleInstance.statusEffects = []; // Always reset status effects
  } else {
    // This is for the first battle of a series or a single battle
    battleInstance.currentHealth = battleInstance.maxHealth;
    battleInstance.trustLevel = 3;
    battleInstance.statusEffects = [];
  }

  battleInstance.currentAttackStat = battleInstance.attackStat;
  battleInstance.currentDefenseStat = battleInstance.defenseStat;
  battleInstance.currentSpecialAttackStat = battleInstance.specialAttackStat;
  battleInstance.currentSpecialDefenseStat = battleInstance.specialDefenseStat;
  battleInstance.currentSpeedStat = battleInstance.speedStat;
  battleInstance.currentLuckStat = battleInstance.luckStat;

  battleInstance.inventory = {};

  if (fighterType === 'player') {
    const maxMoves = baseFighterData.isEvolved ? 4 : 3;
    if (baseFighterData.attacks && baseFighterData.attacks.length > 0) {
        battleInstance.attacks = baseFighterData.attacks.slice(0, maxMoves).map(a => JSON.parse(JSON.stringify(a)));
    } else {
        const { player: defaultPlayerBase } = getFighterBases();
        const commonAttacks = defaultPlayerBase.attacks.filter(a => a.rarity === 'Common');
        const rareAttacks = defaultPlayerBase.attacks.filter(a => a.rarity === 'Rare');
        const epicAttacks = defaultPlayerBase.attacks.filter(a => a.rarity === 'Epic');
        const fallbackAttacks: Attack[] = [];
        if (commonAttacks.length > 0) fallbackAttacks.push(JSON.parse(JSON.stringify(commonAttacks[0])));
        if (rareAttacks.length > 0) fallbackAttacks.push(JSON.parse(JSON.stringify(rareAttacks[0])));
        if (epicAttacks.length > 0) fallbackAttacks.push(JSON.parse(JSON.stringify(epicAttacks[0])));
        battleInstance.attacks = fallbackAttacks.slice(0,maxMoves);
    }

    if (baseFighterData.inventory) {
      for (const itemId in baseFighterData.inventory) {
        const invEntry = baseFighterData.inventory[itemId];
        if (invEntry && invEntry.quantity > 0) {
          battleInstance.inventory[itemId] = JSON.parse(JSON.stringify(invEntry));
        }
      }
    }

  } else if (options?.opponentType !== 'viandante' && options?.opponentType !== 'arena') {
    const creaturePool = getCreaturePool();
    const opponentBase = creaturePool[Math.floor(Math.random() * creaturePool.length)];
    const availableOpponentAttacks = opponentBase.attacks.map(a => JSON.parse(JSON.stringify(a)));
    const opponentBattleAttacks: Attack[] = [];
    const maxOpponentMoves = battleInstance.isEvolved ? 4 : 3;
    
    const rarities: AttackRarity[] = ["Common", "Rare", "Epic"];
    if (battleInstance.isEvolved) rarities.push('Legendary');

    for (const rarity of rarities) {
        const attacksOfRarity = availableOpponentAttacks.filter(a => a.rarity === rarity);
        if (attacksOfRarity.length > 0) {
            opponentBattleAttacks.push(attacksOfRarity[Math.floor(Math.random() * attacksOfRarity.length)]);
        }
    }

    if (opponentBattleAttacks.length < maxOpponentMoves && availableOpponentAttacks.length > 0) {
        const currentAttackIds = new Set(opponentBattleAttacks.map(a => a.id));
        for (const attack of availableOpponentAttacks) {
            if (opponentBattleAttacks.length >= maxOpponentMoves) break;
            if (!currentAttackIds.has(attack.id)) {
                opponentBattleAttacks.push(attack);
                currentAttackIds.add(attack.id);
            }
        }
    }
    battleInstance.attacks = opponentBattleAttacks.slice(0, maxOpponentMoves);
  }
  return battleInstance;
}

function generateRandomizedStatsAndHp(baseFighter: Fighter): Fighter {
  const randomMaxHealth = Math.floor(Math.random() * (GameBalance.OPPONENT_RANDOM_MAX_HEALTH_MAX - GameBalance.OPPONENT_RANDOM_MAX_HEALTH_MIN + 1)) + GameBalance.OPPONENT_RANDOM_MAX_HEALTH_MIN;

  const randomizedFighter: Fighter = {
    ...JSON.parse(JSON.stringify(baseFighter)),
    maxHealth: randomMaxHealth,
    attacks: baseFighter.attacks.map(attack => ({ ...attack })),
    level: baseFighter.level || 1,
    currentXP: baseFighter.currentXP || 0,
    xpToNextLevel: baseFighter.xpToNextLevel || 100,
    baseId: baseFighter.id, // Ensure baseId is set from the original creature's id
  };

  const statsToRandomize: FighterBaseStatKeys[] = ['attackStat', 'defenseStat', 'specialAttackStat', 'specialDefenseStat', 'speedStat', 'luckStat'];

  statsToRandomize.forEach(stat => {
    randomizedFighter[stat] = Math.floor(Math.random() * 20) + 1;
  });

  return randomizedFighter;
}


export async function getFighterDataForBattle(
  trainerName: string,
  options?: { fighterType: 'player' | 'opponent', persistedState?: Fighter; fixedLevel?: number, opponentType?: 'covo' | 'gym' | 'prairie' | 'viandante' | 'arena' }
): Promise<Fighter | null> {
  const { fighterType = 'player', ...restOptions } = options || {};

  if (fighterType === 'opponent') {
      if (options?.opponentType === 'arena') {
        const opponent = await getRandomOnlineOpponent(trainerName);
        if (!opponent) return null;
        return prepareFighterForBattleInstance(opponent, 'opponent', restOptions);
      }
      
      const creaturePool = getCreaturePool();
      const randomBase = creaturePool[Math.floor(Math.random() * creaturePool.length)];
      return prepareFighterForBattleInstance(randomBase, 'opponent', restOptions);
  }

  // Default to player logic
  const baseFighterData = await getPlayerFromStore(trainerName);
  if (!baseFighterData) {
      throw new Error(`Player with trainer name ${trainerName} not found.`);
  }
  return prepareFighterForBattleInstance(baseFighterData, 'player', restOptions);
}


export async function getPlayerProfileData(trainerName: string): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    return player ? JSON.parse(JSON.stringify(player)) : null;
}

export async function initializePlayerWithTrainerName(trainerName: string): Promise<Fighter | null> {
  let player = await getPlayerFromStore(trainerName);
  if (player) {
      console.warn(`Player ${trainerName} already exists. Returning existing data.`);
      return player;
  }
  
  player = await createInitialPlayer(trainerName);
    
  return JSON.parse(JSON.stringify(player));
}

export async function updateFighterMovesInRepository(trainerName: string, newAttacks: Attack[]): Promise<void> {
  const currentFighterState = await getPlayerFromStore(trainerName);
  if (!currentFighterState) return;

  const updatedFighterWithNewMoves: Fighter = {
    ...currentFighterState,
    attacks: newAttacks.map(a => ({ ...a })),
  };

  await savePlayer(trainerName, updatedFighterWithNewMoves);
}

function calculateLevelUp(fighter: Fighter): Partial<Fighter> {
    const { LEVEL_UP_STAT_INCREASE_PERCENTAGE_FAST, LEVEL_UP_STAT_INCREASE_PERCENTAGE_SLOW, LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL, LEVEL_UP_HEALTH_INCREASE_PERCENTAGE, MIN_STAT_INCREASE_ON_LEVEL_UP } = GameBalance;
    const archetype = fighter.archetype || 'Balanced';

    const newStats: Partial<Fighter> = {};
    newStats.maxHealth = fighter.maxHealth + Math.max(MIN_STAT_INCREASE_ON_LEVEL_UP, Math.floor(fighter.maxHealth * LEVEL_UP_HEALTH_INCREASE_PERCENTAGE));

    const statGrowth: Record<FighterBaseStatKeys, number> = {
        attackStat: archetype === 'Physical' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_FAST : archetype === 'Special' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_SLOW : LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
        defenseStat: archetype === 'Physical' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_FAST : archetype === 'Special' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_SLOW : LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
        specialAttackStat: archetype === 'Special' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_FAST : archetype === 'Physical' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_SLOW : LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
        specialDefenseStat: archetype === 'Special' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_FAST : archetype === 'Physical' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_SLOW : LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
        speedStat: LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
        luckStat: LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
    };

    (Object.keys(statGrowth) as FighterBaseStatKeys[]).forEach(statKey => {
        let growthRate = statGrowth[statKey];

        if(fighter.activeSteroids) {
            const steroidKey = statKey as keyof typeof fighter.activeSteroids;
            if(fighter.activeSteroids[steroidKey] && fighter.activeSteroids[steroidKey]!.battlesRemaining > 0) {
                growthRate += 0.15;
            }
            if(fighter.activeSteroids.all && fighter.activeSteroids.all.battlesRemaining > 0) {
                growthRate += 0.15;
            }
        }

        const baseValue = fighter[statKey];
        const increase = Math.max(MIN_STAT_INCREASE_ON_LEVEL_UP, Math.floor(baseValue * growthRate));
        newStats[statKey] = baseValue + increase;
    });

    return newStats;
}

export async function updatePlayerXPAndLevel(trainerName: string, xpGained: number, playerStateBeforeWin: Fighter): Promise<Fighter | null> {
  const player = JSON.parse(JSON.stringify(playerStateBeforeWin));
  if (!player) {
    return null;
  }
  
  if (player.totalTrustPoints === undefined) player.totalTrustPoints = 0;
  if(player.trustLevel > 0) player.totalTrustPoints += player.trustLevel;

  player.currentXP += Math.floor(xpGained);

  while (player.currentXP >= player.xpToNextLevel) {
    const xpNeededForThisLevel = player.xpToNextLevel;

    player.level += 1;
    player.currentXP -= xpNeededForThisLevel;
    player.xpToNextLevel = Math.floor(xpNeededForThisLevel * (1 + GameBalance.XP_TO_NEXT_LEVEL_INCREASE_FACTOR));
    
    const newStats = calculateLevelUp(player);
    Object.assign(player, newStats);

    (Object.keys(newStats) as (keyof typeof newStats)[]).forEach(statKey => {
        if (statKey !== 'maxHealth') {
            const currentStatKey = `current${statKey.charAt(0).toUpperCase() + statKey.slice(1)}` as FighterCurrentStatKeys;
            if (currentStatKey in player) {
                (player as any)[currentStatKey] = player[statKey as FighterBaseStatKeys];
            }
        }
    });
  }
  
  // Clear transient battle-only status effects after a win
  player.statusEffects = [];
  
  await savePlayer(trainerName, player);

  return JSON.parse(JSON.stringify(player));
}

export async function evolvePlayerCreature(trainerName: string): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;

    if (player.isEvolved) {
        console.log("Player is already evolved.");
        return player;
    }

    player.isEvolved = true;

    // Add a 4th move slot if it doesn't exist
    if (player.attacks.length < 4) {
        player.attacks.push(TentennamentoAttack);
    }

    // Learn a random legendary move
    const allAttacks = getAllGameAttacks();
    const legendaryAttacks = allAttacks.filter(a => a.rarity === 'Legendary');
    if (legendaryAttacks.length > 0) {
        const newLegendaryMove = legendaryAttacks[Math.floor(Math.random() * legendaryAttacks.length)];
        
        // Add to unlocked moves
        if (!player.unlockedAttackIds) player.unlockedAttackIds = [];
        if (!player.unlockedAttackIds.includes(newLegendaryMove.id)) {
            player.unlockedAttackIds.push(newLegendaryMove.id);
        }

        // Equip if there's a free slot
        const placeholderIndex = player.attacks.findIndex(a => a.id === TentennamentoAttack.id);
        if (placeholderIndex !== -1) {
            player.attacks[placeholderIndex] = newLegendaryMove;
        }
    }
    
    await savePlayer(trainerName, player);
    
    return JSON.parse(JSON.stringify(player));
}

export async function evolvePlayerCreatureWithDebuff(trainerName: string): Promise<Fighter | null> {
    let player = await evolvePlayerCreature(trainerName);
    if (!player) return null;
    
    const debuff = STATUS_EFFECTS['impaurita'];
    if (debuff && !player.statusEffects.some(se => se.id === debuff.id)) {
        player.statusEffects.push(JSON.parse(JSON.stringify(debuff)));
    }

    await savePlayer(trainerName, player);
    
    return player;
}


export async function incrementBattlesWon(trainerName: string, covoSize?: CovoSize): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;
    if (player.battlesWon === undefined) {
        player.battlesWon = 0;
    }
    player.battlesWon++;

    if (covoSize) {
        if (!player.covoOpponentsDefeated) {
            player.covoOpponentsDefeated = { small: 0, medium: 0, large: 0 };
        }
        player.covoOpponentsDefeated[covoSize]++;
    }

    await savePlayer(trainerName, player);
    return JSON.parse(JSON.stringify(player));
}

export async function updateSteroidCountersAndApplyDebuffs(trainerName: string): Promise<{ player: Fighter | null, debuffLogs: string[] }> {
    const player = await getPlayerFromStore(trainerName);
    if (!player || !player.activeSteroids) return { player, debuffLogs: [] };

    const debuffLogs: string[] = [];

    for (const key in player.activeSteroids) {
        const steroidKey = key as keyof typeof player.activeSteroids;
        const steroidEffect = player.activeSteroids[steroidKey];

        if (steroidEffect && steroidEffect.battlesRemaining > 0) {
            steroidEffect.battlesRemaining--;

            if (steroidEffect.battlesRemaining === 0) {
                debuffLogs.push(`L'effetto degli steroidi per ${key === 'all' ? 'tutte le statistiche' : key} è svanito, le statistiche sono state dimezzate!`);
                if (key === 'all') {
                    (Object.keys(player) as (keyof Fighter)[]).forEach(statKey => {
                        if (statKey.endsWith('Stat') && typeof player[statKey] === 'number') {
                            (player[statKey] as number) = Math.max(1, Math.floor((player[statKey] as number) / 2));
                        }
                    });
                } else {
                    const statKey = key as FighterBaseStatKeys;
                    player[statKey] = Math.max(1, Math.floor(player[statKey] / 2));
                }
            }
        }
    }
    
    // Clean up expired steroids
    for (const key in player.activeSteroids) {
        if (player.activeSteroids[key as keyof typeof player.activeSteroids]?.battlesRemaining === 0) {
            delete player.activeSteroids[key as keyof typeof player.activeSteroids];
        }
    }

    await savePlayer(trainerName, player);
    return { player: JSON.parse(JSON.stringify(player)), debuffLogs };
}

export async function updatePlayerPersistentInventory(trainerName: string, itemId: string, quantityChange: number, updatedPlayerState?: Fighter): Promise<Fighter | null> {
    const player = updatedPlayerState ? JSON.parse(JSON.stringify(updatedPlayerState)) : await getPlayerFromStore(trainerName);
    if (!player) return null;

    if (!player.inventory) player.inventory = {};

    const itemDefinition = ALL_CONSUMABLES.find(c => c.id === itemId);
    if (!itemDefinition) {
      console.warn(`Attempted to modify non-existent item ${itemId} in persistent inventory.`);
      return player;
    }
    
    if (quantityChange < 0) {
        player.didNotUseConsumables = false;
    }

    const currentItemEntry = player.inventory[itemId];
    if (currentItemEntry) {
        currentItemEntry.quantity += quantityChange;
        if (currentItemEntry.quantity <= 0) {
            delete player.inventory[itemId];
        }
    } else if (quantityChange > 0) {
        player.inventory[itemId] = { item: JSON.parse(JSON.stringify(itemDefinition)), quantity: quantityChange };
    }

    await savePlayer(trainerName, player);
    return JSON.parse(JSON.stringify(player));
}

export async function transformAndSavePlayer(trainerName: string, capturedOpponentData: Fighter): Promise<Fighter | null> {
  const playerToTransform = await getPlayerFromStore(trainerName);
  if (!playerToTransform) {
    console.error("Player data not found for transformation.");
    return null;
  }

  const { 
      inventory, money, highestGymBeaten, trainerRankPoints, 
      attemptsRemaining, suicideCount, covoAttemptsRemaining, unlockedAttackIds,
      activeSteroids, activeQuests, covoOpponentsDefeated
  } = playerToTransform;

  const transformedPlayer: Fighter = {
    ...JSON.parse(JSON.stringify(capturedOpponentData)),
    id: 'player',
    trainerName,
    inventory,
    money: money || 0,
    trustLevel: GameBalance.DEFAULT_TRUST_LEVEL_AFTER_CAPTURE,
    maxTrustLevel: capturedOpponentData.maxTrustLevel || 10,
    currentXP: 0,
    unlockedAttackIds: unlockedAttackIds || [],
    currentHealth: capturedOpponentData.maxHealth,
    currentAttackStat: capturedOpponentData.attackStat,
    currentDefenseStat: capturedOpponentData.defenseStat,
    currentSpecialAttackStat: capturedOpponentData.specialAttackStat,
    currentSpecialDefenseStat: capturedOpponentData.specialDefenseStat,
    currentSpeedStat: capturedOpponentData.speedStat,
    currentLuckStat: capturedOpponentData.luckStat,
    statusEffects: [],
    highestGymBeaten: highestGymBeaten || 0,
    trainerRankPoints: trainerRankPoints || 0,
    attemptsRemaining,
    suicideCount,
    battlesWon: 0,
    covoAttemptsRemaining,
    covoOpponentsDefeated,
    activeSteroids,
    activeQuests,
    viandanteMaestroVisible: false,
    viandanteMaestroBattlesRemaining: 0,
    sorcererTentVisible: false,
    masterSorcererTentVisible: false,
    totalTrustPoints: 0,
    isEvolved: false,
    didNotUseConsumables: true,
    arenaDisclaimerAccepted: false,
    defeatedBy: null,
  };

  transformedPlayer.attacks = capturedOpponentData.attacks.map(a => ({ ...a }));


  await savePlayer(trainerName, transformedPlayer);

  return JSON.parse(JSON.stringify(transformedPlayer));
}

export async function generateCreatureChoices(count: number = 1): Promise<Fighter[]> {
    const creatureBases = getCreaturePool();
    const choices: Fighter[] = [];
    const usedIndexes = new Set<number>();

    while (choices.length < count && usedIndexes.size < creatureBases.length) {
        const randomIndex = Math.floor(Math.random() * creatureBases.length);
        if (!usedIndexes.has(randomIndex)) {
            usedIndexes.add(randomIndex);
            let choice = generateRandomizedStatsAndHp(creatureBases[randomIndex]);
            choice.id = `choice-${randomIndex}-${Date.now()}`;
            
            const targetLevel = 5;
            if (choice.level < targetLevel) {
                const levelsToGain = targetLevel - choice.level;
                for (let i = 0; i < levelsToGain; i++) {
                   const newStats = calculateLevelUp(choice);
                   Object.assign(choice, newStats);
                   choice.level += 1;
                }
            }

            choice.currentHealth = choice.maxHealth;
            choice.currentAttackStat = choice.attackStat;
            choice.currentDefenseStat = choice.defenseStat;
            choice.currentSpecialAttackStat = choice.specialAttackStat;
            choice.currentSpecialDefenseStat = choice.defenseStat;
            choice.currentSpeedStat = choice.speedStat;
            choice.currentLuckStat = choice.luckStat;

            const allAvailableAttacks = getAllGameAttacks();
            const common = allAvailableAttacks.filter(a => a.rarity === 'Common' && a.damage > 0);
            const rare = allAvailableAttacks.filter(a => a.rarity === 'Rare' && a.damage > 0);
            const epic = allAvailableAttacks.filter(a => a.rarity === 'Epic' && a.damage > 0);
            const startingAttacks: Attack[] = [];
            if (common.length > 0) startingAttacks.push(common[Math.floor(Math.random() * common.length)]);
            if (rare.length > 0) startingAttacks.push(rare[Math.floor(Math.random() * rare.length)]);
            if (epic.length > 0) startingAttacks.push(epic[Math.floor(Math.random() * epic.length)]);
            choice.attacks = startingAttacks.slice(0, 3);
            
            choices.push(choice);
        }
    }
    return choices;
}

export async function setPlayerCreature(trainerName: string, chosenCreature: Fighter): Promise<Fighter | null> {
    const playerShell = await getPlayerFromStore(trainerName);
    if (!playerShell) {
        console.error(`Could not find player shell for ${trainerName} during creature selection.`);
        return null;
    }
    
    // Create a new player object based on the shell, but overwrite with creature data.
    const newPlayer = { ...playerShell, ...chosenCreature };

    // Explicitly set crucial properties to ensure a clean state for the new creature.
    newPlayer.id = 'player';
    newPlayer.baseId = chosenCreature.baseId; // This is the critical line to prevent undefined baseId
    newPlayer.level = 1; // Start new creatures at level 1
    newPlayer.currentXP = 0;
    newPlayer.xpToNextLevel = 100;
    newPlayer.trustLevel = 3;
    newPlayer.maxTrustLevel = 10;
    newPlayer.battlesWon = 0;
    newPlayer.covoOpponentsDefeated = { small: 0, medium: 0, large: 0 };
    newPlayer.totalTrustPoints = 0;
    newPlayer.isEvolved = false;
    newPlayer.didNotUseConsumables = true;
    newPlayer.defeatedBy = null;
    newPlayer.viandanteMaestroVisible = false;
    newPlayer.viandanteMaestroBattlesRemaining = 0;
    
    // Reset Covo attempts
    newPlayer.covoAttemptsRemaining = { small: 10, medium: 15, large: 20 };

    // Decrement attempts remaining, if the field exists.
    if (playerShell.attemptsRemaining !== undefined) {
      newPlayer.attemptsRemaining = playerShell.attemptsRemaining - 1;
    }
    
    // Level up the new creature to the starting level (e.g., 5)
    const targetLevel = 5;
    if (newPlayer.level < targetLevel) {
        const levelsToGain = targetLevel - newPlayer.level;
        for (let i = 0; i < levelsToGain; i++) {
            const newStats = calculateLevelUp(newPlayer);
            Object.assign(newPlayer, newStats);
            newPlayer.level += 1;
            newPlayer.currentXP = 0;
            newPlayer.xpToNextLevel = Math.floor(newPlayer.xpToNextLevel * (1 + GameBalance.XP_TO_NEXT_LEVEL_INCREASE_FACTOR));
        }
    }
    
    // Reset health and current stats
    newPlayer.currentHealth = newPlayer.maxHealth;
    newPlayer.currentAttackStat = newPlayer.attackStat;
    newPlayer.currentDefenseStat = newPlayer.defenseStat;
    newPlayer.currentSpecialAttackStat = newPlayer.specialAttackStat;
    newPlayer.currentSpecialDefenseStat = newPlayer.specialDefenseStat;
    newPlayer.currentSpeedStat = newPlayer.speedStat;
    newPlayer.currentLuckStat = newPlayer.luckStat;
    newPlayer.statusEffects = [];
    
    // Ensure correct number of attacks
    newPlayer.attacks = newPlayer.attacks.slice(0, 3);
    while(newPlayer.attacks.length < 3) {
      newPlayer.attacks.push(TentennamentoAttack);
    }

    // Only give starter items if the inventory is completely empty
    if (!playerShell.inventory || Object.keys(playerShell.inventory).length === 0) {
        const potion = ALL_CONSUMABLES.find(c => c.id === 'potion');
        if (potion) {
            newPlayer.inventory['potion'] = { item: potion, quantity: 5 };
        }
        
        const sbiruball = ALL_CONSUMABLES.find(c => c.id === 'sbiruball');
        if (sbiruball) {
            newPlayer.inventory['sbiruball'] = { item: sbiruball, quantity: 5 };
        }
    }


    await savePlayer(trainerName, newPlayer);
    
    return newPlayer;
}


export async function updatePlayerMoney(trainerName: string, amount: number): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;
    if (player.money === undefined) player.money = 0;
    player.money += amount;
    await savePlayer(trainerName, player);
    return JSON.parse(JSON.stringify(player));
}

export async function addUnlockedAttack(trainerName: string, attackId: string): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;

    if (!player.unlockedAttackIds) {
        player.unlockedAttackIds = player.attacks.map(a => a.id);
    }

    if (!player.unlockedAttackIds.includes(attackId)) {
        player.unlockedAttackIds.push(attackId);
        await savePlayer(trainerName, player);
    }
    
    return JSON.parse(JSON.stringify(player));
}

export async function markGymAsBeaten(trainerName: string, gymNumber: number): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;
    
    if (player.highestGymBeaten === undefined) {
        player.highestGymBeaten = 0;
    }
    
    if (gymNumber > player.highestGymBeaten) {
        player.highestGymBeaten = gymNumber;
        
        const gymConfig = ALL_GYMS.find(g => g.gymId === gymNumber);
        if (gymConfig?.reward) {
            if (player.money === undefined) player.money = 0;
            player.money += gymConfig.reward;
        }

        // Add ball rewards
        const ballRewards: Record<number, { itemId: string; quantity: number }> = {
            1: { itemId: 'super_sbiruball', quantity: 1 },
            2: { itemId: 'super_sbiruball', quantity: 3 },
            3: { itemId: 'super_sbiruball', quantity: 5 },
            4: { itemId: 'super_sbiruball', quantity: 10 },
            5: { itemId: 'mega_sbiruball', quantity: 1 },
            6: { itemId: 'mega_sbiruball', quantity: 2 },
            7: { itemId: 'mega_sbiruball', quantity: 3 },
            8: { itemId: 'mega_sbiruball', quantity: 5 },
            9: { itemId: 'mega_sbiruball', quantity: 7 },
            10: { itemId: 'mega_sbiruball', quantity: 10 },
        };
        const reward = ballRewards[gymNumber];
        if (reward) {
            await updatePlayerPersistentInventory(trainerName, reward.itemId, reward.quantity, player);
        }

        if (gymNumber >= 3) {
            player.masterSorcererTentVisible = true;
        }

        await savePlayer(trainerName, player);
    }
    
    return JSON.parse(JSON.stringify(player));
}

export async function applyStatBoostToPlayer(
  trainerName: string,
  statToBoost: FighterBaseStatKeys | 'maxHealth',
  percentage: number
): Promise<Fighter | null> {
  const player = await getPlayerFromStore(trainerName);
  if (!player) return null;

  const baseValue = player[statToBoost];
  if (typeof baseValue !== 'number') {
    console.error(`Stat ${statToBoost} is not a number on the player object.`);
    return player;
  }

  const increaseAmount = Math.max(1, Math.floor(baseValue * percentage));
  player[statToBoost] += increaseAmount;

  if (statToBoost !== 'maxHealth') {
      const currentStatKey = `current${statToBoost.charAt(0).toUpperCase() + statToBoost.slice(1)}` as FighterCurrentStatKeys;
      player[currentStatKey] += increaseAmount;
  } else {
      player.currentHealth += increaseAmount;
  }

  await savePlayer(trainerName, player);

  return JSON.parse(JSON.stringify(player));
}

export async function applyGrowthBoostToPlayer(
  trainerName: string,
  statToBoost: FighterBaseStatKeys | 'all'
): Promise<Fighter | null> {
  const player = await getPlayerFromStore(trainerName);
  if (!player) return null;
  
  if(!player.activeSteroids) {
    player.activeSteroids = {};
  }

  const steroidKey = statToBoost as keyof typeof player.activeSteroids;

  if (player.activeSteroids[steroidKey]) {
    player.activeSteroids[steroidKey]!.battlesRemaining += 20;
  } else {
    player.activeSteroids[steroidKey] = { battlesRemaining: 20 };
  }

  await savePlayer(trainerName, player);
  return JSON.parse(JSON.stringify(player));
}


export async function applyLevelUpToPlayer(trainerName: string, levels: number): Promise<Fighter | null> {
    let player = await getPlayerProfileData(trainerName);
    if (!player) return null;

    for (let i = 0; i < levels; i++) {
        const xpNeeded = player.xpToNextLevel - player.currentXP;
        const playerAfterLevelUp = await updatePlayerXPAndLevel(trainerName, xpNeeded > 0 ? xpNeeded : 1, player);
        if (playerAfterLevelUp) {
            player = playerAfterLevelUp;
        } else {
            throw new Error(`Failed to level up player on level ${i + 1}`);
        }
    }
    return player;
}

export async function updatePlayerNameInRepository(trainerName: string, newName: string): Promise<Fighter | null> {
  const player = await getPlayerFromStore(trainerName);
  if (!player) return null;

  player.name = newName;
  
  await savePlayer(trainerName, player);
  return JSON.parse(JSON.stringify(player));
}

export async function resetPlayerRun(trainerName: string): Promise<Fighter | null> {
    const playerDocRef = doc(db, "players", trainerName);
    await deleteDoc(playerDocRef);
    const newPlayer = await createInitialPlayer(trainerName);
    await savePlayer(trainerName, newPlayer);
    return JSON.parse(JSON.stringify(newPlayer));
}

export async function deletePlayerProfile(trainerName: string): Promise<{ success: boolean }> {
  try {
    const playerDocRef = doc(db, "players", trainerName);
    await deleteDoc(playerDocRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting player profile:", error);
    return { success: false };
  }
}

export async function decrementCovoAttempt(trainerName: string, size: CovoSize): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player || !player.covoAttemptsRemaining) return null;

    if (player.covoAttemptsRemaining[size] > 0) {
        player.covoAttemptsRemaining[size] -= 1;
        await savePlayer(trainerName, player);
    }
    
    return JSON.parse(JSON.stringify(player));
}

export async function recordSuicideAndDropItem(trainerName: string, player: Fighter): Promise<{ updatedPlayer: Fighter, droppedItem: ConsumableItem | null }> {
    const updatedPlayer = JSON.parse(JSON.stringify(player));

    // Check if health is over 50% BEFORE incrementing the count
    if (updatedPlayer.currentHealth / updatedPlayer.maxHealth > 0.5) {
        if (updatedPlayer.suicideCount === undefined) {
            updatedPlayer.suicideCount = 0;
        }
        updatedPlayer.suicideCount++;
    }
    
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
            if (!updatedPlayer.inventory) updatedPlayer.inventory = {};
            
            if (updatedPlayer.inventory[droppedItemId]) {
                updatedPlayer.inventory[droppedItemId].quantity++;
            } else {
                updatedPlayer.inventory[droppedItemId] = { item: itemDef, quantity: 1 };
            }
        }
    }

    await savePlayer(trainerName, player);
    return { updatedPlayer, droppedItem };
}

export async function updateViandanteMaestroVisibility(trainerName: string, forceVisible?: boolean): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;

    if (forceVisible) {
        player.viandanteMaestroVisible = true;
        player.viandanteMaestroBattlesRemaining = 10;
    } else {
        if (player.viandanteMaestroVisible && player.viandanteMaestroBattlesRemaining) {
            player.viandanteMaestroBattlesRemaining--;
            if (player.viandanteMaestroBattlesRemaining <= 0) {
                player.viandanteMaestroVisible = false;
            }
        } else {
            if (Math.random() < 0.05) { // 5%
                player.viandanteMaestroVisible = true;
                player.viandanteMaestroBattlesRemaining = 10;
            }
        }
    }

    await savePlayer(trainerName, player);
    return JSON.parse(JSON.stringify(player));
}

export async function setDidUseConsumable(trainerName: string): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;
    player.didNotUseConsumables = false;
    await savePlayer(trainerName, player);
    return JSON.parse(JSON.stringify(player));
}

export async function setSorcererTentVisibility(trainerName: string, forceVisible: boolean): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;
    player.sorcererTentVisible = forceVisible;
    await savePlayer(trainerName, player);
    return JSON.parse(JSON.stringify(player));
}

export async function setMasterSorcererTentVisibility(trainerName: string, forceVisible: boolean): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;
    player.masterSorcererTentVisible = forceVisible;
    await savePlayer(trainerName, player);
    return JSON.parse(JSON.stringify(player));
}

export async function randomizePlayerStats(trainerName: string): Promise<{success: boolean, message: string, updatedPlayer?: Fighter}> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) {
        return { success: false, message: 'Giocatore non trovato.' };
    }

    const statsToRandomize: FighterBaseStatKeys[] = ['attackStat', 'defenseStat', 'specialAttackStat', 'specialDefenseStat', 'speedStat', 'luckStat'];
    const totalStatPoints = statsToRandomize.reduce((sum, stat) => sum + player[stat], 0);

    // Reset stats to 1
    statsToRandomize.forEach(stat => {
        player[stat] = 1;
    });

    let pointsToDistribute = totalStatPoints - statsToRandomize.length;

    // Distribute the remaining points randomly
    for (let i = 0; i < pointsToDistribute; i++) {
        const randomStatIndex = Math.floor(Math.random() * statsToRandomize.length);
        const randomStat = statsToRandomize[randomStatIndex];
        player[randomStat]++;
    }

    // Update current stats to match the new base stats
    statsToRandomize.forEach(stat => {
        const currentStatKey = `current${stat.charAt(0).toUpperCase() + stat.slice(1)}` as FighterCurrentStatKeys;
        player[currentStatKey] = player[stat];
    });
    
    await savePlayer(trainerName, player);

    return {
        success: true,
        message: 'Le tue statistiche sono state ridistribuite!',
        updatedPlayer: player,
    };
}

// --- Arena Functions ---

export async function getRandomOnlineOpponent(currentPlayerTrainerName: string): Promise<Fighter | null> {
  const playersRef = collection(db, "players");
  const q = query(playersRef, where("trainerName", "!=", currentPlayerTrainerName));
  const querySnapshot = await getDocs(q);
  
  const opponents: Fighter[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as FighterDbData;
    if (data.arenaDisclaimerAccepted === true && (data.defeatedBy === null || data.defeatedBy === undefined)) {
       opponents.push(mapDbDataToFighter(data));
    }
  });

  if (opponents.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * opponents.length);
  return opponents[randomIndex];
}

export async function markOpponentAsDefeated(opponentTrainerName: string, winnerTrainerName: string): Promise<void> {
  const opponentDocRef = doc(db, "players", opponentTrainerName);
  const docSnap = await getDoc(opponentDocRef);

  if (docSnap.exists()) {
    const opponentData = docSnap.data() as FighterDbData;
    opponentData.defeatedBy = winnerTrainerName;
    await setDoc(opponentDocRef, opponentData);
  }
}

export async function setArenaDisclaimerAccepted(trainerName: string): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;
    player.arenaDisclaimerAccepted = true;
    await savePlayer(trainerName, player);
    return JSON.parse(JSON.stringify(player));
}

export async function clearDefeatedBy(trainerName: string): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;
    player.defeatedBy = null;
    await savePlayer(trainerName, player);
    return player;
}

export async function incrementArenaRank(trainerName: string): Promise<Fighter | null> {
    const player = await getPlayerFromStore(trainerName);
    if (!player) return null;

    player.trainerRankPoints = (player.trainerRankPoints ?? 0) + 1;
    player.money = (player.money ?? 0) + 1000;

    await savePlayer(trainerName, player);
    return player;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const playersRef = collection(db, "players");
    const q = query(playersRef, orderBy("trainerRankPoints", "desc"), limit(20));
    const querySnapshot = await getDocs(q);

    const leaderboard: LeaderboardEntry[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data() as FighterDbData;
        leaderboard.push({
            trainerName: data.trainerName,
            rankPoints: data.trainerRankPoints ?? 0,
        });
    });

    return leaderboard;
}
