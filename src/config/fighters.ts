

import type { Fighter, Attack, CreatureType, AttackCategory, Archetype } from '@/types/battle';
import { Bone, Flame, HandHelping, Zap, Droplets, Shield, ShieldBan, BatteryCharging, ShieldAlert, type LucideIcon, ArrowUp, ArrowDown, TrendingUp, MoreHorizontal, Leaf, Sun, Moon, Feather, Bird, BrainCircuit, PersonStanding, Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, Hand, Sparkles, Sword, ScrollText, Undo2, Package, UserCircle, Search } from 'lucide-react';

export const attackIconMap: Record<string, LucideIcon> = {
  Bone, Flame, HandHelping, Zap, Droplets, Shield, ShieldBan, BatteryCharging, ShieldAlert,
  TrendingUp, MoreHorizontal, Leaf, Sun, Moon, Feather, Bird, BrainCircuit, PersonStanding,
  Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, Hand, Sparkles
};


// Tentennamento placeholder move
export const TentennamentoAttack: Attack = {
  id: 'tentennamento',
  name: 'Tentennamento',
  damage: 0,
  accuracy: 1.0,
  creatureType: 'Light',
  category: 'Status',
  rarity: 'Common',
  icon: 'MoreHorizontal',
};

// --- NEW MOVE LIST ---
const AttaccoDAla: Attack = { id: 'attacco_d_ala', name: 'Attacco d\'Ala', damage: 25, accuracy: 0.8, creatureType: 'Light', category: 'Physical', rarity: 'Common', icon: 'Feather' };
const Bollaraggio: Attack = { id: 'bollaraggio', name: 'Bollaraggio', damage: 65, accuracy: 1.0, creatureType: 'Water', category: 'Special', rarity: 'Epic', icon: 'Waves' };
const Botta: Attack = { id: 'botta', name: 'Botta', damage: 40, accuracy: 1.0, creatureType: 'Dark', category: 'Physical', rarity: 'Rare', icon: 'Bone' };
const Braciere: Attack = { id: 'braciere', name: 'Braciere', damage: 30, accuracy: 1.0, creatureType: 'Fire', category: 'Special', rarity: 'Rare', icon: 'Flame', effect: { statusId: 'burn', target: 'opponent', chance: 0.15 } };
const ConfusioneMove: Attack = { id: 'confusione_move', name: 'Confusione', damage: 30, accuracy: 1.0, creatureType: 'Dark', category: 'Special', rarity: 'Rare', icon: 'BrainCircuit', effect: { statusId: 'confusion', target: 'opponent', chance: 0.25 } };
const Crescita: Attack = { id: 'crescita', name: 'Crescita', damage: 0, accuracy: 1.0, creatureType: 'Grass', category: 'Special', rarity: 'Epic', icon: 'TrendingUp', effect: { statusId: 'crescita_buff', target: 'self', chance: 1.0 } };
const Danza: Attack = { id: 'danza', name: 'Danza', damage: 0, accuracy: 1.0, creatureType: 'Light', category: 'Special', rarity: 'Rare', icon: 'PersonStanding', effect: { statusId: 'danza_buff', target: 'self', chance: 1.0 } };
const Doppiocalcio: Attack = { id: 'doppiocalcio', name: 'Doppiocalcio', damage: 50, accuracy: 0.6, creatureType: 'Dark', category: 'Physical', rarity: 'Common', icon: 'Footprints' };
const Energipugno: Attack = { id: 'energipugno', name: 'Energipugno', damage: 65, accuracy: 0.9, creatureType: 'Fire', category: 'Physical', rarity: 'Epic', icon: 'Hand', effect: { statusId: 'burn', target: 'opponent', chance: 0.15 } };
const Fulmine: Attack = { id: 'fulmine', name: 'Fulmine', damage: 25, accuracy: 1.0, creatureType: 'Fire', category: 'Special', rarity: 'Rare', icon: 'Zap', effect: { statusId: 'paralysis', target: 'opponent', chance: 0.5 } };
const GasVenenoso: Attack = { id: 'gas_venenoso', name: 'Gas Venenoso', damage: 0, accuracy: 0.75, creatureType: 'Grass', category: 'Special', rarity: 'Common', icon: 'Wind', effect: { statusId: 'poison', target: 'opponent', chance: 1.0 } };
const Graffio: Attack = { id: 'graffio', name: 'Graffio', damage: 20, accuracy: 1.0, creatureType: 'Dark', category: 'Physical', rarity: 'Common', icon: 'Hand' };
const Schizzo: Attack = { id: 'schizzo', name: 'Schizzo', damage: 20, accuracy: 1.0, creatureType: 'Water', category: 'Special', rarity: 'Common', icon: 'Droplets' };
const Idropompa: Attack = { id: 'idropompa', name: 'Idropompa', damage: 50, accuracy: 0.8, creatureType: 'Water', category: 'Special', rarity: 'Rare', icon: 'Waves' };
const Ipnosi: Attack = { id: 'ipnosi', name: 'Ipnosi', damage: 0, accuracy: 0.7, creatureType: 'Dark', category: 'Status', rarity: 'Rare', icon: 'CircleDashed', effect: { statusId: 'sleep', target: 'opponent', chance: 1.0 } };
const Lanciafiamme: Attack = { id: 'lanciafiamme', name: 'Lanciafiamme', damage: 60, accuracy: 0.85, creatureType: 'Fire', category: 'Special', rarity: 'Rare', icon: 'Flame', effect: { statusId: 'burn', target: 'opponent', chance: 0.2 } };
const Leccata: Attack = { id: 'leccata', name: 'Leccata', damage: 15, accuracy: 1.0, creatureType: 'Dark', category: 'Physical', rarity: 'Common', icon: 'Hand', effect: { statusId: 'paralysis', target: 'opponent', chance: 0.3 } };
const Megacalcio: Attack = { id: 'megacalcio', name: 'Megacalcio', damage: 85, accuracy: 0.80, creatureType: 'Dark', category: 'Physical', rarity: 'Epic', icon: 'Footprints' };
const Pistolacqua: Attack = { id: 'pistolacqua', name: 'Pistolacqua', damage: 35, accuracy: 0.85, creatureType: 'Water', category: 'Special', rarity: 'Common', icon: 'Droplets' };
const Ruggito: Attack = { id: 'ruggito', name: 'Ruggito', damage: 0, accuracy: 1.0, creatureType: 'Dark', category: 'Special', rarity: 'Common', icon: 'Volume2', effect: { statusId: 'ruggito_debuff', target: 'opponent', chance: 1.0 } };
const Sanguisuga: Attack = { id: 'sanguisuga', name: 'Sanguisuga', damage: 20, accuracy: 1.0, creatureType: 'Grass', category: 'Special', rarity: 'Rare', icon: 'Leaf', drain: 0.5 };
const Schianto: Attack = { id: 'schianto', name: 'Schianto', damage: 55, accuracy: 1.0, creatureType: 'Dark', category: 'Physical', rarity: 'Common', icon: 'Bone', recoil: 0.33 };
const Sonnifero: Attack = { id: 'sonnifero', name: 'Sonnifero', damage: 0, accuracy: 1.0, creatureType: 'Grass', category: 'Status', rarity: 'Epic', icon: 'Bed', effect: { statusId: 'sleep', target: 'opponent', chance: 1.0 } };
const Stridio: Attack = { id: 'stridio', name: 'Stridio', damage: 0, accuracy: 0.85, creatureType: 'Light', category: 'Status', rarity: 'Rare', icon: 'ShieldBan', effect: { statusId: 'stridio_debuff', target: 'opponent', chance: 1.0 } };
const Superdente: Attack = { id: 'superdente', name: 'Superdente', damage: 0, accuracy: 0.7, creatureType: 'Dark', category: 'Physical', rarity: 'Rare', icon: 'Bone', specialDamage: 'halve_hp' };
const Terremoto: Attack = { id: 'terremoto', name: 'Terremoto', damage: 80, accuracy: 0.7, creatureType: 'Dark', category: 'Special', rarity: 'Rare', icon: 'Mountain' };
const Tuono: Attack = { id: 'tuono', name: 'Tuono', damage: 55, accuracy: 1.0, creatureType: 'Light', category: 'Special', rarity: 'Epic', icon: 'Zap', effect: { statusId: 'paralysis', target: 'opponent', chance: 1.0 } };
const Velenospina: Attack = { id: 'velenospina', name: 'Velenospina', damage: 15, accuracy: 1.0, creatureType: 'Dark', category: 'Physical', rarity: 'Common', icon: 'Sprout', effect: { statusId: 'poison', target: 'opponent', chance: 0.5 } };

