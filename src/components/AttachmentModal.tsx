import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Mic,
  Gamepad2,
  Sparkles,
  Send,
} from 'lucide-react';
import { MessageAttachment } from '../types';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAttachment: (attachment: MessageAttachment, optionalText?: string) => void;
  onShowToast?: (msg: string) => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isOpen,
  onClose,
  onSelectAttachment,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'stickers' | 'audio' | 'games'>('photos');

  if (!isOpen) return null;

  const photoPresets = [
    {
      title: 'Neon Tokyo Arcade',
      url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Rainy Cyber Alley',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Synthwave Sunset Stage',
      url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Holographic Matrix Hub',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const neonStickers = [
    { title: 'Cyber Skull 💀', icon: '💀', desc: 'Neon Cyber Skull' },
    { title: 'Glitch Heart 💖', icon: '💖', desc: '8-Bit Glitch Heart' },
    { title: 'Synth Cassette 📼', icon: '📼', desc: 'Retro Cassette' },
    { title: 'Arcade Joy 🕹️', icon: '🕹️', desc: 'Arcade Joystick' },
    { title: 'Space Invader 👾', icon: '👾', desc: 'Pixel Alien' },
    { title: 'Cyber Flame 🔥', icon: '🔥', desc: 'Neon Inferno' },
  ];

  const handleSendPhoto = (photo: { title: string; url: string }) => {
    onSelectAttachment(
      {
        type: 'image',
        url: photo.url,
        title: photo.title,
      },
      `Sent a photo: ${photo.title}`
    );
    onShowToast?.('Sent neon photo!');
    onClose();
  };

  const handleSendSticker = (sticker: { title: string; icon: string; desc: string }) => {
    onSelectAttachment(
      {
        type: 'sticker',
        title: `${sticker.icon} ${sticker.desc}`,
      },
      sticker.icon
    );
    onShowToast?.(`Sent sticker ${sticker.icon}!`);
    onClose();
  };

  const handleSendVoiceMemo = () => {
    onSelectAttachment(
      {
        type: 'audio',
        duration: '0:14',
        title: 'Neon Voice Note 🎙️',
      },
      '🎙️ [Voice Memo • 0:14]'
    );
    onShowToast?.('Voice memo sent!');
    onClose();
  };

  const handleSendGameDuel = (gameTitle: string) => {
    onSelectAttachment(
      {
        type: 'game_invite',
        gameTitle,
        gameScore: 2850,
      },
      `🕹️ Challenged you to a duel on ${gameTitle}!`
    );
    onShowToast?.(`Sent game challenge for ${gameTitle}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0e0920] border border-purple-800/40 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_0_40px_rgba(236,72,153,0.3)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-pink-500/20 text-pink-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-semibold text-sm text-white">Send Attachment</h3>
          </div>
          <button
            id="close-attachment-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-purple-950/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-purple-950/30 rounded-2xl border border-purple-800/30">
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all ${
              activeTab === 'photos'
                ? 'bg-pink-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Photos
          </button>
          <button
            onClick={() => setActiveTab('stickers')}
            className={`py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all ${
              activeTab === 'stickers'
                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Stickers
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all ${
              activeTab === 'audio'
                ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Audio
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all ${
              activeTab === 'games'
                ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Duel
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'photos' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400">Choose a cyber neon capture to send:</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar">
              {photoPresets.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => handleSendPhoto(photo)}
                  className="group relative rounded-xl overflow-hidden border border-purple-700/40 hover:border-pink-500 transition-all text-left"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] font-medium text-white truncate">
                      {photo.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stickers' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400">Send an animated neon sticker:</p>
            <div className="grid grid-cols-3 gap-2">
              {neonStickers.map((sticker, i) => (
                <button
                  key={i}
                  onClick={() => handleSendSticker(sticker)}
                  className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 hover:border-pink-500 flex flex-col items-center gap-1 transition-all hover:scale-105"
                >
                  <span className="text-2xl">{sticker.icon}</span>
                  <span className="text-[10px] text-slate-300 truncate max-w-full">
                    {sticker.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-3 p-4 rounded-2xl bg-purple-950/30 border border-purple-800/30 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Record & Send Voice Note</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Simulate a 0:14 crisp cyber voice message with audio waveform
              </p>
            </div>
            <button
              id="send-audio-note-btn"
              onClick={handleSendVoiceMemo}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-transform"
            >
              <Send className="w-3.5 h-3.5" /> Send 0:14 Audio Note
            </button>
          </div>
        )}

        {activeTab === 'games' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400">Send an Arcade Challenge Duel:</p>
            <div className="space-y-2">
              <button
                id="challenge-matrix-btn"
                onClick={() => handleSendGameDuel('Memory Matrix Arcade')}
                className="w-full p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 hover:border-emerald-500 flex items-center justify-between text-left transition-all hover:bg-purple-900/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-pink-400 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Memory Matrix Arcade</p>
                    <p className="text-[10px] text-slate-400">Challenge friend to match patterns</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  Send Invite
                </span>
              </button>

              <button
                id="challenge-reflex-btn"
                onClick={() => handleSendGameDuel('Cyber Reflex Arena')}
                className="w-full p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 hover:border-pink-500 flex items-center justify-between text-left transition-all hover:bg-purple-900/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Cyber Reflex Arena</p>
                    <p className="text-[10px] text-slate-400">Reaction speed battle</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono border border-pink-500/30">
                  Send Invite
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
