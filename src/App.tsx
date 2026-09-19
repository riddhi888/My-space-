import React, { useState, useEffect } from 'react';
import {
  TabType,
  Friend,
  SocialPost,
  SocialUser,
  NotificationItem,
  SharedLink,
  Reel,
  UserAccount,
  ConnectedAppAccount,
  ConnectedPlatform,
  UserProfile,
} from './types';
import {
  currentUser as initialUser,
  onlineFriends as initialFriends,
  initialChatThreads,
  mockSocialPosts,
  mockReels,
  mockTracks,
  mockGames,
  mockNotifications,
  mockSocialUsers,
  mockSharedLinks,
} from './data/mockData';
import { AccountService, SEED_ACCOUNTS } from './services/accountService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ChatView } from './components/ChatView';
import { SocialView } from './components/SocialView';
import { GamesView } from './components/GamesView';
import { ProfileView } from './components/ProfileView';
import { MusicView } from './components/MusicView';
import { MiniMusicPlayer } from './components/MiniMusicPlayer';
import { MusicProvider } from './context/MusicContext';
import { ReelsModal } from './components/ReelsModal';
import { YouTubeModal } from './components/YouTubeModal';
import { StoryModal } from './components/StoryModal';
import { NotificationModal } from './components/NotificationModal';
import { UserProfileModal } from './components/UserProfileModal';
import { VoiceCallModal } from './components/VoiceCallModal';
import { VideoCallModal } from './components/VideoCallModal';
import { NetworkListModal } from './components/NetworkListModal';
import { ShareLinkModal } from './components/ShareLinkModal';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { ConnectedAppsView } from './components/ConnectedAppsView';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Account System State
  const [activeAccount, setActiveAccount] = useState<UserAccount>(() => {
    return AccountService.getActiveAccount() || SEED_ACCOUNTS[0];
  });
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // User-isolated state
  const [user, setUser] = useState<UserProfile>(() => activeAccount.profile);
  const [friends, setFriends] = useState(initialFriends);
  const [socialUsers, setSocialUsers] = useState<SocialUser[]>(mockSocialUsers);
  const [chatThreads, setChatThreads] = useState(() =>
    AccountService.getSavedChats(activeAccount.id)
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() =>
    AccountService.getSavedPosts(activeAccount.id)
  );
  const [reels, setReels] = useState<Reel[]>(mockReels);
  const [notifications, setNotifications] = useState(() =>
    AccountService.getSavedNotifications(activeAccount.id)
  );
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>(mockSharedLinks);

  // Modals state
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [selectedReelIndex, setSelectedReelIndex] = useState(0);
  const [isYouTubeOpen, setIsYouTubeOpen] = useState(false);
  const [selectedStoryFriend, setSelectedStoryFriend] = useState<Friend | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalPlatform, setShareModalPlatform] = useState<'instagram' | 'facebook' | 'youtube' | 'custom'>('instagram');
  const [shareModalUrl, setShareModalUrl] = useState('');

  // Social & Call Modals State
  const [selectedProfileUser, setSelectedProfileUser] = useState<SocialUser | null>(null);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [callUser, setCallUser] = useState<SocialUser | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [videoCallUser, setVideoCallUser] = useState<SocialUser | null>(null);
  const [isNetworkListOpen, setIsNetworkListOpen] = useState(false);
  const [networkListTab, setNetworkListTab] = useState<'followers' | 'following'>('following');

  // Unread counts
  const unreadChatCount = chatThreads.reduce((acc, t) => acc + t.unreadCount, 0);
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Social/Friends System Handlers
  const handleToggleFollow = (userId: string) => {
    setSocialUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newFollowing = !u.isFollowing;
          const updatedUser: SocialUser = {
            ...u,
            isFollowing: newFollowing,
            followersCount: newFollowing ? u.followersCount + 1 : Math.max(0, u.followersCount - 1),
          };

          // Update active profile modal if viewing this user
          if (selectedProfileUser?.id === userId) {
            setSelectedProfileUser(updatedUser);
          }

          return updatedUser;
        }
        return u;
      })
    );

    // Update current user's profile following count
    setUser((prev) => {
      const target = socialUsers.find((u) => u.id === userId);
      const isNowFollowing = !target?.isFollowing;
      const currentFollowing = prev.stats.friends || 842;
      const updatedFollowing = isNowFollowing ? currentFollowing + 1 : Math.max(0, currentFollowing - 1);
      return {
        ...prev,
        stats: {
          ...prev.stats,
          friends: updatedFollowing,
        },
      };
    });
  };

  const handleSendFriendRequest = (userId: string) => {
    setSocialUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, friendRequestStatus: 'sent' as const };
          if (selectedProfileUser?.id === userId) {
            setSelectedProfileUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    // Add confirmation notification
    const target = socialUsers.find((u) => u.id === userId);
    if (target) {
      const newNotif: NotificationItem = {
        id: `fr_sent_${Date.now()}`,
        type: 'friend_request',
        title: 'Friend Request Sent',
        message: `Your friend invitation was dispatched to ${target.name} (${target.handle}).`,
        time: 'Just now',
        isRead: false,
        avatar: target.avatar,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handleOpenSocialUserProfile = (userToView: SocialUser) => {
    setSelectedProfileUser(userToView);
  };

  const handleStartVoiceCall = (userToCall: SocialUser) => {
    setCallUser(userToCall);
    setIsVoiceCallOpen(true);
  };

  const handleStartVideoCall = (userToCall: SocialUser) => {
    setVideoCallUser(userToCall);
    setIsVideoCallOpen(true);
  };

  const resolveFriendAsSocialUser = (friend: Friend): SocialUser => {
    const existing = socialUsers.find((u) => u.id === friend.id || u.handle === friend.handle);
    if (existing) return existing;
    return {
      id: friend.id,
      name: friend.name,
      handle: friend.handle || `@${friend.name.toLowerCase().replace(/\s+/g, '_')}`,
      avatar: friend.avatar,
      coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      bio: friend.statusText || 'MySpace Cyber Voyager. Music lover, arcade gamer & digital creator.',
      isOnline: friend.isOnline,
      statusText: friend.statusText || (friend.isOnline ? 'Online now' : 'Offline'),
      isFollowing: true,
      isFollower: true,
      friendRequestStatus: 'friends',
      followersCount: 2450,
      followingCount: 380,
      mutualFriendsCount: 12,
      tags: ['#Friend', '#CyberNeon', '#MySpace'],
      badges: ['💜 Best Friend'],
    };
  };

  const handleStartVoiceCallWithFriend = (friend: Friend) => {
    const userToCall = resolveFriendAsSocialUser(friend);
    handleStartVoiceCall(userToCall);
  };

  const handleStartVideoCallWithFriend = (friend: Friend) => {
    const userToCall = resolveFriendAsSocialUser(friend);
    handleStartVideoCall(userToCall);
  };

  const handleOpenFriendProfile = (friend: Friend) => {
    const userToOpen = resolveFriendAsSocialUser(friend);
    handleOpenSocialUserProfile(userToOpen);
  };

  const handlePlayGameWithFriend = (friend: Friend) => {
    const userToPlay = resolveFriendAsSocialUser(friend);
    handlePlayGameWithUser(userToPlay);
  };

  const handlePlayGameWithUser = (userToPlay: SocialUser) => {
    // Challenge notification
    const notif: NotificationItem = {
      id: `game_inv_${Date.now()}`,
      type: 'game',
      title: 'Arcade Challenge Launched',
      message: `Challenged ${userToPlay.name} to a 1v1 match in MySpace Cyber Games!`,
      time: 'Just now',
      isRead: false,
      avatar: userToPlay.avatar,
    };
    setNotifications((prev) => [notif, ...prev]);
    setCurrentTab('games');
  };

  const handleOpenChatWithSocialUser = (socialUser: SocialUser) => {
    const friendObj: Friend = {
      id: socialUser.id,
      name: socialUser.name,
      avatar: socialUser.avatar,
      isOnline: socialUser.isOnline,
      statusText: socialUser.statusText,
      handle: socialUser.handle,
    };
    handleOpenChatWithFriend(friendObj);
  };

  const handleOpenNetworkList = (tab: 'followers' | 'following') => {
    setNetworkListTab(tab);
    setIsNetworkListOpen(true);
  };

  // Link Sharing Handlers
  const handleOpenShareLink = (platform?: 'instagram' | 'facebook' | 'youtube' | 'custom', prefillUrl?: string) => {
    if (platform) setShareModalPlatform(platform);
    setShareModalUrl(prefillUrl || '');
    setIsShareModalOpen(true);
  };

  const handleCreateSharedLink = (linkData: Omit<SharedLink, 'id' | 'likes' | 'isLiked' | 'timestamp'>) => {
    const newLink: SharedLink = {
      ...linkData,
      id: `link_${Date.now()}`,
      likes: 1,
      isLiked: true,
      timestamp: 'Just now',
    };
    setSharedLinks((prev) => [newLink, ...prev]);

    // Push notification for shared link
    const notif: NotificationItem = {
      id: `link_notif_${Date.now()}`,
      type: 'system',
      title: 'Link Shared 📲',
      message: `"${newLink.title}" was shared to your MySpace home feed!`,
      time: 'Just now',
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleLikeSharedLink = (linkId: string) => {
    setSharedLinks((prev) =>
      prev.map((l) => {
        if (l.id === linkId) {
          const isLiked = !l.isLiked;
          return {
            ...l,
            isLiked,
            likes: isLiked ? l.likes + 1 : Math.max(0, l.likes - 1),
          };
        }
        return l;
      })
    );
  };

  const handleOpenReels = (index: number = 0) => {
    setSelectedReelIndex(index);
    setIsReelsOpen(true);
  };

  const handleShareReelFromModal = (reel: Reel) => {
    handleOpenShareLink('instagram', `https://myspace.app/reels/${reel.id}`);
  };

  // HANDLERS
  const handleOpenChatThread = (chatId: string) => {
    // Reset unread count for this thread
    setChatThreads((prev) =>
      prev.map((t) => (t.id === chatId ? { ...t, unreadCount: 0 } : t))
    );
    setActiveChatId(chatId);
    setCurrentTab('chat');
  };

  const handleOpenChatWithFriend = (friend: Friend) => {
    let existingThread = chatThreads.find((t) => t.friend.id === friend.id);
    if (!existingThread) {
      const newThread = {
        id: `chat_${friend.id}`,
        friend,
        lastMessage: 'Started new conversation',
        timestamp: 'Just now',
        unreadCount: 0,
        messages: [],
      };
      setChatThreads((prev) => [newThread, ...prev]);
      setActiveChatId(newThread.id);
    } else {
      setActiveChatId(existingThread.id);
    }
    setCurrentTab('chat');
  };

  const handleSendMessage = (chatId: string, text: string) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: 'user_me',
      text,
      timestamp: 'Just now',
      isMe: true,
      status: 'sent' as const,
    };

    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id === chatId) {
          return {
            ...t,
            lastMessage: text,
            timestamp: 'Just now',
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    // Simulated quick friendly response after 1.2 seconds for realistic interaction
    setTimeout(() => {
      const replies = [
        'Awesome vibe! Love this neon energy ✨',
        'Checking this out right now!',
        'Totally agreed! Let us connect in the Arcade later 🕹️',
        'Sounds great! Catch you soon 🔥',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const friendReply = {
        id: `msg_reply_${Date.now()}`,
        senderId: 'friend',
        text: randomReply,
        timestamp: 'Just now',
        isMe: false,
        status: 'delivered' as const,
      };

      setChatThreads((prevThreads) =>
        prevThreads.map((t) => {
          if (t.id === chatId) {
            return {
              ...t,
              lastMessage: randomReply,
              timestamp: 'Just now',
              messages: [...t.messages, friendReply],
            };
          }
          return t;
        })
      );
    }, 1200);
  };

  const handleLikePost = (postId: string) => {
    setSocialPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    setSocialPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: `c_${Date.now()}`,
            user: user.name,
            avatar: user.avatar,
            text,
            time: 'Just now',
          };
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [...(post.comments || []), newComment],
          };
        }
        return post;
      })
    );
  };

  const handleCreatePost = (
    newPostData: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'commentsCount' | 'sharesCount'>
  ) => {
    const newPost: SocialPost = {
      ...newPostData,
      id: `post_user_${Date.now()}`,
      timestamp: 'Just now',
      likes: 1,
      isLiked: true,
      commentsCount: 0,
      sharesCount: 0,
      comments: [],
    };
    setSocialPosts((prev) => {
      const updated = [newPost, ...prev];
      AccountService.saveUserPosts(activeAccount.id, updated);
      return updated;
    });
  };

  const handleCreateReel = (newReelData: {
    caption: string;
    videoThumbnail: string;
    soundTitle: string;
    soundArtist: string;
  }) => {
    const newReel: Reel = {
      id: `reel_${Date.now()}`,
      creator: {
        name: user.name,
        handle: user.handle,
        avatar: user.avatar,
      },
      caption: newReelData.caption,
      videoThumbnail: newReelData.videoThumbnail,
      likes: '1',
      comments: '0',
      audioTrack: `${newReelData.soundArtist} - ${newReelData.soundTitle}`,
      tags: ['#MySpaceReels', '#CyberVibe'],
    };
    setReels((prev) => [newReel, ...prev]);
  };

  const handleUpdateConnectedApp = (
    platform: ConnectedPlatform,
    updatedApp: ConnectedAppAccount
  ) => {
    const updatedConnectedApps = {
      ...activeAccount.connectedApps,
      [platform]: updatedApp,
    };
    const updatedAccount: UserAccount = {
      ...activeAccount,
      connectedApps: updatedConnectedApps,
    };
    AccountService.updateAccount(updatedAccount);
    setActiveAccount(updatedAccount);
  };

  // NOTIFICATION HANDLERS
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleFollowBackNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isFollowingBack: true, isRead: true } : n))
    );

    // Also update social users and profile stats
    const notif = notifications.find((n) => n.id === notificationId);
    if (notif?.senderHandle) {
      setSocialUsers((prev) =>
        prev.map((u) => (u.handle === notif.senderHandle ? { ...u, isFollowing: true } : u))
      );
    }
    setUser((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        friends: (prev.stats.friends || 842) + 1,
      },
    }));
  };

  const handleAcceptFriendRequest = (notificationId: string, requesterId?: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, requestStatus: 'accepted' as const, isRead: true } : n
      )
    );

    if (requesterId) {
      setSocialUsers((prev) =>
        prev.map((u) => (u.id === requesterId ? { ...u, friendRequestStatus: 'friends' } : u))
      );
    }

    // Add new friend to friends list if not already there
    const notif = notifications.find((n) => n.id === notificationId);
    if (notif) {
      const newFriend: Friend = {
        id: requesterId || `f_${Date.now()}`,
        name: notif.senderName || notif.title,
        avatar: notif.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        isOnline: true,
        statusText: 'Connected as Friend',
        handle: notif.senderHandle || '@cyber_friend',
      };

      setFriends((prev) => {
        if (prev.some((f) => f.id === newFriend.id)) return prev;
        return [newFriend, ...prev];
      });

      setUser((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          friends: (prev.stats.friends || 842) + 1,
        },
      }));
    }
  };

  const handleDeclineFriendRequest = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, requestStatus: 'declined' as const, isRead: true } : n
      )
    );
  };

  const handleOpenChatFromNotification = (senderHandle?: string, senderName?: string) => {
    const friend = friends.find((f) => f.handle === senderHandle || f.name === senderName) || {
      id: `chat_sender_${Date.now()}`,
      name: senderName || 'Cyber Contact',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      isOnline: true,
      handle: senderHandle || '@cyber_contact',
    };
    handleOpenChatWithFriend(friend);
  };

  const handleOpenLinkFromNotification = (url?: string) => {
    if (url) {
      handleOpenShareLink('youtube', url);
    } else {
      setCurrentTab('home');
    }
  };

  const handlePlayGameFromNotification = (_gameId?: string) => {
    setCurrentTab('games');
  };

  const handleCallBackFromNotification = (senderName?: string, callType?: 'voice' | 'video') => {
    const targetUser = socialUsers.find((u) => u.name === senderName) || {
      id: `call_${Date.now()}`,
      name: senderName || 'Aria Chen',
      handle: '@aria_neon',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
      bio: 'Cyberpunk musician and streamer',
      isOnline: true,
      statusText: 'Available',
      isFollowing: true,
      isFollower: true,
      friendRequestStatus: 'friends' as const,
      followersCount: 3100,
      followingCount: 420,
      mutualFriendsCount: 15,
      tags: ['#Music', '#CyberNeon'],
      badges: ['💎 Creator'],
    };

    if (callType === 'video') {
      handleStartVideoCall(targetUser);
    } else {
      handleStartVoiceCall(targetUser);
    }
  };

  // PROFILE & SETTINGS HANDLERS
  const handleUpdateBio = (newBio: string) => {
    setUser((prev) => ({ ...prev, bio: newBio }));
  };

  const handleUpdateFullProfile = (updated: {
    name: string;
    handle: string;
    bio: string;
    avatar: string;
    coverImage: string;
  }) => {
    const updatedProfile: UserProfile = {
      ...user,
      name: updated.name,
      handle: updated.handle,
      bio: updated.bio,
      avatar: updated.avatar,
      coverImage: updated.coverImage,
    };
    setUser(updatedProfile);

    const updatedAccount: UserAccount = {
      ...activeAccount,
      profile: updatedProfile,
    };
    AccountService.updateAccount(updatedAccount);
    setActiveAccount(updatedAccount);

    // Update any user-authored posts to reflect the new profile details
    setSocialPosts((prev) => {
      const updatedPosts = prev.map((post) => {
        if (
          post.id.startsWith('post_user_') ||
          post.author.handle === user.handle ||
          post.author.name === user.name
        ) {
          return {
            ...post,
            author: {
              ...post.author,
              name: updated.name,
              handle: updated.handle,
              avatar: updated.avatar,
            },
          };
        }
        return post;
      });
      AccountService.saveUserPosts(activeAccount.id, updatedPosts);
      return updatedPosts;
    });
  };

  const handleUpdateProfileSettings = (updated: {
    name: string;
    handle: string;
    bio: string;
    avatar: string;
  }) => {
    const updatedProfile: UserProfile = {
      ...user,
      name: updated.name,
      handle: updated.handle,
      bio: updated.bio,
      avatar: updated.avatar,
    };
    setUser(updatedProfile);

    const updatedAccount: UserAccount = {
      ...activeAccount,
      profile: updatedProfile,
    };
    AccountService.updateAccount(updatedAccount);
    setActiveAccount(updatedAccount);
  };

  const handleLogout = () => {
    AccountService.setActiveUserId(null);
    setIsLoggedOut(true);
  };

  const handleLoginSuccess = (account: UserAccount) => {
    AccountService.setActiveUserId(account.id);
    setActiveAccount(account);
    setUser(account.profile);
    setChatThreads(AccountService.getSavedChats(account.id));
    setSocialPosts(AccountService.getSavedPosts(account.id));
    setNotifications(AccountService.getSavedNotifications(account.id));
    setIsLoggedOut(false);
    setCurrentTab('home');
  };

  if (isLoggedOut) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        allAccounts={AccountService.getAllAccounts()}
      />
    );
  }

  return (
    <MusicProvider>
      <div className="min-h-screen bg-[#090714] text-slate-100 flex justify-center">
      {/* Mobile-first centered frame */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-[#0b0818] relative shadow-[0_0_60px_rgba(168,85,247,0.2)] border-x border-purple-900/30">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          currentUser={user}
          onSelectTab={(tab) => {
            setActiveChatId(null);
            setCurrentTab(tab);
          }}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setCurrentTab('notifications')}
          onOpenSearch={() => {
            setCurrentTab('home');
            const searchInput = document.getElementById('home-search-input');
            searchInput?.focus();
          }}
          onOpenReels={() => handleOpenReels(0)}
          onOpenShare={() => handleOpenShareLink('instagram')}
          onOpenConnectedApps={() => setCurrentTab('connected-apps')}
        />

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'home' && (
            <HomeView
              currentUser={user}
              onSelectTab={(tab) => {
                setActiveChatId(null);
                setCurrentTab(tab);
              }}
              onlineFriends={friends}
              reels={reels}
              tracks={mockTracks}
              sharedLinks={sharedLinks}
              onOpenReels={handleOpenReels}
              onOpenStory={(friend) => setSelectedStoryFriend(friend)}
              onOpenChatThread={handleOpenChatThread}
              onOpenShareLink={handleOpenShareLink}
              onLikeSharedLink={handleLikeSharedLink}
            />
          )}

          {currentTab === 'chat' && (
            <ChatView
              chatThreads={chatThreads}
              friends={friends}
              activeChatId={activeChatId}
              onSelectChat={(id) => setActiveChatId(id)}
              onSendMessage={handleSendMessage}
              onStartVoiceCall={handleStartVoiceCallWithFriend}
              onStartVideoCall={handleStartVideoCallWithFriend}
              onOpenFriendProfile={handleOpenFriendProfile}
              onPlayGame={handlePlayGameWithFriend}
              onOpenChatWithFriend={handleOpenChatWithFriend}
            />
          )}

          {currentTab === 'social' && (
            <SocialView
              currentUser={user}
              posts={socialPosts}
              socialUsers={socialUsers}
              friends={friends}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onCreatePost={handleCreatePost}
              onCreateReel={handleCreateReel}
              onOpenReels={() => setIsReelsOpen(true)}
              onToggleFollow={handleToggleFollow}
              onSelectUser={handleOpenSocialUserProfile}
              onOpenNetworkList={handleOpenNetworkList}
              onOpenChat={handleOpenChatWithSocialUser}
              onOpenChatWithFriend={handleOpenChatWithFriend}
              onStartVoiceCall={handleStartVoiceCall}
              onStartVideoCall={handleStartVideoCall}
              onPlayGame={handlePlayGameWithUser}
            />
          )}

          {currentTab === 'games' && <GamesView games={mockGames} />}

          {currentTab === 'music' && (
            <MusicView onBackToHome={() => setCurrentTab('home')} />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              user={user}
              posts={socialPosts}
              sharedLinks={sharedLinks}
              notifications={notifications}
              unreadNotificationsCount={unreadNotificationsCount}
              onOpenNotifications={() => setCurrentTab('notifications')}
              onSelectTab={(tab) => setCurrentTab(tab)}
              onOpenChatWithFriend={handleOpenChatWithFriend}
              onUpdateProfile={handleUpdateFullProfile}
              onOpenNetworkList={handleOpenNetworkList}
              onDiscoverPeople={() => setCurrentTab('social')}
              onOpenSettings={() => setCurrentTab('settings')}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onCreatePost={() => setCurrentTab('social')}
              onLikePost={handleLikePost}
              onLikeSharedLink={handleLikeSharedLink}
              onOpenReel={handleOpenReels}
              followersCount={socialUsers.filter((u) => u.isFollower).length}
              followingCount={socialUsers.filter((u) => u.isFollowing).length}
            />
          )}

          {currentTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onBackToHome={() => setCurrentTab('home')}
              onMarkAsRead={handleDismissNotification}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
              onClearAll={handleClearAllNotifications}
              onAcceptFriendRequest={handleAcceptFriendRequest}
              onDeclineFriendRequest={handleDeclineFriendRequest}
              onFollowBack={handleFollowBackNotification}
              onOpenChat={handleOpenChatFromNotification}
              onOpenLink={handleOpenLinkFromNotification}
              onPlayGame={handlePlayGameFromNotification}
              onCallBack={handleCallBackFromNotification}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              user={user}
              onBackToProfile={() => setCurrentTab('profile')}
              onUpdateProfile={handleUpdateProfileSettings}
              onLogout={handleLogout}
              onNavigateToConnectedApps={() => setCurrentTab('connected-apps')}
            />
          )}

          {currentTab === 'connected-apps' && (
            <ConnectedAppsView
              user={user}
              connectedApps={activeAccount.connectedApps}
              onUpdateConnectedApp={handleUpdateConnectedApp}
              onBack={() => setCurrentTab('home')}
            />
          )}
        </main>

        {/* Persistent Mini Music Player (visible on all screens when not on music tab) */}
        <MiniMusicPlayer
          onOpenFullPlayer={() => setCurrentTab('music')}
          isVisible={currentTab !== 'music'}
        />

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setActiveChatId(null);
            setCurrentTab(tab);
          }}
          unreadChatCount={unreadChatCount}
        />

        {/* Modals */}
        <ReelsModal
          isOpen={isReelsOpen}
          onClose={() => setIsReelsOpen(false)}
          reels={reels}
          initialReelIndex={selectedReelIndex}
          onShareReel={handleShareReelFromModal}
        />

        <ShareLinkModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShareLink={handleCreateSharedLink}
          initialPlatform={shareModalPlatform}
          initialUrl={shareModalUrl}
        />

        <YouTubeModal
          isOpen={isYouTubeOpen}
          onClose={() => setIsYouTubeOpen(false)}
        />

        <StoryModal
          friend={selectedStoryFriend}
          onClose={() => setSelectedStoryFriend(null)}
          onOpenChatWithFriend={handleOpenChatWithFriend}
        />

        <NotificationModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotificationsRead}
          onDismissNotification={handleDismissNotification}
          onAcceptFriendRequest={handleAcceptFriendRequest}
          onDeclineFriendRequest={handleDeclineFriendRequest}
        />

        {/* Social / Friends Modals */}
        <UserProfileModal
          isOpen={!!selectedProfileUser}
          onClose={() => setSelectedProfileUser(null)}
          user={selectedProfileUser}
          onToggleFollow={handleToggleFollow}
          onSendFriendRequest={handleSendFriendRequest}
          onOpenChat={handleOpenChatWithSocialUser}
          onStartVoiceCall={handleStartVoiceCall}
          onStartVideoCall={handleStartVideoCall}
          onPlayGame={handlePlayGameWithUser}
        />

        <VoiceCallModal
          isOpen={isVoiceCallOpen}
          onClose={() => {
            setIsVoiceCallOpen(false);
            setCallUser(null);
          }}
          user={callUser}
        />

        <VideoCallModal
          isOpen={isVideoCallOpen}
          onClose={() => {
            setIsVideoCallOpen(false);
            setVideoCallUser(null);
          }}
          user={videoCallUser}
          currentUser={user}
        />

        <NetworkListModal
          isOpen={isNetworkListOpen}
          onClose={() => setIsNetworkListOpen(false)}
          initialTab={networkListTab}
          users={socialUsers}
          onToggleFollow={handleToggleFollow}
          onSelectUser={(u) => {
            setIsNetworkListOpen(false);
            setSelectedProfileUser(u);
          }}
        />
      </div>
    </div>
    </MusicProvider>
  );
}
