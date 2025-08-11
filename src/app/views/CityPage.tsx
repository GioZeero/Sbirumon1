

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftCircle, Landmark, University } from 'lucide-react';
import type { View } from './types';

interface CityPageProps {
  onNavigate: (view: View) => void;
}

export const CityPage = ({ onNavigate }: CityPageProps) => {
    return (
        <div className="relative flex min-h-screen flex-col items-center pb-24 text-foreground">
             <button onClick={() => onNavigate('main')} className="absolute top-6 left-6 z-10 h-16 w-16 rounded-full hover:bg-background/20 transition-colors flex items-center justify-center p-0">
                <ChevronLeftCircle className="h-full w-full p-1" strokeWidth={2.5} />
            </button>
            <main className="w-full max-w-sm p-4">
                <header className="w-full mb-8 mt-12 sm:mt-0">
                    
                </header>
                <div className="grid w-full grid-cols-1 gap-3">
                    <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => onNavigate('noble_area')}>
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-yellow-500/20 p-3"><Landmark className="h-6 w-6 text-yellow-400" /></div>
                            <div>
                                <p className="text-base font-bold">Area Nobiliare</p>
                                <p className="text-sm text-muted-foreground">Sfide competitive e palestre</p>
                            </div>
                        </div>
                    </Button>
                    <Button variant="secondary" className="h-20 w-full justify-start p-4 text-left" onClick={() => onNavigate('merchant_area')}>
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-orange-500/20 p-3"><University className="h-6 w-6 text-orange-400" /></div>
                            <div>
                                <p className="text-base font-bold">Area Mercantile</p>
                                <p className="text-sm text-muted-foreground">Negozi, servizi e lavori</p>
                            </div>
                        </div>
                    </Button>
                </div>
            </main>
        </div>
    );
};
