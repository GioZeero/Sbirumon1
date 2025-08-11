
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Fighter, CreatureType } from '@/types/battle';
import { getCreaturePool } from '@/config/fighters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ChevronLeftCircle, Dna, Flame, Droplets, Leaf, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { View } from './types';
import type { LucideIcon } from 'lucide-react';

const creatureTypeIconMap: Record<CreatureType, LucideIcon> = {
  Fire: Flame,
  Water: Droplets,
  Grass: Leaf,
  Light: Sun,
  Dark: Moon,
};

interface SbirudexPageProps {
  onNavigate: (view: View) => void;
  trainerName: string;
  menuPlayerData: Fighter | null;
}

export const SbirudexPage = ({ onNavigate, trainerName, menuPlayerData }: SbirudexPageProps) => {
  const [allCreatures] = useState(() => getCreaturePool().sort((a, b) => a.name.localeCompare(b.name)));

  if (!menuPlayerData) {
    return <div className="min-h-screen flex items-center justify-center bg-transparent"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  const encounteredIds = new Set(menuPlayerData.encounteredCreatureIds || []);
  if (menuPlayerData.baseId) {
    encounteredIds.add(menuPlayerData.baseId);
  }

  return (
    <div className="min-h-screen flex flex-col items-center text-foreground pb-12 relative">
      <Button variant="ghost" size="icon" className="absolute top-6 left-6 z-10 h-14 w-14 rounded-full hover:bg-background/20" onClick={() => onNavigate('items_hub')}>
          <ChevronLeftCircle className="h-12 w-12" strokeWidth={3} />
      </Button>
      <main className="w-full max-w-4xl p-4 sm:p-6">
        <header className="w-full mb-8 mt-12 sm:mt-0">
            <div className="flex justify-center items-center gap-4">
                <Dna className="h-12 w-12 text-primary"/>
                <h1 className="text-4xl sm:text-5xl font-headline text-primary">Sbirudex</h1>
            </div>
            <p className="text-center text-muted-foreground mt-2">L'enciclopedia delle creature che hai incontrato.</p>
        </header>

        <ScrollArea className="h-[70vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                {allCreatures.map((creature, index) => {
                    const isEncountered = encounteredIds.has(creature.id);
                    const TypeIcon = creatureTypeIconMap[creature.creatureType];

                    return (
                        <Card key={creature.id} className={cn("bg-card/70 backdrop-blur-sm transition-all", !isEncountered && "bg-background/30")}>
                            <CardHeader className="p-3 pb-2 items-center">
                                <div className={cn("relative w-24 h-24 rounded-full border-2 bg-background/50", isEncountered ? "border-primary/50" : "border-border/50")}>
                                    <Image
                                        src={creature.spriteUrl}
                                        alt={isEncountered ? creature.name : "Creatura Sconosciuta"}
                                        width={96}
                                        height={96}
                                        className={cn("w-full h-full object-contain transition-all", !isEncountered && "brightness-0 opacity-60")}
                                        unoptimized
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-0 text-center">
                                {isEncountered ? (
                                    <>
                                        <CardTitle className="text-lg text-primary">{creature.name}</CardTitle>
                                        <CardDescription className="flex items-center justify-center gap-1.5 text-sm mt-1">
                                            <TypeIcon className="w-4 h-4" />
                                            {creature.creatureType}
                                        </CardDescription>
                                    </>
                                ) : (
                                    <>
                                        <CardTitle className="text-lg text-muted-foreground">???</CardTitle>
                                        <CardDescription className="text-sm">Sconosciuto</CardDescription>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </ScrollArea>
      </main>
    </div>
  );
};
