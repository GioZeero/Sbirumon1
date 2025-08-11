
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Fighter } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sprout, ShieldQuestion, Trophy, Store, Glasses, Briefcase, ArrowLeft, ArrowRight, Loader2, Wand2, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { View } from './types';

interface MainMenuPageProps {
  menuPlayerData: Fighter | null;
  leaderboardRank: number | null;
  initializeBattle: (options?: any) => void;
  navigateTo: (view: View) => void;
  onSecretClick: () => void;
  isLoading: boolean;
}

export const MainMenuPage = ({ menuPlayerData, leaderboardRank, initializeBattle, navigateTo, onSecretClick, isLoading }: MainMenuPageProps) => {

  const mainMenuDestinations = useMemo(() => {
    return [
      { name: 'Prateria', icon: Sprout, view: 'prairie' as View, color: 'text-green-400', shadowColor: '#34d399' },
      { name: 'Arena', icon: ShieldQuestion, view: 'arena' as View, color: 'text-red-400', shadowColor: '#f87171' },
      { name: 'Palestre', icon: Trophy, view: 'gym_menu' as View, color: 'text-yellow-400', shadowColor: '#fbb_f' },
      { name: 'Città', icon: Building, view: 'city' as View, color: 'text-teal-400', shadowColor: '#2dd4bf' },
      { name: 'Covo dei Nerd', icon: Glasses, view: 'covo_menu' as View, color: 'text-orange-400', shadowColor: '#fb923c' },
      { name: 'Bacheca Lavori', icon: Briefcase, view: 'job_board' as View, color: 'text-blue-400', shadowColor: '#60a5fa' },
      { name: 'Sentiero Arcano', icon: Wand2, view: 'arcane_path' as View, color: 'text-purple-400', shadowColor: '#a855f7' },
    ];
  }, []);


  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const anglePerItem = 360 / mainMenuDestinations.length;

  const handleArrowClick = (direction: 'left' | 'right') => {
      let newIndex;
      if (direction === 'left') {
          newIndex = (activeIndex - 1 + mainMenuDestinations.length) % mainMenuDestinations.length;
          setRotation(prev => prev + anglePerItem);
      } else {
          newIndex = (activeIndex + 1) % mainMenuDestinations.length;
          setRotation(prev => prev - anglePerItem);
      }
      setActiveIndex(newIndex);
  };
  
  const selectedIndex = (activeIndex + Math.floor(mainMenuDestinations.length / 2)) % mainMenuDestinations.length;
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 p-4 z-20">
            {menuPlayerData && (
                <Card 
                  className="max-w-md mx-auto bg-card/70 backdrop-blur-sm border-border/50 cursor-pointer"
                  onClick={onSecretClick}
                >
                    <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Ciao, {menuPlayerData.trainerName}</p>
                            </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-around text-center">
                            <div>
                                <p className="font-bold text-lg">{leaderboardRank ?? 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">RANK</p>
                            </div>
                            <Separator orientation="vertical" className="h-8" />
                            <div>
                                <p className="font-bold text-lg">{menuPlayerData.money ?? 0}</p>
                                <p className="text-xs text-muted-foreground">SOLDI</p>
                            </div>
                            <Separator orientation="vertical" className="h-8" />
                            <div>
                                <p className="font-bold text-lg">{menuPlayerData.attemptsRemaining ?? 0}</p>
                                <p className="text-xs text-muted-foreground">TENTATIVI</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        
        <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ perspective: 1000 }}
        >
            <motion.div
                className="relative w-[230px] h-[230px] border-4 border-primary/20 rounded-full"
                animate={{ rotate: rotation }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                }}
            >
                {mainMenuDestinations.map((dest, index) => {
                    const angle = (index / mainMenuDestinations.length) * 360;
                    const radiusLg = 144;
                    const isActive = index === selectedIndex;
                    
                    return (
                         <div
                            key={dest.name}
                            className="absolute top-1/2 left-1/2 -mt-6 -ml-6 pointer-events-auto"
                            style={{
                              transform: `rotate(${angle}deg) translateY(-${radiusLg}px)`,
                            }}
                        >
                           <Button
                                variant="outline"
                                size="icon"
                                className={cn(
                                    "relative w-12 h-12 rounded-full bg-background/70 backdrop-blur-sm shadow-lg transition-all"
                                )}
                                onClick={() => {
                                    if (dest.view === 'prairie') initializeBattle();
                                    else navigateTo(dest.view);
                                }}
                                disabled={isLoading}
                            >
                                <motion.div 
                                    animate={{ rotate: -rotation - angle }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 200,
                                      damping: 25
                                    }}
                                >
                                    {isLoading && isActive ? <Loader2 className="w-6 h-6 animate-spin" /> : <dest.icon className={cn("w-6 h-6", dest.color)} />}
                                </motion.div>
                            </Button>
                            <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    className="absolute -inset-2 rounded-full border-2 pointer-events-none"
                                    style={{ borderColor: dest.shadowColor }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1.2, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </motion.div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            {menuPlayerData && (
                <div
                    className="relative w-[40vw] h-[40vw] cursor-pointer pointer-events-auto"
                    onClick={() => navigateTo('sbirulino')}
                >
                    <motion.img
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                        src={menuPlayerData.spriteUrl}
                        alt={menuPlayerData.name}
                        className="object-contain w-full h-full"
                    />
                </div>
            )}
        </div>

         <div className="absolute bottom-[20vh] w-full flex items-center justify-center z-20">
             <div className="flex items-center justify-center gap-4 bg-background/50 backdrop-blur-sm rounded-full px-2 shadow-lg">
                <Button variant="default" className="w-14 h-14 rounded-full bg-transparent hover:bg-transparent text-foreground" onClick={() => handleArrowClick('left')}>
                    <ArrowLeft className="w-8 h-8" strokeWidth={2.5} />
                </Button>
                 <div className="w-52 text-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={selectedIndex}
                            className="text-2xl font-bold font-headline text-primary drop-shadow-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {mainMenuDestinations[selectedIndex].name}
                        </motion.p>
                    </AnimatePresence>
                </div>
                <Button variant="default" className="w-14 h-14 rounded-full bg-transparent hover:bg-transparent text-foreground" onClick={() => handleArrowClick('right')}>
                    <ArrowRight className="w-8 h-8" strokeWidth={2.5} />
                </Button>
            </div>
        </div>
    </div>
  );
};
