

'use client';

import React from 'react';
import type { Fighter } from '@/types/battle';
import type { CovoSize } from '@/config/locations';
import { Button } from '@/components/ui/button';
import { Loader2, BrainCircuit, ChevronLeftCircle } from 'lucide-react';
import type { View } from './types';

interface CovoMenuPageProps {
  randomCovoCities: { small: string; medium: string; large: string } | null;
  menuPlayerData: Fighter | null;
  handleStartCovoChallenge: (city: string, size: CovoSize) => void;
  navigateTo: (view: View) => void;
}

export const CovoMenuPage = ({ randomCovoCities, menuPlayerData, handleStartCovoChallenge, navigateTo }: CovoMenuPageProps) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center pb-24 text-foreground">
        <button onClick={() => navigateTo('main')} className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
            <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
        </button>
        <main className="flex w-full flex-grow flex-col items-center justify-center p-4">
            <header className="w-full max-w-sm mb-8 mt-12 sm:mt-0">
                
                <p className="text-center text-muted-foreground mt-2">Scegli la difficoltà del Covo</p>
            </header>
            {!randomCovoCities ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> : (
                <div className="grid w-full max-w-sm grid-cols-1 gap-3">
                    <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => handleStartCovoChallenge(randomCovoCities.small, 'small')} disabled={!menuPlayerData?.covoAttemptsRemaining || menuPlayerData.covoAttemptsRemaining.small <= 0}>
                        <div className="flex items-center gap-4">
                           <div className="rounded-lg bg-green-500/20 p-3"><BrainCircuit className="h-6 w-6 text-green-400" /></div>
                           <div>
                               <p className="text-base font-bold">Covo di {randomCovoCities.small} (Facile)</p>
                               <p className="text-sm text-muted-foreground">Tentativi: {menuPlayerData?.covoAttemptsRemaining?.small ?? 0}</p>
                           </div>
                        </div>
                    </Button>
                    <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => handleStartCovoChallenge(randomCovoCities.medium, 'medium')} disabled={!menuPlayerData?.covoAttemptsRemaining || menuPlayerData.covoAttemptsRemaining.medium <= 0}>
                        <div className="flex items-center gap-4">
                           <div className="rounded-lg bg-yellow-500/20 p-3"><BrainCircuit className="h-6 w-6 text-yellow-400" /></div>
                           <div>
                               <p className="text-base font-bold">Covo di {randomCovoCities.medium} (Medio)</p>
                               <p className="text-sm text-muted-foreground">Tentativi: {menuPlayerData?.covoAttemptsRemaining?.medium ?? 0}</p>
                           </div>
                        </div>
                    </Button>
                    <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => handleStartCovoChallenge(randomCovoCities.large, 'large')} disabled={!menuPlayerData?.covoAttemptsRemaining || menuPlayerData.covoAttemptsRemaining.large <= 0}>
                        <div className="flex items-center gap-4">
                           <div className="rounded-lg bg-red-500/20 p-3"><BrainCircuit className="h-6 w-6 text-red-400" /></div>
                           <div>
                               <p className="text-base font-bold">Covo di {randomCovoCities.large} (Difficile)</p>
                               <p className="text-sm text-muted-foreground">Tentativi: {menuPlayerData?.covoAttemptsRemaining?.large ?? 0}</p>
                           </div>
                        </div>
                    </Button>
                </div>
            )}
        </main>
    </div>
  );
};
