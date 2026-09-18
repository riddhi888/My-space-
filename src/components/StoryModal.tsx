import React from 'react';
import { X, Send, Heart, Sparkles } from 'lucide-react';
import { Friend } from '../types';

interface StoryModalProps {
  friend: Friend | null;
  onClose: () => void;
  onOpenChatWithFriend: (friend: Friend) => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  friend,
  onClose,
  onOpenChatWithFriend,
}) => {
  const [replyText, setReplyText] = React.useState('');

  if (!friend) return null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onOpenChatWithFriend(friend);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full h-full max-w-md bg-[#090714] overflow-hidden flex flex-col sm:rounded-3xl border border-pink-500/30 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={friend.storyImage || friend.avatar}
            alt={friend.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/70 pointer-events-none" />
        </div>

        {/* Story Progress Bar */}
        <div className="relative z-10 px-4 pt-3 pb-2 flex gap-1.5">
          <div className="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 w-3/4 animate-pulse rounded-full" />
          </div>
        </div>

        {/* Friend info header */}
        <div className="relative z-10 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-r from-pink-500 to-cyan-400">
              <img
                src={friend.avatar}
                alt={friend.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{friend.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/30 text-pink-300 font-mono">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-cyan-300">{friend.handle}</p>
            </div>
          </div>
          <button
            id="close-story-btn"
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Middle Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-end p-6">
          <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-pink-500/20 mb-4">
            <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Current Status
            </div>
            <p className="text-white text-base font-medium">
              "{friend.statusText || 'Vibing in the neon grid ✨'}"
            </p>
          </div>
        </div>

        {/* Reply footer */}
        <div className="relative z-10 p-4 pb-6 bg-gradient-to-t from-black to-transparent">
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${friend.name}...`}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-pink-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onOpenChatWithFriend(friend);
                onClose();
              }}
              className="p-3 rounded-2xl bg-pink-500/30 border border-pink-500/50 text-pink-300 hover:bg-pink-500 hover:text-white transition-colors"
              title="Like story"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:scale-105 transition-transform"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
