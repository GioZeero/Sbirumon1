

'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense, useTransition } from 'react';
import type { Fighter, BattleLogEntry, BattleWinner, Attack, ConsumableInventoryItem, CreatureType, AttackRarity, AnalyzedStats, Archetype, LogMessagePart } from '@/types/battle';
import { getFighterDataForBattle, updatePlayerXPAndLevel, updatePlayerPersistentInventory, transformAndSavePlayer, getPlayerProfileData, updatePlayerMoney, initializePlayerWithTrainerName, generateCreatureChoices, setPlayerCreature, markGymAsBeaten, resetPlayerRun, decrementCovoAttempt, recordSuicideAndDropItem, incrementBattlesWon, updateSteroidCountersAndApplyDebuffs, updateViandanteMaestroVisibility, setSorcererTentVisibility, setMasterSorcererTentVisibility, applyLevelUpToPlayer, evolvePlayerCreature, evolvePlayerCreatureWithDebuff, deletePlayerProfile, setArenaDisclaimerAccepted, clearDefeatedBy, markOpponentAsDefeated, getLeaderboard, incrementArenaRank, addMultipleItemsToInventory, updatePlayerAttempts } from '@/lib/fighter-repository';
import FighterCard from '@/components/battle/FighterCard';
import CombatLog from '@/components/battle/CombatLog';
import BattleResultModal from '@/components/battle/BattleResultModal';
import ActionDisplay from '@/components/battle/ActionDisplay';
import TrustLevelBar from '@/components/battle/TrustLevelBar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Loader2, Swords, Store, Package, Puzzle, Play, Pause, Undo2, UserCircle, Search, ScrollText, Home, Building2, Shield, Glasses, ArrowLeft, BrainCircuit, Coins, Sword, Sparkles, ShieldCheck, Gauge, Clover, Book, Trophy, Skull, ShoppingCart, Settings, Zap as ZapIcon, Heart, Info, Circle, Target, Flame, HandHelping, Droplets, TrendingUp, MoreHorizontal, Leaf, Sun, Moon, Feather, Bird, PersonStanding, Footprints, Wind, Waves, CircleDashed, Volume2, Mountain, Bed, Sprout, ShieldBan, Hand, Bot, Dna, Medal as MedalIcon, Bone, FlaskConical, Beaker, Eye, Wand2, StarIcon, RefreshCw, Backpack, ArrowUp, ArrowDown, ClipboardList, Briefcase, ShieldQuestion, Maximize, Landmark, Handshake, University, BookOpenCheck, ChevronLeftCircle, ArrowRight, BatteryCharging } from 'lucide-react';
import { processAttack, checkWinner, cloneFighter, cloneAttack, cloneStatusEffect, checkPreTurnStatusEffects, checkSuperEffective, checkIneffective, analyzeOpponentStats } from '@/lib/battle-logic';
import { GameBalance } from '@/config/game-balance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import PlayerStatsDisplay from '@/components/battle/PlayerStatsDisplay';
import { STATUS_EFFECTS } from '@/config/statusEffects';
import type { ConsumableItem } from '@/types/items';
import { ALL_CONSUMABLES } from '@/config/consumables';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CovoSize } from '@/config/locations';
import { CITIES, TRAINER_NAMES, COVO_CONFIG } from '@/config/locations';
import type { GymConfig } from '@/config/gyms';
import { ALL_GYMS } from '@/config/gyms';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { PackagePlus, Medal, ShieldAlert, HeartPulse, Star, type LucideIcon } from 'lucide-react';
import { getAllGameAttacks } from '@/config/fighters';
import { useConsumableOutOfBattle } from './items/consumables/actions';
import SbirulinoClientView from './sbirulino/sbirulino-view';
import { buyConsumable, sellConsumable } from './shop/consumables/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { buyMoveBook } from './shop/moves/actions';
import TrainerView from './trainer/trainer-view';
import PageTransitionWrapper from '@/components/ui/page-transition-wrapper';
import ProjectileAnimation from '@/components/battle/ProjectileAnimation';
import ScoutAnalysisDisplay from '@/components/battle/ProjectileAnimation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { LeaderboardEntry } from '@/types/leaderboard';
import BattleView from './battle/battle-view';
import { Separator } from '@/components/ui/separator';
import { motion, useMotionValue, useTransform, AnimatePresence, useAnimation, useSpring, animate } from 'framer-motion';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from "@/hooks/use-toast";

import type { View } from './views/types';
import {
  WelcomePage,
  StartScreenPage,
  CreatureSelectionPage,
  MainMenuPage,
  EvolutionMenuPage,
  CityPage,
  NobleAreaPage,
  MerchantAreaPage,
  ShopPage,
  CovoMenuPage,
  GymMenuPage,
  ArenaPage,
  ArenaLeaderboardPage,
  BlackMarketPage,
  SorcererTentPage,
  JobBoardPage,
  SbirulinoPage,
  EditSbirulinoMovesPage,
  TrainerPage,
  ItemsHubPage,
  ConsumablesPage,
  MovesPage,
  ArcanePathPage,
  SbirudexPage,
  MessagesHubPage,
  ChatPage,
} from './views';

import { hasUnreadMessages } from './messaging/actions';


type ProjectileState = {
  key: number;
  source: 'player' | 'opponent';
  target: 'player' | 'opponent';
  type: CreatureType | 'Status' | 'Physical';
  iconName: string;
  delay: number;
};

type Coords = { x: number; y: number } | null;


const AppFooter = ({ onNavigate, unreadMessages }: { onNavigate: (view: View) => void, unreadMessages: boolean }) => {
    return (
        <footer
            className="sticky bottom-0 w-full bg-background/80 backdrop-blur-sm border-t border-border shadow-t-lg z-20"
        >
            <div className="grid grid-cols-3 gap-1 p-1 max-w-md mx-auto">
                <Button variant="ghost" className="flex flex-col h-auto py-2 space-y-1" onClick={(e) => { e.stopPropagation(); onNavigate('shop_hub'); }}>
                    <Store />
                    <span className="text-xs">Negozio</span>
                </Button>
                <Button variant="ghost" className="flex flex-col h-auto py-2 space-y-1" onClick={(e) => { e.stopPropagation(); onNavigate('items_hub'); }}>
                    <Backpack />
                    <span className="text-xs">Casa</span>
                </Button>
                <Button variant="ghost" className="flex flex-col h-auto py-2 space-y-1 relative" onClick={(e) => { e.stopPropagation(); onNavigate('trainer'); }}>
                    {unreadMessages && <span className="absolute top-1 right-1/2 translate-x-4 flex h-2 w-2 rounded-full bg-destructive" />}
                    <UserCircle />
                    <span className="text-xs">Allenatore</span>
                </Button>
            </div>
        </footer>
    );
};


