import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Phone,
  Video,
  Gamepad2,
  Music,
  Users,
  Play,
  Pause,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Friend } from '../types';

interface FriendProfileModalProps {
  friend: Friend | null;
  onClose: () => void;
  onStartChat: (friend: Friend) => void;
  onStartVoiceCall: (friend: Friend) => void;
  onStartVideoCall: (friend: Friend) => void;
  onPlayGameWithFriend: (friend: Friend) => void;
  onShowToast?: (msg: string) => void;
}

export const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  friend,
  onClose,
  onStartChat,
  onStartVoiceCall,
  onStartVideoCall,
  onPlayGameWithFriend,
  onShowToast,
}) => {
  const [isPlayingSong, setIsPlayingSong] = useState(false);

  if (!friend) return null;

  const handleToggleSong = () => {
    setIsPlayingSong(!isPlayingSong);
    onShowToast?.(
      isPlayingSong
        ? 'Paused favorite song preview'
        : `Playing "${friend.favoriteSong?.title || 'Neon Track'}"`
    );
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0e0920] border border-purple-800/40 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3)] max-h-[90vh] flex flex-col">
        {/* Cover Banner with Avatar */}
        <div className="relative h-40 w-full shrink-0">
          <img
            src={
              friend.coverImage ||
              'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
            }
            alt="Cover"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0e0920]/40 to-[#0e0920]" />

          {/* Top Actions: Close & Share */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono text-pink-300 border border-pink-500/30">
              Cyber Profile
            </span>
            <div className="flex items-center gap-1.5">
              <button
                id="friend-profile-share-btn"
                onClick={() => onShowToast?.(`Shared @${friend.handle} profile link!`)}
                className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-pink-400 transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                id="friend-profile-close-btn"
                onClick={onClose}
                className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-rose-400 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile Avatar Overlay */}
          <div className="absolute -bottom-8 left-6 flex items-end gap-3">
            <div className="relative">
              <img
                src={friend.avatar}
                alt={friend.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border-3 border-[#0e0920] shadow-[0_0_20px_rgba(236,72,153,0.4)]"
              />
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#0e0920] ${
                  friend.isOnline
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-slate-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-10 px-6 pb-6 overflow-y-auto space-y-5 no-scrollbar">
          {/* Identity & Status */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-white">
                {friend.name}
              </h2>
              <span className="text-cyan-400 text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-800/40">
                Verified
              </span>
            </div>
            <p className="text-xs font-mono text-pink-400 mt-0.5">{friend.handle}</p>

            <div className="mt-2.5 flex items-center gap-2 text-xs">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 ${
                  friend.isOnline
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                    : 'bg-purple-950/40 border border-purple-800/30 text-slate-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    friend.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                {friend.isOnline ? 'Online Now' : `Offline • ${friend.lastSeen || 'Recent'}`}
              </span>

              {friend.mutualFriends && (
                <span className="px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-800/30 text-[11px] text-slate-300 flex items-center gap-1">
                  <Users className="w-3 h-3 text-purple-400" />
                  {friend.mutualFriends} mutual friends
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Grid: Message, Voice, Video, Game */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              id="friend-profile-msg-btn"
              onClick={() => {
                onStartChat(friend);
                onClose();
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-gradient-to-b from-purple-900/40 to-purple-950/60 border border-purple-700/40 hover:border-pink-500 text-white transition-all group hover:scale-105"
            >
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium">Chat</span>
            </button>

            <button
              id="friend-profile-voice-btn"
              onClick={() => {
                onStartVoiceCall(friend);
                onClose();
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-gradient-to-b from-purple-900/40 to-purple-950/60 border border-purple-700/40 hover:border-cyan-500 text-white transition-all group hover:scale-105"
            >
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium">Voice</span>
            </button>

            <button
              id="friend-profile-video-btn"
              onClick={() => {
                onStartVideoCall(friend);
                onClose();
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-gradient-to-b from-purple-900/40 to-purple-950/60 border border-purple-700/40 hover:border-pink-500 text-white transition-all group hover:scale-105"
            >
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Video className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium">Video</span>
            </button>

            <button
              id="friend-profile-game-btn"
              onClick={() => {
                onPlayGameWithFriend(friend);
                onClose();
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-gradient-to-b from-purple-900/40 to-purple-950/60 border border-purple-700/40 hover:border-emerald-500 text-white transition-all group hover:scale-105"
            >
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium">Duel</span>
            </button>
          </div>

          {/* Status Mood Box */}
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/30">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-400" /> Current Cyber Mood
            </span>
            <p className="text-sm font-medium text-pink-200 mt-1">
              {friend.statusText || 'Vibing across the cyberspace matrix ✨'}
            </p>
          </div>

          {/* Bio Description */}
          {friend.bio && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                About
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-purple-950/20 p-3 rounded-2xl border border-purple-900/30">
                {friend.bio}
              </p>
            </div>
          )}

          {/* Favorite Song Card */}
          {friend.favoriteSong && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Top Profile Track
              </h4>
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-pink-950/20 to-purple-950/40 border border-pink-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {friend.favoriteSong.title}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {friend.favoriteSong.artist}
                    </p>
                  </div>
                </div>

                <button
                  id="friend-profile-play-song-btn"
                  onClick={handleToggleSong}
                  className="p-2.5 rounded-full bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:scale-110 active:scale-95 transition-all"
                >
                  {isPlayingSong ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tags & Interests */}
          {friend.tags && friend.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Interests & Matrix Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {friend.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-xl bg-purple-950/50 border border-purple-800/40 text-[11px] font-mono text-cyan-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
