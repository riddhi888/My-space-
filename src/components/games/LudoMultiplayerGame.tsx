import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Trophy,
  RotateCcw,
  Users,
  Play,
  Share2,
  Bot,
  Crown,
  ChevronRight,
  Shield,
  HelpCircle,
  Timer,
  Award,
} from 'lucide-react';
import {
  GameRoom,
  broadcastGameState,
  getLocalPlayerProfile,
} from '../../services/multiplayerService';
import { gameAudio } from '../../services/gameAudio';
import { GameRoomChatAndPlayers } from './GameRoomChatAndPlayers';

interface LudoGameState {
  turnColorIndex: number; // 0: Red, 1: Green, 2: Yellow, 3: Blue
  diceValue: number | null;
  isRolling: boolean;
  hasRolled: boolean;
  winnerColorIndex: number | null;
  tokens: {
    [colorIndex: number]: number[]; // 4 tokens: -1 = in base, 0..50 = track steps, 51..55 = home path, 56 = HOME!
  };
  lastMoveLog: string;
  autoBotColors: number[];
}

interface LudoMultiplayerGameProps {
  room: GameRoom<LudoGameState>;
  onLeaveRoom: () => void;
}

const PLAYER_COLORS = [
  { name: 'Red', hex: '#ef4444', bg: 'bg-red-500', ring: 'ring-red-400', border: 'border-red-500', startOffset: 0 },
  { name: 'Green', hex: '#10b981', bg: 'bg-emerald-500', ring: 'ring-emerald-400', border: 'border-emerald-500', startOffset: 13 },
  { name: 'Yellow', hex: '#eab308', bg: 'bg-yellow-500', ring: 'ring-yellow-400', border: 'border-yellow-500', startOffset: 26 },
  { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500', ring: 'ring-blue-400', border: 'border-blue-500', startOffset: 39 },
];

// Safe track indices on the 52-tile circle
const SAFE_TILES_GLOBAL = [0, 8, 13, 21, 26, 34, 39, 47];

// Convert a player's step (0..50) to the global track index (0..51)
function getGlobalTrackIndex(playerColorIndex: number, step: number): number {
  const start = PLAYER_COLORS[playerColorIndex].startOffset;
  return (start + step) % 52;
}

export const createInitialLudoState = (playerCount = 4): LudoGameState => {
  const tokens: Record<number, number[]> = {};
  for (let c = 0; c < 4; c++) {
    tokens[c] = [-1, -1, -1, -1];
  }
  return {
    turnColorIndex: 0,
    diceValue: null,
    isRolling: false,
    hasRolled: false,
    winnerColorIndex: null,
    tokens,
    lastMoveLog: 'Game started! Red rolls first.',
    autoBotColors: [],
  };
};

export const LudoMultiplayerGame: React.FC<LudoMultiplayerGameProps> = ({
  room,
  onLeaveRoom,
}) => {
  const myProfile = getLocalPlayerProfile();
  const gameState: LudoGameState = room.gameState || createInitialLudoState(room.maxPlayers);

  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [localRolling, setLocalRolling] = useState(false);
  const [turnCountdown, setTurnCountdown] = useState(25);

  const isHost = room.hostId === myProfile.id;
  const currentParticipant = room.players?.[myProfile.id];
  const myColorIndex = currentParticipant?.colorIndex ?? 0;

  const isMyTurn =
    gameState.winnerColorIndex === null &&
    gameState.turnColorIndex === myColorIndex;

  const isCurrentTurnBot =
    gameState.winnerColorIndex === null &&
    (gameState.autoBotColors?.includes(gameState.turnColorIndex) ||
      !Object.values(room.players || {}).some(
        (p) => p.colorIndex === gameState.turnColorIndex
      ));

  // Turn timer countdown
  useEffect(() => {
    setTurnCountdown(25);
    const interval = setInterval(() => {
      setTurnCountdown((prev) => {
        if (prev <= 1) {
          if (isHost && !gameState.winnerColorIndex) {
            handleAutoSkipTurn();
          }
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.turnColorIndex, gameState.hasRolled]);

  // Handle Bot Turn automatically if current color is not a human player
  useEffect(() => {
    if (isHost && isCurrentTurnBot && !gameState.winnerColorIndex) {
      const timer = setTimeout(() => {
        executeBotTurn();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isHost, isCurrentTurnBot, gameState.turnColorIndex, gameState.hasRolled]);

  const handleAutoSkipTurn = () => {
    const nextColor = getNextActiveColor(gameState.turnColorIndex);
    broadcastGameState(room.code, {
      ...gameState,
      turnColorIndex: nextColor,
      diceValue: null,
      hasRolled: false,
      isRolling: false,
      lastMoveLog: `${PLAYER_COLORS[gameState.turnColorIndex].name} timed out. Next turn!`,
    });
  };

  const getNextActiveColor = (currentColor: number): number => {
    for (let i = 1; i <= 4; i++) {
      const candidate = (currentColor + i) % 4;
      if (room.maxPlayers === 2) {
        // In 2 player mode, typically Red (0) and Yellow (2)
        if (candidate === 0 || candidate === 2) return candidate;
      } else {
        return candidate;
      }
    }
    return (currentColor + 1) % 4;
  };

  // Check which tokens can legally move with the current dice value
  const getLegalTokenIndices = (colorIndex: number, diceVal: number): number[] => {
    const tokens = gameState.tokens[colorIndex] || [-1, -1, -1, -1];
    const legal: number[] = [];

    tokens.forEach((step, idx) => {
      if (step === 56) return; // already home
      if (step === -1) {
        if (diceVal === 6) legal.push(idx); // 6 can spawn
      } else if (step + diceVal <= 56) {
        legal.push(idx); // can advance
      }
    });

    return legal;
  };

  // Roll Dice Action
  const handleRollDice = async () => {
    if (!isMyTurn || gameState.hasRolled || localRolling || gameState.winnerColorIndex !== null) {
      return;
    }

    setLocalRolling(true);
    gameAudio.playDiceRoll();

    // Broadcast rolling state
    await broadcastGameState(room.code, {
      ...gameState,
      isRolling: true,
    });

    setTimeout(async () => {
      const dice = Math.floor(Math.random() * 6) + 1;
      setLocalRolling(false);

      const legalMoves = getLegalTokenIndices(myColorIndex, dice);

      // Check if no moves are possible
      if (legalMoves.length === 0) {
        const nextTurn = dice === 6 ? myColorIndex : getNextActiveColor(myColorIndex);
        await broadcastGameState(room.code, {
          ...gameState,
          diceValue: dice,
          hasRolled: false,
          isRolling: false,
          turnColorIndex: nextTurn,
          lastMoveLog: `${PLAYER_COLORS[myColorIndex].name} rolled a ${dice}. No legal moves!`,
        });
      } else if (legalMoves.length === 1) {
        // Auto-move single legal piece for smooth gameplay
        executeMoveToken(myColorIndex, legalMoves[0], dice);
      } else {
        // Let user choose among multiple legal pieces
        await broadcastGameState(room.code, {
          ...gameState,
          diceValue: dice,
          hasRolled: true,
          isRolling: false,
          lastMoveLog: `${PLAYER_COLORS[myColorIndex].name} rolled a ${dice}! Choose a token to move.`,
        });
      }
    }, 600);
  };

  // Execute Bot Turn
  const executeBotTurn = async () => {
    const botColor = gameState.turnColorIndex;
    gameAudio.playDiceRoll();
    const dice = Math.floor(Math.random() * 6) + 1;

    const legalMoves = getLegalTokenIndices(botColor, dice);
    if (legalMoves.length === 0) {
      const nextTurn = dice === 6 ? botColor : getNextActiveColor(botColor);
      await broadcastGameState(room.code, {
        ...gameState,
        diceValue: dice,
        hasRolled: false,
        isRolling: false,
        turnColorIndex: nextTurn,
        lastMoveLog: `${PLAYER_COLORS[botColor].name} (Bot) rolled ${dice}. No moves!`,
      });
      return;
    }

    // Pick best token: prefer piece out in field, or spawn from base
    let chosenIdx = legalMoves[0];
    const tokens = gameState.tokens[botColor];
    for (const idx of legalMoves) {
      if (tokens[idx] !== -1) {
        chosenIdx = idx;
        break;
      }
    }

    executeMoveToken(botColor, chosenIdx, dice);
  };

  // Move token logic (with capture detection and extra roll bonus)
  const executeMoveToken = async (colorIdx: number, tokenIdx: number, diceVal: number) => {
    const currentTokens = { ...gameState.tokens };
    const playerTokens = [...currentTokens[colorIdx]];
    const currentStep = playerTokens[tokenIdx];
    let newStep = currentStep;

    if (currentStep === -1) {
      if (diceVal === 6) {
        newStep = 0; // enter track
        gameAudio.playPieceStep();
      } else {
        return;
      }
    } else {
      newStep = Math.min(56, currentStep + diceVal);
      gameAudio.playPieceStep();
    }

    playerTokens[tokenIdx] = newStep;
    currentTokens[colorIdx] = playerTokens;

    let bonusTurn = diceVal === 6;
    let log = `${PLAYER_COLORS[colorIdx].name} moved token to step ${newStep}.`;

    // Capture Check: only on normal track steps (0..50) and outside of safe squares
    if (newStep >= 0 && newStep <= 50) {
      const globalTile = getGlobalTrackIndex(colorIdx, newStep);
      const isSafeSquare = SAFE_TILES_GLOBAL.includes(globalTile);

      if (!isSafeSquare) {
        for (let enemyColor = 0; enemyColor < 4; enemyColor++) {
          if (enemyColor === colorIdx) continue;
          const enemyTokens = [...currentTokens[enemyColor]];
          let capturedAny = false;

          enemyTokens.forEach((eStep, eIdx) => {
            if (eStep >= 0 && eStep <= 50) {
              const enemyGlobalTile = getGlobalTrackIndex(enemyColor, eStep);
              if (enemyGlobalTile === globalTile) {
                // Captured!
                enemyTokens[eIdx] = -1; // back to base
                capturedAny = true;
                bonusTurn = true; // reward extra turn
                log = `💥 ${PLAYER_COLORS[colorIdx].name} captured ${PLAYER_COLORS[enemyColor].name}'s token! +1 Free Turn!`;
                gameAudio.playCapture();
              }
            }
          });

          if (capturedAny) {
            currentTokens[enemyColor] = enemyTokens;
          }
        }
      }
    }

    // Check Home Completion
    if (newStep === 56) {
      bonusTurn = true;
      log = `🎉 ${PLAYER_COLORS[colorIdx].name} brought a token HOME!`;
      gameAudio.playWin();
    }

    // Win check: All 4 tokens home
    let winner: number | null = null;
    if (playerTokens.every((s) => s === 56)) {
      winner = colorIdx;
      log = `🏆🏆🏆 ${PLAYER_COLORS[colorIdx].name} WON THE LUDO MATCH! 🏆🏆🏆`;
      gameAudio.playWin();
    }

    const nextTurn = winner !== null ? colorIdx : bonusTurn ? colorIdx : getNextActiveColor(colorIdx);

    await broadcastGameState(room.code, {
      ...gameState,
      turnColorIndex: nextTurn,
      diceValue: diceVal,
      hasRolled: false,
      isRolling: false,
      winnerColorIndex: winner,
      tokens: currentTokens,
      lastMoveLog: log,
    });
  };

  const handleSelectToken = (tokenIdx: number) => {
    if (!isMyTurn || !gameState.hasRolled || !gameState.diceValue) return;
    const legalMoves = getLegalTokenIndices(myColorIndex, gameState.diceValue);
    if (legalMoves.includes(tokenIdx)) {
      executeMoveToken(myColorIndex, tokenIdx, gameState.diceValue);
    }
  };

  const handleToggleBot = (colorIdx: number) => {
    const currentBots = gameState.autoBotColors || [];
    const exists = currentBots.includes(colorIdx);
    const updated = exists
      ? currentBots.filter((c) => c !== colorIdx)
      : [...currentBots, colorIdx];

    broadcastGameState(room.code, {
      ...gameState,
      autoBotColors: updated,
      lastMoveLog: `${PLAYER_COLORS[colorIdx].name} is now ${exists ? 'Manual' : 'Cyber Bot 🤖'}`,
    });
  };

  const handleResetGame = () => {
    if (!isHost) return;
    broadcastGameState(room.code, createInitialLudoState(room.maxPlayers));
  };

  const currentColorMeta = PLAYER_COLORS[gameState.turnColorIndex];
  const legalMoveTokens =
    isMyTurn && gameState.hasRolled && gameState.diceValue
      ? getLegalTokenIndices(myColorIndex, gameState.diceValue)
      : [];

  return (
    <div className="space-y-4">
      {/* Game Stage Banner */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#150a2e] to-purple-950/80 border border-purple-800/40 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg font-black text-sm border border-white/20"
            style={{ backgroundColor: currentColorMeta.hex }}
          >
            {gameState.turnColorIndex + 1}P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-white">
                {currentColorMeta.name}'s Turn
              </span>
              {isMyTurn && (
                <span className="px-2 py-0.5 rounded-full bg-pink-500 text-[10px] font-bold text-white uppercase animate-pulse">
                  YOUR TURN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">{gameState.lastMoveLog}</p>
          </div>
        </div>

        {/* Turn Countdown Progress */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 border border-purple-800/60 text-xs font-mono text-cyan-300">
            <Timer className="w-3.5 h-3.5 text-pink-400" />
            <span>{turnCountdown}s</span>
          </div>

          <button
            onClick={() => setShowRules(!showRules)}
            title="How to play"
            className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-800 text-slate-300 hover:text-white cursor-pointer border border-purple-700/40"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rules Drawer Modal */}
      {showRules && (
        <div className="p-4 rounded-3xl bg-[#140b28] border border-cyan-500/40 shadow-2xl text-xs space-y-2 text-slate-300">
          <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Ludo King Rules & Guidelines
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-slate-300">
            <li>Roll a <strong>6</strong> to bring a new token out of your home base!</li>
            <li>Rolling a 6 or capturing an opponent grants a <strong>bonus roll</strong>.</li>
            <li>Star squares (<span className="text-amber-300 font-bold">★</span>) are safe zones where pieces cannot be knocked out.</li>
            <li>Reach the center triangle with all 4 tokens to win the match!</li>
          </ul>
        </div>
      )}

      {/* Main Ludo Board Area */}
      <div className="p-3 sm:p-5 rounded-3xl bg-[#0b0517] border border-purple-800/50 shadow-[0_0_40px_rgba(139,92,246,0.15)] flex flex-col items-center">
        {/* The 15x15 Ludo Grid */}
        <div className="w-full max-w-[420px] aspect-square bg-[#0e071f] rounded-2xl border-2 border-purple-900/60 grid grid-cols-15 grid-rows-15 p-1 relative shadow-inner overflow-hidden">
          {/* Top-Left: Red Base (Rows 1..6, Cols 1..6) */}
          <div className="col-span-6 row-span-6 bg-red-950/40 border-2 border-red-500/60 rounded-xl p-2 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-bold text-red-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Red Base
              </span>
              {isHost && (
                <button
                  onClick={() => handleToggleBot(0)}
                  className="text-[9px] px-1 py-0.5 rounded-sm bg-black/60 border border-red-500/40 text-red-300 cursor-pointer"
                >
                  {gameState.autoBotColors?.includes(0) ? '🤖 Bot' : '👤 P1'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/40 rounded-xl border border-red-500/20">
              {[0, 1, 2, 3].map((idx) => {
                const inBase = gameState.tokens[0]?.[idx] === -1;
                const canMove = myColorIndex === 0 && legalMoveTokens.includes(idx);
                return (
                  <button
                    key={idx}
                    disabled={!canMove}
                    onClick={() => handleSelectToken(idx)}
                    className={`aspect-square rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      inBase
                        ? canMove
                          ? 'bg-red-500 text-white shadow-[0_0_15px_#ef4444] animate-bounce scale-110 ring-2 ring-white'
                          : 'bg-red-600/80 text-red-200 border border-red-400/60'
                        : 'bg-red-950/30 border border-dashed border-red-800/40'
                    }`}
                  >
                    {inBase && <span className="text-[10px] font-black">{idx + 1}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top-Center: Green Path Column (Cols 7..9, Rows 1..6) */}
          <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 border border-purple-900/30">
            {Array.from({ length: 18 }).map((_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const isGreenHomeStretch = col === 1 && row > 0;
              const isGreenStart = col === 0 && row === 1;
              return (
                <div
                  key={i}
                  className={`border border-purple-950/80 flex items-center justify-center text-[9px] relative ${
                    isGreenHomeStretch ? 'bg-emerald-600/50' : isGreenStart ? 'bg-emerald-500/80 text-white font-bold' : 'bg-black/20'
                  }`}
                >
                  {isGreenStart && <Shield className="w-2.5 h-2.5 text-white" />}
                </div>
              );
            })}
          </div>

          {/* Top-Right: Green Base (Rows 1..6, Cols 10..15) */}
          <div className="col-span-6 row-span-6 bg-emerald-950/40 border-2 border-emerald-500/60 rounded-xl p-2 flex flex-col justify-between relative">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Green Base
              </span>
              {isHost && (
                <button
                  onClick={() => handleToggleBot(1)}
                  className="text-[9px] px-1 py-0.5 rounded-sm bg-black/60 border border-emerald-500/40 text-emerald-300 cursor-pointer"
                >
                  {gameState.autoBotColors?.includes(1) ? '🤖 Bot' : '👤 P2'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/40 rounded-xl border border-emerald-500/20">
              {[0, 1, 2, 3].map((idx) => {
                const inBase = gameState.tokens[1]?.[idx] === -1;
                const canMove = myColorIndex === 1 && legalMoveTokens.includes(idx);
                return (
                  <button
                    key={idx}
                    disabled={!canMove}
                    onClick={() => handleSelectToken(idx)}
                    className={`aspect-square rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      inBase
                        ? canMove
                          ? 'bg-emerald-500 text-white shadow-[0_0_15px_#10b981] animate-bounce scale-110 ring-2 ring-white'
                          : 'bg-emerald-600/80 text-emerald-200 border border-emerald-400/60'
                        : 'bg-emerald-950/30 border border-dashed border-emerald-800/40'
                    }`}
                  >
                    {inBase && <span className="text-[10px] font-black">{idx + 1}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle Left: Red Home Path (Cols 1..6, Rows 7..9) */}
          <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 border border-purple-900/30">
            {Array.from({ length: 18 }).map((_, i) => {
              const row = Math.floor(i / 6);
              const col = i % 6;
              const isRedHomeStretch = row === 1 && col > 0;
              const isRedStart = row === 0 && col === 1;
              return (
                <div
                  key={i}
                  className={`border border-purple-950/80 flex items-center justify-center text-[9px] ${
                    isRedHomeStretch ? 'bg-red-600/50' : isRedStart ? 'bg-red-500/80 text-white font-bold' : 'bg-black/20'
                  }`}
                >
                  {isRedStart && <Shield className="w-2.5 h-2.5 text-white" />}
                </div>
              );
            })}
          </div>

          {/* Center Goal Triangle (Cols 7..9, Rows 7..9) */}
          <div className="col-span-3 row-span-3 bg-black border-2 border-purple-700 rounded-xl relative flex items-center justify-center shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/40 via-yellow-500/40 to-blue-600/40" />
            <Trophy className="w-6 h-6 text-yellow-400 animate-pulse drop-shadow-[0_0_10px_#eab308]" />
          </div>

          {/* Middle Right: Yellow Home Path (Cols 10..15, Rows 7..9) */}
          <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 border border-purple-900/30">
            {Array.from({ length: 18 }).map((_, i) => {
              const row = Math.floor(i / 6);
              const col = i % 6;
              const isYellowHomeStretch = row === 1 && col < 5;
              const isYellowStart = row === 2 && col === 4;
              return (
                <div
                  key={i}
                  className={`border border-purple-950/80 flex items-center justify-center text-[9px] ${
                    isYellowHomeStretch ? 'bg-yellow-600/50' : isYellowStart ? 'bg-yellow-500/80 text-white font-bold' : 'bg-black/20'
                  }`}
                >
                  {isYellowStart && <Shield className="w-2.5 h-2.5 text-white" />}
                </div>
              );
            })}
          </div>

          {/* Bottom-Left: Blue Base (Rows 10..15, Cols 1..6) */}
          <div className="col-span-6 row-span-6 bg-blue-950/40 border-2 border-blue-500/60 rounded-xl p-2 flex flex-col justify-between relative">
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Blue Base
              </span>
              {isHost && (
                <button
                  onClick={() => handleToggleBot(3)}
                  className="text-[9px] px-1 py-0.5 rounded-sm bg-black/60 border border-blue-500/40 text-blue-300 cursor-pointer"
                >
                  {gameState.autoBotColors?.includes(3) ? '🤖 Bot' : '👤 P4'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/40 rounded-xl border border-blue-500/20">
              {[0, 1, 2, 3].map((idx) => {
                const inBase = gameState.tokens[3]?.[idx] === -1;
                const canMove = myColorIndex === 3 && legalMoveTokens.includes(idx);
                return (
                  <button
                    key={idx}
                    disabled={!canMove}
                    onClick={() => handleSelectToken(idx)}
                    className={`aspect-square rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      inBase
                        ? canMove
                          ? 'bg-blue-500 text-white shadow-[0_0_15px_#3b82f6] animate-bounce scale-110 ring-2 ring-white'
                          : 'bg-blue-600/80 text-blue-200 border border-blue-400/60'
                        : 'bg-blue-950/30 border border-dashed border-blue-800/40'
                    }`}
                  >
                    {inBase && <span className="text-[10px] font-black">{idx + 1}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom-Center: Blue Path Column (Cols 7..9, Rows 10..15) */}
          <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 border border-purple-900/30">
            {Array.from({ length: 18 }).map((_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const isBlueHomeStretch = col === 1 && row < 5;
              const isBlueStart = col === 2 && row === 4;
              return (
                <div
                  key={i}
                  className={`border border-purple-950/80 flex items-center justify-center text-[9px] relative ${
                    isBlueHomeStretch ? 'bg-blue-600/50' : isBlueStart ? 'bg-blue-500/80 text-white font-bold' : 'bg-black/20'
                  }`}
                >
                  {isBlueStart && <Shield className="w-2.5 h-2.5 text-white" />}
                </div>
              );
            })}
          </div>

          {/* Bottom-Right: Yellow Base (Rows 10..15, Cols 10..15) */}
          <div className="col-span-6 row-span-6 bg-yellow-950/40 border-2 border-yellow-500/60 rounded-xl p-2 flex flex-col justify-between relative">
            <div className="flex items-center justify-between text-[11px] font-bold text-yellow-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Yellow Base
              </span>
              {isHost && (
                <button
                  onClick={() => handleToggleBot(2)}
                  className="text-[9px] px-1 py-0.5 rounded-sm bg-black/60 border border-yellow-500/40 text-yellow-300 cursor-pointer"
                >
                  {gameState.autoBotColors?.includes(2) ? '🤖 Bot' : '👤 P3'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/40 rounded-xl border border-yellow-500/20">
              {[0, 1, 2, 3].map((idx) => {
                const inBase = gameState.tokens[2]?.[idx] === -1;
                const canMove = myColorIndex === 2 && legalMoveTokens.includes(idx);
                return (
                  <button
                    key={idx}
                    disabled={!canMove}
                    onClick={() => handleSelectToken(idx)}
                    className={`aspect-square rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      inBase
                        ? canMove
                          ? 'bg-yellow-500 text-white shadow-[0_0_15px_#eab308] animate-bounce scale-110 ring-2 ring-white'
                          : 'bg-yellow-600/80 text-yellow-200 border border-yellow-400/60'
                        : 'bg-yellow-950/30 border border-dashed border-yellow-800/40'
                    }`}
                  >
                    {inBase && <span className="text-[10px] font-black">{idx + 1}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Tokens Bar & Move Selector */}
        <div className="w-full mt-4 p-3 rounded-2xl bg-[#120a26] border border-purple-800/40 flex flex-wrap items-center justify-between gap-3">
          {/* Dice Box with 3D animation */}
          <div className="flex items-center gap-3">
            <button
              id="ludo-roll-dice-btn"
              disabled={!isMyTurn || gameState.hasRolled || localRolling || gameState.winnerColorIndex !== null}
              onClick={handleRollDice}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-2xl shadow-xl transition-all cursor-pointer relative ${
                isMyTurn && !gameState.hasRolled
                  ? 'bg-gradient-to-tr from-pink-500 to-purple-600 text-white ring-4 ring-pink-400/60 shadow-[0_0_25px_rgba(236,72,153,0.6)] animate-pulse scale-105'
                  : 'bg-purple-950 text-slate-400 border border-purple-800/60 opacity-80 cursor-not-allowed'
              } ${localRolling || gameState.isRolling ? 'rotate-180 scale-95 duration-300' : ''}`}
            >
              <span>{gameState.diceValue ?? '?'}</span>
              <span className="text-[9px] tracking-tight font-sans font-bold uppercase">
                {localRolling ? 'Rolling...' : isMyTurn && !gameState.hasRolled ? 'TAP ROLL' : 'DICE'}
              </span>
            </button>

            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{PLAYER_COLORS[myColorIndex].name} Player</span>
                <span className="text-slate-400 text-[11px]">(Slot {myColorIndex + 1})</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isMyTurn
                  ? gameState.hasRolled
                    ? '👉 Select a highlighted token to advance!'
                    : '🎲 Tap the 3D dice to roll!'
                  : `Waiting for ${currentColorMeta.name}'s turn...`}
              </p>
            </div>
          </div>

          {/* Tokens out in field for current player */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Your 4 Tokens:</span>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((idx) => {
                const step = gameState.tokens[myColorIndex]?.[idx] ?? -1;
                const isLegal = legalMoveTokens.includes(idx);
                const isHome = step === 56;
                const inBase = step === -1;

                return (
                  <button
                    key={idx}
                    disabled={!isLegal}
                    onClick={() => handleSelectToken(idx)}
                    title={`Token #${idx + 1} (${inBase ? 'In Base' : isHome ? 'Home' : `Step ${step}`})`}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                      isLegal
                        ? 'bg-pink-500 text-white shadow-[0_0_15px_#ec4899] animate-bounce scale-110 ring-2 ring-white'
                        : isHome
                        ? 'bg-emerald-500/80 text-white border border-emerald-300'
                        : inBase
                        ? 'bg-purple-950/60 text-slate-400 border border-purple-800/40'
                        : 'bg-purple-800 text-white border border-purple-500'
                    }`}
                  >
                    {isHome ? '🏁' : inBase ? 'Base' : step}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Winner Modal overlay if match won */}
      {gameState.winnerColorIndex !== null && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/90 via-purple-950 to-pink-950/90 border-2 border-yellow-500 shadow-[0_0_35px_rgba(234,179,8,0.5)] text-center space-y-3">
          <Award className="w-12 h-12 text-yellow-400 mx-auto animate-bounce drop-shadow-md" />
          <h3 className="font-display font-black text-xl text-yellow-300">
            {PLAYER_COLORS[gameState.winnerColorIndex].name} Player Wins! 👑
          </h3>
          <p className="text-xs text-slate-300">
            All tokens successfully brought to the home sanctuary.
          </p>
          {isHost && (
            <button
              onClick={handleResetGame}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-extrabold text-xs shadow-lg hover:scale-105 cursor-pointer"
            >
              Play Rematch
            </button>
          )}
        </div>
      )}

      {/* In-Game Real-Time Chat and Online Player Roster */}
      <GameRoomChatAndPlayers
        room={room}
        currentPlayerId={myProfile.id}
        onLeaveRoom={onLeaveRoom}
        accentGradient="from-red-500 to-purple-600"
      />
    </div>
  );
};
