

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wrench, Bone, Flame, HandHelping, Zap, Droplets, TrendingUp, Shield, type LucideIcon, Loader2, PlusSquare, Trash2, Leaf, Sun, Moon, MoreHorizontal } from 'lucide-react';
import type { Fighter, Attack, AttackRarity, CreatureType } from '@/types/battle';
import { updateSbirulinoMoves } from '@/app/items/moves/actions';
import { cn } from '@/lib/utils';
import { STATUS_EFFECTS } from '@/config/statusEffects';
import { TentennamentoAttack } from '@/config/fighters';
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from '@/components/ui/dialog';


const attackSpecificIconMap: Record<string, LucideIcon> = {
  Bone, Flame, HandHelping, Zap, Droplets, TrendingUp, Shield,
  MoreHorizontal, Leaf, Sun, Moon,
};

const creatureTypeIconMap: Record<CreatureType, LucideIcon> = {
  Fire: Flame,
  Water: Droplets,
  Grass: Leaf,
  Light: Sun,
  Dark: Moon,
};

const getAttackSpecificIconElement = (attack: Attack, className?: string) => {
  const IconComponent = (attack.icon && attackSpecificIconMap[attack.icon]) || attackSpecificIconMap['TrendingUp'];
  return <IconComponent className={className || "w-5 h-5 mr-2 flex-shrink-0"} />;
};

interface EditSbirulinoMovesViewProps {
  sbirulinoInitial: Fighter | null;
  availableAttacksInitial: Attack[];
  onNavigate: (view: any) => void;
}

type RarityCounts = { [key in AttackRarity]: number };

