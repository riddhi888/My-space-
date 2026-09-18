import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Trophy,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Flame,
  Users,
  Star,
  Award,
} from 'lucide-react';
import { GameItem } from '../types';

interface GamesViewProps {
  games: GameItem[];
}

export const GamesView: React.FC<GamesViewProps> = ({ games }) => {
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);

  // MINI GAME: Cyber Reflex Tap State
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(false);
  const [activeTargetIndex, setActiveTargetIndex] = useState<number | null>(null);
  const [combo, setCombo] = useState(1);
  const [highScore, setHighScore] = useState(2450);

  // Reflex tap target spawner
  useEffect(() => {
    let interval: any;
    if (gameActive && timeLeft > 0) {
      interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * 9);
        setActiveTargetIndex(randomIndex);
      }, 750);
    }
    return () => clearInterval(interval);
  }, [gameActive, timeLeft]);

  // Countdown timer
  useEffect(() => {
    let timer: any;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      setActiveTargetIndex(null);
      if (score > highScore) {
        setHighScore(score);
      }
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, score, highScore]);

  const startReflexGame = () => {
    setScore(0);
    setTimeLeft(15);
    setCombo(1);
    setGameActive(true);
    setActiveTargetIndex(Math.floor(Math.random() * 9));
  };

  const handleTargetClick = (index: number) => {
    if (!gameActive) return;
    if (index === activeTargetIndex) {
      const addedScore = 100 * combo;
      setScore((prev) => prev + addedScore);
      setCombo((prev) => Math.min(prev + 1, 5));
      // spawn next immediately
      const nextIndex = Math.floor(Math.random() * 9);
      setActiveTargetIndex(nextIndex);
    } else {
      setCombo(1);
    }
  };

  const leaderboard = [
    { rank: 1, name: 'Marcus Vance', score: 2840, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', badge: '🥇 Cyber King' },
    { rank: 2, name: 'Elena Rostova', score: 2610, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', badge: '🥈 Glitch Queen' },
    { rank: 3, name: 'Alex Rivera (You)', score: highScore, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', badge: '🥉 Neon Master' },
    { rank: 4, name: 'Kai Takahashi', score: 2120, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', badge: '🎮 Arcade Hacker' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Arcade Header */}
      <div className="px-4 pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span>MySpace Arcade</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </h2>
            <p className="text-xs text-slate-400">Play instant cyber mini-games & earn neon trophies</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-xs font-mono text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>1,450 TOKENS</span>
          </div>
        </div>

        {/* Featured Mini-Game Canvas Player Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1b1038] via-[#120b26] to-[#090714] border border-pink-500/40 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/50 flex items-center justify-center text-pink-400">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Cyber Reflex Tap</h3>
                <p className="text-[11px] text-pink-400">15-sec Speed Reaction Blitz</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                HIGH: {highScore}
              </span>
            </div>
          </div>

          {/* Interactive Play Arena (3x3 Neon Grid) */}
          <div className="relative aspect-square max-w-[280px] mx-auto bg-[#0a0618] rounded-2xl border border-purple-800/40 p-3 flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Status bar */}
            <div className="flex items-center justify-between text-xs font-mono px-1">
              <span className="text-pink-400 font-bold">SCORE: {score}</span>
              <span className="text-yellow-400 font-bold">x{combo} COMBO</span>
              <span className={`font-bold ${timeLeft <= 3 ? 'text-red-400 animate-ping' : 'text-cyan-400'}`}>
                {timeLeft}s
              </span>
            </div>

            {/* Target Matrix Grid */}
            <div className="grid grid-cols-3 gap-2.5 p-1 my-auto">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                const isActive = activeTargetIndex === index && gameActive;
                return (
                  <button
                    key={index}
                    id={`reflex-target-${index}`}
                    onClick={() => handleTargetClick(index)}
                    disabled={!gameActive}
                    className={`aspect-square rounded-xl transition-all duration-150 flex items-center justify-center ${
                      isActive
                        ? 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 shadow-[0_0_20px_rgba(236,72,153,0.9)] scale-105 border-2 border-white cursor-pointer'
                        : 'bg-purple-950/30 border border-purple-900/30 hover:border-purple-700/50'
                    }`}
                  >
                    {isActive ? (
                      <Flame className="w-6 h-6 text-white animate-bounce" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-900/40" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Game Start/Finish Overlay */}
            {!gameActive && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
                {timeLeft === 0 ? (
                  <div className="space-y-2">
                    <Trophy className="w-10 h-10 text-yellow-400 mx-auto animate-bounce" />
                    <h4 className="font-display font-bold text-lg text-white">Time's Up!</h4>
                    <p className="text-xs text-pink-300 font-mono">You scored {score} points!</p>
                    <button
                      id="restart-reflex-btn"
                      onClick={startReflexGame}
                      className="mt-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.6)] flex items-center gap-1.5 mx-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Play Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Zap className="w-10 h-10 text-pink-400 mx-auto" />
                    <h4 className="font-display font-bold text-base text-white">Cyber Reflex Tap</h4>
                    <p className="text-[11px] text-slate-300">Tap the glowing neon pods as fast as you can in 15 seconds!</p>
                    <button
                      id="start-reflex-btn"
                      onClick={startReflexGame}
                      className="mt-2 px-6 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(236,72,153,0.6)] flex items-center gap-1.5 mx-auto hover:scale-105 transition-transform"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Start Blitz
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Arcade Catalog */}
      <div className="px-4 space-y-3">
        <h3 className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-2">
          <span>Popular Arcade Games</span>
          <Flame className="w-4 h-4 text-orange-400" />
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => {
                if (game.isMiniGamePlayable) {
                  startReflexGame();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  alert(`Loading ${game.title}... Multiplayer lobby is scheduled for next release!`);
                }
              }}
              className="p-3 rounded-2xl bg-[#130d2a] border border-purple-800/40 hover:border-pink-500/50 transition-all cursor-pointer group shadow-lg hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video rounded-xl overflow-hidden mb-2.5">
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-cyan-300 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" /> {game.rating}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-white group-hover:text-pink-300 transition-colors line-clamp-1">
                  {game.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {game.category}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-900/30 text-[10px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Users className="w-3 h-3 text-emerald-400" /> {game.playersOnline}
                </span>
                <span className="text-pink-400 font-semibold group-hover:underline">
                  {game.isMiniGamePlayable ? 'Play Now →' : 'Lobby →'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arcade Leaderboard */}
      <div className="px-4 space-y-2.5">
        <h3 className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>Friends Leaderboard</span>
        </h3>

        <div className="rounded-2xl bg-[#110c26] border border-purple-800/40 p-2 space-y-1.5">
          {leaderboard.map((item) => (
            <div
              key={item.rank}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                item.rank === 3
                  ? 'bg-purple-900/40 border border-pink-500/40'
                  : 'hover:bg-purple-950/40'
              }`}
            >
              <span className={`w-5 font-mono text-xs font-bold text-center ${
                item.rank === 1 ? 'text-yellow-400' : item.rank === 2 ? 'text-slate-300' : 'text-pink-400'
              }`}>
                #{item.rank}
              </span>

              <img
                src={item.avatar}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-purple-500/40"
              />

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-white truncate">
                  {item.name}
                </h4>
                <p className="text-[10px] text-slate-400">{item.badge}</p>
              </div>

              <span className="font-mono text-xs font-bold text-cyan-300">
                {item.score.toLocaleString()} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
