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
  Brain,
  Info,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { GameItem, UserProfile, Friend } from '../types';
import { UserAvatar } from './UserAvatar';

interface GamesViewProps {
  games: GameItem[];
  currentUser?: UserProfile;
  friends?: Friend[];
  onOpenAddFriend?: () => void;
  onShowToast?: (msg: string) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  games,
  currentUser,
  friends = [],
  onOpenAddFriend,
  onShowToast,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<'reflex' | 'matrix'>('reflex');

  // GAME 1: Cyber Reflex Tap State
  const [reflexScore, setReflexScore] = useState(0);
  const [reflexTimeLeft, setReflexTimeLeft] = useState(15);
  const [reflexActive, setReflexActive] = useState(false);
  const [activeTargetIndex, setActiveTargetIndex] = useState<number | null>(null);
  const [reflexCombo, setReflexCombo] = useState(1);
  const [reflexHighScore, setReflexHighScore] = useState(2450);

  // GAME 2: Neon Memory Matrix State
  const MEMORY_CARDS = ['⚡', '🔮', '💎', '🕹️', '🎶', '⭐'];
  const [memoryGrid, setMemoryGrid] = useState<{ id: number; symbol: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryHighScore, setMemoryHighScore] = useState(1800);
  const [memoryActive, setMemoryActive] = useState(false);
  const [memoryWon, setMemoryWon] = useState(false);