// --- VIANDANTE MAESTRO MOVES ---
// Ashbringer (Fire)
const Eruzione: Attack = { id: 'eruzione', name: 'Eruzione', damage: 10, accuracy: 1.0, creatureType: 'Fire', category: 'Special', rarity: 'Common', icon: 'Flame' };
const AnelloDiFuoco: Attack = { id: 'anello_di_fuoco', name: 'Anello di Fuoco', damage: 30, accuracy: 0.8, creatureType: 'Fire', category: 'Special', rarity: 'Rare', icon: 'Flame' };
const Supernova: Attack = { id: 'supernova', name: 'Supernova', damage: 70, accuracy: 0.5, creatureType: 'Fire', category: 'Special', rarity: 'Epic', icon: 'Flame' };
// Abysswalker (Water)
const Maremoto: Attack = { id: 'maremoto', name: 'Maremoto', damage: 10, accuracy: 1.0, creatureType: 'Water', category: 'Physical', rarity: 'Common', icon: 'Waves' };
const Abisso: Attack = { id: 'abisso', name: 'Abisso', damage: 30, accuracy: 0.8, creatureType: 'Water', category: 'Status', rarity: 'Rare', icon: 'Waves' };
const Leviatano: Attack = { id: 'leviatano', name: 'Leviatano', damage: 70, accuracy: 0.5, creatureType: 'Water', category: 'Physical', rarity: 'Epic', icon: 'Waves' };
// Earthshaker (Grass)
const Radici: Attack = { id: 'radici', name: 'Radici', damage: 10, accuracy: 1.0, creatureType: 'Grass', category: 'Physical', rarity: 'Common', icon: 'Sprout' };
const TerremotoMaestro: Attack = { id: 'terremoto_maestro', name: 'Terremoto Maestro', damage: 30, accuracy: 0.8, creatureType: 'Grass', category: 'Physical', rarity: 'Rare', icon: 'Mountain' };
const FuriaDellaNatura: Attack = { id: 'furia_della_natura', name: 'Furia della Natura', damage: 70, accuracy: 0.5, creatureType: 'Grass', category: 'Status', rarity: 'Epic', icon: 'Mountain' };
// Lightbringer (Light)
const LuceAccecante: Attack = { id: 'luce_accecante', name: 'Luce Accecante', damage: 10, accuracy: 1.0, creatureType: 'Light', category: 'Status', rarity: 'Common', icon: 'Sun' };
const LanciaSolare: Attack = { id: 'lancia_solare', name: 'Lancia Solare', damage: 30, accuracy: 0.8, creatureType: 'Light', category: 'Special', rarity: 'Rare', icon: 'Sun' };
const IraDivina: Attack = { id: 'ira_divina', name: 'Ira Divina', damage: 70, accuracy: 0.5, creatureType: 'Light', category: 'Special', rarity: 'Epic', icon: 'Sun' };
// Voidreaver (Dark)
const OmbraFurtiva: Attack = { id: 'ombra_furtiva', name: 'Ombra Furtiva', damage: 10, accuracy: 1.0, creatureType: 'Dark', category: 'Physical', rarity: 'Common', icon: 'Moon' };
const Vuoto: Attack = { id: 'vuoto', name: 'Vuoto', damage: 30, accuracy: 0.8, creatureType: 'Dark', category: 'Status', rarity: 'Rare', icon: 'Moon' };
const Oblio: Attack = { id: 'oblio', name: 'Oblio', damage: 70, accuracy: 0.5, creatureType: 'Dark', category: 'Special', rarity: 'Epic', icon: 'Moon' };

