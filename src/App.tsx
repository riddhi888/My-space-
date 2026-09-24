import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { TabType, Friend, SocialPost, MessageAttachment, UserProfile } from './types';
import {
  currentUser as initialUser,
  onlineFriends as initialFriends,
  allFriends,
  initialChatThreads,
  mockSocialPosts,
  mockReels,
  mockTracks,
  mockGames,
  mockNotifications,
  demoUsers,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { MusicView } from './components/MusicView';
import { ChatView } from './components/ChatView';
import { SocialView } from './components/SocialView';
import { GamesView } from './components/GamesView';
import { ProfileView } from './components/ProfileView';
import { ReelsView } from './components/ReelsView';
import { ReelsModal } from './components/ReelsModal';
import { YouTubeModal } from './components/YouTubeModal';
import { StoryModal } from './components/StoryModal';
import { NotificationModal } from './components/NotificationModal';
import { AuthView } from './components/AuthView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AddFriendModal } from './components/AddFriendModal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('myspace_registered_users');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return demoUsers;
  });

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('myspace_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return initialUser;
  });

  const handleUpdateUserProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updated };
      try {
        localStorage.setItem('myspace_user_profile', JSON.stringify(nextUser));
      } catch (e) {
        // ignore
      }
      return nextUser;
    });
  };
  const [allFriendsList, setAllFriendsList] = useState<Friend[]>(allFriends);
  const [friends, setFriends] = useState(initialFriends);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [chatThreads, setChatThreads] = useState(initialChatThreads);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(mockSocialPosts);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Modals state
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [isYouTubeOpen, setIsYouTubeOpen] = useState(false);
  const [selectedStoryFriend, setSelectedStoryFriend] = useState<Friend | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleRegisterUser = (newUser: UserProfile) => {
    setRegisteredUsers((prev) => {
      const updated = [newUser, ...prev];
      try {
        localStorage.setItem('myspace_registered_users', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleLoginSuccess = (authenticatedUser: UserProfile, message?: string) => {
    setUser(authenticatedUser);
    try {
      localStorage.setItem('myspace_user_profile', JSON.stringify(authenticatedUser));
    } catch (e) {
      // ignore
    }
    setIsLoggedIn(true);
    // Explicit requirement: After login, show the actual MySpace Home dashboard
    setCurrentTab('home');
    setActiveChatId(null);
    if (message) {
      showToast(message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveChatId(null);
    showToast('Logged out of MySpace. Welcome back anytime!');
  };

  const handleAddFriend = (newFriend: Friend) => {
    setAllFriendsList((prev) => [newFriend, ...prev]);
    if (newFriend.isOnline) {
      setFriends((prev) => [newFriend, ...prev]);
    }
    setUser((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        friends: (prev.stats?.friends || 0) + 1,
      },
      top8Friends: prev.top8Friends.length < 8 ? [...prev.top8Friends, newFriend] : prev.top8Friends,
    }));
    showToast(`Added ${newFriend.name} to friends! ✨`);
  };

  // Unread counts
  const unreadChatCount = chatThreads.reduce((acc, t) => acc + t.unreadCount, 0);
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

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

  const handleSendMessage = (
    chatId: string,
    text: string,
    attachment?: MessageAttachment
  ) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      text,
      timestamp: 'Just now',
      isMe: true,
      status: 'sent' as const,
      attachment,
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
      id: `post_${Date.now()}`,
      timestamp: 'Just now',
      likes: 1,
      isLiked: true,
      commentsCount: 0,
      sharesCount: 0,
      comments: [],
    };
    setSocialPosts([newPost, ...socialPosts]);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleUpdateBio = (newBio: string) => {
    setUser((prev) => ({ ...prev, bio: newBio }));
  };

  // If not logged in, display the Welcome screen & Auth flow
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#090714] text-slate-100 flex justify-center selection:bg-pink-500 selection:text-white">
        <div className="w-full max-w-md min-h-screen flex flex-col bg-[#0b0818] relative shadow-[0_0_60px_rgba(168,85,247,0.2)] border-x border-purple-900/30">
          <AuthView
            onLoginSuccess={handleLoginSuccess}
            registeredUsers={registeredUsers}
            onRegisterUser={handleRegisterUser}
          />

          {/* Floating In-App Toast Banner */}
          {toastMessage && (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[80] max-w-[90%] px-4 py-2.5 rounded-2xl bg-[#1a1236]/95 border border-pink-500/60 shadow-[0_0_25px_rgba(236,72,153,0.5)] backdrop-blur-md text-white text-xs font-medium flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-pink-400 shrink-0 animate-spin" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090714] text-slate-100 flex justify-center">
      {/* Mobile-first centered frame */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-[#0b0818] relative shadow-[0_0_60px_rgba(168,85,247,0.2)] border-x border-purple-900/30">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setActiveChatId(null);
            setCurrentTab(tab);
          }}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSearch={() => {
            setCurrentTab('home');
            const searchInput = document.getElementById('home-search-input');
            searchInput?.focus();
          }}
          currentUser={user}
          onLogout={handleLogout}
        />

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'home' && (
            <HomeView
              onSelectTab={(tab) => {
                setActiveChatId(null);
                setCurrentTab(tab);
              }}
              onlineFriends={friends}
              recentChats={chatThreads}
              reels={mockReels}
              tracks={mockTracks}
              onOpenReels={() => setIsReelsOpen(true)}
              onOpenYouTube={() => setIsYouTubeOpen(true)}
              onOpenStory={(friend) => setSelectedStoryFriend(friend)}
              onOpenChatThread={handleOpenChatThread}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              unreadNotificationsCount={unreadNotificationsCount}
              currentUser={user}
              onOpenEditProfile={() => setCurrentTab('profile')}
              onOpenAddFriend={() => setIsAddFriendModalOpen(true)}
            />
          )}

          {currentTab === 'music' && (
            <MusicView
              tracks={mockTracks}
              currentUser={user}
              onSetProfileAnthem={(song: any) => {
                handleUpdateUserProfile({ profileSong: song });
              }}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'chat' && (
            <ChatView
              chatThreads={chatThreads}
              allFriends={allFriendsList}
              onlineFriends={friends}
              activeChatId={activeChatId}
              onSelectChat={(id) => setActiveChatId(id)}
              onSendMessage={handleSendMessage}
              onOpenChatWithFriend={handleOpenChatWithFriend}
              onNavigateToGames={() => setCurrentTab('games')}
              onOpenAddFriend={() => setIsAddFriendModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'social' && (
            <SocialView
              posts={socialPosts}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onCreatePost={handleCreatePost}
              onShowToast={showToast}
              currentUser={user}
              onSelectFriendProfile={(name) => {
                const f = allFriendsList.find((fr) => fr.name.toLowerCase() === name.toLowerCase());
                if (f) handleOpenChatWithFriend(f);
              }}
            />
          )}

          {currentTab === 'games' && (
            <GamesView
              games={mockGames}
              currentUser={user}
              friends={allFriendsList}
              onOpenAddFriend={() => setIsAddFriendModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'reels' && (
            <ReelsView
              reels={mockReels}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              user={user}
              allFriends={allFriendsList}
              onOpenChatWithFriend={handleOpenChatWithFriend}
              onOpenAddFriend={() => setIsAddFriendModalOpen(true)}
              onUpdateBio={handleUpdateBio}
              onUpdateProfile={handleUpdateUserProfile}
              onSelectTab={(tab) => setCurrentTab(tab)}
              onShowToast={showToast}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Floating In-App Toast Banner */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] max-w-[90%] px-4 py-2.5 rounded-2xl bg-[#1a1236]/95 border border-pink-500/60 shadow-[0_0_25px_rgba(236,72,153,0.5)] backdrop-blur-md text-white text-xs font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400 shrink-0 animate-spin" />
            <span>{toastMessage}</span>
          </div>
        )}

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
          reels={mockReels}
          onShowToast={showToast}
        />

        <YouTubeModal
          isOpen={isYouTubeOpen}
          onClose={() => setIsYouTubeOpen(false)}
          onShowToast={showToast}
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
        />

        <AddFriendModal
          isOpen={isAddFriendModalOpen}
          onClose={() => setIsAddFriendModalOpen(false)}
          onAddFriend={handleAddFriend}
        />

        {/* Offline Status Toast */}
        <OfflineIndicator />
      </div>
    </div>
  );
}
