import React, { useState } from 'react';
import {
  Heart,
  ExternalLink,
  Plus,
  Flame,
  Radio,
  Share2,
  Sparkles,
  Music,
  User,
  ChevronRight,
  Eye,
  Film,
  Link as LinkIcon,
} from 'lucide-react';
import { Friend, Reel, MusicTrack, TabType, SharedLink, UserProfile } from '../types';

interface HomeViewProps {
  currentUser?: UserProfile;
  onSelectTab: (tab: TabType) => void;
  onlineFriends: Friend[];
  reels: Reel[];
  tracks: MusicTrack[];
  sharedLinks: SharedLink[];
  onOpenReels: (reelIndex?: number) => void;
  onOpenStory: (friend: Friend) => void;
  onOpenChatThread: (chatId: string) => void;
  onOpenShareLink: (platform?: 'instagram' | 'facebook' | 'youtube' | 'custom', prefillUrl?: string) => void;
  onLikeSharedLink: (linkId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  onSelectTab,
  onlineFriends,
  reels,
  sharedLinks,
  onOpenReels,
  onOpenStory,
  onOpenShareLink,
  onLikeSharedLink,
}) => {
  // 2 tabs side by side: Shared Links and Trending Reels
  const [activeHomeTab, setActiveHomeTab] = useState<'links' | 'reels'>('links');

  return (
    <div className="space-y-3 p-3 pb-24">
      {/* 1. TOP: RETRO 2008 MYSPACE PROFILE BANNER */}
      <section
        id="home-profile-banner"
        className="rounded-xl bg-[#140e2b] border border-purple-800/60 p-3 shadow-md relative overflow-hidden"
      >
        {/* Subtle retro top color accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400" />

        <div className="flex items-start gap-3">
          {/* Avatar with retro border & online indicator */}
          <div
            onClick={() => onSelectTab('profile')}
            className="relative shrink-0 cursor-pointer group"
            title="View Profile"
          >
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
              }
              alt={currentUser?.name || 'User'}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-lg object-cover border-2 border-pink-500/70 group-hover:scale-105 transition-transform shadow-sm"
            />
            <span
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#140e2b] shadow-[0_0_6px_#34d399]"
              title="Online Now"
            />
          </div>

          {/* User Details & Retro MySpace Headline */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <h2
                  onClick={() => onSelectTab('profile')}
                  className="font-display font-bold text-sm text-white truncate cursor-pointer hover:text-pink-300 transition-colors"
                >
                  {currentUser?.name || 'Alex Rivera'}
                </h2>
                <span className="text-[10px] text-cyan-300 font-mono shrink-0">
                  {currentUser?.handle || '@cyber_alex'}
                </span>
              </div>

              {/* View Profile Action */}
              <button
                id="banner-view-profile-btn"
                onClick={() => onSelectTab('profile')}
                className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 hover:bg-pink-600 border border-purple-700/50 text-pink-200 hover:text-white transition-all shrink-0 cursor-pointer"
              >
                Profile →
              </button>
            </div>

            {/* Retro 2008 Headline / Mood */}
            <div className="text-[11px] text-slate-300 mt-1 truncate">
              <span className="text-pink-400 font-semibold">Mood:</span> Cyberpunk 👾 •{' '}
              <span className="text-cyan-300 italic">"Creating the next wave"</span>
            </div>

            {/* Profile Anthem / Song mini ticker */}
            <div
              onClick={() => onSelectTab('music')}
              className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-pink-300 cursor-pointer mt-1 font-mono truncate"
            >
              <Music className="w-3 h-3 text-pink-400 shrink-0 animate-pulse" />
              <span className="truncate">
                {currentUser?.profileSong?.title || 'Resonance & Neon Dreams'} -{' '}
                {currentUser?.profileSong?.artist || 'Lazerhawk'}
              </span>
            </div>

            {/* 2008 MySpace Network Stats Bar */}
            <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-purple-900/40 text-[10px] text-slate-400 font-mono">
              <span>
                Friends: <strong className="text-white">{currentUser?.stats.friends || 486}</strong>
              </span>
              <span>•</span>
              <span>
                Views: <strong className="text-pink-300">{currentUser?.stats.views || '84.2k'}</strong>
              </span>
              <span>•</span>
              <span className="text-emerald-400">● In Your Network</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ONLINE FRIENDS: SINGLE HORIZONTAL COMPACT ROW (SMALL AVATARS) */}
      <section
        id="home-online-friends-row"
        className="rounded-xl bg-[#140e2b] border border-purple-800/60 p-3 shadow-sm space-y-2"
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Online Friends
            </span>
            <span className="text-[10px] font-mono text-cyan-400">({onlineFriends.length})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Tap avatar for status</span>
        </div>

        {/* Horizontal compact row with small avatars (36px) */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          {onlineFriends.map((friend) => (
            <button
              key={friend.id}
              id={`friend-avatar-${friend.id}`}
              onClick={() => onOpenStory(friend)}
              className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none cursor-pointer"
              title={`${friend.name} - ${friend.statusText || 'Online'}`}
            >
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-lg object-cover border border-purple-600/70 group-hover:border-pink-400 group-hover:scale-105 transition-all shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#140e2b]" />
              </div>
              <span className="text-[10px] font-medium text-slate-300 max-w-[50px] truncate group-hover:text-pink-300 text-center leading-tight">
                {friend.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. TWO TABS: SHARED LINKS & TRENDING REELS SIDE BY SIDE (NOT STACKED) */}
      <section
        id="home-tabs-container"
        className="rounded-xl bg-[#140e2b] border border-purple-800/60 p-3 shadow-sm space-y-3"
      >
        {/* SIDE-BY-SIDE TABS SELECTOR */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#0b0818] border border-purple-900/60">
          <button
            id="home-tab-shared-links"
            onClick={() => setActiveHomeTab('links')}
            className={`py-1.5 px-2 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeHomeTab === 'links'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-pink-200" />
            <span>Shared Links</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {sharedLinks.length}
            </span>
          </button>

          <button
            id="home-tab-trending-reels"
            onClick={() => setActiveHomeTab('reels')}
            className={`py-1.5 px-2 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeHomeTab === 'reels'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Trending Reels</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {reels.length}
            </span>
          </button>
        </div>

        {/* TAB CONTENT 1: SHARED LINKS */}
        {activeHomeTab === 'links' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-purple-900/40">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Recent Community Drops
              </span>
              <button
                id="home-share-new-link-btn"
                onClick={() => onOpenShareLink()}
                className="text-[10px] px-2.5 py-1 rounded-md bg-purple-900/60 hover:bg-pink-600 border border-purple-700/50 text-pink-200 hover:text-white font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Add Link</span>
              </button>
            </div>

            <div id="homeSharedLinksList" className="space-y-2">
              {sharedLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-2.5 rounded-lg bg-[#0d091e] border border-purple-900/40 hover:border-pink-500/50 flex items-center gap-2.5 transition-all group"
                >
                  {/* Platform icon */}
                  <div
                    className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                      link.type === 'instagram'
                        ? 'bg-gradient-to-br from-yellow-500 via-pink-500 to-purple-600'
                        : link.type === 'facebook'
                        ? 'bg-[#1877F2]'
                        : link.type === 'youtube'
                        ? 'bg-red-600'
                        : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                    }`}
                  >
                    {link.icon ||
                      (link.type === 'instagram' ? '📸' : link.type === 'facebook' ? 'f' : '▶')}
                  </div>

                  {/* Title and metadata */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-pink-300 transition-colors">
                      {link.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span className="text-purple-300">@{link.author}</span>
                      <span>•</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLikeSharedLink(link.id);
                        }}
                        className={`flex items-center gap-0.5 cursor-pointer ${
                          link.isLiked ? 'text-pink-400 font-bold' : 'hover:text-pink-300'
                        }`}
                      >
                        <Heart
                          className={`w-3 h-3 ${link.isLiked ? 'fill-pink-500 text-pink-500' : ''}`}
                        />
                        <span>{link.likes}</span>
                      </button>
                      <span>•</span>
                      <span>{link.timestamp}</span>
                    </div>
                  </div>

                  {/* Open Link Button */}
                  <button
                    id={`open-link-btn-${link.id}`}
                    onClick={() => window.open(link.url, '_blank')}
                    className="w-7 h-7 rounded-md bg-purple-950/60 hover:bg-pink-600 border border-purple-800/50 text-slate-300 hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    title="Open Link"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: TRENDING REELS */}
        {activeHomeTab === 'reels' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-purple-900/40">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Featured Clips
              </span>
              <button
                id="home-watch-all-reels-btn"
                onClick={() => onOpenReels(0)}
                className="text-[10px] px-2.5 py-1 rounded-md bg-purple-900/60 hover:bg-pink-600 border border-purple-700/50 text-pink-200 hover:text-white font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <span>Full Reel Player</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Compact 2-column grid of retro reel cards */}
            <div className="grid grid-cols-2 gap-2">
              {reels.map((reel, idx) => (
                <div
                  key={reel.id}
                  id={`home-reel-card-${reel.id}`}
                  onClick={() => onOpenReels(idx)}
                  className="relative h-28 rounded-lg overflow-hidden border border-purple-800/50 cursor-pointer group shadow-sm hover:border-pink-500 transition-all flex flex-col justify-end p-2"
                >
                  <img
                    src={reel.videoThumbnail}
                    alt={reel.caption}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Reel badge */}
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-pink-500/90 text-[8px] font-bold text-white font-mono flex items-center gap-0.5">
                    <Radio className="w-2 h-2" /> REEL
                  </span>

                  <div className="relative z-10">
                    <p className="text-[11px] font-bold text-white truncate leading-tight">
                      {reel.caption || reel.creator.name}
                    </p>
                    <p className="text-[9px] text-pink-300 font-mono mt-0.5">
                      ❤️ {reel.likes} • {reel.creator.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
