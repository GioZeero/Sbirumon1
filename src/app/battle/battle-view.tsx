

'use client';

import React, { useState, useRef } from 'react';
import type { Fighter, BattleLogEntry, BattleWinner, Attack, ConsumableInventoryItem, CreatureType, AttackRarity, AnalyzedStats, Archetype, LogMessagePart } from '@/types/battle';
import FighterCard from '@/components/battle/FighterCard';
import CombatLog from '@/components/battle/CombatLog';
import BattleResultModal from '@/components/battle/BattleResultModal';
import ActionDisplay from '@/components/battle/ActionDisplay';
import TrustLevelBar from '@/components/battle/TrustLevelBar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Loader2, Swords, Undo2, UserCircle, Search, ScrollText, Settings, Sword, ShieldBan, MoreHorizontal, Package, Skull } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PlayerStatsDisplay from '@/components/battle/PlayerStatsDisplay';
import ProjectileAnimation from '@/components/battle/ProjectileAnimation';
import ScoutAnalysisDisplay from '@/components/battle/ScoutAnalysisDisplay';
import { cn } from '@/lib/utils';
import { checkSuperEffective, checkIneffective } from '@/lib/battle-logic';
import type { ConsumableItem } from '@/types/items';
import type { GymConfig } from '@/config/gyms';
import type { CovoSize } from '@/config/locations';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { STATUS_EFFECTS } from '@/config/statusEffects';
import { attackIconMap } from '@/config/fighters';
import { Progress } from '@/components/ui/progress';

type Coords = { x: number; y: number } | null;

interface BattleViewProps {
    isInitializing: boolean;
    isLoading: boolean;
    player: Fighter | null;
    opponent: Fighter | null;
    winner: BattleWinner;
    handleGoToMenu: (targetView?: any) => void;
    playerChosenAction: Attack | null;
    opponentChosenAction: Attack | null;
    isPlayerTurn: boolean;
    isPaused: boolean;
    setIsPaused: (paused: boolean) => void;
    isConfirmDisabled: boolean;
    covoConfig: { city: string; size: CovoSize; totalOpponents: number } | null;
    gymConfig: GymConfig | null;
    isArenaBattle: boolean;
    currentTurnMessage: string;
    handleCloseScoutAnalysis: () => void;
    showScoutAnalysis: boolean;
    scoutAnalysisResult: AnalyzedStats | null;
    setOpponentCardCoords: (coords: Coords) => void;
    setPlayerCardCoords: (coords: Coords) => void;
    executePlayerChosenAttack: (attack: Attack) => void;
    handleBlockAction: () => void;
    handleChargeAction: () => void;
    handleEscapeAttempt: () => void;
    handleToggleItemMenu: () => void;
    handleTogglePlayerStats: () => void;
    handleScout: () => void;
    projectileAnimations: any[];
    setProjectileAnimations: React.Dispatch<React.SetStateAction<any[]>>;
    playerCardCoords: Coords;
    opponentCardCoords: Coords;
    logEntries: BattleLogEntry[];
    handleAcceptUniqueCreature: (creature: Fighter) => void;
    isCovoBattle: boolean;
    isLastCovoOpponent: boolean;
    onNextCovoOpponent: () => void;
    isGymBattle: boolean;
    isLastGymTrainer: boolean;
    onNextGymTrainer: () => void;
    handleAttackClickInLog: (attackId: string) => void;
    lastDroppedItem: ConsumableItem | null;
    isViandanteBattle: boolean;
    showPlayerStatsDialog: boolean;
    setShowPlayerStatsDialog: (open: boolean) => void;
    showItemMenuDialog: boolean;
    setShowItemMenuDialog: (open: boolean) => void;
    showCombatLogModal: boolean;
    handleUseConsumable: (item: ConsumableInventoryItem) => void;
    setShowCombatLogModal: (open: boolean) => void;
    showOptionsMenu: boolean;
    handleToggleOptions: () => void;
    isAutoBattle: boolean;
    handleAutoBattleToggle: () => void;
    speedMultiplier: 1 | 2 | 4;
    handleSpeedToggle: () => void;
    turnCount: number;
    handlePistolaAction: () => void;
    isBattleEnding: boolean;
    showGameOverModal: boolean;
    setShowGameOverModal: (open: boolean) => void;
    finalScore: number;
    activeTrainerName: string | null;
    resetPlayerRun: (name: string) => void;
    navigateTo: (view: any) => void;
    showAttackDetailsDialog: boolean;
    handleCloseAttackDetailsDialog: () => void;
    selectedAttackForDetails: Attack | null;
    onRematch: () => void;
    chargeProgress: number;
    startCharge: () => void;
    cancelCharge: () => void;
    opponentTrainer: { name: string; subtitle: string; } | null;
}

