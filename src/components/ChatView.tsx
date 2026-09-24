import React, { useState } from 'react';
import {
  Search,
  Send,
  ArrowLeft,
  Phone,
  Video,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Sparkles,
  Gamepad2,
  User,
  Users,
  MessageSquare,
  Play,
  Pause,
  Zap,
  UserPlus,
} from 'lucide-react';
import { ChatThread, Friend, Message, MessageAttachment, CallType, CallState } from '../types';
import { CallModal } from './CallModal';
import { FriendProfileModal } from './FriendProfileModal';
import { AttachmentModal } from './AttachmentModal';
import { EmojiPicker } from './EmojiPicker';
import { UserAvatar } from './UserAvatar';

interface ChatViewProps {
  chatThreads: ChatThread[];
  allFriends: Friend[];
  onlineFriends: Friend[];
  activeChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
  onSendMessage: (chatId: string, text: string, attachment?: MessageAttachment) => void;
  onOpenChatWithFriend?: (friend: Friend) => void;
  onNavigateToGames?: () => void;
  onShowToast?: (msg: string) => void;
  onOpenAddFriend?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chatThreads,
  allFriends,
  onlineFriends,
  activeChatId,
  onSelectChat,
  onSendMessage,
  onOpenChatWithFriend,
  onNavigateToGames,
  onShowToast,
  onOpenAddFriend,
}) => {
  // Navigation tabs in chat list
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [friendsFilter, setFriendsFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [messageInput, setMessageInput] = useState('');

  // Modals & Panels state
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [selectedProfileFriend, setSelectedProfileFriend] = useState<Friend | null>(null);

  // Active call state
  const [activeCall, setActiveCall] = useState<{
    friend: Friend;
    type: CallType;
    state: CallState;
  } | null>(null);

  // Audio memo preview state in chat
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const activeThread = chatThreads.find((c) => c.id === activeChatId);

  // Friends filtering
  const filteredFriends = allFriends.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.statusText && f.statusText.toLowerCase().includes(searchQuery.toLowerCase()));

    if (friendsFilter === 'online') return matchesSearch && f.isOnline;
    if (friendsFilter === 'offline') return matchesSearch && !f.isOnline;
    return matchesSearch;
  });

  // Threads filtering
  const filteredThreads = chatThreads.filter((t) => {
    const matchesSearch =
      t.friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Send message handler
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId) return;
    onSendMessage(activeChatId, messageInput.trim());
    setMessageInput('');
    setIsEmojiPickerOpen(false);
  };

  // Attachment selected handler
  const handleSelectAttachment = (attachment: MessageAttachment, optionalText?: string) => {
    if (!activeChatId) return;
    const textToSend = optionalText || (attachment.title ? `Sent ${attachment.title}` : 'Sent attachment');
    onSendMessage(activeChatId, textToSend, attachment);
    setIsAttachmentModalOpen(false);
  };

  // Quick Emoji Click
  const handleSelectEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
  };

  // Call Handlers
  const handleStartVoiceCall = (friend: Friend) => {
    setActiveCall({
      friend,
      type: 'voice',
      state: 'connected',
    });
    onShowToast?.(`Starting voice call with ${friend.name}...`);
  };

  const handleStartVideoCall = (friend: Friend) => {
    setActiveCall({
      friend,
      type: 'video',
      state: 'connected',
    });
    onShowToast?.(`Starting video call with ${friend.name}...`);
  };

  const handleTriggerSimulatedIncomingCall = (friend?: Friend) => {
    const caller = friend || allFriends[0];
    if (!caller) {
      onShowToast?.('No friends yet. Add friends to get started.');
      return;
    }
    const isVideo = Math.random() > 0.5;
    setActiveCall({
      friend: caller,
      type: isVideo ? 'video' : 'voice',
      state: 'incoming',
    });
    onShowToast?.(`Incoming call from ${caller.name}`);
  };

  const handleAcceptCall = () => {
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        state: 'connected',
      });
      onShowToast?.(`Connected to ${activeCall.friend.name}!`);
    }
  };

  const handleEndCall = () => {
    if (activeCall) {
      onShowToast?.(`Call with ${activeCall.friend.name} ended`);
      setActiveCall(null);
    }
  };

  const handleSwitchCallType = (newType: CallType) => {
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        type: newType,
      });
      onShowToast?.(`Switched to ${newType} call`);
    }
  };

  // Play game with friend
  const handlePlayGameWithFriend = (friend: Friend) => {
    if (activeChatId) {
      onSendMessage(activeChatId, `🕹️ Challenged you to Memory Matrix Arcade!`, {
        type: 'game_invite',
        gameTitle: 'Memory Matrix Arcade',
        gameScore: 3200,
      });
      onShowToast?.(`Game challenge sent to ${friend.name}!`);
    } else {
      if (onOpenChatWithFriend) {
        onOpenChatWithFriend(friend);
      }
      onShowToast?.(`Opening chat to challenge ${friend.name}!`);
    }
  };

  // Toggle audio playback simulation
  const handleToggleAudio = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      onShowToast?.('Voice note paused');
    } else {
      setPlayingAudioId(msgId);
      onShowToast?.('Playing voice note...');
      setTimeout(() => {
        setPlayingAudioId((prev) => (prev === msgId ? null : prev));
      }, 5000);
    }
  };

  // Quick top emojis
  const quickEmojis = ['🔥', '💜', '⚡', '✨', '🕹️', '👾'];

  // ==========================================
  // VIEW 1: ONE-TO-ONE ACTIVE CHAT SCREEN
  // ==========================================
  if (activeThread) {
    return (
      <div className="fixed inset-0 z-50 bg-[#090714] flex flex-col max-w-md mx-auto">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-[#0d091c]/95 backdrop-blur-md border-b border-purple-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="back-to-chat-list-btn"
              onClick={() => onSelectChat(null)}
              className="p-1.5 rounded-xl bg-purple-950/40 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Clickable Friend Avatar */}
            <button
              id="chat-friend-avatar-btn"
              onClick={() => setSelectedProfileFriend(activeThread.friend)}
              className="relative group focus:outline-none"
              title="View Profile"
            >
              <UserAvatar
                name={activeThread.friend.name}
                avatar={activeThread.friend.avatar}
                size="md"
                isOnline={activeThread.friend.isOnline}
                showOnline={true}
              />
            </button>

            {/* Clickable Friend Info */}
            <button
              id="chat-friend-name-btn"
              onClick={() => setSelectedProfileFriend(activeThread.friend)}
              className="text-left focus:outline-none"
            >
              <h3 className="font-semibold text-sm text-white flex items-center gap-1.5 hover:text-pink-300 transition-colors">
                {activeThread.friend.name}
              </h3>
              <p className="text-[11px] font-mono flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeThread.friend.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span className={activeThread.friend.isOnline ? 'text-pink-400' : 'text-slate-400'}>
                  {activeThread.friend.isOnline ? 'Online • Active now' : activeThread.friend.lastSeen || 'Offline'}
                </span>
              </p>
            </button>
          </div>

          {/* Action Header Buttons: Voice Call, Video Call, Game, Profile */}
          <div className="flex items-center gap-1.5">
            {/* Play Game Button */}
            <button
              id="chat-play-game-btn"
              onClick={() => handlePlayGameWithFriend(activeThread.friend)}
              className="p-2 rounded-xl bg-purple-950/40 text-slate-300 hover:text-emerald-400 transition-colors hover:bg-emerald-950/30"
              title="Play Game / Challenge"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>

            {/* Voice Call Button */}
            <button
              id="chat-voice-call-btn"
              onClick={() => handleStartVoiceCall(activeThread.friend)}
              className="p-2 rounded-xl bg-purple-950/40 text-slate-300 hover:text-pink-400 transition-colors hover:bg-pink-950/30"
              title="Voice Call"
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Video Call Button */}
            <button
              id="chat-video-call-btn"
              onClick={() => handleStartVideoCall(activeThread.friend)}
              className="p-2 rounded-xl bg-purple-950/40 text-slate-300 hover:text-cyan-400 transition-colors hover:bg-cyan-950/30"
              title="Video Call"
            >
              <Video className="w-4 h-4" />
            </button>

            {/* Friend Profile Button */}
            <button
              id="chat-view-profile-btn"
              onClick={() => setSelectedProfileFriend(activeThread.friend)}
              className="p-2 rounded-xl bg-purple-950/40 text-slate-300 hover:text-purple-300 transition-colors"
              title="Friend Profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
          {/* Real Messaging Status Indicator */}
          <div className="text-center py-2">
            <span className="text-[10px] font-mono tracking-wide text-slate-400 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/30 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-pink-400" />
              Direct Messaging Ready • Local Session (No server connected)
            </span>
          </div>

          {activeThread.messages.map((msg: Message) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl text-sm leading-relaxed overflow-hidden ${
                  msg.isMe
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-xs shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                    : 'bg-[#181131] border border-purple-800/40 text-slate-100 rounded-tl-xs'
                }`}
              >
                {/* 1. Attached Photo Rendering */}
                {msg.attachment?.type === 'image' && msg.attachment.url && (
                  <div className="p-1">
                    <img
                      src={msg.attachment.url}
                      alt={msg.attachment.title || 'Attached photo'}
                      referrerPolicy="no-referrer"
                      className="rounded-xl w-full max-h-52 object-cover"
                    />
                    {msg.attachment.title && (
                      <p className="px-2.5 py-1 text-[11px] font-medium opacity-90 truncate">
                        {msg.attachment.title}
                      </p>
                    )}
                  </div>
                )}

                {/* 2. Attached Sticker Rendering */}
                {msg.attachment?.type === 'sticker' && (
                  <div className="p-3 text-center">
                    <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                      {msg.text}
                    </span>
                  </div>
                )}

                {/* 3. Attached Audio Voice Memo Rendering */}
                {msg.attachment?.type === 'audio' && (
                  <div className="p-3 flex items-center gap-3 min-w-[200px]">
                    <button
                      onClick={() => handleToggleAudio(msg.id)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-105"
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-white" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 h-5">
                        {[35, 75, 45, 90, 60, 100, 50, 80, 40, 70, 95, 30].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-1 rounded-full ${
                              playingAudioId === msg.id
                                ? 'bg-cyan-300 animate-pulse'
                                : 'bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono opacity-80 mt-0.5 block">
                        Voice Note • {msg.attachment.duration || '0:14'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. Attached Game Invite Duel Card */}
                {msg.attachment?.type === 'game_invite' && (
                  <div className="p-3.5 space-y-2.5 bg-black/30 backdrop-blur-sm border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">
                          Arcade Duel Challenge
                        </p>
                        <p className="text-[11px] text-pink-300 font-mono">
                          {msg.attachment.gameTitle || 'Memory Matrix'}
                        </p>
                      </div>
                    </div>

                    <button
                      id={`accept-duel-btn-${msg.id}`}
                      onClick={() => {
                        onShowToast?.(`Entering ${msg.attachment?.gameTitle || 'Arcade'} duel!`);
                        if (onNavigateToGames) onNavigateToGames();
                      }}
                      className="w-full py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" /> Accept & Play Duel
                    </button>
                  </div>
                )}

                {/* Plain Text or Caption */}
                {(!msg.attachment || msg.attachment.type !== 'sticker') && (
                  <div className="px-3.5 py-2">{msg.text}</div>
                )}
              </div>

              {/* Timestamp & Status */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-1 px-1">
                <span>{msg.timestamp}</span>
                {msg.isMe && (
                  <span className="flex items-center gap-0.5 text-pink-400 text-[10px]" title="Saved locally in browser session">
                    <Check className="w-3 h-3 text-pink-400" />
                    <span>Saved</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-1.5 flex items-center justify-between bg-[#0d091c]/80 border-t border-purple-900/20">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelectEmoji(emoji)}
                className="px-2 py-1 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-sm transition-transform hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>

          <button
            id="open-full-emoji-matrix-btn"
            type="button"
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            className={`p-1.5 rounded-xl text-xs flex items-center gap-1 transition-colors ${
              isEmojiPickerOpen ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-pink-400'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span className="text-[11px] font-mono">Emojis</span>
          </button>
        </div>

        {/* Rich Emoji Drawer */}
        <EmojiPicker
          isOpen={isEmojiPickerOpen}
          onClose={() => setIsEmojiPickerOpen(false)}
          onSelectEmoji={handleSelectEmoji}
        />

        {/* Message Input Bar */}
        <div className="p-3 bg-[#0d091c] border-t border-purple-900/30">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            {/* Attachment Button */}
            <button
              id="chat-attachment-btn"
              type="button"
              onClick={() => setIsAttachmentModalOpen(true)}
              className="p-2.5 rounded-xl bg-purple-950/40 text-slate-400 hover:text-pink-400 hover:bg-purple-900/40 transition-colors"
              title="Add Attachment"
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
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Send Button */}
            <button
              id="send-chat-msg-btn"
              type="submit"
              disabled={!messageInput.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all hover:scale-105 active:scale-95"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Modals within active chat */}
        {selectedProfileFriend && (
          <FriendProfileModal
            friend={selectedProfileFriend}
            onClose={() => setSelectedProfileFriend(null)}
            onStartChat={(f) => {
              if (onOpenChatWithFriend) onOpenChatWithFriend(f);
            }}
            onStartVoiceCall={handleStartVoiceCall}
            onStartVideoCall={handleStartVideoCall}
            onPlayGameWithFriend={handlePlayGameWithFriend}
            onShowToast={onShowToast}
          />
        )}

        <AttachmentModal
          isOpen={isAttachmentModalOpen}
          onClose={() => setIsAttachmentModalOpen(false)}
          onSelectAttachment={handleSelectAttachment}
          onShowToast={onShowToast}
        />

        {activeCall && (
          <CallModal
            callFriend={activeCall.friend}
            callType={activeCall.type}
            callState={activeCall.state}
            onAcceptCall={handleAcceptCall}
            onEndCall={handleEndCall}
            onSwitchCallType={handleSwitchCallType}
            onOpenGame={() => {
              handleEndCall();
              if (onNavigateToGames) onNavigateToGames();
            }}
            onShowToast={onShowToast}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: CHAT HUB & FRIEND LIST
  // ==========================================
  return (
    <div className="space-y-4 pb-24">
      {/* Top Header with Simulation Button */}
      <div className="px-4 pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-white">Social Terminal</h2>
            <p className="text-xs text-slate-400">Direct chats, friends & calls</p>
          </div>

          {/* Simulate Incoming Call Demo Button */}
          <button
            id="simulate-incoming-call-btn"
            onClick={() => handleTriggerSimulatedIncomingCall()}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border border-pink-500/50 text-xs font-mono text-pink-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95 transition-all"
            title="Simulate an incoming voice/video call"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" />
            <span>Demo Incoming Call</span>
          </button>
        </div>

        {/* Primary Tabs: Conversations vs Friends List */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-purple-950/40 border border-purple-900/40">
          <button
            id="tab-conversations-btn"
            onClick={() => setActiveTab('chats')}
            className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'chats'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages ({chatThreads.length})</span>
          </button>

          <button
            id="tab-friends-list-btn"
            onClick={() => setActiveTab('friends')}
            className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Friends ({allFriends.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            id="chat-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'chats'
                ? 'Search conversations or messages...'
                : 'Search friends by name, handle, or status...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: CONVERSATIONS (MESSAGES)                      */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'chats' && (
        <div className="space-y-4">
          {/* Quick Online Friends Row */}
          <div className="space-y-1.5">
            <div className="px-4 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quick Connect • Online Now
              </p>
              {onOpenAddFriend && (
                <button
                  onClick={onOpenAddFriend}
                  className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Add Friend</span>
                </button>
              )}
            </div>
            {onlineFriends.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto px-4 py-1 no-scrollbar">
                {onlineFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => {
                      const thread = chatThreads.find((t) => t.friend.id === friend.id);
                      if (thread) {
                        onSelectChat(thread.id);
                      } else if (onOpenChatWithFriend) {
                        onOpenChatWithFriend(friend);
                      }
                    }}
                    className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                  >
                    <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-cyan-400 to-pink-500 group-hover:scale-105 transition-transform">
                      <UserAvatar
                        name={friend.name}
                        avatar={friend.avatar}
                        size="md"
                        isOnline={friend.isOnline}
                        showOnline={true}
                      />
                    </div>
                    <span className="text-[11px] text-slate-300 truncate max-w-[60px]">
                      {friend.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-4 py-2 text-xs text-slate-400 italic">
                No friends yet. Add friends to get started.
              </p>
            )}
          </div>

          {/* Conversation Thread List */}
          <div className="px-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recent Threads
            </p>

            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  id={`thread-item-${thread.id}`}
                  onClick={() => onSelectChat(thread.id)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-pink-500/40 hover:bg-purple-900/30 cursor-pointer transition-all"
                >
                  {/* Avatar with Status */}
                  <div className="shrink-0">
                    <UserAvatar
                      name={thread.friend.name}
                      avatar={thread.friend.avatar}
                      size="md"
                      isOnline={thread.friend.isOnline}
                      showOnline={true}
                    />
                  </div>

                  {/* Preview Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-white truncate">
                        {thread.friend.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {thread.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 truncate mt-1">
                      {thread.lastMessage}
                    </p>
                  </div>

                  {/* Unread Pill */}
                  {thread.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                      {thread.unreadCount}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-purple-950/20 border border-purple-900/30 text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-purple-900/40 border border-purple-800/40 flex items-center justify-center text-purple-300">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  No friends yet. Add friends to get started.
                </p>
                {onOpenAddFriend && (
                  <button
                    id="chat-empty-threads-add-friend-btn"
                    onClick={onOpenAddFriend}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold shadow-md hover:scale-105 transition-all inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Friend</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: COMPLETE FRIEND LIST WITH ONLINE/OFFLINE       */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'friends' && (
        <div className="px-4 space-y-3">
          {/* Status Filter Pills: All / Online / Offline */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                id="filter-friends-all-btn"
                onClick={() => setFriendsFilter('all')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  friendsFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'bg-purple-950/40 text-slate-400 border border-purple-900/30'
                }`}
              >
                All ({allFriends.length})
              </button>

              <button
                id="filter-friends-online-btn"
                onClick={() => setFriendsFilter('online')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                  friendsFilter === 'online'
                    ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'bg-purple-950/40 text-slate-400 border border-purple-900/30'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online ({onlineFriends.length})
              </button>

              <button
                id="filter-friends-offline-btn"
                onClick={() => setFriendsFilter('offline')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  friendsFilter === 'offline'
                    ? 'bg-slate-700 text-white'
                    : 'bg-purple-950/40 text-slate-400 border border-purple-900/30'
                }`}
              >
                Offline ({allFriends.length - onlineFriends.length})
              </button>
            </div>

            {onOpenAddFriend && (
              <button
                id="chat-filter-add-friend-btn"
                onClick={onOpenAddFriend}
                className="px-2.5 py-1 rounded-full bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-white border border-pink-500/30 text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>

          {/* Friends Cards */}
          <div className="space-y-2.5">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  id={`friend-card-${friend.id}`}
                  className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-pink-500/40 transition-all space-y-2.5"
                >
                  {/* Friend Identity Row */}
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => setSelectedProfileFriend(friend)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <UserAvatar
                        name={friend.name}
                        avatar={friend.avatar}
                        size="md"
                        isOnline={friend.isOnline}
                        showOnline={true}
                      />

                      <div>
                        <h4 className="font-semibold text-sm text-white group-hover:text-pink-300 transition-colors flex items-center gap-1.5">
                          {friend.name}
                        </h4>
                        <p className="text-[11px] font-mono text-pink-400">{friend.handle}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {friend.isOnline ? (
                            <span className="text-emerald-400 font-medium">● Online now</span>
                          ) : (
                            <span>Last active: {friend.lastSeen || 'Recently'}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Profile info button */}
                    <button
                      id={`view-profile-${friend.id}`}
                      onClick={() => setSelectedProfileFriend(friend)}
                      className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-slate-300 hover:text-white transition-colors"
                      title="View Profile"
                    >
                      <User className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status Quote */}
                  {friend.statusText && (
                    <p className="text-xs text-slate-300 bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-900/30">
                      {friend.statusText}
                    </p>
                  )}

                  {/* Action Buttons: Chat, Voice Call, Video Call, Play Game */}
                  <div className="flex items-center gap-2 pt-1 border-t border-purple-900/20">
                    <button
                      id={`friend-chat-btn-${friend.id}`}
                      onClick={() => {
                        if (onOpenChatWithFriend) onOpenChatWithFriend(friend);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-purple-900/40 hover:bg-pink-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 border border-purple-700/40 hover:border-pink-500 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                      <span>Chat</span>
                    </button>

                    <button
                      id={`friend-voice-call-btn-${friend.id}`}
                      onClick={() => handleStartVoiceCall(friend)}
                      className="p-2 rounded-xl bg-purple-900/40 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors border border-purple-700/40"
                      title="Voice Call"
                    >
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    </button>

                    <button
                      id={`friend-video-call-btn-${friend.id}`}
                      onClick={() => handleStartVideoCall(friend)}
                      className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors border border-purple-700/40"
                      title="Video Call"
                    >
                      <Video className="w-3.5 h-3.5 text-purple-300" />
                    </button>

                    <button
                      id={`friend-play-game-btn-${friend.id}`}
                      onClick={() => handlePlayGameWithFriend(friend)}
                      className="p-2 rounded-xl bg-purple-900/40 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors border border-purple-700/40"
                      title="Play Game Duel"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-purple-950/20 border border-purple-900/30 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-purple-900/40 border border-purple-800/40 flex items-center justify-center text-purple-300">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  No friends yet. Add friends to get started.
                </p>
                {onOpenAddFriend && (
                  <button
                    id="chat-empty-friends-add-btn"
                    onClick={onOpenAddFriend}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold shadow-md hover:scale-105 transition-all inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Friend</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Modals for Chat View */}
      {selectedProfileFriend && (
        <FriendProfileModal
          friend={selectedProfileFriend}
          onClose={() => setSelectedProfileFriend(null)}
          onStartChat={(f) => {
            if (onOpenChatWithFriend) onOpenChatWithFriend(f);
          }}
          onStartVoiceCall={handleStartVoiceCall}
          onStartVideoCall={handleStartVideoCall}
          onPlayGameWithFriend={handlePlayGameWithFriend}
          onShowToast={onShowToast}
        />
      )}

      {activeCall && (
        <CallModal
          callFriend={activeCall.friend}
          callType={activeCall.type}
          callState={activeCall.state}
          onAcceptCall={handleAcceptCall}
          onEndCall={handleEndCall}
          onSwitchCallType={handleSwitchCallType}
          onOpenGame={() => {
            handleEndCall();
            if (onNavigateToGames) onNavigateToGames();
          }}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
