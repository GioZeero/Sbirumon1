

import type { Fighter, Attack, StatusEffect, BattleWinner, FighterBaseStatKeys, FighterCurrentStatKeys, CreatureType, AnalyzedStats, StatAnalysisCategory, Archetype, LogMessagePart } from '@/types/battle';
import { STATUS_EFFECTS } from '@/config/statusEffects';
import { GameBalance } from '@/config/game-balance';

export interface ActionResult {
  updatedAttacker: Fighter;
  updatedTarget: Fighter;
  logMessages: LogMessagePart[][];
  damageDealt?: number;
  effectApplied?: string | null;
  attackIcon?: string;
}

// Helper functions for robust cloning
export function cloneAttack(attack: Attack): Attack {
  return JSON.parse(JSON.stringify(attack));
}

export function cloneStatusEffect(effect: StatusEffect): StatusEffect {
  return JSON.parse(JSON.stringify(effect));
}

export function cloneFighter(fighter: Fighter): Fighter {
    // A more robust deep clone function to prevent reference sharing.
    return {
      ...fighter,
      attacks: fighter.attacks.map(cloneAttack),
      statusEffects: fighter.statusEffects.map(cloneStatusEffect),
      inventory: fighter.inventory ? JSON.parse(JSON.stringify(fighter.inventory)) : {},
      unlockedAttackIds: fighter.unlockedAttackIds ? [...fighter.unlockedAttackIds] : [],
      covoAttemptsRemaining: fighter.covoAttemptsRemaining ? {...fighter.covoAttemptsRemaining} : undefined,
    };
}


const typeChart: Record<CreatureType, { strongAgainst: CreatureType[], weakAgainst: CreatureType[] }> = {
    Fire:  { strongAgainst: ['Grass', 'Dark'], weakAgainst: ['Water', 'Light'] },
    Water: { strongAgainst: ['Fire', 'Light'], weakAgainst: ['Grass', 'Dark'] },
    Grass: { strongAgainst: ['Water', 'Light'], weakAgainst: ['Fire', 'Dark'] },
    Light: { strongAgainst: ['Dark', 'Fire'],  weakAgainst: ['Water', 'Grass'] },
    Dark:  { strongAgainst: ['Water', 'Grass'], weakAgainst: ['Fire', 'Light'] },
};

// Type advantage logic
function getAttackEffectiveness(moveType: CreatureType, targetType: CreatureType): { multiplier: number; message?: string } {
  if (typeChart[moveType]?.strongAgainst.includes(targetType)) {
    return { multiplier: 1.5, message: "È super efficace!" };
  }
  if (typeChart[moveType]?.weakAgainst.includes(targetType)) {
    return { multiplier: 0.5, message: "Non è molto efficace..." };
  }
  return { multiplier: 1.0 };
}

export function checkSuperEffective(moveType: CreatureType, targetType: CreatureType): boolean {
    return typeChart[moveType]?.strongAgainst.includes(targetType) || false;
}

export function checkIneffective(moveType: CreatureType, targetType: CreatureType): boolean {
    return typeChart[moveType]?.weakAgainst.includes(targetType) || false;
}


function applyStatModifiersToFighter(fighter: Fighter): Fighter {
    const modifiedFighter = cloneFighter(fighter);
    
    // Reset current stats to base stats before applying modifiers
    modifiedFighter.currentAttackStat = modifiedFighter.attackStat;
    modifiedFighter.currentDefenseStat = modifiedFighter.defenseStat;
    modifiedFighter.currentSpecialAttackStat = modifiedFighter.specialAttackStat;
    modifiedFighter.currentSpecialDefenseStat = modifiedFighter.specialDefenseStat;
    modifiedFighter.currentSpeedStat = modifiedFighter.speedStat;
    modifiedFighter.currentLuckStat = modifiedFighter.luckStat;

    // Apply modifiers from status effects
    (modifiedFighter.statusEffects || []).forEach(effectInstance => {
        const effectDefinition = STATUS_EFFECTS[effectInstance.id] || effectInstance;
        if (effectDefinition.statModifiers) {
            for (const key in effectDefinition.statModifiers) {
                const statKey = key as FighterBaseStatKeys;
                // Construct the corresponding 'current' stat key
                const currentStatKey = `current${statKey.charAt(0).toUpperCase() + statKey.slice(1)}` as FighterCurrentStatKeys;
                const modifier = effectDefinition.statModifiers[statKey]!;
                
                // Ensure the key exists on the fighter object before modifying
                if (currentStatKey in modifiedFighter) {
                    modifiedFighter[currentStatKey] = Math.max(1, Math.round(modifiedFighter[currentStatKey] * modifier));
                }
            }
        }
    });

    return modifiedFighter;
}


