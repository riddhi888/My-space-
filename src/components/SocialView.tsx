import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Sparkles,
  Instagram,
  Facebook,
  Image as ImageIcon,
  Camera,
  CheckCircle2,
  Tag,
  Users,
  Compass,
  UserCheck,
  X,
  Film,
  Upload,
  Plus,
  Radio,
  Flame,
} from 'lucide-react';
import { SocialPost, SocialUser, Friend, UserProfile, Reel } from '../types';
import { DiscoverPeopleView } from './DiscoverPeopleView';
import { FriendsListView } from './FriendsListView';

interface SocialViewProps {
  posts: SocialPost[];
  socialUsers: SocialUser[];
  friends: Friend[];
  currentUser: UserProfile;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onCreatePost: (newPost: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'commentsCount' | 'sharesCount'>) => void;
  onCreateReel?: (newReel: { caption: string; videoThumbnail: string; soundTitle: string; soundArtist: string }) => void;
  onToggleFollow: (userId: string) => void;
  onSelectUser: (user: SocialUser) => void;
  onOpenNetworkList: (initialTab: 'followers' | 'following') => void;
  onOpenChat: (user: SocialUser) => void;
  onOpenChatWithFriend: (friend: Friend) => void;
  onStartVoiceCall: (user: SocialUser) => void;
  onStartVideoCall: (user: SocialUser) => void;
  onPlayGame: (user: SocialUser) => void;
  onOpenReels?: () => void;
  initialSubTab?: 'discover' | 'friends' | 'feed';
}

