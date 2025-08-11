

'use client';

import React from 'react';
import type { Fighter } from '@/types/battle';
import { ALL_GYMS } from '@/config/gyms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MedalIcon, Trophy, ChevronLeftCircle } from 'lucide-react';
import type { View } from './types';

interface GymMenuPageProps {
  menuPlayerData: Fighter | null;
  handleStartGymChallenge: (gymId: number) => void;
  navigateTo: (view: View) => void;
}

export const GymMenuPage = ({ menuPlayerData, handleStartGymChallenge, navigateTo }: GymMenuPageProps) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center pb-24 text-foreground">
        <button onClick={() => navigateTo('main')} className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
            <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
        </button>
        <main className="flex w-full max-w-md flex-col justify-center p-4">
            <header className="mb-8 mt-12 sm:mt-0">
                
                <p className="text-center text-muted-foreground mt-2">Sconfiggi i capipalestra per dimostrare il tuo valore.</p>
            </header>
            <div className="space-y-6">
                <Card className="bg-card/70">
                    <CardHeader className="p-4">
                        <CardTitle className="text-center text-xl text-accent">Le Tue Medaglie</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex flex-wrap justify-center gap-2">
                            {(menuPlayerData?.highestGymBeaten ?? 0) === 0 ? (
                                <p className="text-sm text-muted-foreground">Nessuna medaglia ancora.</p>
                            ) : (
                                Array.from({ length: menuPlayerData?.highestGymBeaten ?? 0 }).map((_, i) => (
                                    <MedalIcon key={i} className="h-10 w-10 text-yellow-400" />
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                    {(() => {
                        const highestBeaten = menuPlayerData?.highestGymBeaten ?? 0;
                        const nextGym = ALL_GYMS.find(gym => gym.gymId === highestBeaten + 1);
                        return nextGym ? (
                            <div>
                                <h2 className="mb-2 text-center text-lg font-semibold text-primary">Prossima Palestra</h2>
                                <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => handleStartGymChallenge(nextGym.gymId)}>
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg bg-yellow-500/20 p-3"><Trophy className="h-6 w-6 text-yellow-400" /></div>
                                        <div>
                                            <p className="text-base font-bold">{nextGym.name}</p>
                                            <p className="text-sm text-muted-foreground">{nextGym.trainers.length} Allenatori</p>
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-center text-lg text-muted-foreground">Hai sconfitto tutte le palestre!</p>
                        );
                    })()}
                </div>
            </div>
        </main>
    </div>
  );
};
