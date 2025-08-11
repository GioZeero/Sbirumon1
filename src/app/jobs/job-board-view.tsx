
'use client';

import React, { useState, useEffect, useTransition, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, type LucideIcon, Coins, CheckCircle, XCircle, HelpCircle, Book, Skull, Wand2, Store, Users } from 'lucide-react';
import type { Fighter } from '@/types/battle';
import type { Quest, QuestId } from '@/types/quests';
import { getPlayerProfileData } from '@/lib/fighter-repository';
import { completeQuest } from '@/lib/quests';

interface JobBoardPageProps {
  onNavigate: (view: any) => void;
  trainerName: string;
}

const iconMap: Record<string, LucideIcon> = {
    Book,
    Skull,
    Wand2,
    Store,
    Users,
    HelpCircle,
};

export default function JobBoardPage({ onNavigate, trainerName }: JobBoardPageProps) {
  const [player, setPlayer] = useState<Fighter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, startTransition] = useTransition();

  const fetchPlayer = React.useCallback(async () => {
    setIsLoading(true);
    const playerData = await getPlayerProfileData(trainerName);
    setPlayer(playerData);
    setIsLoading(false);
  }, [trainerName]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  const handleCompleteQuest = async (questId: QuestId) => {
    startTransition(async () => {
      const result = await completeQuest(trainerName, questId);
      if (result.success && result.updatedPlayer) {
        setPlayer(result.updatedPlayer);
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

  if (isLoading || !player) {
    return <div className="min-h-screen flex items-center justify-center bg-transparent"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  const quests = Object.values(player.activeQuests || {});
  
  // Filter quests based on visibility conditions
  const visibleQuests = quests.filter(quest => {
      if (!quest) return false; // Safety check for undefined quests
      if(quest.id === 'sorcerer_quest' && !player.sorcererTentVisible) return false;
      if(quest.id === 'master_sorcerer_quest' && !player.masterSorcererTentVisible) return false;
      return true;
  });

  return (
    <div className="min-h-screen flex flex-col items-center text-foreground pb-24 relative">
      <Button variant="ghost" size="icon" className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20" onClick={() => onNavigate('merchant_area')}>
          <ArrowLeft className="h-7 w-7" />
      </Button>
      <main className="w-full max-w-2xl p-4 sm:p-6 md:p-8">
        <header className="w-full mb-8 mt-12 sm:mt-0">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-headline text-primary">Bacheca dei Lavori</h1>
            <p className="text-muted-foreground mt-2">Completa le missioni per ottenere ricompense.</p>
          </div>
        </header>
        <Card>
            <CardHeader>
                <CardTitle>Incarichi dagli Abitanti</CardTitle>
                <CardDescription>Aiuta gli abitanti della città per guadagnare monete e reputazione.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {visibleQuests.map(quest => {
                    if (quest.isCompleted) return null; // Don't show completed quests

                    const canComplete = checkCanComplete(quest);
                    const isQuestCompletableManually = ['gran_maestro_quest', 'master_sorcerer_quest', 'sorcerer_quest', 'shopkeeper_quest', 'nerd_boss_quest'].includes(quest.id);
                    const QuestIcon = iconMap[quest.iconName] || HelpCircle;

                    return (
                        <Card key={quest.id} className="bg-card/70 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                                <QuestIcon className="w-7 h-7 text-primary"/>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg text-accent">{quest.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{quest.description}</p>
                                <div className="mt-2 flex items-center text-yellow-400 font-semibold">
                                    <Coins className="w-4 h-4 mr-1.5"/>
                                    <span>{quest.reward}</span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                                {isQuestCompletableManually && (
                                     <Button 
                                        onClick={() => handleCompleteQuest(quest.id)} 
                                        disabled={!canComplete || isCompleting}
                                        className="w-full sm:w-auto"
                                    >
                                        {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Completa'}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
