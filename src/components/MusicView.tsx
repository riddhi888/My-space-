import React, { useState, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  Plus,
  Search,
  FolderPlus,
  Trash2,
  X,
  Disc,
  Globe,
  Music,
  Sparkles,
  TrendingUp,
  Flame,
  Check,
  ExternalLink,
  AlertCircle,
  UploadCloud,
  Headphones,
  Radio,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { MusicTrack, Playlist } from '../types';
import {
  musicCategories,
  externalMusicPlatforms,
  MusicCategoryInfo,
  ExternalMusicPlatform,
} from '../data/musicData';

interface MusicViewProps {
  onBackToHome?: () => void;
}

type DiscoverySection = 'all' | 'popular' | 'new_releases' | 'trending' | 'recommended' | 'recent' | 'favorites' | 'playlists' | 'local_files';

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
    unplayableModalTrack,
    setUnplayableModalTrack,
    addLocalTrack,
    removeLocalTrack,
    openExternalProvider,
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
    removeTrackFromPlaylist,
    addTrackToPlaylist,
    clearError,
  } = useMusic();

  // Navigation & Filtering state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [discoverySection, setDiscoverySection] = useState<DiscoverySection>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Modals state
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<MusicTrack | null>(null);
  const [showExternalServicesModal, setShowExternalServicesModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Unique countries list
  const countries = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => {
      if (t.country && t.country !== 'My Device') set.add(t.country);
    });
    return Array.from(set);
  }, [tracks]);

  // Unique languages list
  const languages = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => {
      if (t.language && t.language !== 'User Device') set.add(t.language);
    });
    return Array.from(set);
  }, [tracks]);

  // Filtered tracks based on search, category, country, language, and discovery section
  const displayedTracks = useMemo(() => {
    return tracks.filter((track) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = track.title.toLowerCase().includes(q);
        const matchesArtist = track.artist.toLowerCase().includes(q);
        const matchesAlbum = track.album?.toLowerCase().includes(q);
        const matchesGenre = track.genre?.toLowerCase().includes(q);
        const matchesLang = track.language?.toLowerCase().includes(q);
        const matchesCountry = track.country?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesArtist && !matchesAlbum && !matchesGenre && !matchesLang && !matchesCountry) {
          return false;
        }
      }

      // 2. Discovery section filters
      if (discoverySection === 'popular' && !track.isPopular) return false;
      if (discoverySection === 'new_releases' && !track.isNewRelease) return false;
      if (discoverySection === 'trending' && !track.isTrending) return false;
      if (discoverySection === 'recommended' && !track.isRecommended) return false;
      if (discoverySection === 'favorites' && !favorites.includes(track.id)) return false;
      if (discoverySection === 'recent' && !recentlyPlayed.includes(track.id)) return false;
      if (discoverySection === 'local_files' && !track.isLocalFile) return false;

      // 3. Category filter
      if (activeCategory !== 'all') {
        if (track.category !== activeCategory) return false;
      }

      // 4. Country filter
      if (selectedCountry !== 'all') {
        if (track.country !== selectedCountry) return false;
      }

      // 5. Language filter
      if (selectedLanguage !== 'all') {
        if (track.language !== selectedLanguage) return false;
      }

      return true;
    });
  }, [
    tracks,
    searchQuery,
    discoverySection,
    activeCategory,
    selectedCountry,
    selectedLanguage,
    favorites,
    recentlyPlayed,
  ]);

  // Section items for Quick Discovery
  const popularTracks = useMemo(() => tracks.filter((t) => t.isPopular), [tracks]);
  const newReleaseTracks = useMemo(() => tracks.filter((t) => t.isNewRelease), [tracks]);
  const trendingTracks = useMemo(() => tracks.filter((t) => t.isTrending), [tracks]);
  const recommendedTracks = useMemo(() => tracks.filter((t) => t.isRecommended), [tracks]);
  const recentTracks = useMemo(
    () =>
      recentlyPlayed
        .map((id) => tracks.find((t) => t.id === id))
        .filter((t): t is MusicTrack => Boolean(t)),
    [recentlyPlayed, tracks]
  );

  // Time formatter
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLicensedTrack = currentTrack.isPlayableInApp === false || !currentTrack.audioUrl;

  // Handle local file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      try {
        const newTrack = await addLocalTrack(file);
        showToast(`Loaded "${newTrack.title}" from device`);
        setDiscoverySection('local_files');
      } catch (err) {
        console.error('Failed to load local track', err);
        showToast('Could not load audio file');
      }
    }
    // reset input so same file can be reloaded if needed
    if (e.target) e.target.value = '';
  };

  const handleCreateNewPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName, newPlaylistDesc);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setIsCreatePlaylistOpen(false);
    setSelectedPlaylist(pl);
    showToast(`Playlist "${pl.name}" created!`);
  };

  const handleSelectPlaylistForTrack = (playlistId: string) => {
    if (!trackToAddToPlaylist) return;
    addTrackToPlaylist(playlistId, trackToAddToPlaylist.id);
    const pl = playlists.find((p) => p.id === playlistId);
    showToast(`Added to "${pl?.name || 'Playlist'}"`);
    setTrackToAddToPlaylist(null);
  };

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-semibold shadow-[0_0_20px_rgba(236,72,153,0.5)] border border-pink-400/40 animate-fade-in flex items-center gap-2 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-purple-900/40">
        <div className="flex items-center gap-3">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-slate-300 hover:text-white hover:border-pink-500/40 transition-colors"
              title="Back to Feed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-wide flex items-center gap-2">
                <span>International Music Studio</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono">
                  10 Cultures
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Stream world music from India, Bangladesh, Korea, Japan, Spain, France, China, Arab nations, and beyond.
            </p>
          </div>
        </div>

        {/* Action Buttons: Add local music & External Services */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-800/60 to-pink-900/60 border border-pink-500/40 hover:border-pink-400 text-xs font-semibold text-pink-200 flex items-center gap-1.5 shadow-[0_0_12px_rgba(236,72,153,0.25)] transition-all hover:scale-105 active:scale-95"
            title="Upload audio file from your device"
          >
            <UploadCloud className="w-3.5 h-3.5 text-pink-400" />
            <span>Play Device Audio</span>
          </button>

          <button
            onClick={() => setShowExternalServicesModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-700/50 hover:border-cyan-400 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            title="External Music Services (YouTube Music, Spotify, Apple Music)"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Streaming Apps</span>
          </button>
        </div>
      </div>

      {/* ERROR / NOTICE BANNER (Graceful error handling) */}
      {audioError && (
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start justify-between gap-3 text-xs text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Playback Notice</p>
              <p className="text-amber-200/90 mt-0.5">{audioError}</p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="p-1 text-amber-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SEARCH BAR (Song, Artist, Album, Language, Country) */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 pointer-events-none" />
          <input
            id="music-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, albums, languages (Hindi, Bengali, Korean, Japanese...), or countries..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#140c2b]/90 border border-purple-800/50 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* HERO MASTER PLAYER (Rich Controls, Vinyl Cover, Seeking, Volume, Repeat, Shuffle) */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#1d1138]/95 via-[#130b29]/95 to-[#1a0f35]/95 border border-pink-500/40 shadow-[0_0_35px_rgba(236,72,153,0.2)]">
        {/* Neon decorative background glow */}
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Vinyl Album Artwork */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden shrink-0 border-2 border-pink-500/40 shadow-[0_0_25px_rgba(236,72,153,0.35)] group">
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105 rotate-3' : 'group-hover:scale-105'
              }`}
            />
            <div className="absolute inset-0 bg-black/20" />
            {/* Center Vinyl Hole & Disc Icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/60 border border-white/30 flex items-center justify-center backdrop-blur-sm shadow-lg">
                <Disc
                  className={`w-7 h-7 text-pink-300 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] ${
                    isPlaying ? 'animate-[spin_3s_linear_infinite]' : ''
                  }`}
                />
              </div>
            </div>

            {/* Country Flag Badge on Cover */}
            {currentTrack.countryFlag && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 border border-white/20 backdrop-blur-sm text-xs flex items-center gap-1 font-mono text-white">
                <span>{currentTrack.countryFlag}</span>
                <span className="text-[10px] truncate max-w-[80px]">{currentTrack.country}</span>
              </div>
            )}

            {/* Playable or Licensed indicator badge */}
            <div className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 border border-white/20 backdrop-blur-sm text-[10px] text-center font-medium truncate">
              {currentTrack.isLocalFile ? (
                <span className="text-emerald-300 font-semibold">💾 User Device File</span>
              ) : currentTrack.isPlayableInApp ? (
                <span className="text-cyan-300 font-semibold">⚡ Direct Stream</span>
              ) : (
                <span className="text-amber-300 font-semibold">🎵 Licensed Track</span>
              )}
            </div>
          </div>

          {/* Track Details & Controls */}
          <div className="flex-1 w-full min-w-0 space-y-4">
            {/* Badges and metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-[10px] font-mono text-pink-300 font-semibold flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  {currentTrack.genre || 'International'}
                </span>
                {currentTrack.language && (
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-semibold">
                    {currentTrack.language}
                  </span>
                )}
                {currentTrack.releaseYear && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-900/40 text-[10px] font-mono text-slate-400">
                    {currentTrack.releaseYear}
                  </span>
                )}
              </div>

              {/* Action buttons (Favorite, Add to Playlist, External launch) */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleFavorite(currentTrack.id)}
                  className={`p-2 rounded-xl border transition-all ${
                    isFavorite(currentTrack.id)
                      ? 'bg-pink-500/20 border-pink-500/60 text-pink-400'
                      : 'bg-purple-950/40 border-purple-800/40 text-slate-400 hover:text-white'
                  }`}
                  title={isFavorite(currentTrack.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite(currentTrack.id) ? 'fill-pink-500 text-pink-500' : ''
                    }`}
                  />
                </button>

                <button
                  onClick={() => setTrackToAddToPlaylist(currentTrack)}
                  className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
                  title="Add to Playlist"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>

                {/* External launch buttons */}
                <button
                  onClick={() => openExternalProvider(currentTrack, 'youtubeMusic')}
                  className="px-2.5 py-1.5 rounded-xl bg-red-950/40 border border-red-800/50 hover:border-red-500 text-red-300 text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Stream on YouTube Music"
                >
                  <span>YouTube Music</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Title & Artist */}
            <div>
              <h3 className="text-lg sm:text-2xl font-display font-extrabold text-white tracking-wide truncate">
                {currentTrack.title}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-300 font-medium truncate mt-0.5">
                {currentTrack.artist}
                {currentTrack.album && (
                  <span className="text-slate-400"> • {currentTrack.album}</span>
                )}
              </p>
              {currentTrack.audioNote && (
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                  ℹ️ {currentTrack.audioNote}
                </p>
              )}
            </div>

            {/* Progress Slider Bar */}
            <div className="space-y-1">
              <div
                className="h-2 w-full bg-purple-950/90 rounded-full overflow-hidden cursor-pointer relative group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  if (duration > 0) {
                    seekTo(ratio * duration);
                  }
                }}
                title="Click to seek"
              >
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Player Controls (Shuffle, Prev, Play/Pause, Next, Repeat, Volume) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Shuffle & Repeat */}
              <div className="flex items-center gap-1.5">
                <button
                  id="music-shuffle-toggle-btn"
                  onClick={toggleShuffle}
                  className={`p-2 rounded-xl transition-colors ${
                    isShuffle
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  id="music-repeat-toggle-btn"
                  onClick={toggleRepeat}
                  className={`p-2 rounded-xl transition-colors flex items-center gap-1 ${
                    repeatMode !== 'off'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Repeat mode: ${repeatMode}`}
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="w-4 h-4" />
                  ) : (
                    <Repeat className="w-4 h-4" />
                  )}
                  <span className="text-[9px] font-mono uppercase">{repeatMode}</span>
                </button>
              </div>

              {/* Central Main Controls (Prev, Big Play, Next) */}
              <div className="flex items-center gap-3">
                <button
                  id="music-hero-prev-btn"
                  onClick={prevTrack}
                  className="p-2.5 rounded-2xl bg-purple-950/50 border border-purple-800/40 text-slate-200 hover:text-pink-400 hover:border-pink-500/40 transition-all hover:scale-105 active:scale-95"
                  title="Previous Track"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  id="music-hero-play-btn"
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.6)] hover:scale-105 active:scale-95 transition-all"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  )}
                </button>

                <button
                  id="music-hero-next-btn"
                  onClick={nextTrack}
                  className="p-2.5 rounded-2xl bg-purple-950/50 border border-purple-800/40 text-slate-200 hover:text-pink-400 hover:border-pink-500/40 transition-all hover:scale-105 active:scale-95"
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider & Mute Toggle */}
              <div className="flex items-center gap-2">
                <button
                  id="music-hero-mute-btn"
                  onClick={toggleMute}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 sm:w-24 accent-pink-500 cursor-pointer h-1.5 bg-purple-950 rounded-full"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISCOVERY SECTIONS TABS (Popular, New Releases, Trending, Recommended, Recently Played, Favorites, Playlists) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Music Discovery</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {displayedTracks.length} song{displayedTracks.length === 1 ? '' : 's'} available
          </span>
        </div>

        {/* Discovery Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'all', label: 'All Catalog', icon: Globe },
            { id: 'popular', label: 'Popular Songs', icon: Flame },
            { id: 'new_releases', label: 'New Releases', icon: Sparkles },
            { id: 'trending', label: 'Trending Music', icon: TrendingUp },
            { id: 'recommended', label: 'Recommended', icon: Headphones },
            { id: 'favorites', label: `Favorites (${favorites.length})`, icon: Heart },
            { id: 'recent', label: `Recently Played (${recentlyPlayed.length})`, icon: Disc },
            { id: 'playlists', label: `Playlists (${playlists.length})`, icon: ListMusic },
            { id: 'local_files', label: 'Device Audio', icon: UploadCloud },
          ].map((sec) => {
            const Icon = sec.icon;
            const isSelected = discoverySection === sec.id;
            return (
              <button
                key={sec.id}
                id={`discovery-tab-${sec.id}`}
                onClick={() => {
                  setDiscoverySection(sec.id as DiscoverySection);
                  setSelectedPlaylist(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)] border border-pink-400/50'
                    : 'bg-purple-950/40 text-slate-300 hover:text-white border border-purple-800/40 hover:border-purple-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 10 INTERNATIONAL MUSIC CATEGORIES (Hindi, Bengali, English, Korean, Japanese, Chinese, Spanish, Arabic, French, International) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">10 International Categories</h3>
          </div>
          {activeCategory !== 'all' && (
            <button
              onClick={() => setActiveCategory('all')}
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold"
            >
              Reset Category
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {musicCategories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`category-card-${cat.id}`}
                onClick={() => {
                  setActiveCategory(isSelected ? 'all' : cat.id);
                  setSelectedPlaylist(null);
                }}
                className={`relative overflow-hidden p-3 rounded-2xl border text-left transition-all group flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)] bg-purple-900/60'
                    : 'border-purple-800/40 hover:border-pink-500/50 bg-[#150d2e]/80 hover:bg-purple-950/40'
                }`}
              >
                {/* Background artwork with subtle tint */}
                <img
                  src={cat.cover}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#100924] via-[#100924]/60 to-transparent" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xl">{cat.countryFlag}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                  )}
                </div>

                <div className="relative z-10">
                  <h4 className="text-xs font-bold text-white group-hover:text-pink-200 transition-colors truncate">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-cyan-300/80 truncate">{cat.language}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* LANGUAGE & COUNTRY BROWSING CONTROLS */}
      <div className="p-4 rounded-2xl bg-[#140b2a]/80 border border-purple-800/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">Filter By Country & Language:</span>
          </div>
          {(selectedCountry !== 'all' || selectedLanguage !== 'all') && (
            <button
              onClick={() => {
                setSelectedCountry('all');
                setSelectedLanguage('all');
              }}
              className="text-xs text-pink-400 hover:text-pink-300 self-start sm:self-auto font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Country selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Select Country / Region
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="all">All Countries & Regions</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Language selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Select Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="all">All Languages</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PLAYLIST DETAIL VIEW (If a playlist is open) */}
      {selectedPlaylist && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#150d2e]/90 border border-pink-500/40 shadow-[0_0_25px_rgba(236,72,153,0.2)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-pink-500/40 shrink-0">
                <img
                  src={selectedPlaylist.cover || tracks[0]?.cover || ''}
                  alt={selectedPlaylist.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-300 uppercase px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40">
                    Playlist
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedPlaylist.trackIds.length} tracks
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {selectedPlaylist.name}
                </h3>
                {selectedPlaylist.description && (
                  <p className="text-xs text-slate-300 mt-0.5">{selectedPlaylist.description}</p>
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
                  } else {
                    showToast('Playlist is empty');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(236,72,153,0.5)] transition-all"
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
                title="Close playlist view"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Playlist Tracks */}
          <div className="space-y-2">
            {selectedPlaylist.trackIds.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                This playlist has no tracks yet. Browse songs and tap "+" to add songs!
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
                        ? 'bg-pink-500/15 border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                        : 'bg-purple-950/20 border-purple-900/30 hover:bg-purple-900/30'
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
                        <div className="flex items-center gap-1.5">
                          {track.countryFlag && <span className="text-xs">{track.countryFlag}</span>}
                          <h4
                            className={`text-xs font-semibold truncate ${
                              isCurrent ? 'text-pink-300 font-bold' : 'text-white'
                            }`}
                          >
                            {track.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {track.artist}
                          {track.language && <span> • {track.language}</span>}
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
                          showToast('Removed from playlist');
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove track"
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

      {/* PLAYLISTS TAB (Grid of custom playlists) */}
      {discoverySection === 'playlists' && !selectedPlaylist && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-pink-400" />
              <span>Your Playlists ({playlists.length})</span>
            </h3>
            <button
              onClick={() => setIsCreatePlaylistOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(236,72,153,0.4)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Create Playlist
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                id={`playlist-card-${playlist.id}`}
                onClick={() => setSelectedPlaylist(playlist)}
                className="group p-3.5 rounded-2xl bg-[#160d2e]/80 border border-purple-800/40 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.25)] transition-all cursor-pointer flex flex-col justify-between"
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

      {/* SONGS CATALOG (Cards with Title, Artist, Artwork, Language, Country, Duration, Honest Playback Status) */}
      {(!selectedPlaylist || discoverySection !== 'playlists') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>
                {discoverySection === 'popular'
                  ? 'Popular Songs'
                  : discoverySection === 'new_releases'
                  ? 'New Releases'
                  : discoverySection === 'trending'
                  ? 'Trending Music'
                  : discoverySection === 'recommended'
                  ? 'Recommended Songs'
                  : discoverySection === 'favorites'
                  ? 'Favorite Tracks'
                  : discoverySection === 'recent'
                  ? 'Recently Played'
                  : discoverySection === 'local_files'
                  ? 'Your Device Audio Files'
                  : 'International Song Library'}
              </span>
              <span className="text-xs font-mono text-pink-400">
                ({displayedTracks.length})
              </span>
            </h3>

            {searchQuery && (
              <span className="text-xs text-slate-400">
                Matches for <span className="text-pink-300 font-semibold">"{searchQuery}"</span>
              </span>
            )}
          </div>

          {displayedTracks.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[#120a26]/60 border border-purple-900/40 space-y-3">
              <Music className="w-10 h-10 text-purple-400/60 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No songs found in this view</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try searching with a different language, artist, or keyword.'
                  : discoverySection === 'favorites'
                  ? 'Tap the heart icon on any song to save it to your Favorites.'
                  : discoverySection === 'local_files'
                  ? 'Tap "Play Device Audio" above to load audio files directly from your computer or phone.'
                  : 'Start playing tracks or clear your filters to view more songs.'}
              </p>
              {discoverySection === 'local_files' && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Choose Audio File
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedTracks.map((track, idx) => {
                const isCurrent = currentTrack.id === track.id;
                const isTrackFav = isFavorite(track.id);
                const isLicensedOnly = track.isPlayableInApp === false || !track.audioUrl;

                return (
                  <div
                    key={track.id}
                    id={`track-card-${track.id}`}
                    className={`group relative overflow-hidden p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#221242] to-[#170d30] border-pink-500/70 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
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

                      {/* Title, Artist, Country Flag, Language */}
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
                          {track.countryFlag && (
                            <span className="text-xs shrink-0" title={track.country}>
                              {track.countryFlag}
                            </span>
                          )}
                          <h4
                            className={`font-semibold text-xs sm:text-sm truncate transition-colors ${
                              isCurrent
                                ? 'text-pink-300 font-bold'
                                : 'text-white group-hover:text-pink-200'
                            }`}
                          >
                            {track.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mt-0.5">
                          <span className="truncate">{track.artist}</span>
                          {track.language && (
                            <span className="text-cyan-300 shrink-0">
                              • {track.language}
                            </span>
                          )}
                        </div>

                        {/* Status chip */}
                        <div className="flex items-center gap-1.5 mt-1">
                          {isLicensedOnly ? (
                            <span className="px-1.5 py-0.2 rounded bg-red-950/40 border border-red-800/40 text-[9px] font-mono text-red-300">
                              External Stream
                            </span>
                          ) : track.isLocalFile ? (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-800/40 text-[9px] font-mono text-emerald-300">
                              Device File
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-950/40 border border-cyan-800/40 text-[9px] font-mono text-cyan-300">
                              In-App Audio
                            </span>
                          )}

                          {track.country && (
                            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                              {track.country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Duration, Favorite, Playlist & External Links */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline-block">
                        {track.duration}
                      </span>

                      {/* If licensed, external quick link */}
                      {isLicensedOnly && (
                        <button
                          onClick={() => openExternalProvider(track, 'youtubeMusic')}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                          title="Open on YouTube Music"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

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

                      {/* If local file, delete local button */}
                      {track.isLocalFile && (
                        <button
                          onClick={() => {
                            removeLocalTrack(track.id);
                            showToast('Local track removed');
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                          title="Remove from Library"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EXTERNAL MUSIC SERVICES SECTION (YouTube Music, Spotify, Apple Music, SoundCloud) */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#180f33]/90 via-[#120a26]/90 to-[#190e36]/90 border border-purple-800/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold text-white">External Music Providers & Official Streaming</h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
            Legal & Licensed
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          MySpace respects artist copyrights and intellectual property. Commercial studio hits from major record labels operate under their respective platform licenses. Tap any platform below to search and stream tracks directly on official web players:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {externalMusicPlatforms.map((plat) => (
            <a
              key={plat.id}
              href={currentTrack ? plat.searchUrl(`${currentTrack.artist} ${currentTrack.title}`) : plat.homeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 hover:border-pink-500/60 hover:shadow-[0_0_15px_rgba(236,72,153,0.25)] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors flex items-center gap-1.5">
                    {plat.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-pink-400" />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">
                  {plat.tagline}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-purple-900/30 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-mono text-cyan-400">{plat.badge}</span>
                <span className="text-pink-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  Open ↗
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

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
                  placeholder="e.g., Tokyo Nights & Seoul Beats"
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
                  placeholder="e.g., International synth and chillout favorites..."
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

      {/* UNPLAYABLE / LICENSED TRACK MODAL (Honest, respectful external streaming advice) */}
      {unplayableModalTrack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#160d2e] border border-purple-800/60 rounded-3xl p-6 space-y-4 shadow-[0_0_35px_rgba(236,72,153,0.35)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={unplayableModalTrack.cover}
                  alt={unplayableModalTrack.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-purple-700"
                />
                <div>
                  <h3 className="text-base font-bold text-white truncate max-w-[220px]">
                    {unplayableModalTrack.title}
                  </h3>
                  <p className="text-xs text-cyan-300 truncate max-w-[220px]">
                    {unplayableModalTrack.artist}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUnplayableModalTrack(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Commercial Licensed Track</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-300">
                In compliance with audio licensing and copyright protection, commercial studio tracks cannot be scraped or played in an unauthorized in-app player.
              </p>
              <p className="leading-relaxed text-[11px] text-cyan-200">
                You can listen to this official release immediately on authorized streaming platforms:
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  openExternalProvider(unplayableModalTrack, 'youtubeMusic');
                  setUnplayableModalTrack(null);
                }}
                className="w-full p-2.5 rounded-xl bg-red-600/20 border border-red-500/50 hover:bg-red-600/40 text-red-200 text-xs font-semibold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-red-400" />
                  <span>Open on YouTube Music</span>
                </span>
                <span className="text-[10px] font-mono uppercase text-red-300">Official Stream →</span>
              </button>

              <button
                onClick={() => {
                  openExternalProvider(unplayableModalTrack, 'spotify');
                  setUnplayableModalTrack(null);
                }}
                className="w-full p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/40 text-emerald-200 text-xs font-semibold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                  <span>Open on Spotify</span>
                </span>
                <span className="text-[10px] font-mono uppercase text-emerald-300">Official Web →</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-purple-900/30">
              <button
                onClick={() => {
                  setUnplayableModalTrack(null);
                  fileInputRef.current?.click();
                }}
                className="text-xs text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Play Your Own MP3
              </button>
              <button
                onClick={() => setUnplayableModalTrack(null)}
                className="px-4 py-1.5 rounded-xl bg-purple-950 text-xs text-slate-300 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXTERNAL SERVICES MODAL */}
      {showExternalServicesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#160d2e] border border-purple-800/60 rounded-3xl p-6 space-y-4 shadow-[0_0_35px_rgba(236,72,153,0.35)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-pink-400" />
                <h3 className="text-lg font-bold text-white">External Music Providers</h3>
              </div>
              <button
                onClick={() => setShowExternalServicesModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Launch official streaming applications to listen to full discographies, artist albums, and official radio stations:
            </p>

            <div className="space-y-2.5">
              {externalMusicPlatforms.map((plat) => (
                <a
                  key={plat.id}
                  href={plat.homeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-purple-950/50 border border-purple-800/50 hover:border-pink-500/60 flex items-center justify-between transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                      {plat.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{plat.tagline}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono text-cyan-400">{plat.badge}</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pink-400" />
                  </div>
                </a>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowExternalServicesModal(false)}
                className="px-5 py-2 rounded-xl bg-purple-900 text-xs font-semibold text-white hover:bg-purple-800"
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
