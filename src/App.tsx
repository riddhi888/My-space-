import React, { useState } from 'react';
import { TabType, Friend, SocialPost } from './types';
import {
  currentUser as initialUser,
  onlineFriends as initialFriends,
  initialChatThreads,
  mockSocialPosts,
  mockReels,
  mockTracks,
  mockGames,
  mockNotifications,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ChatView } from './components/ChatView';
import { SocialView } from './components/SocialView';
import { GamesView } from './components/GamesView';
import { ProfileView } from './components/ProfileView';
import { ReelsModal } from './components/ReelsModal';
import { YouTubeModal } from './components/YouTubeModal';
import { StoryModal } from './components/StoryModal';
import { NotificationModal } from './components/NotificationModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [user, setUser] = useState(initialUser);
  const [friends, setFriends] = useState(initialFriends);
  const [chatThreads, setChatThreads] = useState(initialChatThreads);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(mockSocialPosts);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Modals state
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [isYouTubeOpen, setIsYouTubeOpen] = useState(false);
  const [selectedStoryFriend, setSelectedStoryFriend] = useState<Friend | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
            />
          )}

          {currentTab === 'chat' && (
            <ChatView
              chatThreads={chatThreads}
              onlineFriends={friends}
              activeChatId={activeChatId}
              onSelectChat={(id) => setActiveChatId(id)}
              onSendMessage={handleSendMessage}
            />
          )}

          {currentTab === 'social' && (
            <SocialView
              posts={socialPosts}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onCreatePost={handleCreatePost}
            />
          )}

          {currentTab === 'games' && <GamesView games={mockGames} />}

          {currentTab === 'profile' && (
            <ProfileView
              user={user}
              onOpenChatWithFriend={handleOpenChatWithFriend}
              onUpdateBio={handleUpdateBio}
            />
          )}
        </main>

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
        />
      </div>
    </div>
  );
}
