import React from 'react';
import { Home, Music, MessageSquare, Compass, Gamepad2, User } from 'lucide-react';
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
  // 6 icons only, fixed: Home, Music, Chat, Social, Games, Profile
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'social', label: 'Social', icon: Compass },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      id="main-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 h-[52px] bg-[#090714]/95 backdrop-blur-md border-t border-purple-900/50 px-3 flex items-center"
    >
      <div className="w-full max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-pink-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active subtle background */}
              {isActive && (
                <div className="absolute inset-0 bg-pink-500/10 rounded-lg -z-10 border border-pink-500/30" />
              )}

              {/* Icon & badge */}
              <div className="relative">
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'scale-110 drop-shadow-[0_0_6px_rgba(236,72,153,0.7)]' : ''
                  }`}
                />
                {tab.id === 'chat' && unreadChatCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-pink-500 text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
                    {unreadChatCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] tracking-tight leading-none mt-1 ${
                isActive ? 'text-pink-300 font-semibold' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
