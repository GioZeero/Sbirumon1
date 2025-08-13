'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface StartScreenPageProps {
  onStartGame: () => void;
}

export const StartScreenPage = ({ onStartGame }: StartScreenPageProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src="/gioca.png"
        alt=""                // decorativo
        fill
        priority
        className="object-cover scale-105 transform-gpu pointer-events-none select-none -z-10"
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <Button size="lg" className="text-4xl py-10 px-16" onClick={onStartGame}>
          <Play className="mr-4 h-8 w-8" />
          Gioca
        </Button>
      </div>
    </div>
  );
};
