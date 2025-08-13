

'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, Wand2, Sword, Shield, Sparkles, ShieldCheck, Gauge, Clover, Bone, Feather, Coins, ChevronLeftCircle } from 'lucide-react';
import type { Fighter } from '@/types/battle';
import { randomizePlayerStats as rerollPlayerStatsInRepo, evolvePlayerCreatureWithDebuff, getPlayerProfileData, updatePlayerPersistentInventory, updatePlayerMoney } from '@/lib/fighter-repository';
import { GameBalance } from '@/config/game-balance';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { View } from './types';


// Server Actions need to be defined in the same file if they are not in a separate 'actions.ts' file
async function rerollStats(trainerName: string): Promise<{ success: boolean; message: string; updatedPlayer?: Fighter }> {
  const player = await getPlayerProfileData(trainerName);
  if (!player) {
    return { success: false, message: 'Giocatore non trovato.' };
  }
  if ((player.money ?? 0) < 1000) {
    return { success: false, message: 'Non hai abbastanza monete.' };
  }
  try {
    const playerAfterPayment = await updatePlayerMoney(trainerName, -1000);
    if (!playerAfterPayment) {
        throw new Error('Payment failed');
    }
    const result = await rerollPlayerStatsInRepo(trainerName);
    if (result.success && result.updatedPlayer) {
       return { success: true, message: result.message, updatedPlayer: result.updatedPlayer };
    } else {
       await updatePlayerMoney(trainerName, 1000); // Refund on failure
       return { success: false, message: result.message || 'Errore durante la randomizzazione.' };
    }
  } catch (error) {
    console.error('Failed to reroll stats:', error);
    await updatePlayerMoney(trainerName, 1000);
    return { success: false, message: 'Errore durante la randomizzazione delle statistiche.' };
  }
}

async function evolveWithRemains(
  trainerName: string,
  itemToConsumeId: string
): Promise<{ success: boolean; message: string; updatedPlayer?: Fighter }> {
  try {
    const player = await getPlayerProfileData(trainerName);
    if (!player) {
      return { success: false, message: 'Giocatore non trovato.' };
    }
    if ((player.money ?? 0) < 1000) {
        return { success: false, message: 'Non hai abbastanza monete per il rito.' };
    }
     if (player.isEvolved) {
        return { success: false, message: 'Il tuo Sbirumon è già evoluto.' };
    }
    if (!player.inventory || !player.inventory[itemToConsumeId] || player.inventory[itemToConsumeId].quantity <= 0) {
        return { success: false, message: 'Non possiedi l\'oggetto necessario.' };
    }
    
    // Consume item and money first
    const playerAfterPayment = await updatePlayerMoney(trainerName, -1000);
    if (!playerAfterPayment) {
        throw new Error("Payment failed");
    }
    const playerAfterConsume = await updatePlayerPersistentInventory(trainerName, itemToConsumeId, -1);
    if (!playerAfterConsume) {
      await updatePlayerMoney(trainerName, 1000); // Refund
      throw new Error("Failed to consume item.");
    }

    if (Math.random() < GameBalance.REMAINS_EVOLVE_CHANCE) {
      const result = await evolvePlayerCreatureWithDebuff(trainerName);
      if(result) {
        return { success: true, message: `Incredibile! ${player.name} si è evoluto, ma sembra perennemente spaventato...`, updatedPlayer: result };
      } else {
        await updatePlayerMoney(trainerName, 1000); // Refund
        return { success: false, message: 'Evoluzione fallita.' };
      }
    } else {
      return { success: true, message: `Hai usato il resto, ma non è successo nulla...`, updatedPlayer: playerAfterConsume };
    }
  } catch (error) {
    console.error('Failed to evolve with remains:', error);
    return { success: false, message: 'Errore durante l\'evoluzione.' };
  }
}


interface SorcererTentPageProps {
  onNavigate: (view: View) => void;
  isMaster: boolean;
  trainerName: string;
  menuPlayerData: Fighter | null;
}

