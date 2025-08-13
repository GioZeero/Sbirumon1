
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Repeat, Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/leaderboard';
import { getLeaderboard } from '@/lib/fighter-repository';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface GameOverPageProps {
  score: number;
  trainerName: string;
  onResetProfile: () => void;
}

export const GameOverPage = ({ score, trainerName, onResetProfile }: GameOverPageProps) => {
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

  const rank = leaderboard.findIndex(entry => entry.trainerName === trainerName) + 1;

  const rankColor = (r: number) => {
    if (r === 1) return 'text-yellow-400';
    if (r === 2) return 'text-slate-400';
    if (r === 3) return 'text-orange-400';
    return 'text-foreground';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-foreground bg-black/90">
      <div className="w-full max-w-md text-center">
        <h1 className="text-7xl font-bold text-destructive animate-pulse">GAME OVER</h1>
        <p className="text-xl text-muted-foreground mt-2">Hai esaurito i tentativi.</p>

        <Card className="my-8 bg-card/80 backdrop-blur-sm border-destructive/50">
          <CardHeader>
            <CardTitle className="text-2xl">Il Tuo Punteggio Finale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-5xl font-bold text-accent">{score}</p>
            {rank > 0 && <p className="text-xl font-semibold">Posizione in classifica: <span className={cn(rankColor(rank))}>{rank}°</span></p>}
          </CardContent>
        </Card>

        <Card className="text-left bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2"><Trophy/> Classifica</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <ScrollArea className="h-48">
                <ul className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <li key={entry.trainerName} className={cn("flex items-center justify-between p-2 rounded-lg", entry.trainerName === trainerName ? 'bg-primary/20' : 'bg-card/50')}>
                      <div className="flex items-center">
                        <span className={cn("text-lg font-bold w-6 text-center", rankColor(index + 1))}>{index + 1}</span>
                        <span className="text-md ml-3">{entry.trainerName}</span>
                      </div>
                      <Badge variant="secondary" className="text-md">{entry.rankPoints} PTS</Badge>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Button size="lg" className="mt-8 w-full text-lg py-7" variant="destructive" onClick={onResetProfile}>
          <Repeat className="mr-2"/>
          Resetta Profilo
        </Button>
      </div>
    </div>
  );
};
