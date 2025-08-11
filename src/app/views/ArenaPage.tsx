

'use client';

import React from 'react';
import Image from 'next/image';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Swords, ClipboardList, ChevronLeftCircle, Star } from 'lucide-react';
import type { View } from './types';

interface ArenaPageProps {
  navigateTo: (view: View) => void;
  handleStartArenaBattle: () => void;
  isInitializing: boolean;
  menuPlayerData: Fighter | null;
  showArenaDisclaimer: boolean;
  setShowArenaDisclaimer: (show: boolean) => void;
  handleAcceptArenaDisclaimer: () => void;
  showNoOpponentFoundDialog: boolean;
  setShowNoOpponentFoundDialog: (show: boolean) => void;
}

export const ArenaPage = ({
  navigateTo,
  handleStartArenaBattle,
  isInitializing,
  menuPlayerData,
  showArenaDisclaimer,
  setShowArenaDisclaimer,
  handleAcceptArenaDisclaimer,
  showNoOpponentFoundDialog,
  setShowNoOpponentFoundDialog
}: ArenaPageProps) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 text-foreground overflow-hidden">
        <Button variant="ghost" size="icon" className="absolute top-6 left-6 z-20 h-14 w-14 rounded-full hover:bg-background/20" onClick={() => navigateTo('main')}>
            <ChevronLeftCircle className="h-12 w-12" strokeWidth={3} />
        </Button>

        <main className="flex w-full max-w-lg flex-col items-center justify-center space-y-8">
            <header className="w-full">
                
            </header>

            {menuPlayerData && (
                <Card className="bg-card/70 backdrop-blur-sm border-border/30 w-72">
                    <CardContent className="flex flex-col items-center p-6">
                        <div className="relative w-40 h-40 rounded-full border-4 border-primary/50 bg-background/50 mb-4">
                          <Image
                            src={menuPlayerData.spriteUrl}
                            alt={menuPlayerData.name}
                            width={160}
                            height={160}
                            className="w-full h-full object-contain"
                            unoptimized
                          />
                        </div>
                         <CardTitle className="text-center text-primary text-2xl">{menuPlayerData.name}</CardTitle>
                         <Badge variant="secondary" className="mt-2">
                           <Star className="w-3 h-3 mr-1"/>
                           Livello: {menuPlayerData.level}
                        </Badge>
                    </CardContent>
                </Card>
            )}

            <div className="w-full max-w-sm mx-auto space-y-3">
                 <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={handleStartArenaBattle} disabled={isInitializing || !menuPlayerData}>
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-red-500/20 p-3">{isInitializing ? <Loader2 className="h-6 w-6 animate-spin"/> : <Swords className="h-6 w-6 text-red-400" />}</div>
                        <div>
                            <p className="text-base font-bold">Cerca Nemico Online</p>
                            <p className="text-sm text-muted-foreground">Combatti contro altri giocatori</p>
                        </div>
                    </div>
                </Button>
                <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => navigateTo('arena_leaderboard')}>
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-blue-500/20 p-3"><ClipboardList className="h-6 w-6 text-blue-400" /></div>
                        <div>
                            <p className="text-base font-bold">Classifica</p>
                            <p className="text-sm text-muted-foreground">Visualizza i migliori allenatori</p>
                        </div>
                    </div>
                </Button>
            </div>
        </main>

        <Dialog open={showArenaDisclaimer} onOpenChange={setShowArenaDisclaimer}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Benvenuto nell'Arena!</DialogTitle>
                    <DialogDescription>
                        Entrando nell'Arena, accetti che la tua creatura possa essere sfidata da altri giocatori, anche quando non sei online. Se la tua creatura viene sconfitta, dovrai iniziare con un nuovo. Vuoi procedere?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setShowArenaDisclaimer(false)}>Annulla</Button>
                    <Button variant="destructive" onClick={handleAcceptArenaDisclaimer}>Accetta e Combatti</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog open={showNoOpponentFoundDialog} onOpenChange={setShowNoOpponentFoundDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nessun Sfidante Trovato</DialogTitle>
                    <DialogDescription>
                        Al momento non ci sono altri allenatori disponibili per combattere nell'Arena. Riprova più tardi!
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => setShowNoOpponentFoundDialog(false)}>OK</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
};
