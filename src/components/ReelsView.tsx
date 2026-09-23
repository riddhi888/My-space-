import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Music,
  Flame,
  UserPlus,
  UserCheck,
  Send,
  Loader2,
  AlertCircle,
  RotateCcw,
  Youtube,
  Instagram,
  Facebook,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Reel } from '../types';
import { UserAvatar } from './UserAvatar';

interface ReelsViewProps {
  reels: Reel[];
  onShowToast: (msg: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({ reels, onShowToast }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, { id: string; user: string; text: string; time: string; avatar: string }[]>>({
    reel_yt_1: [
      { id: 'c1', user: 'Tom Anderson', text: 'This synth bass line is incredible! ⚡', time: '10m ago', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
      { id: 'c2', user: 'Sarah Jenkins', text: 'Night driving vibes forever 🌌', time: '25m ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
    ],
    reel_ig_2: [
      { id: 'c3', user: 'David Chen', text: 'The analog modular patch sounds so warm! 🎛️', time: '1h ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
    ],
  });
  const [hasVideoError, setHasVideoError] = useState(false);
  const touchStartY = useRef<number | null>(null);

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <Flame className="w-12 h-12 text-pink-500 animate-pulse mb-3" />
        <p className="text-white font-bold">No Reels Available</p>
      </div>
    );
  }

  const currentReel = reels[currentIndex];
  const isLiked = !!likedMap[currentReel.id];
  const isFollowing = !!followingMap[currentReel.creator.handle];
  const currentComments = commentsMap[currentReel.id] || [];

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

  const toggleFollow = (handle: string, name: string) => {
    setFollowingMap((prev) => {
      const next = !prev[handle];
      onShowToast(next ? `Now following ${name}!` : `Unfollowed ${name}`);
      return { ...prev, [handle]: next };
    });
  };

  const handleNext = () => {
    setHasVideoError(false);
    setCurrentIndex((prev) => (prev + 1) % reels.length);
  };

  const handlePrev = () => {
    setHasVideoError(false);
    setCurrentIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY < -50) handleNext();
    else if (deltaY > 50) handlePrev();
    touchStartY.current = null;
  };

  const handleAddComment = (e: React.FormEvent) => {
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
      [currentReel.id]: [newComment, ...(prev[currentReel.id] || [])],
    }));

