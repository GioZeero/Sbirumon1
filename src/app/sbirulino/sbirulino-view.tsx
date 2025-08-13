

'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import type { Fighter, Attack, CreatureType, Archetype } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateCreatureName, sacrificeCreature } from './actions';
import {
  ArrowLeft, TrendingUp, Zap, Shield, Bone, Flame, Droplets, HandHelping,
  Sword, Sparkles, ShieldCheck, Gauge, Clover, Edit3, type LucideIcon, Star,
  Leaf, Sun, Moon, Pencil, Loader2, MoreHorizontal, BrainCircuit, Heart, Skull
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TentennamentoAttack } from '@/config/fighters';
import { STATUS_EFFECTS } from '@/config/statusEffects';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const creatureTypeIconMap: Record<CreatureType, LucideIcon> = {
  Fire: Flame,
  Water: Droplets,
  Grass: Leaf,
  Light: Sun,
  Dark: Moon,
};

const attackIconMap: Record<string, LucideIcon> = {
  Bone, Flame, HandHelping, Zap, Droplets, Shield,
  TrendingUp, MoreHorizontal, Leaf, Sun, Moon,
};

const getAttackIconElement = (attack: Attack, className?: string) => {
  const IconComponent = (attack.icon && attackIconMap[attack.icon]) ? attackIconMap[attack.icon] : TrendingUp;
  return <IconComponent className={className || "w-5 h-5 mr-2 flex-shrink-0"} />;
};

const getStatGrowthColor = (archetype: Archetype | undefined, stat: 'physical' | 'special' | 'other') => {
    if (!archetype || archetype === 'Balanced') return "";
    switch (archetype) {
        case 'Physical':
            if (stat === 'physical') return 'text-yellow-400';
            if (stat === 'special') return 'text-red-500';
            return '';
        case 'Special':
            if (stat === 'special') return 'text-yellow-400';
            if (stat === 'physical') return 'text-red-500';
            return '';
        default:
            return '';
    }
};

interface SbirulinoClientViewProps {
    initialSbirulino: Fighter;
    onNavigate: (view: any) => void;
    allGameAttacks: Attack[];
    previousView: any;
}

