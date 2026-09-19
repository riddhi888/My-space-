import React, { useState } from 'react';
import {
  Music,
  Users,
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
  Eye,
  EyeOff,
  Link as LinkIcon,
  MessageSquare,
  ExternalLink,
  Plus,
  Film,
  Gamepad2,
  Bookmark,
  Copy,
  UserPlus,
  UserCheck,
  Send,
  Calendar,
  Layers,
  Lock,
  Bell,
  Radio,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import {
  UserProfile,
  Friend,
  SocialPost,
  SharedLink,
  MusicTrack,
  Reel,
  UserSettings,
  NotificationItem,
  TabType,
  ProfileMoodType,
  UserSocialLinks,
} from '../types';
import { EditProfileModal } from './EditProfileModal';
import { GuestbookWall } from './GuestbookWall';
import { Top8FriendsManager } from './Top8FriendsManager';
import {
  BannerSocialLinks,
  ProfileHeaderSocialLinks,
  loadSocialLinksFromStorage,
  saveSocialLinksToStorage,
} from './SocialIcons';

export const MOOD_OPTIONS: Record<
  ProfileMoodType,
  {
    label: string;
    emoji: string;
    color: string;
    glow: string;
    borderColor: string;
    description: string;
  }
> = {
  Ecstatic: {
    label: 'Ecstatic',
    emoji: '😁',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.55)',
    borderColor: '#f59e0b',
    description: 'feeling on top of the world :D',
  },
  Bored: {
    label: 'Bored',
    emoji: '🥱',
    color: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.4)',
    borderColor: '#94a3b8',
    description: 'someone entertain me -_-',
  },
  Hungover: {
    label: 'Hungover',
    emoji: '😵‍💫',
    color: '#a3e635',
    glow: 'rgba(163, 230, 53, 0.5)',
    borderColor: '#a3e635',
    description: 'too much energy drink last night x_x',
  },
  Hyper: {
    label: 'Hyper',
    emoji: '⚡',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.6)',
    borderColor: '#ec4899',
    description: 'CANNOT SIT STILL >_< !!!',
  },
  Melancholy: {
    label: 'Melancholy',
    emoji: '🥀',
    color: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.5)',
    borderColor: '#818cf8',
    description: 'listening to sad songs in the dark :(',
  },
  Creative: {
    label: 'Creative',
    emoji: '🎨',
    color: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.6)',
    borderColor: '#22d3ee',
    description: 'coding my profile layout & making art ;)',
  },
};

