

'use client';

import type { FC } from 'react';
import Image from 'next/image';
import type { Fighter, StatusEffect, CreatureType, Archetype } from '@/types/battle';
import HealthBar from './HealthBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { Flame, Shield, Droplets, Zap, Star, Leaf, Sun, Moon, type LucideIcon, BrainCircuit, TrendingUp, TrendingDown, ShieldAlert, BatteryCharging, Clock } from 'lucide-react';
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { STATUS_EFFECTS } from '@/config/statusEffects';

type Coords = { x: number; y: number } | null;

interface FighterCardProps {
  fighter: Fighter;
  isPlayer?: boolean;
  isTurn?: boolean;
  onAnimationComplete?: () => void;
  setCoords?: (coords: Coords) => void;
  layout?: 'horizontal-left' | 'horizontal-right' | 'vertical';
}

const statusEffectIconMap: Record<string, LucideIcon> = {
  burn: Flame,
  poison: Droplets,
  paralysis: Zap,
  confusion: BrainCircuit,
  sleep: Moon,
  flinch: ShieldAlert,
  impaurita: ShieldAlert,
  crescita_buff: TrendingUp,
  danza_buff: TrendingUp,
  acido_debuff: TrendingDown,
  ruggito_debuff: TrendingDown,
  stridio_debuff: TrendingDown,
  generic_buff: Shield,
  generic_debuff: Shield,
  carica_buff: BatteryCharging,
};

const creatureTypeIconMap: Record<CreatureType, LucideIcon> = {
  Fire: Flame,
  Water: Droplets,
  Grass: Leaf,
  Light: Sun,
  Dark: Moon,
};

function getSpriteUrl(fighter: Fighter, isPlayer: boolean): string {
    // If the creature is the player's AND it has a behind-sprite...
    if (isPlayer && fighter.spriteUrlDietro) {
        // ...use that. This takes precedence for the player's view.
        return fighter.spriteUrlDietro;
    }
    
    // Otherwise, for enemies or for any creature in a menu view...
    // check if it's evolved and use the evolved sprite if available.
    if (fighter.isEvolved && fighter.evolvedSpriteUrl) {
        return fighter.evolvedSpriteUrl;
    }
    
    // As a fallback, use the default front-facing sprite.
    return fighter.spriteUrl;
}


const FighterCard: FC<FighterCardProps> = ({ fighter, isPlayer = false, isTurn = false, onAnimationComplete, setCoords, layout = 'vertical' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayedHealth, setDisplayedHealth] = useState(fighter.currentHealth);

  useEffect(() => {
      setDisplayedHealth(fighter.currentHealth);
  }, [fighter.currentHealth]);

  useLayoutEffect(() => {
    if (cardRef.current && setCoords) {
      const rect = cardRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, [fighter.id, setCoords]);
  
  const spriteUrl = getSpriteUrl(fighter, isPlayer);

  const FighterImage = (
    <div 
        ref={cardRef}
        className={cn(
        "fighter-card-image relative flex-shrink-0",
        isPlayer ? "w-[60vw] h-[60vw]" : "w-[30vw] h-[30vw]"
        )}
    >
        <Image
        src={spriteUrl}
        alt={fighter.name}
        fill
        className="object-contain w-full h-full"
        priority={isPlayer}
        unoptimized
        />
    </div>
  );

  const FighterStatsCard = (
     <Card className={cn(
          "w-48 transform transition-colors duration-300 ease-out flex flex-col justify-around",
          "bg-card/80 border",
           isTurn ? "border-primary" : "border-foreground/20"
        )}>
           <CardContent className="p-1.5 flex flex-col items-center space-y-1 flex-grow justify-center">
            <HealthBar 
              currentHealth={displayedHealth} 
              maxHealth={fighter.maxHealth}
            />
            <CardTitle className={cn("fighter-card-title font-headline text-center truncate text-base pt-1", isPlayer ? "text-primary" : "text-destructive")}>
              {fighter.name}
            </CardTitle>
            {fighter.statusEffects.length > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-1 mt-1 max-w-[90%]">
                  {fighter.statusEffects.slice(0, 4).map((effect: StatusEffect) => { // Limit to 4 effects on card
                    const effectDefinition = STATUS_EFFECTS[effect.id] || effect;
                    const IconComponent = statusEffectIconMap[effect.id] || Zap;
                    return (
                       <Popover key={effect.id}>
                        <PopoverTrigger asChild>
                          <div className="p-1 bg-secondary rounded-full border border-border cursor-pointer hover:bg-accent/20">
                            <IconComponent className="w-4 h-4 text-foreground/80" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 bg-card/90 backdrop-blur-sm">
                          <div className="space-y-2">
                              <h3 className="font-headline text-lg leading-none text-primary flex items-center">
                                  <IconComponent className="w-5 h-5 mr-2" />
                                  {effectDefinition.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">{effectDefinition.description}</p>
                              <div className="flex items-center text-sm font-semibold pt-2 border-t border-border/50">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>Turni Rimanenti: {effect.duration}</span>
                              </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
  );

  const layoutClasses = {
      'vertical': 'flex-col items-center space-y-2',
      'horizontal-left': 'flex-row items-center justify-start',
      'horizontal-right': 'flex-row-reverse items-center justify-end'
  };
  
  const justificationClass = () => {
      switch(layout) {
          case 'horizontal-left':
              return 'justify-start';
          case 'horizontal-right':
              return 'justify-end';
          default:
              return 'justify-center';
      }
  }

  return (
    <div
        className={cn(
            "relative fighter-card-wrapper w-full h-auto flex", 
            layoutClasses[layout], 
            justificationClass()
        )}
    >
      {isPlayer ? (
        <>
            {FighterImage}
            {FighterStatsCard}
        </>
      ) : (
         <>
            {FighterImage}
            <div className="w-[10vw]"></div>
            {FighterStatsCard}
        </>
      )}
    </div>
  );
};

export default FighterCard;
