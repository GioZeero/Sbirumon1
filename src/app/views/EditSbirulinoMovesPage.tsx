

'use client';

import React from 'react';
import type { Fighter, Attack } from '@/types/battle';
import EditSbirulinoMovesClientView from '@/app/items/moves/edit/edit-moves-view';
import type { View } from './types';

interface EditSbirulinoMovesPageProps {
  onNavigate: (view: View) => void;
  trainerName: string;
  menuPlayerData: Fighter | null;
  allGameAttacks: Attack[];
}

export const EditSbirulinoMovesPage = ({ onNavigate, menuPlayerData, allGameAttacks }: EditSbirulinoMovesPageProps) => {
    if (!menuPlayerData) return null;

    const unlockedIds = new Set(menuPlayerData.unlockedAttackIds || []);
    const availableAttacks = allGameAttacks.filter(attack => unlockedIds.has(attack.id));

    return <EditSbirulinoMovesClientView sbirulinoInitial={menuPlayerData} availableAttacksInitial={availableAttacks} onNavigate={onNavigate} />;
};
