

import type { LucideIcon } from 'lucide-react';
import type { ConsumableItem } from '@/types/items';
import type { CovoSize } from '@/config/locations';
import type { QuestState } from './quests';

export type AttackRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type Archetype = 'Physical' | 'Special' | 'Balanced';

export type FighterBaseStatKeys = 'attackStat' | 'defenseStat' | 'specialAttackStat' | 'specialDefenseStat' | 'speedStat' | 'luckStat';
export type FighterCurrentStatKeys = 'currentAttackStat' | 'currentDefenseStat' | 'currentSpecialAttackStat' | 'currentSpecialDefenseStat' | 'currentSpeedStat' | 'currentLuckStat';

export type CreatureType = 'Fire' | 'Water' | 'Grass' | 'Light' | 'Dark';
export type AttackCategory = 'Physical' | 'Special' | 'Status';

export type StatusEffectId = 'poison' | 'burn' | 'paralysis' | 'sleep' | 'confusion' | 'flinch' | 'stat_change';

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  duration: number; // turns
  icon?: string; // Icon name as string
  onTurnStartDamage?: (target: Fighter, effectInstance: StatusEffect) => { healthChange: number, logMessage?: LogMessagePart[] };
  onTurnStartCheck?: (target: Fighter, effect: StatusEffect) => {
      canMove: boolean;
      isConfused: boolean;
      logMessage?: LogMessagePart[];
      updatedEffect: StatusEffect;
  };
  statModifiers?: Partial<Record<FighterBaseStatKeys, number>>;
  damageTakenModifier?: number;
  attackModifier?: number;
  removeOnDamageTaken?: boolean;
  currentStage?: number;
}

export interface Attack {
  id: string;
  name: string;
  damage: number; // Negative for healing
  accuracy: number; // 0-1
  creatureType: CreatureType;
  category: AttackCategory;
  rarity: AttackRarity;
  icon?: string;
  curesAllStatusOnSelf?: boolean;
  effect?: {
    statusId: string;
    target: 'self' | 'opponent';
    chance: number; // 0-1
  };
  drain?: number;
  recoil?: number;
  specialDamage?: 'halve_hp';
}

export interface Fighter {
  id:string;
  baseId: string; // ID of the base creature from config, used to retrieve correct assets
  name: string;
  spriteUrl: string;
  spriteUrlDietro?: string;
  evolvedSpriteUrl?: string;
  spriteAiHint: string;
  creatureType: CreatureType;
  archetype?: Archetype;
  isUnique?: boolean;
  isEvolved?: boolean;
  maxHealth: number;
  currentHealth: number;
  attacks: Attack[];
  statusEffects: StatusEffect[];
  
  // Base Stats
  attackStat: number;
  defenseStat: number;
  specialAttackStat: number;
  specialDefenseStat: number;
  speedStat: number;
  luckStat: number;

  // Current Effective Stats (used in battle calculations and display)
  currentAttackStat: number;
  currentDefenseStat: number;
  currentSpecialAttackStat: number;
  currentSpecialDefenseStat: number;
  currentSpeedStat: number;
  currentLuckStat: number;

  trustLevel: number;
  maxTrustLevel: number;
  totalTrustPoints?: number;

  // New Leveling System Fields
  level: number;
  currentXP: number;
  xpToNextLevel: number;

  unlockedAttackIds?: string[];
  highestGymBeaten?: number;

  inventory?: Record<string, { item: ConsumableItem; quantity: number }>;
  money?: number;
  trainerName?: string;

  // New fields for Trainer Ranking
  trainerRankPoints?: number;
  attemptsRemaining?: number;
  suicideCount?: number;
  battlesWon?: number;

  // New field for Covo attempts
  covoAttemptsRemaining?: Record<CovoSize, number>;
  covoOpponentsDefeated?: Record<CovoSize, number>;


  // Steroid Effects
  activeSteroids?: Partial<Record<FighterBaseStatKeys | 'all', { battlesRemaining: number }>>;

  // Viandante Maestro
  viandanteMaestroVisible?: boolean;
  viandanteMaestroBattlesRemaining?: number;

  // Sorcerer Tent
  sorcererTentVisible?: boolean;
  masterSorcererTentVisible?: boolean;
  
  // Quests
  activeQuests?: QuestState;
  didNotUseConsumables?: boolean;

  // Arena
  arenaDisclaimerAccepted?: boolean;
  defeatedBy?: string | null;
}

export type LogMessagePart = string | { type: 'attack'; attackId: string; attackName: string };

export interface BattleLogEntry {
  id: string;
  message: LogMessagePart[];
  timestamp: number;
}

export type BattleOutcomePlayerWins = 'player';
export type BattleOutcomeOpponentWins = 'opponent';
export type BattleOutcomeDraw = 'draw';
export type BattleOutcomePlayerCaptured = { type: 'player_captured_opponent'; opponentName: string };

export type BattleWinner = 
  | BattleOutcomePlayerWins
  | BattleOutcomeOpponentWins
  | BattleOutcomeDraw
  | BattleOutcomePlayerCaptured
  | null;

export type StatAnalysisCategory = 'strong' | 'weak' | 'normal';
export type AnalyzedStats = Record<FighterBaseStatKeys, StatAnalysisCategory>;
