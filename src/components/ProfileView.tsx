import React, { useState, useRef } from 'react';
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
  Check,
  Flame,
  LogOut,
  Camera,
  Upload,
  MessageSquare,
  Search,
  ExternalLink,
  X,
  FileText,
} from 'lucide-react';
import { UserProfile, Friend, TabType } from '../types';
import { UserAvatar } from './UserAvatar';

interface ProfileViewProps {
  user: UserProfile;
  allFriends?: Friend[];
  onOpenChatWithFriend: (friend: Friend) => void;
  onUpdateBio: (newBio: string) => void;
  onUpdateProfile?: (updatedUser: Partial<UserProfile>) => void;
  onSelectTab?: (tab: TabType) => void;
  onShowToast?: (msg: string) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  allFriends = [],
  onOpenChatWithFriend,
  onUpdateBio,
  onUpdateProfile,
  onSelectTab,
  onShowToast,
  onLogout,
}) => {
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'top8' | 'allFriends' | 'posts' | 'photos' | 'badges'>('top8');
  const [friendsSearch, setFriendsSearch] = useState('');

  // Edit form state
  const [editName, setEditName] = useState(user.name);
  const [editHandle, setEditHandle] = useState(user.handle);
  const [editBio, setEditBio] = useState(user.bio);
  const [editStatusText, setEditStatusText] = useState(user.statusText || '⚡ Online & dreaming in neon');

  // File upload refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const galleryImages = [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
  ];

  const userSharedPosts = [
    {
      id: 'p_1',
      date: 'Today at 2:15 PM',
      content: 'Just dropped a new synthwave mix on my profile player! Turn your speakers up and tell me what you think 🎧⚡',
      likes: 84,
      comments: 19,
    },
    {
      id: 'p_2',
      date: 'Yesterday',
      content: 'Re-arranged my Top 8! Check out the cyber crew in my inner circle ⭐',
      likes: 126,
      comments: 32,
    },
  ];

  // Avatar upload handler
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (onUpdateProfile) {
          onUpdateProfile({ avatar: result });
        }
        if (onShowToast) onShowToast('📸 Profile photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Cover photo upload handler
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (onUpdateProfile) {
          onUpdateProfile({ coverImage: result });
        }
        if (onShowToast) onShowToast('🖼️ Cover photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName.trim(),
        handle: editHandle.trim(),
        bio: editBio.trim(),
        statusText: editStatusText.trim(),
      });
    }
    onUpdateBio(editBio.trim());
    setIsEditingProfile(false);
    if (onShowToast) onShowToast('✨ Profile details updated successfully!');
  };

  const filteredFriendsList = allFriends.filter((f) =>
    f.name.toLowerCase().includes(friendsSearch.toLowerCase()) ||
    f.handle.toLowerCase().includes(friendsSearch.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-28">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={handleCoverFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Cover Banner with Neon Gradient Overlay */}
      <div className="relative h-40 w-full overflow-hidden bg-purple-950 group">
        <img
          src={user.coverImage}
          alt="Profile Cover"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090714] via-transparent to-black/50" />

        {/* Change Cover Button */}
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/40 text-white text-xs flex items-center gap-1.5 hover:bg-pink-600 transition-colors z-10 shadow-md"
          title="Change Cover Photo"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">Cover Photo</span>
        </button>

        {/* Action icons on top right */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            id="share-profile-btn"
            onClick={() => onShowToast ? onShowToast('Profile URL copied to clipboard! 🔗') : null}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-pink-500 transition-colors"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            id="profile-settings-btn"
            onClick={() => setIsEditingProfile(true)}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-purple-600 transition-colors"
            title="Edit Profile"
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
      <div className="px-4 -mt-16 relative z-10 space-y-3">
        <div className="flex items-end justify-between">
          {/* Avatar with glowing ring & photo upload button */}
          <div className="relative group">
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_25px_rgba(236,72,153,0.5)]">
              <UserAvatar
                name={user.name}
                avatar={user.avatar}
                size="2xl"
                isOnline={true}
                showOnline={true}
              />
            </div>

            {/* Change Profile Photo Button */}
            <button
              id="upload-profile-photo-btn"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -left-1 p-2 rounded-full bg-pink-500 text-white shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-[#090714] flex items-center justify-center cursor-pointer z-10"
              title="Upload Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons: Edit Profile & Logout */}
          <div className="flex items-center gap-2">
            <button
              id="edit-profile-action-btn"
              onClick={() => setIsEditingProfile(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            {onLogout && (
              <button
                id="logout-button"
                onClick={onLogout}
                className="px-3 py-2 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1"
                title="Log Out of MySpace"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Name and Handle */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-extrabold text-2xl text-white">
              {user.name}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-mono">
              VIP CREATOR
            </span>
          </div>
          <p className="text-xs text-cyan-400 font-mono mt-0.5">{user.handle}</p>

          {/* Status Bubble */}
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-pink-500/10 border border-pink-500/30 text-xs text-pink-200">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span className="font-medium">{user.statusText || user.bio}</span>
          </div>
        </div>

        {/* Bio Text */}
        <p className="text-xs text-slate-300 leading-relaxed pt-1">{user.bio}</p>

        {/* Profile Song Card (The Classic Iconic MySpace feature!) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#181033] to-pink-950/70 border border-pink-500/40 shadow-[0_0_20px_rgba(236,72,153,0.2)] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="profile-song-toggle-btn"
              onClick={() => setIsPlayingSong(!isPlayingSong)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:scale-105 active:scale-95 transition-transform"
              title={isPlayingSong ? 'Pause Anthem' : 'Play Anthem'}
            >
              {isPlayingSong ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                <Music className={`w-3 h-3 ${isPlayingSong ? 'animate-bounce' : ''}`} />
                <span>Profile Anthem</span>
              </div>
              <h4 className="text-xs font-semibold text-white mt-0.5 truncate">
                {user.profileSong.title}
              </h4>
              <p className="text-[11px] text-cyan-300 truncate">{user.profileSong.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Equalizer bars */}
            <div className="flex items-end gap-0.5 h-4">
              {[30, 80, 50, 95, 60, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-0.5 bg-gradient-to-t from-pink-500 to-cyan-400 rounded-full transition-all duration-300 ${
                    isPlayingSong ? 'animate-pulse' : 'opacity-40'
                  }`}
                  style={{
                    height: isPlayingSong ? `${h}%` : '25%',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            {/* Change Anthem Button (Navigates to Music tab) */}
            {onSelectTab && (
              <button
                onClick={() => onSelectTab('music')}
                className="px-2 py-1 rounded-lg bg-purple-900/40 hover:bg-pink-500/20 border border-purple-700/50 text-[10px] text-pink-300 hover:text-white transition-colors flex items-center gap-1"
                title="Change Profile Anthem"
              >
                <Music className="w-3 h-3" />
                <span>Change</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-2xl bg-[#120c29] border border-purple-800/40 text-center">
            <span className="font-display font-bold text-base text-pink-400">
              {user.stats.followers ?? 0}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Followers</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#120c29] border border-purple-800/40 text-center">
            <span className="font-display font-bold text-base text-cyan-400">
              {user.stats.following ?? 0}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Following</p>
          </div>
          <div
            onClick={() => setActiveTab('allFriends')}
            className="p-2.5 rounded-2xl bg-[#120c29] border border-purple-800/40 text-center cursor-pointer hover:border-pink-500/50 transition-colors"
          >
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

      {/* Tabs: Top 8 Friends, All Friends, Shared Posts, Photos, Badges */}
      <div className="px-4 space-y-3">
        <div className="flex bg-purple-950/40 p-1 rounded-2xl border border-purple-800/30 text-xs overflow-x-auto no-scrollbar gap-1">
          <button
            id="tab-top8-btn"
            onClick={() => setActiveTab('top8')}
            className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'top8'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⭐ Top 8
          </button>
          <button
            id="tab-allfriends-btn"
            onClick={() => setActiveTab('allFriends')}
            className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'allFriends'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👥 Friends ({allFriends.length})
          </button>
          <button
            id="tab-posts-btn"
            onClick={() => setActiveTab('posts')}
            className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📝 Posts
          </button>
          <button
            id="tab-photos-btn"
            onClick={() => setActiveTab('photos')}
            className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
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
            className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
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
                {user.name.split(' ')[0]}'s Inner Circle (Top 8)
              </span>
              <span className="text-pink-400 font-mono text-[11px]">Tap friend to chat</span>
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
                    <UserAvatar
                      name={friend.name}
                      avatar={friend.avatar}
                      size="md"
                      isOnline={friend.isOnline}
                      showOnline={true}
                    />
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

        {/* TAB 2: ALL FRIENDS LIST */}
        {activeTab === 'allFriends' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={friendsSearch}
                onChange={(e) => setFriendsSearch(e.target.value)}
                placeholder="Search friends..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="space-y-2">
              {filteredFriendsList.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#120c29] border border-purple-800/40 hover:border-purple-700"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      name={f.name}
                      avatar={f.avatar}
                      size="sm"
                      isOnline={f.isOnline}
                      showOnline={true}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{f.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{f.statusText || f.handle}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenChatWithFriend(f)}
                    className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-pink-500 text-pink-300 hover:text-white border border-purple-700/50 text-xs font-medium flex items-center gap-1 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SHARED POSTS */}
        {activeTab === 'posts' && (
          <div className="space-y-2.5">
            {userSharedPosts.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-[#120c29] border border-purple-800/40 space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-pink-300">{user.name}</span>
                  <span>{p.date}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{p.content}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-purple-900/30">
                  <span className="flex items-center gap-1 text-pink-400">
                    <Heart className="w-3.5 h-3.5 fill-pink-500" /> {p.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> {p.comments}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: PHOTOS GALLERY */}
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

        {/* TAB 5: BADGES */}
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

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#120a28] border border-purple-800/60 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-pink-400" />
                <h3 className="font-display font-bold text-base text-white">Edit Profile</h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-300">DISPLAY NAME</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300">HANDLE</label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-cyan-300 focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300">STATUS (SHOWN ON HOMEPAGE)</label>
                <input
                  type="text"
                  value={editStatusText}
                  onChange={(e) => setEditStatusText(e.target.value)}
                  placeholder="e.g. ⚡ Online & dreaming in neon"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-pink-300 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300">MYSPACE BIO</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2 rounded-xl border border-purple-800/40 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-bold text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
