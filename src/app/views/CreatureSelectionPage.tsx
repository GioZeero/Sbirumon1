

'use client';

import React from 'react';
import Image from 'next/image';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Dna, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatGrowthColor } from './utils';

interface CreatureSelectionPageProps {
  isChoosingCreature: boolean;
  currentCreatureChoice: Fighter | null;
  handleCreatureSelect: (creature: Fighter) => void;
}

export const CreatureSelectionPage = ({ isChoosingCreature, currentCreatureChoice, handleCreatureSelect }: CreatureSelectionPageProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <header className="w-full max-w-4xl mb-8 text-center">
            
            
        </header>
        <main className="w-full max-w-md flex flex-col justify-center items-center">
            {isChoosingCreature || !currentCreatureChoice ? <Loader2 className="h-24 w-24 animate-spin text-primary" /> : (
                <>
                    <Card key={currentCreatureChoice.id} className="w-full max-w-sm bg-card/70 border-4 border-border transition-all transform hover:-translate-y-1 hover:shadow-2xl hover:border-primary">
                        <CardHeader className="items-center">
                            <div className="relative w-40 h-40 rounded-full border-4 border-primary bg-background/50 mb-4">
                                <Image
                                    src={currentCreatureChoice.spriteUrl}
                                    alt={currentCreatureChoice.name}
                                    width={160}
                                    height={160}
                                    className="w-full h-full object-contain"
                                    unoptimized
                                />
                            </div>
                            <CardTitle className="text-3xl text-accent font-display">{currentCreatureChoice.name}</CardTitle>
                            <div className="flex items-center text-lg text-muted-foreground">
                                <Dna className="w-5 h-5 mr-2" />
                                {currentCreatureChoice.creatureType}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2 space-y-2">
                            <h3 className="text-lg font-semibold text-center mb-2">Statistiche Base</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-base">
                                <div className="flex items-center"><span className={cn('w-28', getStatGrowthColor(currentCreatureChoice.archetype, 'physical'))}>Attacco</span> <span className="ml-auto font-semibold">{currentCreatureChoice.attackStat}</span></div>
                                <div className="flex items-center"><span className={cn('w-28', getStatGrowthColor(currentCreatureChoice.archetype, 'physical'))}>Difesa</span> <span className="ml-auto font-semibold">{currentCreatureChoice.defenseStat}</span></div>
                                <div className="flex items-center"><span className={cn('w-28', getStatGrowthColor(currentCreatureChoice.archetype, 'special'))}>Att. Sp.</span> <span className="ml-auto font-semibold">{currentCreatureChoice.specialAttackStat}</span></div>
                                <div className="flex items-center"><span className={cn('w-28', getStatGrowthColor(currentCreatureChoice.archetype, 'special'))}>Dif. Sp.</span> <span className="ml-auto font-semibold">{currentCreatureChoice.specialDefenseStat}</span></div>
                                <div className="flex items-center"><span className={cn('w-28', getStatGrowthColor(currentCreatureChoice.archetype, 'other'))}>Velocità</span> <span className="ml-auto font-semibold">{currentCreatureChoice.speedStat}</span></div>
                                <div className="flex items-center"><span className={cn('w-28', getStatGrowthColor(currentCreatureChoice.archetype, 'other'))}>Fortuna</span> <span className="ml-auto font-semibold">{currentCreatureChoice.luckStat}</span></div>
                            </div>
                            <div className="flex items-center pt-2 text-lg"><Heart className="w-5 h-5 mr-2 text-red-500" /> Salute <span className="ml-auto font-semibold">{currentCreatureChoice.maxHealth}</span></div>
                        </CardContent>
                    </Card>
                    <div className="mt-6 w-full max-w-sm flex flex-col space-y-3">
                         <Button size="lg" onClick={() => handleCreatureSelect(currentCreatureChoice)} disabled={isChoosingCreature}>
                             Accetta il regalo e inizia l'avventura
                         </Button>
                    </div>
                </>
            )}
        </main>
    </div>
  );
};