    setCommentInput('');
    onShowToast('Comment posted! 💬');
  };

  const renderPlatformBadge = () => {
    if (currentReel.platform === 'youtube' || currentReel.youtubeShortsId) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-red-600/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
          <Youtube className="w-3 h-3" /> YouTube Shorts
        </span>
      );
    }
    if (currentReel.platform === 'instagram' || currentReel.instagramReelId) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
          <Instagram className="w-3 h-3" /> Instagram Reel
        </span>
      );
    }
    if (currentReel.platform === 'facebook' || currentReel.facebookReelId) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-blue-600/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
          <Facebook className="w-3 h-3" /> Facebook Reel
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-pink-500/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
        <Sparkles className="w-3 h-3" /> MySpace Reel
      </span>
    );
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative w-full max-w-md mx-auto h-[calc(100vh-125px)] bg-[#090714] overflow-hidden flex flex-col select-none border-x border-purple-900/30"
    >
      {/* Background / Video Player Section */}
      <div className="absolute inset-0 z-0 bg-black">
        {currentReel.youtubeShortsId && !hasVideoError ? (
          <iframe
            src={`https://www.youtube.com/embed/${currentReel.youtubeShortsId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${currentReel.youtubeShortsId}&controls=1`}
            title={currentReel.caption}
            className="w-full h-full object-cover"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onError={() => setHasVideoError(true)}
          />
        ) : currentReel.videoUrl && !hasVideoError ? (
          <video
            src={currentReel.videoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
            onError={() => setHasVideoError(true)}
          />
        ) : (
          <img
            src={currentReel.videoThumbnail}
            alt={currentReel.caption}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-90 transition-transform duration-700"
          />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090714] via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Floating Heart Animation on Double Tap / Like */}
      {showHeartAnim && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="animate-ping scale-150">
            <Heart className="w-24 h-24 fill-pink-500 text-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.9)]" />
          </div>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="relative z-10 flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-pink-500/80 backdrop-blur-md text-[11px] font-bold text-white tracking-wider flex items-center gap-1 shadow-lg shadow-pink-500/40">
            <Flame className="w-3.5 h-3.5 fill-white" />
            REELS
          </span>
          {renderPlatformBadge()}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-300 bg-black/40 px-2 py-0.5 rounded-full">
            {currentIndex + 1} / {reels.length}
          </span>
          <button
            id="reels-view-mute-btn"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
          </button>
        </div>
      </div>

      {/* Middle Tap Area for prev/next and double-tap */}
      <div className="relative z-10 flex-1 flex">
        <div className="w-1/4 h-full cursor-pointer" onClick={handlePrev} />
        <div className="w-1/2 h-full cursor-pointer" onDoubleClick={handleLike} />
        <div className="w-1/4 h-full cursor-pointer" onClick={handleNext} />
      </div>

      {/* Right Side Interaction Bar */}
      <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4">
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
                : 'bg-black/50 text-white group-hover:bg-black/70'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
          </div>
          <span className="text-xs font-semibold text-white drop-shadow">
            {isLiked ? 'Liked' : currentReel.likes}
          </span>
        </button>

        {/* Comment */}
        <button
          id="reels-view-comment-btn"
          onClick={() => setIsCommentsOpen(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white group-hover:bg-black/70 transition-all">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-white drop-shadow">
            {currentComments.length > 0 ? currentComments.length : currentReel.comments}
          </span>
        </button>

        {/* Share */}
        <button
          id="reels-view-share-btn"
          onClick={() => {
            if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
            onShowToast('Reel link copied! 🔗');
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white group-hover:bg-black/70 transition-all">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-white drop-shadow">Share</span>
        </button>
      </div>

      {/* Bottom Metadata & Creator Bar */}
      <div className="relative z-10 p-4 pb-4 bg-gradient-to-t from-black via-black/85 to-transparent">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar
              name={currentReel.creator.name}
              avatar={currentReel.creator.avatar}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-sm truncate">
                  {currentReel.creator.name}
                </span>
                <span className="text-xs text-pink-400 font-mono truncate">
                  {currentReel.creator.handle}
                </span>
              </div>
              <p className="text-[11px] text-cyan-300 flex items-center gap-1 mt-0.5 truncate">
                <Music className="w-3 h-3 text-cyan-400 animate-spin shrink-0" />
                <span className="truncate">{currentReel.audioTrack}</span>
              </p>
            </div>
          </div>

          <button
            id="reels-view-follow-btn"
            onClick={() => toggleFollow(currentReel.creator.handle, currentReel.creator.name)}
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

        <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
          {currentReel.caption}
        </p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs text-slate-400">
          <button onClick={handlePrev} className="flex items-center gap-1 hover:text-pink-400 transition-colors">
            <ChevronUp className="w-4 h-4" /> Prev Reel
          </button>
          <span className="text-[10px] text-slate-400">Swipe up/down</span>
          <button onClick={handleNext} className="flex items-center gap-1 hover:text-pink-400 transition-colors">
            Next Reel <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      {isCommentsOpen && (
        <div className="absolute inset-x-0 bottom-0 z-30 max-h-[60%] bg-[#0c081d]/95 backdrop-blur-xl rounded-t-3xl border-t border-purple-800/60 p-4 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/50">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-pink-400" />
              Comments ({currentComments.length})
            </span>
            <button
              onClick={() => setIsCommentsOpen(false)}
              className="text-slate-400 hover:text-white p-1 text-xs"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {currentComments.map((c) => (
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
            ))}
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
