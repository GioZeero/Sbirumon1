

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface WelcomePageProps {
  onWelcomeSubmit: () => void;
  inputName: string;
  setInputName: (name: string) => void;
  showDefeatedByModal: string | null;
  handleDefeatedByClose: () => void;
}

export const WelcomePage = ({ onWelcomeSubmit, inputName, setInputName, showDefeatedByModal, handleDefeatedByClose }: WelcomePageProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Dialog open={true} onOpenChange={() => {}}>
            <DialogContent className="max-w-md bg-card border-border text-foreground">
                <DialogHeader><DialogTitle className="text-primary text-center text-3xl sm:text-4xl font-display">Benvenuto</DialogTitle><DialogDescription className="text-center pt-2">Come ti chiami, allenatore?</DialogDescription></DialogHeader>
                <div className="mt-4 flex flex-col gap-4">
                    <Input placeholder="Inserisci il tuo nome" value={inputName} onChange={(e) => setInputName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onWelcomeSubmit(); }} autoFocus />
                    <Button onClick={onWelcomeSubmit} className="bg-accent hover:bg-accent/80 text-accent-foreground">Inizia l'Avventura</Button>
                </div>
            </DialogContent>
        </Dialog>
        {showDefeatedByModal && (
            <Dialog open={true} onOpenChange={() => handleDefeatedByClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sei Stato Sconfitto!</DialogTitle>
                        <DialogDescription>
                            La tua creatura è stata sconfitta nell'Arena da <span className="font-bold text-accent">{showDefeatedByModal}</span>.
                            È ora di iniziare con un nuovo compagno!
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => handleDefeatedByClose()}>Scegli una nuova creatura</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
    </div>
  );
};
