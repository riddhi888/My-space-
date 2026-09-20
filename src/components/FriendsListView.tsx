import React, { useState } from 'react';
import {
  Search,
  Users,
  MessageSquare,
  Phone,
  Video,
  Gamepad2,
  Sparkles,
  ExternalLink,
  UserCheck,
  Compass,
} from 'lucide-react';
import { Friend, SocialUser } from '../types';

interface FriendsListViewProps {
  friends: Friend[];
  onOpenChat: (friend: Friend) => void;
  onStartVoiceCall: (friend: Friend) => void;
  onStartVideoCall: (friend: Friend) => void;
  onPlayGame: (friend: Friend) => void;
  onOpenProfile: (friend: Friend) => void;
  onDiscoverMore: () => void;
}

export const FriendsListView: React.FC<FriendsListViewProps> = ({
  friends,
  onOpenChat,
  onStartVoiceCall,
  onStartVideoCall,
  onPlayGame,
  onOpenProfile,
  onDiscoverMore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'offline'>('all');

  const onlineCount = friends.filter((f) => f.isOnline).length;
  const offlineCount = friends.length - onlineCount;

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch =
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (friend.statusText && friend.statusText.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'online') return friend.isOnline;
    if (activeFilter === 'offline') return !friend.isOnline;
    return true;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Header Summary Card */}
      <div className="px-4 pt-1 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span>Friends List</span>
              <UserCheck className="w-4 h-4 text-cyan-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Your connected cyber circle & real-time presence
            </p>
          </div>

          <button
            id="friends-discover-cta-btn"
            onClick={onDiscoverMore}
            className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-700/50 hover:border-pink-500 text-pink-300 text-xs font-semibold flex items-center gap-1.5 transition-all hover:bg-pink-500/20 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-pink-400" />
            <span>Discover</span>
          </button>
        </div>

        {/* Presence Status Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-[#140e2e] border border-purple-800/40">
            <span className="font-display font-bold text-base text-white">
              {friends.length}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Total Friends</p>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#140e2e] border border-purple-800/40">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-display font-bold text-base text-emerald-400">
                {onlineCount}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Online Now</p>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#140e2e] border border-purple-800/40">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="font-display font-bold text-base text-slate-300">
                {offlineCount}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Offline</p>
          </div>
        </div>

        {/* Search Input for Friends */}
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="friends-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends by name or @username..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#120b29] border border-purple-800/40 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-purple-900/40"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Filter Tabs: All, Online, Offline */}
        <div className="flex gap-2">
          {(
            [
              { id: 'all', label: 'All Friends', count: friends.length },
              { id: 'online', label: '🟢 Online', count: onlineCount },
              { id: 'offline', label: '⚪ Offline', count: offlineCount },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              id={`friends-filter-${chip.id}`}
              onClick={() => setActiveFilter(chip.id)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeFilter === chip.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-purple-950/40 text-slate-300 border border-purple-800/40 hover:text-white'
              }`}
            >
              <span>{chip.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({chip.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Friends Cards List */}
      <div className="px-4 space-y-3">
        {filteredFriends.length === 0 ? (
          <div className="text-center py-12 bg-purple-950/20 border border-purple-900/30 rounded-3xl p-6 text-slate-400 space-y-3">
            <Users className="w-10 h-10 mx-auto text-purple-600/50" />
            <h4 className="text-sm font-bold text-white">
              {searchQuery ? `No friends match "${searchQuery}"` : 'No friends in this filter'}
            </h4>
            <p className="text-xs">Expand your network by discovering new cyber creators</p>
            <button
              onClick={onDiscoverMore}
              className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:scale-105 transition-transform cursor-pointer"
            >
              Explore Discover People
            </button>
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <div
              key={friend.id}
              id={`friend-card-${friend.id}`}
              className="p-3.5 rounded-3xl bg-gradient-to-b from-[#130c2c] to-[#0c081e] border border-purple-800/40 hover:border-cyan-400/50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.08)] group"
            >
              {/* Top row: Avatar, Info, Status & Profile link */}
              <div className="flex items-center justify-between gap-3">
                {/* Clickable Avatar & Details to view profile */}
                <div
                  onClick={() => onOpenProfile(friend)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="relative shrink-0">
                    <div className="p-0.5 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 group-hover:scale-105 transition-transform">
                      {friend.avatar ? (
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#0c081e]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-950 flex items-center justify-center text-pink-400 border-2 border-[#0c081e] font-bold font-mono text-sm">
                          {friend.name ? friend.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>

                    {/* Online / Offline status indicator dot */}
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0c081e] ${
                        friend.isOnline
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : 'bg-slate-500'
                      }`}
                      title={friend.isOnline ? 'Online' : 'Offline'}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                        {friend.name}
                      </h4>
                      {friend.isOnline ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono flex items-center gap-0.5 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ONLINE
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/30 text-slate-400 font-mono shrink-0">
                          OFFLINE
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-cyan-400 font-mono truncate">
                      {friend.handle}
                    </p>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {friend.isOnline
                        ? friend.statusText || 'Active now'
                        : friend.lastSeen
                        ? `Last seen ${friend.lastSeen}`
                        : friend.statusText || 'Offline'}
                    </p>
                  </div>
                </div>

                {/* View profile button */}
                <button
                  id={`friend-profile-btn-${friend.id}`}
                  onClick={() => onOpenProfile(friend)}
                  className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/50 hover:border-pink-500 text-slate-300 hover:text-pink-300 transition-colors shrink-0 cursor-pointer"
                  title="View Full Profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons Row: Message, Voice Call, Video Call, Play Game */}
              <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-purple-900/30">
                <button
                  id={`friend-action-msg-${friend.id}`}
                  onClick={() => onOpenChat(friend)}
                  className="py-1.5 rounded-xl bg-purple-950/50 border border-purple-800/40 hover:border-pink-500 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Send Message"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                  <span>Chat</span>
                </button>

                <button
                  id={`friend-action-voice-${friend.id}`}
                  onClick={() => onStartVoiceCall(friend)}
                  className="py-1.5 rounded-xl bg-purple-950/50 border border-purple-800/40 hover:border-cyan-400 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Voice Call"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Voice</span>
                </button>

                <button
                  id={`friend-action-video-${friend.id}`}
                  onClick={() => onStartVideoCall(friend)}
                  className="py-1.5 rounded-xl bg-purple-950/50 border border-purple-800/40 hover:border-purple-400 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Video Call"
                >
                  <Video className="w-3.5 h-3.5 text-purple-300" />
                  <span>Video</span>
                </button>

                <button
                  id={`friend-action-game-${friend.id}`}
                  onClick={() => onPlayGame(friend)}
                  className="py-1.5 rounded-xl bg-purple-950/50 border border-purple-800/40 hover:border-amber-400 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Challenge to Arcade Game"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Game</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