// Legendary Moves
const GiudizioUniversale: Attack = { id: 'giudizio_universale', name: 'Giudizio Universale', damage: 125, accuracy: 0.65, creatureType: 'Light', category: 'Special', rarity: 'Legendary', icon: 'Sun' };
const BucoNero: Attack = { id: 'buco_nero', name: 'Buco Nero', damage: 90, accuracy: 1.0, creatureType: 'Dark', category: 'Special', rarity: 'Legendary', icon: 'Moon', effect: { statusId: 'paralysis', target: 'opponent', chance: 0.3 } };
const Inferno: Attack = { id: 'inferno', name: 'Inferno', damage: 100, accuracy: 0.85, creatureType: 'Fire', category: 'Special', rarity: 'Legendary', icon: 'Flame', effect: { statusId: 'burn', target: 'opponent', chance: 1.0 } };
const GeyserPrimordiale: Attack = { id: 'geyser_primordiale', name: 'Geyser Primordiale', damage: 110, accuracy: 0.8, creatureType: 'Water', category: 'Special', rarity: 'Legendary', icon: 'Waves' };
const Genesi: Attack = { id: 'genesi', name: 'Genesi', damage: 0, accuracy: 1.0, creatureType: 'Light', category: 'Status', rarity: 'Legendary', icon: 'Leaf', curesAllStatusOnSelf: true, effect: { statusId: 'crescita_buff', target: 'self', chance: 1.0 }};


