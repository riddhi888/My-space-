import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { MusicTrack, Playlist } from '../types';
import { demoTracks, defaultPlaylists } from '../data/musicData';

interface MusicContextType {
  tracks: MusicTrack[];
  currentTrack: MusicTrack;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  favorites: string[];
  playlists: Playlist[];
  recentlyPlayed: string[];
  audioError: string | null;
  currentQueue: MusicTrack[];
  isLoading: boolean;
  userTracks: MusicTrack[];
  unplayableModalTrack: MusicTrack | null;
  setUnplayableModalTrack: (track: MusicTrack | null) => void;
  addLocalTrack: (file: File) => Promise<MusicTrack>;
  removeLocalTrack: (trackId: string) => void;
  openExternalProvider: (track: MusicTrack, platform?: 'youtubeMusic' | 'spotify' | 'appleMusic') => void;
  playTrack: (track: MusicTrack, newQueue?: MusicTrack[]) => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  clearError: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'myspace_music_favorites_v2';
const PLAYLISTS_STORAGE_KEY = 'myspace_music_playlists_v2';
const RECENT_STORAGE_KEY = 'myspace_music_recent_v2';
const USER_TRACKS_STORAGE_KEY = 'myspace_music_user_tracks_v2';
const PREFS_STORAGE_KEY = 'myspace_music_prefs_v2';

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User uploaded local audio tracks
  const [userTracks, setUserTracks] = useState<MusicTrack[]>(() => {
    try {
      const stored = localStorage.getItem(USER_TRACKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Master tracklist: user-uploaded tracks + international curated catalog
  const tracks = useMemo<MusicTrack[]>(() => {
    return [...userTracks, ...demoTracks];
  }, [userTracks]);

  const [currentQueue, setCurrentQueue] = useState<MusicTrack[]>(() => [...userTracks, ...demoTracks]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(() => userTracks[0] || demoTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Stored Preferences (volume, repeat, shuffle)
  const savedPrefs = useMemo<{
    volume?: number;
    isMuted?: boolean;
    isShuffle?: boolean;
    repeatMode?: 'off' | 'all' | 'one';
  } | null>(() => {
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const [volume, setVolumeState] = useState<number>(
    typeof savedPrefs?.volume === 'number' ? savedPrefs.volume : 0.8
  );
  const [isMuted, setIsMuted] = useState<boolean>(
    typeof savedPrefs?.isMuted === 'boolean' ? savedPrefs.isMuted : false
  );
  const [isShuffle, setIsShuffle] = useState<boolean>(
    typeof savedPrefs?.isShuffle === 'boolean' ? savedPrefs.isShuffle : false
  );
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>(
    savedPrefs?.repeatMode === 'off' || savedPrefs?.repeatMode === 'one' ? savedPrefs.repeatMode : 'all'
  );
  const [audioError, setAudioError] = useState<string | null>(null);
  const [unplayableModalTrack, setUnplayableModalTrack] = useState<MusicTrack | null>(null);

  // Persistent Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['track_hi_1', 'track_bn_1', 'track_en_1', 'track_ko_1', 'track_ja_1'];
    } catch {
      return ['track_hi_1', 'track_bn_1', 'track_en_1', 'track_ko_1', 'track_ja_1'];
    }
  });

  // Persistent Playlists
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultPlaylists;
    } catch {
      return defaultPlaylists;
    }
  });

  // Persistent Recently Played
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['track_hi_1', 'track_en_1'];
    } catch {
      return ['track_hi_1', 'track_en_1'];
    }
  });

  // HTML5 Audio Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setAudioError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setAudioError('Audio stream could not be loaded or played. Please try another track or upload an audio file.');
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNextTrack();
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    audio.volume = volume;
    audio.muted = isMuted;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  // Save favorites
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }, [favorites]);

  // Save playlists
  useEffect(() => {
    try {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    } catch (e) {
      console.error('Failed to save playlists', e);
    }
  }, [playlists]);

  // Save recently played
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentlyPlayed));
    } catch (e) {
      console.error('Failed to save recent tracks', e);
    }
  }, [recentlyPlayed]);

  // Save user tracks (metadata without large blob data)
  useEffect(() => {
    try {
      // Save user tracks metadata
      const serializableTracks = userTracks.map(t => ({
        ...t,
        // Blob URLs expire across browser reloads, but metadata persists
      }));
      localStorage.setItem(USER_TRACKS_STORAGE_KEY, JSON.stringify(serializableTracks));
    } catch (e) {
      console.error('Failed to save user tracks', e);
    }
  }, [userTracks]);

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({ volume, isMuted, isShuffle, repeatMode })
      );
    } catch (e) {
      console.error('Failed to save music preferences', e);
    }
  }, [volume, isMuted, isShuffle, repeatMode]);

  // Keep volume & mute in sync with HTML5 audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Parse duration helper (converts "MM:SS" string into seconds)
  const parseTimeString = (str: string): number => {
    if (!str) return 0;
    const parts = str.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  // Play a specific track
  const playTrack = (track: MusicTrack, newQueue?: MusicTrack[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (newQueue && newQueue.length > 0) {
      setCurrentQueue(newQueue);
    }

    setAudioError(null);
    setCurrentTrack(track);

    // Record in recently played (max 25)
    setRecentlyPlayed((prev) => [track.id, ...prev.filter((id) => id !== track.id)].slice(0, 25));

    // Check if this track is a licensed commercial track not playable in-app
    if (track.isPlayableInApp === false || !track.audioUrl) {
      audio.pause();
      setIsPlaying(false);
      setIsLoading(false);
      setAudioError(
        `"${track.title}" is a licensed track. Full streaming requires an authorized music provider like YouTube Music or Spotify.`
      );
      setUnplayableModalTrack(track);
      return;
    }

    // Set fallback duration from track object if metadata takes time
    if (track.duration) {
      const parsed = parseTimeString(track.duration);
      if (parsed > 0) setDuration(parsed);
    }

    setIsLoading(true);
    if (audio.src !== track.audioUrl) {
      audio.src = track.audioUrl;
      audio.load();
    }
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Autoplay/playback error:', err);
        setIsPlaying(false);
        setIsLoading(false);
        setAudioError('Tap Play to initiate playback (browser autoplay policy or connection).');
      });
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      pauseTrack();
    } else {
      if (currentTrack.isPlayableInApp === false || !currentTrack.audioUrl) {
        setUnplayableModalTrack(currentTrack);
        setAudioError(
          `"${currentTrack.title}" requires official YouTube Music or Spotify streaming.`
        );
        return;
      }

      setAudioError(null);
      if (!audio.src && currentTrack.audioUrl) {
        audio.src = currentTrack.audioUrl;
        audio.load();
      }
      setIsLoading(true);
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Audio play failed:', err);
          setIsPlaying(false);
          setIsLoading(false);
          setAudioError('Audio playback failed or was blocked by browser. Click Play to retry.');
        });
    }
  };

  const handleNextTrack = () => {
    const queue = currentQueue.length > 0 ? currentQueue : tracks;
    if (queue.length === 0) return;

    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
      if (currentIndex === -1) {
        nextIndex = 0;
      } else if (currentIndex < queue.length - 1) {
        nextIndex = currentIndex + 1;
      } else {
        if (repeatMode === 'off') {
          pauseTrack();
          return;
        }
        nextIndex = 0;
      }
    }

    playTrack(queue[nextIndex]);
  };

  const prevTrack = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const queue = currentQueue.length > 0 ? currentQueue : tracks;
    if (queue.length === 0) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    let prevIndex = queue.length - 1;
    if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    }
    playTrack(queue[prevIndex]);
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(seconds, duration || 3600));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const setVolume = (level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const isFavorite = (trackId: string) => favorites.includes(trackId);

  const createPlaylist = (name: string, description?: string): Playlist => {
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}`,
      name: name.trim() || 'My International Playlist',
      description: description?.trim() || 'Curated international music tracks',
      cover: currentTrack.cover || demoTracks[0].cover,
      trackIds: [currentTrack.id],
      createdAt: 'Just now',
    };
    setPlaylists((prev) => [newPlaylist, ...prev]);
    return newPlaylist;
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      })
    );
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
        }
        return p;
      })
    );
  };

  const clearError = () => {
    setAudioError(null);
  };

  // Add a local audio file from user's device
  const addLocalTrack = async (file: File): Promise<MusicTrack> => {
    const audioUrl = URL.createObjectURL(file);
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .trim();

    // Default duration estimate or read via temporary audio object
    let calculatedDuration = '3:30';
    try {
      const tempAudio = new Audio(audioUrl);
      await new Promise<void>((resolve) => {
        tempAudio.onloadedmetadata = () => {
          const m = Math.floor(tempAudio.duration / 60);
          const s = Math.floor(tempAudio.duration % 60);
          calculatedDuration = `${m}:${s < 10 ? '0' : ''}${s}`;
          resolve();
        };
        tempAudio.onerror = () => resolve();
        setTimeout(resolve, 1500);
      });
    } catch {
      // Fallback duration
    }

    const newTrack: MusicTrack = {
      id: `local_track_${Date.now()}`,
      title: cleanName || 'Local Device Audio',
      artist: 'Device Storage',
      album: 'My Uploads',
      genre: 'Local Audio',
      language: 'User Device',
      country: 'My Device',
      countryFlag: '💾',
      category: 'local',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
      duration: calculatedDuration,
      audioUrl: audioUrl,
      isPlayableInApp: true,
      isLocalFile: true,
      releaseYear: 'Local File',
      audioNote: 'Direct playback from your device file system',
      externalLinks: {
        youtubeMusic: `https://music.youtube.com/search?q=${encodeURIComponent(cleanName)}`,
        spotify: `https://open.spotify.com/search/${encodeURIComponent(cleanName)}`,
      },
    };

    setUserTracks((prev) => [newTrack, ...prev]);
    playTrack(newTrack);
    return newTrack;
  };

  const removeLocalTrack = (trackId: string) => {
    setUserTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  // Helper to open an external service for a track
  const openExternalProvider = (track: MusicTrack, platform: 'youtubeMusic' | 'spotify' | 'appleMusic' = 'youtubeMusic') => {
    const q = `${track.artist} ${track.title}`;
    let targetUrl = `https://music.youtube.com/search?q=${encodeURIComponent(q)}`;

    if (platform === 'spotify') {
      targetUrl = track.externalLinks?.spotify || `https://open.spotify.com/search/${encodeURIComponent(q)}`;
    } else if (platform === 'appleMusic') {
      targetUrl = track.externalLinks?.appleMusic || `https://music.apple.com/search?term=${encodeURIComponent(q)}`;
    } else {
      targetUrl = track.externalLinks?.youtubeMusic || `https://music.youtube.com/search?q=${encodeURIComponent(q)}`;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const contextValue = useMemo(
    () => ({
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
      currentQueue,
      isLoading,
      userTracks,
      unplayableModalTrack,
      setUnplayableModalTrack,
      addLocalTrack,
      removeLocalTrack,
      openExternalProvider,
      playTrack,
      pauseTrack,
      togglePlay,
      nextTrack: handleNextTrack,
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
    }),
    [
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
      currentQueue,
      isLoading,
      userTracks,
      unplayableModalTrack,
    ]
  );

  return <MusicContext.Provider value={contextValue}>{children}</MusicContext.Provider>;
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
