
'use client';

import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplets, Leaf, Sun, Moon, Shield, type LucideIcon, Bone, HandHelping, Zap, TrendingUp, Feather, Bird, BrainCircuit, PersonStanding, Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, Hand, Sparkles, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreatureType } from '@/types/battle';

type Coords = { x: number; y: number } | null;

interface ProjectileAnimationProps {
  from: Coords;
  to: Coords;
  type: CreatureType | 'Status' | 'Physical';
  iconName: string;
  delay?: number;
  onComplete: () => void;
}

const effectMap: Record<CreatureType | 'Status' | 'Physical', { color: string; glow: string; }> = {
  Fire: { color: 'text-orange-400', glow: 'drop-shadow-neon-orange' },
  Water: { color: 'text-blue-400', glow: 'drop-shadow-neon-blue' },
  Grass: { color: 'text-green-400', glow: 'drop-shadow-neon-green' },
  Light: { color: 'text-yellow-300', glow: 'drop-shadow-neon-yellow' },
  Dark: { color: 'text-purple-400', glow: 'drop-shadow-neon-purple' },
  Status: { color: 'text-gray-400', glow: 'drop-shadow-neon-gray' },
  Physical: { color: 'text-white', glow: 'drop-shadow-neon-white' },
};

const attackIconMap: Record<string, LucideIcon> = {
  Bone, Flame, HandHelping, Zap, Droplets, Shield,
  TrendingUp, Leaf, Sun, Moon, Feather, Bird, BrainCircuit, PersonStanding,
  Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, Hand, Sparkles, MoreHorizontal
};


const ProjectileAnimation: FC<ProjectileAnimationProps> = ({ from, to, type, iconName, delay = 0, onComplete }) => {
  if (!from || !to) {
    onComplete();
    return null;
  }

  const effect = effectMap[type];
  const IconComponent = attackIconMap[iconName] || TrendingUp;

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 pointer-events-none"
      initial={{ x: from.x, y: from.y, opacity: 1, scale: 0.5 }}
      animate={{ 
        x: to.x, 
        y: to.y, 
        scale: [0.5, 1, 0.5],
        opacity: [1, 1, 0],
        transition: { duration: 0.66, ease: 'easeInOut', delay }
      }}
      onAnimationComplete={onComplete}
    >
      <IconComponent className={cn("w-10 h-10", effect.color, effect.glow)} />
    </motion.div>
  );
};

export default ProjectileAnimation;

    