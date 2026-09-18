import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Volume2, VolumeX, Disc } from 'lucide-react';
import { MusicTrack } from '../types';

interface MusicCardProps {
  tracks: MusicTrack[];
}

export const MusicCard: React.FC<MusicCardProps> = ({ tracks }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(25);
  const [isMuted, setIsMuted] = useState(false);

  const track = tracks[currentTrackIndex] || tracks[0];

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentTrackIndex((idx) => (idx + 1) % tracks.length);
            return 0;
          }
          return prev + 1;
        });
      }, 600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, tracks.length]);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-[#1b1236]/90 via-[#140f2b]/90 to-[#0e0921]/90 border border-purple-800/40 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
      {/* Background neon ambient blur */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center gap-3.5">
        {/* Track Cover with rotating vinyl effect */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
          <img
            src={track.cover}
            alt={track.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : ''}`}
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-1 right-1">
            <Disc className={`w-4 h-4 text-pink-400 ${isPlaying ? 'animate-spin' : ''}`} />
          </div>
        </div>

        {/* Title, Artist & Animated Visualizer */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-pink-400 tracking-wider uppercase flex items-center gap-1">
              <Music className="w-3 h-3" /> Cyber Radio
            </span>
            {/* Visualizer bars */}
            <div className="flex items-end gap-0.5 h-3.5">
              {[40, 80, 25, 100, 60, 90, 45, 75].map((val, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-full bg-gradient-to-t from-pink-500 to-cyan-400 transition-all duration-300 ${
                    isPlaying ? 'animate-pulse' : 'opacity-40'
                  }`}
                  style={{
                    height: isPlaying ? `${val}%` : '25%',
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          </div>

          <h4 className="font-semibold text-white text-sm truncate mt-0.5">
            {track.title}
          </h4>
          <p className="text-xs text-cyan-300 truncate">
            {track.artist}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 relative">
        <div
          className="h-1.5 w-full bg-purple-950/80 rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            setProgress(Math.round(clickPos * 100));
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>0:{String(Math.floor((progress / 100) * 45)).padStart(2, '0')}</span>
          <span>{track.duration}</span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-between mt-2 pt-1 border-t border-purple-900/30">
        <button
          id="music-mute-toggle-btn"
          onClick={() => setIsMuted(!isMuted)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/30 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        <div className="flex items-center gap-3">
          <button
            id="music-prev-track-btn"
            onClick={handlePrev}
            className="p-1.5 text-slate-300 hover:text-pink-400 transition-colors"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            id="music-play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.6)] hover:scale-105 transition-transform"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          <button
            id="music-next-track-btn"
            onClick={handleNext}
            className="p-1.5 text-slate-300 hover:text-pink-400 transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <span className="text-[11px] font-mono text-pink-400 px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
          TRACK {currentTrackIndex + 1}/{tracks.length}
        </span>
      </div>
    </div>
  );
};
