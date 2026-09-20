import React, { useState, useRef, useEffect } from 'react';
import { Award, GripVertical, Edit2, Check, X, ArrowLeft, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';
import { Friend } from '../types';

interface Top8FriendsManagerProps {
  friends: Friend[];
  userId: string;
  onOpenChatWithFriend: (friend: Friend) => void;
  onUpdateTop8?: (updatedFriends: Friend[]) => void;
}

const DEFAULT_CAPTIONS = [
  'BFFL <3',
  'Partner in Crime',
  'Guitar Hero',
  'Rawr XD',
  'Mall Buddy',
  'Scene Queen',
  'Skater Legend',
  'MySpace Homie',
];

const PRESET_CAPTIONS = [
  'BFFL <3',
  'My #1',
  'Rawr XD',
  'Partner in Crime',
  'Guitar Hero',
  'Scene Queen',
  'Mall Rat',
  'Rockstar',
  'Don\'t delete me!',
  'PC4PC?',
];

export const Top8FriendsManager: React.FC<Top8FriendsManagerProps> = ({
  friends,
  userId,
  onOpenChatWithFriend,
  onUpdateTop8,
}) => {
  const orderStorageKey = `myspace_top8_order_${userId || 'default'}`;
  const captionsStorageKey = `myspace_top8_captions_${userId || 'default'}`;

  // Initialize Top 8 with localStorage or fallback
  const [top8, setTop8] = useState<Friend[]>(() => {
    try {
      const savedCaptions = JSON.parse(localStorage.getItem(captionsStorageKey) || '{}');
      const savedOrder = JSON.parse(localStorage.getItem(orderStorageKey) || '[]');

      if (Array.isArray(savedOrder) && savedOrder.length > 0) {
        // Map saved IDs to friend objects
        const resolved = savedOrder
          .map((item: any) => {
            const found = friends.find((f) => f.id === item.id || f.name === item.name);
            if (found) {
              return {
                ...found,
                caption: savedCaptions[found.id] || item.caption || found.caption,
              };
            }
            return item;
          })
          .filter(Boolean);

        if (resolved.length > 0) return resolved.slice(0, 8);
      }
    } catch {
      // fallback
    }

    // Default top 8 from props
    return friends.slice(0, 8).map((f, i) => ({
      ...f,
      caption: f.caption || DEFAULT_CAPTIONS[i] || 'Top Friend',
    }));
  });

  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Long press / Edit caption state
  const [editingFriend, setEditingFriend] = useState<{ friend: Friend; index: number } | null>(null);
  const [captionInput, setCaptionInput] = useState('');
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const didLongPressRef = useRef(false);

  // Synchronize top 8 changes
  const saveTop8 = (updated: Friend[]) => {
    setTop8(updated);
    try {
      localStorage.setItem(orderStorageKey, JSON.stringify(updated));
      const captionsMap: Record<string, string> = {};
      updated.forEach((f) => {
        if (f.caption) captionsMap[f.id] = f.caption;
      });
      localStorage.setItem(captionsStorageKey, JSON.stringify(captionsMap));
    } catch (e) {
      console.error('Failed to save Top 8', e);
    }
    onUpdateTop8?.(updated);
  };

  // Reorder via Drag & Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const updated = [...top8];
    const [movedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIndex, 0, movedItem);

    setDraggedIdx(null);
    setDragOverIdx(null);
    saveTop8(updated);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Quick swap buttons for mobile / accessibility
  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const updated = [...top8];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    saveTop8(updated);
  };

  const handleMoveRight = (index: number) => {
    if (index >= top8.length - 1) return;
    const updated = [...top8];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    saveTop8(updated);
  };

  // Long press handler logic
  const startLongPress = (friend: Friend, index: number) => {
    didLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      openCaptionEditor(friend, index);
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleCardClick = (friend: Friend) => {
    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    onOpenChatWithFriend(friend);
  };

  const openCaptionEditor = (friend: Friend, index: number) => {
    setEditingFriend({ friend, index });
    setCaptionInput(friend.caption || '');
  };

  const handleSaveCaption = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingFriend) return;

    const updated = top8.map((f, i) => {
      if (i === editingFriend.index) {
        return {
          ...f,
          caption: captionInput.trim() || 'Top Friend',
        };
      }
      return f;
    });

    saveTop8(updated);
    setEditingFriend(null);
  };

  return (
    <div className="space-y-2">
      {/* Top 8 Header */}
      <div className="flex items-center justify-between pb-1 border-b border-purple-800/40 text-xs">
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-display font-bold text-white tracking-wide">
            Top 8 Friends
          </span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] border border-amber-500/30">
            Reorderable
          </span>
        </div>

        <span className="text-[10px] font-mono text-cyan-400">
          Drag to swap • Hold to edit
        </span>
      </div>

      {/* Grid of 8 Friends */}
      <div className="grid grid-cols-4 gap-2">
        {top8.map((friend, index) => {
          const isRankOne = index === 0;
          const isDragging = draggedIdx === index;
          const isDragTarget = dragOverIdx === index;

          return (
            <div
              key={friend.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onTouchStart={() => startLongPress(friend, index)}
              onTouchEnd={cancelLongPress}
              onTouchMove={cancelLongPress}
              onMouseDown={() => startLongPress(friend, index)}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              className={`flex flex-col items-center p-1.5 rounded-xl border relative transition-all select-none cursor-grab active:cursor-grabbing ${
                isDragging
                  ? 'opacity-40 scale-95 border-dashed border-cyan-400'
                  : isDragTarget
                  ? 'bg-purple-900/60 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)] scale-102'
                  : isRankOne
                  ? 'bg-[#150d2b] border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-[#120a22] border-purple-800/40 hover:border-pink-500/50'
              }`}
              title="Drag to reorder, long-press to edit caption"
            >
              {/* Rank Badge */}
              <span
                className={`absolute -top-1.5 -left-1.5 px-1 py-0.2 rounded text-[8px] font-mono font-black shadow-xs z-10 ${
                  isRankOne
                    ? 'bg-amber-400 text-black border border-amber-300'
                    : 'bg-purple-900 text-purple-200 border border-purple-700/60'
                }`}
              >
                #{index + 1}
              </span>

              {/* Edit Pencil Shortcut Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openCaptionEditor(friend, index);
                }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-pink-600/90 text-white flex items-center justify-center text-[8px] shadow-xs hover:bg-pink-500 transition-colors z-10 cursor-pointer"
                title="Edit caption"
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>

              {/* Avatar with status */}
              <div
                onClick={() => handleCardClick(friend)}
                className={`relative p-0.5 rounded-full cursor-pointer group ${
                  isRankOne
                    ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-cyan-400'
                    : 'bg-gradient-to-tr from-pink-500 to-cyan-400'
                }`}
              >
                {friend.avatar ? (
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#090714] group-hover:brightness-110"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-purple-950 border-2 border-[#090714] flex items-center justify-center text-pink-400 text-xs font-bold font-mono">
                    {friend.name ? friend.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                {friend.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090714] shadow-[0_0_6px_#34d399]" />
                )}
              </div>

              {/* Friend Name */}
              <span
                onClick={() => handleCardClick(friend)}
                className="text-[10px] font-bold text-white mt-1 truncate max-w-full text-center hover:text-pink-300 cursor-pointer leading-none"
              >
                {friend.name.split(' ')[0]}
              </span>

              {/* Custom Caption (The iconic 2008 status line!) */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  openCaptionEditor(friend, index);
                }}
                className="text-[9px] text-pink-300/90 italic font-mono truncate max-w-full text-center mt-0.5 px-1 rounded bg-pink-950/40 border border-pink-900/30 cursor-pointer hover:border-pink-500"
                title={friend.caption || 'Tap to edit'}
              >
                "{friend.caption || DEFAULT_CAPTIONS[index] || 'Top 8'}"
              </span>

              {/* Mobile quick shift arrows */}
              <div className="flex items-center justify-between w-full mt-1 pt-0.5 border-t border-purple-900/30">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveLeft(index);
                  }}
                  className="text-slate-400 hover:text-cyan-300 disabled:opacity-20 p-0.5 text-[9px]"
                  title="Move left"
                >
                  ◀
                </button>
                <GripVertical className="w-2.5 h-2.5 text-slate-500 opacity-60" />
                <button
                  type="button"
                  disabled={index === top8.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveRight(index);
                  }}
                  className="text-slate-400 hover:text-cyan-300 disabled:opacity-20 p-0.5 text-[9px]"
                  title="Move right"
                >
                  ▶
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Caption Edit Modal */}
      {editingFriend && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xs rounded-2xl bg-[#130b26] border-2 border-pink-500/60 p-3.5 space-y-3 shadow-[0_0_25px_rgba(236,72,153,0.35)] text-xs">
            <div className="flex items-center justify-between border-b border-purple-800/50 pb-2">
              <div className="flex items-center gap-2">
                {editingFriend.friend.avatar ? (
                  <img
                    src={editingFriend.friend.avatar}
                    alt={editingFriend.friend.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-pink-400"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-purple-950 flex items-center justify-center text-pink-400 text-[10px] font-bold font-mono border border-pink-400">
                    {editingFriend.friend.name ? editingFriend.friend.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white text-xs">
                    Edit Caption for {editingFriend.friend.name.split(' ')[0]}
                  </h4>
                  <span className="text-[9px] font-mono text-cyan-300">
                    Rank #{editingFriend.index + 1} on your Top 8
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingFriend(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCaption} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-mono text-slate-300 block mb-1">
                  Custom Top 8 Caption:
                </label>
                <input
                  id="top8-caption-input"
                  type="text"
                  autoFocus
                  maxLength={24}
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder="e.g. BFFL <3, Guitar Hero"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0b0616] border border-pink-500/60 text-white font-mono text-xs focus:outline-none focus:shadow-[0_0_10px_#ec4899]"
                />
              </div>

              {/* Preset 2008 pills */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-400">Quick 2008 Presets:</span>
                <div className="flex flex-wrap gap-1">
                  {PRESET_CAPTIONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCaptionInput(preset)}
                      className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-700/50 text-[9px] text-pink-300 hover:bg-pink-600 hover:text-white transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingFriend(null)}
                  className="px-2.5 py-1 rounded-md bg-purple-950 border border-purple-800 text-slate-300 text-[11px] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  id="top8-save-caption-btn"
                  type="submit"
                  className="px-3 py-1 rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-[11px] shadow-[0_0_10px_rgba(236,72,153,0.5)] flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Caption</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
