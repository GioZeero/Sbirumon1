

'use client';

import React from 'react';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Wand2, Sparkles, ChevronLeftCircle, Eye } from 'lucide-react';
import type { View } from './types';

interface ArcanePathPageProps {
  onNavigate: (view: View) => void;
  menuPlayerData: Fighter | null;
  startViandanteMaestroBattle: () => void;
}

export const ArcanePathPage = ({ onNavigate, menuPlayerData, startViandanteMaestroBattle }: ArcanePathPageProps) => {
    const canSeeSorcerer = (menuPlayerData?.highestGymBeaten ?? 0) >= 3 || menuPlayerData?.sorcererTentVisible;
    const canSeeMasterSorcerer = (menuPlayerData?.highestGymBeaten ?? 0) >= 3 || menuPlayerData?.masterSorcererTentVisible;
    const canSeeViandante = menuPlayerData?.viandanteMaestroVisible;

    return (
        <div className="relative flex min-h-screen flex-col items-center pb-24 text-foreground">
            <button onClick={() => onNavigate('main')} className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
                <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
            </button>
            <main className="flex w-full flex-col items-center p-4">
                <header className="w-full max-w-sm mb-8 mt-12 sm:mt-0">
                    <h1 className="text-4xl md:text-5xl font-headline text-primary text-center">Sentiero Arcano</h1>
                    <p className="text-center text-muted-foreground mt-2">I luoghi del potere nascosto si rivelano.</p>
                </header>
                <div className="grid w-full max-w-sm grid-cols-1 gap-3">
                     {canSeeSorcerer && (
                         <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left border-purple-500/50" onClick={() => onNavigate('sorcerer_tent')}>
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-purple-500/20 p-3"><Wand2 className="h-6 w-6 text-purple-400" /></div>
                                <div>
                                    <p className="text-base font-bold">Tenda dello Stregone</p>
                                    <p className="text-sm text-muted-foreground">Altera il destino del tuo Sbirumon</p>
                                </div>
                            </div>
                        </Button>
                    )}
                    {canSeeMasterSorcerer && (
                        <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left border-fuchsia-500/50" onClick={() => onNavigate('master_sorcerer')}>
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-fuchsia-500/20 p-3"><Sparkles className="h-6 w-6 text-fuchsia-400" /></div>
                                <div>
                                    <p className="text-base font-bold">Maestro Stregone</p>
                                    <p className="text-sm text-muted-foreground">Forza un'evoluzione... a tuo rischio</p>
                                </div>
                            </div>
                        </Button>
                    )}
                    {canSeeViandante && (
                        <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left border-teal-500/50" onClick={startViandanteMaestroBattle}>
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-teal-500/20 p-3"><Eye className="h-6 w-6 text-teal-400" /></div>
                                <div>
                                    <p className="text-base font-bold">Viandante Maestro</p>
                                    <p className="text-sm text-muted-foreground">Una sfida inaspettata ti attende</p>
                                </div>
                            </div>
                        </Button>
                    )}
                    {!canSeeSorcerer && !canSeeMasterSorcerer && !canSeeViandante && (
                        <p className="text-center text-muted-foreground mt-8">Il sentiero è ancora avvolto nella nebbia. Prosegui nel tuo viaggio per svelarne i segreti.</p>
                    )}
                </div>
            </main>
        </div>
    );
};
