import React from 'react';
import { Play, Pause, SkipForward, Disc, Music, Maximize2, AlertCircle } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

interface MiniMusicPlayerProps {
  onOpenFullPlayer: () => void;
  isVisible?: boolean;
}

export const MiniMusicPlayer: React.FC<MiniMusicPlayerProps> = ({
  onOpenFullPlayer,
  isVisible = true,
}) => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    currentTime,
    duration,
    audioError,
    isLoading,
  } = useMusic();

  if (!isVisible || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="mini-music-player-container"
      className="fixed bottom-[68px] left-0 right-0 z-30 px-3 pointer-events-none"
    >
      <div className="max-w-md mx-auto pointer-events-auto">
        <div
          id="mini-music-player"
          onClick={onOpenFullPlayer}
          className="relative overflow-hidden flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-[#170e30]/95 via-[#130b29]/95 to-[#1a0f35]/95 backdrop-blur-xl border border-pink-500/40 shadow-[0_4px_25px_rgba(236,72,153,0.25)] hover:border-pink-400/70 transition-all cursor-pointer group"
        >
          {/* Subtle top progress bar */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-purple-950/80 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Left: Album cover with rotating vinyl effect */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'rotate-12 scale-105' : ''
                }`}
              />
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Disc
                  className={`w-5 h-5 text-pink-300 drop-shadow-[0_0_6px_rgba(236,72,153,0.8)] ${
                    isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                  }`}
                />
              </div>
            </div>

            {/* Song title & artist */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-semibold text-xs text-white truncate group-hover:text-pink-300 transition-colors">
                  {currentTrack.title}
                </h4>
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3 shrink-0">
                    <span className="w-0.5 h-3 bg-pink-400 animate-pulse rounded-full" />
                    <span
                      className="w-0.5 h-2 bg-cyan-400 animate-pulse rounded-full"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="w-0.5 h-3 bg-purple-400 animate-pulse rounded-full"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-cyan-300/90 truncate flex items-center gap-1 mt-0.5">
                <span className="truncate">{currentTrack.artist}</span>
                {currentTrack.album && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 text-[10px] truncate">
                      {currentTrack.album}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right: Controls & Expand */}
          <div
            className="flex items-center gap-1.5 shrink-0 ml-2"
            onClick={(e) => e.stopPropagation()}
          >
            {audioError ? (
              <span
                title={audioError}
                className="p-1.5 text-amber-400 hover:text-amber-300 transition-colors"
              >
                <AlertCircle className="w-4 h-4 animate-bounce" />
              </span>
            ) : null}

            {/* Play/Pause Button */}
            <button
              id="mini-player-play-btn"
              onClick={togglePlay}
              disabled={isLoading}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.6)] hover:scale-105 active:scale-95 transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            <button
              id="mini-player-next-btn"
              onClick={nextTrack}
              className="p-1.5 text-slate-300 hover:text-pink-400 transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Open Full Player icon */}
            <button
              id="mini-player-expand-btn"
              onClick={onOpenFullPlayer}
              className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
              title="Expand Music Player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
