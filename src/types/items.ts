
import type { FighterBaseStatKeys } from '@/types/battle';

export type ConsumableCategory = 'Cura' | 'Integratore Statistiche' | 'Speciale' | 'Strumenti di Cattura' | 'Resti' | 'Potenziamenti Illegali';
export type StatusEffectId = 'poison' | 'burn'; // Can be expanded from STATUS_EFFECTS keys

export interface HealingEffect {
  type: 'heal';
  amount?: number; // For fixed HP recovery
  percentage?: number; // For full heal (1.0 for 100%)
  curesStatus?: StatusEffectId[];
}

export interface StatBoostEffect {
  type: 'stat_boost';
  // For 'maxHealth', it's effectively boosting HP. For others, it's boosting the base stat.
  stat: FighterBaseStatKeys | 'maxHealth'; 
  percentage: number; // e.g., 0.15 for 15%
  // All stat boosts are considered permanent increases to base stats or maxHealth
}

export interface LevelUpEffect {
  type: 'level_up';
  levels: number;
}

export interface CaptureEffect {
  type: 'capture';
  chance: number; // Capture chance, e.g., 0.5 for 50%
}

export interface PlaceholderEffect {
    type: 'placeholder';
    description: string;
}

export interface GrowthBoostEffect {
    type: 'growth_boost';
    stat: FighterBaseStatKeys | 'all';
    percentage: number;
}

export interface EvolveChanceEffect {
    type: 'evolve_chance';
    chance: number; // 0-1
}


export interface ConsumableItem {
  id: string;
  name: string;
  description: string;
  category: ConsumableCategory;
  iconName: string; // Name of the Lucide icon
  effect: HealingEffect | StatBoostEffect | LevelUpEffect | CaptureEffect | PlaceholderEffect | GrowthBoostEffect | EvolveChanceEffect;
  cost: number;
}
