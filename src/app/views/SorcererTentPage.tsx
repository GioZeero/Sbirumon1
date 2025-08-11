

'use client';

import React, { useState, useEffect } from 'react';
import SorcererTentClientView from '@/app/sorcerer/sorcerer-view';
import type { View } from './types';
import type { Fighter } from '@/types/battle';

interface SorcererTentPageProps {
  onNavigate: (view: View) => void;
  isMaster: boolean;
  trainerName: string;
  menuPlayerData: Fighter | null;
}

export const SorcererTentPage = ({ onNavigate, isMaster, trainerName, menuPlayerData }: SorcererTentPageProps) => {
  return <SorcererTentClientView onNavigate={onNavigate} isMaster={isMaster} trainerName={trainerName} menuPlayerData={menuPlayerData} />;
};
