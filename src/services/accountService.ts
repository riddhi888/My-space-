import { UserProfile, UserAccount, ConnectedPlatform, ConnectedAppAccount, ChatThread, SocialPost, NotificationItem } from '../types';

const ACTIVE_USER_ID_KEY = 'myspace_active_user_id_v2';
const ACCOUNTS_STORE_KEY = 'myspace_registered_accounts_v2';

// No seed mock accounts - start completely fresh and empty
export const SEED_ACCOUNTS: UserAccount[] = [];

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
          // Filter out legacy demo accounts
          const cleanAccounts = parsed.filter(
            (a) => a.id !== 'user_alex' && a.id !== 'user_elena' && a.id !== 'user_kai' && a.profile.name !== 'Alex Rivera'
          );
          return cleanAccounts;
        }
      }
    } catch (e) {
      console.warn('Could not read stored accounts:', e);
    }
    return [];
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
   * Register a brand new unique MySpace user account
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
      email: data.email?.trim() || `${cleanHandle.replace('@', '')}@myspace.user`,
      password: data.password || '',
      profile: {
        id: newId,
        name: data.name.trim(),
        handle: cleanHandle,
        avatar: data.avatar || '',
        coverImage: '',
        bio: data.bio?.trim() || '',
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
        top8Friends: [],
        badges: [],
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

    return { success: true, account: newAccount };
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

  static getSavedChats(userId: string): ChatThread[] {
    try {
      const data = localStorage.getItem(this.getUserDataKey(userId, 'chats'));
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    return [];
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
    return [];
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
    return [];
  }

  static saveUserNotifications(userId: string, notifs: NotificationItem[]): void {
    try {
      localStorage.setItem(this.getUserDataKey(userId, 'notifications'), JSON.stringify(notifs));
    } catch (e) {
      console.error(e);
    }
  }
}
