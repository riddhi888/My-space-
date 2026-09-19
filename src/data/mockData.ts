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

export const mockReels: Reel[] = [];

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
