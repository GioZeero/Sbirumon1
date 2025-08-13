
'use client';

import type { FC } from 'react';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface TrustLevelBarProps {
  currentTrust: number;
  maxTrust?: number;
}

const TrustLevelBar: FC<TrustLevelBarProps> = ({
  currentTrust,
  maxTrust = 10,
}) => {
  const percentage = maxTrust > 0 ? (currentTrust / maxTrust) * 100 : 0;
  
  // Define color based on trust level percentage
  const indicatorColorClass = 
    percentage > 80 ? 'bg-purple-500' : 
    percentage > 50 ? 'bg-yellow-400' : 
    'bg-red-500';

  return (
    <div className="flex w-full max-w-xs items-center gap-2">
      <Heart className="h-5 w-5 text-red-400 flex-shrink-0" />
      <Progress 
        value={percentage} 
        className="h-2.5" 
        indicatorClassName={cn("transition-all duration-500 ease-in-out", indicatorColorClass)} 
      />
    </div>
  );
};

export default TrustLevelBar;
