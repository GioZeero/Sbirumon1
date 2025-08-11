
import type { FC } from 'react';
import type { Attack } from '@/types/battle';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bone, Flame, HandHelping, Zap, Droplets, TrendingUp, Sparkles, Waves, type LucideIcon } from 'lucide-react';
import React from 'react';

interface AttackSelectionProps {
  attacks: Attack[];
  onAttackSelect: (attackId: string) => void;
  disabled?: boolean;
}

// Icon map for attacks
const attackIconMap: Record<string, LucideIcon> = {
  Bone,
  Flame,
  HandHelping,
  Zap,
  Droplets,
  Sparkles,
  Waves,
  TrendingUp, // Default/fallback icon
};

const AttackSelection: FC<AttackSelectionProps> = ({ attacks, onAttackSelect, disabled = false }) => {
  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle className="text-xl font-headline text-center">Scegli la Tua Mossa</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-2 gap-3">
        <TooltipProvider delayDuration={100}>
          {attacks.map((attack) => {
            const IconComponent = attack.icon ? attackIconMap[attack.icon] : null;
            return (
              <Tooltip key={attack.id}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onAttackSelect(attack.id)}
                    disabled={disabled}
                    variant="outline"
                    className="w-full h-16 text-sm md:text-base justify-start p-3 overflow-hidden group"
                  >
                    {IconComponent && <IconComponent className="w-5 h-5 mr-2 flex-shrink-0" />}
                    <span className="truncate flex-grow text-left">{attack.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">({attack.damage > 0 ? `${attack.damage} Danni` : `${Math.abs(attack.damage)} Cura`})</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-popover text-popover-foreground border-border">
                  <p>{attack.name}: {attack.damage > 0 ? `${attack.damage} Danni` : `${Math.abs(attack.damage)} Cura`}, {attack.accuracy * 100}% Prec. ({attack.type})</p>
                  {attack.effect && <p className="text-xs text-muted-foreground">Possibilità di {attack.effect.statusId}</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default AttackSelection;
