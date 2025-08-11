import type { FC } from 'react';
import type { Fighter } from '@/types/battle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import HealthBar from './HealthBar';
import { Star } from 'lucide-react';

interface OpponentStatsDisplayProps {
  fighter: Fighter;
  className?: string;
}

const OpponentStatsDisplay: FC<OpponentStatsDisplayProps> = ({ fighter, className }) => {
  const getStatColor = (current: number, base: number): string => {
    if (current > base) return "text-yellow-400";
    if (current < base) return "text-destructive";
    return "text-foreground/90";
  };
  
  return (
    <Card className={cn("w-full text-sm shadow-md flex flex-col", className)}>
      <CardHeader className="p-3 pt-4">
        <CardTitle className="text-xl font-headline text-center text-destructive truncate">
          Statistiche: {fighter.name}
        </CardTitle>
        <div className={cn("text-sm text-center font-medium flex items-center justify-center mt-0.5 text-destructive/80")}>
            <Star className="w-4 h-4 mr-1" /> Livello: {fighter.level}
        </div>
      </CardHeader>
      <CardContent className="p-3 pb-4 space-y-2 flex-grow">
        <HealthBar currentHealth={fighter.currentHealth} maxHealth={fighter.maxHealth} />
        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-sm mt-3">
          <div className="flex justify-between items-center">
            <span>A:</span>
            <span className={cn("font-semibold", getStatColor(fighter.currentAttackStat, fighter.attackStat))}>
              {fighter.currentAttackStat}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>D:</span>
            <span className={cn("font-semibold", getStatColor(fighter.currentDefenseStat, fighter.defenseStat))}>
              {fighter.currentDefenseStat}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>V:</span>
            <span className={cn("font-semibold", getStatColor(fighter.currentSpeedStat, fighter.speedStat))}>
              {fighter.currentSpeedStat}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>As:</span>
            <span className={cn("font-semibold", getStatColor(fighter.currentSpecialAttackStat, fighter.specialAttackStat))}>
              {fighter.currentSpecialAttackStat}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Ds:</span>
            <span className={cn("font-semibold", getStatColor(fighter.currentSpecialDefenseStat, fighter.specialDefenseStat))}>
              {fighter.currentSpecialDefenseStat}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>F:</span>
            <span className={cn("font-semibold", getStatColor(fighter.currentLuckStat, fighter.luckStat))}>
              {fighter.currentLuckStat}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpponentStatsDisplay;
