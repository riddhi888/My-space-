import { UserProfile, UserAccount, ConnectedPlatform, ConnectedAppAccount, Friend, ChatThread, SocialPost, NotificationItem, UserSettings } from '../types';
import {
  currentUser as defaultUserAlex,
  onlineFriends as defaultFriends,
  initialChatThreads as defaultChats,
  mockSocialPosts as defaultPosts,
  mockNotifications as defaultNotifications,
} from '../data/mockData';

const ACTIVE_USER_ID_KEY = 'myspace_active_user_id_v2';
const ACCOUNTS_STORE_KEY = 'myspace_registered_accounts_v2';

// Seed default independent accounts
export const SEED_ACCOUNTS: UserAccount[] = [
  {
    id: 'user_alex',
    email: 'alex.rivera@cyberneon.net',
    password: 'CyberNeon2026!',
    profile: {
      ...defaultUserAlex,
      id: 'user_alex',
    },
    connectedApps: {
      instagram: { platform: 'instagram', isConnected: false },
      facebook: { platform: 'facebook', isConnected: false },
      youtube: { platform: 'youtube', isConnected: false },
    },
    createdAt: '2026-01-15T12:00:00Z',
  },
  {
    id: 'user_elena',
    email: 'elena.rostova@cyberneon.net',
    password: 'CyberNeon2026!',
    profile: {
      id: 'user_elena',
      name: 'Elena Rostova',
      handle: '@elena_glitch',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      bio: 'Cyberpunk DJ & Visual Artist. Spinning dark wave synthesizers in Tokyo night alleys. 🎧⚡',
      profileSong: {
        title: 'Neo-Tokyo Resonance',
        artist: 'Elena Rostova',
        duration: '4:15',
      },
      stats: {
        friends: 412,
        followers: '14.8k',
        views: '92.4k',
        posts: 42,
      },
      top8Friends: [
        {
          id: 'user_alex',
          name: 'Alex Rivera',
          handle: '@cyber_alex',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          isOnline: true,
          statusText: 'Hacking neon matrix ⚡',
        },
        {
          id: 'f2',
          name: 'Kai Takahashi',
          handle: '@kai_tokyo',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          isOnline: true,
          statusText: 'Designing 3D holographic sets',
        },
      ],
      badges: ['🎵 Resident DJ', '⚡ Glitch Master', 'Verified Artist'],
    },
    connectedApps: {
      instagram: { platform: 'instagram', isConnected: false },
      facebook: { platform: 'facebook', isConnected: false },
      youtube: { platform: 'youtube', isConnected: false },
    },
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'user_kai',
    email: 'kai.takahashi@cyberneon.net',
    password: 'CyberNeon2026!',
    profile: {
      id: 'user_kai',
      name: 'Kai Takahashi',
      handle: '@kai_tokyo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
      bio: 'Motion Graphics engineer & AR developer. Creating next-gen interactive Cyber visuals.',
      profileSong: {
        title: 'Holographic Dreams',
        artist: 'Kai x SynthLab',
        duration: '3:45',
      },
      stats: {
        friends: 290,
        followers: '8.4k',
        views: '45.1k',
        posts: 28,
      },
      top8Friends: [
        {
          id: 'user_alex',
          name: 'Alex Rivera',
          handle: '@cyber_alex',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          isOnline: true,
        },
      ],
      badges: ['🕹️ AR Architect', '🎨 Visual Wizard'],
    },
    connectedApps: {
      instagram: { platform: 'instagram', isConnected: false },
      facebook: { platform: 'facebook', isConnected: false },
      youtube: { platform: 'youtube', isConnected: false },
    },
    createdAt: '2026-02-10T14:30:00Z',
  },
];

