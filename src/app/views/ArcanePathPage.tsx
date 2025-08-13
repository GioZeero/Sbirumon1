

'use client';

import React from 'react';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Wand2, Sparkles, ChevronLeftCircle, Eye } from 'lucide-react';
import type { View } from './types';

interface ArcanePathPageProps {
  onNavigate: (view: View, data?: any) => void;
  menuPlayerData: Fighter | null;
  startViandanteMaestroBattle: () => void;
}

export const ArcanePathPage = ({ onNavigate, menuPlayerData, startViandanteMaestroBattle }: ArcanePathPageProps) => {
    const canSeeViandante = menuPlayerData?.viandanteMaestroVisible;
    const canSeeSorcerer = menuPlayerData?.sorcererTentVisible;
    const canSeeMasterSorcerer = menuPlayerData?.masterSorcererTentVisible;

    return (
        <div className="relative flex min-h-screen flex-col items-center pb-24 text-foreground">
            <button onClick={() => onNavigate('main')} className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
                <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
            </button>
            <main className="flex w-full flex-col items-center p-4">
                <header className="w-full max-w-sm mb-8 mt-12 sm:mt-0">
                    <h1 className="text-4xl md:text-5xl font-headline text-primary text-center">Sentiero Arcano</h1>
                </header>
                <div className="grid w-full max-w-sm grid-cols-1 gap-3">
                     {canSeeSorcerer && (
                        <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left border-purple-500/50 transition-transform duration-75 ease-in-out active:scale-95" onClick={() => onNavigate('sorcerer_tent', { isMaster: false })}>
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-purple-500/20 p-3"><Wand2 className="h-6 w-6 text-purple-400" /></div>
                                <div>
                                    <p className="text-base font-bold">Tenda dello Stregone</p>
                                    <p className="text-sm text-muted-foreground">Rimescola il destino della tua creatura</p>
                                </div>
                            </div>
                        </Button>
                    )}
                    {canSeeMasterSorcerer && (
                        <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left border-indigo-500/50 transition-transform duration-75 ease-in-out active:scale-95" onClick={() => onNavigate('sorcerer_tent', { isMaster: true })}>
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-indigo-500/20 p-3"><Sparkles className="h-6 w-6 text-indigo-400" /></div>
                                <div>
                                    <p className="text-base font-bold">Tenda del Maestro Stregone</p>
                                    <p className="text-sm text-muted-foreground">Forza un'evoluzione prematura</p>
                                </div>
                            </div>
                        </Button>
                    )}
                    {canSeeViandante && (
                        <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left border-teal-500/50 transition-transform duration-75 ease-in-out active:scale-95" onClick={startViandanteMaestroBattle}>
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-teal-500/20 p-3"><Eye className="h-6 w-6 text-teal-400" /></div>
                                <div>
                                    <p className="text-base font-bold">Viandante Maestro</p>
                                    <p className="text-sm text-muted-foreground">Una sfida inaspettata ti attende</p>
                                </div>
                            </div>
                        </Button>
                    )}
                    {!canSeeViandante && !canSeeSorcerer && !canSeeMasterSorcerer && (
                        <p className="text-center text-muted-foreground mt-8">Il sentiero è ancora avvolto nella nebbia. Prosegui nel tuo viaggio per svelarne i segreti.</p>
                    )}
                </div>
            </main>
        </div>
    );
};
