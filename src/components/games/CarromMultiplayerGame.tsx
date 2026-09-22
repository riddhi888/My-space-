import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Trophy,
  RotateCcw,
  Target,
  Circle,
  HelpCircle,
  Play,
  Share2,
  Bot,
  Zap,
} from 'lucide-react';
import {
  GameRoom,
  broadcastGameState,
  getLocalPlayerProfile,
} from '../../services/multiplayerService';
import { gameAudio } from '../../services/gameAudio';
import { GameRoomChatAndPlayers } from './GameRoomChatAndPlayers';

export interface CarromPiece {
  id: string;
  type: 'white' | 'black' | 'queen';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isPocketed: boolean;
}

export interface CarromGameState {
  turnPlayerId: string; // id of player whose turn it is
  strikerX: number; // 0..1 ratio on baseline
  isAiming: boolean;
  aimAngle: number; // in radians
  power: number; // 10..100
  pieces: CarromPiece[];
  scores: {
    [playerId: string]: number;
  };
  winnerId: string | null;
  queenCoverPending: string | null;
  lastEventLog: string;
  isSimulating: boolean;
}

interface CarromMultiplayerGameProps {
  room: GameRoom<CarromGameState>;
  onLeaveRoom: () => void;
}

const BOARD_SIZE = 400; // Reference internal coordinate scale
const POCKET_RADIUS = 26;
const POCKETS = [
  { x: 30, y: 30 },
  { x: BOARD_SIZE - 30, y: 30 },
  { x: 30, y: BOARD_SIZE - 30 },
  { x: BOARD_SIZE - 30, y: BOARD_SIZE - 30 },
];

export const createInitialCarromState = (
  hostId: string,
  challengerId = ''
): CarromGameState => {
  const pieces: CarromPiece[] = [];
  const center = BOARD_SIZE / 2;

  // Red Queen at exact center
  pieces.push({
    id: 'queen',
    type: 'queen',
    x: center,
    y: center,
    vx: 0,
    vy: 0,
    radius: 12,
    isPocketed: false,
  });

  // Inner ring: 6 pieces alternating white and black
  const innerRadius = 24;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    pieces.push({
      id: `inner_${i}`,
      type: i % 2 === 0 ? 'white' : 'black',
      x: center + Math.cos(angle) * innerRadius,
      y: center + Math.sin(angle) * innerRadius,
      vx: 0,
      vy: 0,
      radius: 11,
      isPocketed: false,
    });
  }

  // Outer ring: 12 pieces alternating
  const outerRadius = 46;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    pieces.push({
      id: `outer_${i}`,
      type: i % 2 === 0 ? 'white' : 'black',
      x: center + Math.cos(angle) * outerRadius,
      y: center + Math.sin(angle) * outerRadius,
      vx: 0,
      vy: 0,
      radius: 11,
      isPocketed: false,
    });
  }

  return {
    turnPlayerId: hostId,
    strikerX: 0.5,
    isAiming: false,
    aimAngle: -Math.PI / 2, // Aim straight up towards center
    power: 50,
    pieces,
    scores: {
      [hostId]: 0,
      ...(challengerId ? { [challengerId]: 0 } : {}),
    },
    winnerId: null,
    queenCoverPending: null,
    lastEventLog: 'Match started! Position striker & shoot into corner pockets.',
    isSimulating: false,
  };
};

