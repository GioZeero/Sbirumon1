

'use client';

import React, { useState, useEffect, useTransition } from 'react';
import type { Fighter } from '@/types/battle';
import { getPlayerProfileData } from '@/lib/fighter-repository';
import { useConsumableOutOfBattle } from '@/app/items/consumables/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, HeartPulse, Gauge, Star, Target, Bone, Info, FlaskConical, Medal, ShieldAlert, ShieldCheck, Heart, Circle, Flame, HandHelping, Droplets, TrendingUp, MoreHorizontal, Leaf, Sun, Moon, Feather, Bird, PersonStanding, Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, ShieldBan, Hand, Bot, Dna, Beaker, Eye, Wand2, StarIcon, RefreshCw, Backpack, ArrowUp, ArrowDown, ClipboardList, Briefcase, ShieldQuestion, ChevronLeftCircle, PackagePlus, Sword, Shield, Sparkles } from 'lucide-react';
import type { ConsumableItem } from '@/types/items';
import { STATUS_EFFECTS } from '@/config/statusEffects';
import type { View } from './types';
import type { LucideIcon } from 'lucide-react';

const consumableIconMap: Record<string, LucideIcon> = { FlaskConical, Medal, ShieldAlert, ShieldCheck, HeartPulse, Sword, Shield, Sparkles, Gauge, Heart, Info, Circle, Target, Flame, HandHelping, Droplets, TrendingUp, MoreHorizontal, Leaf, Sun, Moon, Feather, Bird, PersonStanding, Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, ShieldBan, Hand, Bot, Dna, Bone, Beaker, Eye, Wand2, StarIcon, RefreshCw, Backpack, ArrowUp, ArrowDown, ClipboardList, Briefcase, ShieldQuestion };

const getConsumableIconElement = (item: ConsumableItem, className?: string) => {
  const IconComponent = consumableIconMap[item.iconName] || Info;
  return <IconComponent className={className || "w-6 h-6 mr-3 text-primary flex-shrink-0"} />;
};

const getEffectDetails = (item: ConsumableItem): string => {
  switch (item.effect.type) {
    case 'heal':
      let details: string[] = [];
      if (item.effect.amount) details.push(`Cura: ${item.effect.amount} HP`);
      if (item.effect.percentage) details.push(`Cura: Tutti gli HP`);
      if (item.effect.curesStatus && item.effect.curesStatus.length > 0) {
        const statusNames = item.effect.curesStatus.map(id => STATUS_EFFECTS[id]?.name || id).join(', ');
        details.push(`Cura stati: ${statusNames}`);
      }
      return details.join('; ');
    case 'stat_boost':
      const statName = item.effect.stat === 'maxHealth' ? 'HP Massimi' : item.effect.stat === 'attackStat' ? 'Attacco' : item.effect.stat === 'defenseStat' ? 'Difesa' : item.effect.stat === 'specialAttackStat' ? 'Attacco Speciale' : item.effect.stat === 'specialDefenseStat' ? 'Difesa Speciale' : item.effect.stat === 'speedStat' ? 'Velocità' : item.effect.stat;
      return `Aumenta ${statName}: +${(item.effect.percentage * 100).toFixed(0)}% (Base)`;
    case 'level_up': return `Aumenta Livello: +${item.effect.levels}`;
    case 'capture': return `Chance cattura: ${(item.effect.chance * 100).toFixed(0)}%`;
    case 'placeholder': return item.effect.description;
    case 'growth_boost': return `Aumenta crescita stats del 15%`;
    case 'evolve_chance': return `Chance del ${(item.effect.chance * 100).toFixed(0)}% di evoluzione forzata.`;
    default: return 'Effetto non specificato.';
  }
};

interface CategorizedConsumables { [key: string]: ConsumableItem[]; }
function categorizeConsumables(items: ConsumableItem[]): CategorizedConsumables {
  const categorized: CategorizedConsumables = { 'Cura': [], 'Integratore Statistiche': [], 'Speciale': [], 'Strumenti di Cattura': [], 'Resti': [], 'Potenziamenti Illegali': [] };
  items.forEach(item => {
    if (categorized[item.category]) categorized[item.category].push(item);
    else { if (!categorized['Altro']) categorized['Altro'] = []; categorized['Altro'].push(item); }
  });
  return categorized;
}

interface ConsumablesPageProps {
  onNavigate: (view: View) => void;
  trainerName: string;
  onPlayerDataChange: (newPlayerData: Fighter) => void;
}

