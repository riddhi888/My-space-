import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  MessageSquare,
  Copy,
  Check,
  Share2,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Crown,
  LogOut,
  Radio,
  Flame,
  Clock,
  ThumbsUp,
  Smile,
} from 'lucide-react';
import { GameRoom, RoomParticipant, ChatMessage, sendChatMessage } from '../../services/multiplayerService';
import { gameAudio } from '../../services/gameAudio';

interface GameRoomChatAndPlayersProps {
  room: GameRoom;
  currentPlayerId: string;
  onLeaveRoom: () => void;
  accentGradient?: string;
}

const QUICK_PHRASES = [
  'Good Game! 🔥',
  'Roll that 6! 🎲',
  'Nice Shot! 🎯',
  'Hurry up ⏰',
  'Oops! 😂',
  'My Turn! ✨',
  'Rematch? ⚔️',
  'Well played 👏',
];

const COLOR_NAMES = ['Red', 'Green', 'Yellow', 'Blue'];
const COLOR_BADGES = [
  'bg-red-500/20 text-red-300 border-red-500/50',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
  'bg-amber-500/20 text-amber-300 border-amber-500/50',
  'bg-blue-500/20 text-blue-300 border-blue-500/50',
];

export const GameRoomChatAndPlayers: React.FC<GameRoomChatAndPlayersProps> = ({
  room,
  currentPlayerId,
  onLeaveRoom,
  accentGradient = 'from-pink-500 to-purple-600',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'players'>('chat');
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(gameAudio.getIsMuted());
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const playersList: RoomParticipant[] = Object.values(room.players || {});

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room.chat?.length]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?game=${room.gameType}&room=${room.code}`;
    if (navigator.share) {
      navigator
        .share({
          title: `Join my ${room.gameType.toUpperCase()} room on MySpace!`,
          text: `Join my real-time multiplayer room with code: ${room.code}!`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    await sendChatMessage(room.code, text);
    setInputText('');
    gameAudio.playChatPop();
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    gameAudio.setMuted(next);
  };

  return (
    <div className="bg-[#120b24] border border-purple-800/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Header Bar: Room Info & Controls */}
      <div className="px-4 py-3 bg-purple-950/70 border-b border-purple-800/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-pink-500/40">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-400">ROOM:</span>
            <span className="text-xs font-mono font-extrabold text-pink-400 tracking-wider">
              {room.code}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            title="Copy 6-digit Room Code"
            className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-pink-600 text-slate-300 hover:text-white transition-colors cursor-pointer border border-purple-700/50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleShareLink}
            title="Share Room Link"
            className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors cursor-pointer border border-purple-700/50"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-300" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-slate-300 hover:text-white cursor-pointer border border-purple-700/50"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={onLeaveRoom}
            title="Exit Room"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold cursor-pointer border border-rose-800/50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-purple-900/40 bg-purple-950/30 text-xs">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex-1 py-2 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeSubTab === 'chat'
              ? 'text-pink-400 border-b-2 border-pink-500 bg-purple-900/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Room Chat</span>
          {room.chat?.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[10px] font-mono">
              {room.chat.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('players')}
          className={`flex-1 py-2 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeSubTab === 'players'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-purple-900/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Online ({playersList.length}/{room.maxPlayers})</span>
        </button>
      </div>

      {/* Content Area */}
      {activeSubTab === 'chat' ? (
        <div className="flex flex-col h-56 sm:h-64">
          {/* Chat Messages Log */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs no-scrollbar">
            {(!room.chat || room.chat.length === 0) && (
              <div className="h-full flex items-center justify-center text-slate-500 text-center text-xs">
                No chat yet. Say hi or send a reaction!
              </div>
            )}
            {room.chat?.map((msg) => {
              const isMe = msg.senderId === currentPlayerId;
              const isSystem = msg.senderId === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center py-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/40 text-[10px] text-pink-300 font-mono">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 px-1 font-semibold">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <div
                    className={`px-3 py-1.5 rounded-2xl max-w-[85%] break-words ${
                      isMe
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-xs shadow-md'
                        : 'bg-purple-950/80 border border-purple-800/60 text-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Reaction Pills */}
          <div className="px-3 py-1.5 bg-black/40 border-t border-purple-900/30 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PHRASES.map((phrase) => (
              <button
                key={phrase}
                onClick={() => handleSendMessage(phrase)}
                className="px-2 py-0.5 rounded-full bg-purple-950 hover:bg-pink-600/40 text-[10px] text-slate-300 hover:text-white border border-purple-800/60 hover:border-pink-500/50 whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-2 bg-purple-950/40 border-t border-purple-800/40 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send message to room..."
              maxLength={120}
              className="flex-1 bg-black/60 border border-purple-800/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-pink-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Players Roster */
        <div className="p-3 h-56 sm:h-64 overflow-y-auto space-y-2 text-xs no-scrollbar">
          <div className="text-[11px] text-slate-400 flex items-center justify-between pb-1 border-b border-purple-900/40">
            <span>Participants ({playersList.length}/{room.maxPlayers})</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Live Sync
            </span>
          </div>

          {playersList.map((p) => {
            const isMe = p.id === currentPlayerId;
            const colorClass = COLOR_BADGES[p.colorIndex % 4] || COLOR_BADGES[0];
            const colorName = COLOR_NAMES[p.colorIndex % 4] || 'Player';

            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl flex items-center justify-between ${
                  isMe
                    ? 'bg-purple-900/40 border border-pink-500/40'
                    : 'bg-purple-950/40 border border-purple-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover border border-purple-500/50"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <span>{p.name}</span>
                      {isMe && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1 rounded-sm border border-cyan-800/60">
                          YOU
                        </span>
                      )}
                      {p.isHost && (
                        <span title="Room Host">
                          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Score: <span className="font-mono text-pink-300 font-bold">{p.score || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}>
                    {colorName}
                  </span>
                </div>
              </div>
            );
          })}

          {playersList.length < room.maxPlayers && (
            <div className="p-3 rounded-2xl border border-dashed border-purple-800/40 text-center text-slate-400 space-y-1">
              <p className="text-xs">Waiting for {room.maxPlayers - playersList.length} more player(s)...</p>
              <button
                onClick={handleShareLink}
                className="text-[11px] text-cyan-400 hover:underline font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Share2 className="w-3 h-3" />
                <span>Invite Friends to Room {room.code}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
