import React from 'react';
import {
  User,
  Sparkles,
  Edit3,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { TabType, UserProfile, ProfileMoodType } from '../types';
import { MOOD_OPTIONS } from './ProfileView';
import { ProfileHeaderSocialLinks } from './SocialIcons';
import { PWAInstallButton } from './PWAInstallButton';

interface HomeViewProps {
  currentUser?: UserProfile;
  onSelectTab: (tab: TabType) => void;
  onOpenEditProfile: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  onSelectTab,
  onOpenEditProfile,
}) => {
  // Load real mood from localStorage or profile
  const moodStorageKey = `myspace_user_mood_${currentUser?.id || 'default'}`;
  const savedMood =
    typeof window !== 'undefined'
      ? (localStorage.getItem(moodStorageKey) as ProfileMoodType)
      : null;
  const currentMood: ProfileMoodType =
    savedMood && savedMood in MOOD_OPTIONS ? savedMood : 'Creative';
  const moodConfig = MOOD_OPTIONS[currentMood] || MOOD_OPTIONS.Creative;

  const hasUserProfile = Boolean(currentUser?.name && currentUser.name.trim().length > 0);

  return (
    <div className="p-4 pb-24 space-y-4 max-w-md mx-auto">
      {/* Real User Profile Banner (If user has created a profile) */}
      {hasUserProfile ? (
        <section
          id="home-profile-banner"
          className="rounded-2xl bg-[#140e2b] border border-purple-800/60 p-4 shadow-lg relative overflow-hidden transition-all duration-300"
          style={{
            borderBottom: `3px solid ${moodConfig.borderColor}`,
            boxShadow: `0 4px 20px ${moodConfig.glow}`,
          }}
        >
          {/* Retro top accent strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400" />

          <div className="flex items-center gap-3.5">
            {/* Real Avatar */}
            <div
              onClick={() => onSelectTab('profile')}
              className="relative shrink-0 cursor-pointer group"
              title="View Your Profile"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-pink-500/70 group-hover:scale-105 transition-transform shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-purple-950/80 border-2 border-pink-500/70 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform shadow-md">
                  <User className="w-7 h-7" />
                </div>
              )}
              <span
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#140e2b] shadow-[0_0_6px_#34d399]"
                title="Online Now"
              />
            </div>

            {/* Real User Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <div className="min-w-0">
                  <h2
                    onClick={() => onSelectTab('profile')}
                    className="font-display font-bold text-base text-white truncate cursor-pointer hover:text-pink-300 transition-colors"
                  >
                    {currentUser?.name}
                  </h2>
                  {currentUser?.handle && (
                    <p className="text-[11px] text-cyan-300 font-mono truncate">
                      {currentUser.handle}
                    </p>
                  )}
                </div>

                <button
                  id="home-edit-profile-btn"
                  onClick={onOpenEditProfile}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Real Mood */}
              <div
                onClick={() => onSelectTab('profile')}
                className="text-xs text-slate-300 mt-1 truncate cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                title="Click to change mood in Profile"
              >
                <span className="text-pink-400 font-semibold">Mood:</span>
                <span>{moodConfig.emoji}</span>
                <span className="font-medium">{currentMood}</span>
              </div>

              {/* Real Social Links */}
              {currentUser?.socialLinks && (
                <div className="mt-2">
                  <ProfileHeaderSocialLinks socialLinks={currentUser.socialLinks} size="sm" />
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Main Home Welcome Screen / Empty State */}
      <section
        id="home-welcome-card"
        className="rounded-2xl bg-[#140e2b]/90 border border-purple-800/70 p-6 text-center space-y-4 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400" />

        {/* Retro 2008 Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500/20 via-purple-600/30 to-cyan-400/20 border border-pink-500/40 flex items-center justify-center text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
          <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
        </div>

        {/* Required message */}
        <div className="space-y-1.5">
          <h1 className="font-display font-extrabold text-lg text-white tracking-tight">
            Welcome to MySpace 2008! Edit your profile to start
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Customize your 2008 retro identity with your real display name, mood, profile photo, and social links.
          </p>
        </div>

        {/* Edit Profile Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            id="home-start-edit-profile-btn"
            onClick={onOpenEditProfile}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all cursor-pointer active:scale-98"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          {hasUserProfile && (
            <button
              id="home-view-profile-btn"
              onClick={() => onSelectTab('profile')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-700/50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-pink-400" />
              <span>View Profile</span>
            </button>
          )}
        </div>
      </section>

      {/* Mobile App Install Card */}
      <PWAInstallButton variant="banner" />
    </div>
  );
};
