import React, { useState } from 'react';
import {
  Search,
  Instagram,
  Facebook,
  Youtube,
  MessageSquare,
  Film,
  Music,
  Gamepad2,
  Bell,
  ChevronRight,
  Flame,
  Radio,
  Sparkles,
  TrendingUp,
  Edit3,
  Users,
  Play,
  Trophy,
  UserPlus,
} from 'lucide-react';
import { Friend, ChatThread, Reel, MusicTrack, TabType, UserProfile } from '../types';
import { MusicCard } from './MusicCard';
import { PWAInstallButton } from './PWAInstallButton';
import { UserAvatar } from './UserAvatar';

interface HomeViewProps {
  onSelectTab: (tab: TabType) => void;
  onlineFriends: Friend[];
  recentChats: ChatThread[];
  reels: Reel[];
  tracks: MusicTrack[];
  onOpenReels: () => void;
  onOpenYouTube: () => void;
  onOpenStory: (friend: Friend) => void;
  onOpenChatThread: (chatId: string) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  currentUser: UserProfile;
  onOpenEditProfile?: () => void;
  onOpenAddFriend?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTab,
  onlineFriends,
  recentChats,
  reels,
  tracks,
  onOpenReels,
  onOpenYouTube,
  onOpenStory,
  onOpenChatThread,
  onOpenNotifications,
  unreadNotificationsCount,
  currentUser,
  onOpenEditProfile,
  onOpenAddFriend,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'social' | 'entertainment'>('all');

