

// src/config/game-balance.ts

/**
 * @fileOverview Centralized game balance parameters.
 * This file contains constants for formulas, percentages, and other parameters
 * related to moves, consumables, status effects, leveling, and general game mechanics.
 * Modifying these values will affect the overall game balance.
 */

export const GameBalance = {
  // Battle Mechanics - Turn Limit
  MAX_BATTLE_TURNS: 20,

  // Critical Hits
  CRITICAL_HIT_LUCK_POINT_TO_PROBABILITY_FACTOR: 0.001,
  CRITICAL_HIT_DAMAGE_MULTIPLIER: 2.0,

  // Consumables - Healing
  POTION_HEAL_AMOUNT: 50,
  SUPERPOTION_HEAL_AMOUNT: 100,
  ANTIDOTE_HEAL_AMOUNT: 10,
  ANTISCOTTATURA_HEAL_AMOUNT: 10,
  CURA_TOTALE_HEAL_PERCENTAGE: 1.0,

  // Consumables - Stat Boosters (Permanent)
  STAT_BOOST_CONSUMABLE_PERCENTAGE: 0.15,

  // Consumables - Special
  CREATINA_LEVEL_UP_AMOUNT: 1,

  // Status Effects - Durations
  BURN_DURATION: 2,
  POISON_DURATION: 3,


  // Status Effects - Damage/Boost Percentages
  BURN_DAMAGE_MAX_HEALTH_PERCENTAGE: 0.20,
  POISON_BASE_DAMAGE_MAX_HEALTH_PERCENTAGE: 0.05,


  // Leveling
  XP_TO_NEXT_LEVEL_INCREASE_FACTOR: 0.25,
  LEVEL_UP_HEALTH_INCREASE_PERCENTAGE: 0.05,
  LEVEL_UP_STAT_INCREASE_PERCENTAGE_FAST: 0.10,
  LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL: 0.05,
  LEVEL_UP_STAT_INCREASE_PERCENTAGE_SLOW: 0.01,
  MIN_STAT_INCREASE_ON_LEVEL_UP: 1,
  MIN_STAT_INCREASE_ON_LEVEL_UP_ZERO_BASE: 0,
  BASE_STAT_VALUE_FOR_SCOUTING: 10, // The baseline stat value for a level 1 creature in scout analysis.


  // Battle Mechanics - General Delays (in milliseconds)
  OPPONENT_TURN_DELAY_MS: 1500,
  PLAYER_AUTO_ATTACK_DELAY_MS: 1500, // Delay for auto-battle mode
  ITEM_USE_DELAY_MS: 1500,
  SCOUT_ACTION_DELAY_MS: 1000,
  SCOUT_REVEAL_DURATION_MS: 3000,

  // Battle Mechanics - UI
  MAX_LOG_ENTRIES: 30,

  // Battle Mechanics - Player Specific Actions
  BLOCK_ACTION_TRUST_COST: 1, // This cost is now for re-rolling the chosen attack
  CHARGE_ACTION_EXTRA_TURNS_GAINED: 2,
  SCOUT_STRONG_THRESHOLD: 1.3,
  SCOUT_WEAK_THRESHOLD: 0.7,

  // Fighter Initialization - Player
  INITIAL_PLAYER_POTION_COUNT: 1,
  INITIAL_PLAYER_SBIRUBALL_COUNT: 1,

  // Capture Mechanics
  SBIRUBALL_CAPTURE_CHANCE: 0.5,
  DEFAULT_TRUST_LEVEL_AFTER_CAPTURE: 3,


  // Fighter Initialization - Opponent Randomization
  OPPONENT_RANDOM_MAX_HEALTH_MIN: 50,
  OPPONENT_RANDOM_MAX_HEALTH_MAX: 150,

  // Weighted Random Attack Selection (Player & Opponent)
  ATTACK_RARITY_WEIGHTS: {
    COMMON: 6,
    RARE: 3,
    EPIC: 1,
    DEFAULT: 1,
  },
   ATTACK_RARITY_WEIGHTS_EVOLVED: {
    COMMON: 50,
    RARE: 30,
    EPIC: 15,
    LEGENDARY: 5,
    DEFAULT: 1,
  },
  
  // Remains Drop Chance from Suicide
  REMAINS_DROP_CHANCE: 0.3,
  REMAINS_EVOLVE_CHANCE: 0.7,

  // Evolution
  TRUST_POINTS_FOR_EVOLUTION: 500,
  OPPONENT_EVOLVED_CHANCE_LVL_15: 0.3,
  OPPONENT_EVOLVED_CHANCE_LVL_20: 0.5,
  OPPONENT_EVOLVED_CHANCE_LVL_30: 0.8,
  OPPONENT_EVOLVED_CHANCE_LVL_35: 0.95,


} as const;
