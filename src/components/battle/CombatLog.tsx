
import type { FC } from 'react';
import type { BattleLogEntry, LogMessagePart } from '@/types/battle';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface CombatLogProps {
  logEntries: BattleLogEntry[];
  isModalView?: boolean;
  onAttackClick?: (attackId: string) => void;
}

const CombatLog: FC<CombatLogProps> = ({ logEntries, isModalView = false, onAttackClick }) => {
  return (
    <Card className={cn(
      "w-full flex flex-col overflow-hidden",
      isModalView ? "h-auto max-h-[60vh] bg-transparent border-none shadow-none" : "h-56"
    )}>
      {!isModalView && (
        <CardHeader className="p-3 flex-shrink-0">
          <CardTitle className="text-lg font-headline text-center">Log Combattimento</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("flex-grow overflow-y-auto min-h-0", isModalView ? 'p-0' : 'p-3')}>
        {logEntries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">La battaglia inizia...</p>
        )}
        {logEntries.map((entry, index) => (
          <div key={entry.id}>
            <p className="text-sm py-0.5 leading-relaxed">
              {entry.message.map((part, i) => {
                if (typeof part === 'string') {
                  return <span key={i}>{part}</span>;
                } else if (part.type === 'attack' && onAttackClick) {
                  return (
                    <Button 
                      key={i} 
                      variant="link" 
                      className="p-0 h-auto text-sm font-bold text-primary inline"
                      onClick={() => onAttackClick(part.attackId)}
                    >
                      {part.attackName}
                    </Button>
                  );
                }
                // Fallback for when onAttackClick is not provided
                return <span key={i} className="font-bold text-primary">{part.attackName || 'Mossa Sconosciuta'}</span>;
              })}
            </p>
            {index < logEntries.length - 1 && <Separator className="my-0.5 bg-border/50" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CombatLog;