export function checkPreTurnStatusEffects(fighterInput: Fighter): {
    canMove: boolean;
    isConfused: boolean;
    logMessages: LogMessagePart[][];
    updatedFighter: Fighter;
} {
    let fighter = cloneFighter(fighterInput);
    const logMessages: LogMessagePart[][] = [];
    let canMove = true;
    let isConfused = false;

    const remainingEffects: StatusEffect[] = [];

    for (const effect of fighter.statusEffects) {
        let currentEffect = cloneStatusEffect(effect);
        const effectDefinition = STATUS_EFFECTS[currentEffect.id] || currentEffect;

        // Apply start-of-turn damage/effects
        if (effectDefinition.onTurnStartDamage) {
            const { healthChange, logMessage: damageLog } = effectDefinition.onTurnStartDamage(fighter, currentEffect);
            if (healthChange !== 0) {
                fighter.currentHealth = Math.max(0, Math.min(fighter.maxHealth, fighter.currentHealth + healthChange));
                if (damageLog) logMessages.push([`${fighter.name} `, ...damageLog]);
            }
             if (currentEffect.id === 'poison' && fighter.currentHealth > 0 && typeof currentEffect.currentStage === 'number') {
                currentEffect.currentStage++;
            }
        }
        
        // If the fighter faints from the start-of-turn damage, we stop further checks
        if (fighter.currentHealth <= 0) {
            logMessages.push([`${fighter.name} è stato sconfitto dagli effetti di stato!`]);
            canMove = false;
            // Keep the effect that caused the faint for this turn's log, but it will be gone next.
            currentEffect.duration = 1; 
            remainingEffects.push(currentEffect);
            break; 
        }

        // Check for move-preventing effects
        if (canMove && effectDefinition.onTurnStartCheck) {
            const result = effectDefinition.onTurnStartCheck(fighter, currentEffect);
            currentEffect = result.updatedEffect;

            if (result.logMessage) logMessages.push(result.logMessage);
            if (!result.canMove) canMove = false;
            if (result.isConfused) isConfused = true;
        }

        // Decrement duration and check for expiration
        currentEffect.duration--;

        if (currentEffect.duration > 0) {
            remainingEffects.push(currentEffect);
        } else {
            if(currentEffect.id === 'sleep') {
                logMessages.push([`${fighter.name} si è svegliato!`]);
            } else if (currentEffect.id === 'confusion') {
                logMessages.push([`${fighter.name} non è più confuso!`]);
            } else {
                 logMessages.push([`L'effetto ${currentEffect.name} su ${fighter.name} è svanito.`]);
            }
        }
    }

    fighter.statusEffects = remainingEffects;
    
    // Recalculate stats after effects have been updated (e.g., one expired)
    fighter = applyStatModifiersToFighter(fighter);

    return {
        canMove,
        isConfused,
        logMessages,
        updatedFighter: fighter,
    };
}


