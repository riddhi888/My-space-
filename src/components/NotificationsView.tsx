import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowLeft,
  UserPlus,
  UserCheck,
  MessageSquare,
  Share2,
  Gamepad2,
  PhoneCall,
  Video,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Filter,
} from 'lucide-react';
import { NotificationItem, NotificationType, BlockedUser } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onBackToHome: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onAcceptFriendRequest: (notificationId: string, requesterId?: string) => void;
  onDeclineFriendRequest: (notificationId: string, requesterId?: string) => void;
  onFollowBack: (notificationId: string) => void;
  onOpenChat: (senderHandle?: string, senderName?: string) => void;
  onOpenLink: (url?: string) => void;
  onPlayGame: (gameId?: string) => void;
  onCallBack: (senderName?: string, callType?: 'voice' | 'video') => void;
  showMessagePreview?: boolean;
  blockedUsers?: BlockedUser[];
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onBackToHome,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onFollowBack,
  onOpenChat,
  onOpenLink,
  onPlayGame,
  onCallBack,
  showMessagePreview = true,
  blockedUsers = [],
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'social' | 'messages' | 'games'>('all');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const isSenderBlocked = (item: NotificationItem) => {
    if (!blockedUsers || blockedUsers.length === 0) return false;
    return blockedUsers.some(
      (b) =>
        (item.senderHandle && b.handle === item.senderHandle) ||
        (item.senderName && b.name === item.senderName)
    );
  };

  const unblockedNotifications = notifications.filter((item) => !isSenderBlocked(item));
  const unreadCount = unblockedNotifications.filter((n) => !n.isRead).length;

  const filteredNotifications = unblockedNotifications.filter((item) => {
    if (filter === 'unread') return !item.isRead;
    if (filter === 'social') return item.type === 'follower' || item.type === 'friend_request';
    if (filter === 'messages') return item.type === 'chat' || item.type === 'call';
    if (filter === 'games') return item.type === 'game' || item.type === 'link';
    return true;
  });

  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case 'follower':
        return {
          icon: <UserPlus className="w-3.5 h-3.5 text-pink-400" />,
          label: 'New Follower',
          color: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
        };
      case 'friend_request':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-cyan-400" />,
          label: 'Friend Request',
          color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
        };
      case 'chat':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-blue-400" />,
          label: 'Chat Message',
          color: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
        };
      case 'link':
        return {
          icon: <Share2 className="w-3.5 h-3.5 text-purple-400" />,
          label: 'Shared Link',
          color: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
        };
      case 'game':
        return {
          icon: <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Game Invite',
          color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        };
      case 'call':
        return {
          icon: <PhoneCall className="w-3.5 h-3.5 text-rose-400" />,
          label: 'Missed Call',
          color: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
        };
      default:
        return {
          icon: <Bell className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Alert',
          color: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        };
    }
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Screen Header */}
      <div className="sticky top-0 z-30 bg-[#090714]/95 backdrop-blur-md px-4 py-3.5 border-b border-purple-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="notifications-back-btn"
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-slate-300 hover:text-white hover:bg-purple-900/50 transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span
                  id="notifications-unread-badge"
                  className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[11px] font-bold shadow-[0_0_10px_rgba(236,72,153,0.5)] animate-pulse"
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Activity, invites & friend alerts</p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <button
                  id="notifications-mark-read-btn"
                  onClick={onMarkAllAsRead}
                  className="p-2 rounded-xl bg-purple-950/60 border border-pink-500/30 hover:border-pink-500/60 text-pink-300 hover:text-pink-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              <button
                id="notifications-clear-all-btn"
                onClick={() => setIsClearModalOpen(true)}
                className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 hover:border-rose-500/50 hover:bg-rose-950/30 text-slate-400 hover:text-rose-300 text-xs transition-all"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#120b29]/80 rounded-2xl border border-purple-900/40 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'social', label: 'Social', count: notifications.filter((n) => n.type === 'follower' || n.type === 'friend_request').length },
              { id: 'messages', label: 'Calls & Chats', count: notifications.filter((n) => n.type === 'chat' || n.type === 'call').length },
              { id: 'games', label: 'Games & Links', count: notifications.filter((n) => n.type === 'game' || n.type === 'link').length },
            ] as const
          ).map((t) => {
            const isActive = filter === t.id;
            return (
              <button
                key={t.id}
                id={`notif-filter-${t.id}`}
                onClick={() => setFilter(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.35)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-purple-900/20'
                }`}
              >
                <span>{t.label}</span>
                {t.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-black/30 text-white' : 'bg-purple-900/40 text-slate-300'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 space-y-3">
        {filteredNotifications.length === 0 ? (
          /* Friendly Empty State */
          <div className="p-8 text-center rounded-3xl bg-gradient-to-b from-[#140e2b]/80 to-[#0d091e]/80 border border-purple-900/40 space-y-3 mt-4 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-950/60 border border-purple-700/50 flex items-center justify-center text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
              <Bell className="w-8 h-8 opacity-75" />
            </div>
            <div className="space-y-1 max-w-xs mx-auto">
              <h4 className="font-display font-bold text-white text-base">
                {filter === 'unread'
                  ? 'All Caught Up!'
                  : filter === 'all'
                  ? 'No Notifications Yet'
                  : 'No Notifications in this Category'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {filter === 'unread'
                  ? 'You have read all recent alerts. Check back later for new friend requests, game invites, or calls.'
                  : 'Stay active on MySpace by posting, sharing neon links, and challenging friends to mini-games.'}
              </p>
            </div>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const badge = getNotificationBadge(item.type);

            return (
              <div
                key={item.id}
                id={`notif-item-${item.id}`}
                onClick={() => {
                  if (!item.isRead) {
                    onMarkAsRead(item.id);
                  }
                }}
                className={`group relative p-4 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  item.isRead
                    ? 'bg-[#120c2b]/70 border-purple-900/30 text-slate-300 hover:border-purple-700/50'
                    : 'bg-gradient-to-br from-[#1c123d] to-[#120a2a] border-pink-500/40 text-white shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:border-pink-400'
                }`}
              >
                {/* Left accent indicator for unread alerts */}
                {!item.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-600 shadow-[0_0_8px_#ec4899]" />
                )}

                <div className="flex items-start gap-3.5">
                  {/* Sender Avatar & Type Icon badge */}
                  <div className="relative shrink-0">
                    <img
                      src={
                        item.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={item.senderName || 'Sender'}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border border-purple-600/40 shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-[#090714] shadow-sm ${badge.color}`}
                    >
                      {badge.icon}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">
                            {item.senderName || item.title}
                          </span>
                          {item.senderHandle && (
                            <span className="text-xs text-cyan-400 font-mono">
                              {item.senderHandle}
                            </span>
                          )}
                        </div>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {item.type === 'chat' && !showMessagePreview
                        ? '🔒 [Message preview hidden by Privacy & Security settings]'
                        : item.message}
                    </p>

                    {/* INTERACTIVE NOTIFICATION ACTION BUTTONS */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {/* 1. New Follower: Follow Back */}
                      {item.type === 'follower' && (
                        <div>
                          {item.isFollowingBack ? (
                            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-700/50 text-slate-300 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> Following
                            </span>
                          ) : (
                            <button
                              id={`follow-back-btn-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onFollowBack(item.id);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(236,72,153,0.4)] flex items-center gap-1.5 transition-transform active:scale-95"
                            >
                              <UserPlus className="w-3.5 h-3.5" /> Follow Back
                            </button>
                          )}
                        </div>
                      )}

                      {/* 2. Friend Request: Accept or Decline */}
                      {item.type === 'friend_request' && (
                        <div className="flex items-center gap-2">
                          {item.requestStatus === 'accepted' ? (
                            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5" /> Friends Connected
                            </span>
                          ) : item.requestStatus === 'declined' ? (
                            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-purple-950/40 text-slate-400">
                              Declined
                            </span>
                          ) : (
                            <>
                              <button
                                id={`accept-friend-btn-${item.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAcceptFriendRequest(item.id, item.requesterId);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(236,72,153,0.4)] flex items-center gap-1.5 transition-transform active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                id={`decline-friend-btn-${item.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeclineFriendRequest(item.id, item.requesterId);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/40 hover:bg-purple-900/60 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" /> Decline
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* 3. New Chat Message: Reply in Chat */}
                      {item.type === 'chat' && (
                        <button
                          id={`chat-reply-btn-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChat(item.senderHandle, item.senderName);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 border border-blue-500/50 hover:bg-blue-600/50 text-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Open Chat & Reply
                        </button>
                      )}

                      {/* 4. Shared Link: Open Shared Link */}
                      {item.type === 'link' && (
                        <button
                          id={`open-link-btn-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLink(item.linkUrl);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Shared Link
                        </button>
                      )}

                      {/* 5. Game Invitation: Accept & Play */}
                      {item.type === 'game' && (
                        <button
                          id={`play-game-btn-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayGame(item.gameId);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600/50 text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        >
                          <Gamepad2 className="w-3.5 h-3.5" /> Accept & Play Game
                        </button>
                      )}

                      {/* 6. Missed Call: Call Back */}
                      {item.type === 'call' && (
                        <button
                          id={`call-back-btn-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCallBack(item.senderName, item.callType);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600/30 border border-rose-500/50 hover:bg-rose-600/50 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                        >
                          {item.callType === 'video' ? (
                            <Video className="w-3.5 h-3.5" />
                          ) : (
                            <PhoneCall className="w-3.5 h-3.5" />
                          )}
                          Call Back ({item.callType === 'video' ? 'Video' : 'Voice'})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Individual mark-as-read indicator dot */}
                  {!item.isRead && (
                    <div
                      className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0 self-start mt-1 shadow-[0_0_8px_#ec4899] animate-pulse"
                      title="Unread alert"
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog for Clearing All Notifications */}
      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={onClearAll}
        title="Clear All Notifications?"
        message="This will remove all notifications from your notification feed. This action cannot be undone."
        confirmText="Clear All"
        cancelText="Keep Notifications"
        type="danger"
      />
    </div>
  );
};
