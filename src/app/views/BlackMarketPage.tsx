

'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Coins, ChevronLeftCircle, Info, Bone, Beaker } from 'lucide-react';
import { ALL_CONSUMABLES } from '@/config/consumables';
import { buyConsumable } from '@/app/shop/consumables/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ConsumableItem } from '@/types/items';
import type { View } from './types';
import type { LucideIcon } from 'lucide-react';


const consumableIconMap: Record<string, LucideIcon> = { FlaskConical: Beaker, MedalIcon: Beaker, ShieldAlert: Beaker, ShieldCheck: Beaker, HeartPulse: Beaker, Sword: Beaker, Shield: Beaker, Sparkles: Beaker, Gauge: Beaker, Heart: Beaker, Info, Circle: Beaker, Target: Beaker, Flame: Beaker, HandHelping: Beaker, Droplets: Beaker, TrendingUp: Beaker, MoreHorizontal: Beaker, Leaf: Beaker, Sun: Beaker, Moon: Beaker, Feather: Beaker, Bird: Beaker, PersonStanding: Beaker, Footprints: Beaker, Wind: Beaker, Waves: Beaker, CircleDashed: Beaker, Volume2: Beaker, Mountain: Beaker, Bed: Beaker, Sprout: Beaker, ShieldBan: Beaker, Hand: Beaker, Bot: Beaker, Dna: Beaker, Bone, Beaker, Eye: Beaker, Wand2: Beaker, StarIcon: Beaker, RefreshCw: Beaker, Backpack: Beaker, ArrowUp: Beaker, ArrowDown: Beaker, ClipboardList: Beaker, Briefcase: Beaker, ShieldQuestion: Beaker };
const getConsumableIconElement = (item: ConsumableItem, className?: string) => {
  const IconComponent = consumableIconMap[item.iconName] || Info;
  return <IconComponent className={className || "w-6 h-6 mr-3 text-primary flex-shrink-0"} />;
};

interface BlackMarketPageProps {
  onNavigate: (view: View) => void;
  trainerName: string;
  menuPlayerData: Fighter | null;
  onPlayerDataChange: (newPlayerData: Fighter) => void;
}

export const BlackMarketPage = ({ onNavigate, trainerName, menuPlayerData, onPlayerDataChange }: BlackMarketPageProps) => {
    const [isPending, startTransition] = useTransition();

    const handleBuyItem = (itemId: string, cost: number) => {
        if (!menuPlayerData || menuPlayerData.money === undefined || menuPlayerData.money < cost) {
            return;
        }
        startTransition(async () => {
            const result = await buyConsumable(trainerName, itemId, cost);
            if (result.success && result.updatedPlayer) {
                onPlayerDataChange(result.updatedPlayer);
            }
        });
    };

    if (!menuPlayerData) {
        return <div className="min-h-screen flex items-center justify-center bg-transparent"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }
    
    const marketItems = ALL_CONSUMABLES.filter(item => item.category === 'Resti' || item.category === 'Potenziamenti Illegali');

    return (
        <div className="min-h-screen flex flex-col items-center text-foreground pb-24 relative">
            <button className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0 transition-transform duration-75 ease-in-out active:scale-95" onClick={() => onNavigate('main')}>
                <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
            </button>
            <main className="w-full max-w-4xl p-4 sm:p-6">
                <header className="w-full mb-8 mt-12 sm:mt-0 relative">
                    <div className="absolute top-0 right-0 flex items-center space-x-2 bg-card p-2 rounded-lg border border-border shadow-md"><Coins className="h-6 w-6 text-yellow-400" /><span className="font-bold text-lg text-foreground">{menuPlayerData.money ?? 0}</span></div>
                    
                </header>
                <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
                    <CardHeader><CardTitle className="text-3xl text-center text-accent">Merce di Contrabbando</CardTitle></CardHeader>
                    <CardContent className="p-4">
                      <ScrollArea className="h-[60vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                            {marketItems.map((item) => (
                                <Card key={item.id} className="flex flex-col bg-card/70">
                                    <CardHeader className="flex-row items-center space-x-4 pb-2">
                                        {getConsumableIconElement(item)}
                                        <div className="flex-grow">
                                            <CardTitle className="text-xl">{item.name}</CardTitle>
                                            <div className="flex items-center text-amber-400 font-semibold"><Coins className="w-4 h-4 mr-1.5"/><span>{item.cost}</span></div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-2 pt-0 pb-4"><p className="text-sm text-muted-foreground leading-snug">{item.description}</p></CardContent>
                                    <div className="p-4 pt-0 mt-auto">
                                        <Button className="w-full transition-transform duration-75 ease-in-out active:scale-95" onClick={() => handleBuyItem(item.id, item.cost)} disabled={isPending || (menuPlayerData.money ?? 0) < item.cost}>{isPending ? <Loader2 className="animate-spin" /> : "Acquista"}</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};
