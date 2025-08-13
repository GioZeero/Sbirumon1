

import type { FC } from 'react';
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { BattleWinner, BattleLogEntry, Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import CombatLog from './CombatLog';
import type { ConsumableItem } from '@/types/items';
import { Bone, Feather, Shield } from 'lucide-react';
import { Badge } from '../ui/badge';

interface BattleResultModalProps {
  winner: BattleWinner;
  onRematch: () => void;
  onGoToMenu: () => void;
  isOpen: boolean;
  logEntries: BattleLogEntry[];
  opponentFighter: Fighter | null;
  onAcceptCreature: (creature: Fighter) => void;
  isCovoBattle?: boolean;
  isLastCovoOpponent?: boolean;
  onNextCovoOpponent?: () => void;
  covoCityName?: string;
  isGymBattle?: boolean;
  isLastGymTrainer?: boolean;
  onNextGymTrainer?: () => void;
  gymName?: string;
  onAttackClick: (attackId: string) => void;
  lastDroppedItem?: ConsumableItem | null;
  isViandanteBattle?: boolean;
  isArenaBattle?: boolean;
}

const DroppedItemDisplay: FC<{ item: ConsumableItem }> = ({ item }) => {
    let Icon = Bone;
    if (item.iconName === 'Feather') Icon = Feather;
    if (item.iconName === 'Shield') Icon = Shield;

    return (
        <div className="mt-4 p-3 bg-card/50 rounded-lg flex items-center justify-center space-x-3">
            <p className="text-sm text-muted-foreground">Hai ottenuto:</p>
            <Badge variant="outline" className="text-base py-1 px-3">
                <Icon className="w-4 h-4 mr-2" />
                {item.name}
            </Badge>
        </div>
    );
};

const BattleResultModal: FC<BattleResultModalProps> = ({ 
  winner, 
  onRematch, 
  onGoToMenu, 
  isOpen, 
  logEntries, 
  opponentFighter,
  onAcceptCreature,
  isCovoBattle,
  isLastCovoOpponent,
  onNextCovoOpponent,
  covoCityName,
  isGymBattle,
  isLastGymTrainer,
  onNextGymTrainer,
  gymName,
  onAttackClick,
  lastDroppedItem,
  isViandanteBattle,
  isArenaBattle,
}) => {
  const [showLog, setShowLog] = useState(false);

  if (!isOpen || !winner) return null;

  let title = "";
  let description: React.ReactNode = "";
  let primaryButton: React.ReactNode | null = null;
  let secondaryButton: React.ReactNode | null = null;
  let tertiaryButton: React.ReactNode | null = null;
  let bottomContent: React.ReactNode | null = null;

  if (winner === 'player') {
    if (isViandanteBattle && opponentFighter) {
        title = `Hai sconfitto ${opponentFighter.name}!`;
        description = "Questa creatura unica è ammirata dalla tua forza. Vuoi accettarla come tuo nuovo Sbirumon?";
        primaryButton = <Button onClick={() => onAcceptCreature(opponentFighter)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white transition-transform duration-75 ease-in-out active:scale-95">Accetta in Dono</Button>;
        secondaryButton = <Button onClick={onGoToMenu} variant="outline" className="w-full transition-transform duration-75 ease-in-out active:scale-95">Rifiuta e torna al Menu</Button>;
    } else if (isArenaBattle) {
        title = "Vittoria in Arena!";
        description = `Hai sconfitto ${opponentFighter?.trainerName || 'l\'avversario'}! Il suo Sbirumon è stato ritirato.`;
        primaryButton = <Button onClick={onGoToMenu} className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-transform duration-75 ease-in-out active:scale-95">Torna all'Arena</Button>;
    } else if (isGymBattle) {
        if (isLastGymTrainer) {
            title = `Hai conquistato la ${gymName}!`;
            description = "Hai sconfitto tutti gli allenatori!";
            primaryButton = <Button onClick={onGoToMenu} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-transform duration-75 ease-in-out active:scale-95">Torna al Menu Palestre</Button>;
        } else {
            title = "Vittoria!";
            description = "Hai sconfitto questo allenatore! Preparati per il prossimo.";
            primaryButton = <Button onClick={onNextGymTrainer} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-transform duration-75 ease-in-out active:scale-95">Prossimo Allenatore</Button>;
        }
    } else if (isCovoBattle) {
      if (isLastCovoOpponent) {
        title = "Vittoria Completa!";
        description = `Hai battuto il covo dei nerd di ${covoCityName}!`;
        primaryButton = <Button onClick={onGoToMenu} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-transform duration-75 ease-in-out active:scale-95">Torna al Menu</Button>;
      } else {
        title = "Vittoria!";
        description = "Hai sconfitto questo avversario!";
        primaryButton = <Button onClick={onNextCovoOpponent} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-transform duration-75 ease-in-out active:scale-95">Prossimo Avversario</Button>;
        secondaryButton = <Button onClick={onGoToMenu} variant="outline" className="w-full transition-transform duration-75 ease-in-out active:scale-95">Torna al Menu</Button>;
      }
    } else { // Prairie win
      title = "Vittoria!";
      description = "Hai sconfitto il tuo avversario!";
      primaryButton = <Button onClick={onRematch} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-transform duration-75 ease-in-out active:scale-95">Affronta nuovo selvaggio</Button>;
      secondaryButton = <Button onClick={onGoToMenu} variant="outline" className="w-full transition-transform duration-75 ease-in-out active:scale-95">Torna al Menu</Button>;
    }
  } else if (winner === 'opponent') {
    title = "Sconfitta!";
    description = "Il tuo Sbirulino è stato sconfitto. È ora di sceglierne uno nuovo per continuare l'avventura.";
    primaryButton = <Button onClick={onGoToMenu} variant="destructive" className="w-full transition-transform duration-75 ease-in-out active:scale-95">Scegli nuovo Sbirulino</Button>;
    if (lastDroppedItem) {
        bottomContent = <DroppedItemDisplay item={lastDroppedItem} />;
    }
  } else if (winner === 'draw') {
    title = "Sconfitta!";
    description = "La battaglia è finita in stallo, ma la tua creatura non è riuscita a prevalere. È ora di sceglierne una nuova.";
    primaryButton = <Button onClick={onGoToMenu} className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-transform duration-75 ease-in-out active:scale-95">Scegli nuovo Sbirulino</Button>;
  } else if (typeof winner === 'object' && winner.type === 'player_captured_opponent') {
    title = "Cattura Riuscita!";
    description = `Hai catturato ${winner.opponentName}! Ora è il tuo Sbirulino.`;
    primaryButton = <Button onClick={onRematch} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-transform duration-75 ease-in-out active:scale-95">Nuovo Incontro</Button>;
    secondaryButton = <Button onClick={onGoToMenu} variant="outline" className="w-full transition-transform duration-75 ease-in-out active:scale-95">Torna al Menu</Button>;
  }


  if (showLog) {
    return (
      <AlertDialog open={isOpen}>
        <AlertDialogContent className="bg-background/75 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-headline text-center text-primary">
              Log Combattimento
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="max-h-[60vh] overflow-y-auto p-1 text-sm">
            <CombatLog logEntries={logEntries} isModalView onAttackClick={onAttackClick} />
          </div>
          <AlertDialogFooter className="pt-4">
            <Button onClick={() => setShowLog(false)} variant="outline" className="w-full transition-transform duration-75 ease-in-out active:scale-95">
              Indietro
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="bg-background/75 backdrop-blur-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-3xl font-headline text-center text-primary">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg">
            {description}
          </AlertDialogDescription>
           {bottomContent}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 pt-4">
          {primaryButton}
          {secondaryButton}
          <Button onClick={() => setShowLog(true)} variant="secondary" className="w-full mt-2 text-sm transition-transform duration-75 ease-in-out active:scale-95">
            Vedi Log
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BattleResultModal;
