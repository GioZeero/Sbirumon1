
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { ArrowLeft, UserCircle, Repeat, Trophy, Skull, Crown, Maximize, ClipboardList, Medal, MessageSquare, Loader2, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLeaderboard } from '@/lib/fighter-repository';
import type { LeaderboardEntry } from '@/types/leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { View } from '../views/types';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface TrainerViewProps {
    player: Fighter | null;
    onNavigate: (view: View) => void;
    onResetProfile: () => void;
    onRequestFullscreen: () => void;
    previousView: any;
    hasUnreadMessages: boolean;
}

const rankTiers = [
    { name: 'Bronzo', points: 0, icon: Medal, color: 'text-orange-400', shadowColor: '#fb923c' },
    { name: 'Argento', points: 10, icon: Medal, color: 'text-slate-400', shadowColor: '#94a3b8' },
    { name: 'Oro', points: 25, icon: Trophy, color: 'text-yellow-500', shadowColor: '#eab308' },
    { name: 'Platino', points: 50, icon: Crown, color: 'text-teal-400', shadowColor: '#2dd4bf' },
    { name: 'Diamante', points: 100, icon: Crown, color: 'text-cyan-400', shadowColor: '#22d3ee' }
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
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onNavigate('main')} 
                    className="absolute top-6 left-6 z-10"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </div>
        );
    }
    
    const rankInfo = getRankInfo(player.trainerRankPoints || 0);
    const RankIcon = rankInfo.icon;
    const playerRank = leaderboard.findIndex(entry => entry.trainerName === player.trainerName) + 1;
    
    return (
        <div className="min-h-screen flex flex-col items-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-10"
                    style={{ backgroundColor: rankInfo.shadowColor }}
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ 
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-40 h-40 rounded-full opacity-10"
                    style={{ backgroundColor: rankInfo.shadowColor }}
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        rotate: [360, 180, 0]
                    }}
                    transition={{ 
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>

            {/* Header */}
            <div className="w-full relative p-6 z-10">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onNavigate('main')} 
                    className="absolute top-6 left-6"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-6 right-6" 
                    onClick={onRequestFullscreen}
                >
                    <Maximize className="h-6 w-6" />
                </Button>
            </div>

            {/* Profile Section */}
            <motion.div 
                className="flex flex-col items-center mt-4 mb-8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
            >
                <h1 className="text-3xl md:text-4xl font-headline text-primary mb-2">{player.trainerName}</h1>
                <motion.div 
                    className={cn("flex items-center gap-2 text-lg font-semibold", rankInfo.color)}
                    whileHover={{ scale: 1.05 }}
                >
                    <RankIcon className="h-6 w-6" />
                    <span>Rango {rankInfo.name}</span>
                    <Sparkles className="h-5 w-5" />
                </motion.div>
            </motion.div>

            {/* Main Content */}
            <main className="w-full max-w-lg px-6 space-y-4 pb-6">
                {/* Progress Card */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <Card className="bg-card/70 backdrop-blur-sm border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className={cn("text-lg", rankInfo.color)}>Progresso Rango</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="relative">
                                <Progress value={rankInfo.progress} className="h-3" />
                                <motion.div 
                                    className="absolute top-0 h-3 rounded-full opacity-30"
                                    style={{ 
                                        width: `${rankInfo.progress}%`,
                                        backgroundColor: rankInfo.shadowColor
                                    }}
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                                <span>{player.trainerRankPoints || 0} PTS</span>
                                {rankInfo.nextRank && <span>Prossimo: {rankInfo.nextRank.points} PTS</span>}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Messages Button */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button 
                        variant="outline" 
                        className="w-full h-20 relative bg-card/70 backdrop-blur-sm border-border/50" 
                        onClick={() => onNavigate('messages_hub')}
                    >
                        {hasUnreadMessages && (
                            <motion.span 
                                className="absolute top-2 right-2 flex h-3 w-3 rounded-full bg-destructive"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        )}
                        <div className="flex items-center gap-4">
                            <MessageSquare className="h-8 w-8 text-blue-400" />
                            <div className="text-left">
                                <p className="text-xl font-bold">Messaggi</p>
                                <p className="text-sm text-muted-foreground">Chatta con altri allenatori</p>
                            </div>
                        </div>
                    </Button>
                </motion.div>

                {/* Leaderboard Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <Card className="bg-card/70 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Classifica
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-48">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        <ul className="space-y-2">
                                            {leaderboard.slice(0, 10).map((entry, index) => (
                                                <motion.li 
                                                    key={entry.trainerName}
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-lg transition-colors",
                                                        entry.trainerName === player.trainerName 
                                                            ? "bg-primary/10 border border-primary/30" 
                                                            : "bg-card/50 hover:bg-card/70"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-8 h-8">
                                                            {index < 3 ? (
                                                                <div>
                                                                    {index === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                                                                    {index === 1 && <Medal className="h-6 w-6 text-slate-400" />}
                                                                    {index === 2 && <Medal className="h-6 w-6 text-orange-400" />}
                                                                </div>
                                                            ) : (
                                                                <span className="text-lg font-bold text-muted-foreground">
                                                                    {index + 1}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={cn(
                                                            "text-md",
                                                            entry.trainerName === player.trainerName && "font-bold"
                                                        )}>
                                                            {entry.trainerName}
                                                            {entry.trainerName === player.trainerName && " (Tu)"}
                                                        </span>
                                                    </div>
                                                    <Badge 
                                                        variant={entry.trainerName === player.trainerName ? "default" : "secondary"} 
                                                        className="text-md"
                                                    >
                                                        {entry.rankPoints} PTS
                                                    </Badge>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </AnimatePresence>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </motion.div>
                
                {/* Reset Profile */}
                <motion.div 
                    className="mt-8 pt-4 border-t border-dashed border-destructive/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="destructive" 
                                className="w-full bg-card text-destructive hover:bg-destructive/10"
                            >
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
                                <AlertDialogAction onClick={onResetProfile} className="bg-destructive hover:bg-destructive/90">
                                    Sì, Resetta il mio Profilo
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </motion.div>
            </main>
        </div>
    );
};

export default TrainerView;

    
