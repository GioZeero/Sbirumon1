

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
import { ArrowLeft, UserCircle, Repeat, Trophy, Skull, Crown, Maximize, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLeaderboard } from '@/lib/fighter-repository';
import type { LeaderboardEntry } from '@/types/leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { View } from '../views/types';

interface TrainerViewProps {
    player: Fighter | null;
    onNavigate: (view: View) => void;
    onResetProfile: () => void;
    onRequestFullscreen: () => void;
    previousView: any;
}

const TrainerView: React.FC<TrainerViewProps> = ({ player, onNavigate, onResetProfile, onRequestFullscreen }) => {
    
    if (!player) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-foreground">
                <p>Errore nel caricamento dei dati dell'allenatore.</p>
                <Button variant="outline" size="icon" className="mt-4" onClick={() => onNavigate('main')}>
                  <ArrowLeft className="h-9 w-9" />
                </Button>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex flex-col items-center text-foreground relative">
            <div className="w-full relative p-6">
                <Button variant="ghost" size="icon" className="absolute top-6 left-6 z-10 h-12 w-12 rounded-full hover:bg-background/20" onClick={() => onNavigate('main')}>
                    <ArrowLeft className="h-9 w-9" />
                </Button>
                <Button variant="ghost" size="icon" className="absolute top-6 right-6 z-10" onClick={onRequestFullscreen}>
                    <Maximize className="h-6 w-6" />
                </Button>
                <header className="w-full max-w-4xl pt-12 sm:pt-0">
                    <div className="text-center">
                      <h1 className="text-4xl md:text-5xl font-headline text-primary">{player.trainerName}</h1>
                    </div>
                </header>
            </div>

            <main className="w-full max-w-lg p-6 space-y-6">
                 <Button variant="outline" className="w-full h-20" onClick={() => onNavigate('arena_leaderboard')}>
                    <div className="flex items-center gap-4">
                        <ClipboardList className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-xl font-bold">Classifica</p>
                            <p className="text-sm text-muted-foreground">Visualizza i migliori allenatori</p>
                        </div>
                    </div>
                </Button>

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
