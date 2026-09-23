import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Disc,
  Music,
  Heart,
  Sparkles,
  Check,
  Search,
  Radio,
  Flame,
  ListMusic,
} from 'lucide-react';
import { MusicTrack, UserProfile } from '../types';

interface MusicViewProps {
  tracks: MusicTrack[];
  currentUser: UserProfile;
  onSetProfileAnthem: (song: { title: string; artist: string; duration: string }) => void;
  onShowToast: (message: string) => void;
}

export const MusicView: React.FC<MusicViewProps> = ({
  tracks,
  currentUser,
  onSetProfileAnthem,
  onShowToast,
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<'all' | 'hits2008' | 'synthwave' | 'midnight'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({ track_1: true });

  const playlists = [
    { id: 'all', name: 'All Tracks', count: tracks.length },
    { id: 'hits2008', name: '🔥 2008 MySpace Hits', count: 3 },
    { id: 'synthwave', name: '⚡ Synthwave FM', count: 2 },
    { id: 'midnight', name: '🌃 Midnight Chill', count: 2 },
  ];

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Simulated playback progress
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (isRepeat) return 0;
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, isRepeat, currentTrackIndex]);

  const handleNextTrack = () => {
    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(nextIdx);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
    setProgress(0);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setProgress(0);
  };

  const handleSetAnthem = (track: MusicTrack) => {
    onSetProfileAnthem({
      title: track.title,
      artist: track.artist,
      duration: track.duration,
    });
    onShowToast(`🎵 "${track.title}" set as your MySpace Profile Anthem!`);
  };

  const toggleLikeTrack = (trackId: string) => {
    setLikedTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  const filteredTracks = tracks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const isCurrentAnthem =
    currentUser.profileSong.title.toLowerCase() === currentTrack.title.toLowerCase();

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="px-4 pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400">
                MySpace Music
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                2008 PLAYER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Profile anthems, indie drops & cyber synth streams
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-pink-400 shadow-md">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Profile Anthem Quick Status Bar */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-950/60 via-purple-950/60 to-blue-950/60 border border-pink-500/40 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center shrink-0">
              <Music className="w-4 h-4 text-pink-400 animate-bounce" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-pink-300">
                Active Profile Anthem
              </p>
              <p className="text-xs font-semibold text-white truncate">
                {currentUser.profileSong.title} — <span className="text-slate-300 font-normal">{currentUser.profileSong.artist}</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 shrink-0">
            AUTO-PLAYS
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracks, artists, cyber anthems..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all"
          />
        </div>
      </div>

      {/* Featured Vinyl Player Hero Card */}
      <div className="px-4">
        <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#1b1236]/95 via-[#130d29]/95 to-[#0b081c]/95 border border-purple-800/50 shadow-[0_0_35px_rgba(168,85,247,0.2)]">
          {/* Ambient Glows */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Hero Visualizer & Vinyl Cover */}
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Vinyl record spinning behind album cover */}
            <div className="relative w-44 h-44 mb-4">
              {/* Spinning vinyl disk */}
              <div
                className={`absolute inset-0 rounded-full bg-black border-4 border-purple-900/60 shadow-2xl flex items-center justify-center transition-all duration-700 ${
                  isPlaying ? 'translate-x-6 rotate-180 animate-spin' : 'translate-x-0'
                }`}
                style={{ animationDuration: '8s' }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 border-2 border-white/20 flex items-center justify-center">
                  <Disc className="w-8 h-8 text-white/90" />
                </div>
              </div>

              {/* Main Square Album Cover */}
              <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-pink-500/40 shadow-[0_0_25px_rgba(236,72,153,0.4)] z-10 bg-[#090714]">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-pink-500/80 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1 shadow-md">
                  <Flame className="w-3 h-3" /> TRACK #{currentTrackIndex + 1}
                </div>
              </div>
            </div>

            {/* Title, Artist, & Album tag */}
            <h3 className="font-display font-extrabold text-lg text-white max-w-[90%] truncate">
              {currentTrack.title}
            </h3>
            <p className="text-sm font-medium text-cyan-400 mt-0.5 max-w-[85%] truncate">
              {currentTrack.artist}
            </p>

            {/* Audio frequency visualizer bars */}
            <div className="flex items-end gap-1 h-5 my-3">
              {[25, 75, 40, 95, 60, 100, 50, 85, 30, 90, 65, 45, 80, 35].map((val, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-gradient-to-t from-pink-500 via-purple-500 to-cyan-400 transition-all duration-200 ${
                    isPlaying ? 'animate-pulse' : 'opacity-30'
                  }`}
                  style={{
                    height: isPlaying ? `${val}%` : '20%',
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>

            {/* Progress Bar & Timestamps */}
            <div className="w-full space-y-1.5 my-2">
              <div
                className="h-2 w-full bg-purple-950/80 rounded-full overflow-hidden cursor-pointer p-0.5 border border-purple-800/40"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setProgress(Math.round(pos * 100));
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)] transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0:{String(Math.floor((progress / 100) * 45)).padStart(2, '0')}</span>
                <span>{currentTrack.duration}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="w-full flex items-center justify-between pt-2">
              {/* Shuffle */}
              <button
                onClick={() => {
                  setIsShuffle(!isShuffle);
                  onShowToast(isShuffle ? 'Shuffle off' : 'Shuffle on');
                }}
                className={`p-2 rounded-xl transition-colors ${
                  isShuffle ? 'text-pink-400 bg-pink-500/20' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Prev */}
              <button
                onClick={handlePrevTrack}
                className="p-2 text-slate-300 hover:text-pink-400 transition-colors"
                title="Previous"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Play / Pause Main Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-13 h-13 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-0.5 shadow-[0_0_25px_rgba(236,72,153,0.7)] hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <div className="w-full h-full bg-[#120a2b] rounded-full flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-white text-white" />
                  ) : (
                    <Play className="w-6 h-6 fill-white text-white ml-1" />
                  )}
                </div>
              </button>

              {/* Next */}
              <button
                onClick={handleNextTrack}
                className="p-2 text-slate-300 hover:text-pink-400 transition-colors"
                title="Next"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Repeat */}
              <button
                onClick={() => {
                  setIsRepeat(!isRepeat);
                  onShowToast(isRepeat ? 'Repeat off' : 'Repeat song on');
                }}
                className={`p-2 rounded-xl transition-colors ${
                  isRepeat ? 'text-cyan-400 bg-cyan-500/20' : 'text-slate-400 hover:text-white'
                }`}
                title="Repeat"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Set as Profile Anthem Action */}
            <div className="w-full pt-4 mt-3 border-t border-purple-900/40 flex items-center justify-between gap-3">
              <button
                onClick={() => toggleLikeTrack(currentTrack.id)}
                className={`p-2 rounded-xl border transition-all ${
                  likedTracks[currentTrack.id]
                    ? 'border-pink-500/60 bg-pink-500/20 text-pink-400'
                    : 'border-purple-800/40 text-slate-400 hover:text-white'
                }`}
                title="Favorite Song"
              >
                <Heart className={`w-4 h-4 ${likedTracks[currentTrack.id] ? 'fill-pink-500' : ''}`} />
              </button>

              <button
                onClick={() => handleSetAnthem(currentTrack)}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  isCurrentAnthem
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-pink-500/30'
                }`}
              >
                {isCurrentAnthem ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Current Profile Anthem</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Set as Profile Anthem</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl border border-purple-800/40 text-slate-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Selector Tabs */}
      <div className="px-4 space-y-2">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-pink-400" />
          <h3 className="font-display font-bold text-sm tracking-wide text-white">
            Curated Playlists
          </h3>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setSelectedPlaylist(pl.id as any)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedPlaylist === pl.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                  : 'bg-purple-950/30 text-slate-300 border-purple-800/40 hover:border-pink-500/40'
              }`}
            >
              {pl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Track List */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            SHOWING {filteredTracks.length} TRACKS
          </span>
          <span className="text-[11px] text-pink-400 font-mono">
            320 KBPS AUDIO
          </span>
        </div>

        <div className="space-y-2">
          {filteredTracks.map((trk, idx) => {
            const isSelected = trk.id === currentTrack.id;
            const isAnthem = currentUser.profileSong.title.toLowerCase() === trk.title.toLowerCase();

            return (
              <div
                key={trk.id}
                onClick={() => handleSelectTrack(idx)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-purple-950/60 border-pink-500/60 shadow-[0_0_18px_rgba(236,72,153,0.25)]'
                    : 'bg-[#120a24]/60 border-purple-900/30 hover:border-purple-700/60 hover:bg-[#180e30]/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail / Play state */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-purple-700/40">
                    <img
                      src={trk.cover}
                      alt={trk.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isSelected && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isSelected && isPlaying ? (
                        <Pause className="w-5 h-5 text-pink-400 fill-pink-400" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-pink-300' : 'text-white group-hover:text-pink-200'
                        }`}
                      >
                        {trk.title}
                      </h4>
                      {isAnthem && (
                        <span className="px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[9px] font-mono shrink-0">
                          ANTHEM
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {trk.artist}
                    </p>
                  </div>
                </div>

                {/* Right controls: Duration & Set Anthem button */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400">
                    {trk.duration}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetAnthem(trk);
                    }}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      isAnthem
                        ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-400'
                        : 'border-purple-800/40 text-slate-400 hover:text-pink-400 hover:border-pink-500/50'
                    }`}
                    title="Set as Profile Anthem"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