  const hubs = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      category: 'social',
      gradient: 'from-pink-500 via-purple-500 to-amber-500',
      shadow: 'shadow-pink-500/30',
      badge: 'Photos & Drops',
      action: () => onSelectTab('social'),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      category: 'social',
      gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
      shadow: 'shadow-blue-500/30',
      badge: 'Groups & Feed',
      action: () => onSelectTab('social'),
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      category: 'entertainment',
      gradient: 'from-red-600 via-rose-600 to-pink-600',
      shadow: 'shadow-red-500/30',
      badge: 'Shorts & Videos',
      action: onOpenYouTube,
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: MessageSquare,
      category: 'social',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
      shadow: 'shadow-cyan-500/30',
      badge: 'Direct Messages',
      action: () => onSelectTab('chat'),
    },
    {
      id: 'reels',
      name: 'Reels',
      icon: Film,
      category: 'entertainment',
      gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
      shadow: 'shadow-fuchsia-500/30',
      badge: 'Shorts & Clips',
      action: () => onSelectTab('reels'),
    },
    {
      id: 'music',
      name: 'Music',
      icon: Music,
      category: 'entertainment',
      gradient: 'from-violet-600 via-purple-600 to-pink-600',
      shadow: 'shadow-purple-500/30',
      badge: 'Synth Player',
      action: () => onSelectTab('music'),
    },
    {
      id: 'games',
      name: 'Games',
      icon: Gamepad2,
      category: 'entertainment',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      shadow: 'shadow-teal-500/30',
      badge: 'Neon Arcade',
      action: () => onSelectTab('games'),
    },
  ];

  const filteredHubs = hubs.filter(
    (h) =>
      (selectedCategory === 'all' || h.category === selectedCategory) &&
      h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChats = recentChats.filter((c) =>
    c.friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = onlineFriends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      {/* 1. SEARCH BAR */}
      <div className="px-4 pt-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            id="home-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends, music, reels, channels..."
            className="w-full pl-10 pr-4 py-2.5 bg-purple-950/40 border border-purple-800/40 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* 2. USER WELCOME CARD WITH EDIT PROFILE BUTTON */}
      <div className="px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#160f33]/90 via-[#130b2c]/95 to-[#0b071a]/95 border border-purple-700/40 p-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          {/* Neon ambient highlights */}
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            {/* User Profile info */}
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Profile Photo with glowing ring & clean initials fallback */}
              <div
                onClick={() => onSelectTab('profile')}
                className="relative cursor-pointer shrink-0 group"
                title="View Profile"
              >
                <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(236,72,153,0.5)] group-hover:scale-105 transition-transform">
                  <UserAvatar
                    name={currentUser.name}
                    avatar={currentUser.avatar}
                    size="lg"
                    className="rounded-[14px]"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090714] shadow-[0_0_8px_#34d399]" />
              </div>

              {/* Name & Status */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3
                    onClick={() => onSelectTab('profile')}
                    className="font-display font-extrabold text-base text-white hover:text-pink-300 transition-colors cursor-pointer truncate"
                  >
                    {currentUser.name}
                  </h3>
                  <span className="px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[9px] font-mono shrink-0">
                    MEMBER
                  </span>
                </div>
                <p className="text-[11px] font-mono text-cyan-400 truncate">
                  {currentUser.handle}
                </p>

                {/* Status bubble */}
                <div className="mt-1 flex items-center gap-1 text-[11px] text-pink-200/90 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-lg max-w-full">
                  <Sparkles className="w-3 h-3 text-pink-400 shrink-0" />
                  <span className="truncate">{currentUser.statusText || currentUser.bio}</span>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              id="home-edit-profile-btn"
              onClick={() => {
                if (onOpenEditProfile) {
                  onOpenEditProfile();
                } else {
                  onSelectTab('profile');
                }
              }}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-600/30 hover:from-pink-500/30 hover:to-purple-600/40 border border-pink-500/40 hover:border-pink-400 text-pink-200 text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(236,72,153,0.2)] transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-pink-400" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* User Quick Stats bar */}
          <div className="relative z-10 mt-3.5 pt-3 border-t border-purple-800/40 grid grid-cols-4 gap-1 text-center">
            <div className="p-1 rounded-lg bg-purple-950/30">
              <span className="font-display font-bold text-xs text-white">
                {currentUser.stats.friends}
              </span>
              <p className="text-[10px] text-slate-400">Friends</p>
            </div>
            <div className="p-1 rounded-lg bg-purple-950/30">
              <span className="font-display font-bold text-xs text-pink-400">
                {currentUser.stats.followers}
              </span>
              <p className="text-[10px] text-slate-400">Followers</p>
            </div>
            <div className="p-1 rounded-lg bg-purple-950/30">
              <span className="font-display font-bold text-xs text-purple-300">
                {currentUser.stats.following}
              </span>
              <p className="text-[10px] text-slate-400">Following</p>
            </div>
            <div className="p-1 rounded-lg bg-purple-950/30">
              <span className="font-display font-bold text-xs text-cyan-400">
                {currentUser.stats.views}
              </span>
              <p className="text-[10px] text-slate-400">Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* INSTALL MYSPACE APP BANNER */}
      <PWAInstallButton variant="banner" />

      {/* NOTIFICATIONS QUICK ALERT BANNER */}
      {unreadNotificationsCount > 0 && (
        <div className="px-4">
          <div
            onClick={onOpenNotifications}
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-pink-950/50 via-purple-950/50 to-indigo-950/50 border border-pink-500/40 cursor-pointer shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:border-pink-400 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/50 flex items-center justify-center text-pink-400 animate-pulse">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Notifications</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-[10px] text-white font-mono">
                    {unreadNotificationsCount} NEW
                  </span>
                </p>
                <p className="text-[11px] text-pink-200/80">
                  Check your latest alerts and challenge updates
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-pink-400" />
          </div>
        </div>
      )}

      {/* 3. ONLINE FRIENDS (Stories Carousel) */}
      <div className="space-y-2">
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="font-display font-bold text-sm tracking-wide text-slate-200">
              Online Friends
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              ({filteredFriends.length})
            </span>
          </div>
          {onOpenAddFriend ? (
            <button
              onClick={onOpenAddFriend}
              className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>Add Friend</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Tap to view status</span>
          )}
        </div>

        {filteredFriends.length > 0 ? (
          <div className="flex gap-3.5 overflow-x-auto px-4 py-2 no-scrollbar">
            {filteredFriends.map((friend) => (
              <button
                key={friend.id}
                id={`friend-story-${friend.id}`}
                onClick={() => onOpenStory(friend)}
                className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
              >
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.7)] transition-all">
                  <div className="p-0.5 rounded-full bg-[#090714]">
                    <UserAvatar
                      name={friend.name}
                      avatar={friend.avatar}
                      size="lg"
                    />
                  </div>
                  {friend.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090714] shadow-[0_0_8px_#34d399]" />
                  )}
                </div>
                <span className="text-xs font-medium text-slate-300 group-hover:text-pink-300 transition-colors w-16 truncate text-center">
                  {friend.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mx-4 p-5 rounded-2xl bg-purple-950/20 border border-purple-900/30 text-center space-y-2.5">
            <div className="w-10 h-10 mx-auto rounded-full bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-300">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-300 font-medium">
              No friends yet. Add friends to get started.
            </p>
            {onOpenAddFriend && (
              <button
                id="home-empty-add-friend-btn"
                onClick={onOpenAddFriend}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold shadow-md hover:scale-105 transition-all inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Friend</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. ENTERTAINMENT & SOCIAL SHORTCUTS */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <span>Entertainment & Shortcuts</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </h3>
            <p className="text-[11px] text-slate-400">
              Quick access to channels, music, games & reels
            </p>
          </div>
          <div className="flex bg-purple-950/40 p-1 rounded-xl border border-purple-800/30 text-[10px]">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('social')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                selectedCategory === 'social' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Social
            </button>
            <button
              onClick={() => setSelectedCategory('entertainment')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                selectedCategory === 'entertainment' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Media
            </button>
          </div>
        </div>

        {/* Hubs Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredHubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <button
                key={hub.id}
                id={`hub-card-${hub.id}`}
                onClick={hub.action}
                className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-[#0e0a1f] border border-purple-800/40 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] transition-all text-left group flex items-start justify-between"
              >
                <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/25 transition-all" />

                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${hub.gradient} p-0.5 mb-2.5 shadow-md ${hub.shadow} group-hover:scale-105 transition-transform`}>
                    <div className="w-full h-full bg-[#0d091d]/80 rounded-[10px] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <h4 className="font-semibold text-sm text-white group-hover:text-pink-300 transition-colors">
                    {hub.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {hub.badge}
                  </p>
                </div>

                <div className="relative z-10 p-1 rounded-full bg-purple-900/30 text-slate-400 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. GAMES SHORTCUT BANNER */}
      <div className="px-4">
        <div
          onClick={() => onSelectTab('games')}
          className="relative overflow-hidden p-4 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-teal-950/60 to-purple-950/60 border border-emerald-500/40 hover:border-emerald-400 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.2)] group transition-all"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#081512] rounded-[14px] flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    Neon Cyber Arcade
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono">
                    PLAYABLE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Play Cyber Reflex Tap & Memory Matrix games!
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. REELS SHORTCUT & PREVIEWS */}
      <div className="px-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <h3 className="font-display font-bold text-sm tracking-wide text-white">
              Trending Reels & Shorts
            </h3>
          </div>
          <button
            id="view-all-reels-btn"
            onClick={() => onSelectTab('reels')}
            className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
          >
            All Reels <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {reels.map((reel) => (
            <div
              key={reel.id}
              id={`reel-preview-${reel.id}`}
              onClick={() => onSelectTab('reels')}
              className="relative w-32 h-48 rounded-2xl overflow-hidden shrink-0 border border-purple-800/40 cursor-pointer group shadow-lg hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all bg-[#0d091d]"
            >
              {reel.platform === 'youtube' ? (
                <img
                  src={`https://img.youtube.com/vi/${reel.id}/hqdefault.jpg`}
                  alt={reel.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className={`w-full h-full flex flex-col items-center justify-center p-3 text-center ${
                  reel.platform === 'facebook'
                    ? 'bg-gradient-to-b from-blue-950 via-[#0a1026] to-black'
                    : 'bg-gradient-to-b from-purple-950 via-[#180d28] to-black'
                }`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg ${
                    reel.platform === 'facebook' ? 'bg-blue-600' : 'bg-gradient-to-tr from-amber-500 to-pink-500'
                  }`}>
                    <Radio className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-white font-semibold line-clamp-2 px-1">
                    {reel.title}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
              
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-pink-500/80 text-[9px] font-bold text-white flex items-center gap-0.5 pointer-events-none">
                <Radio className="w-2.5 h-2.5" /> REEL
              </div>

              <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
                <p className="text-[10px] font-semibold text-white truncate">
                  {reel.username}
                </p>
                <p className="text-[9px] text-pink-300 truncate">
                  {reel.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. MUSIC PLAYER SHORTCUT */}
      <div id="home-music-section" className="px-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-sm tracking-wide text-white">
              Synth & Cyber Beats
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('music')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Music Player <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <MusicCard tracks={tracks} />
      </div>

      {/* 8. RECENT CHATS */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-pink-400" />
            <h3 className="font-display font-bold text-sm tracking-wide text-white">
              Recent Chats
            </h3>
          </div>
          <button
            id="see-all-chats-btn"
            onClick={() => onSelectTab('chat')}
            className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
          >
            All Chats <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {filteredChats.slice(0, 3).map((chat) => (
            <div
              key={chat.id}
              id={`home-chat-${chat.id}`}
              onClick={() => onOpenChatThread(chat.id)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-pink-500/40 hover:bg-purple-900/30 cursor-pointer transition-all"
            >
              <div className="relative shrink-0">
                <UserAvatar
                  name={chat.friend.name}
                  avatar={chat.friend.avatar}
                  size="md"
                  isOnline={chat.friend.isOnline}
                  showOnline={true}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-white truncate">
                    {chat.friend.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {chat.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate mt-0.5">
                  {chat.lastMessage}
                </p>
              </div>

              {chat.unreadCount > 0 && (
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
