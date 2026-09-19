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

const FAVORITES_STORAGE_KEY = 'myspace_music_favorites_v1';
const PLAYLISTS_STORAGE_KEY = 'myspace_music_playlists_v1';
const RECENT_STORAGE_KEY = 'myspace_music_recent_v1';

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks] = useState<MusicTrack[]>(demoTracks);
  const [currentQueue, setCurrentQueue] = useState<MusicTrack[]>(demoTracks);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(demoTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [audioError, setAudioError] = useState<string | null>(null);

  // Persistent Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['track_1', 'track_3', 'track_5'];
    } catch {
      return ['track_1', 'track_3', 'track_5'];
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
      return stored ? JSON.parse(stored) : ['track_1', 'track_2'];
    } catch {
      return ['track_1', 'track_2'];
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
      setAudioError('Audio stream could not be loaded or played. Please try another track.');
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

    // Initial volume
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
      audio.src = '';
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

  // Keep volume & mute in sync
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

    // Record in recently played (max 20)
    setRecentlyPlayed((prev) => [track.id, ...prev.filter((id) => id !== track.id)].slice(0, 20));

    // Fallback duration from track object if metadata takes time
    if (track.duration) {
      const parsed = parseTimeString(track.duration);
      if (parsed > 0) setDuration(parsed);
    }

    if (track.audioUrl) {
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
          setAudioError('Tap Play button to initiate playback (browser audio policy or network stream).');
        });
    } else {
      setIsPlaying(false);
      setAudioError('No audio stream URL available for this track.');
    }
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
          setAudioError('Audio playback failed or was blocked. Click play to retry.');
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
    // If more than 3 seconds in, restart the song
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
      name: name.trim() || 'My Neon Playlist',
      description: description?.trim() || 'Curated cyberpunk tracks',
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
