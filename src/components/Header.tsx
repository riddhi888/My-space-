import React from 'react';
import { Bell, Sparkles, LogOut } from 'lucide-react';
import { TabType, UserProfile } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  currentUser?: UserProfile;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectTab,
  unreadNotificationsCount,
  onOpenNotifications,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 bg-[#090714]/85 backdrop-blur-md border-b border-purple-900/30">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          id="myspace-logo-btn"
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2 group text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-500 flex items-center justify-center p-0.5 shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/50 transition-all">
            <div className="w-full h-full bg-[#0d0a1a] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pink-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400">
                MySpace
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                NEON
              </span>
            </div>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Notifications Button */}
          <button
            id="notifications-toggle-btn"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:border-pink-500/50 hover:bg-purple-900/40 text-slate-300 hover:text-pink-300 transition-all focus:outline-none"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-md shadow-pink-500/50 animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Quick Profile Avatar shortcut */}
          <button
            id="quick-profile-btn"
            onClick={() => onSelectTab('profile')}
            className="relative w-8 h-8 rounded-full p-0.5 bg-gradient-to-r from-pink-500 to-cyan-400 hover:scale-105 transition-transform focus:outline-none"
            title={currentUser ? `${currentUser.name} (${currentUser.handle})` : 'My Profile'}
          >
            <img
              src={currentUser ? currentUser.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
              alt={currentUser ? currentUser.name : "User Avatar"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#090714] rounded-full"></span>
          </button>

          {/* Logout Shortcut in Header */}
          {onLogout && (
            <button
              id="header-logout-btn"
              onClick={onLogout}
              className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:border-rose-500/50 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 transition-all focus:outline-none"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
