import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Share2, Volume2, VolumeX, Music, Flame, ArrowLeft } from 'lucide-react';
import { Reel } from '../types';

interface ReelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reels: Reel[];
  initialReelIndex?: number;
  onShareReel?: (reel: Reel) => void;
}

export const ReelsModal: React.FC<ReelsModalProps> = ({
  isOpen,
  onClose,
  reels,
  initialReelIndex = 0,
  onShareReel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialReelIndex);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  useEffect(() => {
    if (isOpen && typeof initialReelIndex === 'number' && initialReelIndex >= 0) {
      setCurrentIndex(initialReelIndex % (reels.length || 1));
    }
  }, [isOpen, initialReelIndex, reels.length]);

  if (!isOpen || reels.length === 0) return null;

  const currentReel = reels[currentIndex];
  const isLiked = likedMap[currentReel.id];

  const handleLike = () => {
    setLikedMap((prev) => ({
      ...prev,
      [currentReel.id]: !prev[currentReel.id],
    }));
    if (!isLiked) {
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reels.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  const handleShareClick = () => {
    if (onShareReel) {
      onShareReel(currentReel);
    } else {
      alert(`Copied reel link: https://myspace.app/reels/${currentReel.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 sm:p-4">
      {/* Mobile container */}
      <div className="relative w-full h-full max-w-md bg-[#090714] overflow-hidden flex flex-col sm:rounded-3xl border border-purple-800/40 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
        {/* Background Image / Reel frame simulation */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentReel.videoThumbnail}
            alt={currentReel.caption}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090714] via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Top Header Controls */}
        <div className="relative z-10 flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-pink-500/80 backdrop-blur-md text-[11px] font-bold text-white tracking-wider flex items-center gap-1 shadow-lg shadow-pink-500/40">
              <Flame className="w-3.5 h-3.5 fill-white" />
              REELS
            </span>
            <span className="text-xs text-slate-300">
              {currentIndex + 1} / {reels.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reel-mute-btn"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
            </button>
            <button
              id="reel-close-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-pink-600/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Heart Animation on Double Tap / Like */}
        {showHeartAnim && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="animate-ping scale-150">
              <Heart className="w-24 h-24 fill-pink-500 text-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.9)]" />
            </div>
          </div>
        )}

        {/* Navigation tap areas */}
        <div className="relative z-10 flex-1 flex">
          <div
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-10 transition-opacity bg-white"
            onClick={handlePrev}
            title="Previous Reel"
          />
          <div
            className="w-1/3 h-full cursor-pointer"
            onDoubleClick={handleLike}
          />
          <div
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-10 transition-opacity bg-white"
            onClick={handleNext}
            title="Next Reel"
          />
        </div>

        {/* Right side interaction bar */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4">
          <button
            id="reel-like-btn"
            onClick={handleLike}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`p-3 rounded-full backdrop-blur-md transition-all ${
              isLiked
                ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.8)] scale-110'
                : 'bg-black/40 text-white group-hover:bg-black/60'
            }`}>
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-xs font-semibold text-white drop-shadow">
              {isLiked ? '48.3k' : currentReel.likes}
            </span>
          </button>

          <button
            id="reel-comment-btn"
            onClick={() => alert('Comment drawer: ' + currentReel.comments + ' comments')}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white group-hover:bg-black/60 transition-all">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-white drop-shadow">
              {currentReel.comments}
            </span>
          </button>

          <button
            id="reel-share-btn"
            onClick={handleShareClick}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white group-hover:bg-black/60 transition-all">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-white drop-shadow">Share</span>
          </button>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 p-4 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent">
          {/* Creator info */}
          <div className="flex items-center gap-3 mb-2.5">
            <img
              src={currentReel.creator.avatar}
              alt={currentReel.creator.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border-2 border-pink-500 object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-sm">
                  {currentReel.creator.name}
                </span>
                <span className="text-xs text-pink-400 font-mono">
                  {currentReel.creator.handle}
                </span>
              </div>
              <p className="text-[11px] text-cyan-300 flex items-center gap-1 mt-0.5">
                <Music className="w-3 h-3 text-cyan-400 animate-spin" />
                {currentReel.audioTrack}
              </p>
            </div>
          </div>

          {/* Caption */}
          <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">
            {currentReel.caption}
          </p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {currentReel.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-pink-400/90 hover:text-pink-300 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Progress / Next buttons */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-xs text-slate-400">
            <button
              id="reel-prev-bottom-btn"
              onClick={handlePrev}
              className="hover:text-pink-400 transition-colors"
            >
              ← Previous
            </button>
            <div className="flex gap-1.5">
              {reels.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentIndex ? 'w-6 bg-pink-500' : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button
              id="reel-next-bottom-btn"
              onClick={handleNext}
              className="hover:text-pink-400 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
