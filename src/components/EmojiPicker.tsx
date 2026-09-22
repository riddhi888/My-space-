import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
}) => {
  if (!isOpen) return null;

  const categories = [
    {
      name: 'Cyber & Neon',
      emojis: ['🔥', '💜', '⚡', '✨', '🕹️', '👾', '🚀', '🤖', '💎', '🌌', '🌃', '🛸'],
    },
    {
      name: 'Vibes & Expressions',
      emojis: ['😎', '🥰', '😂', '🥳', '🤩', '🎧', '🦾', '🕶️', '😈', '👀', '🤙', '✌️'],
    },
    {
      name: 'Hearts & Symbols',
      emojis: ['💖', '💙', '🖤', '💯', '💫', '🎯', '🍸', '💻', '📸', '🏁', '⭐', '🌈'],
    },
  ];

  return (
    <div className="p-3 bg-[#0d091c] border-t border-purple-900/30 rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-purple-900/20 mb-2">
        <span className="text-xs font-mono text-pink-300 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          Neon Emoji Matrix
        </span>
        <button
          id="close-emoji-picker-btn"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5 max-h-40 overflow-y-auto no-scrollbar">
        {categories.map((cat) => (
          <div key={cat.name}>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              {cat.name}
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {cat.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelectEmoji(emoji)}
                  className="p-1.5 rounded-xl hover:bg-purple-950/60 active:scale-95 text-xl flex items-center justify-center transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
