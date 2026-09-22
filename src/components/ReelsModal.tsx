import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Music,
  Flame,
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  Code,
  RefreshCw,
  Info,
  Youtube,
  Instagram,
  Facebook,
} from 'lucide-react';
import { Reel } from '../types';
import {
  shareReel,
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getInstagramEmbedUrl,
  getInstagramEmbedCode,
  getFacebookEmbedUrl,
} from '../utils/reelsHelper';
import { fetchYouTubeShorts } from '../services/youtubeShortsService';

interface CommentItem {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

interface ReelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reels: Reel[];
  initialReelIndex?: number;
  initialPlatform?: 'all' | 'youtube' | 'instagram' | 'facebook';
  onShareReel?: (reel: Reel) => void;
}

export const ReelsModal: React.FC<ReelsModalProps> = ({
  isOpen,
  onClose,
  reels: initialReels,
  initialReelIndex = 0,
  initialPlatform = 'all',
  onShareReel,
}) => {
  const [activePlatformFilter, setActivePlatformFilter] = useState<'all' | 'youtube' | 'instagram' | 'facebook'>(initialPlatform);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [allReels, setAllReels] = useState<Reel[]>(initialReels);
  const [isFetchingShorts, setIsFetchingShorts] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // In-app comment drawer state
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({});
  const [commentInput, setCommentInput] = useState('');

  // Fallback embed code modal state for Instagram/Facebook
  const [showEmbedCodeId, setShowEmbedCodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update initial platform when opened
  useEffect(() => {
    if (isOpen) {
      if (initialPlatform) {
        setActivePlatformFilter(initialPlatform);
      }
    }
  }, [isOpen, initialPlatform]);

  // Fetch YouTube Shorts on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadShorts = async () => {
      setIsFetchingShorts(true);
      try {
        const ytShorts = await fetchYouTubeShorts();
        if (!isMounted) return;

        // Merge fetched YouTube Shorts with existing reels avoiding duplicates
        setAllReels((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const newYt = ytShorts.filter((s) => !existingIds.has(s.id));
          return [...prev, ...newYt];
        });
      } catch (err) {
        console.warn('Error loading shorts in modal:', err);
      } finally {
        if (isMounted) setIsFetchingShorts(false);
      }
    };

    loadShorts();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Filtered reels based on active platform tab
  const displayReels = allReels.filter((r) => {
    if (activePlatformFilter === 'all') return true;
    if (activePlatformFilter === 'youtube') return r.platform === 'youtube' || Boolean(extractYouTubeId(r.videoUrl || r.externalUrl || ''));
    if (activePlatformFilter === 'instagram') return r.platform === 'instagram';
    if (activePlatformFilter === 'facebook') return r.platform === 'facebook';
    return true;
  });

  // Reset or adjust index when filter changes or when opened
  useEffect(() => {
    if (isOpen) {
      const targetIndex = initialReelIndex < displayReels.length ? initialReelIndex : 0;
      setActiveReelIndex(targetIndex);
      // Scroll container to the selected reel
      setTimeout(() => {
        if (reelRefs.current[targetIndex] && containerRef.current) {
          reelRefs.current[targetIndex]?.scrollIntoView({ behavior: 'auto' });
        }
      }, 50);
    }
  }, [isOpen, activePlatformFilter]);

  // IntersectionObserver to detect which reel is actively snapped into view
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const handleScroll = () => {
      const containerTop = container.scrollTop;
      const height = container.clientHeight;
      if (height <= 0) return;
      const newIndex = Math.round(containerTop / height);
      if (newIndex >= 0 && newIndex < displayReels.length && newIndex !== activeReelIndex) {
        setActiveReelIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen, displayReels.length, activeReelIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        scrollDown();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        scrollUp();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'm') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeReelIndex, displayReels.length]);

  if (!isOpen) return null;

  const scrollUp = () => {
    if (activeReelIndex > 0) {
      const prevIdx = activeReelIndex - 1;
      reelRefs.current[prevIdx]?.scrollIntoView({ behavior: 'smooth' });
      setActiveReelIndex(prevIdx);
    }
  };

  const scrollDown = () => {
    if (activeReelIndex < displayReels.length - 1) {
      const nextIdx = activeReelIndex + 1;
      reelRefs.current[nextIdx]?.scrollIntoView({ behavior: 'smooth' });
      setActiveReelIndex(nextIdx);
    }
  };

  const handleLike = (reel: Reel) => {
    const wasLiked = likedMap[reel.id];
    setLikedMap((prev) => ({
      ...prev,
      [reel.id]: !wasLiked,
    }));

    setLikeCountMap((prev) => {
      const current = prev[reel.id] ?? parseInt(reel.likes.replace(/[^0-9]/g, '') || '50', 10);
      return {
        ...prev,
        [reel.id]: wasLiked ? Math.max(0, current - 1) : current + 1,
      };
    });

    if (!wasLiked) {
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    }
  };

  const handleShareClick = async (reel: Reel) => {
    const reelLink = reel.videoUrl || reel.externalUrl || `https://myspace.app/reels/${reel.id}`;
    await shareReel(reelLink);
    if (onShareReel) {
      onShareReel(reel);
    }
  };

  const handleAddComment = (reelId: string) => {
    if (!commentInput.trim()) return;

    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      user: 'You',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80',
      text: commentInput.trim(),
      time: 'Just now',
    };

    setCommentsMap((prev) => ({
      ...prev,
      [reelId]: [newComment, ...(prev[reelId] || [])],
    }));

    setCommentInput('');
  };

  const currentReel = displayReels[activeReelIndex] || displayReels[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center p-0 sm:p-3 select-none">
      {/* Container simulating high-end mobile vertical device frame */}
      <div className="relative w-full h-full max-w-md bg-[#070510] overflow-hidden flex flex-col sm:rounded-3xl border border-purple-800/40 shadow-[0_0_60px_rgba(168,85,247,0.35)]">
        {/* Floating Heart Animation on Double Tap / Like */}
        {showHeartAnim && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="animate-ping scale-150">
              <Heart className="w-28 h-28 fill-pink-500 text-pink-400 drop-shadow-[0_0_30px_rgba(236,72,153,1)]" />
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-30 flex flex-col gap-2 p-3 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-[11px] font-extrabold text-white tracking-wider flex items-center gap-1 shadow-lg shadow-pink-500/40">
                <Flame className="w-3.5 h-3.5 fill-white" />
                WATCH REELS
              </span>
              <span className="text-[11px] text-slate-300 font-mono bg-black/50 px-2 py-0.5 rounded-full border border-white/10">
                {displayReels.length > 0 ? `${activeReelIndex + 1}/${displayReels.length}` : '0/0'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="reel-mute-toggle-btn"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-purple-900/60 transition-colors border border-white/15"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
              </button>

              <button
                id="reel-close-modal-btn"
                onClick={onClose}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-pink-600 transition-colors border border-white/15"
                title="Close Reels"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Platform Filter Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            <button
              id="reels-filter-all"
              onClick={() => setActivePlatformFilter('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                activePlatformFilter === 'all'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30'
                  : 'bg-black/50 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Flame className="w-3 h-3 text-pink-400" />
              All
            </button>

            <button
              id="reels-filter-youtube"
              onClick={() => setActivePlatformFilter('youtube')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                activePlatformFilter === 'youtube'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'bg-black/50 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Youtube className="w-3 h-3 text-red-500" />
              YouTube Shorts
            </button>

            <button
              id="reels-filter-instagram"
              onClick={() => setActivePlatformFilter('instagram')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                activePlatformFilter === 'instagram'
                  ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-md shadow-pink-500/40'
                  : 'bg-black/50 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Instagram className="w-3 h-3 text-pink-400" />
              Instagram
            </button>

            <button
              id="reels-filter-facebook"
              onClick={() => setActivePlatformFilter('facebook')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                activePlatformFilter === 'facebook'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                  : 'bg-black/50 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Facebook className="w-3 h-3 text-blue-400" />
              Facebook
            </button>
          </div>
        </div>

        {/* Vertical Swipeable Scroll-Snap Viewport */}
        <div
          ref={containerRef}
          className="relative w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        >
          {displayReels.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3">
              <Flame className="w-12 h-12 text-pink-500/40 animate-pulse" />
              <p className="text-sm font-semibold text-white">No reels found in this channel</p>
              <p className="text-xs text-slate-400">Switch channel filter above or load more shorts</p>
              <button
                onClick={() => setActivePlatformFilter('all')}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all"
              >
                Show All Reels
              </button>
            </div>
          ) : (
            displayReels.map((reel, index) => {
              const isActive = index === activeReelIndex;
              const shortsId = extractYouTubeId(reel.videoUrl || reel.externalUrl || '');
              const isYouTube = reel.platform === 'youtube' || Boolean(shortsId);
              const isInstagram = reel.platform === 'instagram';
              const isFacebook = reel.platform === 'facebook';

              const isLiked = likedMap[reel.id] ?? false;
              const comments = commentsMap[reel.id] || [];
              const rawLikes = likeCountMap[reel.id] ?? reel.likes;

              return (
                <div
                  key={reel.id}
                  ref={(el) => {
                    reelRefs.current[index] = el;
                  }}
                  className="w-full h-full snap-start snap-always relative shrink-0 flex flex-col justify-between overflow-hidden bg-black"
                >
                  {/* Background / Embed Canvas */}
                  <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
                    {isYouTube && shortsId ? (
                      /* YouTube Shorts Embed - autoplays when active */
                      <div className="w-full h-full bg-black relative flex items-center justify-center">
                        <iframe
                          src={getYouTubeEmbedUrl(shortsId, {
                            autoplay: isActive,
                            muted: isMuted,
                            loop: true,
                          })}
                          title={reel.caption}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full border-0 pointer-events-auto"
                          id={`shorts-embed-${reel.id}`}
                        />
                      </div>
                    ) : isInstagram ? (
                      /* Instagram In-App Embed via oEmbed / embed URL */
                      <div className="w-full h-full bg-[#0a0714] relative flex items-center justify-center overflow-hidden">
                        <iframe
                          src={getInstagramEmbedUrl(reel.videoUrl || reel.externalUrl || '')}
                          title={reel.caption}
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          scrolling="no"
                          className="w-full h-full border-0 bg-black"
                          id={`insta-embed-${reel.id}`}
                        />
                        {/* In-app fallback code drawer toggle */}
                        <div className="absolute top-24 left-3 z-10">
                          <button
                            onClick={() => setShowEmbedCodeId(showEmbedCodeId === reel.id ? null : reel.id)}
                            className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-pink-300 text-[10px] font-mono border border-pink-500/30 flex items-center gap-1 shadow-md"
                            title="Show embed code fallback"
                          >
                            <Code className="w-3 h-3 text-pink-400" />
                            <span>Embed Code</span>
                          </button>
                        </div>
                      </div>
                    ) : isFacebook ? (
                      /* Facebook In-App Embedded Video Player */
                      <div className="w-full h-full bg-[#070b18] relative flex items-center justify-center overflow-hidden">
                        <iframe
                          src={getFacebookEmbedUrl(reel.videoUrl || reel.externalUrl || '')}
                          title={reel.caption}
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full border-0 bg-black"
                          id={`fb-embed-${reel.id}`}
                        />
                        {/* In-app fallback code drawer toggle */}
                        <div className="absolute top-24 left-3 z-10">
                          <button
                            onClick={() => setShowEmbedCodeId(showEmbedCodeId === reel.id ? null : reel.id)}
                            className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-blue-300 text-[10px] font-mono border border-blue-500/30 flex items-center gap-1 shadow-md"
                            title="Show embed code fallback"
                          >
                            <Code className="w-3 h-3 text-blue-400" />
                            <span>Embed Code</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Default video / animated fallback */
                      <div className="relative w-full h-full">
                        {reel.videoThumbnail && (
                          <img
                            src={reel.videoThumbnail}
                            alt={reel.caption}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover filter brightness-90"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
                      </div>
                    )}
                  </div>

                  {/* Fallback Embed Code Viewer Box */}
                  {showEmbedCodeId === reel.id && (
                    <div className="absolute inset-x-4 top-28 z-30 p-4 rounded-2xl bg-[#120a26]/95 border border-purple-700/60 shadow-2xl backdrop-blur-md space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5" /> In-App Embed Code
                        </span>
                        <button
                          onClick={() => setShowEmbedCodeId(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={
                          isInstagram
                            ? getInstagramEmbedCode(reel.videoUrl || reel.externalUrl || '')
                            : `<iframe src="${getFacebookEmbedUrl(reel.videoUrl || reel.externalUrl || '')}" width="100%" height="450" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`
                        }
                        rows={3}
                        className="w-full p-2 rounded-xl bg-black/80 border border-purple-900/60 text-[10px] font-mono text-cyan-300 select-all"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Plays directly inside MySpace app</span>
                        <button
                          onClick={() => {
                            const code = isInstagram
                              ? getInstagramEmbedCode(reel.videoUrl || reel.externalUrl || '')
                              : `<iframe src="${getFacebookEmbedUrl(reel.videoUrl || reel.externalUrl || '')}" width="100%" height="450" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
                            navigator.clipboard?.writeText(code);
                            alert('Embed code copied!');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-[10px]"
                        >
                          Copy HTML
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Up / Down navigation arrows (visible on hover / desktop) */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 hidden sm:flex flex-col gap-2">
                    <button
                      onClick={scrollUp}
                      disabled={index === 0}
                      className="p-2 rounded-full bg-black/60 hover:bg-purple-900/80 text-white disabled:opacity-30 disabled:pointer-events-none transition-all border border-white/10 shadow-lg"
                      title="Previous Reel (Arrow Up)"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={scrollDown}
                      disabled={index === displayReels.length - 1}
                      className="p-2 rounded-full bg-black/60 hover:bg-purple-900/80 text-white disabled:opacity-30 disabled:pointer-events-none transition-all border border-white/10 shadow-lg"
                      title="Next Reel (Arrow Down)"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right Side Interaction Bar: Like, Comment, Share, Mute */}
                  <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3.5">
                    {/* Like Button */}
                    <button
                      id={`reel-like-${reel.id}`}
                      onClick={() => handleLike(reel)}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div
                        className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${
                          isLiked
                            ? 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-pink-500/60 scale-110'
                            : 'bg-black/50 text-white group-hover:bg-black/70 border border-white/15'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-white text-white' : 'text-slate-200'}`} />
                      </div>
                      <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        {rawLikes}
                      </span>
                    </button>

                    {/* Comment Button */}
                    <button
                      id={`reel-comment-${reel.id}`}
                      onClick={() => setIsCommentDrawerOpen(true)}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white group-hover:bg-purple-900/60 transition-all border border-white/15 shadow-lg">
                        <MessageCircle className="w-5 h-5 text-cyan-300" />
                      </div>
                      <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        {comments.length > 0 ? comments.length : reel.comments}
                      </span>
                    </button>

                    {/* Share Button */}
                    <button
                      id={`reel-share-${reel.id}`}
                      onClick={() => handleShareClick(reel)}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white group-hover:bg-purple-900/60 transition-all border border-white/15 shadow-lg">
                        <Share2 className="w-5 h-5 text-purple-300" />
                      </div>
                      <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        Share
                      </span>
                    </button>

                    {/* Platform Badge */}
                    <div className="mt-1">
                      {isYouTube ? (
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 text-white" title="YouTube Shorts">
                          <Youtube className="w-4 h-4" />
                        </div>
                      ) : isInstagram ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-700 flex items-center justify-center shadow-lg shadow-pink-600/40 text-white" title="Instagram Reel">
                          <Instagram className="w-4 h-4" />
                        </div>
                      ) : isFacebook ? (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 text-white" title="Facebook Reel">
                          <Facebook className="w-4 h-4" />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Bottom Metadata Panel */}
                  <div className="relative z-10 p-4 pb-6 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-auto">
                    {/* Creator Row */}
                    <div className="flex items-center gap-2.5 mb-2">
                      {reel.creator.avatar ? (
                        <img
                          src={reel.creator.avatar}
                          alt={reel.creator.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full border-2 border-pink-500 object-cover shrink-0 shadow-md"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full border-2 border-pink-500 bg-purple-950 flex items-center justify-center text-pink-300 font-bold font-mono text-xs shrink-0">
                          {reel.creator.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm truncate">
                            {reel.creator.name}
                          </span>
                          <span className="text-[11px] text-pink-400 font-mono truncate">
                            {reel.creator.handle}
                          </span>
                        </div>
                        {reel.audioTrack && (
                          <p className="text-[11px] text-cyan-300 flex items-center gap-1 mt-0.5 truncate">
                            <Music className="w-3 h-3 text-cyan-400 shrink-0 animate-spin" />
                            <span className="truncate">{reel.audioTrack}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Caption */}
                    <p className="text-xs sm:text-sm text-slate-100 line-clamp-2 leading-relaxed font-medium drop-shadow">
                      {reel.caption}
                    </p>

                    {/* Hashtags */}
                    {reel.tags && reel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {reel.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-semibold text-pink-400/90 hover:text-pink-300 cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* In-App Comments Drawer */}
        {isCommentDrawerOpen && currentReel && (
          <div className="absolute inset-x-0 bottom-0 z-40 max-h-[65%] h-[60%] bg-[#0f0923] border-t border-purple-700/60 rounded-t-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-purple-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-bold text-white">
                  Comments ({commentsMap[currentReel.id]?.length || currentReel.comments})
                </h4>
              </div>
              <button
                onClick={() => setIsCommentDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {/* Pre-populated or user comments */}
              {(commentsMap[currentReel.id] || []).length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                  <p className="text-slate-300 font-semibold">Be the first to drop a 2008 comment!</p>
                  <p className="text-[11px] text-pink-400/80">Support {currentReel.creator.name} with neon vibes 💜</p>
                </div>
              ) : (
                (commentsMap[currentReel.id] || []).map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 p-2 rounded-2xl bg-purple-950/30 border border-purple-900/30">
                    <img
                      src={c.avatar}
                      alt={c.user}
                      className="w-7 h-7 rounded-full object-cover border border-pink-500/50 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-pink-300">{c.user}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{c.time}</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input Bar */}
            <div className="p-3 border-t border-purple-900/40 bg-black/60 flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment(currentReel.id);
                }}
                placeholder="Add a comment to this reel..."
                className="flex-1 bg-purple-950/40 border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={() => handleAddComment(currentReel.id)}
                disabled={!commentInput.trim()}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-pink-500/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
