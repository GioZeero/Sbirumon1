

'use client';

import React, { useState, useTransition } from 'react';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, Wand2, Sparkles, Coins, Dna, Heart } from 'lucide-react';
import type { View } from './types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ALL_CONSUMABLES } from '@/config/consumables';
import { GameBalance } from '@/config/game-balance';
import { evolvePlayerCreatureWithDebuff, randomizePlayerStats, updatePlayerMoney, updatePlayerPersistentInventory, getPlayerProfileData } from '@/lib/fighter-repository';
import { useToast } from '@/hooks/use-toast';


// Server actions defined directly in the view component
async function performStatReroll(trainerName: string): Promise<{ success: boolean, message: string, updatedPlayer?: Fighter }> {
    const cost = 1000;
    
    const playerPreAction = await getPlayerProfileData(trainerName);
    if (!playerPreAction) {
        return { success: false, message: 'Giocatore non trovato.' };
    }
     if ((playerPreAction.money ?? 0) < cost) {
        return { success: false, message: 'Fondi insufficienti.' };
    }

    const playerAfterPayment = await updatePlayerMoney(trainerName, -cost);
     if (!playerAfterPayment) {
        return { success: false, message: 'Errore durante il pagamento.' };
    }

    const rerollResult = await randomizePlayerStats(trainerName);
    if (!rerollResult.success || !rerollResult.updatedPlayer) {
        // Refund if reroll fails
        await updatePlayerMoney(trainerName, cost);
        return { success: false, message: rerollResult.message || 'Errore durante il rimescolamento.' };
    }
    
    return { success: true, message: 'Statistiche rimescolate!', updatedPlayer: rerollResult.updatedPlayer };
}

async function performForcedEvolution(trainerName: string, requiredItemId: string): Promise<{ success: boolean, message: string, updatedPlayer?: Fighter }> {
    const cost = 1000;

    const playerPreAction = await getPlayerProfileData(trainerName);
    if (!playerPreAction) {
        return { success: false, message: 'Giocatore non trovato.' };
    }

    const hasRequiredRemain = playerPreAction.inventory?.[requiredItemId]?.quantity ?? 0 > 0;
    if (!hasRequiredRemain) {
        return { success: false, message: 'Oggetto richiesto non trovato nell\'inventario.' };
    }

    if ((playerPreAction.money ?? 0) < cost) {
        return { success: false, message: 'Fondi insufficienti.' };
    }

    const playerAfterItemConsumed = await updatePlayerPersistentInventory(trainerName, requiredItemId, -1);
    if (!playerAfterItemConsumed) {
         return { success: false, message: 'Errore nel consumo dell\'oggetto.' };
    }

    const playerAfterPayment = await updatePlayerMoney(trainerName, -cost);
    if (!playerAfterPayment) {
        // Refund item if payment fails
        await updatePlayerPersistentInventory(trainerName, requiredItemId, 1);
        return { success: false, message: 'Errore durante il pagamento.' };
    }

    if (Math.random() < GameBalance.REMAINS_EVOLVE_CHANCE) {
        const evolvedPlayer = await evolvePlayerCreatureWithDebuff(trainerName);
        return { success: true, message: 'Evoluzione riuscita! Ma la tua creatura è ora permanentemente Impaurita.', updatedPlayer: evolvedPlayer ?? undefined };
    } else {
        // To get the updated player state after payment even on failure, we refetch.
        const finalPlayerState = await getPlayerProfileData(trainerName);
        return { success: false, message: 'Il rito è fallito. Il resto è andato perduto.', updatedPlayer: finalPlayerState ?? undefined };
    }
}


interface SorcererTentPageProps {
  onNavigate: (view: View, data?: any) => void;
  trainerName: string;
  menuPlayerData: Fighter | null;
  isMaster: boolean;
  onPlayerDataChange: (newPlayerData: Fighter) => void;
}

