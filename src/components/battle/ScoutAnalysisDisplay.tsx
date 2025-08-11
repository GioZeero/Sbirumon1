

'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Star, ArrowUp, ArrowDown, Minus, Sword, Shield, Sparkles, ShieldCheck, Gauge, Clover } from 'lucide-react';
import type { AnalyzedStats, StatAnalysisCategory } from '@/types/battle';

interface ScoutAnalysisDisplayProps {
  analysis: AnalyzedStats;
  fighterName: string;
  level: number;
}

const statIconMap = {
  attackStat: Sword,
  defenseStat: Shield,
  specialAttackStat: Sparkles,
  specialDefenseStat: ShieldCheck,
  speedStat: Gauge,
  luckStat: Clover,
};

const analysisIconMap: Record<StatAnalysisCategory, React.ElementType> = {
  strong: ArrowUp,
  weak: ArrowDown,
  normal: Minus,
};

const analysisColorMap: Record<StatAnalysisCategory, string> = {
  strong: 'text-green-400',
  weak: 'text-red-400',
  normal: 'text-muted-foreground',
};

const ScoutAnalysisDisplay: FC<ScoutAnalysisDisplayProps> = ({ analysis, fighterName, level }) => {
  return (
    <div className="w-56 h-56 relative">
      <Card className="w-full h-full flex flex-col justify-around border-primary shadow-primary/30 shadow-lg relative">
        <CardHeader className="p-2 pt-3">
          <CardTitle className="text-base font-headline text-center truncate text-destructive">
            Analisi: {fighterName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 flex-grow grid grid-cols-2 gap-x-3 gap-y-1.5 content-center">
            {Object.entries(analysis).map(([stat, category]) => {
                const StatIcon = statIconMap[stat as keyof typeof statIconMap];
                const AnalysisIcon = analysisIconMap[category];
                const color = analysisColorMap[category];

                return (
                    <div key={stat} className="flex items-center space-x-2">
                        <StatIcon className="w-4 h-4 text-primary/80" />
                        <AnalysisIcon className={cn("w-5 h-5", color)} />
                    </div>
                );
            })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoutAnalysisDisplay;
