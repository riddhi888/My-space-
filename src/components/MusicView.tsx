import React, { useState, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Search,
  Plus,
  Music,
  ListMusic,
  Clock,
  Sparkles,
  Disc,
  Trash2,
  FolderPlus,
  Check,
  X,
  AlertTriangle,
  Flame,
  Radio,
  Share2,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { MusicTrack, Playlist } from '../types';

interface MusicViewProps {
  onBackToHome?: () => void;
}

export const MusicView: React.FC<MusicViewProps> = ({ onBackToHome }) => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    favorites,
    playlists,
    recentlyPlayed,
    audioError,
    isLoading,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    isFavorite,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    clearError,
  } = useMusic();

  const [activeCategory, setActiveCategory] = useState<'all' | 'recent' | 'favorites' | 'playlists'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Modals
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<MusicTrack | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const progressBarRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Format seconds to "M:SS"
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Progress percentage
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  // Handle seeking
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(ratio * duration);
  };

  // Filtered tracks based on search
  const filterTracks = (trackList: MusicTrack[]) => {
    if (!searchQuery.trim()) return trackList;
    const q = searchQuery.toLowerCase().trim();
    return trackList.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.album && t.album.toLowerCase().includes(q)) ||
        (t.genre && t.genre.toLowerCase().includes(q))
    );
  };

  // Tracks for active category
  const displayedTracks = useMemo(() => {
    if (activeCategory === 'favorites') {
      const favTracks = tracks.filter((t) => favorites.includes(t.id));
      return filterTracks(favTracks);
    }
    if (activeCategory === 'recent') {
      const recentTracks = recentlyPlayed
        .map((id) => tracks.find((t) => t.id === id))
        .filter((t): t is MusicTrack => !!t);
      return filterTracks(recentTracks);
    }
    return filterTracks(tracks);
  }, [tracks, favorites, recentlyPlayed, activeCategory, searchQuery]);

  // Handle Playlist Creation
  const handleCreateNewPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName, newPlaylistDesc);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setIsCreatePlaylistOpen(false);
    showToast(`Playlist created successfully!`);
  };

  // Add to playlist action
  const handleSelectPlaylistForTrack = (playlistId: string) => {
    if (!trackToAddToPlaylist) return;
    addTrackToPlaylist(playlistId, trackToAddToPlaylist.id);
    const p = playlists.find((pl) => pl.id === playlistId);
    showToast(`Added "${trackToAddToPlaylist.title}" to ${p?.name || 'playlist'}`);
    setTrackToAddToPlaylist(null);
  };

  // Visualizer frequency bars count
  const visualizerBars = [35, 70, 45, 90, 60, 100, 80, 50, 95, 65, 40, 85, 55, 75, 90, 60];

  return (
    <div className="space-y-6 pb-28 pt-2 px-3 sm:px-4 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-semibold shadow-[0_0_20px_rgba(236,72,153,0.5)] border border-pink-400/50 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-pink-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 shadow-[0_0_15px_rgba(236,72,153,0.4)]">
              <div className="w-full h-full bg-[#0d091d] rounded-[10px] flex items-center justify-center">
                <Music className="w-4 h-4 text-pink-400" />
              </div>
            </div>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              MySpace <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400">Cyber Beats</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Neon synthwave, outrun & cyberpunk audio library
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-[11px] font-mono text-pink-300 items-center gap-1.5">
            <Radio className="w-3 h-3 text-pink-400 animate-pulse" /> HI-FI 320KBPS
          </span>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs font-semibold text-slate-300 hover:text-white hover:bg-purple-900/40 transition-colors"
            >
              Home
            </button>
          )}
        </div>
      </div>

      {/* AUDIO ERROR BANNER (Graceful error handling) */}
      {audioError && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 via-purple-950/40 to-pink-950/50 border border-red-500/40 flex items-center justify-between gap-3 text-xs text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="truncate">{audioError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => togglePlay()}
              className="px-2.5 py-1 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-[11px] font-bold transition-colors"
            >
              Retry
            </button>
            <button
              onClick={clearError}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* HERO CURRENT PLAYER CARD (Glassmorphism + Neon Glow) */}
      <div
        id="cyber-now-playing-hero"
        className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#1d1238]/90 via-[#140c2b]/95 to-[#0b071a]/95 border border-purple-800/50 shadow-[0_0_35px_rgba(168,85,247,0.2)] backdrop-blur-2xl"
      >
        {/* Neon ambient glow spots */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Album Cover with Vinyl Effect */}
          <div className="relative group shrink-0">
            {/* Spinning Vinyl Record behind artwork */}
            <div
              className={`absolute -right-5 sm:-right-8 top-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-black border-4 border-neutral-700 shadow-2xl flex items-center justify-center transition-all duration-700 ${
                isPlaying ? 'translate-x-4 sm:translate-x-8 animate-[spin_6s_linear_infinite]' : 'opacity-70'
              }`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-pink-500/60 bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-0.5">
                <div className="w-full h-full rounded-full bg-black/90 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Front Square Artwork */}
            <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-pink-500/40 shadow-[0_0_25px_rgba(236,72,153,0.35)]">
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : ''
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-pink-300 border border-pink-500/30">
                  {currentTrack.genre || 'CYBER'}
                </span>
                <Disc
                  className={`w-4 h-4 text-pink-400 ${isPlaying ? 'animate-[spin_3s_linear_infinite]' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Track Details & Visualizer */}
          <div className="flex-1 min-w-0 w-full text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-pink-400 font-mono">
                  <Flame className="w-3 h-3 text-pink-400" /> Now Playing
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide truncate mt-0.5">
                  {currentTrack.title}
                </h2>
                <p className="text-sm font-medium text-cyan-300 truncate">
                  {currentTrack.artist}
                </p>
                {currentTrack.album && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    Album: <span className="text-slate-300">{currentTrack.album}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons: Favorite & Add to Playlist */}
              <div className="flex items-center justify-center md:justify-end gap-2.5 mt-2 md:mt-0">
                <button
                  id="hero-favorite-btn"
                  onClick={() => toggleFavorite(currentTrack.id)}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isFavorite(currentTrack.id)
                      ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                      : 'bg-purple-950/30 border-purple-800/40 text-slate-400 hover:text-white hover:border-purple-600'
                  }`}
                  title={isFavorite(currentTrack.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite(currentTrack.id) ? 'fill-pink-500 text-pink-500' : ''}`}
                  />
                </button>

                <button
                  id="hero-add-to-playlist-btn"
                  onClick={() => setTrackToAddToPlaylist(currentTrack)}
                  className="p-2.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-slate-300 hover:text-white hover:border-pink-500/50 transition-all"
                  title="Add to Playlist"
                >
                  <FolderPlus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ANIMATED RHYTHMIC MUSIC EQUALIZER VISUALIZER */}
            <div className="mt-4 p-2 rounded-2xl bg-[#0e0921]/60 border border-purple-900/30 flex items-end justify-between gap-1 h-10 px-3">
              {visualizerBars.map((heightPercent, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-200 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-pink-500 via-purple-500 to-cyan-400 animate-pulse'
                      : 'bg-purple-900/40'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (heightPercent * (progressPercent % 30 + 70)) / 100)}%` : '15%',
                    animationDelay: `${(i % 5) * 0.12}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>

            {/* PROGRESS BAR WITH SEEKING */}
            <div className="mt-4 space-y-1.5">
              <div
                ref={progressBarRef}
                id="music-hero-progress-bar"
                onClick={handleSeek}
                className="relative h-2 w-full bg-purple-950/90 rounded-full cursor-pointer overflow-hidden group hover:h-2.5 transition-all"
                title="Seek audio position"
              >
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full relative transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                >
                  {/* Glowing thumb handle */}
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* MAIN PLAYBACK CONTROLS */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-purple-900/40">
              {/* Left: Shuffle & Repeat */}
              <div className="flex items-center gap-1.5">
                <button
                  id="music-shuffle-btn"
                  onClick={toggleShuffle}
                  className={`p-2 rounded-xl transition-all ${
                    isShuffle
                      ? 'text-pink-400 bg-pink-500/20 border border-pink-500/40 shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={isShuffle ? 'Shuffle Enabled' : 'Shuffle Disabled'}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  id="music-repeat-btn"
                  onClick={toggleRepeat}
                  className={`p-2 rounded-xl transition-all ${
                    repeatMode !== 'off'
                      ? 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Repeat: ${repeatMode.toUpperCase()}`}
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="w-4 h-4" />
                  ) : (
                    <Repeat className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Center: Previous, Play/Pause, Next */}
              <div className="flex items-center gap-4">
                <button
                  id="hero-prev-track-btn"
                  onClick={prevTrack}
                  className="p-2.5 text-slate-300 hover:text-pink-400 active:scale-95 transition-all"
                  title="Previous Song"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  id="hero-play-pause-btn"
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white flex items-center justify-center shadow-[0_0_22px_rgba(236,72,153,0.7)] hover:scale-105 active:scale-95 transition-all"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6 fill-white" />
                  ) : (
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  )}
                </button>

                <button
                  id="hero-next-track-btn"
                  onClick={nextTrack}
                  className="p-2.5 text-slate-300 hover:text-pink-400 active:scale-95 transition-all"
                  title="Next Song"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Right: Volume Control & Mute */}
              <div className="flex items-center gap-2">
                <button
                  id="music-volume-mute-btn"
                  onClick={toggleMute}
                  className="p-2 text-slate-400 hover:text-cyan-300 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  )}
                </button>

                <input
                  id="music-volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 sm:w-24 h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR (Search by title or artist) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="music-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by song title, artist, album, or genre..."
          className="w-full bg-[#140c2b]/80 border border-purple-800/40 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 backdrop-blur-md transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* CATEGORIES NAVIGATION (All Songs, Recently Played, Favorites, Playlists) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="cat-tab-all-songs"
            onClick={() => {
              setActiveCategory('all');
              setSelectedPlaylist(null);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeCategory === 'all' && !selectedPlaylist
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'bg-purple-950/40 text-slate-300 border border-purple-900/40 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>All Songs</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {tracks.length}
            </span>
          </button>

          <button
            id="cat-tab-recently-played"
            onClick={() => {
              setActiveCategory('recent');
              setSelectedPlaylist(null);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeCategory === 'recent' && !selectedPlaylist
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'bg-purple-950/40 text-slate-300 border border-purple-900/40 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recently Played</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {recentlyPlayed.length}
            </span>
          </button>

          <button
            id="cat-tab-favorites"
            onClick={() => {
              setActiveCategory('favorites');
              setSelectedPlaylist(null);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeCategory === 'favorites' && !selectedPlaylist
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'bg-purple-950/40 text-slate-300 border border-purple-900/40 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Favorites</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {favorites.length}
            </span>
          </button>

          <button
            id="cat-tab-playlists"
            onClick={() => {
              setActiveCategory('playlists');
              setSelectedPlaylist(null);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeCategory === 'playlists' && !selectedPlaylist
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'bg-purple-950/40 text-slate-300 border border-purple-900/40 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5 text-cyan-400" />
            <span>Playlists</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {playlists.length}
            </span>
          </button>
        </div>

        {/* Create Playlist Button */}
        <button
          id="music-create-playlist-btn"
          onClick={() => setIsCreatePlaylistOpen(true)}
          className="px-3 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* SELECTED PLAYLIST DETAIL VIEW */}
      {selectedPlaylist && (
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1a1033] to-[#120a26] border border-cyan-500/40 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-cyan-500/30 shrink-0">
                <img
                  src={selectedPlaylist.cover || tracks[0]?.cover || ''}
                  alt={selectedPlaylist.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Playlist • {selectedPlaylist.trackIds.length} Songs
                </span>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {selectedPlaylist.name}
                </h3>
                {selectedPlaylist.description && (
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedPlaylist.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const playlistTracks = tracks.filter((t) =>
                    selectedPlaylist.trackIds.includes(t.id)
                  );
                  if (playlistTracks.length > 0) {
                    playTrack(playlistTracks[0], playlistTracks);
                    showToast(`Playing playlist: ${selectedPlaylist.name}`);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Play All
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete playlist "${selectedPlaylist.name}"?`)) {
                    deletePlaylist(selectedPlaylist.id);
                    setSelectedPlaylist(null);
                    showToast('Playlist deleted');
                  }
                }}
                className="p-2 rounded-xl bg-red-950/30 border border-red-800/40 text-red-400 hover:text-red-300 hover:bg-red-900/40 transition-colors"
                title="Delete Playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedPlaylist(null)}
                className="p-2 rounded-xl bg-purple-950/40 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Playlist Track List */}
          <div className="space-y-2 pt-2 border-t border-purple-900/30">
            {selectedPlaylist.trackIds.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                This playlist is empty. Browse songs and tap "+" to add tracks!
              </p>
            ) : (
              selectedPlaylist.trackIds.map((trackId) => {
                const track = tracks.find((t) => t.id === trackId);
                if (!track) return null;
                const isCurrent = currentTrack.id === track.id;

                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-pink-500/10 border-pink-500/50'
                        : 'bg-purple-950/20 border-purple-900/30 hover:bg-purple-900/30 hover:border-purple-700/50'
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => playTrack(track)}
                    >
                      <img
                        src={track.cover}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`text-xs font-semibold truncate ${
                            isCurrent ? 'text-pink-300' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400">
                        {track.duration}
                      </span>
                      <button
                        onClick={() => {
                          removeTrackFromPlaylist(selectedPlaylist.id, track.id);
                          showToast(`Removed from playlist`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove from playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PLAYLISTS GRID VIEW (When category is Playlists & no playlist is opened) */}
      {activeCategory === 'playlists' && !selectedPlaylist && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Your Playlists</span>
              <span className="text-xs font-mono text-cyan-400">({playlists.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                id={`playlist-card-${playlist.id}`}
                onClick={() => setSelectedPlaylist(playlist)}
                className="group p-3.5 rounded-2xl bg-gradient-to-br from-[#180f33]/80 to-[#100924]/80 border border-purple-800/40 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.25)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-purple-700/50 shrink-0 group-hover:scale-105 transition-transform">
                    <img
                      src={playlist.cover || tracks[0]?.cover || ''}
                      alt={playlist.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white group-hover:text-pink-300 transition-colors truncate">
                      {playlist.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {playlist.description || `${playlist.trackIds.length} tracks`}
                    </p>
                    <span className="text-[10px] font-mono text-cyan-400 mt-1 block">
                      {playlist.trackIds.length} SONGS
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-purple-900/30 flex items-center justify-between text-xs text-slate-400">
                  <span>{playlist.createdAt}</span>
                  <span className="text-pink-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Open →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODERN MUSIC LIBRARY (Attractive Music Cards) */}
      {(!selectedPlaylist || activeCategory !== 'playlists') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <span>
                {activeCategory === 'all'
                  ? 'All Songs'
                  : activeCategory === 'favorites'
                  ? 'Favorite Songs'
                  : activeCategory === 'recent'
                  ? 'Recently Played'
                  : 'Songs Library'}
              </span>
              <span className="text-xs font-mono text-pink-400">
                ({displayedTracks.length})
              </span>
            </h3>
            {searchQuery && (
              <span className="text-xs text-slate-400">
                Found for <span className="text-pink-300">"{searchQuery}"</span>
              </span>
            )}
          </div>

          {displayedTracks.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[#120a26]/60 border border-purple-900/40 space-y-2">
              <Music className="w-8 h-8 text-purple-400/60 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No songs found</p>
              <p className="text-xs text-slate-400">
                {searchQuery
                  ? 'Try searching with a different keyword or artist name.'
                  : activeCategory === 'favorites'
                  ? 'Tap the heart icon on any song to add it to your favorites.'
                  : 'Start listening to songs to see them here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedTracks.map((track, idx) => {
                const isCurrent = currentTrack.id === track.id;
                const isTrackFav = isFavorite(track.id);

                return (
                  <div
                    key={track.id}
                    id={`track-card-${track.id}`}
                    className={`group relative overflow-hidden p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#20113d] to-[#160c2e] border-pink-500/70 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                        : 'bg-gradient-to-r from-[#170e30]/80 to-[#100924]/80 border-purple-800/40 hover:border-pink-500/40 hover:bg-purple-950/40'
                    }`}
                  >
                    {/* Left: Index & Artwork */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-[11px] font-mono text-slate-500 w-4 text-center shrink-0">
                        {idx + 1}
                      </span>

                      {/* Album Cover & Play Hover Overlay */}
                      <div
                        onClick={() => {
                          if (isCurrent) {
                            togglePlay();
                          } else {
                            playTrack(track, displayedTracks);
                          }
                        }}
                        className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-purple-700/50 shadow-md cursor-pointer group-hover:shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                      >
                        <img
                          src={track.cover}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            isCurrent && isPlaying ? 'scale-105' : 'group-hover:scale-105'
                          }`}
                        />
                        <div
                          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-5 h-5 text-white fill-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          )}
                        </div>

                        {/* Playing wave badge */}
                        {isCurrent && isPlaying && (
                          <div className="absolute bottom-1 right-1 flex items-end gap-0.5">
                            <span className="w-0.5 h-2 bg-pink-400 animate-pulse rounded-full" />
                            <span className="w-0.5 h-3 bg-cyan-400 animate-pulse rounded-full" />
                          </div>
                        )}
                      </div>

                      {/* Title & Artist */}
                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => {
                          if (isCurrent) {
                            togglePlay();
                          } else {
                            playTrack(track, displayedTracks);
                          }
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <h4
                            className={`font-semibold text-xs sm:text-sm truncate transition-colors ${
                              isCurrent ? 'text-pink-300 font-bold' : 'text-white group-hover:text-pink-200'
                            }`}
                          >
                            {track.title}
                          </h4>
                          {track.genre && (
                            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-purple-900/50 text-[9px] font-mono text-cyan-300 shrink-0 border border-purple-800/40">
                              {track.genre}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {track.artist}
                          {track.album && (
                            <span className="text-slate-500"> • {track.album}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right: Duration & Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline-block">
                        {track.duration}
                      </span>

                      {/* Favorite Button */}
                      <button
                        id={`track-fav-btn-${track.id}`}
                        onClick={() => toggleFavorite(track.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isTrackFav
                            ? 'text-pink-400 hover:text-pink-300'
                            : 'text-slate-500 hover:text-white'
                        }`}
                        title={isTrackFav ? 'Remove Favorite' : 'Add Favorite'}
                      >
                        <Heart
                          className={`w-4 h-4 ${isTrackFav ? 'fill-pink-500 text-pink-500' : ''}`}
                        />
                      </button>

                      {/* Add to Playlist Button */}
                      <button
                        id={`track-playlist-btn-${track.id}`}
                        onClick={() => setTrackToAddToPlaylist(track)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-300 transition-colors"
                        title="Add to Playlist"
                      >
                        <FolderPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE PLAYLIST MODAL */}
      {isCreatePlaylistOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#160d2e] border border-purple-800/60 rounded-3xl p-6 space-y-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-pink-400" /> Create New Playlist
              </h3>
              <button
                onClick={() => setIsCreatePlaylistOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPlaylist} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g., Midnight Synth Odyssey"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="e.g., Driving beats for night cruises..."
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-950/50 border border-purple-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePlaylistOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:scale-105 transition-transform"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TO PLAYLIST MODAL */}
      {trackToAddToPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#160d2e] border border-purple-800/60 rounded-3xl p-5 space-y-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Add to Playlist</h3>
                <p className="text-xs text-pink-300 truncate max-w-[240px]">
                  "{trackToAddToPlaylist.title}"
                </p>
              </div>
              <button
                onClick={() => setTrackToAddToPlaylist(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {playlists.map((pl) => {
                const alreadyAdded = pl.trackIds.includes(trackToAddToPlaylist.id);
                return (
                  <button
                    key={pl.id}
                    onClick={() => {
                      if (!alreadyAdded) {
                        handleSelectPlaylistForTrack(pl.id);
                      }
                    }}
                    disabled={alreadyAdded}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between border transition-all ${
                      alreadyAdded
                        ? 'bg-purple-950/20 border-purple-900/30 text-slate-500 cursor-not-allowed'
                        : 'bg-purple-950/40 border-purple-800/40 hover:border-pink-500/50 hover:bg-purple-900/40 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ListMusic className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{pl.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {pl.trackIds.length} tracks
                        </p>
                      </div>
                    </div>
                    {alreadyAdded ? (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Added
                      </span>
                    ) : (
                      <span className="text-xs text-pink-400 font-bold">+ Add</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between">
              <button
                onClick={() => {
                  setTrackToAddToPlaylist(null);
                  setIsCreatePlaylistOpen(true);
                }}
                className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> New Playlist
              </button>

              <button
                onClick={() => setTrackToAddToPlaylist(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
