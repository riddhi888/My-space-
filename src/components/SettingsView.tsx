import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Palette,
  HelpCircle,
  Info,
  LogOut,
  Check,
  Sparkles,
  Camera,
  ChevronDown,
  ChevronRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  MessageSquare,
  Volume2,
  Gamepad2,
  PhoneCall,
  Smartphone,
  ExternalLink,
  Save,
  UserX,
  UserCheck,
  Trash2,
  Key,
  Users,
  AlertTriangle,
  RefreshCw,
  Ban,
  Layers,
} from 'lucide-react';
import { UserProfile, UserSettings, BlockedUser, ChatThread, AppTheme } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsViewProps {
  user: UserProfile;
  settings?: UserSettings;
  onUpdateSettings?: (settings: UserSettings) => void;
  blockedUsers?: BlockedUser[];
  onUnblockUser?: (userId: string) => void;
  onBlockUser?: (user: { id: string; name: string; handle: string; avatar: string }) => void;
  chatThreads?: ChatThread[];
  onClearChatThread?: (chatId: string) => void;
  onClearAllChats?: () => void;
  onBackToProfile: () => void;
  onUpdateProfile: (updated: { name: string; handle: string; bio: string; avatar: string }) => void;
  onLogout: () => void;
  onNavigateToConnectedApps?: () => void;
  allAvailableUsers?: Array<{ id: string; name: string; handle: string; avatar: string }>;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
];

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'classic-blue',
  notifications: {
    pushEnabled: true,
    chatMessages: true,
    friendRequests: true,
    gameInvites: true,
    missedCalls: true,
    soundEffects: true,
    showMessagePreview: true,
  },
  privacy: {
    profileVisibility: 'public',
    showOnlineStatus: true,
    showLastSeen: true,
    showProfileInfo: true,
    whoCanMessage: 'everyone',
    whoCanSendGameInvites: 'everyone',
    allowDirectMessages: 'everyone',
    allowGameInvites: true,
  },
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  settings: propSettings,
  onUpdateSettings,
  blockedUsers: propBlockedUsers,
  onUnblockUser,
  onBlockUser,
  chatThreads = [],
  onClearChatThread,
  onClearAllChats,
  onBackToProfile,
  onUpdateProfile,
  onLogout,
  onNavigateToConnectedApps,
  allAvailableUsers = [],
}) => {
  // Editable profile state
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings state (saved in localStorage and synchronized with parent)
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (propSettings) return propSettings;
    try {
      const saved = localStorage.getItem('myspace_user_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...(parsed.notifications || {}),
          },
          privacy: {
            ...DEFAULT_SETTINGS.privacy,
            ...(parsed.privacy || {}),
          },
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Blocked users state
  const [localBlockedUsers, setLocalBlockedUsers] = useState<BlockedUser[]>(() => {
    if (propBlockedUsers && propBlockedUsers.length >= 0) return propBlockedUsers;
    try {
      const saved = localStorage.getItem('myspace_blocked_users_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const activeBlockedList = propBlockedUsers ?? localBlockedUsers;

  // Modals state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isClearAllChatsModalOpen, setIsClearAllChatsModalOpen] = useState(false);
  const [chatToClear, setChatToClear] = useState<ChatThread | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');
  const [selectedUserToBlock, setSelectedUserToBlock] = useState<string>('');

  const updateSetting = <K extends keyof UserSettings>(
    category: K,
    key: keyof UserSettings[K],
    value: any
  ) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [category]: {
          ...(prev[category] as any),
          [key]: value,
        },
      };
      try {
        localStorage.setItem('myspace_user_settings_v1', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save settings to localStorage', e);
      }
      if (onUpdateSettings) {
        onUpdateSettings(updated);
      }
      return updated;
    });
  };

  const handleSelectTheme = (theme: AppTheme) => {
    // Apply immediately to DOM for instant visual responsiveness
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
    try {
      localStorage.setItem('myspace_theme', theme);
    } catch (e) {
      console.error('Failed to save myspace_theme', e);
    }

    // Trigger custom event for real-time app sync
    window.dispatchEvent(new CustomEvent('myspace-theme-changed', { detail: { theme } }));

    setSettings((prev) => {
      const updated = { ...prev, theme };
      try {
        localStorage.setItem('myspace_user_settings_v1', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save settings', e);
      }
      if (onUpdateSettings) {
        onUpdateSettings(updated);
      }
      return updated;
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || user.name,
      handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
      bio: bio.trim(),
      avatar: customAvatarUrl.trim() || avatar,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUnblock = (userId: string) => {
    if (onUnblockUser) {
      onUnblockUser(userId);
    }
    setLocalBlockedUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      try {
        localStorage.setItem('myspace_blocked_users_v1', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save blocked users', e);
      }
      return updated;
    });
  };

  const handleQuickBlockUser = () => {
    if (!selectedUserToBlock) return;
    const target = allAvailableUsers.find((u) => u.id === selectedUserToBlock);
    if (!target) return;

    if (onBlockUser) {
      onBlockUser(target);
    } else {
      setLocalBlockedUsers((prev) => {
        if (prev.some((b) => b.id === target.id)) return prev;
        const newBlocked: BlockedUser = {
          id: target.id,
          name: target.name,
          handle: target.handle,
          avatar: target.avatar,
          blockedAt: 'Just now',
          reason: 'User blocked via Privacy Settings',
        };
        const updated = [...prev, newBlocked];
        try {
          localStorage.setItem('myspace_blocked_users_v1', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    }
    setSelectedUserToBlock('');
  };

  const confirmClearSingleChat = () => {
    if (!chatToClear) return;
    if (onClearChatThread) {
      onClearChatThread(chatToClear.id);
    }
    setChatToClear(null);
  };

  const confirmClearAllChats = () => {
    if (onClearAllChats) {
      onClearAllChats();
    }
    setIsClearAllChatsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-200">
      {/* Settings Top Bar */}
      <div className="sticky top-0 z-30 bg-[#090714]/95 backdrop-blur-md px-4 py-3.5 border-b border-purple-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="settings-back-btn"
            onClick={onBackToProfile}
            className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-slate-300 hover:text-white hover:bg-purple-900/50 transition-colors"
            title="Back to Profile"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display font-bold text-lg text-white">Settings</h2>
            <p className="text-xs text-slate-400">Profile, preferences, privacy & security</p>
          </div>
        </div>

        {saveSuccess && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> Saved!
          </span>
        )}
      </div>

      {/* 1. EDITABLE PROFILE INFORMATION */}
      <section className="px-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#160e30] via-[#120a26] to-[#0c071d] border border-purple-800/50 shadow-[0_0_25px_rgba(168,85,247,0.15)] space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">Edit Profile Information</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
              PUBLIC BIO
            </span>
          </div>

          {/* Profile Photo Placeholder & Preset Chooser */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">Profile Photo</label>
            <div className="flex items-center gap-4">
              {/* Current Avatar preview */}
              <div className="relative group shrink-0">
                <div className="w-18 h-18 rounded-2xl p-0.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_18px_rgba(236,72,153,0.4)] overflow-hidden">
                  {(customAvatarUrl || avatar) ? (
                    <img
                      src={customAvatarUrl || avatar}
                      alt="Avatar preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-950 flex items-center justify-center text-pink-400 rounded-[14px]">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-pink-500 text-white shadow-md hover:bg-pink-400 transition-colors"
                  title="Change photo URL"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Presets List */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 mb-1.5">Choose a cyberpunk preset avatar:</p>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setAvatar(url);
                        setCustomAvatarUrl('');
                      }}
                      className={`relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border transition-all ${
                        (customAvatarUrl === '' && avatar === url)
                          ? 'border-pink-400 scale-105 shadow-[0_0_10px_#f472b6]'
                          : 'border-purple-800/60 opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Preset ${i}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Custom URL input */}
            {showCustomUrlInput && (
              <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/40 space-y-1.5">
                <label className="text-[11px] text-pink-300 font-mono">Custom Image URL:</label>
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-1.5 bg-black/50 border border-purple-800/50 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-1">
            {/* Display Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Display Name
              </label>
              <input
                id="settings-display-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3.5 py-2 rounded-xl bg-purple-950/30 border border-purple-800/50 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:shadow-[0_0_12px_rgba(236,72,153,0.3)] transition-all"
                required
              />
            </div>

            {/* Handle / Username */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Username / Handle
              </label>
              <div className="relative">
                <input
                  id="settings-username-handle"
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  maxLength={24}
                  placeholder="@cyber_alex"
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-950/30 border border-purple-800/50 text-cyan-300 font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Bio</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {bio.length}/160 characters
                </span>
              </div>
              <textarea
                id="settings-bio-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                placeholder="Write your neon synthwave bio..."
                className="w-full p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:shadow-[0_0_12px_rgba(236,72,153,0.3)] transition-all resize-none leading-relaxed"
              />
            </div>

            <button
              id="save-profile-settings-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Profile Information
            </button>
          </form>
        </div>
      </section>

      {/* 2. THEME OPTIONS: DARK & NEON */}
      <section className="px-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#160e30] to-[#0e0821] border border-purple-800/50 shadow-[0_0_20px_rgba(168,85,247,0.1)] space-y-3.5">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">Theme & Aesthetic</h3>
            </div>
            <span className="text-[10px] font-mono text-pink-400 uppercase tracking-wider">
              NEON STYLES
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Select your favorite color mode. Neon accents and glassmorphism glow dynamically across all screens.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* 1. Classic Blue */}
            <button
              type="button"
              id="theme-classic-blue-btn"
              onClick={() => handleSelectTheme('classic-blue')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                settings.theme === 'classic-blue'
                  ? 'bg-blue-950/90 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'bg-[#08152c]/50 border-blue-900/40 hover:border-blue-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_6px_#2563eb]" />
                  <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
                  <div className="w-3 h-3 rounded-full bg-sky-200" />
                </div>
                {settings.theme === 'classic-blue' && <Check className="w-4 h-4 text-blue-400" />}
              </div>
              <h4 className="font-bold text-xs text-white">Classic Blue</h4>
              <p className="text-[10px] text-blue-300 mt-0.5">Iconic 2008 MySpace royal blue & navy</p>
            </button>

            {/* 2. Emo Black Pink */}
            <button
              type="button"
              id="theme-emo-black-pink-btn"
              onClick={() => handleSelectTheme('emo-black-pink')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                settings.theme === 'emo-black-pink'
                  ? 'bg-[#1a051d] border-pink-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                  : 'bg-[#100313]/50 border-pink-950/60 hover:border-pink-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-black border border-pink-500 shadow-[0_0_6px_#ec4899]" />
                  <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]" />
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                </div>
                {settings.theme === 'emo-black-pink' && <Check className="w-4 h-4 text-pink-400" />}
              </div>
              <h4 className="font-bold text-xs text-white">Emo Black Pink</h4>
              <p className="text-[10px] text-pink-300 mt-0.5">Scenecore deep black & hot neon pink</p>
            </button>

            {/* 3. Vaporwave Purple */}
            <button
              type="button"
              id="theme-vaporwave-purple-btn"
              onClick={() => handleSelectTheme('vaporwave-purple')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                settings.theme === 'vaporwave-purple' || settings.theme === 'neon'
                  ? 'bg-purple-950/90 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                  : 'bg-purple-950/20 border-purple-900/40 hover:border-purple-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" />
                  <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]" />
                  <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
                </div>
                {(settings.theme === 'vaporwave-purple' || settings.theme === 'neon') && (
                  <Check className="w-4 h-4 text-purple-400" />
                )}
              </div>
              <h4 className="font-bold text-xs text-white">Vaporwave Purple</h4>
              <p className="text-[10px] text-purple-300 mt-0.5">Twilight purple, magenta & synth cyan</p>
            </button>

            {/* 4. Matrix Green */}
            <button
              type="button"
              id="theme-matrix-green-btn"
              onClick={() => handleSelectTheme('matrix-green')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                settings.theme === 'matrix-green'
                  ? 'bg-[#051a0b] border-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                  : 'bg-[#031006]/50 border-emerald-950 hover:border-emerald-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_#22c55e]" />
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
                  <div className="w-3 h-3 rounded-full bg-lime-300" />
                </div>
                {settings.theme === 'matrix-green' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <h4 className="font-bold text-xs text-white">Matrix Green</h4>
              <p className="text-[10px] text-emerald-300 mt-0.5">Terminal phosphor green & cyber black</p>
            </button>
          </div>
        </div>
      </section>

      {/* 3. NOTIFICATION PREFERENCES */}
      <section className="px-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#160e30] to-[#0e0821] border border-purple-800/50 shadow-[0_0_20px_rgba(168,85,247,0.1)] space-y-3.5">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">Notification Preferences</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              ALERTS
            </span>
          </div>

          <div className="divide-y divide-purple-900/30 space-y-1">
            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-semibold text-white">Push Notifications</h5>
                  <p className="text-[11px] text-slate-400">Receive alerts when outside the app</p>
                </div>
              </div>
              <button
                type="button"
                id="toggle-push-notif"
                onClick={() =>
                  updateSetting(
                    'notifications',
                    'pushEnabled',
                    !settings.notifications.pushEnabled
                  )
                }
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.notifications.pushEnabled ? 'bg-pink-500' : 'bg-purple-950 border border-purple-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.notifications.pushEnabled ? 'translate-x-5 shadow-md' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-semibold text-white">Chat Message Alerts</h5>
                  <p className="text-[11px] text-slate-400">Direct message notifications from friends</p>
                </div>
              </div>
              <button
                type="button"
                id="toggle-chat-notif"
                onClick={() =>
                  updateSetting(
                    'notifications',
                    'chatMessages',
                    !settings.notifications.chatMessages
                  )
                }
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.notifications.chatMessages ? 'bg-pink-500' : 'bg-purple-950 border border-purple-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.notifications.chatMessages ? 'translate-x-5 shadow-md' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show Message Previews in Notifications (Chat Privacy) */}
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-pink-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-semibold text-white">Show Message Previews</h5>
                  <p className="text-[11px] text-slate-400">
                    {settings.notifications.showMessagePreview
                      ? 'Show message snippet in notifications'
                      : 'Hide preview (Shows "New message received")'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="toggle-message-preview"
                onClick={() =>
                  updateSetting(
                    'notifications',
                    'showMessagePreview',
                    !settings.notifications.showMessagePreview
                  )
                }
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.notifications.showMessagePreview ? 'bg-pink-500' : 'bg-purple-950 border border-purple-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.notifications.showMessagePreview ? 'translate-x-5 shadow-md' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Friend Requests & Followers */}
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-pink-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-semibold text-white">Friend Requests & Followers</h5>
                  <p className="text-[11px] text-slate-400">When someone adds you or follows your feed</p>
                </div>
              </div>
              <button
                type="button"
                id="toggle-friends-notif"
                onClick={() =>
                  updateSetting(
                    'notifications',
                    'friendRequests',
                    !settings.notifications.friendRequests
                  )
                }
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.notifications.friendRequests ? 'bg-pink-500' : 'bg-purple-950 border border-purple-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.notifications.friendRequests ? 'translate-x-5 shadow-md' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Game Invites */}
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-semibold text-white">Cyber Arcade Game Invites</h5>
                  <p className="text-[11px] text-slate-400">Tic-Tac-Toe & match game challenges</p>
                </div>
              </div>
              <button
                type="button"
                id="toggle-game-notif"
                onClick={() =>
                  updateSetting(
                    'notifications',
                    'gameInvites',
                    !settings.notifications.gameInvites
                  )
                }
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.notifications.gameInvites ? 'bg-pink-500' : 'bg-purple-950 border border-purple-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.notifications.gameInvites ? 'translate-x-5 shadow-md' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Missed Calls */}
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-semibold text-white">Missed Voice & Video Calls</h5>
                  <p className="text-[11px] text-slate-400">Never miss a live incoming call alert</p>
                </div>
              </div>
              <button
                type="button"
                id="toggle-calls-notif"
                onClick={() =>
                  updateSetting(
                    'notifications',
                    'missedCalls',
                    !settings.notifications.missedCalls
                  )
                }
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.notifications.missedCalls ? 'bg-pink-500' : 'bg-purple-950 border border-purple-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.notifications.missedCalls ? 'translate-x-5 shadow-md' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-semibold text-white">Retro Sound Effects & Chimes</h5>
                  <p className="text-[11px] text-slate-400">Synth chimes on incoming alerts</p>
                </div>
              </div>
              <button
                type="button"
                id="toggle-sound-notif"
                onClick={() =>
                  updateSetting(
                    'notifications',
                    'soundEffects',
                    !settings.notifications.soundEffects
                  )
                }
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.notifications.soundEffects ? 'bg-pink-500' : 'bg-purple-950 border border-purple-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.notifications.soundEffects ? 'translate-x-5 shadow-md' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRIVACY SETTINGS: COMPLETE SECTION */}
      <section className="px-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#160e30] to-[#0e0821] border border-cyan-800/40 shadow-[0_0_25px_rgba(34,211,238,0.15)] space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-sm">Privacy & Security</h3>
                <p className="text-[10px] text-slate-400">Manage profile visibility and who can contact you</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-700/50">
              PRIVACY
            </span>
          </div>

          <div className="space-y-4">
            {/* 1. Profile Visibility: Public vs Private */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Profile Visibility
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="privacy-visibility-public"
                  onClick={() => updateSetting('privacy', 'profileVisibility', 'public')}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    settings.privacy.profileVisibility === 'public'
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                      : 'bg-purple-950/20 border-purple-900/40 hover:border-purple-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Public Profile</span>
                    {settings.privacy.profileVisibility === 'public' && (
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Anyone can view your profile, posts, Top 8, and shared links.
                  </p>
                </button>

                <button
                  type="button"
                  id="privacy-visibility-private"
                  onClick={() => updateSetting('privacy', 'profileVisibility', 'private')}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    settings.privacy.profileVisibility === 'private'
                      ? 'bg-pink-500/20 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                      : 'bg-purple-950/20 border-purple-900/40 hover:border-purple-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Private Profile</span>
                    {settings.privacy.profileVisibility === 'private' && (
                      <Check className="w-3.5 h-3.5 text-pink-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Only approved friends can view your activity, feed, and links.
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Online Status toggle */}
            <div className="flex items-center justify-between py-1.5 border-t border-purple-900/30 pt-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white">Show Online Status</h5>
                  <p className="text-[11px] text-slate-400">Display the glowing green indicator when you are active</p>
                </div>
              </div>
              <button
                type="button"
                id="toggle-online-status"
                onClick={() =>
                  updateSetting(
                    'privacy',
                    'showOnlineStatus',
                    !settings.privacy.showOnlineStatus
                  )
                }
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.privacy.showOnlineStatus ? 'bg-cyan-500' : 'bg-purple-950 border border-purple-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.privacy.showOnlineStatus ? 'translate-x-5 shadow-md' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3. Last Seen toggle */}
            <div className="flex items-center justify-between py-1.5 border-t border-purple-900/30 pt-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white">Show Last Seen Timestamp</h5>
                  <p className="text-[11px] text-slate-400">Allow friends to see your recent active timestamp</p>
                </div>
              </div>
              <button
                type="button"
                id="toggle-last-seen"
                onClick={() =>
                  updateSetting(
                    'privacy',
                    'showLastSeen',
                    !settings.privacy.showLastSeen
                  )
                }
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.privacy.showLastSeen ? 'bg-cyan-500' : 'bg-purple-950 border border-purple-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.privacy.showLastSeen ? 'translate-x-5 shadow-md' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 4. Profile Information Visibility (Bio & Shared Links) */}
            <div className="flex items-center justify-between py-1.5 border-t border-purple-900/30 pt-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white">Display Bio & Shared Links</h5>
                  <p className="text-[11px] text-slate-400">
                    {settings.privacy.showProfileInfo
                      ? 'Bio and shared links are visible on your profile'
                      : 'Bio and shared links are hidden from visitors'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="toggle-profile-info-visibility"
                onClick={() =>
                  updateSetting(
                    'privacy',
                    'showProfileInfo',
                    !settings.privacy.showProfileInfo
                  )
                }
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.privacy.showProfileInfo ? 'bg-pink-500' : 'bg-purple-950 border border-purple-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.privacy.showProfileInfo ? 'translate-x-5 shadow-md' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 5. Who Can Message Me */}
            <div className="space-y-1.5 border-t border-purple-900/30 pt-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Who Can Message Me</span>
                <span className="text-[11px] font-mono text-cyan-300 uppercase">
                  {settings.privacy.whoCanMessage.replace('_', ' ')}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'friends_only', label: 'Friends Only' },
                  { value: 'nobody', label: 'Nobody' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      updateSetting('privacy', 'whoCanMessage', opt.value as any)
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      settings.privacy.whoCanMessage === opt.value
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                        : 'bg-purple-950/30 border-purple-900/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Who Can Send Me Game Invites */}
            <div className="space-y-1.5 border-t border-purple-900/30 pt-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Who Can Send Game Invites</span>
                <span className="text-[11px] font-mono text-pink-300 uppercase">
                  {settings.privacy.whoCanSendGameInvites.replace('_', ' ')}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'friends_only', label: 'Friends Only' },
                  { value: 'nobody', label: 'Nobody' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      updateSetting('privacy', 'whoCanSendGameInvites', opt.value as any)
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      settings.privacy.whoCanSendGameInvites === opt.value
                        ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                        : 'bg-purple-950/30 border-purple-900/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BLOCK / UNBLOCK SYSTEM */}
      <section className="px-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#180d2b] to-[#100821] border border-rose-900/40 shadow-[0_0_25px_rgba(244,63,94,0.12)] space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Ban className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-sm">Blocked Users</h3>
                <p className="text-[10px] text-slate-400">
                  {activeBlockedList.length} {activeBlockedList.length === 1 ? 'user' : 'users'} blocked
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/40">
              RESTRICTED
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Blocked users cannot direct message you, invite you to Cyber Arcade games, or view your online status. Their messages in active chat threads are automatically restricted.
          </p>

          {/* Blocked Users List */}
          {activeBlockedList.length === 0 ? (
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-900/30 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-purple-900/30 border border-purple-700/30 flex items-center justify-center text-purple-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs font-semibold text-slate-200">No Blocked Users</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                You haven&apos;t blocked anyone. You can block any user directly from their profile card or chat thread options.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              {activeBlockedList.map((blocked) => (
                <div
                  key={blocked.id}
                  className="p-3 rounded-2xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between gap-3 hover:border-rose-900/60 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {blocked.avatar ? (
                      <img
                        src={blocked.avatar}
                        alt={blocked.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-rose-500/40 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-purple-950 flex items-center justify-center text-pink-400 border border-rose-500/40 shrink-0 text-xs font-bold font-mono">
                        {blocked.name ? blocked.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-bold text-white truncate">{blocked.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-800/40">
                          Blocked
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{blocked.handle}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUnblock(blocked.id)}
                    className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-emerald-600/30 border border-purple-700/50 hover:border-emerald-500 text-emerald-300 text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-sm"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Demo Block Selector: Test blocking someone from the available directory */}
          {allAvailableUsers.length > 0 && (
            <div className="pt-2 border-t border-purple-900/30 space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Quick Block for Testing:
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedUserToBlock}
                  onChange={(e) => setSelectedUserToBlock(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-black/50 border border-purple-800/40 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="">Select a user to block...</option>
                  {allAvailableUsers
                    .filter((u) => !activeBlockedList.some((b) => b.id === u.id))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.handle})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedUserToBlock}
                  onClick={handleQuickBlockUser}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/50 hover:border-rose-500 text-rose-300 text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Block
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. CHAT PRIVACY & LOCAL DATA */}
      <section className="px-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#160e30] to-[#0e0821] border border-purple-800/50 shadow-[0_0_20px_rgba(168,85,247,0.1)] space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-sm">Chat Privacy & Clear History</h3>
                <p className="text-[10px] text-slate-400">Manage conversation logs and message secrecy</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-pink-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-950/60 border border-pink-700/50">
              LOCAL DATA
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              Clear conversation history to remove message text stored in local demo memory. You can also clear chats directly inside any individual thread.
            </p>

            {/* Individual Chat Clear Picker */}
            {chatThreads.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Clear Specific Conversation:
                </label>
                <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar">
                  {chatThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/30 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {thread.friend.avatar ? (
                          <img
                            src={thread.friend.avatar}
                            alt={thread.friend.name}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-purple-950 flex items-center justify-center text-pink-400 shrink-0 text-[10px] font-bold font-mono">
                            {thread.friend.name ? thread.friend.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{thread.friend.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {thread.messages.length} messages
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setChatToClear(thread)}
                        className="p-1.5 rounded-lg bg-purple-900/40 hover:bg-rose-950/50 border border-purple-800/40 hover:border-rose-700 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
                        title={`Clear chat with ${thread.friend.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clear All Chats Button */}
            <div className="pt-2">
              <button
                type="button"
                id="settings-clear-all-chats-btn"
                onClick={() => setIsClearAllChatsModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-purple-950/40 hover:bg-rose-950/30 border border-purple-800/50 hover:border-rose-700 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                Clear All Conversations History
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ACCOUNT & GUEST ACCESS (NO SECRETS REQUIRED) */}
      <section className="px-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#160e30] to-[#0e0821] border border-purple-800/50 shadow-[0_0_20px_rgba(168,85,247,0.1)] space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-sm">Account & Guest Access</h3>
                <p className="text-[10px] text-slate-400">100% Demo Mode • No passwords or secrets required</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-700/50">
              GUEST ACCESS
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-purple-600"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-purple-950 flex items-center justify-center text-pink-400 border border-purple-600 text-xs font-bold font-mono">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{user.handle}</div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                Active Session
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Authentication operates in Guest mode. You can switch profiles or end this guest session at any time with a single click. No passwords or secret keys are stored or needed.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onLogout}
              className="flex-1 py-2.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/60 border border-purple-700/50 text-white font-bold text-xs hover:border-pink-500/60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Users className="w-3.5 h-3.5 text-pink-400" /> Switch Guest Profile
            </button>
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> End Session
            </button>
          </div>
        </div>
      </section>

      {/* 8. HELP AND ABOUT MYSPACE SECTIONS */}
      <section className="px-4 space-y-3">
        {/* Help & FAQ accordion */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#160e30] to-[#0e0821] border border-purple-800/50 shadow-[0_0_20px_rgba(168,85,247,0.1)] space-y-3">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">Help & FAQ</h3>
            </div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
              GUIDES
            </span>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'faq-1',
                q: 'How does the Top 8 Friends feature work?',
                a: 'Your Top 8 Friends represents your core inner circle displayed prominently on your profile header. You can add friends to your Top 8 directly from their profile or the friends list.',
              },
              {
                id: 'faq-2',
                q: 'How do I customize my Profile Song?',
                a: 'Navigate to the Music Player tab, tap any track, and click "Set as Profile Song". It will play in a retro cyberpunk music card whenever someone visits your profile.',
              },
              {
                id: 'faq-3',
                q: 'How do I block or unblock someone?',
                a: 'You can block any user from their profile card or active chat thread. Manage all blocked accounts in the Privacy & Security section of Settings to unblock at any time.',
              },
              {
                id: 'faq-4',
                q: 'Are Voice & Video Calls live?',
                a: 'The calling interface features real-time simulated audio and video streams, camera switching, mute toggles, and live call durations for testing and demo calls.',
              },
            ].map((faq) => {
              const isOpen = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-purple-900/40 bg-purple-950/20 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-purple-900/20 transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-slate-200">{faq.q}</span>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-pink-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 text-xs text-slate-300 leading-relaxed border-t border-purple-900/30 pt-2 bg-black/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Connected Apps Section */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#120d29] via-[#0d0921] to-[#070514] border border-cyan-800/40 space-y-3">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">Connected Apps (Official Integrations)</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
              META & GOOGLE
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Manage your connected Instagram, Facebook, and YouTube accounts safely. MySpace uses standard OAuth 2.0 authorization and never collects or stores your external passwords.
          </p>

          <button
            id="settings-connected-apps-btn"
            type="button"
            onClick={onNavigateToConnectedApps}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Manage Connected Apps</span>
          </button>
        </div>

        {/* PWA App Installation Section */}
        <div className="space-y-2">
          <PWAInstallButton variant="full" />
        </div>

        {/* About MySpace Section */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#140e2b] to-[#0c071a] border border-purple-800/40 space-y-3">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                <Info className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">About MySpace</h3>
            </div>
            <span className="text-[10px] font-mono text-pink-400 uppercase tracking-wider">
              v2.7.0 NEON PRIVACY
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              MySpace Neon reimagines the classic iconic 2000s social network through modern mobile-first lenses, combining retro Top 8 culture with cyberpunk aesthetics, full privacy controls, block systems, interactive music libraries, live arcade games, and video calling.
            </p>
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-purple-900/30">
              <span>Environment: Local Prototype Demo</span>
              <span className="text-pink-400 font-mono">No backend connected</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. LOG OUT BUTTON WITH CONFIRMATION DIALOG */}
      <section className="px-4 pt-2">
        <button
          id="settings-logout-btn"
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full py-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/50 hover:border-rose-500 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] active:scale-[0.99] cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          Log Out of MySpace
        </button>
      </section>

      {/* Confirmation Dialog for Logout */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={onLogout}
        title="Log Out of MySpace?"
        message="Are you sure you want to end your current demo session? You can return anytime with instant 1-click Guest login without needing passwords or secrets."
        confirmText="Log Out"
        cancelText="Stay Logged In"
        type="danger"
      />

      {/* Confirmation Dialog for Clear Single Chat */}
      <ConfirmationModal
        isOpen={!!chatToClear}
        onClose={() => setChatToClear(null)}
        onConfirm={confirmClearSingleChat}
        title={`Clear Chat with ${chatToClear?.friend.name || 'Friend'}?`}
        message={`Are you sure you want to delete the local message history with ${chatToClear?.friend.name}? This will clear messages from your device.`}
        confirmText="Clear History"
        cancelText="Cancel"
        type="warning"
      />

      {/* Confirmation Dialog for Clear All Chats */}
      <ConfirmationModal
        isOpen={isClearAllChatsModalOpen}
        onClose={() => setIsClearAllChatsModalOpen(false)}
        onConfirm={confirmClearAllChats}
        title="Clear All Conversations?"
        message="Are you sure you want to delete message history across all active chat threads? Local conversation histories will be emptied."
        confirmText="Clear All Chats"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};
