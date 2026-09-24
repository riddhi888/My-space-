import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Flame,
  UserPlus,
  UserCheck,
  Send,
  Loader2,
  Youtube,
  Instagram,
  Facebook,
  ChevronUp,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { Reel } from '../types';
import { UserAvatar } from './UserAvatar';

interface ReelsViewProps {
  reels: Reel[];
  onShowToast: (msg: string) => void;
}

function getEmbedUrl(reel: Reel) {
  if (reel.platform === 'youtube') return `https://www.youtube.com/embed/${reel.id}?autoplay=1&playsinline=1&rel=0`;
  if (reel.platform === 'instagram') return `https://www.instagram.com/reel/${reel.id}/embed`;
  if (reel.platform === 'facebook') return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/facebook/videos/${reel.id}/&show_text=false&autoplay=true`;
  return '';
}

export const ReelsView: React.FC<ReelsViewProps> = ({ reels, onShowToast }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'youtube' | 'instagram' | 'facebook'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, { id: string; user: string; text: string; time: string; avatar: string }[]>>({
    dQw4w9WgXcQ: [
      { id: 'c1', user: 'Tom Anderson', text: 'Classic vibes! Never gets old ⚡', time: '10m ago', avatar: '' },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);
  const touchStartY = useRef<number | null>(null);

  // Filter reels according to selected platform
  const filteredReels = reels.filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.platform === selectedFilter;
  });

  // Ensure current index is within bounds of filtered list
  const safeIndex = currentIndex < filteredReels.length ? currentIndex : 0;
  const currentReel = filteredReels[safeIndex];

  // Reset current index when filter changes
  const handleFilterChange = (filter: 'all' | 'youtube' | 'instagram' | 'facebook') => {
    setSelectedFilter(filter);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (filteredReels.length <= 1) return;
    setIsLoading(true);
    setCurrentIndex((prev) => (prev + 1) % filteredReels.length);
    setTimeout(() => setIsLoading(false), 200);
  };

  const handlePrev = () => {
    if (filteredReels.length <= 1) return;
    setIsLoading(true);
    setCurrentIndex((prev) => (prev - 1 + filteredReels.length) % filteredReels.length);
    setTimeout(() => setIsLoading(false), 200);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredReels.length]);

  const isLiked = currentReel ? !!likedMap[currentReel.id] : false;
  const isFollowing = currentReel ? !!followingMap[currentReel.username] : false;
  const currentComments = currentReel ? commentsMap[currentReel.id] || [] : [];

  const handleLike = () => {
    if (!currentReel) return;
    setLikedMap((prev) => ({
      ...prev,
      [currentReel.id]: !prev[currentReel.id],
    }));
    if (!isLiked) {
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    }
  };

  const toggleFollow = (username: string) => {
    setFollowingMap((prev) => {
      const next = !prev[username];
      onShowToast(next ? `Now following ${username}!` : `Unfollowed ${username}`);
      return { ...prev, [username]: next };
    });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;

    if (deltaY < -40) {
      handleNext();
    } else if (deltaY > 40) {
      handlePrev();
    }
    touchStartY.current = null;
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentReel) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      user: 'You',
      avatar: '',
      text: commentInput.trim(),
      time: 'Just now',
    };

    setCommentsMap((prev) => ({
      ...prev,
      [currentReel.id]: [newComment, ...(prev[currentReel.id] || [])],
    }));

    setCommentInput('');
    onShowToast('Comment posted! 💬');
  };

  const renderPlatformBadge = () => {
    if (!currentReel) return null;
    if (currentReel.platform === 'youtube') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
          <Youtube className="w-3.5 h-3.5" /> YouTube
        </span>
      );
    }
    if (currentReel.platform === 'instagram') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
          <Instagram className="w-3.5 h-3.5" /> Instagram
        </span>
      );
    }
    if (currentReel.platform === 'facebook') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
          <Facebook className="w-3.5 h-3.5" /> Facebook
        </span>
      );
    }
    return null;
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative w-full max-w-md mx-auto h-[calc(100vh-125px)] bg-[#090714] overflow-hidden flex flex-col select-none border-x border-purple-900/30"
    >
      {/* Unified Platform Filter Bar */}
      <div className="relative z-20 px-2.5 pt-2 pb-1 bg-gradient-to-b from-[#090714] via-[#090714]/90 to-transparent">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All', icon: Layers, count: reels.length },
            { id: 'youtube', label: 'YouTube', icon: Youtube, count: reels.filter((r) => r.platform === 'youtube').length },
            { id: 'instagram', label: 'Instagram', icon: Instagram, count: reels.filter((r) => r.platform === 'instagram').length },
            { id: 'facebook', label: 'Facebook', icon: Facebook, count: reels.filter((r) => r.platform === 'facebook').length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                id={`reel-filter-${tab.id}`}
                onClick={() => handleFilterChange(tab.id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.6)] scale-102'
                    : 'bg-black/60 text-slate-300 hover:text-white border border-purple-900/40 backdrop-blur-md'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-pink-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[9px] px-1 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-purple-950 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Background / Video Player Section */}
      <div className="absolute inset-0 z-0 bg-black">
        {currentReel ? (
          <iframe
            src={getEmbedUrl(currentReel)}
            allowFullScreen
            allow="autoplay; encrypted-media"
            style={{ width: '100%', height: '100%', border: 0 }}
            title={currentReel.title}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
            <Flame className="w-12 h-12 text-pink-500 animate-pulse mb-3" />
            <p className="text-white font-bold">No Reels Available</p>
            <button
              onClick={() => handleFilterChange('all')}
              className="mt-3 px-4 py-1.5 rounded-xl bg-pink-500 text-white text-xs font-bold"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090714] via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      )}

      {/* Floating Heart Animation on Double Tap / Like */}
      {showHeartAnim && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="animate-ping scale-150">
            <Heart className="w-24 h-24 fill-pink-500 text-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.9)]" />
          </div>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="relative z-10 flex items-center justify-between p-3 pt-1">
        <div className="flex items-center gap-2">
          {renderPlatformBadge()}
          <span className="text-[11px] font-mono text-slate-300 bg-black/60 border border-purple-900/40 px-2 py-0.5 rounded-full backdrop-blur-md">
            {safeIndex + 1} / {filteredReels.length}
          </span>
        </div>
      </div>

      {/* Middle Tap Area for prev/next and double-tap */}
      <div className="relative z-10 flex-1 flex pointer-events-none">
        <div className="w-1/4 h-full cursor-pointer pointer-events-auto" onClick={handlePrev} title="Previous Reel" />
        <div className="w-1/2 h-full cursor-pointer pointer-events-auto" onDoubleClick={handleLike} title="Double tap to like" />
        <div className="w-1/4 h-full cursor-pointer pointer-events-auto" onClick={handleNext} title="Next Reel" />
      </div>

      {/* Floating Vertical Navigation Quick Buttons */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        <button
          id="reels-prev-vertical-btn"
          onClick={handlePrev}
          className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-purple-900/50 hover:bg-pink-600/80 hover:scale-110 transition-all shadow-md"
          title="Previous Reel (Up Arrow)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="w-1 h-6 rounded-full bg-purple-900/60" />
        <button
          id="reels-next-vertical-btn"
          onClick={handleNext}
          className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-purple-900/50 hover:bg-pink-600/80 hover:scale-110 transition-all shadow-md"
          title="Next Reel (Down Arrow)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Right Side Interaction Bar */}
      {currentReel && (
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3.5 pointer-events-auto">
          {/* Like */}
          <button
            id="reels-view-like-btn"
            onClick={handleLike}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className={`p-3 rounded-full backdrop-blur-md transition-all ${
                isLiked
                  ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.8)] scale-110'
                  : 'bg-black/50 text-white group-hover:bg-black/70 border border-white/10'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-semibold text-white drop-shadow">
              {isLiked ? 'Liked' : 'Like'}
            </span>
          </button>

          {/* Comment */}
          <button
            id="reels-view-comment-btn"
            onClick={() => setIsCommentsOpen(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white group-hover:bg-black/70 border border-white/10 transition-all">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-white drop-shadow">
              {currentComments.length > 0 ? currentComments.length : 'Chat'}
            </span>
          </button>

          {/* Share */}
          <button
            id="reels-view-share-btn"
            onClick={() => {
              if (navigator.clipboard) navigator.clipboard.writeText(getEmbedUrl(currentReel));
              onShowToast('Reel embed link copied! 🔗');
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white group-hover:bg-black/70 border border-white/10 transition-all">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-white drop-shadow">Share</span>
          </button>
        </div>
      )}

      {/* Bottom Metadata & Creator Bar */}
      {currentReel && (
        <div className="relative z-10 p-4 pb-3 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar
                name={currentReel.username}
                size="sm"
              />
              <div className="min-w-0">
                <span className="font-semibold text-white text-sm truncate block">
                  {currentReel.username}
                </span>
              </div>
            </div>

            <button
              id="reels-view-follow-btn"
              onClick={() => toggleFollow(currentReel.username)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                isFollowing
                  ? 'bg-purple-900/60 border border-purple-500/50 text-purple-200'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3 h-3" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3" />
                  <span>Follow</span>
                </>
              )}
            </button>
          </div>

          {/* Title */}
          <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
            {currentReel.title}
          </p>

          {/* Bottom vertical navigation hint & buttons */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs text-slate-400">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 hover:text-pink-400 transition-colors"
            >
              <ChevronUp className="w-4 h-4" /> Prev Reel
            </button>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Swipe / Arrow keys</span>
            </span>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 hover:text-pink-400 transition-colors"
            >
              Next Reel <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Comments Drawer */}
      {isCommentsOpen && currentReel && (
        <div className="absolute inset-x-0 bottom-0 z-30 max-h-[60%] bg-[#0c081d]/95 backdrop-blur-xl rounded-t-3xl border-t border-purple-800/60 p-4 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 pointer-events-auto">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/50">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-pink-400" />
              Comments ({currentComments.length})
            </span>
            <button
              onClick={() => setIsCommentsOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {currentComments.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">
                No comments yet. Be the first to chime in!
              </p>
            ) : (
              currentComments.map((c) => (
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

          <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
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
