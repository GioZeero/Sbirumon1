

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
import { ArrowLeft, UserCircle, Repeat, Trophy, Skull, Crown, Maximize, ClipboardList, Medal, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLeaderboard } from '@/lib/fighter-repository';
import type { LeaderboardEntry } from '@/types/leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { View } from '../views/types';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TrainerViewProps {
    player: Fighter | null;
    onNavigate: (view: View) => void;
    onResetProfile: () => void;
    onRequestFullscreen: () => void;
    previousView: any;
    hasUnreadMessages: boolean;
}

const rankTiers = [
    { name: 'Bronzo', points: 0, icon: Medal, color: 'text-orange-400' },
    { name: 'Argento', points: 10, icon: Medal, color: 'text-slate-400' },
    { name: 'Oro', points: 25, icon: Trophy, color: 'text-yellow-500' },
    { name: 'Platino', points: 50, icon: Crown, color: 'text-teal-400' },
    { name: 'Diamante', points: 100, icon: Crown, color: 'text-cyan-400' }
];

const getRankInfo = (points: number) => {
    let currentRank = rankTiers[0];
    for (let i = rankTiers.length - 1; i >= 0; i--) {
        if (points >= rankTiers[i].points) {
            currentRank = rankTiers[i];
            break;
        }
    }
    const nextRankIndex = rankTiers.findIndex(rank => rank.points > currentRank.points);
    const nextRank = nextRankIndex !== -1 ? rankTiers[nextRankIndex] : null;

    const progress = nextRank 
      ? ((points - currentRank.points) / (nextRank.points - currentRank.points)) * 100
      : 100;
      
    return { ...currentRank, nextRank, progress };
};


const TrainerView: React.FC<TrainerViewProps> = ({ player, onNavigate, onResetProfile, onRequestFullscreen, hasUnreadMessages }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            const data = await getLeaderboard();
            setLeaderboard(data);
            setIsLoading(false);
        };
        fetchLeaderboard();
    }, []);

    if (!player) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-foreground">
                <p>Errore nel caricamento dei dati dell'allenatore.</p>
                <button onClick={() => onNavigate('main')} className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
                  <ArrowLeft className="h-full w-full p-2" strokeWidth={3} />
                </button>
            </div>
        );
    }
    
    const rankInfo = getRankInfo(player.trainerRankPoints || 0);
    const RankIcon = rankInfo.icon;
    
    return (
        <div className="min-h-screen flex flex-col items-center text-foreground relative">
            <div className="w-full relative p-6">
                <button onClick={() => onNavigate('main')} className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
                    <ArrowLeft className="h-full w-full p-2" strokeWidth={3} />
                </button>
                <Button variant="ghost" size="icon" className="absolute top-6 right-6 z-10" onClick={onRequestFullscreen}>
                    <Maximize className="h-6 w-6" />
                </Button>
                <header className="w-full max-w-4xl pt-12 sm:pt-0">
                    <div className="text-center">
                      <h1 className="text-4xl md:text-5xl font-headline text-primary">{player.trainerName}</h1>
                       <div className={cn("flex items-center justify-center gap-2 mt-2 text-xl font-semibold", rankInfo.color)}>
                          <RankIcon className="h-6 w-6" />
                          <span>Rango {rankInfo.name}</span>
                       </div>
                    </div>
                </header>
            </div>

            <main className="w-full max-w-lg p-6 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className={cn("text-lg", rankInfo.color)}>Progresso Rango</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Progress value={rankInfo.progress} className="h-2.5" />
                        <div className="text-sm text-muted-foreground flex justify-between">
                            <span>{player.trainerRankPoints || 0} PTS</span>
                            {rankInfo.nextRank && <span>Prossimo Rango: {rankInfo.nextRank.points} PTS</span>}
                        </div>
                    </CardContent>
                </Card>

                 <Button variant="outline" className="w-full h-20 relative" onClick={() => onNavigate('messages_hub')}>
                    {hasUnreadMessages && <span className="absolute top-2 right-2 flex h-3 w-3 rounded-full bg-destructive" />}
                    <div className="flex items-center gap-4">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-xl font-bold">Messaggi</p>
                            <p className="text-sm text-muted-foreground">Chatta con altri allenatori</p>
                        </div>
                    </div>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Classifica</CardTitle>
                        <CardDescription>I migliori allenatori</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-48">
                             {isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {leaderboard.map((entry, index) => (
                                        <li key={entry.trainerName} className="flex items-center justify-between p-2 bg-card/50 rounded-lg">
                                            <div className="flex items-center">
                                                <span className={cn("text-lg font-bold w-6 text-center", index < 3 ? rankTiers[3-index]?.color : 'text-foreground')}>
                                                    {index + 1}
                                                </span>
                                                <span className="text-md ml-3">{entry.trainerName}</span>
                                            </div>
                                            <Badge variant="secondary" className="text-md">
                                                {entry.rankPoints} PTS
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ScrollArea>
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

