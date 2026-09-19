import React, { useState, useEffect } from 'react';
import { X, Share2, Sparkles, ExternalLink, Link2, Check, AlertCircle } from 'lucide-react';
import { SharedLink } from '../types';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareLink: (link: Omit<SharedLink, 'id' | 'likes' | 'isLiked' | 'timestamp'>) => void;
  initialPlatform?: 'instagram' | 'facebook' | 'youtube' | 'custom';
  initialUrl?: string;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  onShareLink,
  initialPlatform = 'instagram',
  initialUrl = '',
}) => {
  const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'youtube' | 'custom'>(initialPlatform);
  const [url, setUrl] = useState(initialUrl);
  const [caption, setCaption] = useState('');
  const [showError, setShowError] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialPlatform) setPlatform(initialPlatform);
      if (initialUrl) setUrl(initialUrl);
      setShowError(false);
      setSharedToast(false);
    }
  }, [isOpen, initialPlatform, initialUrl]);

  // Auto-detect platform from URL input
  const handleUrlChange = (inputVal: string) => {
    setUrl(inputVal);
    setShowError(false);

    const lower = inputVal.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      setPlatform('youtube');
    } else if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
      setPlatform('instagram');
    } else if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) {
      setPlatform('facebook');
    }
  };

  if (!isOpen) return null;

  const handleShare = () => {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setShowError(true);
      return;
    }

    const defaultTitles: Record<string, string> = {
      instagram: 'Shared Instagram Story & Reel ✨',
      facebook: 'Shared Facebook Community Drop 🌐',
      youtube: 'Shared YouTube Stream & Video ▶️',
      custom: 'Shared Web Link on MySpace ⚡',
    };

    const finalTitle = caption.trim() || defaultTitles[platform] || 'Shared via MySpace ✨';

    onShareLink({
      type: platform,
      url: cleanUrl,
      title: finalTitle,
      caption: caption.trim() || undefined,
      author: 'you',
      icon: platform === 'instagram' ? '📸' : platform === 'facebook' ? 'f' : '▶',
    });

    setSharedToast(true);
    setTimeout(() => {
      setSharedToast(false);
      setUrl('');
      setCaption('');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-[430px] bg-[#0A0A14] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-[28px] p-6 pb-10 shadow-[0_0_60px_rgba(168,85,247,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm shadow-[0_0_15px_rgba(236,72,153,0.4)]">
              📲
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Share Link</h2>
              <p className="text-[11px] text-white/50">Drop social links to your MySpace feed</p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Platform Selector Buttons */}
        <div className="flex gap-2 mb-4">
          {/* Instagram */}
          <button
            id="btnInsta"
            type="button"
            onClick={() => setPlatform('instagram')}
            className={`flex-1 h-12 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              platform === 'instagram'
                ? 'bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] scale-[1.02]'
                : 'bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white'
            }`}
          >
            <span>📸</span>
            <span>Insta</span>
          </button>

          {/* Facebook */}
          <button
            id="btnFb"
            type="button"
            onClick={() => setPlatform('facebook')}
            className={`flex-1 h-12 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              platform === 'facebook'
                ? 'bg-[#1877F2] text-white shadow-[0_0_15px_rgba(24,119,242,0.5)] scale-[1.02]'
                : 'bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white'
            }`}
          >
            <span className="font-serif text-sm">f</span>
            <span>Facebook</span>
          </button>

          {/* YouTube */}
          <button
            id="btnYt"
            type="button"
            onClick={() => setPlatform('youtube')}
            className={`flex-1 h-12 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              platform === 'youtube'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] scale-[1.02]'
                : 'bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white'
            }`}
          >
            <span>▶</span>
            <span>YouTube</span>
          </button>
        </div>

        {/* URL Input */}
        <div className="relative mb-3">
          <input
            id="shareUrl"
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Paste link https://..."
            className={`w-full h-13 px-4 rounded-2xl bg-white/[0.08] border text-sm text-white placeholder-white/40 focus:outline-none transition-all ${
              showError
                ? 'border-rose-500 focus:border-rose-400'
                : 'border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
            }`}
          />
          {url && (
            <button
              onClick={() => setUrl('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/50 hover:text-white px-2 py-1 rounded-lg bg-white/10"
            >
              Clear
            </button>
          )}
        </div>

        {showError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-3 px-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Please paste or type a valid link first!</span>
          </div>
        )}

        {/* Caption Input */}
        <input
          id="shareCap"
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional) 🔥"
          className="w-full h-12 px-4 rounded-2xl bg-white/[0.08] border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500 mb-3"
        />

        {/* Real-time Link Preview Box */}
        {url.trim() && (
          <div
            id="previewBox"
            className="rounded-2xl p-3 bg-white/[0.06] border border-white/[0.08] border-l-4 border-l-purple-500 mb-4 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                {platform} Link Detected
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Ready
              </span>
            </div>
            <p className="text-xs font-semibold text-white mt-1 truncate">
              {caption.trim() || 'MySpace Social Link'}
            </p>
            <p className="text-[11px] text-white/50 truncate mt-0.5 font-mono">
              {url.trim()}
            </p>
          </div>
        )}

        {/* Share Button */}
        <button
          id="do-share-btn"
          type="button"
          onClick={handleShare}
          className="w-full h-13 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-sm shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
        >
          {sharedToast ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Shared to MySpace!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-pink-300" />
              <span>Share to MySpace ✨</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
