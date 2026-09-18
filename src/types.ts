export type TabType = 'home' | 'chat' | 'social' | 'games' | 'profile';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverImage: string;
  bio: string;
  profileSong: {
    title: string;
    artist: string;
    duration: string;
  };
  stats: {
    friends: number;
    followers: string;
    views: string;
  };
  top8Friends: Friend[];
  badges: string[];
}

export interface Friend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isOnline: boolean;
  statusText?: string;
  storyImage?: string;
  hasUnreadStory?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatThread {
  id: string;
  friend: Friend;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: Message[];
}

export interface SocialPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  source: 'Instagram' | 'Facebook' | 'MySpace';
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  sharesCount: number;
  tags?: string[];
  comments?: {
    id: string;
    user: string;
    avatar: string;
    text: string;
    time: string;
  }[];
}

export interface Reel {
  id: string;
  creator: {
    name: string;
    handle: string;
    avatar: string;
  };
  videoThumbnail: string;
  caption: string;
  audioTrack: string;
  likes: string;
  comments: string;
  tags: string[];
}

export interface HubItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  category: 'social' | 'media' | 'entertainment';
  actionTab?: TabType;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  avatar?: string;
  type: 'like' | 'chat' | 'game' | 'system' | 'mention';
  isRead: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  audioUrl?: string;
  isPlaying?: boolean;
}

export interface GameItem {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  rating: number;
  playersOnline: number;
  isMiniGamePlayable?: boolean;
  gameType?: 'reflex' | 'matrix' | 'runner';
}
