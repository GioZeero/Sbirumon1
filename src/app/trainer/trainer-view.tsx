

'use client';

import React, { useState, useEffect } from 'react';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, UserCircle, Repeat, Trophy, Skull, Crown, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLeaderboard } from '@/lib/fighter-repository';
import type { LeaderboardEntry } from '@/types/leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface TrainerViewProps {
    player: Fighter | null;
    onNavigate: (view: any) => void;
    onResetProfile: () => void;
    onRequestFullscreen: () => void;
    previousView: any;
}

const ranks = [
  { name: 'Non classificato', threshold: 0, color: 'text-gray-400' },
  { name: 'Bronzo', threshold: 1, color: 'text-orange-400' },
  { name: 'Argento', threshold: 250, color: 'text-gray-300' },
  { name: 'Oro', threshold: 500, color: 'text-yellow-400' },
  { name: 'Rubino', threshold: 1000, color: 'text-red-500' },
  { name: 'Smeraldo', threshold: 2000, color: 'text-green-400' },
  { name: 'Diamante', threshold: 5000, color: 'text-cyan-400' },
  { name: 'Maestro', threshold: 10000, color: 'text-purple-400' },
];

function getRankInfo(points: number) {
  let currentRankIndex = 0;
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (points >= ranks[i].threshold) {
      currentRankIndex = i;
      break;
    }
  }

  const currentRank = ranks[currentRankIndex];
  const nextRank = ranks[currentRankIndex + 1];

  if (!nextRank) { // If at max rank
    return {
      rank: currentRank,
      progress: 100,
      pointsForNextRank: currentRank.threshold,
      currentRankMinPoints: currentRank.threshold,
    };
  }
  
  const pointsInCurrentRank = points - currentRank.threshold;
  const pointsNeededForNextRank = nextRank.threshold - currentRank.threshold;
  const progress = pointsNeededForNextRank > 0 ? (pointsInCurrentRank / pointsNeededForNextRank) * 100 : 100;

  return {
    rank: currentRank,
    progress: Math.min(progress, 100),
    pointsForNextRank: nextRank.threshold,
    currentRankMinPoints: currentRank.threshold,
  };
}

const rankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-foreground';
};

const TrainerView: React.FC<TrainerViewProps> = ({ player, onNavigate, onResetProfile, onRequestFullscreen, previousView }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLeaderboardLoading(true);
            try {
                const data = await getLeaderboard();
                setLeaderboard(data.slice(0, 5)); // Get top 5
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
            } finally {
                setIsLeaderboardLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (!player) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-foreground">
                <p>Errore nel caricamento dei dati dell'allenatore.</p>
                <Button variant="outline" size="icon" className="mt-4" onClick={() => onNavigate('main')}>
                  <ArrowLeft />
                </Button>
            </div>
        );
    }

    const rankInfo = getRankInfo(player.trainerRankPoints || 0);

    return (
        <div className="min-h-screen flex flex-col items-center text-foreground relative">
            <div className="w-full relative p-6">
                <Button variant="ghost" size="icon" className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20" onClick={() => onNavigate('main')}>
                    <ArrowLeft className="h-7 w-7" />
                </Button>
                <Button variant="ghost" size="icon" className="absolute top-6 right-6 z-10" onClick={onRequestFullscreen}>
                    <Maximize className="h-6 w-6" />
                </Button>
                <header className="w-full max-w-4xl pt-12 sm:pt-0">
                    
                </header>
            </div>

            <main className="w-full max-w-lg p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl text-accent">Rango e Carriera</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                           <p className={cn("text-3xl font-bold", rankInfo.rank.color)}>{rankInfo.rank.name}</p>
                           <p className="text-2xl font-bold">{player.trainerRankPoints || 0} <span className="text-base text-muted-foreground">Punti</span></p>
                           {rankInfo.rank.name !== 'Maestro' && (
                               <p className="text-sm text-muted-foreground">Prossimo rango a {rankInfo.pointsForNextRank} punti</p>
                           )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t">
                            <div>
                                <p className="text-2xl font-bold">{player.attemptsRemaining ?? 50}</p>
                                <p className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-1"><Repeat className="w-3 h-3"/> Tentativi</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{player.highestGymBeaten || 0}</p>
                                <p className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-1"><Trophy className="w-3 h-3"/> Palestre</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{player.suicideCount || 0}</p>
                                <p className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-1"><Skull className="w-3 h-3"/> Sacrifici</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-accent flex items-center"><Crown className="mr-2 h-5 w-5 text-yellow-400" /> Classifica Top 5</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLeaderboardLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {leaderboard.map((entry, index) => (
                                <li key={entry.trainerName} className="flex items-center justify-between p-2 bg-card/50 rounded-md text-sm">
                                    <div className="flex items-center">
                                        <span className={cn("font-bold w-6 text-center", rankColor(index + 1))}>
                                            {index + 1}
                                        </span>
                                        <span className="ml-3">{entry.trainerName}</span>
                                    </div>
                                    <Badge variant="secondary" className="font-semibold">
                                        {entry.rankPoints} PTS
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                  </CardContent>
                </Card>

                <div className="mt-8 pt-4 border-t border-dashed border-destructive/50">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" className="w-full max-w-sm mx-auto flex items-center">
                          <Repeat className="w-4 h-4 mr-2" />
                          Resetta Profilo
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Questa azione non può essere annullata. Questo eliminerà in modo permanente tutti i tuoi progressi, inclusi Sbirumon, oggetti e medaglie.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={onResetProfile}>
                          Sì, Resetta il mio Profilo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
            </main>
        </div>
    );
};

export default TrainerView;

    
