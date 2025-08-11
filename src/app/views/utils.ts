
import type { Archetype } from "@/types/battle";
import { cn } from "@/lib/utils";

export const getStatGrowthColor = (archetype: Archetype | undefined, stat: 'physical' | 'special' | 'other') => {
    if (!archetype || archetype === 'Balanced') return "";
    switch (archetype) {
        case 'Physical':
            if (stat === 'physical') return 'text-yellow-400';
            if (stat === 'special') return 'text-red-500';
            return '';
        case 'Special':
            if (stat === 'special') return 'text-yellow-400';
            if (stat === 'physical') return 'text-red-500';
            return '';
        default:
            return '';
    }
};