  // Reflex tap target spawner
  useEffect(() => {
    let interval: any;
    if (reflexActive && reflexTimeLeft > 0) {
      interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * 9);
        setActiveTargetIndex(randomIndex);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [reflexActive, reflexTimeLeft]);

  // Countdown timer for reflex
  useEffect(() => {
    let timer: any;
    if (reflexActive && reflexTimeLeft > 0) {
      timer = setInterval(() => {
        setReflexTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (reflexTimeLeft === 0 && reflexActive) {
      setReflexActive(false);
      setActiveTargetIndex(null);
      if (reflexScore > reflexHighScore) {
        setReflexHighScore(reflexScore);
        if (onShowToast) onShowToast(`🏆 New High Score: ${reflexScore} points in Reflex Tap!`);
      }
    }
    return () => clearInterval(timer);
  }, [reflexActive, reflexTimeLeft, reflexScore, reflexHighScore, onShowToast]);

  const startReflexGame = () => {
    setReflexScore(0);
    setReflexTimeLeft(15);
    setReflexCombo(1);
    setReflexActive(true);
    setActiveTargetIndex(Math.floor(Math.random() * 9));
  };

  const handleTargetClick = (index: number) => {
    if (!reflexActive) return;
    if (index === activeTargetIndex) {
      const addedScore = 100 * reflexCombo;
      setReflexScore((prev) => prev + addedScore);
      setReflexCombo((prev) => Math.min(prev + 1, 5));
      const nextIndex = Math.floor(Math.random() * 9);
      setActiveTargetIndex(nextIndex);
    } else {
      setReflexCombo(1);
    }
  };

  // Memory Matrix initialize
  const startMemoryGame = () => {
    const deck = [...MEMORY_CARDS, ...MEMORY_CARDS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, idx) => ({
        id: idx,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setMemoryGrid(deck);
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryScore(0);
    setMemoryWon(false);
    setMemoryActive(true);
  };

  // Memory card click
  const handleCardClick = (index: number) => {
    if (!memoryActive || memoryGrid[index].isFlipped || memoryGrid[index].isMatched || flippedIndices.length >= 2) {
      return;
    }

    const newGrid = [...memoryGrid];
    newGrid[index].isFlipped = true;
    setMemoryGrid(newGrid);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;

      if (newGrid[firstIdx].symbol === newGrid[secondIdx].symbol) {
        // Matched!
        setTimeout(() => {
          setMemoryGrid((prev) => {
            const updated = [...prev];
            updated[firstIdx].isMatched = true;
            updated[secondIdx].isMatched = true;
            return updated;
          });
          setMemoryScore((s) => s + 300);
          setFlippedIndices([]);

          // Check win
          setTimeout(() => {
            setMemoryGrid((currentGrid) => {
              const allMatched = currentGrid.every((c) => c.isMatched);
              if (allMatched) {
                setMemoryWon(true);
                setMemoryActive(false);
                setMemoryScore((prevScore) => {
                  const finalScore = prevScore + 500;
                  if (finalScore > memoryHighScore) setMemoryHighScore(finalScore);
                  return finalScore;
                });
                if (onShowToast) onShowToast('🎉 Neon Memory Matrix Cleared!');
              }
              return currentGrid;
            });
          }, 100);
        }, 500);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setMemoryGrid((prev) => {
            const updated = [...prev];
            updated[firstIdx].isFlipped = false;
            updated[secondIdx].isFlipped = false;
            return updated;
          });
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  const userBestScore = Math.max(reflexHighScore, memoryHighScore);
  const userEntry = {
    rank: 1,
    name: currentUser?.name ? `${currentUser.name} (You)` : 'You',
    score: userBestScore,
    avatar: currentUser?.avatar || '',
    badge: '🥇 Arcade Pioneer',
  };

  const friendLeaderboard = friends.map((f, idx) => ({
    rank: idx + 2,
    name: f.name,
    score: 0,
    avatar: f.avatar,
    badge: '🎮 Cyber Challenger',
  }));

  const leaderboard = [userEntry, ...friendLeaderboard];

  return (
    <div className="space-y-6 pb-28">
      {/* Arcade Header */}
      <div className="px-4 pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400">
                MySpace Arcade
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                NEON 2008
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant playable mini-games, retro scores & mobile controls
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-xs font-mono text-cyan-300 shadow-md">
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-pulse" />
            <span>1,450 TOKENS</span>
          </div>
        </div>

        {/* Mini-Game Switcher Tabs */}
        <div className="flex bg-purple-950/40 p-1 rounded-2xl border border-purple-800/30 text-xs">
          <button
            onClick={() => setSelectedGameId('reflex')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedGameId === 'reflex'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Reflex Tap Blitz</span>
          </button>
          <button
            onClick={() => {
              setSelectedGameId('matrix');
              if (memoryGrid.length === 0) startMemoryGame();
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedGameId === 'matrix'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Neon Memory Matrix</span>
          </button>
        </div>
      </div>

      {/* MINI GAME 1: Cyber Reflex Tap */}
      {selectedGameId === 'reflex' && (
        <div className="px-4">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1b1038] via-[#120b26] to-[#090714] border border-pink-500/40 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/50 flex items-center justify-center text-pink-400">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Cyber Reflex Tap</h3>
                  <p className="text-[11px] text-pink-400 font-mono">15-sec Speed Reaction Blitz</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                  HIGH: {reflexHighScore}
                </span>
              </div>
            </div>

            {/* Interactive Play Arena (3x3 Neon Grid) */}
            <div className="relative aspect-square max-w-[280px] mx-auto bg-[#0a0618] rounded-2xl border border-purple-800/40 p-3 flex flex-col justify-between overflow-hidden shadow-inner">
              {/* Status bar */}
              <div className="flex items-center justify-between text-xs font-mono px-1">
                <span className="text-pink-400 font-bold">SCORE: {reflexScore}</span>
                <span className="text-yellow-400 font-bold">x{reflexCombo} COMBO</span>
                <span className={`font-bold ${reflexTimeLeft <= 3 ? 'text-red-400 animate-ping' : 'text-cyan-400'}`}>
                  {reflexTimeLeft}s
                </span>
              </div>

              {/* Target Matrix Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-1 my-auto">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                  const isActive = activeTargetIndex === index && reflexActive;
                  return (
                    <button
                      key={index}
                      id={`reflex-target-${index}`}
                      onClick={() => handleTargetClick(index)}
                      disabled={!reflexActive}
                      className={`aspect-square rounded-xl transition-all duration-150 flex items-center justify-center ${
                        isActive
                          ? 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 shadow-[0_0_20px_rgba(236,72,153,0.9)] scale-105 border-2 border-white cursor-pointer active:scale-95'
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
              {!reflexActive && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
                  {reflexTimeLeft === 0 ? (
                    <div className="space-y-2">
                      <Trophy className="w-10 h-10 text-yellow-400 mx-auto animate-bounce" />
                      <h4 className="font-display font-bold text-lg text-white">Time's Up!</h4>
                      <p className="text-xs text-pink-300 font-mono">You scored {reflexScore} points!</p>
                      <button
                        id="restart-reflex-btn"
                        onClick={startReflexGame}
                        className="mt-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.6)] flex items-center gap-1.5 mx-auto active:scale-95"
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
                        className="mt-2 px-6 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(236,72,153,0.6)] flex items-center gap-1.5 mx-auto hover:scale-105 active:scale-95 transition-transform"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Start Blitz
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/30 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300">
                <span className="font-semibold text-white">Instructions:</span> Hit the fiery pods before they change. Consecutive hits build a combo multiplier up to 5x!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MINI GAME 2: Neon Memory Matrix */}
      {selectedGameId === 'matrix' && (
        <div className="px-4">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c1836] via-[#091129] to-[#090714] border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Neon Memory Matrix</h3>
                  <p className="text-[11px] text-cyan-300 font-mono">Match Glowing Cyber Symbols</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                  BEST: {memoryHighScore}
                </span>
              </div>
            </div>

            {/* Interactive Memory Arena (4x3 Grid) */}
            <div className="relative aspect-square max-w-[280px] mx-auto bg-[#070b1c] rounded-2xl border border-cyan-900/40 p-3 flex flex-col justify-between overflow-hidden shadow-inner">
              {/* Status Bar */}
              <div className="flex items-center justify-between text-xs font-mono px-1">
                <span className="text-cyan-300 font-bold">SCORE: {memoryScore}</span>
                <span className="text-slate-300 font-bold">MOVES: {memoryMoves}</span>
                <button
                  onClick={startMemoryGame}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                  title="Restart"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-4 gap-2 p-1 my-auto">
                {memoryGrid.map((card, idx) => {
                  const isVisible = card.isFlipped || card.isMatched;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(idx)}
                      disabled={card.isMatched || card.isFlipped}
                      className={`aspect-square rounded-xl text-lg font-bold transition-all duration-300 flex items-center justify-center ${
                        card.isMatched
                          ? 'bg-emerald-950/80 border-2 border-emerald-400/80 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                          : card.isFlipped
                          ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 border-2 border-white text-white shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-105'
                          : 'bg-purple-950/50 border border-purple-800/40 text-transparent hover:border-cyan-500/50 active:scale-95'
                      }`}
                    >
                      {isVisible ? card.symbol : '👾'}
                    </button>
                  );
                })}
              </div>

              {/* Win Overlay */}
              {memoryWon && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce mb-2" />
                  <h4 className="font-display font-bold text-lg text-white">Matrix Solved!</h4>
                  <p className="text-xs text-cyan-300 font-mono">
                    Score: {memoryScore} pts ({memoryMoves} moves)
                  </p>
                  <button
                    onClick={startMemoryGame}
                    className="mt-3 px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center gap-1.5 mx-auto active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Play Again
                  </button>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/30 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300">
                <span className="font-semibold text-white">Instructions:</span> Flip cards to discover matching cyber icons. Match all pairs with fewer moves to score maximum points!
              </p>
            </div>
          </div>
        </div>
      )}

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
                if (game.id === 'game_matrix') {
                  setSelectedGameId('matrix');
                  startMemoryGame();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setSelectedGameId('reflex');
                  startReflexGame();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
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
                  Play Now →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arcade Leaderboard */}
      <div className="px-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Friends Leaderboard</span>
          </h3>
          {onOpenAddFriend && (
            <button
              onClick={onOpenAddFriend}
              className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>Add Friend</span>
            </button>
          )}
        </div>

        <div className="rounded-2xl bg-[#110c26] border border-purple-800/40 p-2 space-y-1.5">
          {userBestScore > 0 && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-900/40 border border-pink-500/40">
              <span className="w-5 font-mono text-xs font-bold text-center text-yellow-400">
                #1
              </span>

              <UserAvatar
                name={currentUser?.name || 'You'}
                avatar={currentUser?.avatar}
                size="sm"
                isOnline={true}
              />

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-white truncate">
                  {currentUser?.name ? `${currentUser.name} (You)` : 'You'}
                </h4>
                <p className="text-[10px] text-slate-400">🥇 Arcade Pioneer</p>
              </div>

              <span className="font-mono text-xs font-bold text-cyan-300">
                {userBestScore.toLocaleString()} pts
              </span>
            </div>
          )}

          {friends.length > 0 ? (
            friends.map((friend, idx) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-purple-950/40 transition-colors"
              >
                <span className="w-5 font-mono text-xs font-bold text-center text-slate-300">
                  #{userBestScore > 0 ? idx + 2 : idx + 1}
                </span>

                <UserAvatar
                  name={friend.name}
                  avatar={friend.avatar}
                  size="sm"
                  isOnline={friend.isOnline}
                  showOnline={true}
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {friend.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">🎮 Cyber Challenger</p>
                </div>

                <span className="font-mono text-xs font-bold text-cyan-300">
                  0 pts
                </span>
              </div>
            ))
          ) : (
            <div className="py-4 px-3 text-center space-y-2">
              <p className="text-xs text-slate-400">
                No friends yet. Add friends to get started.
              </p>
              {onOpenAddFriend && (
                <button
                  id="games-empty-add-friend-btn"
                  onClick={onOpenAddFriend}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold shadow-md hover:scale-105 transition-all inline-flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Friend</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
