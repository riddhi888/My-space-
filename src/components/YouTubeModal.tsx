import React, { useState } from 'react';
import { X, Play, ThumbsUp, Share2, Youtube, Clock, Eye, Radio, ExternalLink, Sparkles } from 'lucide-react';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

interface YouTubeItem {
  id: string;
  youtubeId: string;
  isShort?: boolean;
  title: string;
  channel: string;
  views: string;
  timeAgo: string;
  duration: string;
  thumbnail: string;
  isLive?: boolean;
}

const mockVideos: YouTubeItem[] = [
  {
    id: 'yt_short_1',
    youtubeId: '5qap5aO4i9A',
    isShort: true,
    title: 'Neon Synthwave City Lights Driving [YouTube Shorts]',
    channel: 'CyberVision Shorts',
    views: '2.4M views',
    timeAgo: 'Just now',
    duration: '0:45',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'yt_short_2',
    youtubeId: 'kJQP7kiw5Fk',
    isShort: true,
    title: 'Retro CRT Arcade Cabinet Light Up [YouTube Shorts]',
    channel: 'Arcade Revival',
    views: '1.2M views',
    timeAgo: '1 day ago',
    duration: '0:58',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'yt_1',
    youtubeId: 'jfKfPfyJRdk',
    title: 'Neon Tokyo 2088: 4K Ambient Cyberpunk Walk in Heavy Rain (Synthwave Beats)',
    channel: 'CyberVision 4K',
    views: '1.8M views',
    timeAgo: '2 days ago',
    duration: '2:15:00',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    isLive: true,
  },
  {
    id: 'yt_2',
    youtubeId: '4xDzrJKXOOY',
    title: 'How to Build an 80s Analog Synthesizer Lead from Scratch [Tutorial]',
    channel: 'Modular Retro Lab',
    views: '340K views',
    timeAgo: '1 week ago',
    duration: '18:24',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'yt_3',
    youtubeId: 'FTQbiNvZqaY',
    title: 'Top 10 Retro Cyber Games that Defined the Aesthetic Era',
    channel: 'Arcade Chronicles',
    views: '890K views',
    timeAgo: '3 weeks ago',
    duration: '24:10',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  },
];

export const YouTubeModal: React.FC<YouTubeModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'shorts'>('all');
  const [activeVideo, setActiveVideo] = useState<YouTubeItem>(mockVideos[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!isOpen) return null;

  const displayVideos = mockVideos.filter((v) => {
    if (activeTab === 'shorts') return v.isShort;
    return true;
  });

  const originalUrl = activeVideo.isShort
    ? `https://www.youtube.com/shorts/${activeVideo.youtubeId}`
    : `https://www.youtube.com/watch?v=${activeVideo.youtubeId}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-[#0e0a1f] border border-purple-800/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900/30 bg-[#090714]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.6)]">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-base">YouTube & Shorts Hub</span>
              <p className="text-[11px] text-cyan-400">Play inside MySpace with external fallback</p>
            </div>
          </div>
          <button
            id="close-youtube-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-purple-900/40 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Stage */}
        <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
          {isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&mute=0&controls=1&playsinline=1`}
              title={activeVideo.title}
              className="w-full h-full object-cover"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={activeVideo.thumbnail}
                alt={activeVideo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover brightness-75"
              />
              <button
                id="yt-play-video-btn"
                onClick={() => setIsPlaying(true)}
                className="absolute z-10 w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.8)] hover:scale-110 transition-transform cursor-pointer"
              >
                <Play className="w-7 h-7 fill-white ml-1" />
              </button>
            </>
          )}

          {activeVideo.isShort && (
            <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded bg-red-600/90 text-[10px] font-bold text-white tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" /> SHORTS
            </span>
          )}

          {activeVideo.isLive && (
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-red-600 text-[10px] font-bold text-white tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 animate-ping" /> LIVE
            </span>
          )}

          {!isPlaying && (
            <span className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded bg-black/75 text-[11px] font-mono text-white">
              {activeVideo.duration}
            </span>
          )}
        </div>

        {/* Video Info & Action Row */}
        <div className="p-3.5 border-b border-purple-900/30 bg-[#120b29]">
          <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug">
            {activeVideo.title}
          </h3>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 font-medium">{activeVideo.channel}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {activeVideo.views}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                id="yt-like-btn"
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all text-xs font-semibold ${
                  liked
                    ? 'bg-pink-600 text-white border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                    : 'bg-purple-950/60 text-slate-300 border-purple-800/40 hover:text-white'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-white' : ''}`} />
                <span>{liked ? 'Liked' : 'Like'}</span>
              </button>

              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 hover:text-white hover:bg-red-600 text-xs font-semibold transition-all"
                title="Open on YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>YouTube</span>
              </a>

              <button
                id="yt-share-btn"
                onClick={() => (onShowToast ? onShowToast('Video shared to your MySpace status!') : null)}
                className="p-1.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-slate-300 hover:text-white"
                title="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab switcher: All vs Shorts */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-1 border-b border-purple-900/20 bg-[#0e0a1f]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Videos ({mockVideos.length})
          </button>
          <button
            onClick={() => setActiveTab('shorts')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
              activeTab === 'shorts'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Shorts ({mockVideos.filter((v) => v.isShort).length})</span>
          </button>
        </div>

        {/* Recommended Videos List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
          {displayVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => {
                setActiveVideo(video);
                setIsPlaying(true);
              }}
              className={`flex gap-3 p-2 rounded-2xl cursor-pointer transition-all ${
                activeVideo.id === video.id
                  ? 'bg-purple-900/40 border border-pink-500/40 shadow-sm'
                  : 'hover:bg-purple-950/40 border border-transparent'
              }`}
            >
              <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {video.isShort && (
                  <span className="absolute top-1 left-1 px-1 rounded bg-red-600 text-[8px] font-bold text-white">
                    SHORTS
                  </span>
                )}
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono text-white">
                  {video.duration}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-white line-clamp-2 group-hover:text-pink-300">
                  {video.title}
                </h4>
                <p className="text-[11px] text-pink-400 mt-0.5">{video.channel}</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {video.timeAgo}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
