import type { LucideIcon } from "lucide-react";
import type { Fighter, Attack } from "./battle";
import type { ConsumableItem } from "./items";

export type QuestId = 'gran_maestro_quest' | 'sorcerer_quest' | 'master_sorcerer_quest' | 'shopkeeper_quest' | 'nerd_boss_quest';
export type QuestGiver = 'Gran Maestro' | 'Stregone' | 'Maestro Stregone' | 'Gestore Negozio' | 'Capo dei Nerd';

export interface Quest {
  id: QuestId;
  title: string;
  description: string;
  giver: QuestGiver;
  iconName: string;
  reward: number;
  isCompleted: boolean;
  // Specific requirements
  requiredMoveId?: string;
  requiredSacrificeTotalStats?: number;
  requiredRemainId?: string;
  requiredLevel?: number;
  // Helper for display
  requiredMoveName?: string;
  requiredRemainName?: string;
}

// Version of the quest object that is safe to store in Firestore (no complex objects like functions/components)
export type QuestDbData = Omit<Quest, 'iconName'>;

export interface QuestState {
  gran_maestro_quest: Quest;
  sorcerer_quest: Quest;
  master_sorcerer_quest: Quest;
  shopkeeper_quest: Quest;
  nerd_boss_quest: Quest;
}

export interface QuestStateDbData {
  gran_maestro_quest: QuestDbData;
  sorcerer_quest: QuestDbData;
  master_sorcerer_quest: QuestDbData;
  shopkeeper_quest: QuestDbData;
  nerd_boss_quest: QuestDbData;
}
