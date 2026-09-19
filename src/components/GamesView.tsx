import React, { useState } from 'react';
import {
  Gamepad2,
  Trophy,
  Sparkles,
  Zap,
  Flame,
  Users,
  Star,
  Play,
  Brain,
  Hash,
  Swords,
  ChevronRight,
  Award,
} from 'lucide-react';
import { GameItem } from '../types';
import { TicTacToeGame } from './games/TicTacToeGame';
import { RockPaperScissorsGame } from './games/RockPaperScissorsGame';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { NumberGuessingGame } from './games/NumberGuessingGame';

interface GamesViewProps {
  games: GameItem[];
}

type ActiveGameKey = 'tictactoe' | 'rps' | 'memory' | 'numberguess';

interface GameCardMeta {
  key: ActiveGameKey;
  title: string;
  category: string;
  badge: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  rating: number;
  playersOnline: number;
  thumbnail: string;
  accentColor: string;
  borderHover: string;
}

const gameCardsList: GameCardMeta[] = [
  {
    key: 'tictactoe',
    title: 'Tic-Tac-Toe',
    category: 'Strategy & Duals',
    badge: '3x3 Neon Grid',
    description: 'Connect three neon marks in a row vs Cyber AI or a friend with Pass & Play.',
    icon: Sparkles,
    rating: 4.9,
    playersOnline: 2450,
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=600&q=80',
    accentColor: 'from-pink-500 to-purple-600',
    borderHover: 'hover:border-pink-500',
  },
  {
    key: 'rps',
    title: 'Rock Paper Scissors',
    category: 'Hand Battle Vs AI',
    badge: 'Streak Multiplier',
    description: 'Duel the Cyber Bot with Rock, Paper, or Scissors and rack up win streaks.',
    icon: Swords,
    rating: 4.8,
    playersOnline: 1890,
    thumbnail: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
    accentColor: 'from-cyan-500 to-blue-600',
    borderHover: 'hover:border-cyan-500',
  },
  {
    key: 'memory',
    title: 'Memory Match',
    category: 'Brain & Cyber Cards',
    badge: '12 Cyber Tiles',
    description: 'Flip holographic cards to pair up cyber symbols in fewest moves & time.',
    icon: Brain,
    rating: 4.9,
    playersOnline: 3120,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    accentColor: 'from-purple-500 to-pink-500',
    borderHover: 'hover:border-purple-400',
  },
  {
    key: 'numberguess',
    title: 'Number Guessing',
    category: 'Quantum Logic Code',
    badge: '1 - 100 Range',
    description: 'Crack the secret frequency code using dynamic higher/lower signal feedback.',
    icon: Hash,
    rating: 4.7,
    playersOnline: 1420,
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    accentColor: 'from-amber-500 to-rose-600',
    borderHover: 'hover:border-amber-400',
  },
];

export const GamesView: React.FC<GamesViewProps> = () => {
  const [activeGameKey, setActiveGameKey] = useState<ActiveGameKey>('tictactoe');

  const scrollToArena = () => {
    const arenaElement = document.getElementById('active-game-arena');
    if (arenaElement) {
      arenaElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectGame = (key: ActiveGameKey) => {
    setActiveGameKey(key);
    scrollToArena();
  };



  return (
    <div className="space-y-6 pb-28">
      {/* Arcade Header */}
      <div className="px-4 pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span>MySpace Arcade</span>
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400">Play instant cyber mini-games & earn neon trophies</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-xs font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-bounce" />
            <span>2,150 TOKENS</span>
          </div>
        </div>

        {/* Game Selector Tab Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {gameCardsList.map((g) => {
            const isSelected = activeGameKey === g.key;
            return (
              <button
                key={g.key}
                id={`game-tab-${g.key}`}
                onClick={() => handleSelectGame(g.key)}
                className={`px-3 py-1.5 rounded-2xl font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] scale-105 border border-pink-400'
                    : 'bg-purple-950/50 text-slate-400 hover:text-white border border-purple-900/40 hover:border-purple-700'
                }`}
              >
                <span>{g.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Playable Game Arena */}
      <div id="active-game-arena" className="px-4">
        {activeGameKey === 'tictactoe' && <TicTacToeGame />}
        {activeGameKey === 'rps' && <RockPaperScissorsGame />}
        {activeGameKey === 'memory' && <MemoryMatchGame />}
        {activeGameKey === 'numberguess' && <NumberGuessingGame />}
      </div>

      {/* Attractive Game Cards Section */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-pink-400" />
            <span>Featured Cyber Games</span>
          </h3>
          <span className="text-[11px] font-mono text-cyan-400">4 PLAYABLE</span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {gameCardsList.map((card) => {
            const isCurrentlyPlaying = activeGameKey === card.key;
            const Icon = card.icon;

            return (
              <div
                key={card.key}
                id={`game-card-${card.key}`}
                onClick={() => handleSelectGame(card.key)}
                className={`p-3.5 rounded-3xl bg-[#120b28] border transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-lg ${
                  isCurrentlyPlaying
                    ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.35)] ring-1 ring-pink-500/50'
                    : 'border-purple-800/40 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]'
                }`}
              >
                <div>
                  {/* Card Media Header */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-3">
                    <img
                      src={card.thumbnail}
                      alt={card.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top badging */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-mono font-bold text-pink-300 border border-pink-500/40">
                        {card.badge}
                      </span>
                    </div>

                    {/* Top right rating */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-xs text-[10px] font-mono text-amber-300 flex items-center gap-1 border border-amber-500/30">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{card.rating}</span>
                    </div>

                    {/* Bottom Title Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-pink-500/30 backdrop-blur-xs border border-pink-400 flex items-center justify-center text-pink-300">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-display font-bold text-sm text-white drop-shadow-md">
                          {card.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Description & Category */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-400 font-semibold">{card.category}</span>
                      <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                        <Users className="w-3 h-3 text-emerald-400" />
                        <span>{card.playersOnline.toLocaleString()} online</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Bottom CTA Action Button */}
                <div className="mt-3 pt-2.5 border-t border-purple-900/30 flex items-center justify-between">
                  <span className="text-[11px] text-pink-300 font-medium">
                    Instructions & Restart included
                  </span>
                  <button
                    id={`play-game-btn-${card.key}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectGame(card.key);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCurrentlyPlaying
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                        : 'bg-purple-900/50 hover:bg-pink-600 text-white border border-purple-700/50'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{isCurrentlyPlaying ? 'Playing' : 'Play Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>


    </div>
  );
};
