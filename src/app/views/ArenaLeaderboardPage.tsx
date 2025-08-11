

'use client';

import React, { useState, useEffect } from 'react';
import type { LeaderboardEntry } from '@/types/leaderboard';
import { getLeaderboard } from '@/lib/fighter-repository';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronLeftCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { View } from './types';

interface ArenaLeaderboardPageProps {
  onNavigate: (view: View) => void;
}

export const ArenaLeaderboardPage = ({ onNavigate }: ArenaLeaderboardPageProps) => {
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

    const rankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-gray-300';
        if (rank === 3) return 'text-orange-400';
        return 'text-foreground';
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center pb-24 text-foreground">
            <Button variant="ghost" size="icon" className="absolute top-6 left-6 z-10 h-16 w-16 rounded-full hover:bg-background/20" onClick={() => onNavigate('main')}>
                <ChevronLeftCircle className="h-16 w-16" strokeWidth={3} />
            </Button>
            <main className="w-full max-w-lg p-4">
                <header className="mb-8 mt-12 sm:mt-0">
                    
                    <p className="text-muted-foreground mt-2 text-lg text-center">I migliori allenatori di Sbirumon</p>
                </header>
                <Card>
                    <CardContent className="p-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            </div>
                        ) : (
                            <ScrollArea className="h-[60vh]">
                                <ul className="space-y-3">
                                    {leaderboard.map((entry, index) => (
                                        <li key={entry.trainerName} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                                            <div className="flex items-center">
                                                <span className={cn("text-xl font-bold w-8 text-center", rankColor(index + 1))}>
                                                    {index + 1}
                                                </span>
                                                <span className="text-lg ml-4">{entry.trainerName}</span>
                                            </div>
                                            <Badge variant="secondary" className="text-lg">
                                                {entry.rankPoints} PTS
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

    
