
import type { FC } from 'react';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface TrustLevelBarProps {
  currentTrust: number;
  maxTrust?: number;
  barClassName?: string;
  segmentClassName?: string;
  filledSegmentClassName?: string;
  emptySegmentClassName?: string;
}

const TrustLevelBar: FC<TrustLevelBarProps> = ({
  currentTrust,
  maxTrust = 10,
  barClassName,
  segmentClassName,
  filledSegmentClassName,
  emptySegmentClassName,
}) => {
  const segments = Array.from({ length: maxTrust });

  return (
    <div className={cn("flex w-full justify-center items-center space-x-1 my-1 sm:my-2", barClassName)}>
      {segments.map((_, index) => (
        <div
          key={index}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded-sm transition-colors",
            segmentClassName,
            index < Math.round(currentTrust)
              ? cn("bg-primary text-primary-foreground", filledSegmentClassName)
              : cn("bg-muted/50 text-muted-foreground", emptySegmentClassName)
          )}
        >
          <Heart className={cn("w-4 h-4", index < Math.round(currentTrust) ? "fill-current" : "")} />
        </div>
      ))}
    </div>
  );
};

export default TrustLevelBar;