export default function SbirulinoClientView({ initialSbirulino, onNavigate, allGameAttacks, previousView }: SbirulinoClientViewProps) {
    const [sbirulino, setSbirulino] = useState(initialSbirulino);
    const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
    const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
    const [isMovesDialogOpen, setIsMovesDialogOpen] = useState(false);
    const [newName, setNewName] = useState(sbirulino.name);
    const [isPending, startTransition] = useTransition();
    const [selectedAttackForDetails, setSelectedAttackForDetails] = useState<Attack | null>(null);
    const [showAttackDetailsDialog, setShowAttackDetailsDialog] = useState(false);
    const { toast } = useToast();

    const handleNameChangeSubmit = async () => {
        if (newName.trim() === sbirulino.name || !sbirulino.trainerName) {
            setIsNameDialogOpen(false);
            return;
        }

        startTransition(async () => {
            const result = await updateCreatureName(sbirulino.trainerName!, newName);
            if (result.success) {
                setSbirulino(prev => ({...prev, name: newName.trim()}));
                setIsNameDialogOpen(false);
            }
        });
    };
    
    const handleAttackClick = (attackId: string) => {
        const attack = allGameAttacks.find(a => a.id === attackId);
        if (attack) {
            setSelectedAttackForDetails(attack);
            setShowAttackDetailsDialog(true);
        }
    };
    
    const handleSacrifice = () => {
        if (!sbirulino.trainerName) return;
        startTransition(async () => {
            const result = await sacrificeCreature(sbirulino.trainerName!);
            if (result.success) {
                toast({
                    title: "Sacrificio Compiuto",
                    description: result.droppedItem ? `Hai ottenuto: ${result.droppedItem.name}` : "Il tuo Sbirulino è svanito."
                });
                // After a short delay, navigate to the creature selection screen
                setTimeout(() => onNavigate('creature_selection'), 1000);
            } else {
                 toast({
                    title: "Errore",
                    description: result.message,
                    variant: 'destructive'
                });
            }
        });
    };

    const getStatColor = (current: number, base: number): string => {
        if (current > base) return "text-green-400";
        if (current < base) return "text-destructive";
        return "text-foreground/90";
    };

    const xpPercentage = sbirulino.xpToNextLevel > 0 ? (sbirulino.currentXP / sbirulino.xpToNextLevel) * 100 : 0;
    const SbirulinoTypeIcon = creatureTypeIconMap[sbirulino.creatureType];
    const archetype = sbirulino.archetype || 'Balanced';
    
    return (
        <div className="min-h-screen flex flex-col items-center text-foreground relative">
             <button onClick={() => onNavigate('main')} className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
                <ArrowLeft className="h-full w-full p-2" strokeWidth={3} />
            </button>
            <main className="w-full max-w-md mx-auto p-6 mt-16 space-y-6">
                <Card className="w-full bg-card/80 backdrop-blur-sm">
                    <CardHeader className="items-center pb-4">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary bg-background/10 mb-4">
                            <Image
                                src={sbirulino.spriteUrl}
                                alt={sbirulino.name}
                                width={160}
                                height={160}
                                className="w-full h-full object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="flex items-center justify-center gap-1">
                            <CardTitle className="text-3xl text-primary">{sbirulino.name}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setIsNameDialogOpen(true)} className="text-primary hover:text-primary/80 h-8 w-8">
                                <Pencil className="h-4 w-4"/>
                            </Button>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-sm mt-1">
                          <Badge variant="outline" className="flex items-center gap-1.5">
                            {SbirulinoTypeIcon && <SbirulinoTypeIcon className="w-3 h-3" />}
                            {sbirulino.creatureType}
                          </Badge>
                          <Badge variant="secondary">{archetype}</Badge>
                          {sbirulino.isEvolved && <Badge variant="default" className="bg-purple-500 text-white">Evoluto</Badge>}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2 px-6 pb-6 space-y-4">
                        <div>
                            <div className="flex items-center justify-between text-lg text-accent font-semibold">
                                <span className="flex items-center gap-2"><Star className="w-5 h-5" /> Livello</span>
                                <span>{sbirulino.level}</span>
                            </div>
                            <div className="w-full mt-1">
                                <p className="text-sm text-muted-foreground text-center mb-1">XP: {sbirulino.currentXP} / {sbirulino.xpToNextLevel}</p>
                                <Progress value={xpPercentage} className="h-2.5" indicatorClassName="bg-accent" />
                            </div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground">Salute Massima: {sbirulino.maxHealth} HP</p>
                    </CardContent>
                </Card>

                <Card className="w-full bg-card/80 backdrop-blur-sm">
                    <CardHeader><CardTitle className="text-center text-xl text-primary">Informazioni & Azioni</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                           <Button variant="outline" size="lg" className="w-full h-14 text-lg" onClick={() => setIsStatsDialogOpen(true)}>
                                Statistiche
                           </Button>
                           <Button variant="outline" size="lg" className="w-full h-14 text-lg" onClick={() => setIsMovesDialogOpen(true)}>
                                Mosse
                           </Button>
                        </div>
                        <Separator/>
                        <div className="space-y-3">
                           <h3 className="text-center font-semibold text-muted-foreground">Gestione</h3>
                            {!sbirulino.isUnique && (
                               <Button variant="outline" size="lg" className="w-full h-14 text-lg" onClick={() => onNavigate('items_moves_edit')}>
                                   <Edit3 className="mr-2 h-5 w-5" />
                                   Modifica Mosse
                               </Button>
                           )}
                           <AlertDialog>
                               <AlertDialogTrigger asChild>
                                   <Button variant="destructive" size="lg" className="w-full h-14 text-lg">
                                       <Skull className="mr-2 h-5 w-5" />
                                       Sacrifica Creatura
                                   </Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent>
                                   <AlertDialogHeader>
                                       <AlertDialogTitle>Sei sicuro di voler sacrificare {sbirulino.name}?</AlertDialogTitle>
                                       <AlertDialogDescription>
                                           Questa azione è irreversibile. Terminerai la tua avventura con questa creatura e dovrai sceglierne una nuova. C'è una piccola possibilità di ottenere un oggetto raro.
                                       </AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                       <AlertDialogCancel>Annulla</AlertDialogCancel>
                                       <AlertDialogAction onClick={handleSacrifice} disabled={isPending}>
                                           {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sì, Sacrifica"}
                                       </AlertDialogAction>
                                   </AlertDialogFooter>
                               </AlertDialogContent>
                           </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </main>
            
            <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifica il nome di {sbirulino.name}</DialogTitle>
                  <DialogDescription>
                    Scegli un nuovo nome per il tuo Sbirulino. Deve essere tra 3 e 15 caratteri.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="col-span-3"
                    maxLength={15}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameChangeSubmit()}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Annulla
                    </Button>
                  </DialogClose>
                  <Button onClick={handleNameChangeSubmit} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salva
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-accent text-center">Statistiche di {sbirulino.name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-md mt-4">
                    <div className="flex items-center"><Sword className="w-4 h-4 mr-2 text-primary/80" /> <span className={cn(getStatGrowthColor(archetype, 'physical'))}>Attacco</span> <span className={cn("ml-auto font-semibold", getStatColor(sbirulino.currentAttackStat, sbirulino.attackStat))}>{sbirulino.currentAttackStat ?? 'N/A'}</span></div>
                    <div className="flex items-center"><Shield className="w-4 h-4 mr-2 text-primary/80" /> <span className={cn(getStatGrowthColor(archetype, 'physical'))}>Difesa</span> <span className={cn("ml-auto font-semibold", getStatColor(sbirulino.currentDefenseStat, sbirulino.defenseStat))}>{sbirulino.currentDefenseStat ?? 'N/A'}</span></div>
                    <div className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-primary/80" /> <span className={cn(getStatGrowthColor(archetype, 'special'))}>Attacco Sp</span> <span className={cn("ml-auto font-semibold", getStatColor(sbirulino.currentSpecialAttackStat, sbirulino.specialAttackStat))}>{sbirulino.currentSpecialAttackStat ?? 'N/A'}</span></div>
                    <div className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-primary/80" /> <span className={cn(getStatGrowthColor(archetype, 'special'))}>Difesa Sp</span> <span className={cn("ml-auto font-semibold", getStatColor(sbirulino.currentSpecialDefenseStat, sbirulino.specialDefenseStat))}>{sbirulino.currentSpecialDefenseStat ?? 'N/A'}</span></div>
                    <div className="flex items-center"><Gauge className="w-4 h-4 mr-2 text-primary/80" /> <span className={cn(getStatGrowthColor(archetype, 'other'))}>Velocità</span> <span className={cn("ml-auto font-semibold", getStatColor(sbirulino.currentSpeedStat, sbirulino.speedStat))}>{sbirulino.currentSpeedStat ?? 'N/A'}</span></div>
                    <div className="flex items-center"><Clover className="w-4 h-4 mr-2 text-primary/80" /> <span className={cn(getStatGrowthColor(archetype, 'other'))}>Fortuna</span> <span className={cn("ml-auto font-semibold", getStatColor(sbirulino.currentLuckStat, sbirulino.luckStat))}>{sbirulino.currentLuckStat ?? 'N/A'}</span></div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isMovesDialogOpen} onOpenChange={setIsMovesDialogOpen}>
              <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-accent text-center">Mosse di {sbirulino.name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                  {sbirulino.attacks.map((attack, index) => (
                    attack.id !== TentennamentoAttack.id && (
                        <Button key={index} variant="outline" size="sm" className="truncate justify-start h-10 text-base" onClick={() => { setIsMovesDialogOpen(false); handleAttackClick(attack.id); }}>
                            {getAttackIconElement(attack, "w-4 h-4 mr-2 flex-shrink-0")}
                            {attack.name}
                        </Button>
                    )
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {selectedAttackForDetails && (
              <Dialog open={showAttackDetailsDialog} onOpenChange={setShowAttackDetailsDialog}>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle className="flex items-center text-primary text-2xl">
                            {getAttackIconElement(selectedAttackForDetails, "w-6 h-6 mr-3")}
                            {selectedAttackForDetails.name}
                          </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 text-sm">
                          <p><strong>Categoria:</strong> <Badge variant="outline">{selectedAttackForDetails.category}</Badge></p>
                          <p><strong>Tipo:</strong> <Badge variant="outline">{selectedAttackForDetails.creatureType}</Badge></p>
                          <p><strong>Rarità:</strong> <Badge variant="secondary">{selectedAttackForDetails.rarity}</Badge></p>
                          <p><strong>Danno:</strong> <span className="font-semibold">{selectedAttackForDetails.damage > 0 ? selectedAttackForDetails.damage : (selectedAttackForDetails.damage < 0 ? `Cura ${Math.abs(selectedAttackForDetails.damage)}` : 'N/A')}</span></p>
                          <p><strong>Precisione:</strong> <span className="font-semibold">{(selectedAttackForDetails.accuracy * 100).toFixed(0)}%</span></p>
                          {selectedAttackForDetails.effect && (
                            <p>
                              <strong>Effetto:</strong> {(selectedAttackForDetails.effect.chance * 100).toFixed(0)}% di <Badge variant="destructive">{STATUS_EFFECTS[selectedAttackForDetails.effect.statusId]?.name || 'Effetto Sconosciuto'}</Badge>
                            </p>
                          )}
                          {selectedAttackForDetails.recoil && (<p><strong>Rinculo:</strong> <span className="font-semibold">{(selectedAttackForDetails.recoil * 100).toFixed(0)}% del danno inflitto</span></p>)}
                      </div>
                  </DialogContent>
              </Dialog>
            )}
        </div>
    );
}
