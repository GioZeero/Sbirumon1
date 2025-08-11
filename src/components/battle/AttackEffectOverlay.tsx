
'use client';

import type { FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Droplets, Leaf, Sun, Moon, Shield, type LucideIcon, Bone, HandHelping, Zap, TrendingUp, Feather, Bird, BrainCircuit, PersonStanding, Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, Hand, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreatureType } from '@/types/battle';

type HitAnimationState = {
  target: 'player' | 'opponent';
  type: CreatureType | 'Status' | 'Physical';
  iconName: string;
} | null;

interface AttackEffectOverlayProps {
  hitAnimationState: HitAnimationState;
}

const effectMap: Record<string, { icon: LucideIcon; animation: any, key: string }> = {
  Bone: { icon: Bone, animation: 'animate-explode-fade', key: 'bone' },
  Flame: { icon: Flame, animation: 'animate-explode-fade', key: 'fire' },
  HandHelping: { icon: HandHelping, animation: 'animate-pulse-quick', key: 'handhelping' },
  Zap: { icon: Zap, animation: 'animate-flash-bright', key: 'zap' },
  Droplets: { icon: Droplets, animation: 'animate-splash-fade', key: 'droplets' },
  Shield: { icon: Shield, animation: 'animate-pulse-quick', key: 'shield' },
  TrendingUp: { icon: TrendingUp, animation: 'animate-swirl-in', key: 'trendingup' },
  Leaf: { icon: Leaf, animation: 'animate-swirl-in', key: 'leaf' },
  Sun: { icon: Sun, animation: 'animate-flash-bright', key: 'sun' },
  Moon: { icon: Moon, animation: 'animate-implode-fade', key: 'moon' },
  Feather: { icon: Feather, animation: 'animate-swirl-in', key: 'feather' },
  Bird: { icon: Bird, animation: 'animate-explode-fade', key: 'bird' },
  BrainCircuit: { icon: BrainCircuit, animation: 'animate-pulse-quick', key: 'brain' },
  PersonStanding: { icon: PersonStanding, animation: 'animate-pulse-quick', key: 'person' },
  Footprints: { icon: Footprints, animation: 'animate-explode-fade', key: 'footprints' },
  Wind: { icon: Wind, animation: 'animate-swirl-in', key: 'wind' },
  Waves: { icon: Waves, animation: 'animate-splash-fade', key: 'waves' },
  CircleDashed: { icon: CircleDashed, animation: 'animate-pulse-quick', key: 'circle' },
  Volume2: { icon: Volume2, animation: 'animate-pulse-quick', key: 'volume' },
  Mountain: { icon: Mountain, animation: 'animate-explode-fade', key: 'mountain' },
  Bed: { icon: Bed, animation: 'animate-implode-fade', key: 'bed' },
  Sprout: { icon: Sprout, animation: 'animate-swirl-in', key: 'sprout' },
  Hand: { icon: Hand, animation: 'animate-explode-fade', key: 'hand' },
  Sparkles: { icon: Sparkles, animation: 'animate-flash-bright', key: 'sparkles' },
  MoreHorizontal: { icon: TrendingUp, animation: 'animate-pulse-quick', key: 'default' },
};

const typeColorMap: Record<CreatureType | 'Status' | 'Physical', string> = {
  Fire: 'text-orange-500',
  Water: 'text-blue-400',
  Grass: 'text-green-500',
  Light: 'text-yellow-300',
  Dark: 'text-purple-400',
  Status: 'text-gray-400',
  Physical: 'text-gray-200',
};


const AttackEffectOverlay: FC<AttackEffectOverlayProps> = ({ hitAnimationState }) => {
  const effectDetails = hitAnimationState ? effectMap[hitAnimationState.iconName] : null;
  const colorClass = hitAnimationState ? typeColorMap[hitAnimationState.type] : '';

  return (
    <AnimatePresence>
      {hitAnimationState && effectDetails && (
        <motion.div
          key={effectDetails.key + Date.now()}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <effectDetails.icon
            className={cn(
              "w-24 h-24 sm:w-32 sm:h-32 drop-shadow-lg",
              colorClass,
              effectDetails.animation
            )}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AttackEffectOverlay;

    