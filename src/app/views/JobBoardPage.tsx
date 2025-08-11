

'use client';

import React, { useState, useEffect, useTransition } from 'react';
import type { Fighter } from '@/types/battle';
import type { Quest, QuestId } from '@/types/quests';
import { completeQuest } from '@/lib/quests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, Coins, HelpCircle, Book, Skull, Wand2, Store, Users, ChevronLeftCircle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { View } from './types';
import type { LucideIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const iconMap: Record<string, LucideIcon> = {
    Book,
    Skull,
    Wand2,
    Store,
    Users,
    HelpCircle,
};

interface JobBoardPageProps {
  onNavigate: (view: View) => void;
  trainerName: string;
  menuPlayerData: Fighter | null;
}

export const JobBoardPage = ({ onNavigate, trainerName, menuPlayerData }: JobBoardPageProps) => {
  const [player, setPlayer] = useState<Fighter | null>(menuPlayerData);
  const [isCompleting, startTransition] = useTransition();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  useEffect(() => {
    setPlayer(menuPlayerData);
  }, [menuPlayerData]);

  const handleCompleteQuest = async (questId: QuestId) => {
    startTransition(async () => {
      const result = await completeQuest(trainerName, questId);
      if (result.success && result.updatedPlayer) {
        setPlayer(result.updatedPlayer);
        setSelectedQuest(null); // Close the dialog on success
        // If the quest was the sorcerer's, navigate to creature selection
        if (questId === 'sorcerer_quest') {
            onNavigate('creature_selection');
        }
      } else {
        // Optionally show an error toast
      }
    });
  };

  const checkCanComplete = (quest: Quest): boolean => {
    if (!player) return false;
    switch (quest.id) {
      case 'gran_maestro_quest':
        const moveIsUnlocked = !!player.unlockedAttackIds?.includes(quest.requiredMoveId!);
        const moveIsEquipped = !!player.attacks?.some(attack => attack.id === quest.requiredMoveId!);
        return moveIsUnlocked && !moveIsEquipped;
      case 'master_sorcerer_quest':
        return !!player.inventory?.[quest.requiredRemainId!]?.quantity;
      case 'sorcerer_quest':
        const totalStats = player.attackStat + player.defenseStat + player.specialAttackStat + player.specialDefenseStat + player.speedStat + player.luckStat;
        return player.level === 5 && totalStats >= quest.requiredSacrificeTotalStats!;
      case 'shopkeeper_quest':
        return player.level >= quest.requiredLevel! && !!player.didNotUseConsumables;
      case 'nerd_boss_quest':
        const defeated = player.covoOpponentsDefeated;
        if (!defeated) return false;
        
        const requiredSmall = 5 * 3;
        const requiredMedium = 10 * 7;
        const requiredLarge = 20 * 13;

        const allCovesCompleted = defeated.small >= requiredSmall && defeated.medium >= requiredMedium && defeated.large >= requiredLarge;
        const noGymsBeaten = (player.highestGymBeaten ?? 0) === 0;

        return allCovesCompleted && noGymsBeaten;
      default:
        return false;
    }
  };

  if (!player) {
    return <div className="min-h-screen flex items-center justify-center bg-transparent"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  const quests = Object.values(player.activeQuests || {});
  
  // Filter quests based on visibility conditions
  const visibleQuests = quests.filter(quest => {
      if (!quest) return false; // Safety check for undefined quests
      if(quest.isCompleted) return false; // Don't show completed quests
      if(quest.id === 'sorcerer_quest' && !player.sorcererTentVisible) return false;
      if(quest.id === 'master_sorcerer_quest' && !player.masterSorcererTentVisible) return false;
      return true;
  });

  return (
    <div className="min-h-screen flex flex-col items-center text-foreground pb-24 relative">
      <Button variant="ghost" size="icon" className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20" onClick={() => onNavigate('main')}>
          <ChevronLeftCircle className="h-7 w-7" />
      </Button>
      <main className="w-full max-w-2xl p-4 sm:p-6 md:p-8">
        <header className="w-full mb-8 mt-12 sm:mt-0">
          <div className="text-center">
            
            <p className="text-muted-foreground mt-2">Completa le missioni per ottenere ricompense.</p>
          </div>
        </header>
        <Card>
            <CardHeader>
                <CardTitle>Incarichi dagli Abitanti</CardTitle>
                <CardDescription>Aiuta gli abitanti della città per guadagnare monete e reputazione.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {visibleQuests.map(quest => {
                    const QuestIcon = iconMap[quest.iconName] || HelpCircle;
                    return (
                        <Card key={quest.id} className="bg-card/70 p-3 flex items-center gap-4">
                           <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                               <QuestIcon className="w-6 h-6 text-primary"/>
                           </div>
                           <div className="flex-grow">
                               <h3 className="font-bold text-md text-accent">{quest.title}</h3>
                               <p className="text-xs text-muted-foreground">{quest.giver}</p>
                           </div>
                           <Button variant="outline" size="icon" onClick={() => setSelectedQuest(quest)}>
                               <Info className="w-4 h-4"/>
                           </Button>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>
      </main>
      
      {selectedQuest && (
        <Dialog open={!!selectedQuest} onOpenChange={(open) => !open && setSelectedQuest(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-primary text-2xl">{selectedQuest.title}</DialogTitle>
                    <DialogDescription className="text-sm pt-2 text-left text-muted-foreground">
                        {selectedQuest.description}
                    </DialogDescription>
                </DialogHeader>
                <Separator/>
                <div className="flex items-center justify-between text-lg">
                    <span className="font-semibold">Ricompensa:</span>
                    <div className="flex items-center text-yellow-400 font-bold">
                        <Coins className="w-5 h-5 mr-1.5"/>
                        <span>{selectedQuest.reward}</span>
                    </div>
                </div>
                <Separator/>
                <DialogFooter>
                    {['gran_maestro_quest', 'master_sorcerer_quest', 'sorcerer_quest', 'shopkeeper_quest', 'nerd_boss_quest'].includes(selectedQuest.id) && (
                         <Button 
                            onClick={() => handleCompleteQuest(selectedQuest.id)} 
                            disabled={!checkCanComplete(selectedQuest) || isCompleting}
                            className="w-full"
                        >
                            {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Completa'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
