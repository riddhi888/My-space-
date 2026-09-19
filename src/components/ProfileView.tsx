import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Edit3,
  Share2,
  Settings,
  ChevronDown,
  Layers,
  MessageSquare,
  Camera,
  User,
  Heart,
  Plus,
  ArrowRight,
  Lock,
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
import {
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
  onSelectTab,
  onUpdateProfile,
  onOpenSettings,
  onCreatePost,
  onLikePost,
  settings,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalInitialTab, setEditModalInitialTab] = useState<'info' | 'social' | 'avatar' | 'cover' | 'preview'>('info');
  const [activeTab, setActiveTab] = useState<'guestbook' | 'posts'>('guestbook');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Social Links State with localStorage sync
  const [socialLinksState, setSocialLinksState] = useState<UserSocialLinks>(() =>
    loadSocialLinksFromStorage(user.id, user.socialLinks)
  );

  useEffect(() => {
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

  // Real user posts only (starts empty)
  const userPosts = posts.filter(
    (p) =>
      (user.handle && p.author.handle === user.handle) ||
      (user.name && p.author.name === user.name) ||
      p.id.startsWith('post_user_')
  );

  const hasUserProfile = Boolean(user.name && user.name.trim().length > 0 && user.name !== 'Alex Rivera');

  // ================= 1. EMPTY PROFILE ONBOARDING STATE =================
  if (!hasUserProfile) {
    return (
      <div className="p-4 pb-28 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
        <div
          id="profile-empty-onboarding-card"
          className="rounded-2xl bg-[#140e2b] border border-purple-800/70 p-6 text-center space-y-4 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400" />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500/20 via-purple-600/30 to-cyan-400/20 border border-pink-500/40 flex items-center justify-center text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
            <User className="w-8 h-8 text-pink-400" />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display font-extrabold text-lg text-white tracking-tight">
              Welcome to MySpace 2008!
            </h1>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Your profile is currently empty. Edit your profile to set up your name, photo, mood, and social links.
            </p>
          </div>

          <div className="pt-2 flex flex-col items-center justify-center gap-2">
            <button
              id="profile-start-edit-btn"
              onClick={() => {
                setEditModalInitialTab('info');
                setIsEditModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all cursor-pointer active:scale-98"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Edit Profile Modal */}
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
            showToast('Profile created successfully! ✨');
          }}
        />
      </div>
    );
  }

  // ================= 2. REAL USER PROFILE VIEW =================
  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[#140b2b] border border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.5)] text-pink-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* COVER BANNER WITH RETRO GRADIENT & MOOD BORDER */}
      <div
        id="profile-cover-banner"
        className="relative h-36 w-full overflow-hidden bg-[#0a0717] transition-all duration-300 border-b-4"
        style={{
          borderColor: activeMoodConfig.borderColor,
          boxShadow: `0 6px 20px ${activeMoodConfig.glow}`,
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(236,72,153,0.25),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(6,182,212,0.2),transparent_60%)]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090714] via-[#090714]/30 to-black/20" />

        {/* Top Right Action Icons */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            id="profile-share-link-btn"
            onClick={handleShareProfile}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-pink-500 transition-colors shadow-sm cursor-pointer"
            title="Share Profile Link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {onOpenSettings && (
            <button
              id="profile-settings-btn"
              onClick={onOpenSettings}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-purple-600 transition-colors shadow-sm cursor-pointer"
              title="Settings & Account"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* AVATAR & MAIN USER IDENTITY INFO */}
      <div className="px-4 -mt-12 relative z-10 space-y-3">
        <div className="flex items-end justify-between">
          {/* Avatar with glowing neon ring and online status */}
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(236,72,153,0.5)]">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border-4 border-[#090714]"
              />
            ) : (
              <div
                onClick={() => {
                  setEditModalInitialTab('avatar');
                  setIsEditModalOpen(true);
                }}
                className="w-20 h-20 rounded-full bg-purple-950/90 border-4 border-[#090714] flex flex-col items-center justify-center text-pink-400 cursor-pointer hover:bg-purple-900 transition-colors"
                title="Add Profile Photo"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[8px] font-mono mt-0.5 text-pink-300">Add Photo</span>
              </div>
            )}
            <span
              className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090714] shadow-[0_0_8px_#34d399]"
              title="Online now"
            />
          </div>

          {/* Edit Profile Action Button */}
          <div className="flex items-center gap-2">
            <button
              id="edit-profile-action-btn"
              onClick={() => {
                setEditModalInitialTab('info');
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Display Name, Mood Dropdown, & Username (@handle) */}
        <div className="space-y-1.5">
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
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {user.handle && (
              <p className="text-cyan-400 font-mono font-medium">{user.handle}</p>
            )}
            <span className="text-[10px] text-slate-400 font-mono italic">
              — feeling {activeMoodConfig.description}
            </span>
          </div>

          {/* Connected Social Accounts with Brand Colors on Profile Header */}
          <ProfileHeaderSocialLinks socialLinks={socialLinksState} size="md" />
        </div>

        {/* Real Bio */}
        {user.bio ? (
          <p className="text-xs text-slate-300 leading-relaxed font-normal pt-1">
            {user.bio}
          </p>
        ) : (
          <div
            onClick={() => {
              setEditModalInitialTab('info');
              setIsEditModalOpen(true);
            }}
            className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/40 text-[11px] text-slate-400 cursor-pointer hover:border-pink-500/50 hover:text-slate-200 transition-colors"
          >
            ✏️ Click to add a bio to your profile
          </div>
        )}

        {/* PROFILE CONTENT TABS: Guestbook & Posts */}
        <div className="pt-2">
          <div className="flex bg-[#0d091e] p-1 rounded-xl border border-purple-800/40 text-xs gap-1">
            <button
              id="profile-tab-guestbook-btn"
              onClick={() => setActiveTab('guestbook')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'guestbook'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Guestbook Wall</span>
            </button>

            <button
              id="profile-tab-posts-btn"
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'posts'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Posts ({userPosts.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: GUESTBOOK WALL (Real user signatures only, starts empty) */}
        {activeTab === 'guestbook' && (
          <div className="pt-1">
            <GuestbookWall userId={user.id} userName={user.name} />
          </div>
        )}

        {/* TAB 2: POSTS (Real posts authored by user only, starts empty) */}
        {activeTab === 'posts' && (
          <div className="pt-1 space-y-3">
            {onCreatePost && (
              <button
                onClick={onCreatePost}
                className="w-full p-3 rounded-2xl bg-[#140e2b] border border-purple-800/60 hover:border-pink-500 text-xs text-pink-300 font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Post</span>
              </button>
            )}

            {userPosts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#120c29] border border-purple-900/40 text-center space-y-2">
                <Layers className="w-8 h-8 text-purple-400/60 mx-auto" />
                <h3 className="text-xs font-bold text-slate-200">No posts yet</h3>
                <p className="text-[11px] text-slate-400">
                  Share updates, thoughts, and retro musings with your visitors!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3.5 rounded-2xl bg-[#120c29] border border-purple-800/40 space-y-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      {post.author.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-8 h-8 rounded-full object-cover border border-pink-500/50"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-950 flex items-center justify-center text-pink-400 text-xs font-bold">
                          {post.author.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white">{post.author.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {post.timestamp}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200">{post.content}</p>
                    {post.image && (
                      <div className="rounded-xl overflow-hidden max-h-60 border border-purple-900/40">
                        <img
                          src={post.image}
                          alt="Post media"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-1 border-t border-purple-900/30 text-[11px] text-slate-400">
                      <button
                        onClick={() => onLikePost?.(post.id)}
                        className="flex items-center gap-1 hover:text-pink-400 transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{post.likes} likes</span>
                      </button>
                      <span>{post.commentsCount} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULL EDIT PROFILE MODAL */}
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
