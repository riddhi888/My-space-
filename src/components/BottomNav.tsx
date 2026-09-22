import React from 'react';
import { Home, MessageSquare, Compass, Gamepad2, User } from 'lucide-react';
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
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'social', label: 'Social', icon: Compass },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090714]/90 backdrop-blur-xl border-t border-purple-900/40 px-3 py-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-pink-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active neon highlight background glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/15 to-purple-600/10 rounded-2xl -z-10 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]" />
              )}

              {/* Icon with badges */}
              <div className="relative mb-1">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' : ''
                  }`}
                />
                {tab.id === 'chat' && unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_8px_rgba(236,72,153,0.7)]">
                    {unreadChatCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[11px] tracking-wide whitespace-nowrap ${
                isActive ? 'text-pink-300' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>

              {/* Active Dot */}
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-pink-400 shadow-[0_0_6px_#f472b6]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
