import React, { useState } from 'react';
import {
  Search,
  Send,
  ArrowLeft,
  Phone,
  Video,
  Smile,
  Image as ImageIcon,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { ChatThread, Friend, Message } from '../types';

interface ChatViewProps {
  chatThreads: ChatThread[];
  onlineFriends: Friend[];
  activeChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
  onSendMessage: (chatId: string, text: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chatThreads,
  onlineFriends,
  activeChatId,
  onSelectChat,
  onSendMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlineOnly, setFilterOnlineOnly] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  const activeThread = chatThreads.find((c) => c.id === activeChatId);

  const filteredThreads = chatThreads.filter((t) => {
    const matchesSearch =
      t.friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = filterOnlineOnly ? t.friend.isOnline : true;
    return matchesSearch && matchesOnline;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId) return;
    onSendMessage(activeChatId, messageInput.trim());
    setMessageInput('');
  };

  const quickEmojis = ['🔥', '💜', '⚡', '✨', '👾', '🚀'];

  // ACTIVE CHAT SCREEN
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

            <div className="relative">
              <img
                src={activeThread.friend.avatar}
                alt={activeThread.friend.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
              />
              {activeThread.friend.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090714]" />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                {activeThread.friend.name}
              </h3>
              <p className="text-[11px] text-pink-400 font-mono">
                {activeThread.friend.isOnline ? 'Online • Active now' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="chat-call-btn"
              onClick={() => alert(`Starting simulated audio call with ${activeThread.friend.name}...`)}
              className="p-2 rounded-xl bg-purple-950/40 text-slate-300 hover:text-pink-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              id="chat-video-btn"
              onClick={() => alert(`Starting simulated neon video call with ${activeThread.friend.name}...`)}
              className="p-2 rounded-xl bg-purple-950/40 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {/* Neon Welcome banner inside chat */}
          <div className="text-center py-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/30 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-400" /> End-to-End Encrypted Neon Chat
            </span>
          </div>

          {activeThread.messages.map((msg: Message) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.isMe
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-xs shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                    : 'bg-[#181131] border border-purple-800/40 text-slate-100 rounded-tl-xs'
                }`}
              >
                {msg.text}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-1 px-1">
                <span>{msg.timestamp}</span>
                {msg.isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-1.5 flex gap-2 overflow-x-auto bg-[#0d091c]/80 border-t border-purple-900/20 no-scrollbar">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setMessageInput((prev) => prev + emoji)}
              className="px-2 py-1 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-sm transition-transform hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Message Input Bar */}
        <div className="p-3 bg-[#0d091c] border-t border-purple-900/30">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Media sharing simulation ready.')}
              className="p-2.5 rounded-xl bg-purple-950/40 text-slate-400 hover:text-pink-400 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <input
                id="active-chat-input"
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message ${activeThread.friend.name}...`}
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={() => setMessageInput((prev) => prev + ' ✨')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-400"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <button
              id="send-chat-msg-btn"
              type="submit"
              disabled={!messageInput.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // CHAT THREADS LIST
  return (
    <div className="space-y-4 pb-24">
      {/* Top Search & Filter */}
      <div className="px-4 pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-white">Direct Messages</h2>
            <p className="text-xs text-slate-400">Encrypted instant chats & groups</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-mono text-pink-300">
            {chatThreads.length} active
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
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Online filter pill */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterOnlineOnly(false)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !filterOnlineOnly
                ? 'bg-pink-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                : 'bg-purple-950/40 text-slate-400 border border-purple-900/30'
            }`}
          >
            All Messages
          </button>
          <button
            onClick={() => setFilterOnlineOnly(true)}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              filterOnlineOnly
                ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-purple-950/40 text-slate-400 border border-purple-900/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Online ({onlineFriends.length})
          </button>
        </div>
      </div>

      {/* Online Friends Horizontal Row */}
      <div className="space-y-1.5">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Quick Message
        </p>
        <div className="flex gap-3 overflow-x-auto px-4 py-1 no-scrollbar">
          {onlineFriends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => {
                const thread = chatThreads.find((t) => t.friend.id === friend.id);
                if (thread) onSelectChat(thread.id);
              }}
              className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-cyan-400 to-pink-500 group-hover:scale-105 transition-transform">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#090714]"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090714]" />
              </div>
              <span className="text-[11px] text-slate-300 truncate max-w-[60px]">
                {friend.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread List */}
      <div className="px-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Recent Conversations
        </p>

        {filteredThreads.map((thread) => (
          <div
            key={thread.id}
            id={`thread-item-${thread.id}`}
            onClick={() => onSelectChat(thread.id)}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-pink-500/40 hover:bg-purple-900/30 cursor-pointer transition-all"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={thread.friend.avatar}
                alt={thread.friend.name}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-full object-cover border border-purple-600/40"
              />
              {thread.friend.isOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090714] shadow-[0_0_6px_#34d399]" />
              )}
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
        ))}
      </div>
    </div>
  );
};