export const VIANDANTE_MAESTRO_ATTACKS = [
    Eruzione, AnelloDiFuoco, Supernova, Maremoto, Abisso, Leviatano, Radici, TerremotoMaestro, FuriaDellaNatura,
    LuceAccecante, LanciaSolare, IraDivina, OmbraFurtiva, Vuoto, Oblio
];

const ALL_ATTACKS = [
    AttaccoDAla, Bollaraggio, Botta, Braciere, ConfusioneMove, Crescita,
    Danza, Doppiocalcio, Energipugno, Fulmine, GasVenenoso, Graffio, Schizzo, Idropompa, Ipnosi,
    Lanciafiamme, Leccata, Megacalcio, Pistolacqua, Ruggito, Sanguisuga, Schianto, Sonnifero, Stridio,
    Superdente, Terremoto, Tuono, Velenospina,
    GiudizioUniversale, BucoNero, Inferno, GeyserPrimordiale, Genesi
];

const createBaseFighter = (id: string, name: string, creatureType: CreatureType, archetype: Archetype, attacks: Attack[] = ALL_ATTACKS): Fighter => ({
    id, name, 
    baseId: id,
    spriteUrl: `/${id.replace('_base', '')}.png`,
    spriteUrlDietro: `/${id.replace('_base', '')}dietro.png`,
    evolvedSpriteUrl: `/${id.replace('_base', '')}_evo.png`,
    spriteAiHint: '',
    creatureType, archetype, attacks,
    maxHealth: 100, currentHealth: 100, statusEffects: [],
    attackStat: 10, defenseStat: 10, specialAttackStat: 10, specialDefenseStat: 10, speedStat: 10, luckStat: 10,
    currentAttackStat: 10, currentDefenseStat: 10, currentSpecialAttackStat: 10, currentSpecialDefenseStat: 10, currentSpeedStat: 10, currentLuckStat: 10,
    trustLevel: 3, maxTrustLevel: 10, level: 1, currentXP: 0, xpToNextLevel: 100,
});

// Original Balanced Creatures
const baseFighter1 = { ...createBaseFighter('infernalis_base', 'Infernalis', 'Fire', 'Balanced'), evolvedSpriteUrl: '/ashbringer.png', spriteAiHint: 'fire lion' };
const baseFighter2 = { ...createBaseFighter('voltaron_base', 'Voltaron', 'Water', 'Balanced'), evolvedSpriteUrl: '/abysswalker.png', spriteAiHint: 'water serpent' };
const baseFighter3 = { ...createBaseFighter('terramorpha_base', 'Terramorpha', 'Grass', 'Balanced'), evolvedSpriteUrl: '/earthshaker.png', spriteAiHint: 'earth golem' };
const baseFighter4 = { ...createBaseFighter('luminos_base', 'Luminos', 'Light', 'Balanced'), evolvedSpriteUrl: '/lightbringer.png', spriteAiHint: 'light spirit' };
const baseFighter5 = { ...createBaseFighter('umbrax_base', 'Umbrax', 'Dark', 'Balanced'), evolvedSpriteUrl: '/voidreaver.png', spriteAiHint: 'dark monster' };

