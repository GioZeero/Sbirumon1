

'use client';

import React from 'react';
import type { Fighter } from '@/types/battle';
import TrainerView from '@/app/trainer/trainer-view';
import type { View } from './types';

interface TrainerPageProps {
  onNavigate: (view: View) => void;
  trainerName: string;
  onResetProfile: () => void;
  handleRequestFullscreen: () => void;
  previousView: View;
  menuPlayerData: Fighter | null;
  hasUnreadMessages: boolean;
}

export const TrainerPage = ({ onNavigate, onResetProfile, handleRequestFullscreen, previousView, menuPlayerData, hasUnreadMessages }: TrainerPageProps) => {
    if (!menuPlayerData) return null;
    
    return <TrainerView player={menuPlayerData} onNavigate={onNavigate} onResetProfile={onResetProfile} onRequestFullscreen={handleRequestFullscreen} previousView={previousView} hasUnreadMessages={hasUnreadMessages} />;
};
