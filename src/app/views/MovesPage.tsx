
'use client';

import React, { useState, useEffect } from 'react';
import type { Fighter, Attack, CreatureType } from '@/types/battle';
import { getPlayerProfileData } from '@/lib/fighter-repository';
import { getAllGameAttacks } from '@/config/fighters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Sword, Sparkles, Heart, Settings, Bone, Flame, HandHelping, Zap as ZapIcon, Droplets, Shield, MoreHorizontal, BrainCircuit, Leaf, Sun, Moon, TrendingUp, ChevronLeftCircle } from 'lucide-react';
import { STATUS_EFFECTS } from '@/config/statusEffects';
import type { View } from './types';
import type { LucideIcon } from 'lucide-react';

const attackIconMap: Record<string, LucideIcon> = { Bone, Flame, HandHelping, Zap: ZapIcon, Droplets, TrendingUp, Shield, MoreHorizontal, BrainCircuit };
const creatureTypeIconMap: Record<CreatureType, LucideIcon> = { Fire: Flame, Water: Droplets, Grass: Leaf, Light: Sun, Dark: Moon, };

const getAttackSpecificIconElement = (attack: Attack, className?: string) => {
    const IconComponent = (attack.icon && attackIconMap[attack.icon]) ? attackIconMap[attack.icon] : TrendingUp;
    return <IconComponent className={className || "w-5 h-5 mr-2 flex-shrink-0"} />;
};

interface MovesPageProps {
  onNavigate: (view: View) => void;
  trainerName: string;
}

export const MovesPage = ({ onNavigate, trainerName }: MovesPageProps) => {
    const [unlockedAttacks, setUnlockedAttacks] = useState<Attack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [selectedCategoryItems, setSelectedCategoryItems] = useState<Attack[]>([]);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            getPlayerProfileData(trainerName),
            getAllGameAttacks()
        ]).then(([playerData, allAttacks]) => {
            if (playerData?.unlockedAttackIds) {
                const unlockedIds = new Set(playerData.unlockedAttackIds);
                setUnlockedAttacks(allAttacks.filter(attack => unlockedIds.has(attack.id)));
            }
            setIsLoading(false);
        }).catch(() => setIsLoading(false));
    }, [trainerName]);

    const categorizedAttacks = React.useMemo(() => {
        const categorized: { [key: string]: Attack[] } = { physical: [], special: [], healing: [], status: [] };
        unlockedAttacks.forEach(attack => {
            if (attack.damage < 0) {
                categorized.healing.push(attack);
            } else if (attack.damage > 0 || attack.specialDamage) {
                if (attack.category === 'Physical') categorized.physical.push(attack);
                else if (attack.category === 'Special') categorized.special.push(attack);
            } else { 
                categorized.status.push(attack);
            }
        });
        return categorized;
    }, [unlockedAttacks]);

    const categories = [
        { title: "Attacchi Fisici", icon: Sword, moves: categorizedAttacks.physical },
        { title: "Attacchi Speciali", icon: Sparkles, moves: categorizedAttacks.special },
        { title: "Mosse di Cura", icon: Heart, moves: categorizedAttacks.healing },
        { title: "Mosse di Potenziamento/Stato", icon: Settings, moves: categorizedAttacks.status },
    ];

    const handleOpenCategory = (category: typeof categories[0]) => {
        setSelectedCategoryName(category.title);
        setSelectedCategoryItems(category.moves);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-transparent"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center text-foreground relative">
            <Button variant="ghost" size="icon" className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20" onClick={() => onNavigate('main')}>
                <ChevronLeftCircle className="h-8 w-8" />
            </Button>
            <main className="w-full max-w-3xl p-4 sm:p-6">
                <header className="w-full mb-12 mt-12 sm:mt-0"><div className="flex justify-center items-center"><h1 className="text-4xl sm:text-5xl font-headline text-primary text-center">Libro delle Mosse</h1></div></header>
                <div className="grid grid-cols-2 gap-4">
                    {categories.map(category => (
                        <Button
                            key={category.title}
                            variant="outline"
                            size="lg"
                            className="h-24 text-xl sm:text-2xl"
                            onClick={() => handleOpenCategory(category)}
                            disabled={category.moves.length === 0}
                        >
                            <category.icon className="mr-3 h-8 w-8 text-accent" />
                            {category.title}
                            <Badge variant="secondary" className="ml-3 text-lg">{category.moves.length}</Badge>
                        </Button>
                    ))}
                </div>
            </main>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-3xl text-accent">{selectedCategoryName}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh] -mx-4 px-4">
                        <div className="space-y-2 py-4">
                            {selectedCategoryItems.length > 0 ? (
                                selectedCategoryItems.map(attack => {
                                    const CreatureTypeIcon = creatureTypeIconMap[attack.creatureType];
                                    return (
                                        <Card key={attack.id} className="bg-card/70">
                                            <CardContent className="p-4">
                                                <div className="flex items-center mb-2">
                                                    {getAttackSpecificIconElement(attack, "w-6 h-6 mr-3 text-primary")}
                                                    <p className="font-semibold text-lg flex-grow">{attack.name}</p>
                                                    <div className="flex items-center space-x-2 ml-auto">
                                                        {CreatureTypeIcon && <CreatureTypeIcon className="w-5 h-5 text-muted-foreground" />}
                                                        <Badge variant="outline" className="text-sm py-1 px-2">{attack.creatureType}</Badge>
                                                        <Badge variant="outline" className="text-sm py-1 px-2">{attack.category}</Badge>
                                                        <Badge variant="secondary" className="text-sm py-1 px-2">{attack.rarity}</Badge>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>{attack.damage !== 0 && (<>{'Danno: '}<span className={attack.damage < 0 ? 'text-green-400' : ''}>{attack.damage > 0 ? attack.damage : Math.abs(attack.damage) + ' Cura'}</span></>)}{attack.specialDamage && `Danno: Dimezza HP`}{' / Precisione: '}{(attack.accuracy * 100).toFixed(0)}%</p>
                                                    {attack.effect && (<p>Effetto: {(attack.effect.chance * 100).toFixed(0)}% di <Badge variant="destructive">{STATUS_EFFECTS[attack.effect.statusId]?.name || attack.effect.statusId}</Badge></p>)}
                                                    {attack.recoil && (<p><strong>Rinculo:</strong> <span className="font-semibold">{(attack.recoil * 100).toFixed(0)}% del danno inflitto</span></p>)}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            ) : (
                                <p className="text-muted-foreground px-4 py-2">Nessuna mossa in questa categoria.</p>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
};
