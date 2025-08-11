

import type { FC } from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

interface HealthBarProps {
  currentHealth: number;
  maxHealth: number;
  barClassName?: string;
  textClassName?: string;
}

const HealthBar: FC<HealthBarProps> = ({ currentHealth, maxHealth, barClassName, textClassName }) => {
  const percentage = maxHealth > 0 ? (currentHealth / maxHealth) * 100 : 0;
  const healthColor = percentage > 60 ? 'bg-green-500' : percentage > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-full">
      <div className={cn("health-bar-wrapper w-full rounded-full border border-foreground/20 bg-background overflow-hidden h-3", barClassName)}>
        <motion.div
          className={cn("h-full", healthColor)}
          initial={{ width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <p className={cn("health-bar-text text-center mt-1 font-semibold text-sm", textClassName)}>
        {Math.max(0, currentHealth)} / {maxHealth} HP
      </p>
    </div>
  );
};

export default HealthBar;
