

'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import type { Fighter, AttackRarity } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Loader2, Coins, ChevronLeftCircle, Info, Bone, Beaker, FlaskConical, Medal, ShieldAlert, ShieldCheck, HeartPulse, Sword, Shield, Sparkles, Gauge, Heart, Circle, Target, Flame, HandHelping, Droplets, TrendingUp, MoreHorizontal, Leaf, Sun, Moon, Feather, Bird, PersonStanding, Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, ShieldBan, Hand, Bot, Dna, Eye, Wand2, StarIcon, RefreshCw, Backpack, ArrowUp, ArrowDown, ClipboardList, Briefcase, ShieldQuestion, Book, Minus, Plus } from 'lucide-react';
import { ALL_CONSUMABLES } from '@/config/consumables';
import { buyConsumable } from '@/app/shop/consumables/actions';
import { buyMoveBook } from '@/app/shop/moves/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ConsumableItem } from '@/types/items';
import type { View } from './types';
import type { LucideIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const consumableIconMap: Record<string, LucideIcon> = { FlaskConical, Medal, ShieldAlert, ShieldCheck, HeartPulse, Sword, Shield, Sparkles, Gauge, Heart, Info, Circle, Target, Flame, HandHelping, Droplets, TrendingUp, MoreHorizontal, Leaf, Sun, Moon, Feather, Bird, PersonStanding, Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, ShieldBan, Hand, Bot, Dna, Bone, Beaker, Eye, Wand2, StarIcon, RefreshCw, Backpack, ArrowUp, ArrowDown, ClipboardList, Briefcase, ShieldQuestion };
const getConsumableIconElement = (item: ConsumableItem, className?: string) => {
  const IconComponent = consumableIconMap[item.iconName] || Info;
  return <IconComponent className={className || "w-6 h-6 mr-3 text-primary flex-shrink-0"} />;
};

interface ShopPageProps {
  onNavigate: (view: View) => void;
  trainerName: string;
  menuPlayerData: Fighter | null;
}

interface PurchaseDialogState {
    item: ConsumableItem;
    quantity: number;
}

export const ShopPage = ({ onNavigate, trainerName, menuPlayerData }: ShopPageProps) => {
    const [player, setPlayer] = useState<Fighter | null>(menuPlayerData);
    const [isPending, startTransition] = useTransition();
    const [purchaseDialogState, setPurchaseDialogState] = useState<PurchaseDialogState | null>(null);

    useEffect(() => {
        setPlayer(menuPlayerData);
    }, [menuPlayerData]);

    const handleOpenPurchaseDialog = (item: ConsumableItem) => {
        setPurchaseDialogState({ item, quantity: 1 });
    };

    const handleQuantityChange = (change: number) => {
        if (!purchaseDialogState) return;
        setPurchaseDialogState(prevState => {
            if (!prevState) return null;
            const newQuantity = Math.max(1, prevState.quantity + change);
            return { ...prevState, quantity: newQuantity };
        });
    };

    const handleBuyConsumable = () => {
        if (!purchaseDialogState || !player) return;
        const { item, quantity } = purchaseDialogState;
        const totalCost = item.cost * quantity;
        
        if (player.money === undefined || player.money < totalCost) {
            // Optionally show a toast for insufficient funds
            return;
        }

        startTransition(async () => {
            // We'll call the server action `quantity` times.
            // A more optimized approach might be a new server action that accepts quantity.
            // For now, this respects the existing action signature.
            let latestPlayerState = player;
            for (let i = 0; i < quantity; i++) {
                const result = await buyConsumable(trainerName, item.id, item.cost);
                if (result.success && result.updatedPlayer) {
                    latestPlayerState = result.updatedPlayer;
                } else {
                    // Stop on first failure
                    break;
                }
            }
            setPlayer(latestPlayerState);
            setPurchaseDialogState(null); // Close dialog on success
        });
    };
    
    const bookOptions: { rarity: AttackRarity, label: string, cost: number, icon: React.ReactNode, color: string }[] = [ { rarity: 'Common', label: 'Comuni', cost: 50, icon: <Book className="h-8 w-8 text-gray-400" />, color: "border-gray-400/50 hover:border-gray-400" }, { rarity: 'Rare', label: 'Rare', cost: 100, icon: <Book className="h-8 w-8 text-blue-400" />, color: "border-blue-400/50 hover:border-blue-400" }, { rarity: 'Epic', label: 'Epiche', cost: 250, icon: <Book className="h-8 w-8 text-purple-500" />, color: "border-purple-500/50 hover:border-purple-500" } ];
    
    const handleBuyBook = (rarity: AttackRarity, cost: number) => {
        if (!player || player.money === undefined || player.money < cost) {
            return;
        }
        startTransition(async () => {
            const result = await buyMoveBook(trainerName, rarity);
            if (result.success && result.updatedPlayer) {
                setPlayer(result.updatedPlayer);
            }
        });
    };

    if (!player) {
        return <div className="min-h-screen flex items-center justify-center bg-transparent"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center text-foreground relative">
            <header className="w-full p-6 flex items-center justify-between">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full hover:bg-background/20" onClick={() => onNavigate('main')}>
                    <ChevronLeftCircle className="h-12 w-12" strokeWidth={3} />
                </Button>
                 <div className="flex items-center space-x-2 bg-card p-2 rounded-lg border border-border shadow-md">
                    <Coins className="h-6 w-6 text-yellow-400" />
                    <span className="font-bold text-lg text-foreground">{player.money ?? 0}</span>
                </div>
            </header>
            <main className="w-full max-w-4xl p-4 sm:p-6 pt-0">
                <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
                  <CardHeader><CardTitle className="text-2xl text-center text-accent">Libri delle Mosse</CardTitle></CardHeader>
                  <CardContent className="p-4 pt-0">
                     <div className="grid grid-cols-3 gap-4">
                        {bookOptions.map(({ rarity, label, cost, icon, color }) => (
                            <Card key={rarity} className={cn("text-center p-4 flex flex-col items-center justify-between cursor-pointer transition-all", color)} onClick={() => handleBuyBook(rarity, cost)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleBuyBook(rarity, cost)}>
                                {icon}
                                <p className="text-lg font-semibold mt-2">{label}</p>
                                <p className="text-sm text-yellow-400 font-bold flex items-center gap-1.5">{cost} <Coins className="w-4 h-4"/></p>
                            </Card>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Separator className="my-6" />

                <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
                    <CardHeader><CardTitle className="text-2xl text-center text-accent">Consumabili</CardTitle></CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[35vh]">
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 p-2">
                            {ALL_CONSUMABLES.filter(item => item.category !== 'Resti' && item.category !== 'Potenziamenti Illegali').map((item) => (
                                <div key={item.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleOpenPurchaseDialog(item)}>
                                    <div className="p-3 bg-card/70 border rounded-lg hover:bg-accent/10 hover:border-accent transition-colors">
                                        {getConsumableIconElement(item, "w-8 h-8 text-primary")}
                                    </div>
                                    <p className="text-xs text-center font-medium truncate w-full">{item.name}</p>
                                </div>
                            ))}
                          </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </main>

            {purchaseDialogState && (
                <Dialog open={!!purchaseDialogState} onOpenChange={(open) => !open && setPurchaseDialogState(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-2xl">
                                {getConsumableIconElement(purchaseDialogState.item)}
                                {purchaseDialogState.item.name}
                            </DialogTitle>
                            <DialogDescription>{purchaseDialogState.item.description}</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="flex items-center justify-center gap-4">
                                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={purchaseDialogState.quantity <= 1}><Minus /></Button>
                                <span className="text-2xl font-bold w-12 text-center">{purchaseDialogState.quantity}</span>
                                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}><Plus /></Button>
                            </div>
                            <div className="text-center text-xl font-semibold">
                                Costo Totale: 
                                <span className="ml-2 text-yellow-400 flex items-center justify-center gap-1.5">
                                    {purchaseDialogState.item.cost * purchaseDialogState.quantity}
                                    <Coins className="w-5 h-5"/>
                                </span>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Annulla</Button></DialogClose>
                            <Button
                                type="button"
                                onClick={handleBuyConsumable}
                                disabled={isPending || (player.money ?? 0) < purchaseDialogState.item.cost * purchaseDialogState.quantity}
                            >
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Acquista
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

        </div>
    );
};