export const ConsumablesPage = ({ onNavigate, trainerName, onPlayerDataChange }: ConsumablesPageProps) => {
    const [player, setPlayer] = useState<Fighter | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [selectedCategoryItems, setSelectedCategoryItems] = useState<ConsumableItem[]>([]);

    useEffect(() => {
        setIsLoading(true);
        getPlayerProfileData(trainerName).then(data => {
            setPlayer(data);
            setIsLoading(false);
        }).catch(() => setIsLoading(false));
    }, [trainerName]);
    
    const handleUseItem = (itemId: string) => {
        startTransition(async () => {
            const result = await useConsumableOutOfBattle(trainerName, itemId);
            if (result.success && result.updatedPlayer) {
                onPlayerDataChange(result.updatedPlayer);
                setPlayer(result.updatedPlayer);
            }
        });
    };

    const handleOpenCategory = (categoryName: string, items: ConsumableItem[]) => {
        setSelectedCategoryName(categoryName);
        setSelectedCategoryItems(items);
        setIsCategoryModalOpen(true);
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-transparent"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    if (!player) return <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-transparent"><p>Errore nel caricamento dei dati.</p><Button variant="outline" size="icon" className="mt-4" onClick={() => onNavigate('items_hub')}><ArrowLeft /></Button></div>;
    
    const playerItems = player.inventory ? Object.values(player.inventory).map(invItem => invItem.item) : [];
    const categorizedItems = categorizeConsumables(playerItems.filter(item => item.category !== 'Potenziamenti Illegali'));

    const categoryOrder: (keyof typeof categorizedItems)[] = ['Cura', 'Integratore Statistiche', 'Speciale', 'Strumenti di Cattura', 'Resti'];
    const categoryIconMap: Record<string, LucideIcon> = { 'Cura': HeartPulse, 'Integratore Statistiche': Gauge, 'Speciale': Star, 'Strumenti di Cattura': Target, 'Resti': Bone, 'Altro': Info, 'Potenziamenti Illegali': Beaker };
    
    return (
      <div className="min-h-screen flex flex-col items-center text-foreground relative">
        <button onClick={() => onNavigate('items_hub')} className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
            <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
        </button>
        <main className="w-full max-w-4xl p-4 sm:p-6">
          <header className="w-full mb-12 mt-12 sm:mt-0"><div className="flex justify-center items-center"><PackagePlus className="mr-4 h-10 w-10 text-primary" /><h1 className="text-4xl sm:text-5xl font-headline text-primary text-center">Elenco Consumabili</h1></div></header>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryOrder.map(categoryName => {
                    const items = categorizedItems[categoryName];
                    if (!items || items.length === 0) return null;
                    const CategoryIcon = categoryIconMap[categoryName] || Info;

                    return (
                        <Button
                            key={categoryName}
                            variant="outline"
                            size="lg"
                            className="h-24 text-xl sm:text-2xl transition-transform duration-75 ease-in-out active:scale-95"
                            onClick={() => handleOpenCategory(categoryName, items)}
                        >
                            <CategoryIcon className="mr-3 h-8 w-8 text-accent" />
                            {categoryName}
                        </Button>
                    );
                })}
            </div>
        </main>
        <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl text-accent">{selectedCategoryName}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] -mx-4 px-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 py-4">
                      {selectedCategoryItems.map(item => {
                          const inventoryItem = player.inventory?.[item.id];
                          const quantity = inventoryItem?.quantity ?? 0;
                          
                          let disabledReason = isPending || quantity === 0;
                          if (item.effect.type === 'heal' && player.currentHealth >= player.maxHealth) disabledReason = true;
                          
                          const canUseCategory = ['Integratore Statistiche', 'Speciale', 'Cura'].includes(selectedCategoryName);
                          const canUseNow = canUseCategory && selectedCategoryName !== 'Strumenti di Cattura' && selectedCategoryName !== 'Resti';

                          return (
                          <Card key={item.id} className="bg-card/70 flex flex-col justify-between">
                            <div>
                                <CardHeader className="p-3 pb-2 flex-row items-center justify-between">
                                   <CardTitle className="flex items-center text-lg">{getConsumableIconElement(item, "w-5 h-5 mr-2 text-primary")}{item.name}</CardTitle>
                                  <Badge variant={quantity > 0 ? "default" : "outline"} className="text-sm">x{quantity}</Badge>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 space-y-1">
                                  <p className="text-sm text-muted-foreground leading-snug min-h-[2.5rem]">{item.description}</p>
                                  <Badge variant="outline" className="text-xs py-1 px-2 font-medium">{getEffectDetails(item)}</Badge>
                                </CardContent>
                            </div>
                            <div className="p-3 pt-0 mt-auto">
                                {canUseNow && (<Button className="w-full transition-transform duration-75 ease-in-out active:scale-95" size="sm" onClick={() => handleUseItem(item.id)} disabled={disabledReason}>{isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Usa"}</Button>)}
                            </div>
                          </Card>
                      )})}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
      </div>
    );
};
