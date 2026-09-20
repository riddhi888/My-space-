import React, { useState, useEffect } from 'react';
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
  Radio,
  Plus,
  Copy,
  Share2,
  User,
  Shield,
  Target,
  Circle,
  X as XIcon,
} from 'lucide-react';
import { GameItem } from '../types';
import { TicTacToeGame } from './games/TicTacToeGame';
import { RockPaperScissorsGame } from './games/RockPaperScissorsGame';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { NumberGuessingGame } from './games/NumberGuessingGame';
import { LudoMultiplayerGame, createInitialLudoState } from './games/LudoMultiplayerGame';
import { CarromMultiplayerGame, createInitialCarromState } from './games/CarromMultiplayerGame';
import { TicTacToeMultiplayerGame, createInitialTicTacToeState } from './games/TicTacToeMultiplayerGame';
import { MultiplayerLobbyModal } from './games/MultiplayerLobbyModal';
import {
  GameRoom,
  subscribeToRoom,
  leaveMultiplayerRoom,
  joinMultiplayerRoom,
  getLocalPlayerProfile,
  isFirebaseConfigured,
  createMultiplayerRoom,
} from '../services/multiplayerService';

interface GamesViewProps {
  games: GameItem[];
}

type ActiveGameKey = 'tictactoe' | 'rps' | 'memory' | 'numberguess';
type MultiplayerGameType = 'ludo' | 'carrom' | 'tictactoe';

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

