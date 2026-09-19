import React, { useState } from 'react';
import {
  Search,
  Send,
  ArrowLeft,
  Phone,
  Video,
  Smile,
  Paperclip,
  Image as ImageIcon,
  CheckCheck,
  Sparkles,
  Gamepad2,
  ExternalLink,
  Users,
  Music,
  X,
  Trash2,
  Ban,
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
} from 'lucide-react';
import { ChatThread, Friend, Message, BlockedUser } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface ChatViewProps {
  chatThreads: ChatThread[];
  friends: Friend[];
  activeChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
  onSendMessage: (chatId: string, text: string) => void;
  onStartVoiceCall: (friend: Friend) => void;
  onStartVideoCall: (friend: Friend) => void;
  onOpenFriendProfile?: (friend: Friend) => void;
  onPlayGame?: (friend: Friend) => void;
  onOpenChatWithFriend: (friend: Friend) => void;
  // Privacy & Security props
  blockedUsers?: BlockedUser[];
  onBlockUser?: (user: { id: string; name: string; handle: string; avatar: string }) => void;
  onUnblockUser?: (userId: string) => void;
  onClearChat?: (chatId: string) => void;
  whoCanMessage?: 'everyone' | 'friends_only' | 'nobody';
}

export const ChatView: React.FC<ChatViewProps> = ({
  chatThreads,
  friends,
  activeChatId,
  onSelectChat,
  onSendMessage,
  onStartVoiceCall,
  onStartVideoCall,
  onOpenFriendProfile,
  onPlayGame,
  onOpenChatWithFriend,
  blockedUsers = [],
  onBlockUser,
  onUnblockUser,
  onClearChat,
  whoCanMessage = 'everyone',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'online' | 'contacts'>('all');
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [isClearChatModalOpen, setIsClearChatModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const activeThread = chatThreads.find((c) => c.id === activeChatId);

  // Check if active user is blocked
  const isFriendBlocked = (friend: { id?: string; handle?: string; name?: string }) => {
    return blockedUsers.some(
      (b) =>
        (friend.id && b.id === friend.id) ||
        (friend.handle && b.handle === friend.handle) ||
        (friend.name && b.name === friend.name)
    );
  };

  const isActiveBlocked = activeThread ? isFriendBlocked(activeThread.friend) : false;

  const filteredThreads = chatThreads.filter((t) => {
    const matchesSearch =
      t.friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = activeTabFilter === 'online' ? t.friend.isOnline : true;
    return matchesSearch && matchesOnline;
  });

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId) return;
    if (isActiveBlocked) return;
    onSendMessage(activeChatId, messageInput.trim());
    setMessageInput('');
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
  };

  const handleSendAttachment = (type: 'photo' | 'anthem' | 'game') => {
    if (!activeChatId || isActiveBlocked) return;
    let attachmentText = '';
    if (type === 'photo') {
      attachmentText = '📷 [Shared Cyber Neon Snapshot: Night City Drops]';
    } else if (type === 'anthem') {
      attachmentText = '🎵 [Shared Track: "Resonance" by Home • 3:32]';
    } else if (type === 'game') {
      attachmentText = '🕹️ [Arcade Challenge: 1v1 Cyber Reflex Arena Match]';
    }
    onSendMessage(activeChatId, attachmentText);
    setShowAttachmentMenu(false);
  };

  const handleConfirmClearChat = () => {
    if (activeChatId && onClearChat) {
      onClearChat(activeChatId);
    }
    setIsClearChatModalOpen(false);
    setShowChatOptions(false);
  };

  const handleToggleBlock = () => {
    if (!activeThread) return;
    if (isActiveBlocked) {
      if (onUnblockUser) {
        onUnblockUser(activeThread.friend.id);
      }
    } else {
      setIsBlockModalOpen(true);
    }
    setShowChatOptions(false);
  };

  const handleConfirmBlock = () => {
    if (!activeThread) return;
    if (onBlockUser) {
      onBlockUser({
        id: activeThread.friend.id,
        name: activeThread.friend.name,
        handle: activeThread.friend.handle,
        avatar: activeThread.friend.avatar,
      });
    }
    setIsBlockModalOpen(false);
  };

  const neonEmojis = [
    '🔥', '💜', '⚡', '✨', '👾', '🚀',
    '🎮', '🎧', '🕶️', '💖', '⭐', '😎',
    '🎉', '💎', '👑', '🕹️', '🎵', '🔮',
    '🌌', '🤖', '💃', '🛸', '🍿', '💯',
  ];

  // ACTIVE 1-ON-1 CHAT SCREEN
  if (activeThread) {
    return (
      <div className="fixed inset-0 z-50 bg-[#090714] flex flex-col max-w-md mx-auto">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-[#0d091c]/95 backdrop-blur-md border-b border-purple-900/30 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="back-to-chat-list-btn"
              onClick={() => {
                setShowEmojiPicker(false);
                setShowAttachmentMenu(false);
                setShowChatOptions(false);
                onSelectChat(null);
              }}
              className="p-1.5 rounded-xl bg-purple-950/50 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Back to Chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Friend Avatar & Info (clickable to view profile) */}
            <div
              onClick={() => onOpenFriendProfile && onOpenFriendProfile(activeThread.friend)}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0"
              title="Click to view full profile"
            >
              <div className="relative shrink-0">
                <img
                  src={activeThread.friend.avatar}
                  alt={activeThread.friend.name}
                  referrerPolicy="no-referrer"
                  className={`w-10 h-10 rounded-full object-cover border-2 transition-colors ${
                    isActiveBlocked
                      ? 'border-rose-500/80 grayscale'
                      : 'border-purple-500/40 group-hover:border-pink-500'
                  }`}
                />
                {/* Online / Offline status badge */}
                {!isActiveBlocked && (
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#090714] ${
                      activeThread.friend.isOnline
                        ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                        : 'bg-slate-500'
                    }`}
                    title={activeThread.friend.isOnline ? 'Online' : 'Offline'}
                  />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-white group-hover:text-pink-300 transition-colors flex items-center gap-1.5 truncate">
                  <span className="truncate">{activeThread.friend.name}</span>
                  {isActiveBlocked && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-950/80 text-[10px] text-rose-300 border border-rose-800/40 font-mono shrink-0">
                      Blocked
                    </span>
                  )}
                </h3>
                <p className="text-[11px] font-mono flex items-center gap-1 truncate">
                  {isActiveBlocked ? (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <Ban className="w-3 h-3 text-rose-400" />
                      Blocked User
                    </span>
                  ) : activeThread.friend.isOnline ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active now
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      {activeThread.friend.lastSeen
                        ? `Last seen ${activeThread.friend.lastSeen}`
                        : 'Offline'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Direct Action Buttons: Voice Call, Video Call, Play Game, & More Options */}
          <div className="flex items-center gap-1.5 shrink-0 relative">
            {/* Voice Call Button */}
            <button
              id="chat-voice-call-btn"
              disabled={isActiveBlocked}
              onClick={() => onStartVoiceCall(activeThread.friend)}
              className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/60 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer hover:scale-105"
              title={isActiveBlocked ? 'User is blocked' : `Voice Call ${activeThread.friend.name}`}
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Video Call Button */}
            <button
              id="chat-video-call-btn"
              disabled={isActiveBlocked}
              onClick={() => onStartVideoCall(activeThread.friend)}
              className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-slate-300 hover:text-pink-400 hover:border-pink-500/60 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer hover:scale-105"
              title={isActiveBlocked ? 'User is blocked' : `Video Call ${activeThread.friend.name}`}
            >
              <Video className="w-4 h-4" />
            </button>

            {/* Play Game Button */}
            {onPlayGame && (
              <button
                id="chat-game-challenge-btn"
                disabled={isActiveBlocked}
                onClick={() => onPlayGame(activeThread.friend)}
                className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-slate-300 hover:text-amber-400 hover:border-amber-400/60 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer hover:scale-105"
                title={isActiveBlocked ? 'User is blocked' : `Challenge ${activeThread.friend.name} to Game`}
              >
                <Gamepad2 className="w-4 h-4" />
              </button>
            )}

            {/* Chat Options Dropdown Trigger */}
            <button
              id="chat-options-btn"
              type="button"
              onClick={() => setShowChatOptions(!showChatOptions)}
              className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Chat Options & Privacy"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Options Dropdown Menu */}
            {showChatOptions && (
              <div className="absolute right-0 top-11 w-48 p-1.5 rounded-2xl bg-[#120a26] border border-purple-800/60 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                {/* Clear Chat */}
                <button
                  type="button"
                  onClick={() => {
                    setShowChatOptions(false);
                    setIsClearChatModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-300 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clear Conversation</span>
                </button>

                {/* Block / Unblock */}
                <button
                  type="button"
                  onClick={handleToggleBlock}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    isActiveBlocked
                      ? 'text-emerald-300 hover:bg-emerald-950/40'
                      : 'text-rose-300 hover:bg-rose-950/40'
                  }`}
                >
                  {isActiveBlocked ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Unblock {activeThread.friend.name}</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5 text-rose-400" />
                      <span>Block {activeThread.friend.name}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Blocked User Notice Banner */}
        {isActiveBlocked && (
          <div className="bg-rose-950/70 border-b border-rose-900/60 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-rose-200">
            <div className="flex items-center gap-2 min-w-0">
              <Ban className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">You have blocked {activeThread.friend.name}.</span>
            </div>
            <button
              type="button"
              onClick={() => onUnblockUser && onUnblockUser(activeThread.friend.id)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/60 text-emerald-300 text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              Unblock
            </button>
          </div>
        )}

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {/* Neon Welcome banner inside chat */}
          <div className="text-center py-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/30 inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>Encrypted Neon Chat with {activeThread.friend.name}</span>
            </span>
          </div>

          {activeThread.messages.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto text-pink-400/60 animate-pulse" />
              <p className="text-xs">
                {isActiveBlocked
                  ? `Conversation with ${activeThread.friend.name} is cleared & restricted.`
                  : `Say hello to ${activeThread.friend.name}! Drop a wave or neon vibe.`}
              </p>
              {!isActiveBlocked && (
                <div className="flex justify-center gap-2 pt-2">
                  {['👋 Hey there!', '✨ Love your vibe', '🎮 Up for a game?'].map((starter) => (
                    <button
                      key={starter}
                      onClick={() => onSendMessage(activeChatId, starter)}
                      className="px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs text-pink-300 hover:bg-pink-500/20 hover:border-pink-500/60 transition-all cursor-pointer"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            activeThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-md leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-xs shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                      : 'bg-purple-950/80 border border-purple-800/50 text-slate-100 rounded-bl-xs'
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-mono px-1">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'user' && (
                    <CheckCheck className="w-3.5 h-3.5 text-cyan-400 inline" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Attachment Menu Popup */}
        {showAttachmentMenu && !isActiveBlocked && (
          <div className="p-3 bg-[#110b26] border-t border-purple-900/40 flex items-center justify-around animate-in slide-in-from-bottom-2 duration-150">
            <button
              onClick={() => handleSendAttachment('photo')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-purple-900/30 text-xs text-pink-300 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-pink-400" />
              </div>
              <span>Photo</span>
            </button>

            <button
              onClick={() => handleSendAttachment('anthem')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-purple-900/30 text-xs text-cyan-300 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Music className="w-5 h-5 text-cyan-400" />
              </div>
              <span>Track</span>
            </button>

            <button
              onClick={() => handleSendAttachment('game')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-purple-900/30 text-xs text-amber-300 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-amber-400" />
              </div>
              <span>Challenge</span>
            </button>
          </div>
        )}

        {/* Cyber Emoji Picker Popup */}
        {showEmojiPicker && !isActiveBlocked && (
          <div className="p-3 bg-[#110b26] border-t border-purple-900/40 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400">
                Cyber Neon Emojis
              </span>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {neonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSelectEmoji(emoji)}
                  className="w-8 h-8 rounded-lg hover:bg-purple-900/40 flex items-center justify-center text-lg hover:scale-125 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Bar or Blocked State */}
        <div className="p-3 bg-[#0d091c] border-t border-purple-900/30">
          {isActiveBlocked ? (
            <div className="p-2.5 rounded-2xl bg-rose-950/30 border border-rose-900/40 flex items-center justify-between gap-3 text-xs text-rose-300">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Unblock {activeThread.friend.name} to send messages.</span>
              </div>
              <button
                type="button"
                onClick={() => onUnblockUser && onUnblockUser(activeThread.friend.id)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/60 text-emerald-300 font-bold shrink-0 transition-colors cursor-pointer"
              >
                Unblock
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex items-center gap-2">
              {/* Attachment Button */}
              <button
                id="chat-attachment-btn"
                type="button"
                onClick={() => {
                  setShowAttachmentMenu((prev) => !prev);
                  setShowEmojiPicker(false);
                }}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  showAttachmentMenu
                    ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                    : 'bg-purple-950/50 border-purple-800/40 text-slate-400 hover:text-pink-400'
                }`}
                title="Attach media, track or challenge"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Input field */}
              <div className="relative flex-1">
                <input
                  id="active-chat-input"
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${activeThread.friend.name}...`}
                  className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors"
                />

                {/* Emoji Toggle Button */}
                <button
                  id="chat-emoji-toggle-btn"
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker((prev) => !prev);
                    setShowAttachmentMenu(false);
                  }}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-pink-400 transition-colors cursor-pointer ${
                    showEmojiPicker ? 'text-pink-400' : ''
                  }`}
                  title="Insert Cyber Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Send Button */}
              <button
                id="send-chat-msg-btn"
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all hover:scale-105 cursor-pointer"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Clear Chat Confirmation Modal */}
        <ConfirmationModal
          isOpen={isClearChatModalOpen}
          onClose={() => setIsClearChatModalOpen(false)}
          onConfirm={handleConfirmClearChat}
          title={`Clear Chat with ${activeThread.friend.name}?`}
          message={`Are you sure you want to delete all messages with ${activeThread.friend.name}? This will remove the local conversation history.`}
          confirmText="Clear History"
          cancelText="Cancel"
          type="warning"
        />

        {/* Block User Confirmation Modal */}
        <ConfirmationModal
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          onConfirm={handleConfirmBlock}
          title={`Block ${activeThread.friend.name}?`}
          message={`Are you sure you want to block ${activeThread.friend.name}? Blocked users cannot send direct messages or invite you to Cyber Arcade games.`}
          confirmText="Block User"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    );
  }

  // CHAT LIST VIEW
  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Search and Navigation Bar */}
      <div className="p-4 bg-[#090714] sticky top-0 z-10 space-y-3 border-b border-purple-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-white">Direct Messages</h2>
            <p className="text-xs text-slate-400">Encrypted instant chats & online friends</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-mono text-pink-300">
            {chatThreads.length} active chats
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            id="chat-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations or friends..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          <button
            id="chat-filter-all-btn"
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTabFilter === 'all'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                : 'bg-purple-950/40 text-slate-400 border border-purple-900/30 hover:text-white'
            }`}
          >
            All Messages ({chatThreads.length})
          </button>
          <button
            id="chat-filter-online-btn"
            onClick={() => setActiveTabFilter('online')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTabFilter === 'online'
                ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-purple-950/40 text-slate-400 border border-purple-900/30 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Online ({friends.filter((f) => f.isOnline).length})
          </button>
          <button
            id="chat-filter-contacts-btn"
            onClick={() => setActiveTabFilter('contacts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTabFilter === 'contacts'
                ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                : 'bg-purple-950/40 text-slate-400 border border-purple-900/30 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3 text-cyan-400" />
            Friends ({friends.length})
          </button>
        </div>
      </div>

      {/* Friends Row with Explicit Online and Offline Indicators */}
      <div className="space-y-1.5">
        <div className="px-4 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick 1-on-1 Chat
          </p>
          <span className="text-[10px] text-cyan-400 font-mono">
            {friends.filter((f) => f.isOnline).length} online now
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto px-4 py-1.5 no-scrollbar">
          {friends.map((friend) => {
            const blocked = isFriendBlocked(friend);
            return (
              <button
                key={friend.id}
                id={`quick-chat-friend-${friend.id}`}
                onClick={() => onOpenChatWithFriend(friend)}
                className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none cursor-pointer"
                title={`Start 1-on-1 chat with ${friend.name} ${blocked ? '(Blocked)' : friend.isOnline ? '(Online)' : '(Offline)'}`}
              >
                <div
                  className={`relative p-0.5 rounded-full transition-transform group-hover:scale-105 ${
                    blocked
                      ? 'bg-rose-900 border border-rose-600'
                      : 'bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500'
                  }`}
                >
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    referrerPolicy="no-referrer"
                    className={`w-12 h-12 rounded-full object-cover border-2 border-[#090714] ${
                      blocked ? 'grayscale' : ''
                    }`}
                  />
                  {blocked ? (
                    <span
                      className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-rose-600 border-2 border-[#090714] flex items-center justify-center text-[9px] text-white"
                      title="Blocked"
                    >
                      <Ban className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#090714] ${
                        friend.isOnline
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : 'bg-slate-500'
                      }`}
                      title={friend.isOnline ? 'Online' : 'Offline'}
                    />
                  )}
                </div>
                <span className="text-[11px] text-slate-300 group-hover:text-pink-300 transition-colors truncate max-w-[62px]">
                  {friend.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* View Mode: Friends Directory or Conversations */}
      {activeTabFilter === 'contacts' ? (
        <div className="px-4 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            All Friends Directory
          </p>
          {filteredFriends.map((friend) => {
            const blocked = isFriendBlocked(friend);
            return (
              <div
                key={friend.id}
                id={`contact-item-${friend.id}`}
                className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-cyan-400/40 hover:bg-purple-900/20 transition-all"
              >
                <div
                  onClick={() => onOpenChatWithFriend(friend)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="relative shrink-0">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      referrerPolicy="no-referrer"
                      className={`w-11 h-11 rounded-full object-cover border border-purple-500/40 ${
                        blocked ? 'grayscale' : ''
                      }`}
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#090714] ${
                        blocked
                          ? 'bg-rose-600'
                          : friend.isOnline
                          ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                          : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className="font-semibold text-xs text-white truncate">{friend.name}</h4>
                      {blocked && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-950/80 text-[10px] text-rose-300 border border-rose-800/40 font-mono shrink-0">
                          Blocked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{friend.handle}</p>
                  </div>
                </div>

                {/* Action buttons on friend row */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    disabled={blocked}
                    onClick={() => onStartVoiceCall(friend)}
                    className="p-2 rounded-xl bg-purple-950/60 text-slate-300 hover:text-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title={blocked ? 'Blocked' : 'Voice Call'}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={blocked}
                    onClick={() => onStartVideoCall(friend)}
                    className="p-2 rounded-xl bg-purple-950/60 text-slate-300 hover:text-pink-400 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title={blocked ? 'Blocked' : 'Video Call'}
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenChatWithFriend(friend)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  >
                    Chat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Conversation Thread List */
        <div className="px-4 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recent Conversations
          </p>

          {filteredThreads.length === 0 ? (
            <div className="text-center py-10 bg-purple-950/20 border border-purple-900/30 rounded-3xl p-6 text-slate-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-purple-600/50" />
              <h4 className="text-sm font-bold text-white">No active conversations</h4>
              <p className="text-xs">Tap any friend above to start a direct one-to-one chat!</p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const blocked = isFriendBlocked(thread.friend);
              return (
                <div
                  key={thread.id}
                  id={`thread-item-${thread.id}`}
                  onClick={() => onSelectChat(thread.id)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-pink-500/40 hover:bg-purple-900/30 cursor-pointer transition-all group"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={thread.friend.avatar}
                      alt={thread.friend.name}
                      referrerPolicy="no-referrer"
                      className={`w-13 h-13 rounded-full object-cover border transition-colors ${
                        blocked
                          ? 'border-rose-600/60 grayscale'
                          : 'border-purple-600/40 group-hover:border-pink-500'
                      }`}
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#090714] ${
                        blocked
                          ? 'bg-rose-600'
                          : thread.friend.isOnline
                          ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                          : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  {/* Preview Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <h4 className="font-semibold text-sm text-white group-hover:text-pink-300 transition-colors truncate">
                          {thread.friend.name}
                        </h4>
                        {blocked && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-950/80 text-[10px] text-rose-300 border border-rose-800/40 font-mono shrink-0">
                            Blocked
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {thread.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {blocked
                        ? '🚫 [User Blocked - Messages restricted]'
                        : thread.messages.length === 0
                        ? 'Conversation cleared.'
                        : thread.lastMessage}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {thread.unreadCount > 0 && !blocked && (
                    <div className="shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-mono text-[10px] font-bold shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                      {thread.unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