interface ProfileViewProps {
  user: UserProfile;
  posts?: SocialPost[];
  sharedLinks?: SharedLink[];
  favoriteTracks?: MusicTrack[];
  favoriteReels?: Reel[];
  notifications?: NotificationItem[];
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onSelectTab?: (tab: TabType) => void;
  onOpenChatWithFriend: (friend: Friend) => void;
  onUpdateProfile: (updatedData: {
    name: string;
    handle: string;
    bio: string;
    avatar: string;
    coverImage: string;
    socialLinks?: UserSocialLinks;
  }) => void;
  onOpenNetworkList?: (tab: 'followers' | 'following') => void;
  onDiscoverPeople?: () => void;
  onSelectFriend?: (friend: Friend) => void;
  onOpenSettings?: () => void;
  onOpenShareModal?: () => void;
  onCreatePost?: () => void;
  onLikePost?: (postId: string) => void;
  onLikeSharedLink?: (linkId: string) => void;
  onOpenReel?: (index: number) => void;
  followingCount?: number;
  followersCount?: number;
  settings?: UserSettings;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  posts = [],
  sharedLinks = [],
  favoriteTracks = [],
  favoriteReels = [],
  notifications = [],
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onSelectTab,
  onOpenChatWithFriend,
  onUpdateProfile,
  onOpenNetworkList,
  onDiscoverPeople,
  onOpenSettings,
  onOpenShareModal,
  onCreatePost,
  onLikePost,
  onLikeSharedLink,
  onOpenReel,
  followingCount,
  followersCount,
  settings,
}) => {
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'entertainment' | 'notifications' | 'links' | 'top8' | 'favorites' | 'gallery'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalInitialTab, setEditModalInitialTab] = useState<'info' | 'social' | 'avatar' | 'cover' | 'preview'>('info');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isVisitorFollowing, setIsVisitorFollowing] = useState(false);
  const [isVisitorFriendRequested, setIsVisitorFriendRequested] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Social Links State with localStorage sync
  const [socialLinksState, setSocialLinksState] = useState<UserSocialLinks>(() =>
    loadSocialLinksFromStorage(user.id, user.socialLinks)
  );

  React.useEffect(() => {
    const handleSync = () => {
      setSocialLinksState(loadSocialLinksFromStorage(user.id, user.socialLinks));
    };
    handleSync();
    window.addEventListener('socialLinks-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('socialLinks-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user.id, user.socialLinks]);

  // 2008 Retro Mood State
  const moodStorageKey = `myspace_user_mood_${user.id || 'default'}`;
  const [currentMood, setCurrentMood] = useState<ProfileMoodType>(() => {
    try {
      const saved = localStorage.getItem(moodStorageKey);
      if (saved && saved in MOOD_OPTIONS) {
        return saved as ProfileMoodType;
      }
    } catch {
      // fallback
    }
    return 'Creative';
  });
  const [isMoodDropdownOpen, setIsMoodDropdownOpen] = useState(false);

  const handleSelectMood = (mood: ProfileMoodType) => {
    setCurrentMood(mood);
    setIsMoodDropdownOpen(false);
    try {
      localStorage.setItem(moodStorageKey, mood);
    } catch (e) {
      console.error('Failed to save mood', e);
    }
    showToast(`Mood updated to: ${MOOD_OPTIONS[mood].emoji} ${mood}`);
  };

  const activeMoodConfig = MOOD_OPTIONS[currentMood] || MOOD_OPTIONS.Creative;

  // Filter posts authored by this user
  const userPosts = posts.filter(
    (p) =>
      p.author.handle === user.handle ||
      p.author.name === user.name ||
      p.id.startsWith('post_user_')
  );

  // Filter shared links by this user
  const userSharedLinks = sharedLinks.filter(
    (l) =>
      l.author === user.name ||
      l.author === user.handle ||
      l.id.startsWith('link_user_')
  );

  // Fallback gallery images
  const galleryImages = [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    showToast('Profile link copied to clipboard!');
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[#140b2b] border border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.5)] text-pink-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. VISITOR PREVIEW MODE BANNER */}
      {isPreviewMode && (
        <div className="mx-4 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-[#0d1c2d] to-purple-950/90 border border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.3)] flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-xs text-white">
                  Visitor Preview Mode
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono border border-cyan-400/40">
                  PUBLIC VIEW
                </span>
              </div>
              <p className="text-[10px] text-cyan-200/80">
                Viewing profile as other users and visitors see it
              </p>
            </div>
          </div>
          <button
            id="exit-preview-mode-btn"
            onClick={() => setIsPreviewMode(false)}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors shadow-sm flex items-center gap-1"
          >
            <EyeOff className="w-3.5 h-3.5" />
            Exit Preview
          </button>
        </div>
      )}

      {/* Top Preview Mode Switcher when NOT in preview */}
      {!isPreviewMode && (
        <div className="px-4 flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-300 font-display">MySpace Identity</span>
            <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono border border-pink-500/30">
              Profile Center
            </span>
          </div>

          <button
            id="toggle-preview-mode-btn"
            onClick={() => {
              setIsPreviewMode(true);
              showToast('Switched to Visitor Preview Mode');
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-950/40 transition-all shadow-sm"
            title="See how your profile appears to other users"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            Preview as Visitor
          </button>
        </div>
      )}

      {/* 2. COVER BANNER WITH NEON GRADIENT OVERLAY & MOOD BORDER */}
      <div
        id="profile-cover-banner"
        className="relative h-40 w-full overflow-hidden bg-[#0a0717] transition-all duration-300 border-b-4"
        style={{
          borderColor: activeMoodConfig.borderColor,
          boxShadow: `0 6px 24px ${activeMoodConfig.glow}`,
        }}
      >
        {user.coverImage ? (
          <img
            src={user.coverImage}
            alt="Profile Cover"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#210936] via-[#120726] to-[#0a182e] flex items-center justify-center relative overflow-hidden">
            {/* Ambient cyber mesh background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(236,72,153,0.25),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(6,182,212,0.2),transparent_60%)]" />
            <span className="font-mono text-xs text-purple-400/60 uppercase tracking-widest relative z-10">
              ⚡ Cyber Mesh Canvas
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090714] via-[#090714]/40 to-black/30" />

        {/* Top Right Action Icons */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            id="profile-share-link-btn"
            onClick={handleShareProfile}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-pink-500 transition-colors shadow-sm"
            title="Share Profile Link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {!isPreviewMode && onOpenSettings && (
            <button
              id="profile-settings-btn"
              onClick={onOpenSettings}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-purple-600 transition-colors shadow-sm"
              title="Settings & Privacy"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* CONNECTED SOCIAL ACCOUNTS ON BANNER */}
        <div className="absolute bottom-2.5 right-3 z-20">
          <BannerSocialLinks
            socialLinks={socialLinksState}
            userId={user.id}
            isPreviewMode={isPreviewMode}
            onOpenEditModal={() => {
              setEditModalInitialTab('social');
              setIsEditModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* 3. AVATAR & MAIN USER IDENTITY INFO */}
      <div className="px-4 -mt-14 relative z-10 space-y-3.5">
        <div className="flex items-end justify-between">
          {/* Avatar with glowing neon ring and online badge */}
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_25px_rgba(236,72,153,0.5)]">
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-22 h-22 rounded-full object-cover border-4 border-[#090714]"
            />
            {(!settings || settings.privacy.showOnlineStatus) && (
              <span
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#090714] shadow-[0_0_8px_#34d399]"
                title="Online now"
              />
            )}
          </div>

          {/* Action Buttons: OWNER MODE vs VISITOR PREVIEW MODE */}
          {!isPreviewMode ? (
            <div className="flex items-center gap-2">
              {onOpenSettings && (
                <button
                  id="profile-open-settings-action-btn"
                  onClick={onOpenSettings}
                  className="px-3.5 py-2 rounded-2xl bg-[#140b2b] border border-purple-700/50 text-slate-200 text-xs font-semibold hover:bg-purple-900/60 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                  title="Open Settings"
                >
                  <Settings className="w-3.5 h-3.5 text-cyan-400" />
                  Settings
                </button>
              )}
              <button
                id="edit-profile-action-btn"
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="visitor-follow-btn"
                onClick={() => {
                  setIsVisitorFollowing(!isVisitorFollowing);
                  showToast(
                    isVisitorFollowing
                      ? 'Unfollowed @' + user.handle.replace('@', '')
                      : 'You are now following ' + user.name + '!'
                  );
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                  isVisitorFollowing
                    ? 'bg-purple-900/60 border border-purple-600 text-cyan-300'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                }`}
              >
                {isVisitorFollowing ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Follow
                  </>
                )}
              </button>

              <button
                id="visitor-message-btn"
                onClick={() => {
                  showToast('Opening chat conversation with ' + user.name);
                }}
                className="px-3.5 py-2 rounded-2xl bg-[#140b2b] border border-cyan-500/50 text-cyan-300 text-xs font-semibold hover:bg-cyan-950/60 transition-all flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message
              </button>

              <button
                id="visitor-friend-req-btn"
                onClick={() => {
                  setIsVisitorFriendRequested(!isVisitorFriendRequested);
                  showToast(
                    isVisitorFriendRequested
                      ? 'Friend request cancelled'
                      : 'Friend request dispatched to ' + user.name
                  );
                }}
                className={`p-2 rounded-2xl border transition-all text-xs ${
                  isVisitorFriendRequested
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400'
                    : 'bg-[#140b2b] border-purple-700/50 text-slate-300 hover:text-white'
                }`}
                title="Send Friend Request"
              >
                {isVisitorFriendRequested ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Users className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Display Name, Mood Dropdown, & Username (@handle) */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-black text-xl text-white tracking-wide">
              {user.name}
            </h1>

            {/* Retro 2008 Mood Dropdown beside profile name */}
            <div className="relative inline-block">
              <button
                type="button"
                id="profile-mood-dropdown-btn"
                onClick={() => setIsMoodDropdownOpen(!isMoodDropdownOpen)}
                className="px-2 py-0.5 rounded-md border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer select-none hover:scale-102 active:scale-95"
                style={{
                  borderColor: activeMoodConfig.color,
                  backgroundColor: `${activeMoodConfig.color}20`,
                  color: activeMoodConfig.color,
                  boxShadow: `0 0 10px ${activeMoodConfig.color}35`,
                }}
                title="Change 2008 MySpace Mood"
              >
                <span>{activeMoodConfig.emoji}</span>
                <span className="font-bold">Mood: {currentMood}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {/* 2008 Retro Mood Dropdown Popup */}
              {isMoodDropdownOpen && (
                <div
                  id="profile-mood-dropdown-menu"
                  className="absolute left-0 top-full mt-1 z-40 w-48 rounded-xl bg-[#120824] border-2 border-purple-600/80 p-1 shadow-[0_0_25px_rgba(0,0,0,0.85)] space-y-0.5 text-xs animate-in fade-in duration-100"
                >
                  <div className="px-2 py-1 border-b border-purple-800/40 text-[9px] font-mono text-cyan-300 flex items-center justify-between">
                    <span>STATUS: 2008 MOOD</span>
                    <span className="text-[8px] text-pink-400">Updates Banner</span>
                  </div>

                  {(Object.keys(MOOD_OPTIONS) as ProfileMoodType[]).map((moodKey) => {
                    const item = MOOD_OPTIONS[moodKey];
                    const isSelected = currentMood === moodKey;
                    return (
                      <button
                        key={moodKey}
                        type="button"
                        onClick={() => handleSelectMood(moodKey)}
                        className={`w-full px-2 py-1 rounded-md text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-purple-900/80 text-white font-bold'
                            : 'hover:bg-purple-950/60 text-slate-300'
                        }`}
                        style={{
                          borderLeft: isSelected ? `3px solid ${item.color}` : '3px solid transparent',
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{item.emoji}</span>
                          <span className="text-[11px] font-medium">{moodKey}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[8px] font-mono font-bold" style={{ color: item.color }}>
                            ✓ Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-400" /> VIP CREATOR
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <p className="text-cyan-400 font-mono font-medium">{user.handle}</p>
            <span className="text-[10px] text-slate-400 font-mono italic">
              — feeling {activeMoodConfig.description}
            </span>
          </div>

          {/* Connected Social Accounts with Brand Colors on Profile Header */}
          <ProfileHeaderSocialLinks socialLinks={socialLinksState} size="md" />
        </div>

        {/* Bio */}
        {settings && !settings.privacy.showProfileInfo && isPreviewMode ? (
          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs text-slate-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-pink-400 shrink-0" />
            <span className="italic">Bio and profile information are hidden by user privacy settings.</span>
          </div>
        ) : (
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {user.bio}
          </p>
        )}

        {/* 1. GUESTBOOK WALL (Right below bio as requested) */}
        <GuestbookWall userId={user.id} userName={user.name} />

        {/* Profile Song Card (The Classic Iconic MySpace Anthem!) */}
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

        {/* 4. KEY STATS: FOLLOWERS, FOLLOWING, AND POSTS (Requirement 3) */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* Posts Count */}
          <button
            id="profile-stat-posts-btn"
            onClick={() => setActiveTab('posts')}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-purple-950/60 border-pink-500/60 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                : 'bg-[#120c29] border-purple-800/40 hover:border-pink-500/50'
            }`}
          >
            <span className="font-display font-bold text-base text-white">
              {userPosts.length || user.stats.posts || 4}
            </span>
            <p className="text-[11px] text-pink-300 mt-0.5 font-medium flex items-center justify-center gap-1">
              Posts
            </p>
          </button>

          {/* Followers Count */}
          <button
            id="profile-stat-followers-btn"
            onClick={() => onOpenNetworkList?.('followers')}
            className="p-3 rounded-2xl bg-[#120c29] border border-purple-800/40 hover:border-cyan-400/50 text-center transition-all cursor-pointer"
          >
            <span className="font-display font-bold text-base text-cyan-400">
              {followersCount ?? user.stats.followers}
            </span>
            <p className="text-[11px] text-cyan-300 mt-0.5 font-medium">Followers ↗</p>
          </button>

          {/* Following Count */}
          <button
            id="profile-stat-friends-btn"
            onClick={() => onOpenNetworkList?.('following')}
            className="p-3 rounded-2xl bg-[#120c29] border border-purple-800/40 hover:border-purple-500/50 text-center transition-all cursor-pointer"
          >
            <span className="font-display font-bold text-base text-purple-300">
              {followingCount ?? user.stats.friends}
            </span>
            <p className="text-[11px] text-purple-300 mt-0.5 font-medium">Following ↗</p>
          </button>
        </div>

        {/* Quick Discover People Shortcut (owner mode) */}
        {!isPreviewMode && onDiscoverPeople && (
          <button
            id="profile-discover-shortcut-btn"
            onClick={onDiscoverPeople}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#150d30] to-pink-950/60 border border-purple-700/40 hover:border-pink-500 text-xs text-white flex items-center justify-between shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Discover New People & Creators</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              Explore →
            </span>
          </button>
        )}
      </div>

      {/* 5. SEPARATE CONTENT TABS: POSTS, ENTERTAINMENT, NOTIFICATIONS, SHARED LINKS, TOP 8, FAVORITES */}
      <div className="px-3 space-y-3">
        <div className="flex bg-[#0d091e] p-1 rounded-xl border border-purple-800/40 text-xs overflow-x-auto gap-1 no-scrollbar">
          <button
            id="tab-posts-btn"
            onClick={() => setActiveTab('posts')}
            className={`py-1.5 px-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Posts ({userPosts.length})
          </button>

          <button
            id="tab-entertainment-btn"
            onClick={() => setActiveTab('entertainment')}
            className={`py-1.5 px-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'entertainment'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-pink-300" />
            Entertainment
          </button>

          <button
            id="tab-notifications-btn"
            onClick={() => setActiveTab('notifications')}
            className={`py-1.5 px-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-cyan-300" />
            <span>Alerts</span>
            {unreadNotificationsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            )}
          </button>

          <button
            id="tab-links-btn"
            onClick={() => setActiveTab('links')}
            className={`py-1.5 px-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'links'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Links ({userSharedLinks.length})
          </button>

          <button
            id="tab-top8-btn"
            onClick={() => setActiveTab('top8')}
            className={`py-1.5 px-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'top8'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-300" />
            Top 8
          </button>

          <button
            id="tab-favorites-btn"
            onClick={() => setActiveTab('favorites')}
            className={`py-1.5 px-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved
          </button>
        </div>

        {/* ================= TAB: ENTERTAINMENT HUBS (MOVED FROM HOME) ================= */}
        {activeTab === 'entertainment' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#140e2b] border border-purple-800/60 shadow-sm space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-purple-900/40">
                <div>
                  <h3 className="font-display font-bold text-xs text-white">
                    Entertainment & Media Hubs
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Connect and launch your favorite social & media services
                  </p>
                </div>
                {onSelectTab && (
                  <button
                    onClick={() => onSelectTab('connected-apps')}
                    className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 hover:bg-pink-600 border border-purple-700/50 text-pink-200 hover:text-white font-mono transition-all cursor-pointer"
                  >
                    OAuth Hub →
                  </button>
                )}
              </div>

              {/* Compact Retro Grid of Entertainment Hubs */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Instagram Hub */}
                <div
                  onClick={() => onSelectTab?.('connected-apps')}
                  className="p-2.5 rounded-lg bg-[#0d091e] border border-purple-900/50 hover:border-pink-500/60 transition-all cursor-pointer group flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                    IG
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-pink-300 truncate">
                      Instagram
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">Posts & Drops</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 shrink-0" />
                </div>

                {/* Facebook Hub */}
                <div
                  onClick={() => onSelectTab?.('connected-apps')}
                  className="p-2.5 rounded-lg bg-[#0d091e] border border-purple-900/50 hover:border-blue-500/60 transition-all cursor-pointer group flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-md bg-[#1877F2] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                    f
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300 truncate">
                      Facebook
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">Feed & Groups</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                </div>

                {/* YouTube Hub */}
                <div
                  onClick={() => onSelectTab?.('connected-apps')}
                  className="p-2.5 rounded-lg bg-[#0d091e] border border-purple-900/50 hover:border-red-500/60 transition-all cursor-pointer group flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-md bg-[#FF0000] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                    ▶
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-red-300 truncate">
                      YouTube
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">Music & Videos</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 shrink-0" />
                </div>

                {/* Cyber Reels Hub */}
                <div
                  onClick={() => onOpenReel?.(0)}
                  className="p-2.5 rounded-lg bg-[#0d091e] border border-purple-900/50 hover:border-pink-500/60 transition-all cursor-pointer group flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                    <Radio className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-pink-300 truncate">
                      Reels
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">Short Video Clips</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 shrink-0" />
                </div>

                {/* Music Player */}
                <div
                  onClick={() => onSelectTab?.('music')}
                  className="p-2.5 rounded-lg bg-[#0d091e] border border-purple-900/50 hover:border-cyan-500/60 transition-all cursor-pointer group flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                    <Music className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                      Cyber Beats
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">Music Player FM</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                </div>

                {/* Arcade Games */}
                <div
                  onClick={() => onSelectTab?.('games')}
                  className="p-2.5 rounded-lg bg-[#0d091e] border border-purple-900/50 hover:border-purple-400/60 transition-all cursor-pointer group flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                    <Gamepad2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                      Arcade Games
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">Retro 2008 Hits</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: NOTIFICATIONS (MOVED FROM HOME) ================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#140e2b] border border-purple-800/60 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-purple-900/40">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-display font-bold text-xs text-white">
                    Notifications & Activity
                  </h3>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white font-mono text-[9px] font-bold">
                      {unreadNotificationsCount} unread
                    </span>
                  )}
                </div>
                {onOpenNotifications && (
                  <button
                    onClick={onOpenNotifications}
                    className="text-[10px] text-pink-300 hover:text-white font-mono cursor-pointer"
                  >
                    Manage All →
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#0d091e] border border-purple-900/40 text-center text-slate-400 text-xs">
                  No notifications yet. You're all caught up! ✨
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                        !item.isRead
                          ? 'bg-purple-950/40 border-pink-500/40 shadow-xs'
                          : 'bg-[#0d091e] border-purple-900/30 text-slate-300'
                      }`}
                    >
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.senderName || 'User'}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-md object-cover border border-purple-700/60 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 text-xs font-bold shrink-0">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 1: POSTS ================= */}
        {activeTab === 'posts' && (
          <div className="space-y-3">
            {/* Header / Create Post Button for owner */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xs text-white">
                  {isPreviewMode ? `${user.name}'s Posts` : 'Your Authored Posts'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  Shared thoughts, photos & studio updates
                </p>
              </div>

              {!isPreviewMode && onCreatePost && (
                <button
                  id="profile-create-post-btn"
                  onClick={onCreatePost}
                  className="px-3 py-1.5 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-semibold hover:bg-pink-500 hover:text-white transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Post
                </button>
              )}
            </div>

            {userPosts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#120c29] border border-purple-800/40 text-center space-y-2">
                <Layers className="w-8 h-8 text-pink-400/50 mx-auto" />
                <h4 className="text-xs font-bold text-white">No Posts Yet</h4>
                <p className="text-[11px] text-slate-400">
                  Share your first cyberpunk update or studio thought!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl bg-[#120c29] border border-purple-800/40 space-y-3 shadow-md hover:border-purple-700/60 transition-all"
                  >
                    {/* Post Author Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={post.author.avatar || user.avatar}
                          alt={post.author.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-purple-600/50"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              {post.author.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 text-[9px] font-mono">
                              {post.source}
                            </span>
                          </div>
                          <span className="text-[10px] text-cyan-400 font-mono">
                            {post.author.handle} • {post.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Image if present */}
                    {post.image && (
                      <div className="rounded-xl overflow-hidden border border-purple-800/40 max-h-60">
                        <img
                          src={post.image}
                          alt="Post media"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-purple-950/60 text-pink-400 text-[10px] font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Post Interactions */}
                    <div className="flex items-center justify-between pt-2 border-t border-purple-900/40 text-xs text-slate-400">
                      <button
                        onClick={() => onLikePost?.(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          post.isLiked ? 'text-pink-400 font-semibold' : 'hover:text-pink-400'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${post.isLiked ? 'fill-pink-500 text-pink-500' : ''}`}
                        />
                        <span>{post.likes}</span>
                      </button>

                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{post.commentsCount}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>{post.sharesCount}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: SHARED LINKS ================= */}
        {activeTab === 'links' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xs text-white">
                  {isPreviewMode ? `${user.name}'s Shared Links` : 'Your Shared Links'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  YouTube, Instagram, Facebook & media embeds
                </p>
              </div>

              {!isPreviewMode && onOpenShareModal && (
                <button
                  id="profile-share-new-link-btn"
                  onClick={onOpenShareModal}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Share Link
                </button>
              )}
            </div>

            {userSharedLinks.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#120c29] border border-purple-800/40 text-center space-y-2">
                <LinkIcon className="w-8 h-8 text-cyan-400/50 mx-auto" />
                <h4 className="text-xs font-bold text-white">No Shared Links Yet</h4>
                <p className="text-[11px] text-slate-400">
                  Share your favorite YouTube sets, songs, or Instagram reels!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userSharedLinks.map((link) => {
                  const getPlatformBadge = () => {
                    switch (link.type) {
                      case 'youtube':
                        return { label: 'YouTube', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
                      case 'instagram':
                        return { label: 'Instagram', color: 'bg-pink-500/20 text-pink-400 border-pink-500/40' };
                      case 'facebook':
                        return { label: 'Facebook', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
                      default:
                        return { label: 'Web Link', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' };
                    }
                  };
                  const badge = getPlatformBadge();

                  return (
                    <div
                      key={link.id}
                      className="p-4 rounded-2xl bg-[#120c29] border border-purple-800/40 space-y-2.5 shadow-md hover:border-cyan-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {link.timestamp}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">
                        {link.title}
                      </h4>

                      {link.caption && (
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {link.caption}
                        </p>
                      )}

                      <div className="p-2.5 rounded-xl bg-black/40 border border-purple-900/50 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-mono text-cyan-400 truncate max-w-[220px]">
                          {link.url}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText?.(link.url);
                              showToast('Link copied!');
                            }}
                            className="p-1.5 rounded-lg bg-purple-900/40 text-slate-300 hover:text-white"
                            title="Copy Link"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-black flex items-center gap-1 text-[10px] font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" /> Open
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                        <button
                          onClick={() => onLikeSharedLink?.(link.id)}
                          className={`flex items-center gap-1 text-[11px] transition-colors ${
                            link.isLiked ? 'text-pink-400 font-semibold' : 'hover:text-pink-400'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${link.isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                          <span>{link.likes} likes</span>
                        </button>
                        <span className="text-[10px] text-slate-500">Shared by {link.author}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: FAVORITE CONTENT ================= */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            {/* 1. Favorite Music Tracks */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Music className="w-3.5 h-3.5 text-pink-400" />
                <span>Bookmarked Anthems & Tracks</span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-[#120c29] border border-purple-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80"
                      alt="Album"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-purple-700/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">Resonance & Neon Dreams</h4>
                      <p className="text-[10px] text-cyan-300 font-mono">Lazerhawk & HOME • 3:42</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-pink-500/20 text-pink-300 text-[10px] font-mono border border-pink-500/30">
                    Profile Song
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#120c29] border border-purple-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=200&q=80"
                      alt="Album"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-purple-700/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">Midnight Highway Cruise</h4>
                      <p className="text-[10px] text-cyan-300 font-mono">The Midnight City • 4:12</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-purple-900/40 text-purple-300 text-[10px] font-mono">
                    Favorite
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Bookmarked Reels */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Film className="w-3.5 h-3.5 text-cyan-400" />
                <span>Saved Reels & Visuals</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    title: 'Rainy highway Neo-district',
                    likes: '48.2k',
                    img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
                  },
                  {
                    title: 'Neon glass shaders',
                    likes: '29.5k',
                    img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
                  },
                  {
                    title: 'Underground Cyber Club',
                    likes: '63.1k',
                    img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onOpenReel?.(idx)}
                    className="group relative aspect-[9/14] rounded-2xl overflow-hidden border border-purple-800/40 cursor-pointer text-left"
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                      <span className="text-[10px] text-white font-semibold truncate">
                        {item.title}
                      </span>
                      <span className="text-[9px] text-pink-400 font-mono">
                        ♥ {item.likes}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Favorite Arcade Games */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Favorite Arcade Games</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#120c29] border border-purple-800/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🕹️</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">Cyber Reflex</h4>
                      <p className="text-[10px] text-emerald-400 font-mono">Personal Best: 3,420</p>
                    </div>
                  </div>
                  <span className="block text-[10px] text-slate-400">
                    High reflex reaction test
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#120c29] border border-purple-800/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👾</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">Neon Matrix</h4>
                      <p className="text-[10px] text-cyan-400 font-mono">Rank #3 Global</p>
                    </div>
                  </div>
                  <span className="block text-[10px] text-slate-400">
                    Cyber pattern puzzle
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: TOP 8 FRIENDS & BADGES ================= */}
        {activeTab === 'top8' && (
          <div className="space-y-4">
            {/* Draggable & Editable Top 8 Friends Manager */}
            <Top8FriendsManager
              friends={user.top8Friends}
              userId={user.id}
              onOpenChatWithFriend={onOpenChatWithFriend}
            />

            {/* Badges showcase */}
            <div className="space-y-2 pt-2 border-t border-purple-900/40">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-pink-400" />
                <span>Unlocked Achievements & Badges</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                {user.badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#120c29] border border-purple-800/40"
                  >
                    <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-white truncate">
                      {badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: GALLERY ================= */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-3 gap-2">
            {galleryImages.map((src, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-2xl overflow-hidden border border-purple-800/30 group cursor-pointer"
              >
                <img
                  src={src}
                  alt="Gallery item"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. FULL EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={{ ...user, socialLinks: socialLinksState }}
        initialTab={editModalInitialTab}
        onSave={(updatedData) => {
          if (updatedData.socialLinks) {
            setSocialLinksState(updatedData.socialLinks);
            saveSocialLinksToStorage(user.id, updatedData.socialLinks);
          }
          onUpdateProfile(updatedData);
          showToast('Profile updated successfully! ✨');
        }}
      />
    </div>
  );
};
