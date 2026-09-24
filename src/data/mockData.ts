import { Friend, ChatThread, SocialPost, Reel, MusicTrack, GameItem, NotificationItem, UserProfile } from '../types';

export const currentUser: UserProfile = {
  id: 'user_riddhi',
  name: 'Riddhi Das',
  handle: '@riddhi',
  email: 'riddhidas836@gmail.com',
  password: 'password123',
  avatar: '', // Clean initials avatar displayed by default
  coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  bio: '⚡ Navigating the neon cyber-realm on MySpace 2008. Music lover, coder & digital curator.',
  statusText: '⚡ Online & dreaming in neon',
  profileSong: {
    title: 'Resonance & Neon Dreams',
    artist: 'Lazerhawk & HOME',
    duration: '3:42',
  },
  stats: {
    friends: 0,
    followers: '0',
    following: '0',
    views: '1',
  },
  badges: ['⭐ MySpace Pioneer', '🎧 Synthwave VIP', '🕹️ Arcade Champion', '🔥 Active Member'],
  top8Friends: [],
};

// No fake demo friends seeded by default - real friends are added by user
export const allFriends: Friend[] = [];

export const onlineFriends: Friend[] = [];

export const initialChatThreads: ChatThread[] = [];

export const mockSocialPosts: SocialPost[] = [
  {
    id: 'post_1',
    author: {
      name: 'MySpace Official',
      handle: '@myspace',
      avatar: '',
      verified: true,
    },
    source: 'MySpace',
    content: 'Welcome to the modern MySpace 2008 experience! Customize your profile, rank your Top 8 friends, set your favorite profile anthem, and duel in the Neon Arcade! ✨🚀',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colored-fluorescent-lights-in-the-dark-42988-large.mp4',
    originalUrl: 'https://myspace.com',
    timestamp: '1h ago',
    likes: 1240,
    isLiked: true,
    commentsCount: 88,
    sharesCount: 34,
    tags: ['#MySpace2008', '#Welcome', '#SocialVibes'],
    comments: [],
  },
  {
    id: 'post_2',
    author: {
      name: 'Modular Synth Lab',
      handle: '@synth_lab',
      avatar: '',
      verified: true,
    },
    source: 'Instagram',
    content: 'Just dropped a brand new synthwave mix on the Music tab! Turn up the volume and let us know which track is your favorite 🎧💜',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-neon-lights-41484-large.mp4',
    originalUrl: 'https://www.instagram.com/reel/C8zK1jRLlqQ/',
    timestamp: '2h ago',
    likes: 852,
    isLiked: false,
    commentsCount: 42,
    sharesCount: 19,
    tags: ['#Synthwave', '#MusicDrop', '#NeonBeats'],
    comments: [],
  },
  {
    id: 'post_3',
    author: {
      name: 'Cyber City Visions',
      handle: '@cyber_city',
      avatar: '',
      verified: false,
    },
    source: 'Facebook',
    content: 'Midnight photo walk through the city rain reflections. The purple and cyan street lamps are pure cyber energy 🌧️📸',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-microscopic-view-40742-large.mp4',
    originalUrl: 'https://www.facebook.com/reel/1015892348572834',
    timestamp: '4h ago',
    likes: 640,
    isLiked: false,
    commentsCount: 28,
    sharesCount: 12,
    tags: ['#CyberCity', '#NightPhotography', '#NeonRain'],
    comments: [],
  },
  {
    id: 'post_4',
    author: {
      name: 'Synth Horizon',
      handle: '@synth_horizon',
      avatar: '',
      verified: true,
    },
    source: 'MySpace',
    content: 'YouTube Shorts drop: 80s analog bass synthesis in real-time. Turn up your subwoofers! ⚡🎛️',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    originalUrl: 'https://www.youtube.com/shorts/5qap5aO4i9A',
    timestamp: '5h ago',
    likes: 934,
    isLiked: false,
    commentsCount: 37,
    sharesCount: 22,
    tags: ['#YouTubeShorts', '#AnalogSynth', '#BassDrop'],
    comments: [],
  },
];

