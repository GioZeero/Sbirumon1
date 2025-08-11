
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PackagePlus, Book, ChevronLeftCircle, Dna } from 'lucide-react';
import type { View } from './types';

interface ItemsHubPageProps {
  onNavigate: (view: View) => void;
}

export const ItemsHubPage = ({ onNavigate }: ItemsHubPageProps) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center p-4 text-foreground">
      <Button variant="ghost" size="icon" className="absolute top-6 left-6 z-10 h-14 w-14 rounded-full hover:bg-background/20" onClick={() => onNavigate('main')}>
        <ChevronLeftCircle className="h-12 w-12" strokeWidth={3} />
      </Button>
      <main className="flex w-full flex-grow flex-col items-center justify-center">
        <header className="w-full mb-8">
          <h1 className="text-4xl font-headline text-primary text-center">
            Casa
          </h1>
        </header>
        <div className="grid w-full max-w-sm grid-cols-1 gap-3">
            <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => onNavigate('items_consumables')}>
                <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-500/20 p-3"><PackagePlus className="h-6 w-6 text-blue-400" /></div>
                    <div>
                        <p className="text-base font-bold">Zaino</p>
                        <p className="text-sm text-muted-foreground">Gestisci i tuoi consumabili</p>
                    </div>
                </div>
            </Button>
            <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => onNavigate('items_moves')}>
                <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-orange-500/20 p-3"><Book className="h-6 w-6 text-orange-400" /></div>
                    <div>
                        <p className="text-base font-bold">Libro delle Mosse</p>
                        <p className="text-sm text-muted-foreground">Consulta le mosse sbloccate</p>
                    </div>
                </div>
            </Button>
            <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => onNavigate('sbirudex')}>
                <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-green-500/20 p-3"><Dna className="h-6 w-6 text-green-400" /></div>
                    <div>
                        <p className="text-base font-bold">Sbirudex</p>
                        <p className="text-sm text-muted-foreground">Enciclopedia delle creature</p>
                    </div>
                </div>
            </Button>
        </div>
      </main>
    </div>
  );
};
