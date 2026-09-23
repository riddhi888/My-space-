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
} from 'lucide-react';
import { SocialPost, UserProfile } from '../types';
import { UserAvatar } from './UserAvatar';

interface SocialViewProps {
  posts: SocialPost[];
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onCreatePost: (newPost: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'commentsCount' | 'sharesCount'>) => void;
  onShowToast?: (msg: string) => void;
  currentUser?: UserProfile;
  onSelectFriendProfile?: (friendName: string) => void;
}

export const SocialView: React.FC<SocialViewProps> = ({
  posts,
  onLikePost,
  onAddComment,
  onCreatePost,
  onShowToast,
  currentUser,
  onSelectFriendProfile,
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Instagram' | 'Facebook' | 'MySpace'>('All');
  const [newPostText, setNewPostText] = useState('');
  const [selectedSource, setSelectedSource] = useState<'MySpace' | 'Instagram' | 'Facebook'>('MySpace');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const filteredPosts = posts.filter(
    (p) => activeFilter === 'All' || p.source === activeFilter
  );

  const handleSharePost = (post: SocialPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    }
    if (onShowToast) onShowToast(`🔗 Post link by ${post.author.name} copied!`);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    onCreatePost({
      author: {
        name: currentUser ? currentUser.name : 'MySpace User',
        handle: currentUser ? currentUser.handle : '@myspace_user',
        avatar: currentUser ? currentUser.avatar : '',
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
      {/* Header & Filter Tabs */}
      <div className="px-4 pt-2 space-y-3">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Social Feed</h2>
          <p className="text-xs text-slate-400">Stream from Instagram, Facebook & MySpace</p>
        </div>

        {/* Source Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'All', label: '🌐 All Channels' },
            { id: 'Instagram', label: '📸 Instagram' },
            { id: 'Facebook', label: '👥 Facebook' },
            { id: 'MySpace', label: '✨ MySpace Community' },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`social-filter-${tab.id.toLowerCase()}`}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                  : 'bg-purple-950/40 text-slate-400 hover:text-white border border-purple-800/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post Composer Card */}
      <div className="px-4">
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#181132] to-[#0e0921] border border-purple-800/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <form onSubmit={handleCreatePost}>
            <div className="flex gap-3">
              <UserAvatar
                name={currentUser ? currentUser.name : 'User'}
                avatar={currentUser ? currentUser.avatar : ''}
                size="md"
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
                <div
                  onClick={() => onSelectFriendProfile?.(post.author.name)}
                  className="flex items-center gap-3 cursor-pointer group/author"
                  title={`View ${post.author.name}'s profile`}
                >
                  <UserAvatar
                    name={post.author.name}
                    avatar={post.author.avatar}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm text-white group-hover/author:text-pink-300 transition-colors">
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

              {/* Post Video or Image Media */}
              {post.videoUrl ? (
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  {playingVideoId === post.id ? (
                    <iframe
                      src={`${post.videoUrl}?autoplay=1`}
                      title="Post video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div
                      onClick={() => setPlayingVideoId(post.id)}
                      className="relative w-full h-full cursor-pointer group/vid"
                    >
                      <img
                        src={post.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover group-hover/vid:scale-102 transition-transform duration-500 filter brightness-90"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.8)] group-hover/vid:scale-110 transition-transform">
                          <span className="text-xl ml-1">▶</span>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-cyan-300">
                        EMBEDDED VIDEO
                      </div>
                    </div>
                  )}
                </div>
              ) : post.image ? (
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={post.image}
                    alt="Post media"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                  />
                </div>
              ) : null}

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
                    onClick={() => handleSharePost(post)}
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
                          <UserAvatar
                            name={comment.user}
                            avatar={comment.avatar}
                            size="xs"
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
    </div>
  );
};
