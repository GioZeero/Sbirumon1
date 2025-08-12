

import type { Fighter, StatusEffect, LogMessagePart } from '@/types/battle';
import { GameBalance } from '@/config/game-balance';

export const STATUS_EFFECTS: Record<string, StatusEffect> = {
  burn: {
    id: 'burn',
    name: 'Scottatura',
    description: `Infligge ogni turno danni pari al ${(GameBalance.BURN_DAMAGE_MAX_HEALTH_PERCENTAGE * 100).toFixed(0)}% della vita massima del bersaglio. Dura ${GameBalance.BURN_DURATION} turni.`,
    duration: GameBalance.BURN_DURATION,
    icon: 'Flame',
    onTurnStartDamage: (target: Fighter) => {
      const damage = Math.round(target.maxHealth * GameBalance.BURN_DAMAGE_MAX_HEALTH_PERCENTAGE);
      return { healthChange: -damage, logMessage: [`è ferito gravemente dalla scottatura per ${damage} HP!`] };
    },
  },
  poison: {
    id: 'poison',
    name: 'Veleno',
    description: `Infligge danni pari al 10%, 20% e 40% della salute ATTUALE del bersaglio nei turni successivi. Dura ${GameBalance.POISON_DURATION} turni.`,
    duration: GameBalance.POISON_DURATION,
    icon: 'Droplets',
    onTurnStartDamage: (target: Fighter, effectInstance: StatusEffect) => {
      const stage = effectInstance.currentStage || 1;
      const damagePercentage = 0.10 * Math.pow(2, stage - 1); // 10% -> 20% -> 40%
      const calculatedDamage = Math.round(target.currentHealth * damagePercentage);
      
      let finalHealthChange = -calculatedDamage;
      let logMessageText = `subisce ${calculatedDamage} danni dal veleno (stadio ${stage})!`;

      if (target.currentHealth + finalHealthChange < 1) {
        if (target.currentHealth > 1) {
          finalHealthChange = -(target.currentHealth - 1);
          logMessageText += ` La sua salute non scende sotto 1 HP a causa del veleno.`;
        } else {
          finalHealthChange = 0; 
          logMessageText = `è già a 1 HP e il veleno non ha effetto aggiuntivo.`;
        }
      }
      
      return { healthChange: finalHealthChange, logMessage: [logMessageText] };
    },
    currentStage: 1,
  },
  paralysis: {
    id: 'paralysis',
    name: 'Paralisi',
    description: 'Può impedire alla creatura di attaccare.',
    duration: 4,
    icon: 'Zap',
    onTurnStartCheck: (target, effect) => {
        if (Math.random() < 0.3) { // 30% chance to be fully paralyzed
            return { canMove: false, isConfused: false, logMessage: [`${target.name} è paralizzato e non può muoversi!`], updatedEffect: effect };
        }
        return { canMove: true, isConfused: false, updatedEffect: effect };
    }
  },
  sleep: {
    id: 'sleep',
    name: 'Ipnotizzato',
    description: 'La creatura può solo attaccare. Le azioni di Blocco, Fuga e Altro sono disabilitate.',
    duration: 2,
    icon: 'Moon',
    onTurnStartCheck: (target, effect) => {
        // This effect no longer prevents movement on its own.
        // The UI will check for this effect's ID to disable specific buttons.
        if (effect.duration <= 1) { // Check if it's the last turn
             return { canMove: true, isConfused: false, logMessage: [`${target.name} si sta per svegliare!`], updatedEffect: effect };
        }
        return { canMove: true, isConfused: false, logMessage: [`${target.name} è ipnotizzato.`], updatedEffect: effect };
    }
  },
  confusion: {
    id: 'confusion',
    name: 'Confusione',
    description: 'Può portare la creatura a colpirsi da sola.',
    duration: 3,
    icon: 'BrainCircuit', // Example icon
    onTurnStartCheck: (target, effect) => {
        if (Math.random() < 0.3) { // 30% chance to hit self
            return { canMove: true, isConfused: true, logMessage: [`${target.name} è confuso e si colpisce da solo!`], updatedEffect: effect };
        }
        return { canMove: true, isConfused: false, updatedEffect: effect };
    }
  },
  flinch: {
    id: 'flinch',
    name: 'Tentennamento',
    description: 'La creatura è spaventata e non può muoversi.',
    duration: 1,
    icon: 'ShieldAlert',
    onTurnStartCheck: (target, effect) => {
        return { canMove: false, isConfused: false, logMessage: [`${target.name} tentenna!`], updatedEffect: effect };
    }
  },
  impaurita: {
    id: 'impaurita',
    name: 'Impaurita',
    description: 'La creatura è perennemente spaventata. Ha una probabilità del 15% di tentennare e saltare il turno.',
    duration: 999, // Effectively permanent
    icon: 'ShieldAlert',
    onTurnStartCheck: (target, effect) => {
        if (Math.random() < 0.15) {
            return { canMove: false, isConfused: false, logMessage: [`${target.name} è troppo spaventato per muoversi!`], updatedEffect: effect };
        }
        return { canMove: true, isConfused: false, updatedEffect: effect };
    }
  },
  carica_buff: {
    id: 'carica_buff',
    name: 'Carica',
    description: 'Il prossimo attacco sarà potenziato.',
    duration: 2, // Lasts for the current turn and the next action
    icon: 'BatteryCharging',
  },
  crescita_buff: {
    id: 'crescita_buff',
    name: 'Crescita',
    description: 'Attacco e Attacco Speciale aumentati.',
    duration: 3,
    icon: 'TrendingUp',
    statModifiers: { attackStat: 1.5, specialAttackStat: 1.5 }
  },
  danza_buff: {
    id: 'danza_buff',
    name: 'Danza',
    description: 'Attacco aumentato.',
    duration: 3,
    icon: 'TrendingUp',
    statModifiers: { attackStat: 1.50 }
  },
  acido_debuff: {
    id: 'acido_debuff',
    name: 'Debolezza Acida',
    description: 'Difesa Speciale diminuita.',
    duration: 3,
    icon: 'TrendingDown',
    statModifiers: { specialDefenseStat: 0.90 }
  },
  ruggito_debuff: {
    id: 'ruggito_debuff',
    name: 'Spaventato',
    description: 'Attacco diminuito.',
    duration: 3,
    icon: 'TrendingDown',
    statModifiers: { attackStat: 0.70 }
  },
  stridio_debuff: {
    id: 'stridio_debuff',
    name: 'Difesa Rotta',
    description: 'Difesa diminuita.',
    duration: 3,
    icon: 'TrendingDown',
    statModifiers: { defenseStat: 0.80 }
  },
  generic_buff: {
    id: 'generic_buff',
    name: 'Potenziamento',
    description: 'Statistiche aumentate.',
    duration: 1,
    icon: 'TrendingUp',
  },
  generic_debuff: {
    id: 'generic_debuff',
    name: 'Indebolimento',
    description: 'Statistiche diminuite.',
    duration: 1,
    icon: 'TrendingDown',
  }
};

      
