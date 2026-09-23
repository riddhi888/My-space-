import React from 'react';
import { Home, Music, Film, MessageSquare, Compass, Gamepad2, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadChatCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreadChatCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'social', label: 'Social', icon: Compass },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090714]/95 backdrop-blur-xl border-t border-purple-900/40 px-1 py-1 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-7 gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-pink-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active neon highlight background glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/25 via-purple-600/15 to-transparent rounded-xl -z-10 border border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.35)]" />
              )}

              {/* Icon with badges */}
              <div className="relative mb-0.5">
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isActive ? 'scale-115 text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.9)]' : ''
                  }`}
                />
                {tab.id === 'chat' && unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[12px] h-3 px-0.5 rounded-full bg-pink-500 text-[8px] font-bold text-white flex items-center justify-center shadow-[0_0_6px_rgba(236,72,153,0.8)]">
                    {unreadChatCount}
                  </span>
                )}
                {tab.id === 'reels' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>

              {/* Label */}
              <span className={`text-[9px] leading-tight tracking-tight truncate ${
                isActive ? 'text-pink-300 font-bold' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>

              {/* Active Dot */}
              {isActive && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-pink-400 shadow-[0_0_6px_#f472b6]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
