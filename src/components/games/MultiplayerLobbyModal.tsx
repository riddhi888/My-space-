import React, { useState } from 'react';
import {
  X,
  Play,
  Plus,
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  Gamepad2,
  Radio,
  Flame,
  User,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';
import {
  createMultiplayerRoom,
  joinMultiplayerRoom,
  getLocalPlayerProfile,
  saveLocalPlayerProfile,
  isFirebaseConfigured,
  GameRoom,
} from '../../services/multiplayerService';
import { createInitialLudoState } from './LudoMultiplayerGame';
import { createInitialCarromState } from './CarromMultiplayerGame';
import { createInitialTicTacToeState } from './TicTacToeMultiplayerGame';

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomEntered: (room: GameRoom) => void;
  preselectedGame?: 'ludo' | 'carrom' | 'tictactoe';
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
];

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  isOpen,
  onClose,
  onRoomEntered,
  preselectedGame = 'ludo',
}) => {
  const [activeTab, setActiveTab] = useState<'join' | 'create' | 'profile'>('create');
  const [selectedGame, setSelectedGame] = useState<'ludo' | 'carrom' | 'tictactoe'>(preselectedGame);
  const [ludoMaxPlayers, setLudoMaxPlayers] = useState<number>(4);

  // Profile fields (localStorage)
  const initialProfile = getLocalPlayerProfile();
  const [playerName, setPlayerName] = useState(initialProfile.name);
  const [playerAvatar, setPlayerAvatar] = useState(initialProfile.avatar);
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Join Room code field
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Created Room Share State
  const [createdRoom, setCreatedRoom] = useState<GameRoom | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalPlayerProfile(playerName, playerAvatar);
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2000);
  };

  const handleCreateRoom = async () => {
    setIsProcessing(true);
    setJoinError('');

    try {
      let initialGameState: any = {};
      const maxPlayers = selectedGame === 'ludo' ? ludoMaxPlayers : 2;

      if (selectedGame === 'ludo') {
        initialGameState = createInitialLudoState(maxPlayers);
      } else if (selectedGame === 'carrom') {
        const player = getLocalPlayerProfile();
        initialGameState = createInitialCarromState(player.id);
      } else {
        initialGameState = createInitialTicTacToeState();
      }

      const room = await createMultiplayerRoom(
        selectedGame,
        maxPlayers,
        initialGameState
      );

      setCreatedRoom(room);
    } catch (err: any) {
      setJoinError(err?.message || 'Failed to create room.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnterCreatedRoom = () => {
    if (!createdRoom) return;
    onRoomEntered(createdRoom);
    onClose();
  };

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setIsProcessing(true);
    setJoinError('');

    try {
      const res = await joinMultiplayerRoom(joinCode.trim());
      if (res.success && res.room) {
        onRoomEntered(res.room);
        onClose();
      } else {
        setJoinError(res.error || 'Failed to join room.');
      }
    } catch (err: any) {
      setJoinError(err?.message || 'Error connecting to room.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyCreatedCode = () => {
    if (!createdRoom) return;
    navigator.clipboard.writeText(createdRoom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareCreatedLink = () => {
    if (!createdRoom) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?game=${createdRoom.gameType}&room=${createdRoom.code}`;
    if (navigator.share) {
      navigator.share({
        title: `Join my ${createdRoom.gameType.toUpperCase()} room on MySpace!`,
        text: `Play with me! Room code: ${createdRoom.code}`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasFirebase = isFirebaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#110924] border border-purple-800/60 rounded-3xl shadow-[0_0_50px_rgba(236,72,153,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-950 via-[#180d33] to-purple-950 border-b border-purple-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>Multiplayer Arena</span>
                <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-slate-400">Play live with friends via 6-digit room code</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-950/80 hover:bg-rose-900/60 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-purple-800/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Status Pill */}
        <div className="px-4 py-1.5 bg-black/40 border-b border-purple-900/30 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-slate-300 font-mono">
              {hasFirebase ? 'Firebase Realtime DB: Connected' : 'Local & Cross-Tab P2P Sync: Active'}
            </span>
          </div>
          <span className="text-pink-400 font-bold font-mono">LUDO KING SYNC</span>
        </div>

        {/* Modal Sub Tabs */}
        <div className="flex border-b border-purple-900/40 bg-purple-950/40 text-xs">
          <button
            onClick={() => {
              setActiveTab('create');
              setCreatedRoom(null);
            }}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'create'
                ? 'text-pink-400 border-b-2 border-pink-500 bg-purple-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Room</span>
          </button>

          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'join'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-purple-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Join Room</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'profile'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-purple-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Name</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar flex-1 text-xs">
          {/* TAB 1: CREATE ROOM */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              {!createdRoom ? (
                <>
                  {/* Select Game */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                      1. Select Multiplayer Game
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedGame('ludo')}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          selectedGame === 'ludo'
                            ? 'bg-gradient-to-tr from-pink-950/90 to-purple-900/80 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] ring-1 ring-pink-500'
                            : 'bg-purple-950/40 border-purple-800/40 hover:border-purple-700'
                        }`}
                      >
                        <div className="text-lg mb-1">🎲</div>
                        <div className="font-bold text-white text-xs">Ludo</div>
                        <div className="text-[10px] text-pink-300 font-mono">2-4 Players</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedGame('carrom')}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          selectedGame === 'carrom'
                            ? 'bg-gradient-to-tr from-pink-950/90 to-purple-900/80 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] ring-1 ring-pink-500'
                            : 'bg-purple-950/40 border-purple-800/40 hover:border-purple-700'
                        }`}
                      >
                        <div className="text-lg mb-1">🎯</div>
                        <div className="font-bold text-white text-xs">Carrom</div>
                        <div className="text-[10px] text-cyan-300 font-mono">1v1 Online</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedGame('tictactoe')}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          selectedGame === 'tictactoe'
                            ? 'bg-gradient-to-tr from-pink-950/90 to-purple-900/80 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] ring-1 ring-pink-500'
                            : 'bg-purple-950/40 border-purple-800/40 hover:border-purple-700'
                        }`}
                      >
                        <div className="text-lg mb-1">❌⭕</div>
                        <div className="font-bold text-white text-xs">Tic Tac Toe</div>
                        <div className="text-[10px] text-amber-300 font-mono">1v1 Neon</div>
                      </button>
                    </div>
                  </div>

                  {/* Ludo Player Capacity Selector */}
                  {selectedGame === 'ludo' && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                        2. Player Capacity
                      </label>
                      <div className="flex gap-2">
                        {[2, 4].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setLudoMaxPlayers(num)}
                            className={`flex-1 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                              ludoMaxPlayers === num
                                ? 'bg-pink-600 text-white border-pink-400 shadow-md'
                                : 'bg-purple-950/50 text-slate-400 border-purple-800/50'
                            }`}
                          >
                            {num} Players
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Player Summary Card */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-purple-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={playerAvatar}
                        alt={playerName}
                        className="w-8 h-8 rounded-full object-cover border border-pink-400"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">{playerName}</div>
                        <div className="text-[10px] text-slate-400">Hosting as Player 1</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="text-[11px] text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      Change Name
                    </button>
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={handleCreateRoom}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-extrabold text-xs tracking-wide uppercase shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:opacity-95 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isProcessing ? 'Creating Room...' : 'Generate 6-Digit Room Code'}</span>
                  </button>
                </>
              ) : (
                /* Room Successfully Created View (Like Ludo King) */
                <div className="p-4 rounded-3xl bg-purple-950/70 border-2 border-pink-500 shadow-2xl text-center space-y-4">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/40">
                      ROOM CREATED SUCCESSFULLY!
                    </span>
                    <p className="text-xs text-slate-300 mt-2">
                      Share this 6-digit code with your friends to play:
                    </p>
                  </div>

                  {/* Big 6-digit room code display */}
                  <div className="p-4 rounded-2xl bg-black/70 border border-pink-500/60 flex items-center justify-center gap-3">
                    <span className="font-mono font-black text-3xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
                      {createdRoom.code}
                    </span>
                    <button
                      onClick={handleCopyCreatedCode}
                      className="p-2 rounded-xl bg-purple-900/60 hover:bg-pink-600 text-white transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Share buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleShareCreatedLink}
                      className="flex-1 py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-cyan-300 font-bold text-xs border border-purple-700/60 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Room Link</span>
                    </button>
                    <button
                      onClick={handleEnterCreatedRoom}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-lg hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Enter Arena Now</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: JOIN ROOM WITH 6-DIGIT CODE */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinWithCode} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                  Enter 6-Digit Room Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.replace(/[^0-9]/g, ''));
                    setJoinError('');
                  }}
                  placeholder="e.g. 849201"
                  className="w-full text-center font-mono font-black text-2xl tracking-widest py-3 rounded-2xl bg-black/70 border-2 border-purple-800/80 text-white placeholder-slate-600 focus:outline-hidden focus:border-cyan-400 shadow-inner"
                />
                <p className="text-[10px] text-slate-400 text-center">
                  Ask your friend for their 6-digit code or paste it here.
                </p>
              </div>

              {joinError && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs text-center">
                  {joinError}
                </div>
              )}

              <button
                type="submit"
                disabled={joinCode.length !== 6 || isProcessing}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-extrabold text-xs tracking-wide uppercase shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:opacity-95 active:scale-98 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>{isProcessing ? 'Connecting to Room...' : 'Join Game Room'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: LOCALSTORAGE PLAYER IDENTITY */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                  Your Arcade Display Name
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-800/80 text-white font-bold text-xs focus:outline-hidden focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400">
                  Stored in your browser (localStorage) so friends recognize you in rooms.
                </p>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                  Choose Player Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPlayerAvatar(av)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        playerAvatar === av
                          ? 'border-amber-400 scale-105 shadow-[0_0_12px_#f59e0b]'
                          : 'border-purple-900/60 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {profileSavedToast && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile updated and saved to localStorage!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold text-xs uppercase shadow-md hover:opacity-95 cursor-pointer"
              >
                Save Player Name
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