// New Archetype Creatures
// Fire
const firePhysical = { ...createBaseFighter('pyrosaur_base', 'Pyrosaur', 'Fire', 'Physical'), spriteAiHint: 'fire dinosaur' };
const fireSpecial = createBaseFighter('magmavolt_base', 'Magmavolt', 'Fire', 'Special');
// Water
const waterPhysical = { ...createBaseFighter('krakentusk_base', 'Krakentusk', 'Water', 'Physical'), spriteAiHint: 'water kraken' };
const waterSpecial = createBaseFighter('nereidrin_base', 'Nereidrin', 'Water', 'Special');
// Grass
const grassPhysical = { ...createBaseFighter('gaiaclaw_base', 'Gaiaclaw', 'Grass', 'Physical'), spriteAiHint: 'grass tiger' };
const grassSpecial = createBaseFighter('floraspore_base', 'Floraspore', 'Grass', 'Special');
// Light
const lightPhysical = { ...createBaseFighter('solarihorn_base', 'Solarihorn', 'Light', 'Physical'), spriteAiHint: 'light rhino' };
const lightSpecial = createBaseFighter('luxwing_base', 'Luxwing', 'Light', 'Special');
// Dark
const darkPhysical = { ...createBaseFighter('noctusk_base', 'Noctusk', 'Dark', 'Physical'), spriteAiHint: 'dark boar' };
const darkSpecial = createBaseFighter('umbramage_base', 'Umbramage', 'Dark', 'Special');

// --- VIANDANTE MAESTRO CREATURES ---
const createMasterFighter = (id: string, name: string, creatureType: CreatureType, attacks: Attack[]): Fighter => {
    const baseFighter = createBaseFighter(id, name, creatureType, 'Balanced', attacks);
    baseFighter.attackStat = 15;
    baseFighter.defenseStat = 15;
    baseFighter.specialAttackStat = 15;
    baseFighter.specialDefenseStat = 15;
    baseFighter.speedStat = 15;
    baseFighter.luckStat = 15;
    baseFighter.isUnique = true;
    baseFighter.spriteUrl = `/${id}.png`;
    return baseFighter;
};

const ashbringer = { ...createMasterFighter('ashbringer', 'Ashbringer', 'Fire', [Eruzione, AnelloDiFuoco, Supernova]) };
const abysswalker = { ...createMasterFighter('abysswalker', 'Abysswalker', 'Water', [Maremoto, Abisso, Leviatano]) };
const earthshaker = { ...createMasterFighter('earthshaker', 'Earthshaker', 'Grass', [Radici, TerremotoMaestro, FuriaDellaNatura]) };
const lightbringer = { ...createMasterFighter('lightbringer', 'Lightbringer', 'Light', [LuceAccecante, LanciaSolare, IraDivina]) };
const voidreaver = { ...createMasterFighter('voidreaver', 'Voidreaver', 'Dark', [OmbraFurtiva, Vuoto, Oblio]) };


export function getAllGameAttacks(): Attack[] {
  return JSON.parse(JSON.stringify(ALL_ATTACKS));
}

export function getViandanteMaestroPool(): Fighter[] {
    return [ashbringer, abysswalker, earthshaker, lightbringer, voidreaver].map(f => JSON.parse(JSON.stringify(f)));
}

export function getCreaturePool(): Fighter[] {
    return [
        baseFighter1, baseFighter2, baseFighter3, baseFighter4, baseFighter5,
        firePhysical, fireSpecial, waterPhysical, waterSpecial, grassPhysical, grassSpecial,
        lightPhysical, lightSpecial, darkPhysical, darkSpecial
    ].map(f => JSON.parse(JSON.stringify(f)));
}


export function getFighterBases(): { player: Fighter, opponent: Fighter } {
  const creaturePool = getCreaturePool();
  const playerBase: Fighter = creaturePool[0]; // Fallback to first
  const opponentBase: Fighter = creaturePool[Math.floor(Math.random() * creaturePool.length)];

  for (const fighter of [playerBase, opponentBase]) {
    fighter.currentAttackStat = fighter.attackStat;
    fighter.currentDefenseStat = fighter.defenseStat;
    fighter.currentSpecialAttackStat = fighter.specialAttackStat;
    fighter.currentSpecialDefenseStat = fighter.specialDefenseStat;
    fighter.currentSpeedStat = fighter.speedStat;
    fighter.currentLuckStat = fighter.luckStat;
  }
  return { player: playerBase, opponent: opponentBase };
}
