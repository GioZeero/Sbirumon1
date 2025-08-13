

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Fighter, CreatureType, Archetype } from '@/types/battle';
import { getCreaturePool, getViandanteMaestroPool } from '@/config/fighters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ChevronLeftCircle, Dna, Flame, Droplets, Leaf, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { View } from './types';
import type { LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
  const [allCreatures] = useState(() => {
    const regularCreatures = getCreaturePool();
    const uniqueCreatures = getViandanteMaestroPool();
    return [...regularCreatures, ...uniqueCreatures].sort((a, b) => a.name.localeCompare(b.name));
  });
  const [selectedCreature, setSelectedCreature] = useState<Fighter | null>(null);

  const getArchetypeDescription = (archetype?: Archetype): string => {
    switch (archetype) {
      case 'Physical':
        return "Un attaccante fisico che eccelle nel combattimento ravvicinato, infliggendo danni ingenti con la sua forza bruta.";
      case 'Special':
        return "Uno specialista a distanza che sfrutta poteri elementali per colpire le debolezze dei nemici.";
      case 'Balanced':
        return "Una creatura versatile, capace di adattarsi a diversi stili di combattimento senza eccellere in un'unica area specifica.";
      default:
        return "Archetipo non definito.";
    }
  };

  if (!menuPlayerData) {
    return <div className="min-h-screen flex items-center justify-center bg-transparent"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  const encounteredIds = new Set(menuPlayerData.encounteredCreatureIds || []);
  
  return (
    <div className="min-h-screen flex flex-col items-center text-foreground pb-12 relative">
      <button onClick={() => onNavigate('items_hub')} className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
          <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
      </button>
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
                {allCreatures.map((creature) => {
                    const isEncountered = encounteredIds.has(creature.id) || (creature.baseId && encounteredIds.has(creature.baseId));
                    const TypeIcon = creatureTypeIconMap[creature.creatureType];

                    return (
                        <Card 
                            key={creature.id} 
                            className={cn(
                                "bg-card/70 backdrop-blur-sm transition-all", 
                                !isEncountered && "bg-background/30",
                                isEncountered && "cursor-pointer hover:border-primary/80 hover:shadow-lg"
                            )}
                            onClick={() => isEncountered && setSelectedCreature(creature)}
                        >
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

      {selectedCreature && (
        <Dialog open={!!selectedCreature} onOpenChange={() => setSelectedCreature(null)}>
            <DialogContent>
                <DialogHeader className="items-center">
                    <div className="relative w-32 h-32 rounded-full border-4 border-primary bg-background/50 mb-4">
                        <Image
                            src={selectedCreature.spriteUrl}
                            alt={selectedCreature.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-contain"
                            unoptimized
                        />
                    </div>
                    <DialogTitle className="text-3xl text-primary">{selectedCreature.name}</DialogTitle>
                </DialogHeader>
                <div className="py-2 space-y-3">
                    <div className="flex justify-center items-center gap-4">
                        <Badge variant="outline">Tipo: {selectedCreature.creatureType}</Badge>
                        <Badge variant="secondary">Archetipo: {selectedCreature.archetype || 'N/A'}</Badge>
                    </div>
                    <Separator/>
                    <p className="text-sm text-muted-foreground text-center px-2">
                        {getArchetypeDescription(selectedCreature.archetype)}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
};