function SbirumonApp() {
  const [currentView, setCurrentView] = useState<View>('loading');
  const [previousView, setPreviousView] = useState<View>('main');
  const [activeTrainerName, setActiveTrainerName] = useState<string | null>(null);
  const [menuPlayerData, setMenuPlayerData] = useState<Fighter | null>(null);
  const [player, setPlayer] = useState<Fighter | null>(null);
  const [opponent, setOpponent] = useState<Fighter | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [logEntries, setLogEntries] = useState<BattleLogEntry[]>([]);
  const [winner, setWinner] = useState<BattleWinner>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionDisabled, setIsActionDisabled] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showBattle, setShowBattle] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTurnMessage, setCurrentTurnMessage] = useState<string>('');
  const [turnCount, setTurnCount] = useState(0);
  const [playerChosenAction, setPlayerChosenAction] = useState<Attack | null>(null);
  const [opponentChosenAction, setOpponentChosenAction] = useState<Attack | null>(null);
  const [isChoosingAttack, setIsChoosingAttack] = useState(false);
  const [playerExtraTurnsRemaining, setPlayerExtraTurnsRemaining] = useState(0);
  const [showScoutAnalysis, setShowScoutAnalysis] = useState(false);
  const [scoutAnalysisResult, setScoutAnalysisResult] = useState<AnalyzedStats | null>(null);
  const [showPlayerStatsDialog, setShowPlayerStatsDialog] = useState(false);
  const [showItemMenuDialog, setShowItemMenuDialog] = useState(false);
  const [showCombatLogModal, setShowCombatLogModal] = useState(false);
  const [isAttemptingEscape, setIsAttemptingEscape] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 4>(1);
  const [showSecretMenu, setShowSecretMenu] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [playerWasDefeated, setPlayerWasDefeated] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [currentCreatureChoice, setCurrentCreatureChoice] = useState<Fighter | null>(null);
  const [isChoosingCreature, setIsChoosingCreature] = useState(false);
  const [rerollCount, setRerollCount] = useState(2);
  const [randomCovoCities, setRandomCovoCities] = useState<{ small: string; medium: string; large: string } | null>(null);
  const [covoConfig, setCovoConfig] = useState<{ city: string; size: CovoSize; totalOpponents: number } | null>(null);
  const [covoProgress, setCovoProgress] = useState(0);
  const [gymConfig, setGymConfig] = useState<GymConfig | null>(null);
  const [gymProgress, setGymProgress] = useState(0);
  const [isViandanteBattle, setIsViandanteBattle] = useState(false);
  const [isArenaBattle, setIsArenaBattle] = useState(false);
  const [opponentTrainer, setOpponentTrainer] = useState<{ name: string; subtitle: string } | null>(null);
  const [inputName, setInputName] = useState('');
  const [isBattleEnding, setIsBattleEnding] = useState(false);
  const [projectileAnimations, setProjectileAnimations] = useState<ProjectileState[]>([]);
  const [playerCardCoords, setPlayerCardCoords] = useState<Coords>(null);
  const [opponentCardCoords, setOpponentCardCoords] = useState<Coords>(null);
  const [isAutoBattle, setIsAutoBattle] = useState(false);
  const [showAttackDetailsDialog, setShowAttackDetailsDialog] = useState(false);
  const [selectedAttackForDetails, setSelectedAttackForDetails] = useState<Attack | null>(null);
  const [allGameAttacks, setAllGameAttacks] = useState<Attack[]>([]);
  const [lastDroppedItem, setLastDroppedItem] = useState<ConsumableItem | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [canPlayerAct, setCanPlayerAct] = useState(true);
  const [showArenaDisclaimer, setShowArenaDisclaimer] = useState(false);
  const [showDefeatedByModal, setShowDefeatedByModal] = useState<string | null>(null);
  const [showNoOpponentFoundDialog, setShowNoOpponentFoundDialog] = useState(false);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [secretMenuClickCount, setSecretMenuClickCount] = useState(0);
  const secretClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [chargeProgress, setChargeProgress] = useState(0);
  const chargeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [unreadMessages, setUnreadMessages] = useState(false);
  const [chatTarget, setChatTarget] = useState<string | null>(null);

  const playerRef = useRef(player);
  useEffect(() => { playerRef.current = player; }, [player]);
  
  const opponentRef = useRef(opponent);
  useEffect(() => { opponentRef.current = opponent; }, [opponent]);

  const { toast } = useToast();

  const addLogEntry = useCallback((message: LogMessagePart[]) => {
    setLogEntries(prev => {
      const newLog = [{ id: crypto.randomUUID(), message, timestamp: Date.now() }, ...prev];
      return newLog.slice(0, GameBalance.MAX_LOG_ENTRIES);
    });
  }, []);

  const addMultipleLogEntries = useCallback((messages: LogMessagePart[][]) => {
    if (messages.length === 0) return;
    setLogEntries(prev => {
      const newGeneratedEntries = messages.map(msg => ({ id: crypto.randomUUID(), message: msg, timestamp: Date.now() }));
      const combined = [...newGeneratedEntries.reverse(), ...prev];
      return combined.slice(0, GameBalance.MAX_LOG_ENTRIES);
    });
  }, []);

  const endTurn = useCallback((
    updatedPlayer: Fighter,
    updatedOpponent: Fighter,
    nextTurnIsPlayers: boolean
  ) => {
      let finalPlayer = cloneFighter(updatedPlayer);
      let finalOpponent = cloneFighter(updatedOpponent);
      
      const fighterWhoseTurnEnded = nextTurnIsPlayers ? finalOpponent : finalPlayer;

      if (fighterWhoseTurnEnded.id === 'player' && !nextTurnIsPlayers) {
          if (finalPlayer.trustLevel < finalPlayer.maxTrustLevel) {
              finalPlayer.trustLevel = Math.min(finalPlayer.maxTrustLevel, finalPlayer.trustLevel + 1);
          }
      }
      
      setPlayer(finalPlayer);
      setOpponent(finalOpponent);

      if (turnCount >= GameBalance.MAX_BATTLE_TURNS && !winner) {
        addLogEntry([`Limite di ${GameBalance.MAX_BATTLE_TURNS} turni raggiunto!`]);
        if (finalPlayer.currentHealth > finalOpponent.currentHealth) {
          setWinner('player');
          addLogEntry([`${finalPlayer.name} vince per superiorità di HP!`]);
        } else {
          setWinner('opponent');
          addLogEntry([`${finalOpponent.name} vince per superiorità di HP!`]);
        }
        setIsLoading(false);
        setIsActionDisabled(true);
        return;
      }
      let gameWinner = checkWinner(finalPlayer, finalOpponent);
      if (gameWinner) {
        if (typeof gameWinner === 'string') {
          setWinner(gameWinner);
        } else if (typeof gameWinner.type === 'player_captured_opponent') {
          setWinner(gameWinner);
        }
      } else {
        if (fighterWhoseTurnEnded.id === 'player' && playerExtraTurnsRemaining > 0) {
            setPlayerExtraTurnsRemaining(prev => prev - 1);
            addLogEntry([`${fighterWhoseTurnEnded.name} ha un turno extra!`]);
            const nextAttackForExtraTurn = selectWeightedRandomAttack(finalPlayer);
            if (nextAttackForExtraTurn) setPlayerChosenAction(cloneAttack(nextAttackForExtraTurn));
            setIsPlayerTurn(true);
        } else {
            setIsPlayerTurn(nextTurnIsPlayers);
        }
        setIsLoading(false);
        setIsActionDisabled(false);
      }
  }, [turnCount, winner, addLogEntry, playerExtraTurnsRemaining]);

  const selectWeightedRandomAttack = (fighter: Fighter): Attack | null => {
    if (!fighter.attacks || fighter.attacks.length === 0) return null;
    
    const validAttacks = fighter.attacks.filter(attack => !!attack && !!attack.id && !!attack.name);
    if (validAttacks.length === 0) {
        console.error("No valid attacks found for selection.");
        if (fighter.attacks.length > 0 && fighter.attacks[0] && fighter.attacks[0].id && fighter.attacks[0].name) {
            return cloneAttack(fighter.attacks[0]);
        }
        return null;
    }

    const weights = fighter.isEvolved ? GameBalance.ATTACK_RARITY_WEIGHTS_EVOLVED : GameBalance.ATTACK_RARITY_WEIGHTS;
    const weightedPool: Attack[] = [];
    validAttacks.forEach(attack => {
        const rarity = attack.rarity || 'Common';
        const weight = (weights as Record<string, number>)[rarity.toUpperCase()] || weights.DEFAULT;
        for (let i = 0; i < weight; i++) {
            weightedPool.push(attack);
        }
    });

    if (weightedPool.length === 0) {
        return cloneAttack(validAttacks[Math.floor(Math.random() * validAttacks.length)]);
    }
    return cloneAttack(weightedPool[Math.floor(Math.random() * weightedPool.length)]);
};

  const executePlayerChosenAttack = useCallback(async (attackToExecute: Attack, attackerState?: Fighter) => {
    if ((!playerRef.current && !attackerState) || !opponentRef.current || winner || isPaused || !activeTrainerName || !canPlayerAct) {
        return;
    }
  
    setIsActionDisabled(true);
    setIsLoading(true);
    setCurrentTurnMessage(`Scelta di ${opponentRef.current.name}...`);

    let playerClone = attackerState ? cloneFighter(attackerState) : cloneFighter(playerRef.current!);
    let opponentClone = cloneFighter(opponentRef.current);

    const isHittingSelf = false;
    
    // Opponent selects move for next turn while player animation is happening
    const nextOpponentMove = selectWeightedRandomAttack(opponentClone);
    setOpponentChosenAction(nextOpponentMove);
    
    await new Promise(resolve => setTimeout(resolve, 500 / speedMultiplier));

    setCurrentTurnMessage(`${playerClone.name} usa ${attackToExecute.name}!`);
    
    setProjectileAnimations(prev => [...prev, {
        key: Date.now(),
        source: 'player',
        target: 'opponent',
        type: attackToExecute.category === 'Status' ? 'Status' : attackToExecute.creatureType,
        iconName: attackToExecute.icon || 'TrendingUp',
        delay: 0,
    }]);

    await new Promise(resolve => setTimeout(resolve, 330));
    
    const { updatedAttacker, updatedTarget, logMessages: attackLogs, damageDealt, effectApplied, attackIcon } = processAttack(
      playerClone, opponentClone, attackToExecute, isHittingSelf
    );
    
    await new Promise(resolve => setTimeout(resolve, 330));


    addMultipleLogEntries(attackLogs);
    
    setPlayerChosenAction(null);
    setTurnCount(prev => prev + 1);
    endTurn(updatedAttacker, updatedTarget, false);
  }, [addMultipleLogEntries, endTurn, activeTrainerName, canPlayerAct, addLogEntry, isPaused, winner, speedMultiplier]);

  const handleChargeAction = useCallback(async () => {
    if (!playerRef.current || !opponentRef.current || winner || isPaused || !activeTrainerName || !canPlayerAct) {
        return;
    }
    
    if (playerRef.current.trustLevel < playerRef.current.maxTrustLevel) {
        return;
    }

    setIsActionDisabled(true);
    setIsLoading(true);

    let playerClone = cloneFighter(playerRef.current);
    
    playerClone.trustLevel = 0;
    const chargeEffect = STATUS_EFFECTS['carica_buff'];
    if (chargeEffect && !playerClone.statusEffects.some(e => e.id === chargeEffect.id)) {
        playerClone.statusEffects.push(cloneStatusEffect(chargeEffect));
        addLogEntry([`${playerClone.name} si sta caricando di energia!`]);
    }
    
    setPlayerExtraTurnsRemaining(GameBalance.CHARGE_ACTION_EXTRA_TURNS_GAINED);
    
    const attackToExecute = playerChosenAction || selectWeightedRandomAttack(playerClone);

    if (attackToExecute) {
      await executePlayerChosenAttack(attackToExecute, playerClone);
    } else {
        addLogEntry([`${playerClone.name} non è riuscito a scegliere una mossa da caricare!`]);
        endTurn(playerClone, opponentRef.current, false);
    }

  }, [playerChosenAction, winner, isPaused, activeTrainerName, canPlayerAct, addLogEntry, executePlayerChosenAttack, endTurn]);
  
  const handleChargeMouseDown = () => {
    if (isActionDisabled || isPaused || !canPlayerAct || !isPlayerTurn || winner) return;

    chargeTimerRef.current = setTimeout(() => {
        handleChargeAction();
        setChargeProgress(0);
        if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    }, 1000); // 1 second hold to activate

    let progress = 0;
    chargeIntervalRef.current = setInterval(() => {
        progress += 10;
        setChargeProgress(progress);
        if (progress >= 100) {
            if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
        }
    }, 100);
  };

  const handleChargeMouseUp = () => {
      // If the timer was running for less than the hold duration, it's a "click"
      if (chargeTimerRef.current) {
        clearTimeout(chargeTimerRef.current);
        chargeTimerRef.current = null;
        if (playerChosenAction && !isActionDisabled && !isPaused && canPlayerAct && !winner && isPlayerTurn) {
            executePlayerChosenAttack(playerChosenAction);
        }
    }
    if (chargeIntervalRef.current) {
        clearInterval(chargeIntervalRef.current);
        chargeIntervalRef.current = null;
    }
    setChargeProgress(0);
  };
  
  const handleBlockAction = useCallback(() => {
    if (!playerRef.current || !opponentRef.current || winner || isPaused || !isPlayerTurn || !canPlayerAct) {
        return;
    }
    const currentPlayer = playerRef.current;
    if (currentPlayer.trustLevel < GameBalance.BLOCK_ACTION_TRUST_COST) {
        return;
    }
    
    const updatedPlayerWithTrustSpent = cloneFighter(currentPlayer);
    updatedPlayerWithTrustSpent.trustLevel -= GameBalance.BLOCK_ACTION_TRUST_COST;
    
    const newAttackToSelect = selectWeightedRandomAttack(updatedPlayerWithTrustSpent);
    if (newAttackToSelect) {
        setPlayerChosenAction(cloneAttack(newAttackToSelect));
    } else if (updatedPlayerWithTrustSpent.attacks.length > 0) {
        const fallbackAttack = cloneAttack(updatedPlayerWithTrustSpent.attacks[0]);
        setPlayerChosenAction(fallbackAttack);
    }
    
    setPlayer(updatedPlayerWithTrustSpent);
    
  }, [isPlayerTurn, canPlayerAct, isPaused, winner]);

  const handleUseConsumable = useCallback(async (itemToUse: ConsumableInventoryItem) => {
    if (!playerRef.current || !opponentRef.current || winner || !isPlayerTurn || !activeTrainerName) {
        setShowItemMenuDialog(false);
        setIsPaused(false);
        return;
    }
    
    setIsLoading(true);
    setIsActionDisabled(true);
    
    setPlayerChosenAction(null);
    setIsChoosingAttack(false);
    setCurrentTurnMessage(`${playerRef.current.name} usa ${itemToUse.item.name}...`);
    try {
        let playerClone = cloneFighter(playerRef.current);
        let opponentClone = cloneFighter(opponentRef.current);
        const itemLogs: LogMessagePart[][] = [];
        const itemEffect = itemToUse.item.effect;

        if (itemEffect.type === 'heal') {
            let healAmount = 0;
            if (itemEffect.amount) healAmount = itemEffect.amount;
            else if (itemEffect.percentage) healAmount = Math.round(playerClone.maxHealth * itemEffect.percentage);

            const healthBeforeHeal = playerClone.currentHealth;
            playerClone.currentHealth = Math.min(playerClone.maxHealth, healthBeforeHeal + healAmount);
            const actualHealedAmount = playerClone.currentHealth - healthBeforeHeal;
            if (actualHealedAmount > 0) itemLogs.push([`${playerClone.name} recupera ${actualHealedAmount} HP.`]);
            else itemLogs.push([`${playerClone.name} usa ${itemToUse.item.name}, ma la salute è già al massimo.`]);
            if (itemEffect.curesStatus && itemEffect.curesStatus.length > 0) {
                const curedStatusNames: string[] = [];
                playerClone.statusEffects = playerClone.statusEffects.filter(se => {
                    if (itemEffect.curesStatus!.includes(se.id as any)) {
                        curedStatusNames.push(STATUS_EFFECTS[se.id]?.name || se.id);
                        return false;
                    }
                    return true;
                });
                if (curedStatusNames.length > 0) itemLogs.push([`${playerClone.name} è stato curato da: ${curedStatusNames.join(', ')}.`]);
            }
        } else if (itemEffect.type === 'capture') {
            if (Math.random() < itemEffect.chance) {
                itemLogs.push([`Hai lanciato una ${itemToUse.item.name}... E hai catturato ${opponentClone.name}!`]);
                const capturedDataForTransform = cloneFighter(opponentClone);
                const newPlayerData = await transformAndSavePlayer(activeTrainerName, capturedDataForTransform);
                if (newPlayerData) {
                    playerClone = newPlayerData;
                    setWinner({ type: 'player_captured_opponent', opponentName: capturedDataForTransform.name });
                } else {
                    itemLogs.push([`Cattura riuscita ma si è verificato un errore nel salvataggio.`]);
                }
            } else {
                itemLogs.push([`${itemToUse.item.name} lanciata... Ma ${opponentClone.name} si è liberato!`]);
            }
        }
        
        const playerAfterItemUse = await updatePlayerPersistentInventory(activeTrainerName, itemToUse.item.id, -1, playerClone);
        if (!playerAfterItemUse) throw new Error("Impossibile aggiornare l'inventario.");
        
        addMultipleLogEntries(itemLogs);
        
        if (!winner) {
            setTurnCount(prev => prev + 1);
            endTurn(playerAfterItemUse, opponentClone, false);
        } else {
            setPlayer(playerAfterItemUse);
            setOpponent(opponentClone);
        }
    } catch (error) {
      console.error("Error during item use: ", error);
      if(playerRef.current && opponentRef.current) endTurn(playerRef.current, opponentRef.current, false); // Fail gracefully
    } finally {
        setShowItemMenuDialog(false);
        setIsPaused(false);
        if (!winner) {
            setIsLoading(false);
            setIsActionDisabled(false);
        }
    }
  }, [isPlayerTurn, addMultipleLogEntries, endTurn, activeTrainerName, winner]);

  const handleCloseScoutAnalysis = useCallback(() => {
    setShowScoutAnalysis(false);
    setScoutAnalysisResult(null);
    const anyOtherDialogIsOpen = showItemMenuDialog || showPlayerStatsDialog || showCombatLogModal;
    if (isPaused && !anyOtherDialogIsOpen) {
      setIsPaused(false);
    }
  }, [showItemMenuDialog, showPlayerStatsDialog, showCombatLogModal, isPaused]);

  const handleScout = useCallback(async () => {
    if (!playerRef.current || !opponentRef.current || winner) {
      return;
    }
    
    if (showScoutAnalysis) {
      handleCloseScoutAnalysis();
      return;
    }

    setIsPaused(true);
    
    try {
      if (opponentRef.current) {
        const analysis = analyzeOpponentStats(opponentRef.current);
        setScoutAnalysisResult(analysis);
        setShowScoutAnalysis(true);
      }
    } catch (error) {
      console.error("Error during scout: ", error);
      setIsPaused(false);
    }
  }, [showScoutAnalysis, handleCloseScoutAnalysis, winner]);

  const executeOpponentTurn = useCallback(async (currentOpponentInput: Fighter, currentPlayerInput: Fighter, canMove: boolean) => {
    if (winner || isPaused) {
        return;
    }

    if (!canMove) {
        endTurn(currentPlayerInput, currentOpponentInput, true);
        return;
    }

    setIsLoading(true);
    setIsActionDisabled(true);

    const chosenAttack = opponentChosenAction;
    
    if (chosenAttack) {
      setCurrentTurnMessage(`${currentOpponentInput.name} usa ${chosenAttack.name}!`);
    } else {
      setCurrentTurnMessage(`${currentOpponentInput.name} non sa cosa fare...`);
      endTurn(currentPlayerInput, currentOpponentInput, true);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 600 / speedMultiplier));
    
    if (isPaused || winner) {
      setIsLoading(false);
      return;
    }

    const isConfusedAndHittingSelf = false;
    
    setProjectileAnimations(prev => [...prev, {
        key: Date.now(),
        source: 'opponent',
        target: 'player',
        type: chosenAttack.category === 'Status' ? 'Status' : chosenAttack.creatureType,
        iconName: chosenAttack.icon || 'TrendingUp',
        delay: 0,
    }]);

    await new Promise(resolve => setTimeout(resolve, 660 / speedMultiplier));
    
    const { updatedAttacker: updatedOpponent, updatedTarget: updatedPlayer, logMessages: attackLogs } = processAttack(
        currentOpponentInput, currentPlayerInput, chosenAttack, isConfusedAndHittingSelf
    );

    addMultipleLogEntries(attackLogs);
    setTurnCount(prev => prev + 1);
    endTurn(updatedPlayer, updatedOpponent, true);
      
  }, [speedMultiplier, addMultipleLogEntries, endTurn, isPaused, winner, opponentChosenAction]);

  const handleGoToMenu = useCallback(async (targetView: View = 'main') => {
    if (covoConfig && activeTrainerName) {
      await decrementCovoAttempt(activeTrainerName, covoConfig.size);
    }
    
    await updateViandanteMaestroVisibility(activeTrainerName!);

    setShowBattle(false);
    setPlayer(null);
    setOpponent(null);
    setLogEntries([]);
    setWinner(null);
    setIsPaused(false);
    setIsLoading(false);
    setIsActionDisabled(false);
    setLastDroppedItem(null);

    setCovoConfig(null);
    setCovoProgress(0);
    setGymConfig(null);
    setGymProgress(0);
    setIsViandanteBattle(false);
    setIsArenaBattle(false);
    
    if (playerWasDefeated && activeTrainerName) {
        setPlayerWasDefeated(false);
        setIsInitializing(true);
        getPlayerProfileData(activeTrainerName).then(playerData => {
            if (playerData && playerData.attemptsRemaining !== undefined && playerData.attemptsRemaining <= 0) {
                setFinalScore(playerData.trainerRankPoints || 0);
                setShowGameOverModal(true);
                navigateTo('welcome');
            } else {
                navigateTo(targetView);
            }
            setIsInitializing(false);
        });
    } else {
        setIsInitializing(false);
        navigateTo(targetView);
    }
  }, [playerWasDefeated, covoConfig, activeTrainerName]);
  
  const initializeBattle = useCallback(async (options?: {
      isCovo?: boolean,
      covoData?: { config: NonNullable<typeof covoConfig>, progress: number, persistedPlayerState?: Fighter },
      isGym?: boolean,
      gymData?: { config: NonNullable<typeof gymConfig>, progress: number, persistedPlayerState?: Fighter },
      isViandante?: boolean,
      isArena?: boolean,
    }) => {
    
    if (!activeTrainerName) {
        navigateTo('welcome');
        return;
    }
    
    setIsLoading(true);

    try {
      // Data pre-loading stage
      const persistedPlayerState = options?.isGym ? options.gymData?.persistedPlayerState : options?.isCovo ? options.covoData?.persistedPlayerState : undefined;
      const newPlayerPromise = getFighterDataForBattle(activeTrainerName, { fighterType: 'player', persistedState: persistedPlayerState });

      let opponentLevel: number | undefined = undefined;
      let opponentType: 'covo' | 'gym' | 'prairie' | 'viandante' | 'arena' = 'prairie';
      
      // Determine opponent type and level based on options
      if (options?.isCovo && options.covoData) {
        opponentType = 'covo';
        const { config, progress } = options.covoData;
        const playerLevelForCovo = menuPlayerData?.level ?? 1;
        setOpponentTrainer({ name: TRAINER_NAMES[Math.floor(Math.random() * TRAINER_NAMES.length)], subtitle: `${progress}° Avversario` });
        opponentLevel = Math.max(1, playerLevelForCovo);
      } else if (options?.isGym && options.gymData) {
        opponentType = 'gym';
        const { config, progress } = options.gymData;
        opponentLevel = config.trainers[progress - 1]?.level;
        setOpponentTrainer({ name: TRAINER_NAMES[Math.floor(Math.random() * TRAINER_NAMES.length)], subtitle: `${progress - 1}° Allenatore` });
      } else if (options?.isViandante) {
        opponentType = 'viandante';
        const playerLevelForViandante = menuPlayerData?.level ?? 1;
        setOpponentTrainer({ name: "Viandante Maestro", subtitle: "Una sfida inaspettata" });
        opponentLevel = Math.max(1, playerLevelForViandante - 2);
      } else if (options?.isArena) {
        opponentType = 'arena';
      } else { // Prairie
        opponentType = 'prairie';
        const playerLevelForPrairie = menuPlayerData?.level ?? 1;
        setOpponentTrainer(null);
        opponentLevel = playerLevelForPrairie;
      }
      
      const newOpponentPromise = getFighterDataForBattle(activeTrainerName, { fighterType: 'opponent', fixedLevel: opponentLevel, opponentType });

      const [newPlayer, newOpponent] = await Promise.all([newPlayerPromise, newOpponentPromise]);
      
      if (!newPlayer) throw new Error("Player could not be loaded for battle");
      if (!newOpponent && opponentType === 'arena') {
          setShowNoOpponentFoundDialog(true);
          setIsLoading(false);
          return;
      }
      
      // Reset state and set data
      setLogEntries([]);
      setWinner(null);
      setIsPaused(false);
      setTurnCount(0);
      setPlayerChosenAction(null);
      setOpponentChosenAction(null);
      setIsChoosingAttack(false);
      setPlayerExtraTurnsRemaining(0);
      setShowPlayerStatsDialog(false);
      setShowItemMenuDialog(false);
      setShowCombatLogModal(false);
      setIsAttemptingEscape(false);
      setShowScoutAnalysis(false);
      setScoutAnalysisResult(null);
      setIsBattleEnding(false);
      setProjectileAnimations([]);
      setCurrentTurnMessage('Preparazione alla battaglia...');
      setIsActionDisabled(false);
      setLastDroppedItem(null);
      setIsViandanteBattle(!!options?.isViandante);
      setIsArenaBattle(!!options?.isArena);

      newPlayer.trainerName = activeTrainerName;
      setPlayer(newPlayer);
      setOpponent(newOpponent);

      if (opponentType === 'arena' && newOpponent) {
        setOpponentTrainer({ name: newOpponent.trainerName!, subtitle: "Sfidante dell'Arena" });
      }

      setIsPlayerTurn(newPlayer.currentSpeedStat >= (newOpponent?.currentSpeedStat ?? 0));
      
      // Transition to battle view
      setShowBattle(true);
      setIsInitializing(false);

    } catch (error) {
      console.error("Failed to initialize battle:", error);
      setShowBattle(false);
      setIsInitializing(false);
    } finally {
        setIsLoading(false);
    }
  }, [activeTrainerName, menuPlayerData]);

  const handleEscapeAttempt = useCallback(async () => {
      if (!playerRef.current || winner || isPaused || !isPlayerTurn || !canPlayerAct || isArenaBattle) {
          return;
      }
      setIsAttemptingEscape(true);
      setIsLoading(true);
      setIsActionDisabled(true);
      
      setPlayerChosenAction(null);
      setIsChoosingAttack(false);
      setCurrentTurnMessage('Tentativo di fuga in corso...');
      await new Promise(resolve => setTimeout(resolve, 1500 / speedMultiplier));
      const escapeChance = playerRef.current ? Math.max(0, Math.min(1, (playerRef.current.currentSpeedStat / 2) / 100.0)) : 0;
      if (Math.random() < escapeChance) {
          addLogEntry([`${playerRef.current.name} è fuggito con successo!`]);
          handleGoToMenu();
      } else {
          addLogEntry([`${playerRef.current.name} ha tentato la fuga, ma non c'è riuscito!`]);
          setIsAttemptingEscape(false);
          if (playerRef.current && opponentRef.current) {
              endTurn(playerRef.current, opponentRef.current, false);
          } else {
              setIsLoading(false);
              setIsActionDisabled(false);
          }
      }
  }, [isPlayerTurn, canPlayerAct, speedMultiplier, addLogEntry, handleGoToMenu, endTurn, isArenaBattle, isPaused, winner]);

  const handlePistolaAction = useCallback(async () => {
    if (!playerRef.current || winner || isBattleEnding || !activeTrainerName) return;
    setIsBattleEnding(true);
    const { updatedPlayer, droppedItem } = await recordSuicideAndDropItem(activeTrainerName, playerRef.current);
    addLogEntry([`${updatedPlayer.name} ha usato la Pistola!`]);
    setLastDroppedItem(droppedItem);
    setPlayer({ ...updatedPlayer, currentHealth: 0 });
    setWinner('opponent');
  }, [addLogEntry, isBattleEnding, activeTrainerName, winner]);

  const fetchMenuPlayerData = useCallback(async (trainerNameToFetch: string) => {
    if (!trainerNameToFetch) return null;
    const data = await getPlayerProfileData(trainerNameToFetch);
    setMenuPlayerData(data);
     if (data) {
        const board = await getLeaderboard();
        const rank = board.findIndex(entry => entry.trainerName === data.trainerName);
        setLeaderboardRank(rank !== -1 ? rank + 1 : null);
    }
    return data;
  }, []);

  const navigateTo = (view: View, data?: any) => {
    setIsLoading(true);
    setTimeout(() => {
        if (view === 'chat' && data?.recipient) {
          setChatTarget(data.recipient);
        } else {
          setChatTarget(null);
        }
        if (currentView !== view) {
            setPreviousView(currentView);
        }
        setCurrentView(view);
        setIsLoading(false);
    }, 150); // Short delay to allow loader to show and assets to potentially load
  };
  
  useEffect(() => {
    const startup = async () => {
        setIsInitializing(true);
        setAllGameAttacks(getAllGameAttacks());

        const savedTrainerName = localStorage.getItem('sbirumon-trainer');
        if (savedTrainerName) {
            const data = await fetchMenuPlayerData(savedTrainerName);
            if (data && data.name) {
                setActiveTrainerName(savedTrainerName);
                setMenuPlayerData(data);
                localStorage.setItem('sbirumon-trainer', savedTrainerName);
                navigateTo('start_screen');
            } else {
                 localStorage.removeItem('sbirumon-trainer');
                 setCurrentView('welcome');
            }
        } else {
            setCurrentView('welcome');
        }

        setIsInitializing(false);
    };
    
    startup();
  }, [fetchMenuPlayerData]);

  const handleGenerateCreature = useCallback(async () => {
    setIsChoosingCreature(true);
    try {
        const choices = await generateCreatureChoices(1);
        if (choices.length > 0) {
            setCurrentCreatureChoice(choices[0]);
        }
    } catch (err) {
        console.error("Failed to generate creature choices:", err);
    } finally {
        setIsChoosingCreature(false);
    }
  }, []);
  
  useEffect(() => {
    if (currentView === 'creature_selection') {
      handleGenerateCreature();
    }
  }, [currentView, handleGenerateCreature]);


  const handleReroll = () => {
    if (rerollCount > 0) {
        setRerollCount(prev => prev - 1);
        handleGenerateCreature();
    }
  };

  const handleRequestFullscreen = () => {
    const element = document.documentElement;
    if (!document.fullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleWelcomeSubmit = async () => {
    const trimmedName = inputName.trim();
    if (trimmedName.length > 2) {
        handleRequestFullscreen();
        setIsInitializing(true);
        const existingPlayer = await getPlayerProfileData(trimmedName);
        if (existingPlayer && existingPlayer.name) {
            setActiveTrainerName(trimmedName);
            setMenuPlayerData(existingPlayer);
            localStorage.setItem('sbirumon-trainer', trimmedName);
            navigateTo('start_screen');
        } else {
            const newPlayer = await initializePlayerWithTrainerName(trimmedName);
            if (newPlayer) {
                setActiveTrainerName(trimmedName);
                setMenuPlayerData(newPlayer);
                localStorage.setItem('sbirumon-trainer', trimmedName);
                navigateTo('creature_selection');
            }
        }
        setIsInitializing(false);
    }
  };
  
  const handleStartGame = () => {
    handleRequestFullscreen();
    navigateTo('main');
  };

  const handleCreatureSelect = async (creature: Fighter) => {
    if (!activeTrainerName) return;
    setIsChoosingCreature(true);
    try {
      const newPlayer = await setPlayerCreature(activeTrainerName, creature);
      if (newPlayer) {
        setMenuPlayerData(newPlayer);
        navigateTo('main');
      }
    } catch (error) {
      console.error("Failed to set player creature:", error);
    } finally {
      setIsChoosingCreature(false);
    }
  };

  useEffect(() => {
    if (!showBattle || isInitializing || winner || isPaused || isBattleEnding) {
      return;
    }

    const currentFighter = isPlayerTurn ? playerRef.current : opponentRef.current;
    const otherFighter = isPlayerTurn ? opponentRef.current : playerRef.current;

    if (!currentFighter || !otherFighter) return;

    let timeoutId: NodeJS.Timeout;

    // Apply pre-turn effects
    const { canMove, isConfused, logMessages, updatedFighter } = checkPreTurnStatusEffects(currentFighter);
    if(logMessages.length > 0) addMultipleLogEntries(logMessages);

    const gameWinner = checkWinner(isPlayerTurn ? updatedFighter : otherFighter, isPlayerTurn ? otherFighter : updatedFighter);
    if(gameWinner) {
      setPlayer(isPlayerTurn ? updatedFighter : otherFighter);
      setOpponent(isPlayerTurn ? otherFighter : updatedFighter);
      setWinner(gameWinner);
      return;
    }

    if(isPlayerTurn) {
        setPlayer(updatedFighter);
        setCanPlayerAct(canMove);
        if (!canMove) {
            timeoutId = setTimeout(() => endTurn(updatedFighter, otherFighter, false), 500 / speedMultiplier);
        } else if (!playerChosenAction) {
            const autoSelectedAttack = selectWeightedRandomAttack(updatedFighter);
            if (autoSelectedAttack) setPlayerChosenAction(cloneAttack(autoSelectedAttack));
        } else if (isAutoBattle) {
            timeoutId = setTimeout(() => {
                if (playerChosenAction && !isPaused && !winner && isPlayerTurn) {
                    executePlayerChosenAttack(playerChosenAction);
                }
            }, GameBalance.PLAYER_AUTO_ATTACK_DELAY_MS / speedMultiplier);
        }
    } else { // Opponent's turn
        setOpponent(updatedFighter);
        timeoutId = setTimeout(() => {
            if (!isPaused && !winner) {
                executeOpponentTurn(updatedFighter, otherFighter, canMove);
            }
        }, GameBalance.OPPONENT_TURN_DELAY_MS / speedMultiplier);
    }
     return () => clearTimeout(timeoutId);
  }, [isPlayerTurn, showBattle, isInitializing, winner, isPaused, isBattleEnding, playerChosenAction, isAutoBattle, addMultipleLogEntries, endTurn, executePlayerChosenAttack, speedMultiplier, turnCount]);

  useEffect(() => {
    if (winner && !isBattleEnding) {
        setIsBattleEnding(true);
        const playerStateBeforeWin = playerRef.current; // Capture state before async operations

        const handleWin = async () => {
            if (!playerStateBeforeWin || !opponentRef.current || !activeTrainerName) return;
            
            const xpGained = opponentRef.current.maxHealth;
            
            let playerAfterXP = await updatePlayerXPAndLevel(activeTrainerName, xpGained, playerStateBeforeWin);
            if(playerAfterXP) {
                playerAfterXP.trustLevel = playerStateBeforeWin.trustLevel;
                addLogEntry([`${playerAfterXP.name} ha guadagnato ${xpGained} XP!`]);
                if (playerAfterXP.level > (playerStateBeforeWin?.level || 0)) {
                    addLogEntry([`${playerAfterXP.name} è salito al livello ${playerAfterXP.level}!`]);
                }
            }

            const playerAfterWinCount = await incrementBattlesWon(activeTrainerName, covoConfig?.size);
            if (playerAfterWinCount) {
              if (playerAfterXP) {
                playerAfterWinCount.trustLevel = playerAfterXP.trustLevel;
              }
              playerAfterXP = playerAfterWinCount;
            }
                
            let finalPlayerState: Fighter | null = playerAfterXP;

            if (isArenaBattle && opponentRef.current.trainerName) {
                await markOpponentAsDefeated(opponentRef.current.trainerName, activeTrainerName);
                addLogEntry([`L'allenatore ${opponentRef.current.trainerName} è stato sconfitto!`]);
                const playerAfterRank = await incrementArenaRank(activeTrainerName);
                if (playerAfterRank) {
                    if (finalPlayerState) playerAfterRank.trustLevel = finalPlayerState.trustLevel;
                    finalPlayerState = playerAfterRank;
                    addLogEntry([`Hai guadagnato 1 punto classifica e 1000 monete!`]);
                }
            }

            if (covoConfig) {
                const battleReward = 5;
                addLogEntry([`Hai guadagnato ${battleReward} monete per questa vittoria!`]);
                const playerAfterMoney = await updatePlayerMoney(activeTrainerName, battleReward);
                    if (playerAfterMoney) {
                      if (finalPlayerState) playerAfterMoney.trustLevel = finalPlayerState.trustLevel;
                      finalPlayerState = playerAfterMoney;
                    }
            }
            
            if (covoConfig && covoProgress >= covoConfig.totalOpponents) {
                const finalReward = COVO_CONFIG[covoConfig.size].reward;
                addLogEntry([`Hai guadagnato un bonus di ${finalReward} monete per aver completato il Covo!`]);
                const playerAfterBonus = await updatePlayerMoney(activeTrainerName, finalReward);
                if (playerAfterBonus) {
                  if (finalPlayerState) playerAfterBonus.trustLevel = finalPlayerState.trustLevel;
                  finalPlayerState = playerAfterBonus;
                }
            }

            if (gymConfig && gymProgress >= gymConfig.trainers.length) {
                addLogEntry([`Hai guadagnato ${gymConfig.reward} monete per aver completato la palestra!`]);
                const playerAfterGym = await markGymAsBeaten(activeTrainerName, gymConfig.gymId);
                if (playerAfterGym) {
                  if (finalPlayerState) playerAfterGym.trustLevel = finalPlayerState.trustLevel;
                  finalPlayerState = playerAfterGym;
                }
            }

            const { player: playerAfterSteroids, debuffLogs } = await updateSteroidCountersAndApplyDebuffs(activeTrainerName);
            if (playerAfterSteroids) {
              if (finalPlayerState) playerAfterSteroids.trustLevel = finalPlayerState.trustLevel;
              finalPlayerState = playerAfterSteroids;
              if (debuffLogs.length > 0) {
                addMultipleLogEntries(debuffLogs.map(log => [log]));
              }
            }
            
            if (finalPlayerState) {
                setPlayer(finalPlayerState);
                setMenuPlayerData(finalPlayerState);
            }
        };

        if (winner === 'player') {
            handleWin();
        } else if (winner === 'opponent') {
            const defeatedPlayerName = playerStateBeforeWin?.name || 'Il tuo Sbirulino';
            addLogEntry([`${defeatedPlayerName} è stato sconfitto!`]);
            setPlayerWasDefeated(true);
        } else if (winner && typeof winner === 'object' && winner.type === 'player_captured_opponent' && activeTrainerName) {
            getPlayerProfileData(activeTrainerName).then(newPlayerData => {
                if (newPlayerData) {
                   setPlayer(newPlayerData);
                   setMenuPlayerData(newPlayerData);
                }
            });
        }
    }
  }, [winner, covoConfig, covoProgress, gymConfig, gymProgress, isBattleEnding, addLogEntry, addMultipleLogEntries, activeTrainerName, isArenaBattle]);

  const handleStartCovoChallenge = (city: string, size: CovoSize) => {
    const newConfig = { city: city, size: size, totalOpponents: COVO_CONFIG[size].opponents };
    setCovoConfig(newConfig);
    setCovoProgress(1);
    initializeBattle({ isCovo: true, covoData: { config: newConfig, progress: 1 } });
  };

  const handleNextCovoOpponent = async () => {
    if (!covoConfig || !playerRef.current) return;
    const newProgress = covoProgress + 1;
    const playerSnapshot = cloneFighter(playerRef.current);
    setCovoProgress(newProgress);
    setIsInitializing(true); // Show loader while preparing next opponent
    
    // Explicitly call to get the next opponent to ensure it's ready
    await getFighterDataForBattle(activeTrainerName!, {
      fighterType: 'opponent',
      fixedLevel: playerSnapshot.level,
      opponentType: 'covo'
    });
    
    // A short delay to make the transition feel more deliberate
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    initializeBattle({ 
        isCovo: true, 
        covoData: { 
            config: covoConfig, 
            progress: newProgress, 
            persistedPlayerState: playerSnapshot 
        } 
    });
  };

  const handleStartGymChallenge = (gymId: number) => {
    const gym = ALL_GYMS.find(gym => gym.gymId === gymId);
    if (gym) {
        setGymConfig(gym);
        setGymProgress(1);
        initializeBattle({ isGym: true, gymData: { config: gym, progress: 1 } });
    }
  };

  const handleNextGymTrainer = () => {
    if (!gymConfig || !playerRef.current) return;
    const newProgress = gymProgress + 1;
    const playerSnapshot = cloneFighter(playerRef.current);
    setGymProgress(newProgress);
    initializeBattle({ isGym: true, gymData: { config: gymConfig, progress: newProgress, persistedPlayerState: playerSnapshot } });
  };

  const handleStartViandanteMaestroBattle = () => {
    initializeBattle({ isViandante: true });
  };

  const handleStartArenaBattle = () => {
    if (menuPlayerData?.arenaDisclaimerAccepted) {
      initializeBattle({ isArena: true });
    } else {
      setShowArenaDisclaimer(true);
    }
  };

  const handleAcceptArenaDisclaimer = async () => {
    setShowArenaDisclaimer(false);
    if (activeTrainerName) {
      const updatedPlayer = await setArenaDisclaimerAccepted(activeTrainerName);
      setMenuPlayerData(updatedPlayer);
      initializeBattle({ isArena: true });
    }
  };

  const handleAcceptUniqueCreature = async (creature: Fighter) => {
    if (!activeTrainerName) return;
    const newPlayer = await transformAndSavePlayer(activeTrainerName, creature);
    if (newPlayer) {
        setMenuPlayerData(newPlayer);
        setPlayer(newPlayer);
        handleGoToMenu('sbirulino');
    }
  };
  
  const handleEvolveCreature = async () => {
    if (!activeTrainerName) return;
    const newPlayer = await evolvePlayerCreature(activeTrainerName);
    if(newPlayer) {
        setMenuPlayerData(newPlayer);
    }
    navigateTo('sbirulino');
  };

  const handleToggleOptions = () => {
    if (winner || isInitializing) return;
    const newOptionsState = !showOptionsMenu;
    setShowOptionsMenu(newOptionsState);
    setIsPaused(newOptionsState);
  };

  const handleTogglePlayerStats = () => {
    if (winner || isInitializing) return;
    const isOpening = !showPlayerStatsDialog;
    setShowPlayerStatsDialog(isOpening);
    setIsPaused(isOpening);
  }

  const handleToggleItemMenu = () => {
      if (winner || isInitializing || (!isPlayerTurn && !canPlayerAct)) return;
      const isOpening = !showItemMenuDialog;
      setShowItemMenuDialog(isOpening);
      setIsPaused(isOpening);
  }

  useEffect(() => {
    if (currentView === 'covo_menu' && !randomCovoCities) {
      const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      setRandomCovoCities({
        small: pickRandom(CITIES.small),
        medium: pickRandom(CITIES.medium),
        large: pickRandom(CITIES.large),
      });
    }
  }, [currentView, randomCovoCities]);

  useEffect(() => {
    const checkMessages = async () => {
      if (activeTrainerName) {
        const unread = await hasUnreadMessages(activeTrainerName);
        setUnreadMessages(unread);
      }
    };
    checkMessages();
    const interval = setInterval(checkMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [activeTrainerName]);

  const handleAttackClickInLog = (attackId: string) => {
    const attack = allGameAttacks.find(a => a.id === attackId);
    if (attack) {
      setSelectedAttackForDetails(attack);
      setShowAttackDetailsDialog(true);
      if(!isPaused) setIsPaused(true);
    }
  };

  const handleCloseAttackDetailsDialog = () => {
    setShowAttackDetailsDialog(false);
    setSelectedAttackForDetails(null);
     const anyOtherDialogIsOpen = showItemMenuDialog || showPlayerStatsDialog || showCombatLogModal || showScoutAnalysis;
    if (isPaused && !anyOtherDialogIsOpen) {
      setIsPaused(false);
    }
  };

  const handleResetProfile = async () => {
    if (!activeTrainerName) return;
    const result = await deletePlayerProfile(activeTrainerName);
    if (result.success) {
      localStorage.removeItem('sbirumon-trainer');
      setActiveTrainerName(null);
      setMenuPlayerData(null);
      navigateTo('welcome');
    } else {
      console.error("Failed to reset profile.");
      // Optionally show a toast error
    }
  };

  const handleDefeatedByClose = async () => {
    if (activeTrainerName) {
        await clearDefeatedBy(activeTrainerName);
    }
    setShowDefeatedByModal(null);
    navigateTo('creature_selection');
  };
  
  const backgroundClass = () => {
    if (showBattle) {
       return covoConfig ? 'bg-covo' : gymConfig ? 'bg-gym-combat' : isArenaBattle ? 'bg-gym-combat' : 'bg-prateria';
    }
    switch(currentView) {
        case 'city':
        case 'noble_area':
        case 'merchant_area':
        case 'arcane_path':
            return 'bg-city';
        case 'shop_hub': return 'bg-shop-hub';
        case 'items_moves_edit':
        case 'sbirulino':
        case 'trainer': return 'bg-home-menu';
        case 'gym_menu': return 'bg-gym-menu';
        case 'covo_menu': return 'bg-covo';
        case 'creature_selection': return 'bg-prateria';
        case 'main':
        case 'start_screen': return 'bg-main-menu';
        case 'black_market': return 'bg-covo';
        case 'sorcerer_tent': return 'bg-sorcerer';
        case 'master_sorcerer': return 'bg-sorcerer';
        case 'evolution_menu': return 'bg-main-menu';
        case 'job_board': return 'bg-city';
        case 'arena':
        case 'arena_leaderboard':
            return 'bg-gym-menu';
        case 'items_hub':
        case 'items_consumables':
        case 'items_moves':
        case 'sbirudex':
        case 'messages_hub':
        case 'chat':
            return 'bg-storage';
        case 'loading':
        case 'welcome':
        default: return '';
    }
  };
  
  const footerViews: View[] = [
    'main', 'city', 'noble_area', 'merchant_area', 'shop_hub', 'items_hub',
    'covo_menu', 'gym_menu', 'arena', 'arena_leaderboard', 'job_board', 'black_market',
    'sorcerer_tent', 'master_sorcerer', 'arcane_path'
  ];

  const handleSecretMenuClick = () => {
    if (secretClickTimeoutRef.current) {
        clearTimeout(secretClickTimeoutRef.current);
    }

    const newCount = secretMenuClickCount + 1;
    setSecretMenuClickCount(newCount);

    if (newCount >= 5) {
        setShowSecretMenu(true);
        setSecretMenuClickCount(0); // Reset after opening
    } else {
        // Reset count if the next click isn't within a short time (e.g., 1 second)
        secretClickTimeoutRef.current = setTimeout(() => {
            setSecretMenuClickCount(0);
        }, 1000);
    }
  };

  const handleSecretCode = async () => {
      if (!activeTrainerName) return;
      let updatedPlayer: Fighter | null = null;
      let toastMessage: { title: string; description?: string } | null = null;
      const lowerCaseCode = secretCode.toLowerCase();

      if (lowerCaseCode.startsWith('tentativi ')) {
          const parts = secretCode.split(' ');
          if (parts.length === 2 && !isNaN(parseInt(parts[1], 10))) {
              const newAttempts = parseInt(parts[1], 10);
              if (newAttempts >= 0) {
                  updatedPlayer = await updatePlayerAttempts(activeTrainerName, newAttempts);
                  if (updatedPlayer) toastMessage = { title: "Codice Attivato!", description: `Numero di tentativi impostato a ${newAttempts}.` };
              } else {
                  toast({ title: "Numero non valido", description: "Il numero di tentativi deve essere positivo.", variant: "destructive" });
              }
          } else {
              toast({ title: "Codice non valido", description: "Formato corretto: tentativi [numero]", variant: "destructive" });
          }
      } else {
          switch (lowerCaseCode) {
              case 'stregone':
                  updatedPlayer = await setSorcererTentVisibility(activeTrainerName, true);
                  if (updatedPlayer) toastMessage = { title: "Codice Attivato!", description: "La tenda dello Stregone è ora visibile." };
                  break;
              case 'granstregone':
                  updatedPlayer = await setMasterSorcererTentVisibility(activeTrainerName, true);
                  if (updatedPlayer) toastMessage = { title: "Codice Attivato!", description: "La tenda del Maestro Stregone è ora visibile." };
                  break;
              case 'viandante':
                  updatedPlayer = await updateViandanteMaestroVisibility(activeTrainerName, true);
                  if (updatedPlayer) toastMessage = { title: "Codice Attivato!", description: "Il Viandante Maestro è apparso..." };
                  break;
              case 'infinite':
                  await updatePlayerMoney(activeTrainerName, 10000);
                  updatedPlayer = await addMultipleItemsToInventory(activeTrainerName, 10);
                  if (updatedPlayer) toastMessage = { title: "Codice Attivato!", description: "Hai ricevuto 10.000 monete e 10 di ogni consumabile." };
                  break;
              default:
                  toast({ title: "Codice non valido", variant: "destructive" });
                  break;
          }
      }

      if (updatedPlayer) {
          setMenuPlayerData(updatedPlayer);
          if (toastMessage) {
            toast(toastMessage);
          }
      }
      setShowSecretMenu(false);
      setSecretCode('');
  };


  const showFooter = footerViews.includes(currentView) && !showBattle;

  const menuViews: Record<View, React.ReactNode> = {
    loading: <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>,
    welcome: <WelcomePage
        onWelcomeSubmit={handleWelcomeSubmit}
        inputName={inputName}
        setInputName={setInputName}
        showDefeatedByModal={showDefeatedByModal}
        handleDefeatedByClose={handleDefeatedByClose}
      />,
    start_screen: <StartScreenPage onStartGame={handleStartGame} />,
    creature_selection: <CreatureSelectionPage
      isChoosingCreature={isChoosingCreature}
      currentCreatureChoice={currentCreatureChoice}
      handleCreatureSelect={handleCreatureSelect}
      />,
    main: <MainMenuPage
        menuPlayerData={menuPlayerData}
        leaderboardRank={leaderboardRank}
        initializeBattle={initializeBattle}
        navigateTo={navigateTo}
        onSecretClick={handleSecretMenuClick}
        isLoading={isLoading}
      />,
    evolution_menu: <EvolutionMenuPage
        menuPlayerData={menuPlayerData}
        handleEvolveCreature={handleEvolveCreature}
        navigateTo={navigateTo}
      />,
    city: <CityPage onNavigate={navigateTo} />,
    covo_menu: <CovoMenuPage
        randomCovoCities={randomCovoCities}
        menuPlayerData={menuPlayerData}
        handleStartCovoChallenge={handleStartCovoChallenge}
        navigateTo={navigateTo}
      />,
    gym_menu: <GymMenuPage
        menuPlayerData={menuPlayerData}
        handleStartGymChallenge={handleStartGymChallenge}
        navigateTo={navigateTo}
      />,
    arena: <ArenaPage
        navigateTo={navigateTo}
        handleStartArenaBattle={handleStartArenaBattle}
        isInitializing={isInitializing}
        menuPlayerData={menuPlayerData}
        showArenaDisclaimer={showArenaDisclaimer}
        setShowArenaDisclaimer={setShowArenaDisclaimer}
        handleAcceptArenaDisclaimer={handleAcceptArenaDisclaimer}
        showNoOpponentFoundDialog={showNoOpponentFoundDialog}
        setShowNoOpponentFoundDialog={setShowNoOpponentFoundDialog}
      />,
    arena_leaderboard: <ArenaLeaderboardPage onNavigate={navigateTo} />,
    noble_area: <NobleAreaPage onNavigate={navigateTo} menuPlayerData={menuPlayerData} />,
    merchant_area: <MerchantAreaPage onNavigate={navigateTo} menuPlayerData={menuPlayerData} />,
    arcane_path: <ArcanePathPage onNavigate={navigateTo} menuPlayerData={menuPlayerData} startViandanteMaestroBattle={handleStartViandanteMaestroBattle}/>,
    shop_hub: <ShopPage onNavigate={navigateTo} trainerName={activeTrainerName!} menuPlayerData={menuPlayerData} />,
    items_hub: <ItemsHubPage onNavigate={navigateTo} menuPlayerData={menuPlayerData} />,
    items_moves_edit: <EditSbirulinoMovesPage onNavigate={navigateTo} trainerName={activeTrainerName!} menuPlayerData={menuPlayerData} allGameAttacks={allGameAttacks} />,
    items_consumables: <ConsumablesPage onNavigate={navigateTo} trainerName={activeTrainerName!} />,
    items_moves: <MovesPage onNavigate={navigateTo} trainerName={activeTrainerName!} />,
    sbirulino: <SbirulinoPage onNavigate={navigateTo} trainerName={activeTrainerName!} previousView={previousView} menuPlayerData={menuPlayerData} allGameAttacks={allGameAttacks} />,
    trainer: <TrainerPage onNavigate={navigateTo} trainerName={activeTrainerName!} onResetProfile={handleResetProfile} handleRequestFullscreen={handleRequestFullscreen} previousView={previousView} menuPlayerData={menuPlayerData} hasUnreadMessages={unreadMessages} />,
    black_market: <BlackMarketPage onNavigate={navigateTo} trainerName={activeTrainerName!} menuPlayerData={menuPlayerData} />,
    sorcerer_tent: <SorcererTentPage onNavigate={navigateTo} isMaster={false} trainerName={activeTrainerName!} menuPlayerData={menuPlayerData} />,
    master_sorcerer: <SorcererTentPage onNavigate={navigateTo} isMaster={true} trainerName={activeTrainerName!} menuPlayerData={menuPlayerData} />,
    job_board: <JobBoardPage onNavigate={navigateTo} trainerName={activeTrainerName!} menuPlayerData={menuPlayerData}/>,
    sbirudex: <SbirudexPage onNavigate={navigateTo} trainerName={activeTrainerName!} menuPlayerData={menuPlayerData} />,
    messages_hub: <MessagesHubPage onNavigate={navigateTo} trainerName={activeTrainerName!} />,
    chat: <ChatPage onNavigate={navigateTo} trainerName={activeTrainerName!} recipientName={chatTarget!} />,
    battle: <></>
  };

  const currentViewContent = isLoading ? menuViews['loading'] : menuViews[currentView] ?? menuViews['loading'];
  
  const mainAppContainerClass = cn(
    "min-h-screen bg-cover bg-center",
     backgroundClass()
  );

  return (
    <div className={mainAppContainerClass}>
          <div className="relative z-10">
            <PageTransitionWrapper transitionKey={currentView}>
              <div className="min-h-screen flex flex-col">
                  <main className="flex-grow">
                      {showBattle ? (
                        <BattleView
                          isInitializing={isInitializing}
                          isLoading={isLoading}
                          player={player}
                          opponent={opponent}
                          winner={winner}
                          handleGoToMenu={handleGoToMenu}
                          playerChosenAction={playerChosenAction}
                          opponentChosenAction={opponentChosenAction}
                          isPlayerTurn={isPlayerTurn}
                          isPaused={isPaused}
                          setIsPaused={setIsPaused}
                          isConfirmDisabled={isActionDisabled || isPaused || !canPlayerAct || !isPlayerTurn}
                          canPlayerAct={canPlayerAct}
                          covoConfig={covoConfig}
                          covoProgress={covoProgress}
                          gymConfig={gymConfig}
                          gymProgress={gymProgress}
                          isArenaBattle={isArenaBattle}
                          currentTurnMessage={currentTurnMessage}
                          handleCloseScoutAnalysis={handleCloseScoutAnalysis}
                          showScoutAnalysis={showScoutAnalysis}
                          scoutAnalysisResult={scoutAnalysisResult}
                          setOpponentCardCoords={setOpponentCardCoords}
                          setPlayerCardCoords={setPlayerCardCoords}
                          executePlayerChosenAttack={executePlayerChosenAttack}
                          handleBlockAction={handleBlockAction}
                          handleChargeAction={handleChargeAction}
                          handleEscapeAttempt={handleEscapeAttempt}
                          handleToggleItemMenu={handleToggleItemMenu}
                          handleTogglePlayerStats={handleTogglePlayerStats}
                          handleScout={handleScout}
                          projectileAnimations={projectileAnimations}
                          setProjectileAnimations={setProjectileAnimations}
                          playerCardCoords={playerCardCoords}
                          opponentCardCoords={opponentCardCoords}
                          logEntries={logEntries}
                          handleAcceptUniqueCreature={handleAcceptUniqueCreature}
                          isCovoBattle={!!covoConfig}
                          onNextCovoOpponent={handleNextCovoOpponent}
                          isGymBattle={!!gymConfig}
                          onNextGymTrainer={handleNextGymTrainer}
                          handleAttackClickInLog={handleAttackClickInLog}
                          lastDroppedItem={lastDroppedItem}
                          isViandanteBattle={isViandanteBattle}
                          showPlayerStatsDialog={showPlayerStatsDialog}
                          setShowPlayerStatsDialog={setShowPlayerStatsDialog}
                          showItemMenuDialog={showItemMenuDialog}
                          setShowItemMenuDialog={setShowItemMenuDialog}
                          showCombatLogModal={showCombatLogModal}
                          setShowCombatLogModal={setShowCombatLogModal}
                          handleUseConsumable={handleUseConsumable}
                          showOptionsMenu={showOptionsMenu}
                          handleToggleOptions={handleToggleOptions}
                          isAutoBattle={isAutoBattle}
                          handleAutoBattleToggle={() => setIsAutoBattle(prev => !prev)}
                          speedMultiplier={speedMultiplier}
                          handleSpeedToggle={() => setSpeedMultiplier(current => current === 4 ? 1 : current * 2)}
                          turnCount={turnCount}
                          handlePistolaAction={handlePistolaAction}
                          isBattleEnding={isBattleEnding}
                          showGameOverModal={showGameOverModal}
                          setShowGameOverModal={setShowGameOverModal}
                          finalScore={finalScore}
                          activeTrainerName={activeTrainerName}
                          resetPlayerRun={resetPlayerRun}
                          navigateTo={navigateTo}
                          showAttackDetailsDialog={showAttackDetailsDialog}
                          handleCloseAttackDetailsDialog={handleCloseAttackDetailsDialog}
                          selectedAttackForDetails={selectedAttackForDetails}
                          onRematch={() => initializeBattle()}
                          opponentTrainer={opponentTrainer}
                          chargeProgress={chargeProgress}
                          handleChargeMouseDown={handleChargeMouseDown}
                          handleChargeMouseUp={handleChargeMouseUp}
                        />
                      ) : currentViewContent}
                  </main>
                  {showFooter && <AppFooter onNavigate={navigateTo} unreadMessages={unreadMessages}/>}
              </div>
            </PageTransitionWrapper>
          </div>
        <Dialog open={showSecretMenu} onOpenChange={setShowSecretMenu}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Menu Segreto</DialogTitle>
                    <DialogDescription>
                        Inserisci un codice segreto per sbloccare funzionalità nascoste.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        placeholder="Codice Segreto" 
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSecretCode()}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleSecretCode}>Conferma</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SbirumonApp />
    </Suspense>
  )
}

    

    