export const SorcererTentPage = ({ onNavigate, isMaster, trainerName, menuPlayerData }: SorcererTentPageProps) => {
  const [player, setPlayer] = useState<Fighter | null>(menuPlayerData);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
      setPlayer(menuPlayerData);
  }, [menuPlayerData]);


  const handleAction = () => {
    if (!player) return;
    
    startTransition(async () => {
      let result;
      if (isMaster) {
        if (player.isEvolved || !player.archetype) return;
        const requiredItemId =
          player.archetype === 'Physical' ? 'guscio_di_tartaruga' :
          player.archetype === 'Special' ? 'piuma' : 'dente';
        result = await evolveWithRemains(trainerName, requiredItemId);
      } else {
        result = await rerollStats(trainerName);
      }
      if (result.success && result.updatedPlayer) {
        setPlayer(result.updatedPlayer);
      }
    });
  };

  const getRequiredItemInfo = () => {
    if (!player || !player.archetype) return { id: '', name: 'Nessuno', icon: Bone, hasItem: false };
    switch (player.archetype) {
      case 'Physical':
        return { id: 'guscio_di_tartaruga', name: 'Guscio di Tartaruga', icon: Shield, hasItem: !!player.inventory?.['guscio_di_tartaruga']?.quantity };
      case 'Special':
        return { id: 'piuma', name: 'Piuma', icon: Feather, hasItem: !!player.inventory?.['piuma']?.quantity };
      case 'Balanced':
      default:
        return { id: 'dente', name: 'Dente', icon: Bone, hasItem: !!player.inventory?.['dente']?.quantity };
    }
  };

  if (!player) {
    return <div className="min-h-screen flex items-center justify-center bg-transparent"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const { icon: RequiredItemIcon, name: requiredItemName, hasItem } = getRequiredItemInfo();
  const totalStats = player.attackStat + player.defenseStat + player.specialAttackStat + player.specialDefenseStat + player.speedStat + player.luckStat;
  
  const pageTitle = isMaster ? "Tenda del Maestro Stregone" : "Tenda dello Stregone";
  const buttonText = isMaster ? "Forza Evoluzione" : "Randomizza Statistiche";
  const buttonIcon = isMaster ? Sparkles : Wand2;
  const actionDescription = isMaster 
    ? "Offri il Resto corretto per il tuo archetipo per tentare un'evoluzione. La creatura evoluta sarà potente, ma perennemente impaurita."
    : "Le tue statistiche totali rimarranno le stesse, ma il loro valore verrà rimescolato.";
  
  const cost = 1000;
  let isButtonDisabled = isPending || (player.money ?? 0) < cost;
  if(isMaster) {
      isButtonDisabled = isButtonDisabled || !hasItem || !!player.isEvolved;
  }


  return (
    <div className="min-h-screen flex flex-col items-center text-foreground pb-24 relative">
      <button onClick={() => onNavigate('arcane_path')} className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
          <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
      </button>
       <header className="w-full text-center mt-12 mb-4">
            <h1 className="text-4xl md:text-5xl font-headline text-primary">{pageTitle}</h1>
        </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start p-6">
        <div>
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-primary text-2xl">{player.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative w-40 h-40 rounded-full border-4 border-primary bg-background/50 mb-4 cursor-pointer" onClick={() => onNavigate('sbirulino')}>
                  <Image
                    src={player.spriteUrl}
                    alt={player.name}
                    width={160}
                    height={160}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
                <Badge variant="secondary">{player.archetype}</Badge>
                <div className="w-full mt-6 space-y-4">
                   <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Sword className="w-4 h-4 text-primary/80" />Attacco</div> <span className="font-semibold">{player.attackStat}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary/80" />Difesa</div> <span className="font-semibold">{player.defenseStat}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary/80" />Att. Sp.</div> <span className="font-semibold">{player.specialAttackStat}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary/80" />Dif. Sp.</div> <span className="font-semibold">{player.specialDefenseStat}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Gauge className="w-4 h-4 text-primary/80" />Velocità</div> <span className="font-semibold">{player.speedStat}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Clover className="w-4 h-4 text-primary/80" />Fortuna</div> <span className="font-semibold">{player.luckStat}</span></div>
                    </div>
                     <div className="border-t border-border pt-3 text-center">
                        <p className="text-lg font-bold">Punti Statistiche Totali: <span className="text-accent">{totalStats}</span></p>
                    </div>
                </div>
              </CardContent>
            </Card>
        </div>

        <div className="flex flex-col">
            <Card className="bg-card/70 backdrop-blur-sm sticky top-8">
                <CardHeader>
                    <CardTitle className="text-center text-accent text-2xl">Rito Arcano</CardTitle>
                    <CardDescription className="text-center text-muted-foreground mt-2">
                       {actionDescription}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    <div className="p-4 rounded-lg bg-background/50 border border-border w-full text-center">
                         <p className="text-lg font-semibold text-muted-foreground">Costo Rito</p>
                         <p className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-1.5">{cost} <Coins className="w-6 h-6"/></p>
                         <p className="text-xs text-muted-foreground">Tus fondos: {player.money ?? 0}</p>
                    </div>

                    {isMaster && (
                        <div className="p-4 rounded-lg bg-background/50 border border-border w-full">
                            <p className="text-center text-sm">Oggetto richiesto per l'archetipo <span className="font-bold text-primary">{player.archetype}</span>:</p>
                            <div className="flex items-center justify-center font-bold text-lg mt-2 gap-2">
                                <RequiredItemIcon className="w-6 h-6 text-primary"/>
                                {requiredItemName}
                            </div>
                        </div>
                    )}
                    <Button
                        size="lg"
                        className={cn("w-full text-lg py-7 text-white", isMaster ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700")}
                        onClick={handleAction}
                        disabled={isButtonDisabled}
                    >
                        {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : React.createElement(buttonIcon, {className: "mr-2 h-5 w-5"})}
                        {buttonText}
                    </Button>
                    {isMaster && !hasItem && !player.isEvolved && (
                        <p className="text-sm text-destructive text-center">Non possiedi l'oggetto necessario. Sacrifica uno Sbirumon per avere una possibilità di trovarlo.</p>
                    )}
                     {isMaster && player.isEvolved && (
                        <p className="text-sm text-green-400 text-center">Il tuo Sbirumon è già evoluto!</p>
                    )}
                     {!isMaster && (player.money ?? 0) < cost && (
                        <p className="text-sm text-destructive text-center">Non hai abbastanza monete.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
};

