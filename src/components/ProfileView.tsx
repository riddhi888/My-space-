import React, { useState } from 'react';
import {
  Music,
  Users,
  Eye,
  Sparkles,
  Edit3,
  Award,
  Share2,
  Settings,
  Heart,
  Play,
  Pause,
  Grid,
  Bookmark,
  Check,
  Flame,
  LogOut,
} from 'lucide-react';
import { UserProfile, Friend } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  onOpenChatWithFriend: (friend: Friend) => void;
  onUpdateBio: (newBio: string) => void;
  onShowToast?: (msg: string) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onOpenChatWithFriend,
  onUpdateBio,
  onShowToast,
  onLogout,
}) => {
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(user.bio);
  const [activeTab, setActiveTab] = useState<'top8' | 'photos' | 'badges'>('top8');

  const galleryImages = [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
  ];

  const handleSaveBio = () => {
    onUpdateBio(bioDraft);
    setIsEditingBio(false);
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Cover Banner with Neon Gradient Overlay */}
      <div className="relative h-36 w-full overflow-hidden bg-purple-950">
        <img
          src={user.coverImage}
          alt="Profile Cover"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090714] via-transparent to-black/40" />

        {/* Action icons on top right */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            id="share-profile-btn"
            onClick={() => onShowToast ? onShowToast('Profile URL copied to clipboard!') : null}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-pink-500 transition-colors"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            id="profile-settings-btn"
            onClick={() => onShowToast ? onShowToast('Account settings & neon theme customizer opened') : null}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-purple-600 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          {onLogout && (
            <button
              id="profile-header-logout-btn"
              onClick={onLogout}
              className="p-2 rounded-full bg-rose-950/70 border border-rose-500/40 backdrop-blur-md text-rose-300 hover:bg-rose-600 hover:text-white transition-colors"
              title="Log Out of MySpace"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Avatar & Main Info */}
      <div className="px-4 -mt-14 relative z-10 space-y-3">
        <div className="flex items-end justify-between">
          {/* Avatar with glowing ring */}
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_25px_rgba(236,72,153,0.5)]">
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-22 h-22 rounded-full object-cover border-4 border-[#090714]"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#090714] shadow-[0_0_8px_#34d399]" />
          </div>

          {/* Action Buttons: Edit Bio & Logout */}
          <div className="flex items-center gap-2">
            <button
              id="edit-profile-action-btn"
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="px-3.5 py-2 rounded-2xl bg-purple-950/60 border border-pink-500/40 text-pink-300 text-xs font-semibold hover:bg-pink-500 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditingBio ? 'Cancel' : 'Edit Bio'}
            </button>

            {onLogout && (
              <button
                id="logout-button"
                onClick={onLogout}
                className="px-3.5 py-2 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                title="Log Out of MySpace"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Name and Handle */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-xl text-white">
              {user.name}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-mono">
              VIP CREATOR
            </span>
          </div>
          <p className="text-xs text-cyan-400 font-mono mt-0.5">{user.handle}</p>
        </div>

        {/* Bio */}
        {isEditingBio ? (
          <div className="space-y-2 p-3 bg-purple-950/40 rounded-2xl border border-pink-500/40">
            <textarea
              id="bio-edit-textarea"
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              rows={3}
              className="w-full p-2 bg-black/40 border border-purple-800/40 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 resize-none"
            />
            <button
              id="save-bio-btn"
              onClick={handleSaveBio}
              className="px-3 py-1.5 rounded-xl bg-pink-500 text-white text-xs font-semibold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-300 leading-relaxed">{user.bio}</p>
        )}

        {/* Profile Song Card (The Classic Iconic MySpace feature!) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-[#181033] to-pink-950/60 border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.15)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="profile-song-toggle-btn"
              onClick={() => setIsPlayingSong(!isPlayingSong)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:scale-105 transition-transform"
            >
              {isPlayingSong ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                <Music className={`w-3 h-3 ${isPlayingSong ? 'animate-bounce' : ''}`} />
                <span>MySpace Profile Anthem</span>
              </div>
              <h4 className="text-xs font-semibold text-white mt-0.5">
                {user.profileSong.title}
              </h4>
              <p className="text-[11px] text-cyan-300">{user.profileSong.artist}</p>
            </div>
          </div>

          <div className="flex items-end gap-0.5 h-4">
            {[30, 80, 50, 95, 60, 40].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full bg-pink-500 ${isPlayingSong ? 'animate-pulse' : 'opacity-30'}`}
                style={{ height: isPlayingSong ? `${h}%` : '30%' }}
              />
            ))}
          </div>
        </div>

        {/* Stats Row: Followers, Following, Friends, Views */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-2xl bg-[#120c29] border border-purple-800/40 text-center">
            <span className="font-display font-bold text-base text-pink-400">
              {user.stats.followers}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Followers</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#120c29] border border-purple-800/40 text-center">
            <span className="font-display font-bold text-base text-cyan-400">
              {user.stats.following ?? 0}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Following</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#120c29] border border-purple-800/40 text-center">
            <span className="font-display font-bold text-base text-white">
              {user.stats.friends}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Friends</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#120c29] border border-purple-800/40 text-center">
            <span className="font-display font-bold text-base text-purple-300">
              {user.stats.views}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Views</p>
          </div>
        </div>
      </div>

      {/* Tabs: Top 8 Friends, Photos, Badges */}
      <div className="px-4 space-y-3">
        <div className="flex bg-purple-950/40 p-1 rounded-2xl border border-purple-800/30 text-xs">
          <button
            id="tab-top8-btn"
            onClick={() => setActiveTab('top8')}
            className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'top8'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⭐ Top 8 Friends
          </button>
          <button
            id="tab-photos-btn"
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'photos'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📸 Gallery
          </button>
          <button
            id="tab-badges-btn"
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏆 Badges
          </button>
        </div>

        {/* TAB 1: ICONIC TOP 8 FRIENDS */}
        {activeTab === 'top8' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Alex's Inner Circle (Top 8)
              </span>
              <span className="text-pink-400 font-mono">Tap friend to message</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {user.top8Friends.map((friend) => (
                <button
                  key={friend.id}
                  id={`top8-friend-${friend.id}`}
                  onClick={() => onOpenChatWithFriend(friend)}
                  className="flex flex-col items-center p-2 rounded-2xl bg-[#120c29] border border-purple-800/40 hover:border-pink-500/50 transition-all group cursor-pointer focus:outline-none"
                >
                  <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-400 group-hover:scale-105 transition-transform">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-full object-cover border-2 border-[#090714]"
                    />
                    {friend.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090714]" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-white mt-1.5 truncate max-w-full group-hover:text-pink-300">
                    {friend.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-cyan-300 font-mono truncate max-w-full">
                    {friend.handle}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PHOTOS GALLERY */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-3 gap-2">
            {galleryImages.map((src, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-2xl overflow-hidden border border-purple-800/30 group cursor-pointer"
              >
                <img
                  src={src}
                  alt="Gallery upload"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: BADGES */}
        {activeTab === 'badges' && (
          <div className="space-y-2">
            {user.badges.map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#120c29] border border-purple-800/40"
              >
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{badge}</h4>
                  <p className="text-[10px] text-slate-400">Unlocked achievement badge</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
