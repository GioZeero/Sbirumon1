

'use client';

import React from 'react';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { ShieldQuestion, Trophy, Eye, ChevronLeftCircle } from 'lucide-react';
import type { View } from './types';

interface NobleAreaPageProps {
  onNavigate: (view: View) => void;
  menuPlayerData: Fighter | null;
}

export const NobleAreaPage = ({ onNavigate, menuPlayerData }: NobleAreaPageProps) => (
    <div className="relative flex min-h-screen flex-col items-center pb-24 text-foreground">
        <button className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0 transition-transform duration-75 ease-in-out active:scale-95" onClick={() => onNavigate('main')}>
            <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
        </button>
        <main className="flex w-full flex-col items-center p-4">
            <header className="w-full max-w-sm mb-8 mt-12 sm:mt-0">
                
            </header>
            <div className="grid w-full max-w-sm grid-cols-1 gap-3">
                 <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left transition-transform duration-75 ease-in-out active:scale-95" onClick={() => onNavigate('arena')}>
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-red-500/20 p-3"><ShieldQuestion className="h-6 w-6 text-red-400" /></div>
                        <div>
                            <p className="text-base font-bold">Arena</p>
                            <p className="text-sm text-muted-foreground">Combatti contro altri allenatori</p>
                        </div>
                    </div>
                </Button>
                <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left transition-transform duration-75 ease-in-out active:scale-95" onClick={() => onNavigate('gym_menu')}>
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-yellow-500/20 p-3"><Trophy className="h-6 w-6 text-yellow-400" /></div>
                        <div>
                            <p className="text-base font-bold">Palestre</p>
                            <p className="text-sm text-muted-foreground">Scala le classifiche ufficiali</p>
                        </div>
                    </div>
                </Button>
            </div>
        </main>
    </div>
);