const classicGameCardsList: GameCardMeta[] = [
  {
    key: 'tictactoe',
    title: 'Tic-Tac-Toe Solo / AI',
    category: 'Cyber Strategy',
    badge: 'Classic Bot',
    description: 'Connect three neon marks in a row vs Cyber AI or offline pass & play.',
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
  // Multiplayer room state
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(null);
  const [isLobbyModalOpen, setIsLobbyModalOpen] = useState(false);
  const [modalPreselectGame, setModalPreselectGame] = useState<MultiplayerGameType>('ludo');
  const [playerName, setPlayerName] = useState<string>(getLocalPlayerProfile().name);

  // Classic solo games tab
  const [activeGameKey, setActiveGameKey] = useState<ActiveGameKey>('tictactoe');
  const [gamesViewMode, setGamesViewMode] = useState<'multiplayer' | 'classic'>('multiplayer');

  // Real-time listener for active room
  useEffect(() => {
    if (!activeRoom?.code) return;

    const unsub = subscribeToRoom(activeRoom.code, (updatedRoom) => {
      setActiveRoom(updatedRoom);
    });

    return () => unsub();
  }, [activeRoom?.code]);

  // Check URL query parameters for auto-joining room (e.g. ?game=ludo&room=123456)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('room');
    const gameType = params.get('game') as MultiplayerGameType | null;

    if (roomCode && roomCode.length === 6) {
      joinMultiplayerRoom(roomCode).then((res) => {
        if (res.success && res.room) {
          setActiveRoom(res.room);
          setGamesViewMode('multiplayer');
          // Clean up URL without reload
          window.history.replaceState({}, '', window.location.pathname);
        }
      });
    }
  }, []);

  const handleOpenLobbyModal = (game: MultiplayerGameType = 'ludo') => {
    setModalPreselectGame(game);
    setIsLobbyModalOpen(true);
  };

  const handleLeaveRoom = async () => {
    if (activeRoom) {
      await leaveMultiplayerRoom(activeRoom.code);
      setActiveRoom(null);
    }
  };

  const handleQuickCreate = async (gameType: MultiplayerGameType) => {
    const player = getLocalPlayerProfile();
    let initialGameState: any = {};
    const maxPlayers = gameType === 'ludo' ? 4 : 2;

    if (gameType === 'ludo') {
      initialGameState = createInitialLudoState(maxPlayers);
    } else if (gameType === 'carrom') {
      initialGameState = createInitialCarromState(player.id);
    } else {
      initialGameState = createInitialTicTacToeState();
    }

    const room = await createMultiplayerRoom(gameType, maxPlayers, initialGameState);
    setActiveRoom(room);
    setGamesViewMode('multiplayer');
  };

  const hasFirebase = isFirebaseConfigured();

  return (
    <div className="space-y-6 pb-28">
      {/* Arcade Top Header */}
      <div className="px-4 pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span>MySpace Arcade 2008</span>
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400">Real-time online multiplayer rooms & cyber arcade</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-xs font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-bounce" />
            <span>2,450 TOKENS</span>
          </div>
        </div>

        {/* Global Multiplayer Status & Player Bar */}
        <div className="p-3 rounded-2xl bg-[#13082a] border border-purple-800/50 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={getLocalPlayerProfile().avatar}
                alt={playerName}
                className="w-8 h-8 rounded-full object-cover border border-pink-500"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{playerName}</span>
                <span className="text-[10px] font-mono text-pink-300 bg-pink-950/80 px-1.5 py-0.2 rounded-full border border-pink-500/40">
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {hasFirebase ? 'Firebase Realtime DB: Connected 🟢' : 'Local & Tab P2P Sync: Active ⚡'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenLobbyModal('ludo')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Room Code</span>
            </button>
          </div>
        </div>

        {/* Main Category Switcher (Multiplayer vs Classic Solo) */}
        <div className="flex rounded-2xl bg-purple-950/60 p-1 border border-purple-900/50 text-xs">
          <button
            id="tab-multiplayer-mode"
            onClick={() => setGamesViewMode('multiplayer')}
            className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              gamesViewMode === 'multiplayer'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>Multiplayer Games (Ludo King Style)</span>
          </button>

          <button
            id="tab-classic-mode"
            onClick={() => setGamesViewMode('classic')}
            className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              gamesViewMode === 'classic'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Classic Solo & AI Mini-Games</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MULTIPLAYER SECTION */}
      {/* ------------------------------------------------------------- */}
      {gamesViewMode === 'multiplayer' && (
        <div className="px-4 space-y-4">
          {/* If there is an active room, render the interactive multiplayer game! */}
          {activeRoom ? (
            <div id="active-multiplayer-arena" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                    Active Room: {activeRoom.gameType.toUpperCase()} (Code: {activeRoom.code})
                  </h3>
                </div>
                <button
                  onClick={handleLeaveRoom}
                  className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer"
                >
                  Exit to Lobby
                </button>
              </div>

              {activeRoom.gameType === 'ludo' && (
                <LudoMultiplayerGame room={activeRoom} onLeaveRoom={handleLeaveRoom} />
              )}
              {activeRoom.gameType === 'carrom' && (
                <CarromMultiplayerGame room={activeRoom} onLeaveRoom={handleLeaveRoom} />
              )}
              {activeRoom.gameType === 'tictactoe' && (
                <TicTacToeMultiplayerGame room={activeRoom} onLeaveRoom={handleLeaveRoom} />
              )}
            </div>
          ) : (
            /* Lobby Room Cards Grid */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-pink-400 animate-pulse" />
                  <span>Choose a Multiplayer Game to Host or Join</span>
                </h3>
                <span className="text-[11px] font-mono text-cyan-400">3 ONLINE MODES</span>
              </div>

              {/* 3 Real Multiplayer Games */}
              <div className="grid grid-cols-1 gap-4">
                {/* 1. LUDO MULTIPLAYER */}
                <div className="p-4 rounded-3xl bg-[#120a28] border border-purple-800/50 hover:border-pink-500/60 shadow-xl transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center group">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-yellow-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                      🎲
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-extrabold text-base text-white">
                          Ludo Multiplayer
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/40">
                          2-4 Players
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 max-w-md">
                        Create private room code (Ludo King style), roll 3D dice, capture opponents, and race all 4 tokens to home center!
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-cyan-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          <span>4,820 in rooms</span>
                        </span>
                        <span>• Safe Star Squares</span>
                        <span>• Bonus Rolls</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    <button
                      id="create-ludo-room-btn"
                      onClick={() => handleQuickCreate('ludo')}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Room</span>
                    </button>
                    <button
                      onClick={() => handleOpenLobbyModal('ludo')}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-cyan-300 font-bold text-xs border border-purple-700/60 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Join with Code</span>
                    </button>
                  </div>
                </div>

                {/* 2. CARROM MULTIPLAYER */}
                <div className="p-4 rounded-3xl bg-[#120a28] border border-purple-800/50 hover:border-cyan-500/60 shadow-xl transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center group">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-800 to-cyan-700 flex items-center justify-center text-3xl shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                      🎯
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-extrabold text-base text-white">
                          Carrom Multiplayer
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                          1v1 Online Duel
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 max-w-md">
                        Realistic canvas physics! Slide striker along baseline, adjust power and aim angle, pocket white/black pieces and the Red Queen.
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-cyan-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          <span>2,940 playing</span>
                        </span>
                        <span>• Real 2D Physics</span>
                        <span>• Striker Baseline</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    <button
                      id="create-carrom-room-btn"
                      onClick={() => handleQuickCreate('carrom')}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Room</span>
                    </button>
                    <button
                      onClick={() => handleOpenLobbyModal('carrom')}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-cyan-300 font-bold text-xs border border-purple-700/60 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Join with Code</span>
                    </button>
                  </div>
                </div>

                {/* 3. TIC TAC TOE ONLINE */}
                <div className="p-4 rounded-3xl bg-[#120a28] border border-purple-800/50 hover:border-amber-500/60 shadow-xl transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center group">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-900 via-purple-900 to-amber-700 flex items-center justify-center text-3xl shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                      ❌⭕
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-extrabold text-base text-white">
                          Tic Tac Toe Online
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                          1v1 Neon Room
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 max-w-md">
                        Real-time moves sync on 3x3 neon grid. Challenge friends with a 6-digit code, instant in-game chat, and rematch streak tracker.
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-cyan-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          <span>3,610 online</span>
                        </span>
                        <span>• Neon Win Lines</span>
                        <span>• Live Chat</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    <button
                      id="create-tictactoe-room-btn"
                      onClick={() => handleQuickCreate('tictactoe')}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-xs shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Room</span>
                    </button>
                    <button
                      onClick={() => handleOpenLobbyModal('tictactoe')}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-cyan-300 font-bold text-xs border border-purple-700/60 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Join with Code</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CLASSIC SOLO MINI-GAMES SECTION */}
      {/* ------------------------------------------------------------- */}
      {gamesViewMode === 'classic' && (
        <div className="space-y-4">
          {/* Active Playable Solo Arena */}
          <div id="active-game-arena" className="px-4">
            {activeGameKey === 'tictactoe' && <TicTacToeGame />}
            {activeGameKey === 'rps' && <RockPaperScissorsGame />}
            {activeGameKey === 'memory' && <MemoryMatchGame />}
            {activeGameKey === 'numberguess' && <NumberGuessingGame />}
          </div>

          {/* Cards Grid */}
          <div className="px-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-purple-400" />
                <span>Single-Player Cyber Games</span>
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">4 AVAILABLE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {classicGameCardsList.map((card) => {
                const isCurrentlyPlaying = activeGameKey === card.key;
                const Icon = card.icon;

                return (
                  <div
                    key={card.key}
                    id={`game-card-${card.key}`}
                    onClick={() => setActiveGameKey(card.key)}
                    className={`p-3.5 rounded-3xl bg-[#120b28] border transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-lg ${
                      isCurrentlyPlaying
                        ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.35)] ring-1 ring-pink-500/50'
                        : 'border-purple-800/40 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]'
                    }`}
                  >
                    <div>
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-3">
                        <img
                          src={card.thumbnail}
                          alt={card.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-mono font-bold text-pink-300 border border-pink-500/40">
                            {card.badge}
                          </span>
                        </div>
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

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-cyan-400 font-semibold">{card.category}</span>
                          <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{card.playersOnline.toLocaleString()} online</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-purple-900/30 flex items-center justify-between">
                      <span className="text-[11px] text-pink-300 font-medium">Single Player AI Mode</span>
                      <button
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCurrentlyPlaying
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
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
      )}

      {/* Multiplayer Lobby Modal for Create / Join / Name */}
      <MultiplayerLobbyModal
        isOpen={isLobbyModalOpen}
        onClose={() => {
          setIsLobbyModalOpen(false);
          setPlayerName(getLocalPlayerProfile().name);
        }}
        preselectedGame={modalPreselectGame}
        onRoomEntered={(room) => {
          setActiveRoom(room);
          setGamesViewMode('multiplayer');
          setPlayerName(getLocalPlayerProfile().name);
        }}
      />
    </div>
  );
};
