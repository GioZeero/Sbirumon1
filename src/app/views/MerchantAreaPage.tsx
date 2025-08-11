

'use client';

import React from 'react';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Store, Glasses, Briefcase, Wand2, Sparkles, Skull, ChevronLeftCircle } from 'lucide-react';
import type { View } from './types';

interface MerchantAreaPageProps {
  onNavigate: (view: View) => void;
  menuPlayerData: Fighter | null;
}

export const MerchantAreaPage = ({ onNavigate, menuPlayerData }: MerchantAreaPageProps) => {
    const canSeeArcanePath = (menuPlayerData?.highestGymBeaten ?? 0) >= 3;

    return (
        <div className="relative flex min-h-screen flex-col items-center pb-24 text-foreground">
            <button onClick={() => onNavigate('city')} className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
                <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
            </button>
            <main className="flex w-full flex-col items-center p-4">
                <header className="w-full max-w-sm mb-8 mt-12 sm:mt-0">
                    
                </header>
                <div className="grid w-full max-w-sm grid-cols-1 gap-3">
                    <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => onNavigate('shop_hub')}>
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-teal-500/20 p-3"><Store className="h-6 w-6 text-teal-400" /></div>
                            <div>
                                <p className="text-base font-bold">Negozi</p>
                                <p className="text-sm text-muted-foreground">Compra oggetti e mosse</p>
                            </div>
                        </div>
                    </Button>
                    <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => onNavigate('covo_menu')}>
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-orange-500/20 p-3"><Glasses className="h-6 w-6 text-orange-400" /></div>
                            <div>
                                <p className="text-base font-bold">Covo di Nerd</p>
                                <p className="text-sm text-muted-foreground">Sfide di resistenza e ricompense</p>
                            </div>
                        </div>
                    </Button>
                    <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => onNavigate('job_board')}>
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-blue-500/20 p-3"><Briefcase className="h-6 w-6 text-blue-400" /></div>
                            <div>
                                <p className="text-base font-bold">Bacheca Lavori</p>
                                <p className="text-sm text-muted-foreground">Completa missioni per ricompense</p>
                            </div>
                        </div>
                    </Button>
                    {(menuPlayerData?.suicideCount ?? 0) >= 10 && (
                        <Button variant="destructive" className="h-20 w-full justify-start p-4 text-left" onClick={() => onNavigate('black_market')}>
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-black/20 p-3"><Skull className="h-6 w-6 text-destructive" /></div>
                                <div>
                                    <p className="text-base font-bold">Mercato Nero</p>
                                    <p className="text-sm text-muted-foreground">Potenziamenti illegali e rischiosi</p>
                                </div>
                            </div>
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
};