export const CarromMultiplayerGame: React.FC<CarromMultiplayerGameProps> = ({
  room,
  onLeaveRoom,
}) => {
  const myProfile = getLocalPlayerProfile();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const players = Object.values(room.players || {});
  const hostPlayer = players.find((p) => p.isHost) || players[0];
  const challengerPlayer = players.find((p) => !p.isHost) || null;

  const gameState: CarromGameState =
    room.gameState || createInitialCarromState(hostPlayer?.id || myProfile.id);

  const isMyTurn = gameState.turnPlayerId === myProfile.id && !gameState.winnerId;
  const isHost = room.hostId === myProfile.id;

  // Local interactive controls
  const [strikerBaselineX, setStrikerBaselineX] = useState(0.5);
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);
  const [shotPower, setShotPower] = useState(55);
  const [isStriking, setIsStriking] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Synchronize striker position with state
  useEffect(() => {
    if (gameState.strikerX !== undefined) {
      setStrikerBaselineX(gameState.strikerX);
    }
    if (gameState.aimAngle !== undefined) {
      setAimAngle(gameState.aimAngle);
    }
  }, [gameState.strikerX, gameState.aimAngle]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // 1. Board Background (Retro Cyber Wood / Midnight Velvet)
      ctx.fillStyle = '#0e0820';
      ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // Wooden neon borders
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, BOARD_SIZE - 12, BOARD_SIZE - 12);

      // Board framing accents
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(36, 36, BOARD_SIZE - 72, BOARD_SIZE - 72);

      // Center Concentric Circles
      ctx.beginPath();
      ctx.arc(BOARD_SIZE / 2, BOARD_SIZE / 2, 60, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(BOARD_SIZE / 2, BOARD_SIZE / 2, 22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#ec4899';
      ctx.stroke();

      // Baselines (Top & Bottom)
      const renderBaseline = (y: number) => {
        ctx.beginPath();
        ctx.moveTo(70, y);
        ctx.lineTo(BOARD_SIZE - 70, y);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // End circles
        [70, BOARD_SIZE - 70].forEach((cx) => {
          ctx.beginPath();
          ctx.arc(cx, y, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#1e103f';
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(cx, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ec4899';
          ctx.fill();
        });
      };

      renderBaseline(70); // Top baseline
      renderBaseline(BOARD_SIZE - 70); // Bottom baseline

      // Corner Pockets
      POCKETS.forEach((p) => {
        // Pocket hole
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#05020c';
        ctx.fill();
        ctx.strokeStyle = '#3b0764';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pocket rim glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS - 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 2. Draw Carrom Pieces
      gameState.pieces.forEach((piece) => {
        if (piece.isPocketed) return;

        ctx.save();
        ctx.beginPath();
        ctx.arc(piece.x, piece.y, piece.radius, 0, Math.PI * 2);

        if (piece.type === 'queen') {
          ctx.fillStyle = '#f43f5e'; // Vibrant Rose Queen
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
        } else if (piece.type === 'white') {
          ctx.fillStyle = '#f8fafc'; // Ivory White
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = '#1e1b4b'; // Midnight Black
          ctx.shadowColor = '#818cf8';
          ctx.shadowBlur = 4;
        }
        ctx.fill();

        // Piece inner ring detail
        ctx.beginPath();
        ctx.arc(piece.x, piece.y, piece.radius * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = piece.type === 'white' ? '#94a3b8' : piece.type === 'queen' ? '#ffe4e6' : '#6366f1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      });

      // 3. Draw Striker
      const isPlayerBottom = gameState.turnPlayerId === myProfile.id;
      const strikerY = isPlayerBottom ? BOARD_SIZE - 70 : 70;
      const minX = 85;
      const maxX = BOARD_SIZE - 85;
      const currentStrikerX = minX + strikerBaselineX * (maxX - minX);

      ctx.save();
      ctx.beginPath();
      ctx.arc(currentStrikerX, strikerY, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Striker center dot
      ctx.beginPath();
      ctx.arc(currentStrikerX, strikerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // 4. Aim Trajectory Arrow (if my turn)
      if (isMyTurn && !isStriking && !gameState.isSimulating) {
        const arrowLength = 40 + (shotPower / 100) * 80;
        const targetX = currentStrikerX + Math.cos(aimAngle) * arrowLength;
        const targetY = strikerY + Math.sin(aimAngle) * arrowLength;

        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(currentStrikerX, strikerY);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Target reticle
        ctx.beginPath();
        ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [gameState, strikerBaselineX, aimAngle, shotPower, isMyTurn, isStriking]);

  // Execute Shot Simulation
  const handleShootStriker = async () => {
    if (!isMyTurn || isStriking || gameState.isSimulating) return;

    setIsStriking(true);
    gameAudio.playStrikerHit(shotPower / 100);

    const minX = 85;
    const maxX = BOARD_SIZE - 85;
    const startX = minX + strikerBaselineX * (maxX - minX);
    const startY = BOARD_SIZE - 70;

    const velocityMagnitude = (shotPower / 100) * 14;
    let strikerVx = Math.cos(aimAngle) * velocityMagnitude;
    let strikerVy = Math.sin(aimAngle) * velocityMagnitude;

    // Clone pieces for physics run
    let simulatedPieces = gameState.pieces.map((p) => ({ ...p }));
    let strikerCurrentX = startX;
    let strikerCurrentY = startY;
    let strikerRadius = 15;
    let strikerPocketed = false;

    let pocketedThisShot: CarromPiece[] = [];

    // Run rapid 2D physics steps
    for (let step = 0; step < 85; step++) {
      // Move striker
      strikerCurrentX += strikerVx;
      strikerCurrentY += strikerVy;
      strikerVx *= 0.96; // friction
      strikerVy *= 0.96;

      // Rebound striker off walls
      if (strikerCurrentX < 36 + strikerRadius || strikerCurrentX > BOARD_SIZE - 36 - strikerRadius) {
        strikerVx = -strikerVx * 0.85;
      }
      if (strikerCurrentY < 36 + strikerRadius || strikerCurrentY > BOARD_SIZE - 36 - strikerRadius) {
        strikerVy = -strikerVy * 0.85;
      }

      // Check striker pocketed (foul)
      for (const pocket of POCKETS) {
        const dist = Math.hypot(strikerCurrentX - pocket.x, strikerCurrentY - pocket.y);
        if (dist < POCKET_RADIUS - 2) {
          strikerPocketed = true;
          strikerVx = 0;
          strikerVy = 0;
        }
      }

      // Move carrom men & check piece-to-striker collision
      simulatedPieces.forEach((piece) => {
        if (piece.isPocketed) return;

        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vx *= 0.96;
        piece.vy *= 0.96;

        // Rebound off walls
        if (piece.x < 36 + piece.radius || piece.x > BOARD_SIZE - 36 - piece.radius) {
          piece.vx = -piece.vx * 0.85;
        }
        if (piece.y < 36 + piece.radius || piece.y > BOARD_SIZE - 36 - piece.radius) {
          piece.vy = -piece.vy * 0.85;
        }

        // Check pocketing
        for (const pocket of POCKETS) {
          const dist = Math.hypot(piece.x - pocket.x, piece.y - pocket.y);
          if (dist < POCKET_RADIUS - 2 && !piece.isPocketed) {
            piece.isPocketed = true;
            pocketedThisShot.push(piece);
            gameAudio.playPocket();
          }
        }

        // Collision with striker
        if (!strikerPocketed) {
          const dx = piece.x - strikerCurrentX;
          const dy = piece.y - strikerCurrentY;
          const dist = Math.hypot(dx, dy);
          const minDist = piece.radius + strikerRadius;

          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const impulse = (strikerVx * nx + strikerVy * ny) * 1.2;

            piece.vx += nx * impulse;
            piece.vy += ny * impulse;
            strikerVx -= nx * impulse * 0.7;
            strikerVy -= ny * impulse * 0.7;
            gameAudio.playStrikerHit(0.5);
          }
        }

        // Collision between pieces
        simulatedPieces.forEach((other) => {
          if (other.id === piece.id || other.isPocketed || piece.isPocketed) return;
          const pdx = other.x - piece.x;
          const pdy = other.y - piece.y;
          const pdist = Math.hypot(pdx, pdy);
          const pMinDist = piece.radius + other.radius;

          if (pdist < pMinDist && pdist > 0) {
            const pnx = pdx / pdist;
            const pny = pdy / pdist;
            const impulse = (piece.vx * pnx + piece.vy * pny) * 0.9;

            other.vx += pnx * impulse;
            other.vy += pny * impulse;
            piece.vx -= pnx * impulse;
            piece.vy -= pny * impulse;
          }
        });
      });
    }

    // Scoring & Turn logic
    const currentScores = { ...(gameState.scores || {}) };
    let playerPointsGained = 0;
    let log = '';

    if (strikerPocketed) {
      playerPointsGained -= 5;
      log = `⚠️ Foul! Striker pocketed (-5 points).`;
    }

    let keptTurn = false;
    pocketedThisShot.forEach((p) => {
      if (p.type === 'queen') {
        playerPointsGained += 25;
        log += ` 👑 Pocketed the Queen! (+25 pts)`;
        keptTurn = true;
      } else if (p.type === 'white') {
        playerPointsGained += 10;
        log += ` ⚪ Pocketed White (+10 pts)!`;
        keptTurn = true;
      } else {
        playerPointsGained += 5;
        log += ` ⚫ Pocketed Black (+5 pts)!`;
        keptTurn = true;
      }
    });

    const newScore = Math.max(0, (currentScores[myProfile.id] || 0) + playerPointsGained);
    currentScores[myProfile.id] = newScore;

    // Check winner
    let winnerId: string | null = null;
    if (newScore >= 35 || simulatedPieces.every((p) => p.isPocketed)) {
      winnerId = myProfile.id;
      log = `🏆🏆🏆 ${myProfile.name} WON THE CARROM MATCH! 🏆🏆🏆`;
      gameAudio.playWin();
    }

    // Next turn
    const opponentId =
      players.find((p) => p.id !== myProfile.id)?.id || 'challenger_bot';
    const nextTurnPlayerId =
      winnerId ? myProfile.id : keptTurn && !strikerPocketed ? myProfile.id : opponentId;

    if (!log) {
      log = `${myProfile.name} took a shot. Turn switches.`;
    }

    setTimeout(async () => {
      setIsStriking(false);
      await broadcastGameState(room.code, {
        ...gameState,
        turnPlayerId: nextTurnPlayerId,
        strikerX: 0.5,
        pieces: simulatedPieces,
        scores: currentScores,
        winnerId,
        lastEventLog: log,
        isSimulating: false,
      });
    }, 400);
  };

  const handleResetGame = () => {
    if (!isHost) return;
    broadcastGameState(
      room.code,
      createInitialCarromState(room.hostId, challengerPlayer?.id)
    );
  };

  const currentTurnParticipant = room.players?.[gameState.turnPlayerId];

  return (
    <div className="space-y-4">
      {/* Game Header Scoreboard */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-r from-purple-950 via-[#13092b] to-purple-950 border border-purple-800/40 shadow-xl flex items-center justify-between gap-3">
        {/* Player 1 (Host) */}
        <div className="flex items-center gap-2">
          <img
            src={hostPlayer?.avatar || myProfile.avatar}
            alt="Player 1"
            className="w-9 h-9 rounded-full object-cover border-2 border-pink-500"
          />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>{hostPlayer?.name || 'Player 1'}</span>
              {gameState.turnPlayerId === hostPlayer?.id && (
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              )}
            </div>
            <div className="text-[11px] font-mono text-pink-300 font-extrabold">
              {gameState.scores[hostPlayer?.id || ''] || 0} PTS
            </div>
          </div>
        </div>

        {/* Center VS Indicator */}
        <div className="text-center">
          <span className="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800/50 text-[10px] font-mono text-cyan-300 font-bold">
            1v1 CARROM
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">First to 35 pts</p>
        </div>

        {/* Player 2 (Challenger) */}
        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
              {gameState.turnPlayerId === (challengerPlayer?.id || 'challenger_bot') && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
              <span>{challengerPlayer?.name || 'Cyber Challenger'}</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-300 font-extrabold">
              {gameState.scores[challengerPlayer?.id || 'challenger_bot'] || 0} PTS
            </div>
          </div>
          <img
            src={
              challengerPlayer?.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
            }
            alt="Player 2"
            className="w-9 h-9 rounded-full object-cover border-2 border-cyan-500"
          />
        </div>
      </div>

      {/* Main Carrom Canvas Arena */}
      <div className="p-3 sm:p-5 rounded-3xl bg-[#090314] border border-purple-800/50 shadow-[0_0_35px_rgba(139,92,246,0.15)] flex flex-col items-center">
        {/* Canvas Display */}
        <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-[#251347]">
          <canvas
            ref={canvasRef}
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            className="w-full h-full block cursor-crosshair touch-none"
          />

          {/* Turn Banner Overlay */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span
              className={`px-3 py-1 rounded-xl backdrop-blur-md text-[11px] font-bold border shadow-lg ${
                isMyTurn
                  ? 'bg-pink-500/80 text-white border-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse'
                  : 'bg-black/70 text-slate-300 border-purple-800/40'
              }`}
            >
              {isMyTurn ? 'YOUR TURN TO STRIKE!' : `${currentTurnParticipant?.name || 'Opponent'}'s Turn`}
            </span>

            <button
              onClick={() => setShowRules(!showRules)}
              className="pointer-events-auto p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-cyan-300 border border-cyan-500/40 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Rules Helper */}
        {showRules && (
          <div className="w-full max-w-[400px] mt-2 p-3 rounded-2xl bg-[#130a2a] border border-cyan-500/40 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-cyan-300">Carrom Quick Rules:</p>
            <p>⚪ White: <strong>10 pts</strong> | ⚫ Black: <strong>5 pts</strong> | 👑 Queen: <strong>25 pts</strong></p>
            <p>Pocketing a piece awards points & keeps your turn. Striker foul incurs a -5 penalty.</p>
          </div>
        )}

        {/* Interactive Controls Bar */}
        <div className="w-full max-w-[400px] mt-4 p-3.5 rounded-2xl bg-[#120a28] border border-purple-800/40 space-y-3">
          {/* Striker Horizontal Baseline Position Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1 font-semibold text-cyan-300">
                <Target className="w-3.5 h-3.5" />
                Striker Position
              </span>
              <span className="font-mono text-[10px] text-slate-400">Slide to position</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              disabled={!isMyTurn || isStriking}
              value={strikerBaselineX}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setStrikerBaselineX(val);
                broadcastGameState(room.code, {
                  ...gameState,
                  strikerX: val,
                });
              }}
              className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Aim Angle Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1 font-semibold text-pink-300">
                <Zap className="w-3.5 h-3.5" />
                Aim Angle: {Math.round(((aimAngle + Math.PI / 2) * 180) / Math.PI)}°
              </span>
              <span className="font-mono text-[10px] text-slate-400">Aim trajectory</span>
            </div>
            <input
              type="range"
              min={-Math.PI + 0.3}
              max={-0.3}
              step="0.05"
              disabled={!isMyTurn || isStriking}
              value={aimAngle}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAimAngle(val);
                broadcastGameState(room.code, {
                  ...gameState,
                  aimAngle: val,
                });
              }}
              className="w-full accent-pink-500 cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Power Meter & Shoot Button */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>FORCE POWER</span>
                <span className="text-amber-400 font-bold">{shotPower}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                disabled={!isMyTurn || isStriking}
                value={shotPower}
                onChange={(e) => setShotPower(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer disabled:opacity-40"
              />
            </div>

            <button
              id="carrom-shoot-btn"
              disabled={!isMyTurn || isStriking}
              onClick={handleShootStriker}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shadow-lg ${
                isMyTurn && !isStriking
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)] scale-105 active:scale-95'
                  : 'bg-purple-950 text-slate-400 border border-purple-800/40 opacity-50 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isStriking ? 'Striking...' : 'STRIKE!'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      {gameState.winnerId && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/90 via-purple-950 to-pink-950/90 border-2 border-yellow-500 shadow-2xl text-center space-y-2">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto animate-bounce" />
          <h3 className="font-display font-black text-xl text-yellow-300">
            {gameState.winnerId === myProfile.id ? 'You Won the Match! 🏆' : 'Opponent Won the Match!'}
          </h3>
          <p className="text-xs text-slate-300">{gameState.lastEventLog}</p>
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

      {/* Room In-Game Chat & Player List */}
      <GameRoomChatAndPlayers
        room={room}
        currentPlayerId={myProfile.id}
        onLeaveRoom={onLeaveRoom}
        accentGradient="from-cyan-500 to-purple-600"
      />
    </div>
  );
};
