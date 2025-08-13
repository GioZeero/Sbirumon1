

'use client';

import React from 'react';
import Image from 'next/image';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PackagePlus, Book, ChevronLeftCircle, Dna, Star } from 'lucide-react';
import type { View } from './types';

interface ItemsHubPageProps {
  onNavigate: (view: View) => void;
  menuPlayerData: Fighter | null;
}

export const ItemsHubPage = ({ onNavigate, menuPlayerData }: ItemsHubPageProps) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center p-4 text-foreground">
      <button className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0 transition-transform duration-75 ease-in-out active:scale-95" onClick={() => onNavigate('main')}>
        <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
      </button>
      <main className="flex w-full flex-grow flex-col items-center justify-center">
        {menuPlayerData && (
            <Card className="bg-card/70 backdrop-blur-sm border-border/30 w-72 mb-8">
                <CardContent className="flex flex-col items-center p-6">
                    <div className="relative w-40 h-40 rounded-full border-4 border-primary/50 bg-background/50 mb-4">
                      <Image
                        src={menuPlayerData.spriteUrl}
                        alt={menuPlayerData.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>
                     <CardTitle className="text-center text-primary text-2xl">{menuPlayerData.name}</CardTitle>
                     <Badge variant="secondary" className="mt-2">
                       <Star className="w-3 h-3 mr-1"/>
                       Livello: {menuPlayerData.level}
                    </Badge>
                </CardContent>
            </Card>
        )}
        <div className="grid w-full max-w-sm grid-cols-1 gap-3">
            <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left transition-transform duration-75 ease-in-out active:scale-95" onClick={() => onNavigate('items_consumables')}>
                <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-500/20 p-3"><PackagePlus className="h-6 w-6 text-blue-400" /></div>
                    <div>
                        <p className="text-base font-bold">Zaino</p>
                        <p className="text-sm text-muted-foreground">Gestisci i tuoi consumabili</p>
                    </div>
                </div>
            </Button>
            <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left transition-transform duration-75 ease-in-out active:scale-95" onClick={() => onNavigate('items_moves')}>
                <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-orange-500/20 p-3"><Book className="h-6 w-6 text-orange-400" /></div>
                    <div>
                        <p className="text-base font-bold">Libro delle Mosse</p>
                        <p className="text-sm text-muted-foreground">Consulta le mosse sbloccate</p>
                    </div>
                </div>
            </Button>
            <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left transition-transform duration-75 ease-in-out active:scale-95" onClick={() => onNavigate('sbirudex')}>
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
