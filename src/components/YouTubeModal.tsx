import React, { useState } from 'react';
import { X, Play, ThumbsUp, Share2, Youtube, Clock, Eye, Radio } from 'lucide-react';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

interface YouTubeItem {
  id: string;
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
    id: 'yt_1',
    title: 'Neon Tokyo 2088: 4K Ambient Cyberpunk Walk in Heavy Rain (Synthwave Beats)',
    channel: 'CyberVision 4K',
    views: '1.8M views',
    timeAgo: '2 days ago',
    duration: '2:15:00',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    isLive: true,
  },
  {
    id: 'yt_2',
    title: 'How to Build an 80s Analog Synthesizer Lead from Scratch [Tutorial]',
    channel: 'Modular Retro Lab',
    views: '340K views',
    timeAgo: '1 week ago',
    duration: '18:24',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'yt_3',
    title: 'Top 10 Retro Cyber Games that Defined the Aesthetic Era',
    channel: 'Arcade Chronicles',
    views: '890K views',
    timeAgo: '3 weeks ago',
    duration: '24:10',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  },
];

export const YouTubeModal: React.FC<YouTubeModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [activeVideo, setActiveVideo] = useState<YouTubeItem>(mockVideos[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!isOpen) return null;

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
              <span className="font-display font-bold text-white text-base">YouTube Hub</span>
              <p className="text-[11px] text-cyan-400">Trending Neon Streams</p>
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

        {/* Video Player Preview Stage */}
        <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
          <img
            src={activeVideo.thumbnail}
            alt={activeVideo.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-all duration-500 ${isPlaying ? 'brightness-100 scale-105' : 'brightness-75'}`}
          />

          {/* Playing overlay animation / play button */}
          {!isPlaying ? (
            <button
              id="yt-play-video-btn"
              onClick={() => setIsPlaying(true)}
              className="absolute z-10 w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.8)] hover:scale-110 transition-transform cursor-pointer"
            >
              <Play className="w-7 h-7 fill-white ml-1" />
            </button>
          ) : (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-between p-3 pointer-events-none">
              <div className="w-full flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <Radio className="w-3 h-3" /> STREAMING
                </span>
                <span className="text-xs text-white/80 font-mono">1080p • 60fps</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1 items-end h-8">
                  {[40, 70, 30, 90, 60, 80, 45, 95, 30, 85].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-pink-500 to-cyan-400 rounded-full animate-pulse"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-cyan-300 drop-shadow">Simulated Stream Audio Active</p>
              </div>
              {/* Progress bar */}
              <div className="w-full">
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-2/5 h-full bg-red-600 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {activeVideo.isLive && (
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-red-600 text-[10px] font-bold text-white tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 animate-ping" /> LIVE
            </span>
          )}

          <span className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded bg-black/75 text-[11px] font-mono text-white">
            {activeVideo.duration}
          </span>
        </div>

        {/* Video Info */}
        <div className="p-4 border-b border-purple-900/30">
          <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug">
            {activeVideo.title}
          </h3>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 font-medium">{activeVideo.channel}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {activeVideo.views}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                id="yt-like-btn"
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all ${
                  liked
                    ? 'bg-pink-600 text-white border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                    : 'bg-purple-950/60 text-slate-300 border-purple-800/40 hover:text-white'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-white' : ''}`} />
                <span>{liked ? 'Liked' : 'Like'}</span>
              </button>
              <button
                id="yt-share-btn"
                onClick={() => onShowToast ? onShowToast('Video shared to your MySpace status!') : null}
                className="p-1.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-slate-300 hover:text-white"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Videos List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Up Next / Trending
          </p>
          {mockVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => {
                setActiveVideo(video);
                setIsPlaying(true);
              }}
              className={`flex gap-3 p-2 rounded-2xl cursor-pointer transition-all ${
                activeVideo.id === video.id
                  ? 'bg-purple-900/40 border border-pink-500/30'
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
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono text-white">
                  {video.duration}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-white line-clamp-2 group-hover:text-pink-300">
                  {video.title}
                </h4>
                <p className="text-[11px] text-pink-400 mt-1">{video.channel}</p>
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
