import { Friend, ChatThread, SocialPost, Reel, MusicTrack, GameItem, NotificationItem, UserProfile, SocialUser, SharedLink } from '../types';

export const currentUser: UserProfile = {
  id: 'user_main',
  name: '',
  handle: '',
  avatar: '',
  coverImage: '',
  bio: '',
  profileSong: {
    title: '',
    artist: '',
    duration: '',
  },
  stats: {
    friends: 0,
    followers: '0',
    views: '0',
    posts: 0,
  },
  badges: [],
  top8Friends: [],
  socialLinks: {},
};

export const onlineFriends: Friend[] = [];

export const initialChatThreads: ChatThread[] = [];

export const mockSocialPosts: SocialPost[] = [];

export const mockReels: Reel[] = [
  {
    id: 'reel_1',
    creator: {
      name: 'Retro Neon',
      handle: '@retroneon',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    videoThumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    caption: 'Neon night stroll through 2008 Tokyo cyberpunk district ⚡🖤',
    audioTrack: 'MGMT - Kids (2008 Cyber Remix)',
    likes: '42.8k',
    comments: '1,240',
    tags: ['#CyberVibe', '#Y2K', '#MySpaceReels', '#RetroWave'],
    platform: 'youtube',
  },
  {
    id: 'reel_2',
    creator: {
      name: 'Scene Queen',
      handle: '@scenequeen08',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    },
    videoThumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.instagram.com/reels/',
    externalUrl: 'https://www.instagram.com/reels/',
    caption: 'Vintage record player session with original vinyl records 🎶💿',
    audioTrack: 'Paramore - Misery Business (Acoustic)',
    likes: '35.4k',
    comments: '892',
    tags: ['#Paramore', '#SceneCore', '#Emo2008'],
    platform: 'instagram',
  },
  {
    id: 'reel_3',
    creator: {
      name: 'Pixel Arcade',
      handle: '@pixelnostalgia',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    },
    videoThumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.facebook.com/reel/',
    externalUrl: 'https://www.facebook.com/reel/',
    caption: 'Playing 16-bit classics on CRT monitors late at night 🕹️✨',
    audioTrack: 'Crystal Castles - Untrust Us',
    likes: '18.9k',
    comments: '430',
    tags: ['#PixelArt', '#RetroGaming', '#Arcade'],
    platform: 'facebook',
  },
  {
    id: 'reel_4',
    creator: {
      name: 'Garage Band 08',
      handle: '@garageband08',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    videoThumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/shorts/aCyGvGEtOwc',
    caption: 'Live indie basement jam session with full tube amps 🎸🔥',
    audioTrack: 'The Killers - Mr. Brightside (Live Basement)',
    likes: '51.2k',
    comments: '2,110',
    tags: ['#IndieRock', '#LiveMusic', '#BasementJam'],
    platform: 'youtube',
  },
];

export const mockTracks: MusicTrack[] = [];

export const mockNotifications: NotificationItem[] = [];

export const mockSocialUsers: SocialUser[] = [];

export const mockSharedLinks: SharedLink[] = [];

export const mockGames: GameItem[] = [
  {
    id: 'game_tictactoe',
    title: 'Tic-Tac-Toe',
    category: 'Strategy & Duels',
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=500&q=80',
    rating: 4.9,
    playersOnline: 1,
    isMiniGamePlayable: true,
    gameType: 'reflex',
  },
  {
    id: 'game_rps',
    title: 'Rock Paper Scissors',
    category: 'Hand Battle Vs AI',
    thumbnail: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=500&q=80',
    rating: 4.8,
    playersOnline: 1,
    isMiniGamePlayable: true,
  },
  {
    id: 'game_memory',
    title: 'Memory Match',
    category: 'Brain & Cyber Cards',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
    rating: 4.9,
    playersOnline: 1,
    isMiniGamePlayable: true,
  },
  {
    id: 'game_numberguess',
    title: 'Number Guessing',
    category: 'Quantum Logic Code',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80',
    rating: 4.7,
    playersOnline: 1,
    isMiniGamePlayable: true,
  },
];
