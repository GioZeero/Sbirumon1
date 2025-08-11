

'use client';

import React from 'react';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { ShieldQuestion, Trophy, Eye, ChevronLeftCircle } from 'lucide-react';
import type { View } from './types';

interface NobleAreaPageProps {
  onNavigate: (view: View) => void;
  menuPlayerData: Fighter | null;
  startViandanteMaestroBattle: () => void;
}

export const NobleAreaPage = ({ onNavigate, menuPlayerData, startViandanteMaestroBattle }: NobleAreaPageProps) => (
    <div className="relative flex min-h-screen flex-col items-center pb-24 text-foreground">
        <Button onClick={() => onNavigate('main')} variant="ghost" size="icon" className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20">
            <ChevronLeftCircle className="h-8 w-8" />
        </Button>
        <main className="flex w-full flex-col items-center p-4">
            <header className="w-full max-w-sm mb-8 mt-12 sm:mt-0">
                
            </header>
            <div className="grid w-full max-w-sm grid-cols-1 gap-3">
                 <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => onNavigate('arena')}>
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-red-500/20 p-3"><ShieldQuestion className="h-6 w-6 text-red-400" /></div>
                        <div>
                            <p className="text-base font-bold">Arena</p>
                            <p className="text-sm text-muted-foreground">Combatti contro altri allenatori</p>
                        </div>
                    </div>
                </Button>
                <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => onNavigate('gym_menu')}>
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-yellow-500/20 p-3"><Trophy className="h-6 w-6 text-yellow-400" /></div>
                        <div>
                            <p className="text-base font-bold">Palestre</p>
                            <p className="text-sm text-muted-foreground">Scala le classifiche ufficiali</p>
                        </div>
                    </div>
                </Button>
                {menuPlayerData?.viandanteMaestroVisible && (
                     <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left border-purple-500/50" onClick={startViandanteMaestroBattle}>
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-purple-500/20 p-3"><Eye className="h-6 w-6 text-purple-400" /></div>
                            <div>
                                <p className="text-base font-bold">Viandante Maestro</p>
                                <p className="text-sm text-muted-foreground">Una sfida inaspettata ti attende</p>
                            </div>
                        </div>
                    </Button>
                )}
            </div>
        </main>
    </div>
);

    