export const mockReels: Reel[] = [
  { id: 'dQw4w9WgXcQ', platform: 'youtube', title: 'My YouTube Short', username: '@riddhi' },
  { id: 'C12345xyz', platform: 'instagram', title: 'My Insta Reel', username: '@riddhi' },
  { id: '123456789', platform: 'facebook', title: 'My FB Reel', username: '@riddhi' },
  { id: '5qap5aO4i9A', platform: 'youtube', title: 'Cyber City Driving Vibes', username: '@neon_rider' },
  { id: 'kJQP7kiw5Fk', platform: 'youtube', title: 'Retro Arcade CRT Restoration', username: '@arcade_lab' },
  { id: 'C8zK1jRLlqQ', platform: 'instagram', title: 'Modular Synth Ambient Jam', username: '@synth_lab' },
  { id: '1015892348572834', platform: 'facebook', title: 'Microscopic Circuit Board Glow', username: '@cyber_city' },
];

export const mockTracks: MusicTrack[] = [
  {
    id: 'track_1',
    title: 'Resonance & Neon Dreams',
    artist: 'Lazerhawk & HOME',
    album: 'Cyber Horizon 2008',
    duration: '3:42',
    coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    genre: 'Synthwave / Chillwave',
    plays: '1.2M',
  },
  {
    id: 'track_2',
    title: 'Midnight City Beats',
    artist: 'The Midnight & Gunship',
    album: 'Endless Summer Days',
    duration: '4:15',
    coverArt: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
    genre: 'Retrowave / Electro',
    plays: '890k',
  },
  {
    id: 'track_3',
    title: 'Tech Noir Highway',
    artist: 'GUNSHIP & Carpenter Brut',
    album: 'Dark Synth Chronicles',
    duration: '3:58',
    coverArt: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
    genre: 'Darksynth / Cyberpunk',
    plays: '2.4M',
  },
  {
    id: 'track_4',
    title: 'Sunset Overdrive',
    artist: 'HOME & Com Truise',
    album: 'Analog Memories',
    duration: '3:20',
    coverArt: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    genre: 'Chillwave',
    plays: '670k',
  },
  {
    id: 'track_5',
    title: 'Arcade Odyssey 1984',
    artist: 'Kavinsky & Miami Nights 1984',
    album: 'Outrun the Grid',
    duration: '4:02',
    coverArt: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    genre: 'Outrun / Retro Electro',
    plays: '1.8M',
  },
];

export const mockGames: GameItem[] = [
  {
    id: 'game_reflex',
    title: 'Cyber Reflex Tap',
    category: 'Speed & Reflex',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80',
    rating: 4.8,
    playersOnline: 1420,
    isMiniGamePlayable: true,
    gameType: 'reflex',
  },
  {
    id: 'game_memory',
    title: 'Memory Matrix 2008',
    category: 'Puzzle & Focus',
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80',
    rating: 4.7,
    playersOnline: 980,
    isMiniGamePlayable: true,
    gameType: 'memory',
  },
  {
    id: 'game_runner',
    title: 'Synthwave Neon Runner',
    category: 'Arcade Rush',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=80',
    rating: 4.9,
    playersOnline: 2150,
    isMiniGamePlayable: true,
    gameType: 'runner',
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Welcome to MySpace 2008!',
    message: 'Your profile has been created. Customize your anthem and add friends to get started.',
    time: 'Just now',
    isRead: false,
    type: 'system',
  },
  {
    id: 'notif_2',
    title: 'Arcade Daily Challenge',
    message: 'Score over 1,500 points in Cyber Reflex Tap to earn the Neon Badge!',
    time: '1h ago',
    isRead: false,
    type: 'system',
  },
  {
    id: 'notif_3',
    title: 'Synth & Cyber Beats Playlist Updated',
    message: 'New synthwave tracks have been added to the MySpace player.',
    time: '2h ago',
    isRead: true,
    type: 'system',
  },
];

export const presetAvatars = [
  { id: 'av_initials', name: 'Clean Initials (Default)', url: '' },
];

export const demoUsers: UserProfile[] = [
  currentUser,
];
