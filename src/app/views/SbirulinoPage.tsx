

'use client';

import React from 'react';
import type { Fighter, Attack } from '@/types/battle';
import SbirulinoClientView from '@/app/sbirulino/sbirulino-view';
import type { View } from './types';

interface SbirulinoPageProps {
  onNavigate: (view: View) => void;
  trainerName: string;
  previousView: View;
  menuPlayerData: Fighter | null;
  allGameAttacks: Attack[];
}

export const SbirulinoPage = ({ onNavigate, previousView, menuPlayerData, allGameAttacks }: SbirulinoPageProps) => {
  if (!menuPlayerData) return null;
  
  return <SbirulinoClientView initialSbirulino={menuPlayerData} allGameAttacks={allGameAttacks} onNavigate={onNavigate} previousView={previousView} />;
};
