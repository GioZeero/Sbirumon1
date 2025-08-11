

import type { FC } from 'react';
import React from 'react';
import type { Attack, Fighter } from '@/types/battle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Star, Sword, Shield, Sparkles, ShieldCheck, Gauge, Clover, TrendingUp, Flame, Droplets, Bone, Zap, HandHelping, Leaf, Moon, Sun, MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TentennamentoAttack } from '@/config/fighters';
import { checkSuperEffective, checkIneffective } from '@/lib/battle-logic';

interface PlayerStatsDisplayProps {
  fighter: Fighter;
  opponent?: Fighter | null;
  className?: string;
  onAttackClick: (attackId: string) => void;
}

const attackIconMap: Record<string, any> = {
  Bone, Flame, HandHelping, Zap, Droplets, Shield,
  TrendingUp, MoreHorizontal, Leaf, Sun, Moon,
};

const getAttackIconElement = (attack: Attack, className?: string) => {
  const IconComponent = (attack.icon && attackIconMap[attack.icon]) ? attackIconMap[attack.icon] : TrendingUp;
  return <IconComponent className={className || "w-4 h-4 mr-2 flex-shrink-0"} />;
};

const PlayerStatsDisplay: FC<PlayerStatsDisplayProps> = ({
  fighter,
  opponent,
  className,
  onAttackClick
}) => {
  const xpPercentage = fighter.xpToNextLevel > 0 ? (fighter.currentXP / fighter.xpToNextLevel) * 100 : 0;
  
  const getStatColor = (current: number, base: number): string => {
    if (current > base) return "text-yellow-400";
    if (current < base) return "text-destructive";
    return "text-foreground/90";
  };
  
  return (
    <Card className={cn("w-full text-sm shadow-md flex flex-col", className)}>
      <CardHeader className="p-2 pt-3">
        <CardTitle className="text-base font-headline text-center text-primary truncate">
          Statistiche: {fighter.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pb-3 space-y-2 flex flex-col flex-grow">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
           <div className="flex items-center"><Sword className="w-3 h-3 mr-1 text-primary/70" /> Attacco <span className={cn("ml-auto font-semibold", getStatColor(fighter.currentAttackStat, fighter.attackStat))}>{fighter.currentAttackStat}</span></div>
           <div className="flex items-center"><Shield className="w-3 h-3 mr-1 text-primary/70" /> Difesa <span className={cn("ml-auto font-semibold", getStatColor(fighter.currentDefenseStat, fighter.defenseStat))}>{fighter.currentDefenseStat}</span></div>
           <div className="flex items-center"><Sparkles className="w-3 h-3 mr-1 text-primary/70" /> Att. Sp. <span className={cn("ml-auto font-semibold", getStatColor(fighter.currentSpecialAttackStat, fighter.specialAttackStat))}>{fighter.currentSpecialAttackStat}</span></div>
           <div className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1 text-primary/70" /> Dif. Sp. <span className={cn("ml-auto font-semibold", getStatColor(fighter.currentSpecialDefenseStat, fighter.specialDefenseStat))}>{fighter.currentSpecialDefenseStat}</span></div>
           <div className="flex items-center"><Gauge className="w-3 h-3 mr-1 text-primary/70" /> Velocità <span className={cn("ml-auto font-semibold", getStatColor(fighter.currentSpeedStat, fighter.speedStat))}>{fighter.currentSpeedStat}</span></div>
           <div className="flex items-center"><Clover className="w-3 h-3 mr-1 text-primary/70" /> Fortuna <span className={cn("ml-auto font-semibold", getStatColor(fighter.currentLuckStat, fighter.luckStat))}>{fighter.currentLuckStat}</span></div>
        </div>
        <div className="mt-2 pt-2 border-t border-border/30">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center"><Star className="w-3 h-3 mr-1 text-accent" />Livello:</span>
            <span className="font-semibold text-foreground/90">{fighter.level}</span>
          </div>
          <div className="text-xs text-muted-foreground text-center my-0.5">XP: {fighter.currentXP} / {fighter.xpToNextLevel}</div>
          <Progress value={xpPercentage} className="h-1.5" indicatorClassName="bg-accent" />
        </div>
        
        <div className="mt-2 pt-2 border-t border-border/30">
            <h3 className="text-center text-xs font-semibold mb-1">Mosse Equipaggiate</h3>
            <div className="grid grid-cols-2 gap-1">
                {fighter.attacks.map((attack) => (
                    attack.id !== TentennamentoAttack.id && (
                        <Button
                            key={attack.id}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 px-2 justify-start truncate relative"
                            onClick={() => onAttackClick(attack.id)}
                        >
                            {getAttackIconElement(attack)}
                            <span className="truncate flex-grow">{attack.name}</span>
                            {opponent && checkSuperEffective(attack.creatureType, opponent.creatureType) && (
                                <ArrowUp className="ml-1 h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                            )}
                            {opponent && checkIneffective(attack.creatureType, opponent.creatureType) && (
                                <ArrowDown className="ml-1 h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                            )}
                        </Button>
                    )
                ))}
            </div>
        </div>
        
      </CardContent>
    </Card>
  );
};

export default PlayerStatsDisplay;
