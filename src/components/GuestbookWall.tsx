import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Heart, Sparkles, Smile } from 'lucide-react';
import { GuestbookEntry } from '../types';

interface GuestbookWallProps {
  userId: string;
  userName: string;
}

const STICKER_OPTIONS = ['💖', '⚡', '💀', '🎸', '🛹', '👾', '✨', '🔥', '💿', '🖤', '🎀', '🦇', '⭐', '🌈'];

const DEFAULT_GUESTBOOK_ENTRIES: GuestbookEntry[] = [
  {
    id: 'gb_seed_1',
    authorName: 'Tom (MySpace Creator)',
    message: 'Welcome to MySpace! Thanks for being my friend. Don\'t forget to customize your profile code! :-)',
    sticker: '⭐',
    timestamp: '2008-04-12 14:22',
    likes: 42,
  },
  {
    id: 'gb_seed_2',
    authorName: 'xX_scene_queen_Xx',
    message: 'thx 4 the add!! rawr XD your profile song is so epic!! lets hang at the mall this friday 🎸',
    sticker: '💀',
    timestamp: 'Yesterday at 8:45 PM',
    likes: 19,
  },
  {
    id: 'gb_seed_3',
    authorName: 'Sk8erBoi99',
    message: 'PC4PC?? (pic for pic) left 5 stars on your photos, leave some love on my wall too!! 🛹',
    sticker: '🛹',
    timestamp: '2 hours ago',
    likes: 8,
  },
];

export const GuestbookWall: React.FC<GuestbookWallProps> = ({ userId, userName }) => {
  const storageKey = `myspace_guestbook_${userId || 'default'}`;

  const [entries, setEntries] = useState<GuestbookEntry[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_GUESTBOOK_ENTRIES;
  });

  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedSticker, setSelectedSticker] = useState<string>(STICKER_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Synchronize to localStorage
  const saveEntriesToStorage = (updated: GuestbookEntry[]) => {
    setEntries(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save guestbook entries', e);
    }
  };

  const handlePostEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    const newEntry: GuestbookEntry = {
      id: `gb_${Date.now()}`,
      authorName: authorName.trim() || 'Anonymous Friend',
      message: message.trim(),
      sticker: selectedSticker,
      timestamp: 'Just now',
      likes: 1,
    };

    const updated = [newEntry, ...entries];
    saveEntriesToStorage(updated);
    setMessage('');
    setAuthorName('');
    setIsSubmitting(false);
  };

  const handleDeleteEntry = (entryId: string) => {
    const updated = entries.filter((item) => item.id !== entryId);
    saveEntriesToStorage(updated);
  };

  const handleLikeEntry = (entryId: string) => {
    const updated = entries.map((item) => {
      if (item.id === entryId) {
        return {
          ...item,
          likes: (item.likes || 0) + 1,
        };
      }
      return item;
    });
    saveEntriesToStorage(updated);
  };

  return (
    <div
      id="guestbook-wall-container"
      className="rounded-xl bg-[#120a22]/90 border-2 border-pink-500/40 p-3 space-y-2.5 shadow-[0_0_15px_rgba(236,72,153,0.15)] text-xs"
    >
      {/* 2008 Retro Section Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-pink-500/30">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📝</span>
          <h3 className="font-display font-bold text-xs text-white tracking-wide">
            {userName}'s Guestbook Wall
          </h3>
          <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono text-[9px] border border-pink-500/30">
            {entries.length} Comments
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[10px] font-mono text-cyan-300 hover:text-white px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 cursor-pointer"
        >
          {isCollapsed ? '[+ Expand Wall]' : '[- Collapse]'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Post Form (Compact 2008 Layout) */}
          <form onSubmit={handlePostEntry} className="space-y-2 bg-[#090514]/80 p-2.5 rounded-lg border border-purple-800/40">
            <div className="flex items-center gap-2">
              <input
                id="guestbook-author-input"
                type="text"
                placeholder="Your 2008 Name or @Handle..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                maxLength={30}
                className="flex-1 px-2.5 py-1.5 rounded-md bg-[#160e2b] border border-purple-700/50 text-white placeholder-slate-500 text-[11px] font-mono focus:outline-none focus:border-pink-500"
              />

              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <Smile className="w-3 h-3 text-pink-400" />
                <span>Sticker:</span>
                <span className="text-base leading-none">{selectedSticker}</span>
              </div>
            </div>

            {/* Emoji Sticker Ribbon */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {STICKER_OPTIONS.map((stk) => (
                  <button
                    key={stk}
                    type="button"
                    onClick={() => setSelectedSticker(stk)}
                    className={`w-6 h-6 shrink-0 rounded flex items-center justify-center text-xs transition-transform cursor-pointer ${
                      selectedSticker === stk
                        ? 'bg-pink-500/30 border border-pink-400 scale-110 shadow-[0_0_8px_#ec4899]'
                        : 'bg-purple-950/40 border border-purple-900/40 hover:scale-105'
                    }`}
                  >
                    {stk}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-1.5">
              <textarea
                id="guestbook-message-input"
                rows={2}
                placeholder="Leave some love on my wall... (e.g., thx 4 the add! rawr XD)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#160e2b] border border-purple-700/50 text-white placeholder-slate-500 text-[11px] focus:outline-none focus:border-pink-500 resize-none leading-tight"
                required
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  {message.length}/200 chars
                </span>
                <button
                  id="guestbook-submit-btn"
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="px-3 py-1 rounded-md bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-[0_0_10px_rgba(236,72,153,0.4)] disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>✍️ Sign Guestbook</span>
                </button>
              </div>
            </div>
          </form>

          {/* Wall Signatures List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 no-scrollbar">
            {entries.length === 0 ? (
              <div className="p-3 rounded-lg bg-[#0c071a] border border-purple-900/40 text-center text-slate-400 text-[11px]">
                No comments on this wall yet. Be the first to leave a message! ✨
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-2.5 rounded-lg bg-[#0e071e] border border-purple-800/40 hover:border-pink-500/40 transition-colors relative group"
                >
                  {/* Glossy Sticker Stamp on top right */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span
                      className="w-6 h-6 rounded-full bg-pink-500/20 border border-pink-400/50 flex items-center justify-center text-xs shadow-[0_0_6px_rgba(236,72,153,0.3)] animate-pulse"
                      title="Sticker"
                    >
                      {entry.sticker}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 rounded opacity-70 hover:opacity-100 transition-opacity"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Author & Timestamp */}
                  <div className="pr-16">
                    <span className="font-bold text-pink-300 font-display text-[11px] block truncate">
                      {entry.authorName}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block">
                      {entry.timestamp}
                    </span>
                  </div>

                  {/* Message Body */}
                  <p className="text-[11px] text-slate-200 mt-1.5 leading-relaxed font-normal break-words">
                    {entry.message}
                  </p>

                  {/* Retro like interaction */}
                  <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-purple-950 text-[10px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleLikeEntry(entry.id)}
                      className="flex items-center gap-1 hover:text-pink-400 transition-colors cursor-pointer"
                    >
                      <Heart className="w-3 h-3 fill-pink-500/20 text-pink-400" />
                      <span>{entry.likes || 0} props</span>
                    </button>
                    <span className="text-[9px] font-mono text-cyan-400/80">
                      ★ Verified Post
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