export class AccountService {
  /**
   * Returns all registered user accounts stored in client storage
   */
  static getAllAccounts(): UserAccount[] {
    try {
      const stored = localStorage.getItem(ACCOUNTS_STORE_KEY);
      if (stored) {
        const parsed: UserAccount[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read stored accounts, loading seed accounts:', e);
    }
    // Initialize with seed accounts
    this.saveAllAccounts(SEED_ACCOUNTS);
    return SEED_ACCOUNTS;
  }

  static saveAllAccounts(accounts: UserAccount[]): void {
    try {
      localStorage.setItem(ACCOUNTS_STORE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts to storage:', e);
    }
  }

  /**
   * Get the current active user account ID
   */
  static getActiveUserId(): string | null {
    try {
      return localStorage.getItem(ACTIVE_USER_ID_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Set active user account ID
   */
  static setActiveUserId(userId: string | null): void {
    try {
      if (userId) {
        localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
      } else {
        localStorage.removeItem(ACTIVE_USER_ID_KEY);
      }
    } catch (e) {
      console.error('Failed to set active user ID:', e);
    }
  }

  /**
   * Retrieve active account object
   */
  static getActiveAccount(): UserAccount | null {
    const activeId = this.getActiveUserId();
    const accounts = this.getAllAccounts();
    if (!activeId) return accounts[0] || null;
    return accounts.find((a) => a.id === activeId) || accounts[0] || null;
  }

  /**
   * Register a brand new unique MySpace user account (no secrets or password required)
   */
  static registerAccount(data: {
    name: string;
    handle: string;
    email?: string;
    password?: string;
    bio?: string;
    avatar?: string;
  }): { success: boolean; account?: UserAccount; error?: string } {
    const accounts = this.getAllAccounts();
    const cleanHandle = data.handle.trim().startsWith('@')
      ? data.handle.trim()
      : `@${data.handle.trim()}`;

    // Validate uniqueness of handle and email
    if (accounts.some((a) => a.profile.handle.toLowerCase() === cleanHandle.toLowerCase())) {
      return { success: false, error: 'That username/handle is already registered on MySpace.' };
    }

    if (data.email && accounts.some((a) => a.email.toLowerCase() === data.email!.trim().toLowerCase())) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAccount: UserAccount = {
      id: newId,
      email: data.email?.trim() || `${cleanHandle.replace('@', '')}@myspace.demo`,
      password: data.password || 'guest',
      profile: {
        id: newId,
        name: data.name.trim(),
        handle: cleanHandle,
        avatar:
          data.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        coverImage:
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        bio:
          data.bio?.trim() ||
          'New MySpace explorer in Guest Mode. Sharing cyberpunk vibes, music, and connecting with friends.',
        profileSong: {
          title: 'Electric Horizon',
          artist: 'MySpace Sound Lab',
          duration: '3:30',
        },
        stats: {
          friends: 1,
          followers: '0',
          views: '1',
          posts: 0,
        },
        top8Friends: [
          {
            id: 'user_alex',
            name: 'Alex Rivera',
            handle: '@cyber_alex',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            isOnline: true,
            statusText: 'Welcome to MySpace! 🚀',
          },
        ],
        badges: ['⭐ Guest Explorer', '💜 MySpace Member'],
      },
      connectedApps: {
        instagram: { platform: 'instagram', isConnected: false },
        facebook: { platform: 'facebook', isConnected: false },
        youtube: { platform: 'youtube', isConnected: false },
      },
      createdAt: new Date().toISOString(),
    };

    const updated = [...accounts, newAccount];
    this.saveAllAccounts(updated);
    this.setActiveUserId(newId);

    // Seed default welcome chat and notification for this new user
    this.initializeUserDataForAccount(newId, newAccount.profile);

    return { success: true, account: newAccount };
  }

  /**
   * Instantly generate or enter a Guest session with zero passwords or secrets
   */
  static createGuestSession(name?: string, handle?: string): UserAccount {
    const accounts = this.getAllAccounts();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const guestHandle = handle || `@guest_${randomSuffix}`;
    const guestName = name || `Guest Explorer ${randomSuffix}`;

    const res = this.registerAccount({
      name: guestName,
      handle: guestHandle,
      bio: 'Cyberpunk explorer enjoying MySpace in 100% Guest Mode.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    });

    if (res.success && res.account) {
      this.setActiveUserId(res.account.id);
      return res.account;
    }

    const defaultAcc = accounts[0] || SEED_ACCOUNTS[0];
    this.setActiveUserId(defaultAcc.id);
    return defaultAcc;
  }

  /**
   * Update profile for a specific user ID
   */
  static updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): UserAccount | null {
    const accounts = this.getAllAccounts();
    const index = accounts.findIndex((a) => a.id === userId);
    if (index === -1) return null;

    accounts[index].profile = {
      ...accounts[index].profile,
      ...updates,
    };

    this.saveAllAccounts(accounts);
    return accounts[index];
  }

  /**
   * Update connected apps for a specific user
   */
  static updateConnectedApp(
    userId: string,
    platform: ConnectedPlatform,
    appData: ConnectedAppAccount
  ): UserAccount | null {
    const accounts = this.getAllAccounts();
    const index = accounts.findIndex((a) => a.id === userId);
    if (index === -1) return null;

    accounts[index].connectedApps[platform] = appData;
    this.saveAllAccounts(accounts);
    return accounts[index];
  }

  /**
   * Update an entire UserAccount object
   */
  static updateAccount(updatedAccount: UserAccount): void {
    const accounts = this.getAllAccounts();
    const index = accounts.findIndex((a) => a.id === updatedAccount.id);
    if (index !== -1) {
      accounts[index] = updatedAccount;
      this.saveAllAccounts(accounts);
    } else {
      this.saveAllAccounts([...accounts, updatedAccount]);
    }
  }

  /**
   * Per-user data storage helpers to guarantee isolated state
   */
  static getUserDataKey(userId: string, itemType: string): string {
    return `myspace_user_${userId}_${itemType}`;
  }

  static initializeUserDataForAccount(userId: string, profile: UserProfile): void {
    // Isolated chat threads
    const welcomeChat: ChatThread[] = [
      {
        id: `chat_welcome_${userId}`,
        friend: {
          id: 'user_alex',
          name: 'Alex Rivera',
          handle: '@cyber_alex',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          isOnline: true,
        },
        lastMessage: `Hey ${profile.name}! Welcome to MySpace. Feel free to explore chat, music, games and reels! ⚡`,
        timestamp: 'Just now',
        unreadCount: 1,
        messages: [
          {
            id: `msg_welcome_${Date.now()}`,
            senderId: 'user_alex',
            text: `Hey ${profile.name}! Welcome to your personal MySpace account! 🎧 Check out the music player and invite your friends.`,
            timestamp: 'Just now',
            isMe: false,
          },
        ],
      },
    ];

    // Isolated welcome notification
    const welcomeNotif: NotificationItem[] = [
      {
        id: `notif_welcome_${Date.now()}`,
        type: 'system',
        title: 'Account Created',
        message: `Welcome to MySpace, ${profile.name}! Your independent user profile is now active.`,
        time: 'Just now',
        isRead: false,
      },
    ];

    try {
      localStorage.setItem(this.getUserDataKey(userId, 'chats'), JSON.stringify(welcomeChat));
      localStorage.setItem(this.getUserDataKey(userId, 'notifications'), JSON.stringify(welcomeNotif));
    } catch (e) {
      console.error('Error initializing user data:', e);
    }
  }

  static getSavedChats(userId: string): ChatThread[] {
    try {
      const data = localStorage.getItem(this.getUserDataKey(userId, 'chats'));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    return defaultChats;
  }

  static saveUserChats(userId: string, chats: ChatThread[]): void {
    try {
      localStorage.setItem(this.getUserDataKey(userId, 'chats'), JSON.stringify(chats));
    } catch (e) {
      console.error(e);
    }
  }

  static getSavedPosts(userId: string): SocialPost[] {
    try {
      const data = localStorage.getItem(this.getUserDataKey(userId, 'posts'));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    return defaultPosts;
  }

  static saveUserPosts(userId: string, posts: SocialPost[]): void {
    try {
      localStorage.setItem(this.getUserDataKey(userId, 'posts'), JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }

  static getSavedNotifications(userId: string): NotificationItem[] {
    try {
      const data = localStorage.getItem(this.getUserDataKey(userId, 'notifications'));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    return defaultNotifications;
  }

  static saveUserNotifications(userId: string, notifs: NotificationItem[]): void {
    try {
      localStorage.setItem(this.getUserDataKey(userId, 'notifications'), JSON.stringify(notifs));
    } catch (e) {
      console.error(e);
    }
  }
}
