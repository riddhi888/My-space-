export type TabType =
  | 'home'
  | 'music'
  | 'chat'
  | 'social'
  | 'games'
  | 'profile'
  | 'notifications'
  | 'settings'
  | 'connected-apps';

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
    posts?: number;
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
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender?: 'user' | 'other' | string;
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

export interface SharedLink {
  id: string;
  type: 'instagram' | 'facebook' | 'youtube' | 'custom';
  url: string;
  title: string;
  caption?: string;
  author: string;
  authorAvatar?: string;
  likes: number;
  isLiked?: boolean;
  timestamp: string;
  icon?: string;
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

export type NotificationType =
  | 'follower'
  | 'friend_request'
  | 'chat'
  | 'link'
  | 'game'
  | 'call'
  | 'like'
  | 'system'
  | 'mention';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  avatar?: string;
  type: NotificationType;
  isRead: boolean;
  senderName?: string;
  senderHandle?: string;
  requesterId?: string;
  requestStatus?: 'pending' | 'accepted' | 'declined';
  isFollowingBack?: boolean;
  linkUrl?: string;
  gameId?: string;
  callType?: 'voice' | 'video';
}

export interface BlockedUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  blockedAt: string;
  reason?: string;
}

export interface UserSettings {
  theme: 'neon' | 'dark' | 'electric';
  notifications: {
    pushEnabled: boolean;
    chatMessages: boolean;
    friendRequests: boolean;
    gameInvites: boolean;
    missedCalls: boolean;
    soundEffects: boolean;
    showMessagePreview: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showProfileInfo: boolean;
    whoCanMessage: 'everyone' | 'friends_only' | 'nobody';
    whoCanSendGameInvites: 'everyone' | 'friends_only' | 'nobody';
    allowDirectMessages?: 'everyone' | 'friends_only' | 'nobody';
    allowGameInvites?: boolean;
  };
}

export interface SocialUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverImage: string;
  bio: string;
  isOnline: boolean;
  statusText: string;
  isFollowing: boolean;
  isFollower: boolean;
  friendRequestStatus: 'none' | 'received' | 'sent' | 'friends';
  followersCount: number;
  followingCount: number;
  mutualFriendsCount?: number;
  profileSong?: {
    title: string;
    artist: string;
    duration: string;
  };
  anthem?: {
    title: string;
    artist: string;
    duration?: string;
  };
  badges?: string[];
  tags?: string[];
  recentGameScore?: number;
  gameTitle?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover: string;
  duration: string;
  audioUrl?: string;
  genre?: string;
  language?: string;
  country?: string;
  countryFlag?: string;
  category?:
    | 'hindi'
    | 'bengali'
    | 'english'
    | 'korean'
    | 'japanese'
    | 'chinese'
    | 'spanish'
    | 'arabic'
    | 'french'
    | 'international'
    | 'local'
    | string;
  releaseYear?: number | string;
  isPopular?: boolean;
  isNewRelease?: boolean;
  isTrending?: boolean;
  isRecommended?: boolean;
  isLocalFile?: boolean;
  isPlayableInApp?: boolean;
  audioNote?: string;
  externalLinks?: {
    spotify?: string;
    youtubeMusic?: string;
    appleMusic?: string;
  };
  isPlaying?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  country?: string;
  trackIds: string[];
  createdAt: string;
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

export type ConnectedPlatform = 'instagram' | 'facebook' | 'youtube';

export interface ConnectedAppAccount {
  platform: ConnectedPlatform;
  isConnected: boolean;
  username?: string;
  connectedAt?: string;
  profileUrl?: string;
  grantedScopes?: string[];
  externalId?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  profile: UserProfile;
  connectedApps: Record<ConnectedPlatform, ConnectedAppAccount>;
  createdAt: string;
}