export const SorcererTentPage = ({ onNavigate, trainerName, menuPlayerData, isMaster, onPlayerDataChange }: SorcererTentPageProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const player = menuPlayerData;

    const requiredRemainId = player?.archetype === 'Physical' ? 'guscio_di_tartaruga' : player?.archetype === 'Special' ? 'piuma' : 'dente';
    const requiredRemain = ALL_CONSUMABLES.find(item => item.id === requiredRemainId);
    const hasRequiredRemain = player?.inventory?.[requiredRemainId]?.quantity ?? 0 > 0;
    const canAffordMaster = (player?.money ?? 0) >= 1000 && hasRequiredRemain;
    const canAffordNormal = (player?.money ?? 0) >= 1000;

    const handleAction = () => {
        startTransition(async () => {
            const result = isMaster
                ? await performForcedEvolution(trainerName, requiredRemainId)
                : await performStatReroll(trainerName);
            
            toast({
                title: result.success ? "Successo!" : "Fallimento!",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });

            if (result.updatedPlayer) {
                onPlayerDataChange(result.updatedPlayer);
            }
        });
    };

    if (!player) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    const title = isMaster ? "Tenda del Maestro Stregone" : "Tenda dello Stregone";
    const Icon = isMaster ? Sparkles : Wand2;
    const description = isMaster
        ? `Un rito pericoloso. Offri 1000 monete e un ${requiredRemain?.name || 'Resto'} per forzare un'evoluzione. C'è una probabilità del 70% di successo, ma la tua creatura diventerà permanentemente "Impaurita".`
        : "Un rito imprevedibile. Per 1000 monete, le statistiche base della tua creatura verranno completamente rimescolate. Il totale rimarrà lo stesso, ma la distribuzione cambierà.";
    const buttonText = isMaster ? "Tenta il Rito dell'Evoluzione" : "Rimescola Statistiche";
    const isDisabled = isPending || (isMaster ? !canAffordMaster : !canAffordNormal);

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center p-4 text-foreground">
            <button onClick={() => onNavigate('arcane_path')} className="absolute top-6 left-6 z-10 h-10 w-10 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
                <ArrowLeft className="h-6 w-6" />
            </button>

            <main className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Creature Card */}
                <Card className="bg-card/70 backdrop-blur-sm">
                     <CardHeader className="items-center pb-4">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary bg-background/10 mb-4">
                           <Image
                               src={player.spriteUrl}
                               alt={player.name}
                               width={160}
                               height={160}
                               className="w-full h-full object-cover"
                               unoptimized
                           />
                       </div>
                       <CardTitle className="text-3xl text-primary">{player.name}</CardTitle>
                       <div className="flex items-center justify-center text-sm mt-1 text-accent">
                           <Dna className="w-4 h-4 mr-1.5" />
                           Tipo: {player.creatureType} / Archetipo: {player.archetype}
                       </div>
                    </CardHeader>
                     {!isMaster && (
                        <CardContent>
                           <div className="flex items-center text-lg"><Heart className="w-5 h-5 mr-2 text-red-500" /> Salute <span className="ml-auto font-semibold">{player.currentHealth} / {player.maxHealth}</span></div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-base mt-2">
                               <div>Attacco: <span className="font-semibold float-right">{player.attackStat}</span></div>
                               <div>Difesa: <span className="font-semibold float-right">{player.defenseStat}</span></div>
                               <div>Att. Sp.: <span className="font-semibold float-right">{player.specialAttackStat}</span></div>
                               <div>Dif. Sp.: <span className="font-semibold float-right">{player.specialDefenseStat}</span></div>
                               <div>Velocità: <span className="font-semibold float-right">{player.speedStat}</span></div>
                               <div>Fortuna: <span className="font-semibold float-right">{player.luckStat}</span></div>
                           </div>
                        </CardContent>
                    )}
                </Card>

                {/* Ritual Card */}
                <Card className="bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl gap-3 text-accent">
                            <Icon className="h-8 w-8" />
                            {title}
                        </CardTitle>
                        <CardDescription className="pt-2 text-base">
                            {description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between text-lg font-bold p-3 bg-background/50 rounded-md">
                            <span>Costo:</span>
                            <div className="flex items-center gap-2 text-yellow-400">
                                <Coins className="h-6 w-6" />
                                1000
                            </div>
                        </div>
                         {isMaster && (
                            <div className="flex items-center justify-between text-lg font-bold p-3 bg-background/50 rounded-md mt-2">
                                <span>Resto Richiesto:</span>
                                <Badge variant={hasRequiredRemain ? 'default' : 'destructive'}>{requiredRemain?.name}</Badge>
                            </div>
                        )}
                        <Button size="lg" className="w-full mt-6 h-14 text-lg transition-transform duration-75 ease-in-out active:scale-95" disabled={isDisabled} onClick={handleAction}>
                            {isPending ? <Loader2 className="animate-spin" /> : buttonText}
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};
