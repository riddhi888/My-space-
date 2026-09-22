import React from 'react';
import { X, Bell, Check, Heart, MessageSquare, Gamepad2, Sparkles, CheckCheck, UserPlus, UserX } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onDismissNotification: (id: string) => void;
  onAcceptFriendRequest?: (notificationId: string, requesterId?: string) => void;
  onDeclineFriendRequest?: (notificationId: string, requesterId?: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onDismissNotification,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-cyan-400" />;
      case 'like':
        return <Heart className="w-4 h-4 text-pink-400 fill-pink-500/20" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'game':
        return <Gamepad2 className="w-4 h-4 text-purple-400" />;
      case 'mention':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md bg-[#0e0a1f] border border-purple-800/40 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/30 bg-[#090714]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">Notifications</h3>
              <p className="text-[11px] text-slate-400">
                {notifications.filter((n) => !n.isRead).length} unread alerts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="mark-all-read-btn"
              onClick={onMarkAllAsRead}
              className="text-xs text-pink-400 hover:text-pink-300 font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark read
            </button>
            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-purple-900/40 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-purple-600/60" />
              <p className="text-sm">You are all caught up!</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => onDismissNotification(item.id)}
                className={`flex gap-3 p-3.5 rounded-2xl transition-all cursor-pointer border ${
                  item.isRead
                    ? 'bg-purple-950/20 border-purple-900/20 text-slate-300'
                    : 'bg-purple-900/30 border-pink-500/30 text-white shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                }`}
              >
                {/* Icon or Avatar */}
                <div className="relative shrink-0">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt="User"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center border border-purple-700/40">
                      {getIcon(item.type)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0e0a1f] flex items-center justify-center">
                    {getIcon(item.type)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-semibold leading-tight line-clamp-1">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>

                  {/* Friend Request Interactive Action Buttons */}
                  {item.type === 'friend_request' && (
                    <div className="mt-2.5 flex items-center gap-2">
                      {item.requestStatus === 'accepted' ? (
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Friends connected
                        </span>
                      ) : item.requestStatus === 'declined' ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded text-slate-400">
                          Declined
                        </span>
                      ) : (
                        <>
                          <button
                            id={`accept-friend-req-${item.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAcceptFriendRequest?.(item.id, item.requesterId);
                            }}
                            className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-semibold shadow-[0_0_10px_rgba(236,72,153,0.3)] flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Accept
                          </button>
                          <button
                            id={`decline-friend-req-${item.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeclineFriendRequest?.(item.id, item.requesterId);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-800/40 hover:bg-purple-900 text-slate-300 hover:text-white text-xs"
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Unread indicator */}
                {!item.isRead && (
                  <div className="w-2 h-2 rounded-full bg-pink-500 shrink-0 self-center shadow-[0_0_6px_#ec4899]" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
