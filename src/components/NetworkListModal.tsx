import React, { useState } from 'react';
import { X, Search, Users, UserCheck, UserPlus, UserX, Sparkles } from 'lucide-react';
import { SocialUser } from '../types';

interface NetworkListModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'followers' | 'following';
  users: SocialUser[];
  onToggleFollow: (userId: string) => void;
  onSelectUser: (user: SocialUser) => void;
}

export const NetworkListModal: React.FC<NetworkListModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'following',
  users,
  onToggleFollow,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const followersList = users.filter((u) => u.isFollower);
  const followingList = users.filter((u) => u.isFollowing);

  const currentList = activeTab === 'followers' ? followersList : followingList;

  const filteredList = currentList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md bg-[#0e0a22] border border-purple-800/50 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.3)] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/40 bg-[#090716] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">Network Connections</h3>
              <p className="text-[11px] text-slate-400">Manage your MySpace network</p>
            </div>
          </div>

          <button
            id="close-network-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-purple-900/40 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Followers vs Following */}
        <div className="p-3 pb-2 bg-[#0b0819]">
          <div className="flex bg-purple-950/50 p-1 rounded-2xl border border-purple-800/40 text-xs">
            <button
              id="network-tab-following-btn"
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'following'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Following ({followingList.length})
            </button>
            <button
              id="network-tab-followers-btn"
              onClick={() => setActiveTab('followers')}
              className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
                activeTab === 'followers'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Followers ({followersList.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mt-2.5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or name..."
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-purple-800/40 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-purple-600/50" />
              <p className="text-xs">No users found in this list</p>
            </div>
          ) : (
            filteredList.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-pink-500/40 transition-all group"
              >
                {/* User Info (Clickable to open profile) */}
                <div
                  onClick={() => {
                    onSelectUser(user);
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border-2 border-purple-500/40 group-hover:border-pink-500 transition-colors"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0e0a22] ${
                        user.isOnline
                          ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                          : 'bg-slate-500'
                      }`}
                      title={user.isOnline ? 'Online' : 'Offline'}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors truncate">
                        {user.name}
                      </h4>
                      {user.isOnline && (
                        <span className="text-[9px] text-emerald-400 font-mono">
                          • online
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-cyan-400 font-mono truncate">
                      {user.handle}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {user.statusText}
                    </p>
                  </div>
                </div>

                {/* Follow / Following Toggle Button */}
                <button
                  id={`network-toggle-follow-${user.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFollow(user.id);
                  }}
                  className={`ml-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    user.isFollowing
                      ? 'bg-purple-900/50 border border-purple-600/40 text-slate-300 hover:border-rose-500 hover:text-rose-400'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.3)] hover:scale-105'
                  }`}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
