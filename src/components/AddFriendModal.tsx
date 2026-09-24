import React, { useState } from 'react';
import { X, UserPlus, Sparkles, Check, Heart } from 'lucide-react';
import { Friend } from '../types';
import { UserAvatar } from './UserAvatar';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (friend: Friend, addToTop8?: boolean) => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  onAddFriend,
}) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [statusText, setStatusText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [addToTop8, setAddToTop8] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter friend’s name');
      return;
    }

    const cleanHandle = handle.trim().startsWith('@')
      ? handle.trim()
      : `@${(handle.trim() || trimmedName.toLowerCase().replace(/\s+/g, '_'))}`;

    const newFriend: Friend = {
      id: `friend_${Date.now()}`,
      name: trimmedName,
      handle: cleanHandle,
      avatar: avatarUrl.trim(),
      isOnline: true,
      lastSeen: 'Active now',
      statusText: statusText.trim() || '⚡ Connected on MySpace',
      bio: `${trimmedName} is exploring the modern MySpace 2008 network.`,
      mutualFriends: 0,
      favoriteSong: {
        title: 'Neon Odyssey',
        artist: 'Lazerhawk',
      },
      tags: ['Friend', 'MySpace'],
    };

    onAddFriend(newFriend, addToTop8);
    setName('');
    setHandle('');
    setStatusText('');
    setAvatarUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#0f0b24] border border-purple-700/50 shadow-[0_0_40px_rgba(168,85,247,0.3)] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Add Friend</h3>
              <p className="text-[10px] text-slate-400">Connect with someone on MySpace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-purple-950/60 hover:bg-purple-900/60 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Avatar */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40">
          <UserAvatar
            name={name.trim() || 'Friend'}
            avatar={avatarUrl.trim()}
            size="lg"
            showOnline={true}
            isOnline={true}
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">
              {name.trim() || 'Friend Name'}
            </p>
            <p className="text-xs text-pink-400 font-mono truncate">
              {handle.trim()
                ? handle.trim().startsWith('@')
                  ? handle.trim()
                  : `@${handle.trim()}`
                : '@handle'}
            </p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {avatarUrl.trim() ? 'Custom photo' : 'Default initials avatar'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-xs text-rose-400 font-medium px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40">
              {error}
            </p>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Friend's Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Rodriguez"
              className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Username Handle (optional)
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@username"
              className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Status Message (optional)
            </label>
            <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="e.g. Listening to Synthwave 🎶"
              className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Profile Photo URL (optional, leave blank for clean initials)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={addToTop8}
              onChange={(e) => setAddToTop8(e.target.checked)}
              className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 bg-purple-950/50 border-purple-800"
            />
            <span className="text-xs text-slate-200 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40" />
              Add to Top 8 Friends Circle
            </span>
          </label>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-xs font-semibold text-white shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add Friend</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