const BattleView: React.FC<BattleViewProps> = (props) => {
    const {
        isInitializing, isLoading, player, opponent, winner, handleGoToMenu, playerChosenAction,
        opponentChosenAction, isPlayerTurn, isPaused, setIsPaused, isConfirmDisabled,
        covoConfig, gymConfig, isArenaBattle, currentTurnMessage, handleCloseScoutAnalysis,
        showScoutAnalysis, scoutAnalysisResult, setOpponentCardCoords, setPlayerCardCoords,
        executePlayerChosenAttack, handleBlockAction, handleChargeAction, handleEscapeAttempt,
        handleToggleItemMenu, handleTogglePlayerStats, handleScout, projectileAnimations,
        setProjectileAnimations, playerCardCoords, opponentCardCoords, logEntries,
        handleAcceptUniqueCreature, isCovoBattle, isLastCovoOpponent, onNextCovoOpponent,
        isGymBattle, isLastGymTrainer, onNextGymTrainer, handleAttackClickInLog,
        lastDroppedItem, isViandanteBattle, showPlayerStatsDialog, setShowPlayerStatsDialog,
        showItemMenuDialog, setShowItemMenuDialog,
        showCombatLogModal, handleUseConsumable, setShowCombatLogModal, showOptionsMenu,
        handleToggleOptions, isAutoBattle, handleAutoBattleToggle, speedMultiplier,
        handleSpeedToggle, turnCount, handlePistolaAction, isBattleEnding,
        showGameOverModal, setShowGameOverModal, finalScore, activeTrainerName,
        resetPlayerRun, navigateTo, showAttackDetailsDialog, handleCloseAttackDetailsDialog,
        selectedAttackForDetails, onRematch, chargeProgress, startCharge, cancelCharge,
        opponentTrainer
    } = props;
    
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    if (isInitializing || (!player && !opponent && !winner)) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }
    if (!player || !opponent) {
        return <div className="min-h-screen flex flex-col items-center justify-center"><p className="text-lg text-destructive mb-4">Errore: Dati dei combattenti non caricati.</p><Button onClick={() => navigateTo('main')} variant="outline"><Undo2 className="mr-2 h-4 w-4" /> Torna al Menu Principale</Button></div>;
    }

    const actionToDisplay = isPlayerTurn ? playerChosenAction : opponentChosenAction;
    const battleBgClass = covoConfig ? 'bg-covo' : gymConfig ? 'bg-gym-combat' : isArenaBattle ? 'bg-gym-combat' : 'bg-prateria';

    const canCharge = player && player.trustLevel >= player.maxTrustLevel;
    
    const turnOwnerName = () => {
        if (isPlayerTurn) return player.trainerName || player.name;
        if (opponentTrainer) return opponentTrainer.name;
        return `${opponent.name} (Selvaggio)`;
    };


    return (
        <div className={cn("min-h-screen h-screen flex flex-col text-foreground overflow-hidden relative")}>

            <main className="relative flex-grow flex flex-col p-2 w-full mx-auto bg-background">
                
                {/* Top Half - Creatures */}
                <div className={cn("h-1/2 w-full flex items-end justify-center gap-0 relative bg-black bg-bottom bg-[length:140%_140%] bg-no-repeat border-4 border-foreground/30 rounded-lg", battleBgClass)}>
                    <div className='absolute inset-0 flex flex-col justify-end'>
                        {opponent && (
                            <div className="w-full relative">
                                <FighterCard fighter={opponent} isTurn={!isPlayerTurn && !winner && !isPaused} layout="horizontal-right" setCoords={setOpponentCardCoords} />
                            </div>
                        )}
                        {player && (
                            <div className="w-full relative">
                                <FighterCard fighter={player} isPlayer isTurn={isPlayerTurn && !winner && !isPaused} layout="horizontal-left" setCoords={setPlayerCardCoords} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Half - UI/Actions */}
                <div className="h-1/2 w-full flex flex-col">
                    
                    <div className="w-full flex flex-col items-center justify-center py-2 min-h-[148px]">
                         {!winner && <p className="text-sm font-semibold text-muted-foreground">È il turno di {turnOwnerName()}</p>}
                         {showScoutAnalysis && scoutAnalysisResult ? (
                            <div onClick={handleCloseScoutAnalysis} className="cursor-pointer">
                                <ScoutAnalysisDisplay analysis={scoutAnalysisResult} fighterName={opponent.name} level={opponent.level} />
                            </div>
                         ) : (
                            <ActionDisplay
                                action={winner ? null : actionToDisplay}
                                isSuperEffective={opponent && actionToDisplay ? checkSuperEffective(actionToDisplay.creatureType, opponent.creatureType) : false}
                                isIneffective={opponent && actionToDisplay ? checkIneffective(actionToDisplay.creatureType, opponent.creatureType) : false}
                                currentTurnMessage={currentTurnMessage}
                                isWinner={!!winner}
                            />
                         )}
                    </div>
                    
                    {/* Controls Block */}
                    <div className="w-full flex-grow flex flex-col justify-center">
                        <div className="grid grid-cols-2 grid-rows-2 gap-2">
                             <div className="relative">
                                <Button
                                    onMouseDown={canCharge ? startCharge : () => { if (playerChosenAction) executePlayerChosenAttack(playerChosenAction); }}
                                    onMouseUp={canCharge ? cancelCharge : undefined}
                                    onMouseLeave={canCharge ? cancelCharge : undefined}
                                    onTouchStart={canCharge ? startCharge : () => { if (playerChosenAction) executePlayerChosenAttack(playerChosenAction); }}
                                    onTouchEnd={canCharge ? cancelCharge : undefined}
                                    disabled={isConfirmDisabled}
                                    variant={canCharge ? "default" : "destructive"}
                                    size="lg"
                                    className={cn("w-full text-lg h-16 transition-transform duration-75 ease-in-out active:scale-95", canCharge && "bg-accent hover:bg-accent/80")}
                                >
                                    {isConfirmDisabled && isPlayerTurn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sword className="mr-2 h-5 w-5" />}
                                    {canCharge ? "Carica!" : "Attacca!"}
                                </Button>
                                {canCharge && chargeProgress > 0 && (
                                    <Progress
                                        value={chargeProgress}
                                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1.5"
                                        indicatorClassName="bg-primary"
                                    />
                                )}
                            </div>
                            <Button
                                onClick={handleBlockAction}
                                disabled={isConfirmDisabled || !player || player.trustLevel < 1}
                                variant="secondary"
                                size="lg"
                                className="w-full text-lg h-16 transition-transform duration-75 ease-in-out active:scale-95"
                            >
                                <ShieldBan className="mr-2 h-5 w-5" />
                                Blocca
                            </Button>
                            <Button variant="secondary" size="lg" className="w-full text-lg h-16 transition-transform duration-75 ease-in-out active:scale-95" onClick={handleEscapeAttempt} disabled={isConfirmDisabled || isArenaBattle}>
                                <Undo2 className="mr-2 h-5 w-5" /> Scappa {player && !isArenaBattle && `(${(player.currentSpeedStat / 200 * 100).toFixed(0)}%)`}
                            </Button>
                            <Popover open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="secondary" size="lg" className="w-full text-lg h-16 transition-transform duration-75 ease-in-out active:scale-95" disabled={isConfirmDisabled}>
                                        <MoreHorizontal className="mr-2 h-5 w-5" /> Altro
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                    <div className="flex flex-col gap-2">
                                        <Button variant="ghost" size="sm" onClick={handleToggleItemMenu} disabled={isConfirmDisabled}>
                                            <Package className="mr-2 h-4 w-4" /> Zaino
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={handleTogglePlayerStats} disabled={isConfirmDisabled}>
                                            <UserCircle className="mr-2 h-4 w-4" /> Statistiche
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => { handleScout(); setIsMoreMenuOpen(false); }} disabled={isConfirmDisabled}>
                                            <Search className="mr-2 h-4 w-4" /> Analisi
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="w-full flex-shrink-0">
                        <div className="w-full flex items-center justify-between px-1 pb-1">
                            <Button onClick={handleToggleOptions} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-8 h-8" aria-label="Opzioni" disabled={winner || isInitializing}>
                                <Settings className="h-5 w-5" />
                            </Button>
                            {player && <TrustLevelBar currentTrust={player.trustLevel} maxTrust={player.maxTrustLevel} />}
                            <Button onClick={() => { setShowCombatLogModal(true); }} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-8 h-8" aria-label="Log" disabled={winner || isInitializing}>
                                <ScrollText className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Projectile Animations Container */}
            {projectileAnimations.map(p => (
                <ProjectileAnimation
                    key={p.key}
                    from={p.source === 'player' ? playerCardCoords : opponentCardCoords}
                    to={p.target === 'player' ? playerCardCoords : opponentCardCoords}
                    type={p.type}
                    iconName={p.iconName}
                    delay={p.delay}
                    onComplete={() => setProjectileAnimations(prev => prev.filter(anim => anim.key !== p.key))}
                />
            ))}

            <BattleResultModal
                winner={winner}
                onRematch={onRematch}
                onGoToMenu={() => handleGoToMenu(winner === 'opponent' ? 'creature_selection' : gymConfig ? 'gym_menu' : covoConfig ? 'covo_menu' : isArenaBattle ? 'arena' : 'main')}
                isOpen={!!winner}
                logEntries={logEntries}
                opponentFighter={opponent}
                onAcceptCreature={handleAcceptUniqueCreature}
                isCovoBattle={isCovoBattle}
                isLastCovoOpponent={isLastCovoOpponent}
                onNextCovoOpponent={onNextCovoOpponent}
                covoCityName={covoConfig?.city}
                isGymBattle={isGymBattle}
                isLastGymTrainer={isLastGymTrainer}
                onNextGymTrainer={onNextGymTrainer}
                gymName={gymConfig?.name}
                onAttackClick={handleAttackClickInLog}
                lastDroppedItem={lastDroppedItem}
                isViandanteBattle={isViandanteBattle}
                isArenaBattle={isArenaBattle}
            />
            <Dialog open={showPlayerStatsDialog} onOpenChange={setShowPlayerStatsDialog}>
                <DialogContent className="max-w-md bg-card border-border text-foreground">
                    <DialogHeader><DialogTitle className="text-primary text-center">Statistiche di {player?.name || 'Sbirulino'}</DialogTitle></DialogHeader>
                    <div className="mt-4">{player && <PlayerStatsDisplay fighter={player} opponent={opponent} className="p-0 shadow-none border-none bg-transparent" onAttackClick={handleAttackClickInLog} />}</div>
                </DialogContent>
            </Dialog>
            <Dialog open={showItemMenuDialog} onOpenChange={(open) => {
                setShowItemMenuDialog(open);
                if (!open && isPaused) {
                    const anyOtherDialogIsOpen = showPlayerStatsDialog || showCombatLogModal || showScoutAnalysis;
                    if (!anyOtherDialogIsOpen) {
                        setIsPaused(false);
                    }
                }
            }}>
                <DialogContent className="max-w-md bg-card border-border text-foreground">
                    <DialogHeader><DialogTitle className="text-primary text-center">Usa Oggetto</DialogTitle></DialogHeader>
                    <div className="mt-4 max-h-[60vh] overflow-y-auto p-1">
                        {(() => {
                            if (!player?.inventory || Object.keys(player.inventory).length === 0) {
                                return <p className="text-muted-foreground text-center">Nessun oggetto nell'inventario.</p>;
                            }
                            const usableItems = Object.values(player.inventory)
                                .filter(invItem => {
                                    if (invItem.quantity <= 0) return false;
                                    if (invItem.item.category === 'Cura') return true;
                                    if (invItem.item.category === 'Strumenti di Cattura' && !covoConfig && !gymConfig && !isArenaBattle) return true;
                                    return false;
                                });
                            if (usableItems.length === 0) {
                                return <p className="text-muted-foreground text-center">Nessun oggetto utilizzabile in combattimento.</p>;
                            }
                            return (
                                <div className="grid grid-cols-1 gap-2">
                                    {usableItems.map(invItem => (
                                        <Button key={invItem.item.id} variant="outline" className="justify-start text-left h-auto py-2" onClick={() => handleUseConsumable(invItem)} disabled={!isPlayerTurn || !!winner || !player || isLoading || (invItem.item.effect.type === 'heal' && player.currentHealth === player.maxHealth && (invItem.item.effect.amount || invItem.item.effect.percentage))}>
                                            <span className="flex-grow">{invItem.item.name}</span>
                                            <span className="text-xs ml-2 text-muted-foreground">(x{invItem.quantity})</span>
                                        </Button>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={showCombatLogModal} onOpenChange={setShowCombatLogModal}>
                <DialogContent className="max-w-md bg-card border-border text-foreground">
                    <DialogHeader><DialogTitle className="text-primary text-center">Log Combattimento</DialogTitle></DialogHeader>
                    <div className="mt-4"><CombatLog logEntries={logEntries} isModalView onAttackClick={handleAttackClickInLog} /></div>
                </DialogContent>
            </Dialog>
            <Dialog open={showOptionsMenu} onOpenChange={handleToggleOptions}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-primary text-center text-2xl">Opzioni Combattimento</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-battle-switch" className="text-base">Combattimento Automatico</Label>
                            <Switch id="auto-battle-switch" checked={isAutoBattle} onCheckedChange={handleAutoBattleToggle} disabled={winner || isInitializing} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Velocità Combattimento</Label>
                            <Button onClick={handleSpeedToggle} variant="outline" size="sm" className="text-base w-16 h-9" disabled={winner || isInitializing}>
                                x{speedMultiplier}
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Turno Attuale</Label>
                            <span className="font-bold text-lg">{turnCount}</span>
                        </div>
                        <div className="border-t border-border pt-4">
                            <Button onClick={() => { handlePistolaAction(); handleToggleOptions(); }} variant="destructive" className="w-full" disabled={!player || !opponent || winner || isInitializing || isBattleEnding}>
                                <Skull className="mr-2 h-4 w-4" /> Sacrifica Creatura
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={showGameOverModal} onOpenChange={(open) => { if (!open && activeTrainerName) { resetPlayerRun(activeTrainerName).then(() => { localStorage.removeItem('sbirumon-trainer'); navigateTo('welcome'); }); } }}>
                <DialogContent>
                    <DialogHeader><DialogTitle className="text-primary text-center text-3xl">Game Over</DialogTitle><DialogDescription className="text-center pt-2 text-lg">Hai esaurito i tentativi.</DialogDescription></DialogHeader>
                    <div className="mt-4 text-center"><p className="text-xl">Punteggio Finale: <span className="font-bold text-accent">{finalScore}</span></p></div>
                    <div className="flex justify-center mt-6"><Button onClick={() => setShowGameOverModal(false)}>Ricomincia</Button></div>
                </DialogContent>
            </Dialog>
            {selectedAttackForDetails && (
                <Dialog open={showAttackDetailsDialog} onOpenChange={handleCloseAttackDetailsDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center text-primary text-2xl">
                                {React.createElement((attackIconMap as any)[selectedAttackForDetails.icon || 'TrendingUp'], { className: "w-6 h-6 mr-3" })}
                                {selectedAttackForDetails.name}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 text-sm">
                            <p><strong>Categoria:</strong> <Badge variant="outline">{selectedAttackForDetails.category}</Badge></p>
                            <p><strong>Tipo:</strong> <Badge variant="outline">{selectedAttackForDetails.creatureType}</Badge></p>
                            <p><strong>Rarità:</strong> <Badge variant="secondary">{selectedAttackForDetails.rarity}</Badge></p>
                            <p><strong>Danno:</strong> <span className="font-semibold">{selectedAttackForDetails.damage > 0 ? selectedAttackForDetails.damage : (selectedAttackForDetails.damage < 0 ? `Cura ${Math.abs(selectedAttackForDetails.damage)}` : 'N/A')}</span></p>
                            <p><strong>Precisione:</strong> <span className="font-semibold">{(selectedAttackForDetails.accuracy * 100).toFixed(0)}%</span></p>
                            {selectedAttackForDetails.effect && (
                                <p>
                                    <strong>Effetto:</strong> {(selectedAttackForDetails.effect.chance * 100).toFixed(0)}% di <Badge variant="destructive">{STATUS_EFFECTS[selectedAttackForDetails.effect.statusId]?.name || 'Effetto Sconosciuto'}</Badge>
                                </p>
                            )}
                            {selectedAttackForDetails.recoil && (<p><strong>Rinculo:</strong> <span className="font-semibold">{(selectedAttackForDetails.recoil * 100).toFixed(0)}% del danno inflitto</span></p>)}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default BattleView;