export default function EditSbirulinoMovesClientView({ sbirulinoInitial, availableAttacksInitial, onNavigate }: EditSbirulinoMovesViewProps) {
  const [sbirulino, setSbirulino] = useState<Fighter | null>(sbirulinoInitial);
  const [currentSbirulinoMoves, setCurrentSbirulinoMoves] = useState<Attack[]>([]);
  const [availableAttacks] = useState<Attack[]>(availableAttacksInitial);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showAttackDetailsDialog, setShowAttackDetailsDialog] = useState(false);
  const [selectedAttackForDetails, setSelectedAttackForDetails] = useState<Attack | null>(null);


  const maxMoves = sbirulino?.isEvolved ? 4 : 3;

  useEffect(() => {
    if (sbirulinoInitial) {
        setSbirulino(sbirulinoInitial);
        const maxSlots = sbirulinoInitial.isEvolved ? 4 : 3;
        const initialMoves = sbirulinoInitial.attacks.slice(0, maxSlots);
        while (initialMoves.length < maxSlots) {
            initialMoves.push(TentennamentoAttack);
        }
        setCurrentSbirulinoMoves(initialMoves);
    }
  }, [sbirulinoInitial]);

  const getRarityCounts = (moves: Attack[]): RarityCounts => {
    const counts: RarityCounts = { 'Common': 0, 'Rare': 0, 'Epic': 0, 'Legendary': 0 };
    moves.forEach(move => {
      if (move && move.id !== TentennamentoAttack.id) counts[move.rarity]++;
    });
    return counts;
  };

  const checkRarityConstraint = (moves: Attack[]): boolean => {
    if (sbirulino?.isEvolved) return true; // No rarity constraint for evolved creatures

    const actualMoves = moves.filter(move => move.id !== TentennamentoAttack.id);
    if (actualMoves.length === 3) {
      const counts = getRarityCounts(actualMoves);
      return counts['Common'] === 1 && counts['Rare'] === 1 && counts['Epic'] === 1;
    }
    return true; 
  };

  const triggerAutoSave = useCallback(async (movesToSave: Attack[]) => {
    if (!sbirulino || !sbirulino.trainerName) return;
    setIsAutoSaving(true);
    try {
      const result = await updateSbirulinoMoves(sbirulino.trainerName, movesToSave);
      if (result.success) {
        const newCurrentMoves = [...movesToSave];
        const maxSlots = sbirulino.isEvolved ? 4 : 3;
        while (newCurrentMoves.length < maxSlots) {
          newCurrentMoves.push(TentennamentoAttack);
        }
        setSbirulino(prevSbirulino => prevSbirulino ? { ...prevSbirulino, attacks: newCurrentMoves } : null);
        setCurrentSbirulinoMoves(newCurrentMoves);
      } else {
        if (sbirulinoInitial) {
            const maxSlots = sbirulinoInitial.isEvolved ? 4 : 3;
            const originalMoves = sbirulinoInitial.attacks.slice(0, maxSlots);
            while (originalMoves.length < maxSlots) {
              originalMoves.push(TentennamentoAttack);
            }
            setCurrentSbirulinoMoves(originalMoves);
        }
      }
    } catch (error) {
      if (sbirulinoInitial) {
        const maxSlots = sbirulinoInitial.isEvolved ? 4 : 3;
        const originalMoves = sbirulinoInitial.attacks.slice(0, maxSlots);
        while (originalMoves.length < maxSlots) {
          originalMoves.push(TentennamentoAttack);
        }
        setCurrentSbirulinoMoves(originalMoves);
      }
    } finally {
      setIsAutoSaving(false);
      setSelectedSlotIndex(null);
    }
  }, [sbirulino, sbirulinoInitial]);

  const handleSelectSlot = (index: number) => {
    setSelectedSlotIndex(index);
  };
  
  const handleEquippedMoveClick = (attack: Attack, index: number) => {
      if (selectedSlotIndex === null) {
          setSelectedAttackForDetails(attack);
          setShowAttackDetailsDialog(true);
      } else {
          handleSelectSlot(index);
      }
  };

  const handleRemoveMove = (indexToRemove: number) => {
    const actualMoves = currentSbirulinoMoves.filter(move => move.id !== TentennamentoAttack.id);

    if (actualMoves.length <= 1) {
      // toast({ title: "Azione non consentita", description: "Devi avere almeno una mossa vera equipaggiata.", variant: "destructive", duration: 3000 });
      return;
    }
    
    if (!sbirulino?.isEvolved && actualMoves.length === 3) {
        const moveToRemove = currentSbirulinoMoves[indexToRemove];
        const rarityToRemove = moveToRemove.rarity;

        const hasReplacement = availableAttacks.some(availableMove => 
            availableMove.rarity === rarityToRemove && 
            !currentSbirulinoMoves.some(equippedMove => equippedMove.id === availableMove.id)
        );

        if (!hasReplacement) {
            // toast({ title: "Azione non consentita", description: `Non puoi rimuovere una mossa ${rarityToRemove} senza averne un'altra disponibile per mantenere il vincolo 1C/1R/1E.`, variant: "destructive", duration: 5000 });
            return;
        }
    }

    const newMoves = [...currentSbirulinoMoves];
    newMoves[indexToRemove] = TentennamentoAttack;
    triggerAutoSave(newMoves);
  };

  const handleSelectAvailableMove = (newAttack: Attack) => {
    if (selectedSlotIndex === null) {
      setSelectedAttackForDetails(newAttack);
      setShowAttackDetailsDialog(true);
      return;
    }
    const isDuplicate = currentSbirulinoMoves.some((move, i) => move && move.id === newAttack.id && i !== selectedSlotIndex);
    if (isDuplicate) {
      return;
    }
    const finalProposedMoves = [...currentSbirulinoMoves];
    finalProposedMoves[selectedSlotIndex] = newAttack;
    if (!checkRarityConstraint(finalProposedMoves)) {
      return;
    }
    triggerAutoSave(finalProposedMoves);
  };

  if (!sbirulino) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-foreground">
        <p>Errore nel caricamento dei dati di Sbirulino.</p>
        <Button variant="outline" className="mt-4" onClick={() => onNavigate('main')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  const actualMovesCount = currentSbirulinoMoves.filter(m => m.id !== TentennamentoAttack.id).length;
  const helpText = sbirulino.isEvolved 
      ? `Clicca su uno slot, quindi su una mossa disponibile. Max 4 mosse. Min 1 mossa.`
      : `Clicca su uno slot, quindi su una mossa disponibile. Max 3 mosse (1C, 1R, 1E se 3 mosse). Min 1 mossa.`;

  return (
    <div className="min-h-screen flex flex-col items-center text-foreground relative">
      <Button variant="ghost" size="icon" className="absolute top-6 left-6 z-10 h-16 w-16 rounded-full hover:bg-background/20" onClick={() => onNavigate('main')}>
          <ArrowLeft className="h-16 w-16" strokeWidth={3} />
      </Button>
      <main className="w-full max-w-4xl space-y-4 p-4 sm:p-6 md:p-8">
        <header className="w-full mt-12 sm:mt-0 mb-4">
          
        </header>
        <div className="flex justify-between items-center px-2">
          <p className="text-sm text-muted-foreground">{helpText}</p>
          {isAutoSaving && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>
        
        <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4">
            <section className="mb-6">
              <h2 className="text-xl font-headline text-accent mb-3">Mosse Attuali di {sbirulino.name} ({actualMovesCount}/{maxMoves})</h2>
              <div className={cn(
                "grid gap-3",
                sbirulino.isEvolved ? "grid-cols-4" : "grid-cols-3"
              )}>
                {currentSbirulinoMoves.map((attack, slotIndex) => {
                  const AttackTypeIcon = attack.creatureType ? creatureTypeIconMap[attack.creatureType] : null;
                  
                  if (attack.id === TentennamentoAttack.id) {
                    return (
                      <Card key={`placeholder-${slotIndex}`} className={cn("bg-card hover:bg-card/70 cursor-pointer transition-all border-dashed flex flex-col items-center justify-center min-h-[120px]", selectedSlotIndex === slotIndex && "ring-2 ring-primary shadow-lg")} onClick={() => handleSelectSlot(slotIndex)} tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectSlot(slotIndex)}>
                        <CardContent className="flex flex-col items-center justify-center text-center p-2"><PlusSquare className="w-8 h-8 text-muted-foreground mb-2" /><p className="text-xs text-muted-foreground">Aggiungi Mossa</p></CardContent>
                      </Card>
                    );
                  } else {
                    return (
                      <Card key={attack.id + '-' + slotIndex} className={cn("bg-card hover:bg-card/90 cursor-pointer transition-all relative min-h-[120px]", selectedSlotIndex === slotIndex && "ring-2 ring-primary shadow-lg")} onClick={() => handleEquippedMoveClick(attack, slotIndex)} tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleEquippedMoveClick(attack, slotIndex)}>
                        <Button variant="ghost" size="sm" className="absolute top-1 right-1 p-1 h-auto text-muted-foreground hover:text-destructive z-10" onClick={(e) => { e.stopPropagation(); handleRemoveMove(slotIndex);}} aria-label="Rimuovi mossa"><Trash2 className="w-4 h-4"/></Button>
                        <CardHeader className="p-3 flex flex-col justify-center items-center h-full">
                            <div className="flex-shrink-0 w-8 h-8 mb-2">{getAttackSpecificIconElement(attack, "w-full h-full text-primary")}</div>
                            <CardTitle className="flex items-center text-center text-base space-x-1.5"><span className="flex-grow min-w-0 truncate">{attack.name}</span></CardTitle>
                        </CardHeader>
                      </Card>
                    );
                  }
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-headline text-accent mb-3">Mosse Disponibili</h2>
              {availableAttacks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {availableAttacks.map((attack) => {
                    const AttackTypeIcon = creatureTypeIconMap[attack.creatureType];
                    const isAlreadyEquipped = currentSbirulinoMoves.some((m, i) => m.id === attack.id && i !== selectedSlotIndex);
                    
                    const cardClickHandler = () => {
                      if (selectedSlotIndex !== null) {
                        if (!isAlreadyEquipped) handleSelectAvailableMove(attack);
                      } else {
                        setSelectedAttackForDetails(attack);
                        setShowAttackDetailsDialog(true);
                      }
                    }

                    return (
                    <Card key={attack.id} className={cn("bg-card hover:bg-card/90 cursor-pointer transition-all", isAlreadyEquipped && "opacity-60 border-dashed border-muted-foreground cursor-not-allowed")}
                      onClick={cardClickHandler}
                      tabIndex={isAlreadyEquipped ? -1 : 0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') cardClickHandler() }}
                      aria-disabled={isAlreadyEquipped}>
                      <CardHeader className="p-3 flex flex-col justify-between h-full">
                        <div>
                          <CardTitle className="flex items-center text-base space-x-1.5 mb-2"><div className="flex-shrink-0 w-4 h-4">{getAttackSpecificIconElement(attack, "w-full h-full")}</div><span className="flex-grow min-w-0 truncate">{attack.name}</span></CardTitle>
                        </div>
                        <div className="flex items-center space-x-1 mt-auto">{AttackTypeIcon && <AttackTypeIcon className="w-3 h-3 text-primary/80" />}<Badge variant="outline" className="text-xs py-0.5 px-1.5">{attack.creatureType}</Badge><Badge variant="secondary" className="text-xs py-0.5 px-1.5">{attack.rarity}</Badge></div>
                      </CardHeader>
                    </Card>
                  );
                })}
                </div>
              ) : (<p className="text-muted-foreground">Nessuna mossa disponibile.</p>)}
            </section>
        </div>
      </main>
      {selectedAttackForDetails && (
          <Dialog open={showAttackDetailsDialog} onOpenChange={setShowAttackDetailsDialog}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle className="flex items-center text-primary text-2xl">
                          {getAttackSpecificIconElement(selectedAttackForDetails, "w-6 h-6 mr-3")}
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

    
