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
  Heart,
  ExternalLink,
  Plus,
  Share2,
} from 'lucide-react';
import { Friend, ChatThread, Reel, MusicTrack, TabType, SharedLink } from '../types';
import { MusicCard } from './MusicCard';

interface HomeViewProps {
  onSelectTab: (tab: TabType) => void;
  onlineFriends: Friend[];
  recentChats: ChatThread[];
  reels: Reel[];
  tracks: MusicTrack[];
  sharedLinks: SharedLink[];
  onOpenReels: (reelIndex?: number) => void;
  onOpenYouTube: () => void;
  onOpenStory: (friend: Friend) => void;
  onOpenChatThread: (chatId: string) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onOpenShareLink: (platform?: 'instagram' | 'facebook' | 'youtube' | 'custom', prefillUrl?: string) => void;
  onLikeSharedLink: (linkId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTab,
  onlineFriends,
  recentChats,
  reels,
  tracks,
  sharedLinks,
  onOpenReels,
  onOpenYouTube,
  onOpenStory,
  onOpenChatThread,
  onOpenNotifications,
  unreadNotificationsCount,
  onOpenShareLink,
  onLikeSharedLink,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'social' | 'entertainment'>('all');

  // Handle search input with URL auto-detection
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.includes('http://') || val.includes('https://') || val.startsWith('www.')) {
      onOpenShareLink(undefined, val);
      setSearchQuery('');
    }
  };

  // Entertainment Hubs required by user prompt:
  // Instagram, Facebook, YouTube, Chat, Reels, Music, Games
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
      badge: '4K Streams',
      action: onOpenYouTube,
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: MessageSquare,
      category: 'social',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
      shadow: 'shadow-cyan-500/30',
      badge: 'Live DMs',
      action: () => onSelectTab('chat'),
    },
    {
      id: 'reels',
      name: 'Reels',
      icon: Film,
      category: 'entertainment',
      gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
      shadow: 'shadow-fuchsia-500/30',
      badge: 'Shorts & Drops',
      action: () => onOpenReels(),
    },
    {
      id: 'music',
      name: 'Music',
      icon: Music,
      category: 'entertainment',
      gradient: 'from-violet-600 via-purple-600 to-pink-600',
      shadow: 'shadow-purple-500/30',
      badge: 'Cyber Beats FM',
      action: () => onSelectTab('music'),
    },
    {
      id: 'games',
      name: 'Games',
      icon: Gamepad2,
      category: 'entertainment',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      shadow: 'shadow-teal-500/30',
      badge: 'Cyber Arcade',
      action: () => onSelectTab('games'),
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      category: 'social',
      gradient: 'from-pink-500 via-rose-500 to-amber-500',
      shadow: 'shadow-pink-500/30',
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount} New Alerts` : 'Activity & Invites',
      action: onOpenNotifications,
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
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search users, paste link..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all"
          />
          {searchQuery && (
            <button
              id="clear-home-search-btn"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-white"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* QUICK ACCESS (Instagram, Facebook, YouTube, Reels) */}
      <div className="px-4">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Quick Access
        </h2>
        <div className="grid grid-cols-4 gap-2.5">
          <button
            id="quick-share-insta-btn"
            onClick={() => onOpenShareLink('instagram')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-pink-500/50 hover:bg-purple-900/30 transition-all group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-xl shadow-md shadow-pink-500/30 group-hover:scale-105 transition-transform">
              📸
            </div>
            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-pink-300">
              Instagram
            </span>
          </button>

          <button
            id="quick-share-fb-btn"
            onClick={() => onOpenShareLink('facebook')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-blue-500/50 hover:bg-purple-900/30 transition-all group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#1877F2] flex items-center justify-center text-xl font-bold font-serif text-white shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
              f
            </div>
            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-blue-300">
              Facebook
            </span>
          </button>

          <button
            id="quick-share-yt-btn"
            onClick={() => onOpenShareLink('youtube')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-red-500/50 hover:bg-purple-900/30 transition-all group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-red-600 flex items-center justify-center text-lg font-bold text-white shadow-md shadow-red-500/30 group-hover:scale-105 transition-transform">
              ▶
            </div>
            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-red-300">
              YouTube
            </span>
          </button>

          <button
            id="quick-open-reels-btn"
            onClick={() => onOpenReels()}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-fuchsia-500/50 hover:bg-purple-900/30 transition-all group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-xl shadow-md shadow-fuchsia-500/30 group-hover:scale-105 transition-transform">
              🎞️
            </div>
            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-fuchsia-300">
              Reels
            </span>
          </button>
        </div>
      </div>

      {/* SHARED LINKS CARD */}
      <div className="px-4">
        <div className="p-4 rounded-3xl bg-purple-950/25 border border-purple-800/40 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📲</span>
              <h3 className="font-display font-bold text-sm text-white">
                Shared Links
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/40 font-mono">
                {sharedLinks.length}
              </span>
            </div>
            <button
              id="open-share-modal-btn"
              onClick={() => onOpenShareLink()}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white flex items-center gap-1 shadow-md shadow-pink-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>

          <div id="linksList" className="space-y-2.5">
            {sharedLinks.map((link) => (
              <div
                key={link.id}
                className="p-3 rounded-2xl bg-[#0e0a1f]/80 border border-white/[0.08] border-l-4 border-l-purple-500 flex items-center gap-3 hover:border-pink-500/40 transition-all group"
              >
                {/* Platform Badge Icon */}
                <div
                  className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-white text-base font-bold shadow-md ${
                    link.type === 'instagram'
                      ? 'bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600'
                      : link.type === 'facebook'
                      ? 'bg-[#1877F2]'
                      : link.type === 'youtube'
                      ? 'bg-red-600'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                  }`}
                >
                  {link.icon || (link.type === 'instagram' ? '📸' : link.type === 'facebook' ? 'f' : '▶')}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-pink-300 transition-colors">
                    {link.title}
                  </p>
                  <p className="text-[11px] text-white/50 truncate font-mono mt-0.5">
                    {link.url}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLikeSharedLink(link.id);
                      }}
                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                        link.isLiked ? 'text-pink-400 font-semibold' : 'hover:text-pink-300'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${link.isLiked ? 'fill-pink-500' : ''}`} />
                      <span>{link.likes}</span>
                    </button>
                    <span>•</span>
                    <span className="text-purple-300 font-mono">@{link.author}</span>
                    <span>•</span>
                    <span>{link.timestamp}</span>
                  </div>
                </div>

                {/* Open Link Button */}
                <button
                  id={`open-link-${link.id}`}
                  onClick={() => window.open(link.url, '_blank')}
                  className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-purple-600 hover:text-white text-white/70 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  title="Open Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TRENDING REELS CARD */}
      <div className="px-4">
        <div className="p-4 rounded-3xl bg-purple-950/25 border border-purple-800/40 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-pink-400" />
              <h3 className="font-display font-bold text-sm text-white">
                🔥 Trending Reels
              </h3>
            </div>
            <button
              id="watch-all-reels-btn"
              onClick={() => onOpenReels()}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md shadow-pink-500/30 transition-all cursor-pointer"
            >
              Watch All
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            <div
              onClick={() => onOpenReels(0)}
              className="min-w-[115px] h-36 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 p-3 flex flex-col justify-end cursor-pointer shadow-lg hover:scale-[1.03] transition-all shrink-0"
            >
              <p className="text-xs font-bold text-white leading-tight">Neon Night</p>
              <p className="text-[10px] text-white/80 font-mono mt-0.5">12.4k views</p>
            </div>

            <div
              onClick={() => onOpenReels(1)}
              className="min-w-[115px] h-36 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-3 flex flex-col justify-end cursor-pointer shadow-lg hover:scale-[1.03] transition-all shrink-0"
            >
              <p className="text-xs font-bold text-white leading-tight">Kolkata Cyber</p>
              <p className="text-[10px] text-white/80 font-mono mt-0.5">8.9k views</p>
            </div>

            <div
              onClick={() => onOpenReels(2)}
              className="min-w-[115px] h-36 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 p-3 flex flex-col justify-end cursor-pointer shadow-lg hover:scale-[1.03] transition-all shrink-0"
            >
              <p className="text-xs font-bold text-white leading-tight">Gaming Clutch</p>
              <p className="text-[10px] text-white/80 font-mono mt-0.5">22k views</p>
            </div>

            <div
              onClick={() => onOpenReels(3 % reels.length)}
              className="min-w-[115px] h-36 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-rose-500 p-3 flex flex-col justify-end cursor-pointer shadow-lg hover:scale-[1.03] transition-all shrink-0"
            >
              <p className="text-xs font-bold text-white leading-tight">Synth Odyssey</p>
              <p className="text-[10px] text-white/80 font-mono mt-0.5">48k views</p>
            </div>
          </div>
        </div>
      </div>

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
                  Marcus Vance & Elena sent you updates
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-pink-400" />
          </div>
        </div>
      )}

      {/* 2. ONLINE FRIENDS (Stories Carousel with Neon Glowing Rings) */}
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
          <span className="text-[11px] text-slate-400">Tap to view status</span>
        </div>

        <div className="flex gap-3.5 overflow-x-auto px-4 py-2 no-scrollbar">
          {filteredFriends.map((friend) => (
            <button
              key={friend.id}
              id={`friend-story-${friend.id}`}
              onClick={() => onOpenStory(friend)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            >
              {/* Avatar with glowing animated neon ring */}
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.7)] transition-all">
                <div className="p-0.5 rounded-full bg-[#090714]">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
                {/* Active status pulse */}
                <span className="absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090714] shadow-[0_0_6px_#34d399]" />
              </div>
              <span className="text-[11px] font-medium text-slate-300 max-w-[64px] truncate group-hover:text-pink-300">
                {friend.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* QUICK NOTIFICATIONS BANNER ON HOME SCREEN */}
      <div className="px-4">
        <button
          id="home-notifications-banner"
          onClick={onOpenNotifications}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#1c0f33] via-[#160d2b] to-[#120824] border border-pink-500/40 hover:border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.18)] hover:shadow-[0_0_25px_rgba(236,72,153,0.3)] transition-all flex items-center justify-between group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(236,72,153,0.3)]">
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 border border-[#090714] shadow-[0_0_6px_#ec4899] animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-white group-hover:text-pink-300 transition-colors">
                  Notifications & Activity
                </span>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold shadow-sm">
                    {unreadNotificationsCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {unreadNotificationsCount > 0
                  ? 'Followers, friend requests, chats, game invites & calls'
                  : 'All notifications caught up • Tap to view activity'}
              </p>
            </div>
          </div>
          <div className="p-1.5 rounded-xl bg-purple-900/30 text-slate-300 group-hover:text-pink-300 group-hover:translate-x-1 transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* 3. ENTERTAINMENT & SOCIAL HUBS (Instagram, Facebook, YouTube, Chat, Reels, Music, Games) */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <span>Entertainment & Hubs</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </h3>
            <p className="text-[11px] text-slate-400">
              Quick access to your social and media channels
            </p>
          </div>
          {/* Category Filter Pills */}
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
                {/* Background glow hover */}
                <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/25 transition-all" />

                <div className="relative z-10">
                  {/* Hub Icon */}
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

      {/* 4. REELS SPOTLIGHT PREVIEW */}
      <div className="px-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <h3 className="font-display font-bold text-sm tracking-wide text-white">
              Trending Reels
            </h3>
          </div>
          <button
            id="view-all-reels-btn"
            onClick={() => onOpenReels(0)}
            className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
          >
            Open Reels <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {reels.map((reel, idx) => (
            <div
              key={reel.id}
              id={`reel-preview-${reel.id}`}
              onClick={() => onOpenReels(idx)}
              className="relative w-32 h-48 rounded-2xl overflow-hidden shrink-0 border border-purple-800/40 cursor-pointer group shadow-lg hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all"
            >
              <img
                src={reel.videoThumbnail}
                alt={reel.caption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-pink-500/80 text-[9px] font-bold text-white flex items-center gap-0.5">
                <Radio className="w-2.5 h-2.5" /> REEL
              </div>

              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[10px] font-semibold text-white truncate">
                  {reel.creator.name}
                </p>
                <p className="text-[9px] text-pink-300 truncate">
                  ❤️ {reel.likes}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. INTERACTIVE MUSIC PLAYER WIDGET */}
      <div id="home-music-section" className="px-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-sm tracking-wide text-white">
              Synth & Cyber Beats
            </h3>
          </div>
          <button
            id="open-music-library-btn"
            onClick={() => onSelectTab('music')}
            className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
          >
            Music Player <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <MusicCard tracks={tracks} onOpenFullPlayer={() => onSelectTab('music')} />
      </div>

      {/* 6. RECENT CHATS (with direct open conversation) */}
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
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={chat.friend.avatar}
                  alt={chat.friend.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-purple-600/40"
                />
                {chat.friend.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090714]" />
                )}
              </div>

              {/* Message preview */}
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

              {/* Unread badge */}
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
