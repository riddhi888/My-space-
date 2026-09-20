import React, { useState } from 'react';
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
  Sparkles,
  MessageSquare,
  Phone,
  Video,
  Gamepad2,
  Filter,
  Flame,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { SocialUser } from '../types';

interface DiscoverPeopleViewProps {
  users: SocialUser[];
  onToggleFollow: (userId: string) => void;
  onSelectUser: (user: SocialUser) => void;
  onOpenNetworkList: (initialTab: 'followers' | 'following') => void;
  onOpenChat: (user: SocialUser) => void;
  onStartVoiceCall: (user: SocialUser) => void;
  onStartVideoCall: (user: SocialUser) => void;
  onPlayGame: (user: SocialUser) => void;
}

export const DiscoverPeopleView: React.FC<DiscoverPeopleViewProps> = ({
  users,
  onToggleFollow,
  onSelectUser,
  onOpenNetworkList,
  onOpenChat,
  onStartVoiceCall,
  onStartVideoCall,
  onPlayGame,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'creators' | 'gamers'>('all');

  const followingCount = users.filter((u) => u.isFollowing).length;
  const followersCount = users.filter((u) => u.isFollower).length;

  const filteredUsers = users.filter((user) => {
    // Search query matching handle or name
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter categories
    if (activeFilter === 'online') {
      return user.isOnline;
    }
    if (activeFilter === 'creators') {
      return user.followersCount > 3000;
    }
    if (activeFilter === 'gamers') {
      return !!user.recentGameScore;
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Header & Network Summary Cards */}
      <div className="px-4 pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <span>Discover People</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Find cyber creators, gamers & connect across MySpace
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-400">
              {users.filter((u) => u.isOnline).length} Online
            </span>
          </div>
        </div>

        {/* Quick Access to Following & Followers Lists */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="open-following-list-btn"
            onClick={() => onOpenNetworkList('following')}
            className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-[#160d33] border border-purple-800/40 hover:border-cyan-400/60 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">You Are Following</span>
              <Users className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display font-bold text-lg text-white">
                {followingCount}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">friends</span>
            </div>
          </button>

          <button
            id="open-followers-list-btn"
            onClick={() => onOpenNetworkList('followers')}
            className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-[#160d33] border border-purple-800/40 hover:border-pink-500/60 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Your Followers</span>
              <Sparkles className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display font-bold text-lg text-pink-400">
                {followersCount}
              </span>
              <span className="text-[10px] text-pink-300 font-mono">network</span>
            </div>
          </button>
        </div>

        {/* Search Bar - Search by Username */}
        <div className="relative">
          <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="discover-users-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by @username, name, or vibe..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#120b29] border border-purple-800/40 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-colors"
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

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {(
            [
              { id: 'all', label: 'All People', count: users.length },
              { id: 'online', label: '🟢 Online Now', count: users.filter((u) => u.isOnline).length },
              { id: 'creators', label: '⭐ Top Creators', count: users.filter((u) => u.followersCount > 3000).length },
              { id: 'gamers', label: '🕹️ Arcade Rivals', count: users.filter((u) => !!u.recentGameScore).length },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              id={`filter-chip-${chip.id}`}
              onClick={() => setActiveFilter(chip.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === chip.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                  : 'bg-purple-950/40 text-slate-300 border border-purple-800/40 hover:text-white'
              }`}
            >
              <span>{chip.label}</span>
              <span className="text-[10px] opacity-70 font-mono">({chip.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Profile Cards List */}
      <div className="px-4 space-y-3.5">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-purple-950/20 border border-purple-900/30 rounded-3xl p-6 text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-purple-600/50" />
            <h4 className="text-sm font-bold text-white">No users match "{searchQuery}"</h4>
            <p className="text-xs">Try searching for @elena, @kai, @marcus, or @zoe</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              id={`user-card-${user.id}`}
              className="relative p-4 rounded-3xl bg-gradient-to-b from-[#130c2c] to-[#0c081e] border border-purple-800/40 hover:border-pink-500/50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.08)] group"
            >
              {/* Card Top: Avatar, Name, Handle, Online Status & Follow Button */}
              <div className="flex items-start justify-between gap-3">
                {/* Avatar & Identifiers (click to open profile) */}
                <div
                  onClick={() => onSelectUser(user)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="relative shrink-0">
                    <div className="p-0.5 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-400 group-hover:scale-105 transition-transform">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-13 h-13 rounded-full object-cover border-2 border-[#0c081e]"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-full bg-purple-950 flex items-center justify-center text-pink-400 border-2 border-[#0c081e] font-bold font-mono text-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    {/* Online / Offline status badge */}
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0c081e] ${
                        user.isOnline
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : 'bg-slate-500'
                      }`}
                      title={user.isOnline ? 'Online' : 'Offline'}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-display font-bold text-sm text-white group-hover:text-pink-300 transition-colors truncate">
                        {user.name}
                      </h4>
                      {user.badges?.[0] && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono shrink-0">
                          VIP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cyan-400 font-mono truncate">
                      {user.handle}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <span
                        className={`font-semibold ${
                          user.isOnline ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {user.isOnline ? 'Active now' : 'Offline'}
                      </span>
                      <span>•</span>
                      <span>{user.followersCount.toLocaleString()} followers</span>
                    </div>
                  </div>
                </div>

                {/* Follow / Following Button */}
                <button
                  id={`discover-follow-btn-${user.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFollow(user.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                    user.isFollowing
                      ? 'bg-purple-950/70 border border-cyan-400/50 text-cyan-300 hover:border-pink-500 hover:text-pink-300 shadow-sm'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.35)] hover:scale-105'
                  }`}
                  title={user.isFollowing ? 'Click to Unfollow' : 'Click to Follow'}
                >
                  {user.isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bio snippet */}
              <p
                onClick={() => onSelectUser(user)}
                className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed cursor-pointer"
              >
                {user.bio}
              </p>

              {/* Status and Tags Row */}
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-purple-900/30 text-[11px]">
                <span className="text-slate-400 text-[10px] truncate max-w-[190px]">
                  {user.statusText}
                </span>

                {/* Quick Profile View Link */}
                <button
                  id={`view-profile-btn-${user.id}`}
                  onClick={() => onSelectUser(user)}
                  className="text-pink-400 hover:text-pink-300 text-[11px] font-semibold flex items-center gap-1 shrink-0"
                >
                  <span>View Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Quick Action Icons: Message, Voice, Video, Game */}
              <div className="grid grid-cols-4 gap-1.5 mt-3 pt-1">
                <button
                  id={`card-action-msg-${user.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChat(user);
                  }}
                  className="py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:border-pink-500 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  title="Send Message"
                >
                  <MessageSquare className="w-3 h-3 text-pink-400" />
                  <span>Chat</span>
                </button>

                <button
                  id={`card-action-voice-${user.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartVoiceCall(user);
                  }}
                  className="py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:border-cyan-400 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  title="Voice Call"
                >
                  <Phone className="w-3 h-3 text-cyan-400" />
                  <span>Voice</span>
                </button>

                <button
                  id={`card-action-video-${user.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartVideoCall(user);
                  }}
                  className="py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:border-purple-400 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  title="Video Call"
                >
                  <Video className="w-3 h-3 text-purple-300" />
                  <span>Video</span>
                </button>

                <button
                  id={`card-action-game-${user.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayGame(user);
                  }}
                  className="py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:border-amber-400 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  title="Challenge to Game"
                >
                  <Gamepad2 className="w-3 h-3 text-amber-400" />
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
