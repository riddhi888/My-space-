import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Flame,
  Send,
  Youtube,
  Instagram,
  Facebook,
  ChevronUp,
  ChevronDown,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import { Reel } from '../types';
import { UserAvatar } from './UserAvatar';

interface ReelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reels: Reel[];
  onShowToast?: (msg: string) => void;
}

function getEmbedUrl(reel: Reel) {
  if (reel.platform === 'youtube') return `https://www.youtube.com/embed/${reel.id}?autoplay=1&playsinline=1&rel=0`;
  if (reel.platform === 'instagram') return `https://www.instagram.com/reel/${reel.id}/embed`;
  if (reel.platform === 'facebook') return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/facebook/videos/${reel.id}/&show_text=false&autoplay=true`;
  return '';
}

export const ReelsModal: React.FC<ReelsModalProps> = ({
  isOpen,
  onClose,
  reels,
  onShowToast,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeReelId, setActiveReelId] = useState<string>(reels[0]?.id || '');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [activeCommentReelId, setActiveCommentReelId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, { id: string; user: string; text: string; time: string; avatar: string }[]>>({
    dQw4w9WgXcQ: [
      { id: 'c1', user: 'Tom Anderson', text: 'Classic vibes! Never gets old ⚡', time: '10m ago', avatar: '' },
    ],
  });

  // Reset active reel when opened
  useEffect(() => {
    if (isOpen && reels.length > 0) {
      setActiveReelId(reels[0].id);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, reels]);

  // IntersectionObserver to auto-play only visible video
  useEffect(() => {
    if (!isOpen || reels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reelId = entry.target.getAttribute('data-reel-id');
            if (reelId) {
              setActiveReelId(reelId);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      }
    );

    reelRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [isOpen, reels]);

  // Current active index helper
  const currentIndex = reels.findIndex((r) => r.id === activeReelId);

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < reels.length) {
      reelRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  // Touch swipe handling for fast up/down swiping
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY < -45) {
      handleNext();
    } else if (deltaY > 45) {
      handlePrev();
    }
    touchStartY.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, reels.length]);

  if (!isOpen || reels.length === 0) return null;

  const handleLike = (reelId: string) => {
    setLikedMap((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }));
  };

  const toggleFollow = (username: string) => {
    setFollowingMap((prev) => {
      const next = !prev[username];
      if (onShowToast) {
        onShowToast(next ? `Now following ${username}!` : `Unfollowed ${username}`);
      }
      return { ...prev, [username]: next };
    });
  };

  const handleShare = (reel: Reel) => {
    const url = getEmbedUrl(reel);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    if (onShowToast) {
      onShowToast(`Reel link copied for @${reel.username}! 🔗`);
    }
  };

  const handleAddComment = (e: React.FormEvent, reelId: string) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      user: 'You',
      avatar: '',
      text: commentInput.trim(),
      time: 'Just now',
    };

    setCommentsMap((prev) => ({
      ...prev,
      [reelId]: [newComment, ...(prev[reelId] || [])],
    }));

    setCommentInput('');
    if (onShowToast) onShowToast('Comment posted! 💬');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Top Controls Overlay */}
      <div className="fixed top-3 left-3 right-3 z-50 flex items-center justify-between pointer-events-none max-w-md mx-auto">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="px-3 py-1 rounded-full bg-pink-500/80 backdrop-blur-md text-xs font-bold text-white tracking-wider flex items-center gap-1.5 shadow-lg shadow-pink-500/40">
            <Flame className="w-3.5 h-3.5 fill-white" />
            REELS
          </span>
          <span className="text-xs font-mono text-slate-200 bg-black/60 border border-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-md">
            {(currentIndex >= 0 ? currentIndex : 0) + 1} / {reels.length}
          </span>
        </div>

        <button
          id="reel-modal-close-btn"
          onClick={onClose}
          className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/15 hover:bg-pink-600 transition-colors pointer-events-auto shadow-lg"
          title="Close Reels"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Floating Vertical Navigation Buttons for desktop / quick swipe */}
      <div className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-2 pointer-events-auto">
        <button
          id="modal-quick-prev-btn"
          onClick={handlePrev}
          disabled={currentIndex <= 0}
          className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-pink-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
          title="Previous Reel (Up Arrow)"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          id="modal-quick-next-btn"
          onClick={handleNext}
          disabled={currentIndex >= reels.length - 1}
          className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-pink-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
          title="Next Reel (Down Arrow)"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* 1. TikTok vertical scroll container:
          - height: 100dvh
          - width: 100%
          - overflow-y: scroll
          - scroll-snap-type: y mandatory
          - hide scrollbar
      */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          height: '100dvh',
          width: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="relative max-w-md mx-auto bg-black no-scrollbar [&::-webkit-scrollbar]:hidden"
      >
        {/* 2. Map all reels vertically */}
        {reels.map((reel, index) => {
          const isVisible = activeReelId === reel.id;
          const isLiked = !!likedMap[reel.id];
          const isFollowing = !!followingMap[reel.username];
          const commentsCount = (commentsMap[reel.id] || []).length;

          return (
            <div
              key={reel.id}
              ref={(el) => {
                reelRefs.current[index] = el;
              }}
              data-reel-id={reel.id}
              style={{
                height: '100dvh',
                scrollSnapAlign: 'start',
                position: 'relative',
              }}
              className="w-full bg-black overflow-hidden flex items-center justify-center select-none"
            >
              {/* 3. Auto-play only visible video using IntersectionObserver */}
              <iframe
                src={isVisible ? getEmbedUrl(reel) : ''}
                style={{ width: '100%', height: '100%', border: 0 }}
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={reel.title}
              />

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

              {/* 4. Like, comment, share buttons on right side like Instagram */}
              <div
                style={{ position: 'absolute', right: 12, bottom: 90 }}
                className="z-30 flex flex-col items-center gap-4 pointer-events-auto"
              >
                {/* Creator Avatar with follow badge */}
                <div className="relative mb-1 flex flex-col items-center">
                  <div className="p-0.5 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600">
                    <UserAvatar name={reel.username} size="sm" />
                  </div>
                  <button
                    onClick={() => toggleFollow(reel.username)}
                    className={`absolute -bottom-1 p-0.5 rounded-full transition-transform hover:scale-110 ${
                      isFollowing
                        ? 'bg-purple-700 text-white'
                        : 'bg-pink-500 text-white shadow-md'
                    }`}
                    title={isFollowing ? 'Following' : 'Follow'}
                  >
                    {isFollowing ? <UserCheck className="w-2.5 h-2.5" /> : <UserPlus className="w-2.5 h-2.5" />}
                  </button>
                </div>

                {/* Like Button */}
                <button
                  id={`reel-like-${reel.id}`}
                  onClick={() => handleLike(reel.id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`p-3 rounded-full backdrop-blur-md transition-all ${
                      isLiked
                        ? 'bg-pink-500 text-white scale-110 shadow-[0_0_15px_rgba(236,72,153,0.8)]'
                        : 'bg-black/55 text-white group-hover:bg-black/80 border border-white/15'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-white' : ''}`} />
                  </div>
                  <span className="text-[11px] font-semibold text-white drop-shadow">
                    {isLiked ? 'Liked' : 'Like'}
                  </span>
                </button>

                {/* Comment Button */}
                <button
                  id={`reel-comment-${reel.id}`}
                  onClick={() => setActiveCommentReelId(reel.id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="p-3 rounded-full bg-black/55 backdrop-blur-md text-white group-hover:bg-black/80 border border-white/15 transition-all">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-white drop-shadow">
                    {commentsCount > 0 ? commentsCount : 'Comment'}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  id={`reel-share-${reel.id}`}
                  onClick={() => handleShare(reel)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="p-3 rounded-full bg-black/55 backdrop-blur-md text-white group-hover:bg-black/80 border border-white/15 transition-all">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-white drop-shadow">
                    Share
                  </span>
                </button>
              </div>

              {/* Bottom Creator Info & Title */}
              <div
                style={{ position: 'absolute', bottom: 20, left: 10, color: 'white' }}
                className="z-20 max-w-[calc(100%-80px)] pr-2 pointer-events-auto"
              >
                {/* Platform Badge */}
                <div className="flex items-center gap-2 mb-1.5">
                  {reel.platform === 'youtube' && (
                    <span className="px-2 py-0.5 rounded-full bg-red-600/90 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                      <Youtube className="w-3 h-3" /> YouTube Shorts
                    </span>
                  )}
                  {reel.platform === 'instagram' && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                      <Instagram className="w-3 h-3" /> Instagram Reel
                    </span>
                  )}
                  {reel.platform === 'facebook' && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600/90 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                      <Facebook className="w-3 h-3" /> Facebook Reel
                    </span>
                  )}
                </div>

                <p className="font-semibold text-sm drop-shadow text-white leading-snug">
                  @{reel.username} - {reel.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMMENTS BOTTOM DRAWER */}
      {activeCommentReelId && (
        <div className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto max-h-[60%] bg-[#0c081d]/95 backdrop-blur-2xl rounded-t-3xl border-t border-purple-800/60 p-4 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/50">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-pink-400" />
              Comments ({(commentsMap[activeCommentReelId] || []).length})
            </span>
            <button
              onClick={() => setActiveCommentReelId(null)}
              className="text-slate-400 hover:text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {(commentsMap[activeCommentReelId] || []).length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">
                No comments yet. Leave a comment!
              </p>
            ) : (
              (commentsMap[activeCommentReelId] || []).map((c) => (
                <div key={c.id} className="flex gap-2.5 items-start text-xs">
                  <UserAvatar name={c.user} avatar={c.avatar} size="xs" />
                  <div className="flex-1 bg-purple-950/40 rounded-xl p-2.5 border border-purple-900/30">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-pink-300">{c.user}</span>
                      <span className="text-[10px] text-slate-500">{c.time}</span>
                    </div>
                    <p className="text-slate-200 mt-1">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(e) => handleAddComment(e, activeCommentReelId)}
            className="pt-2 flex gap-2"
          >
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-[#150f2e] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