export function processAttack(
  attackerInput: Fighter,
  targetInput: Fighter,
  attack: Attack,
  isConfusedAndHittingSelf: boolean = false
): ActionResult {
  // Defensive cloning at the very beginning to prevent any reference issues.
  let attacker = cloneFighter(attackerInput);
  let target = isConfusedAndHittingSelf ? attacker : cloneFighter(targetInput);

  let logMessages: LogMessagePart[][] = [];
  let effectApplied: string | null = null;
  
  // Apply stat modifiers after cloning to ensure calculations are on the correct, isolated stats
  attacker = applyStatModifiersToFighter(attacker);
  if (!isConfusedAndHittingSelf) {
      target = applyStatModifiersToFighter(target);
  }

  const baseLogMessage: LogMessagePart[] = [
      `${attacker.name} usa `, 
      { type: 'attack', attackId: attack.id, attackName: attack.name }
  ];
  
  if (isConfusedAndHittingSelf) {
      logMessages.push([`${attacker.name} si colpisce da solo nella sua confusione`]);
  } else if (Math.random() > attack.accuracy) {
    logMessages.push([...baseLogMessage, `, ma manca il bersaglio!`]);
    return {
        updatedAttacker: attackerInput, // Return original state on miss
        updatedTarget: targetInput,
        logMessages,
        damageDealt: 0,
        attackIcon: attack.icon,
    };
  }

  // --- Damage Calculation ---
  let finalDamage = 0;
  let isCritical = false;
  
  if (attack.specialDamage === 'halve_hp') {
    finalDamage = Math.floor(target.currentHealth / 2);
    logMessages.push([...baseLogMessage, `... ${target.name} perde metà dei suoi PS!`]);
    target.currentHealth = Math.max(0, target.currentHealth - finalDamage);
  } else if (attack.damage < 0) { // Healing
    const healAmount = Math.abs(attack.damage);
    attacker.currentHealth = Math.min(attacker.maxHealth, attacker.currentHealth + healAmount);
    logMessages.push([...baseLogMessage, ` e si cura di ${healAmount} HP.`]);
    effectApplied = 'HandHelping'; // Generic healing icon
  } else if (attack.damage > 0) { // Damage dealing
    let calculatedDamage = 0;

    if (attack.category === 'Physical') {
        calculatedDamage = (attack.damage * attacker.currentAttackStat) / target.currentDefenseStat;
    } else if (attack.category === 'Special') {
        calculatedDamage = (attack.damage * attacker.currentSpecialAttackStat) / target.currentSpecialDefenseStat;
    }
    
    // Type effectiveness
    const effectiveness = getAttackEffectiveness(attack.creatureType, target.creatureType);
    calculatedDamage *= effectiveness.multiplier;
    if (effectiveness.message) logMessages.push([effectiveness.message]);

    // Critical hit
    const criticalChance = attacker.currentLuckStat * GameBalance.CRITICAL_HIT_LUCK_POINT_TO_PROBABILITY_FACTOR;
    if (Math.random() < criticalChance) {
        isCritical = true;
        calculatedDamage *= GameBalance.CRITICAL_HIT_DAMAGE_MULTIPLIER;
    }

    finalDamage = Math.max(1, Math.round(calculatedDamage));
    target.currentHealth = Math.max(0, target.currentHealth - finalDamage);

    let damageLog : LogMessagePart[] = [...baseLogMessage, ` e infligge ${finalDamage} danni.`];
    if (isCritical) damageLog.push(" Colpo Critico!");
    logMessages.push(damageLog);
    
    // Drain
    if (attack.drain) {
        const drainedHealth = Math.max(1, Math.floor(finalDamage * attack.drain));
        attacker.currentHealth = Math.min(attacker.maxHealth, attacker.currentHealth + drainedHealth);
        logMessages.push([`${attacker.name} ha assorbito ${drainedHealth} PS!`]);
    }

    // Recoil
    if (attack.recoil) {
        const recoilDamage = Math.max(1, Math.floor(finalDamage * attack.recoil));
        attacker.currentHealth = Math.max(0, attacker.currentHealth - recoilDamage);
        logMessages.push([`${attacker.name} subisce ${recoilDamage} danni di contraccolpo!`]);
    }
  } else { // Pure status move with 0 damage
      logMessages.push([...baseLogMessage, `.`]);
  }
  
  // --- Effect Application ---
  if (attack.effect && Math.random() < attack.effect.chance) {
    const statusProto = STATUS_EFFECTS[attack.effect.statusId];
    if (statusProto) {
      const newStatus: StatusEffect = cloneStatusEffect(statusProto);
      
      let fighterToApplyEffectTo = attack.effect.target === 'self' ? attacker : target;
      
      const existingEffectIndex = fighterToApplyEffectTo.statusEffects.findIndex(se => se.id === newStatus.id);

      if (existingEffectIndex !== -1) {
        fighterToApplyEffectTo.statusEffects[existingEffectIndex] = newStatus;
        logMessages.push([`L'effetto ${newStatus.name} su ${fighterToApplyEffectTo.name} è stato rinfrescato.`]);
      } else {
        fighterToApplyEffectTo.statusEffects.push(newStatus);
        logMessages.push([`${fighterToApplyEffectTo.name} è ora affetto da ${newStatus.name}!`]);
      }
      effectApplied = newStatus.id;
      // Recalculate stats immediately after applying a new effect
      fighterToApplyEffectTo = applyStatModifiersToFighter(fighterToApplyEffectTo);
      if (attack.effect.target === 'self') {
        attacker = fighterToApplyEffectTo;
      } else {
        target = fighterToApplyEffectTo;
      }
    }
  }

  if (attack.curesAllStatusOnSelf) {
    if (attacker.statusEffects && attacker.statusEffects.length > 0) {
      logMessages.push([`${attacker.name} si è purificato da tutti gli stati alterati!`]);
      attacker.statusEffects = [];
      effectApplied = 'generic_buff';
      // Recalculate stats after clearing effects
      attacker = applyStatModifiersToFighter(attacker);
    }
  }
  
  return {
    updatedAttacker: attacker,
    updatedTarget: target,
    logMessages,
    damageDealt: finalDamage,
    effectApplied,
    attackIcon: attack.icon,
  };
}


