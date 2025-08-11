
'use client';

import type { FC } from 'react';
import React from 'react';
import type { Fighter, BattleWinner } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OpponentStatsDisplay from './OpponentStatsDisplay';
import PlayerStatsDisplay from './PlayerStatsDisplay';
import { Zap as ZapIcon } from 'lucide-react';

interface PlayerActionsHubProps {
  player: Fighter;
  opponent: Fighter | null; 
  onPlayerAttackIntent: () => void;
  isPlayerTurn: boolean;
  isLoading: boolean;
  isActionDisabled: boolean;
  showOpponentStatsBriefly: boolean;
  winner: BattleWinner;
  isPaused: boolean;
}

const PlayerActionsHub: FC<PlayerActionsHubProps> = ({
  player,
  opponent,
  onPlayerAttackIntent,
  isPlayerTurn,
  isLoading,
  isActionDisabled,
  showOpponentStatsBriefly,
  winner,
  isPaused,
}) => {
  const canTakeAction = isPlayerTurn && !isLoading && !isActionDisabled && !winner && !isPaused;
  const canAttack = player.attacks && player.attacks.length > 0;

  return (
    <div className="w-full h-full flex flex-col sm:flex-row gap-2 sm:gap-3 p-1">
      <div className="w-full sm:w-3/5 flex flex-col">
        <Card className="w-full h-full">
          <CardHeader className="p-2 sm:p-3">
            <CardTitle className="text-base sm:text-lg font-headline text-center">Azioni Principali</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 grid grid-cols-1 gap-2">
            <Button
              variant="destructive" 
              className="w-full py-2 text-sm sm:text-base" 
              onClick={onPlayerAttackIntent}
              disabled={!canTakeAction || !canAttack}
            >
              <ZapIcon className="mr-2 h-4 w-4" />
              Attacca
            </Button>
            {/* Scout and Item buttons are now global in the footer */}
            {!canAttack && (
                <p className="text-xs text-center text-muted-foreground">Nessuna mossa equipaggiata per attaccare.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="w-full sm:w-2/5 flex flex-col mt-2 sm:mt-0">
        {showOpponentStatsBriefly && opponent ? (
             <OpponentStatsDisplay fighter={opponent} className="h-full" />
        ) : (
            <PlayerStatsDisplay fighter={player} className="h-full" />
        )}
      </div>
    </div>
  );
};

export default PlayerActionsHub;
    