export const SocialView: React.FC<SocialViewProps> = ({
  posts,
  socialUsers,
  friends,
  currentUser,
  onLikePost,
  onAddComment,
  onCreatePost,
  onCreateReel,
  onToggleFollow,
  onSelectUser,
  onOpenNetworkList,
  onOpenChat,
  onOpenChatWithFriend,
  onStartVoiceCall,
  onStartVideoCall,
  onPlayGame,
  onOpenReels,
  initialSubTab = 'discover',
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<'discover' | 'friends' | 'feed'>(initialSubTab);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Instagram' | 'Facebook' | 'MySpace'>('All');
  const [newPostText, setNewPostText] = useState('');
  const [selectedSource, setSelectedSource] = useState<'MySpace' | 'Instagram' | 'Facebook'>('MySpace');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Media Attachment State
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Camera Capture State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Reel Creation State
  const [isCreateReelOpen, setIsCreateReelOpen] = useState(false);
  const [reelCaption, setReelCaption] = useState('');
  const [reelSoundTitle, setReelSoundTitle] = useState('Cyber Wave Anthem');
  const [reelSoundArtist, setReelSoundArtist] = useState(currentUser.name);
  const [reelMediaUrl, setReelMediaUrl] = useState(
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80'
  );
  const reelFileInputRef = useRef<HTMLInputElement>(null);

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

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Camera for Live Snap
  const handleStartCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        cameraStreamRef.current = stream;
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          cameraVideoRef.current.play();
        }
      } else {
        setCameraError('Camera API not supported in this browser window.');
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError('Camera access denied or unavailable. You can upload an image file instead.');
    }
  };

  const handleStopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCapturePhoto = () => {
    if (!cameraVideoRef.current) return;
    const video = cameraVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setAttachedImage(dataUrl);
    }
    handleStopCamera();
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !attachedImage) return;

    onCreatePost({
      author: {
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
        verified: true,
      },
      source: selectedSource,
      content: newPostText.trim(),
      image: attachedImage || undefined,
      tags: ['#MySpaceNeon', '#CyberVibe'],
    });

    setNewPostText('');
    setAttachedImage(null);
  };

  const handleReelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReelMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelCaption.trim()) return;

    if (onCreateReel) {
      onCreateReel({
        caption: reelCaption.trim(),
        videoThumbnail: reelMediaUrl,
        soundTitle: reelSoundTitle.trim() || 'Neon Nights',
        soundArtist: reelSoundArtist.trim() || currentUser.name,
      });
    }

    setIsCreateReelOpen(false);
    setReelCaption('');
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
    <div className="space-y-4 pb-24 animate-in fade-in">
      {/* Top Section Mode Switcher */}
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
          {/* Header & Filter Tabs & Reels Button */}
          <div className="px-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-xl text-white">Social Feed</h2>
                <p className="text-xs text-slate-400">Stream from MySpace & Connected Hubs</p>
              </div>

              <div className="flex items-center gap-2">
                {onOpenReels && (
                  <button
                    id="open-watch-reels-btn"
                    onClick={onOpenReels}
                    className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-pink-300 border border-purple-700/50 text-xs font-bold flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer shadow-sm"
                  >
                    <Flame className="w-3.5 h-3.5 text-pink-400" />
                    <span>Watch Reels</span>
                  </button>
                )}
                {/* Create Reel Quick Action */}
                <button
                  id="open-create-reel-btn"
                  onClick={() => setIsCreateReelOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-fuchsia-500/30 flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Create Reel</span>
                </button>
              </div>
            </div>

            {/* Source Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {(['All', 'Instagram', 'Facebook', 'MySpace'] as const).map((tab) => (
                <button
                  key={tab}
                  id={`social-filter-${tab.toLowerCase()}`}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#181132] to-[#0e0921] border border-purple-800/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] space-y-3">
              <form onSubmit={handleCreatePost}>
                <div className="flex gap-3">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border-2 border-pink-500 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-950 flex items-center justify-center text-pink-400 border-2 border-pink-500 shrink-0 text-sm font-bold font-mono">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <textarea
                      id="social-composer-input"
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder={`What's on your mind, ${currentUser.name}? Share photos or neon art...`}
                      rows={2}
                      className="w-full bg-purple-950/30 border border-purple-800/30 rounded-2xl p-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 resize-none"
                    />

                    {/* Attached Image Preview */}
                    {attachedImage ? (
                      <div className="relative inline-block rounded-2xl overflow-hidden border border-purple-700/60 shadow-lg">
                        <img
                          src={attachedImage}
                          alt="Attachment preview"
                          className="max-h-48 rounded-2xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setAttachedImage(null)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors shadow-md"
                          title="Remove attached image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Media Attachment Controls Bar */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-purple-900/40">
                  <div className="flex items-center gap-2">
                    {/* Upload Photo Button */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      id="composer-attach-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-pink-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Upload photo from device"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                      <span>Photo</span>
                    </button>

                    {/* Camera Capture Button */}
                    <button
                      type="button"
                      id="composer-camera-btn"
                      onClick={handleStartCamera}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-cyan-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Snap live photo with camera"
                    >
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Camera</span>
                    </button>

                    {/* Source Tag Selector */}
                    <div className="hidden sm:flex items-center gap-1 pl-2">
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
                  </div>

                  {/* Submit Post Button */}
                  <button
                    id="submit-social-post-btn"
                    type="submit"
                    disabled={!newPostText.trim() && !attachedImage}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_12px_rgba(236,72,153,0.5)] hover:scale-105 transition-transform cursor-pointer"
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
                  id={`post-${post.id}`}
                  className="rounded-3xl bg-[#110c26]/90 border border-purple-800/40 overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.1)] transition-all hover:border-purple-700/50"
                >
                  {/* Post Author Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {post.author.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-pink-500/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-950 flex items-center justify-center text-pink-400 border border-pink-500/40 text-xs font-bold font-mono">
                          {post.author.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
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
                  {post.image ? (
                    <div className="w-full max-h-96 overflow-hidden bg-black/40">
                      <img
                        src={post.image}
                        alt="Post media"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  ) : null}

                  {/* Post Actions Bar */}
                  <div className="p-4 pt-3 flex items-center justify-between border-t border-purple-900/30">
                    <div className="flex items-center gap-4">
                      {/* Like Button */}
                      <button
                        id={`post-like-btn-${post.id}`}
                        onClick={() => onLikePost(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          post.isLiked
                            ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]'
                            : 'text-slate-400 hover:text-pink-300'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${post.isLiked ? 'fill-pink-500' : ''}`}
                        />
                        <span>{post.likes}</span>
                      </button>

                      {/* Comments Toggle Button */}
                      <button
                        id={`post-comments-btn-${post.id}`}
                        onClick={() =>
                          setActiveCommentsPostId(isCommentsOpen ? null : post.id)
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentsCount}</span>
                      </button>

                      {/* Share Button */}
                      <button
                        id={`post-share-btn-${post.id}`}
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `${post.author.name} on MySpace`,
                              text: post.content,
                              url: window.location.href,
                            }).catch(() => {});
                          }
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{post.sharesCount}</span>
                      </button>
                    </div>
                  </div>

                  {/* Expandable Comments Drawer */}
                  {isCommentsOpen && (
                    <div className="px-4 pb-4 border-t border-purple-900/20 bg-purple-950/20 pt-3 space-y-3 animate-in fade-in">
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="flex items-start gap-2.5 text-xs bg-[#0b0818] p-2.5 rounded-2xl border border-purple-900/40"
                            >
                              {comment.avatar ? (
                                <img
                                  src={comment.avatar}
                                  alt={comment.user}
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-purple-950 flex items-center justify-center text-pink-400 shrink-0 mt-0.5 text-[9px] font-bold font-mono">
                                  {comment.user ? comment.user.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-pink-300">
                                    {comment.user}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {comment.time}
                                  </span>
                                </div>
                                <p className="text-slate-300 mt-0.5 break-words">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-500 text-center py-2">
                            No comments yet. Be the first to chime in!
                          </p>
                        )}
                      </div>

                      {/* Comment Input */}
                      <div className="flex items-center gap-2">
                        <input
                          id={`comment-input-${post.id}`}
                          type="text"
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendComment(post.id);
                          }}
                          placeholder="Write a cyber comment..."
                          className="flex-1 bg-black/50 border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                        />
                        <button
                          id={`send-comment-btn-${post.id}`}
                          onClick={() => handleSendComment(post.id)}
                          className="p-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white shadow-md shadow-pink-500/40 cursor-pointer"
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

      {/* CAMERA MODAL */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e0a1f] border border-purple-800/60 p-5 space-y-4 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-pink-300 font-bold text-sm">
                <Camera className="w-4 h-4" />
                <span>MySpace Camera Capture</span>
              </div>
              <button
                onClick={handleStopCamera}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs space-y-2">
                <p>{cameraError}</p>
                <button
                  onClick={() => {
                    handleStopCamera();
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-900 text-white font-semibold text-xs"
                >
                  Choose File Instead
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-square bg-black border border-purple-700/50">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                  <div className="absolute inset-0 border-2 border-pink-500/30 rounded-2xl pointer-events-none" />
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    id="snap-photo-btn"
                    onClick={handleCapturePhoto}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-400 hover:brightness-110 text-white font-bold text-xs shadow-[0_0_20px_rgba(236,72,153,0.5)] flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Photo</span>
                  </button>
                  <button
                    onClick={handleStopCamera}
                    className="px-4 py-2.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-slate-300 text-xs hover:bg-purple-900/60 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REEL CREATOR MODAL */}
      {isCreateReelOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e0a1f] border border-fuchsia-800/60 p-5 space-y-4 shadow-[0_0_50px_rgba(217,70,239,0.3)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-fuchsia-300 font-bold text-sm">
                <Film className="w-4 h-4" />
                <span>Create MySpace Reel</span>
              </div>
              <button
                onClick={() => setIsCreateReelOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReel} className="space-y-3.5">
              {/* Thumbnail / Video Preview */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Video / Thumbnail
                </label>
                <div className="relative rounded-2xl overflow-hidden aspect-[9/12] bg-purple-950/40 border border-purple-800/50 max-h-56 mx-auto flex items-center justify-center">
                  {reelMediaUrl ? (
                    <img
                      src={reelMediaUrl}
                      alt="Reel preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      No Media Selected
                    </div>
                  )}
                  <input
                    type="file"
                    ref={reelFileInputRef}
                    accept="video/*,image/*"
                    onChange={handleReelFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => reelFileInputRef.current?.click()}
                    className="absolute bottom-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-fuchsia-500/50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Upload Clip</span>
                  </button>
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Caption</label>
                <input
                  type="text"
                  value={reelCaption}
                  onChange={(e) => setReelCaption(e.target.value)}
                  placeholder="Neon midnight drive in Tokyo ⚡"
                  className="w-full px-3 py-2 bg-black/50 border border-purple-800/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
                  required
                />
              </div>

              {/* Sound Audio Track */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Audio Track</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={reelSoundTitle}
                    onChange={(e) => setReelSoundTitle(e.target.value)}
                    placeholder="Track Title"
                    className="px-3 py-1.5 bg-black/50 border border-purple-800/50 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                  <input
                    type="text"
                    value={reelSoundArtist}
                    onChange={(e) => setReelSoundArtist(e.target.value)}
                    placeholder="Artist Name"
                    className="px-3 py-1.5 bg-black/50 border border-purple-800/50 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs shadow-[0_0_20px_rgba(217,70,239,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Publish to Reels</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