export function applyEndOfTurnStatusEffects(fighterInput: Fighter): Fighter {
  let fighter = cloneFighter(fighterInput);
  const remainingEffects: StatusEffect[] = [];

  for (const effect of fighter.statusEffects) {
      let currentEffect = cloneStatusEffect(effect);
      
      // Post-turn duration decrement was here, but it's now all handled in pre-turn checks.
      // This function can be used for effects that specifically say "at the end of the turn"
      // but for now, we just ensure effects are managed correctly.
      if (currentEffect.duration > 0) {
          remainingEffects.push(currentEffect);
      } else {
          // This log is a fallback, the main "faded" log is in checkPreTurn
      }
  }
  fighter.statusEffects = remainingEffects;
  return applyStatModifiersToFighter(fighter);
}

export function checkWinner(player: Fighter, opponent: Fighter): BattleWinner {
  const playerDefeated = player.currentHealth <= 0;
  const opponentDefeated = opponent.currentHealth <= 0;

  if (playerDefeated) return 'opponent'; // Player loss takes priority
  if (opponentDefeated) return 'player';
  
  return null;
}

function calculateLevelUpForScout(fighter: Fighter): Fighter {
    const { LEVEL_UP_STAT_INCREASE_PERCENTAGE_FAST, LEVEL_UP_STAT_INCREASE_PERCENTAGE_SLOW, LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL, MIN_STAT_INCREASE_ON_LEVEL_UP } = GameBalance;
    const archetype = fighter.archetype || 'Balanced';
    const newFighter = cloneFighter(fighter);

    const statGrowth: Record<FighterBaseStatKeys, number> = {
        attackStat: archetype === 'Physical' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_FAST : archetype === 'Special' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_SLOW : LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
        defenseStat: archetype === 'Physical' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_FAST : archetype === 'Special' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_SLOW : LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
        specialAttackStat: archetype === 'Special' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_FAST : archetype === 'Physical' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_SLOW : LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
        specialDefenseStat: archetype === 'Special' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_FAST : archetype === 'Physical' ? LEVEL_UP_STAT_INCREASE_PERCENTAGE_SLOW : LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
        speedStat: LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
        luckStat: LEVEL_UP_STAT_INCREASE_PERCENTAGE_NORMAL,
    };

    (Object.keys(statGrowth) as FighterBaseStatKeys[]).forEach(statKey => {
        const baseValue = newFighter[statKey];
        const growthRate = statGrowth[statKey];
        const increase = Math.max(MIN_STAT_INCREASE_ON_LEVEL_UP, Math.floor(baseValue * growthRate));
        newFighter[statKey] += increase;
    });

    return newFighter;
}

export function analyzeOpponentStats(opponent: Fighter): AnalyzedStats {
    let baselineFighter: Fighter = {
        id: 'baseline', name: 'Baseline', spriteUrl: '', spriteAiHint: '', creatureType: 'Light',
        archetype: opponent.archetype, // Use the opponent's archetype for accurate comparison
        maxHealth: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING, currentHealth: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING,
        attacks: [], statusEffects: [], level: 1, currentXP: 0, xpToNextLevel: 100,
        attackStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING, defenseStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING,
        specialAttackStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING, specialDefenseStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING,
        speedStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING, luckStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING,
        currentAttackStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING, currentDefenseStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING,
        currentSpecialAttackStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING, currentSpecialDefenseStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING,
        currentSpeedStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING, currentLuckStat: GameBalance.BASE_STAT_VALUE_FOR_SCOUTING,
        trustLevel: 0, maxTrustLevel: 10,
    };

    if (opponent.level > 1) {
        for (let i = 1; i < opponent.level; i++) {
            baselineFighter = calculateLevelUpForScout(baselineFighter);
        }
    }

    const analysis: AnalyzedStats = {} as AnalyzedStats;
    const statsToAnalyze: FighterBaseStatKeys[] = ['attackStat', 'defenseStat', 'specialAttackStat', 'specialDefenseStat', 'speedStat', 'luckStat'];

    statsToAnalyze.forEach(stat => {
        const opponentStat = opponent[stat];
        const baselineStat = baselineFighter[stat];
        let category: StatAnalysisCategory = 'normal';

        if (opponentStat > baselineStat * GameBalance.SCOUT_STRONG_THRESHOLD) {
            category = 'strong';
        } else if (opponentStat < baselineStat * GameBalance.SCOUT_WEAK_THRESHOLD) {
            category = 'weak';
        }
        analysis[stat] = category;
    });

    return analysis;
}

    