
import React from 'react';
import { Bone, Flame, HandHelping, Zap, Droplets, Shield, ShieldBan, BatteryCharging, ShieldAlert, type LucideIcon, ArrowUp, ArrowDown, TrendingUp, MoreHorizontal, Leaf, Sun, Moon, Feather, Bird, BrainCircuit, PersonStanding, Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, Hand, Sparkles, Sword, ScrollText, Undo2, Package, UserCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Attack, CreatureType } from '@/types/battle';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { STATUS_EFFECTS } from '@/config/statusEffects';
import { GameBalance } from '@/config/game-balance';

interface ActionDisplayProps {
  action: Attack | null;
  onTogglePause?: (isPausing: boolean) => void;
  isSuperEffective?: boolean;
  isIneffective?: boolean;
  currentTurnMessage: string;
  isWinner: boolean;
}

const attackIconMap: Record<string, LucideIcon> = {
  Bone, Flame, HandHelping, Zap, Droplets, Shield, ShieldBan, BatteryCharging, ShieldAlert,
  TrendingUp, MoreHorizontal, Leaf, Sun, Moon, Feather, Bird, BrainCircuit, PersonStanding,
  Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, Hand, Sparkles
};

const ActionDisplay: React.FC<ActionDisplayProps> = ({
  action,
  onTogglePause,
  isSuperEffective = false,
  isIneffective = false,
  currentTurnMessage,
  isWinner,
}) => {

  const getActionPanelContent = () => {
    if (isWinner) {
        return <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Battaglia conclusa.</div>;
    }
      
    if (!action || !action.name) {
        return <div className="h-full flex items-center justify-center text-muted-foreground text-sm">{currentTurnMessage || 'Attendere...'}</div>;
    }
  
    const AttackSpecificIcon = action.icon ? attackIconMap[action.icon] : TrendingUp;

    const typeColorClassMap: Record<CreatureType, string> = {
        Fire: 'border-red-500',
        Water: 'border-blue-500',
        Grass: 'border-green-500',
        Light: 'border-white',
        Dark: 'border-black',
    };
    const borderColorClass = action.creatureType ? typeColorClassMap[action.creatureType] : 'border-primary';

    return (
        <Popover onOpenChange={onTogglePause}>
            <PopoverTrigger asChild>
                <button className={cn(
                    "relative flex flex-col items-center justify-center p-4 border-2 rounded-lg shadow-lg bg-card/80 transition-colors w-full h-full",
                    borderColorClass,
                )}>
                    {isSuperEffective && (
                        <div className="absolute top-1 right-1 flex items-center justify-center bg-green-500 rounded-full w-5 h-5">
                            <ArrowUp className="w-4 h-4 text-white" />
                        </div>
                    )}
                    {isIneffective && (
                        <div className="absolute top-1 right-1 flex items-center justify-center bg-red-500 rounded-full w-5 h-5">
                            <ArrowDown className="w-4 h-4 text-white" />
                        </div>
                    )}
                    <div className="flex items-center space-x-1.5 mb-1">
                      {AttackSpecificIcon && <AttackSpecificIcon className="w-8 h-8 text-primary" />}
                    </div>
                    <p className="text-xl font-bold text-primary truncate max-w-full">{action.name}</p>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-card/90 backdrop-blur-sm">
                <div className="space-y-2 relative">
                    <h3 className="font-headline text-lg leading-none text-primary pt-1">{action.name}</h3>
                    <div className="text-sm space-y-1 text-popover-foreground">
                        <p><strong>Categoria:</strong> <Badge variant="outline">{action.category}</Badge></p>
                        <p><strong>Tipo:</strong> <Badge variant="outline">{action.creatureType}</Badge></p>
                        <p><strong>Danno:</strong> <Badge variant="secondary">{action.damage > 0 ? action.damage : (action.damage < 0 ? `Cura ${Math.abs(action.damage)}` : 'N/A')}</Badge></p>
                        <p><strong>Precisione:</strong> <Badge variant="secondary">{(action.accuracy * 100).toFixed(0)}%</Badge></p>
                        {action.effect && (
                          <p><strong>Effetto:</strong> {(action.effect.chance * 100).toFixed(0)}% di <Badge variant="destructive">{STATUS_EFFECTS[action.effect.statusId]?.name || 'Effetto'}</Badge></p>
                        )}
                        {action.recoil && (<p><strong>Rinculo:</strong> <Badge variant="secondary">{(action.recoil * 100).toFixed(0)}% del danno</Badge></p>)}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
  };

  return (
      <div className="text-center w-full h-full flex flex-col items-center justify-center p-1 space-y-1">
          <div className="w-full h-32 flex items-center justify-center">
            {getActionPanelContent()}
          </div>
      </div>
  );
};

export default ActionDisplay;
