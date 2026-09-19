import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Sparkles,
  Instagram,
  Facebook,
  Image as ImageIcon,
  CheckCircle2,
  Tag,
  Users,
  Compass,
  UserCheck,
} from 'lucide-react';
import { SocialPost, SocialUser, Friend } from '../types';
import { DiscoverPeopleView } from './DiscoverPeopleView';
import { FriendsListView } from './FriendsListView';

interface SocialViewProps {
  posts: SocialPost[];
  socialUsers: SocialUser[];
  friends: Friend[];
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onCreatePost: (newPost: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'commentsCount' | 'sharesCount'>) => void;
  onToggleFollow: (userId: string) => void;
  onSelectUser: (user: SocialUser) => void;
  onOpenNetworkList: (initialTab: 'followers' | 'following') => void;
  onOpenChat: (user: SocialUser) => void;
  onOpenChatWithFriend: (friend: Friend) => void;
  onStartVoiceCall: (user: SocialUser) => void;
  onStartVideoCall: (user: SocialUser) => void;
  onPlayGame: (user: SocialUser) => void;
  initialSubTab?: 'discover' | 'friends' | 'feed';
}

export const SocialView: React.FC<SocialViewProps> = ({
  posts,
  socialUsers,
  friends,
  onLikePost,
  onAddComment,
  onCreatePost,
  onToggleFollow,
  onSelectUser,
  onOpenNetworkList,
  onOpenChat,
  onOpenChatWithFriend,
  onStartVoiceCall,
  onStartVideoCall,
  onPlayGame,
  initialSubTab = 'discover',
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<'discover' | 'friends' | 'feed'>(initialSubTab);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Instagram' | 'Facebook' | 'MySpace'>('All');
  const [newPostText, setNewPostText] = useState('');
  const [selectedSource, setSelectedSource] = useState<'MySpace' | 'Instagram' | 'Facebook'>('MySpace');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Helper to resolve a Friend into a SocialUser for modals
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
      statusText: friend.statusText || (friend.isOnline ? 'Active now' : 'Offline'),
      isFollowing: true,
      isFollower: true,
      friendRequestStatus: 'friends',
      followersCount: 2350,
      followingCount: 340,
      mutualFriendsCount: 10,
      tags: ['#CyberFriend', '#NeonCircle', '#MySpace'],
      badges: ['💜 Best Friend'],
    };
  };

  const filteredPosts = posts.filter(
    (p) => activeFilter === 'All' || p.source === activeFilter
  );

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    onCreatePost({
      author: {
        name: 'Alex Rivera',
        handle: '@cyber_alex',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        verified: true,
      },
      source: selectedSource,
      content: newPostText.trim(),
      tags: ['#MySpaceNeon', '#CyberVibe'],
    });

    setNewPostText('');
  };

  const handleSendComment = (postId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput.trim());
    setCommentInput('');
  };

  const getSourceBadge = (source: SocialPost['source']) => {
    switch (source) {
      case 'Instagram':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-[0_0_8px_rgba(236,72,153,0.4)]">
            <Instagram className="w-3 h-3" /> Instagram Drop
          </span>
        );
      case 'Facebook':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_8px_rgba(59,130,246,0.4)]">
            <Facebook className="w-3 h-3" /> Facebook Hub
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]">
            <Sparkles className="w-3 h-3" /> MySpace Exclusive
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Section Mode Switcher: Discover People vs Friends List vs Social Feed */}
      <div className="px-4 pt-2">
        <div className="flex bg-[#120b29] p-1 rounded-2xl border border-purple-800/40 text-xs">
          <button
            id="social-subtab-discover-btn"
            onClick={() => setCurrentSubTab('discover')}
            className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentSubTab === 'discover'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-pink-400" />
            <span>Discover</span>
          </button>

          <button
            id="social-subtab-friends-btn"
            onClick={() => setCurrentSubTab('friends')}
            className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentSubTab === 'friends'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Friends ({friends.length})</span>
          </button>

          <button
            id="social-subtab-feed-btn"
            onClick={() => setCurrentSubTab('feed')}
            className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentSubTab === 'feed'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Feed</span>
          </button>
        </div>
      </div>

      {currentSubTab === 'discover' && (
        <DiscoverPeopleView
          users={socialUsers}
          onToggleFollow={onToggleFollow}
          onSelectUser={onSelectUser}
          onOpenNetworkList={onOpenNetworkList}
          onOpenChat={onOpenChat}
          onStartVoiceCall={onStartVoiceCall}
          onStartVideoCall={onStartVideoCall}
          onPlayGame={onPlayGame}
        />
      )}

      {currentSubTab === 'friends' && (
        <FriendsListView
          friends={friends}
          onOpenChat={onOpenChatWithFriend}
          onStartVoiceCall={(friend) => onStartVoiceCall(resolveFriendAsSocialUser(friend))}
          onStartVideoCall={(friend) => onStartVideoCall(resolveFriendAsSocialUser(friend))}
          onPlayGame={(friend) => onPlayGame(resolveFriendAsSocialUser(friend))}
          onOpenProfile={(friend) => onSelectUser(resolveFriendAsSocialUser(friend))}
          onDiscoverMore={() => setCurrentSubTab('discover')}
        />
      )}

      {currentSubTab === 'feed' && (
        <>
          {/* Header & Filter Tabs */}
          <div className="px-4 space-y-3">
            <div>
              <h2 className="font-display font-bold text-xl text-white">Social Feed</h2>
              <p className="text-xs text-slate-400">Stream from Instagram, Facebook & MySpace</p>
            </div>

            {/* Source Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {(['All', 'Instagram', 'Facebook', 'MySpace'] as const).map((tab) => (
                <button
                  key={tab}
                  id={`social-filter-${tab.toLowerCase()}`}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeFilter === tab
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                      : 'bg-purple-950/40 text-slate-400 hover:text-white border border-purple-800/30'
                  }`}
                >
                  {tab === 'All' ? '🌐 All Channels' : tab}
                </button>
              ))}
            </div>
          </div>

      {/* Post Composer Card */}
      <div className="px-4">
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#181132] to-[#0e0921] border border-purple-800/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <form onSubmit={handleCreatePost}>
            <div className="flex gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Alex"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-pink-500"
              />
              <textarea
                id="social-composer-input"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share your thoughts, drops or neon art..."
                rows={2}
                className="flex-1 bg-purple-950/30 border border-purple-800/30 rounded-2xl p-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-900/30">
              {/* Channel Selector */}
              <div className="flex items-center gap-1">
                {(['MySpace', 'Instagram', 'Facebook'] as const).map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setSelectedSource(source)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                      selectedSource === source
                        ? 'bg-pink-500/20 border border-pink-500 text-pink-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>

              {/* Submit Post Button */}
              <button
                id="submit-social-post-btn"
                type="submit"
                disabled={!newPostText.trim()}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_12px_rgba(236,72,153,0.5)] hover:scale-105 transition-transform"
              >
                Post Drop
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Posts Stream */}
      <div className="px-4 space-y-4">
        {filteredPosts.map((post) => {
          const isCommentsOpen = activeCommentsPostId === post.id;

          return (
            <div
              key={post.id}
              className="rounded-3xl bg-[#110c26]/90 border border-purple-800/40 overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.1)] transition-all hover:border-purple-700/50"
            >
              {/* Post Author Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-pink-500/40"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm text-white">
                        {post.author.name}
                      </h4>
                      {post.author.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {post.author.handle} • {post.timestamp}
                    </p>
                  </div>
                </div>

                {/* Platform Tag */}
                <div>{getSourceBadge(post.source)}</div>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Image Media */}
              {post.image && (
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={post.image}
                    alt="Post media"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                  />
                </div>
              )}

              {/* Post Action Bar */}
              <div className="p-3.5 flex items-center justify-between border-t border-purple-900/30">
                <div className="flex items-center gap-4">
                  {/* Like button */}
                  <button
                    id={`like-post-${post.id}`}
                    onClick={() => onLikePost(post.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-pink-400 transition-colors group"
                  >
                    <Heart
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        post.isLiked
                          ? 'fill-pink-500 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]'
                          : ''
                      }`}
                    />
                    <span className={post.isLiked ? 'font-bold text-pink-400' : ''}>
                      {post.likes}
                    </span>
                  </button>

                  {/* Comment button */}
                  <button
                    id={`toggle-comments-${post.id}`}
                    onClick={() =>
                      setActiveCommentsPostId(isCommentsOpen ? null : post.id)
                    }
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.commentsCount}</span>
                  </button>

                  {/* Share button */}
                  <button
                    id={`share-post-${post.id}`}
                    onClick={() => alert(`Shared post by ${post.author.name}!`)}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-purple-400 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{post.sharesCount}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Comments Section */}
              {isCommentsOpen && (
                <div className="p-4 bg-purple-950/20 border-t border-purple-900/30 space-y-3">
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2.5 items-start">
                          <img
                            src={comment.avatar}
                            alt={comment.user}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div className="flex-1 bg-purple-950/40 p-2.5 rounded-2xl border border-purple-900/20 text-xs">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-semibold text-white">
                                {comment.user}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {comment.time}
                              </span>
                            </div>
                            <p className="text-slate-200">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-2">
                        No comments yet. Be the first to reply!
                      </p>
                    )}
                  </div>

                  {/* Add comment input */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendComment(post.id);
                      }}
                    />
                    <button
                      id={`send-comment-${post.id}`}
                      onClick={() => handleSendComment(post.id)}
                      className="px-3 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
};
