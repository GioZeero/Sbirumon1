
'use client';

import React from 'react';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StarIcon } from 'lucide-react';
import type { View } from './types';

interface EvolutionMenuPageProps {
  menuPlayerData: Fighter | null;
  handleEvolveCreature: () => void;
  navigateTo: (view: View) => void;
}

export const EvolutionMenuPage = ({ menuPlayerData, handleEvolveCreature, navigateTo }: EvolutionMenuPageProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-foreground">
        <Card className="max-w-md w-full text-center p-8 bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-4xl font-headline text-primary">Evoluzione!</CardTitle>
                <CardDescription className="text-xl text-muted-foreground pt-2">
                    Il tuo Sbirumon, {menuPlayerData?.name}, vorrebbe evolversi!
                </CardDescription>
            </CardHeader>
            <CardContent className="mt-4 flex flex-col space-y-4">
                <Button size="lg" onClick={handleEvolveCreature} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <StarIcon className="mr-2 h-5 w-5" /> Consentilo
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigateTo('main')}>
                    Forse più tardi
                </Button>
            </CardContent>
        </Card>
    </div>
  );
};
