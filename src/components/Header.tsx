import React from 'react';
import { Bell, Sparkles, Layers } from 'lucide-react';
import { TabType, UserProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  currentUser?: UserProfile;
  onOpenSearch?: () => void;
  onOpenReels?: () => void;
  onOpenShare?: () => void;
  onOpenConnectedApps?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  unreadNotificationsCount,
  onOpenNotifications,
  currentUser,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full px-3 py-2 bg-[#090714]/95 backdrop-blur-md border-b border-purple-900/50">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Modern Glossy App Icon & Brand Logo */}
        <button
          id="myspace-logo-btn"
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
        >
          <img
            src="/IMG-20260922-WA2869.jpg"
            alt="MySpace Icon"
            className="w-8 h-8 rounded-xl object-cover shadow-[0_0_15px_rgba(168,85,247,0.35)] ring-1 ring-purple-500/50 group-hover:scale-105 group-hover:ring-pink-500/70 transition-all"
          />
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-extrabold text-base tracking-tight text-white group-hover:text-pink-300 transition-colors">
              MySpace
            </span>
            <span className="text-[9px] font-mono text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/40 px-1 py-0.2 rounded">
              2008
            </span>
          </div>
        </button>

        {/* Clean, Compact Right Controls */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton variant="compact" />

          {/* Notifications Bell */}
          <button
            id="notifications-toggle-btn"
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-lg bg-[#140e2b] border border-purple-800/50 hover:border-pink-500/60 text-slate-300 hover:text-pink-300 transition-all focus:outline-none cursor-pointer"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 px-0.5 rounded-full bg-pink-500 text-[9px] font-bold text-white flex items-center justify-center shadow-xs animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Quick Profile Avatar Shortcut */}
          <button
            id="quick-profile-btn"
            onClick={() => onSelectTab('profile')}
            className={`relative w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
              currentTab === 'profile'
                ? 'border-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.5)]'
                : 'border-purple-700/60 hover:border-pink-500'
            }`}
            title={`Profile: ${currentUser?.name || 'Your Profile'}`}
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name || 'Profile'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-purple-950/80 flex items-center justify-center text-pink-400">
                <span className="text-[10px] font-bold font-mono">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
