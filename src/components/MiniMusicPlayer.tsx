import React from 'react';
import { Play, Pause, SkipForward, Disc, Maximize2, AlertCircle, ExternalLink } from 'lucide-react';
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
    openExternalProvider,
  } = useMusic();

  if (!isVisible || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLicensedOnly = currentTrack.isPlayableInApp === false || !currentTrack.audioUrl;

  return (
    <div
      id="mini-music-player-container"
      className="fixed bottom-[52px] left-0 right-0 z-30 px-3 pointer-events-none"
    >
      <div className="max-w-md mx-auto pointer-events-auto">
        <div
          id="mini-music-player"
          onClick={onOpenFullPlayer}
          className="relative overflow-hidden h-[38px] px-2.5 rounded-t-lg bg-[#130b29]/95 backdrop-blur-md border border-b-0 border-purple-700/60 shadow-[0_-2px_10px_rgba(0,0,0,0.3)] hover:border-pink-500/70 transition-all cursor-pointer flex items-center justify-between group"
        >
          {/* Very thin top progress bar (1.5px) */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-purple-950/80 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Left: Tiny album cover + song info in one slim line */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative w-6 h-6 rounded overflow-hidden shrink-0 border border-pink-500/40 shadow-xs">
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover ${isPlaying ? 'rotate-12 scale-105' : ''}`}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <Disc
                  className={`w-3 h-3 text-pink-300 ${
                    isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                  }`}
                />
              </div>
            </div>

            {/* Song title & artist inline */}
            <div className="min-w-0 flex-1 flex items-center gap-1.5">
              <span className="font-bold text-[11px] text-white truncate group-hover:text-pink-300 transition-colors">
                {currentTrack.title}
              </span>
              <span className="text-[10px] text-cyan-300/80 font-mono truncate hidden sm:inline">
                • {currentTrack.artist}
              </span>
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-2 shrink-0">
                  <span className="w-0.5 h-2 bg-pink-400 animate-pulse rounded-full" />
                  <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse rounded-full" />
                  <span className="w-0.5 h-2 bg-purple-400 animate-pulse rounded-full" />
                </div>
              )}
            </div>
          </div>

          {/* Right: Slim controls */}
          <div
            className="flex items-center gap-1 shrink-0 ml-2"
            onClick={(e) => e.stopPropagation()}
          >
            {isLicensedOnly ? (
              <button
                onClick={() => openExternalProvider(currentTrack, 'youtubeMusic')}
                className="px-1.5 py-0.5 rounded bg-red-600/30 border border-red-500/50 hover:bg-red-600/50 text-[9px] font-semibold text-red-200 flex items-center gap-0.5 transition-all"
                title="Stream on YouTube Music"
              >
                <span>YT</span>
                <ExternalLink className="w-2 h-2" />
              </button>
            ) : null}

            {audioError && !isLicensedOnly ? (
              <span title={audioError} className="text-amber-400">
                <AlertCircle className="w-3 h-3 animate-bounce" />
              </span>
            ) : null}

            {/* Play/Pause Button */}
            <button
              id="mini-player-play-btn"
              onClick={togglePlay}
              disabled={isLoading}
              className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <div className="w-2.5 h-2.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-2.5 h-2.5 fill-white" />
              ) : (
                <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            <button
              id="mini-player-next-btn"
              onClick={nextTrack}
              className="p-1 text-slate-400 hover:text-pink-300 transition-colors cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-3 h-3" />
            </button>

            {/* Expand / Maximize Button */}
            <button
              id="mini-player-expand-btn"
              onClick={onOpenFullPlayer}
              className="p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Expand Player"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
