import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Phone,
  Video,
  Gamepad2,
  UserPlus,
  UserCheck,
  UserX,
  Music,
  Play,
  Pause,
  Award,
  Sparkles,
  Share2,
  Check,
  Flame,
  Radio,
  Ban,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { SocialUser, Friend, BlockedUser } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SocialUser | null;
  onToggleFollow: (userId: string) => void;
  onSendFriendRequest: (userId: string) => void;
  onOpenChat: (user: SocialUser) => void;
  onStartVoiceCall: (user: SocialUser) => void;
  onStartVideoCall: (user: SocialUser) => void;
  onPlayGame: (user: SocialUser) => void;
  // Privacy & Blocking props
  blockedUsers?: BlockedUser[];
  onBlockUser?: (user: { id: string; name: string; handle: string; avatar: string }) => void;
  onUnblockUser?: (userId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onToggleFollow,
  onSendFriendRequest,
  onOpenChat,
  onStartVoiceCall,
  onStartVideoCall,
  onPlayGame,
  blockedUsers = [],
  onBlockUser,
  onUnblockUser,
}) => {
  const [isPlayingAnthem, setIsPlayingAnthem] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  if (!isOpen || !user) return null;

  const isBlocked = blockedUsers.some(
    (b) => b.id === user.id || b.handle === user.handle || b.name === user.name
  );

  const handleFollowClick = () => {
    if (user.isFollowing) {
      setShowUnfollowConfirm(true);
    } else {
      onToggleFollow(user.id);
    }
  };

  const confirmUnfollow = () => {
    onToggleFollow(user.id);
    setShowUnfollowConfirm(false);
  };

  const handleConfirmBlock = () => {
    if (onBlockUser && user) {
      onBlockUser({
        id: user.id,
        name: user.name,
        handle: user.handle,
        avatar: user.avatar,
      });
    }
    setIsBlockModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md bg-[#0c081e] border border-purple-800/40 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.3)] flex flex-col max-h-[90vh]">
        {/* Cover Banner */}
        <div className="relative h-36 w-full overflow-hidden bg-purple-950 shrink-0">
          <img
            src={user.coverImage}
            alt="Profile Cover"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover ${isBlocked ? 'grayscale' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c081e] via-black/20 to-black/50" />

          {/* Top Bar Actions */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/30 text-[10px] font-mono text-cyan-300">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>MYSPACE PROFILE</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick Block/Unblock Button in top bar */}
              {isBlocked ? (
                <button
                  type="button"
                  onClick={() => onUnblockUser && onUnblockUser(user.id)}
                  className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center gap-1 shadow-md hover:bg-emerald-900 transition-colors cursor-pointer"
                  title="Unblock this user"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Unblock</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(true)}
                  className="p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-rose-800/50 text-rose-300 hover:text-white hover:bg-rose-950 transition-colors cursor-pointer"
                  title="Block User"
                >
                  <Ban className="w-4 h-4" />
                </button>
              )}

              <button
                id="close-user-profile-btn"
                onClick={onClose}
                className="p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/30 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 -mt-12 relative z-10 no-scrollbar">
          {/* Avatar and Main Actions Header */}
          <div className="flex items-end justify-between gap-3">
            {/* Avatar with Glow & Online Status */}
            <div className="relative group shrink-0">
              <div
                className={`w-20 h-20 rounded-2xl p-0.5 shadow-lg overflow-hidden ${
                  isBlocked
                    ? 'bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover rounded-[14px] bg-[#0c081e] ${
                    isBlocked ? 'grayscale' : ''
                  }`}
                />
              </div>
              {/* Online Indicator */}
              {!isBlocked && (
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0c081e] ${
                    user.isOnline
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : 'bg-slate-500'
                  }`}
                  title={user.isOnline ? 'Online' : 'Offline'}
                />
              )}
            </div>

            {/* Follow / Unfollow / Friend Request / Blocked status */}
            <div className="flex items-center gap-2 pb-1">
              {isBlocked ? (
                <div className="flex items-center gap-1.5">
                  <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs font-mono font-bold flex items-center gap-1">
                    <Ban className="w-3.5 h-3.5" /> Blocked
                  </span>
                  <button
                    type="button"
                    onClick={() => onUnblockUser && onUnblockUser(user.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/60 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ) : (
                <>
                  {/* Follow Button */}
                  {user.isFollowing ? (
                    <div className="relative">
                      <button
                        id="user-profile-following-btn"
                        onClick={handleFollowClick}
                        className="px-3.5 py-2 rounded-2xl bg-purple-900/50 border border-purple-700/60 text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-950/40 hover:border-rose-700 hover:text-rose-300 transition-all cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </button>

                      {/* Unfollow Popup */}
                      {showUnfollowConfirm && (
                        <div className="absolute right-0 top-11 w-44 p-2 rounded-xl bg-[#170e33] border border-pink-500/50 shadow-xl z-30 text-center space-y-2">
                          <p className="text-[11px] text-slate-300">Unfollow {user.name}?</p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={confirmUnfollow}
                              className="flex-1 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Unfollow
                            </button>
                            <button
                              onClick={() => setShowUnfollowConfirm(false)}
                              className="flex-1 py-1 rounded-lg bg-purple-900/60 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      id="user-profile-follow-btn"
                      onClick={handleFollowClick}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all hover:scale-105 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </button>
                  )}

                  {/* Friend Request Action */}
                  {user.friendRequestStatus === 'friends' ? (
                    <span className="px-2.5 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1">
                      <Check className="w-3 h-3" /> Friends
                    </span>
                  ) : user.friendRequestStatus === 'sent' ? (
                    <span className="px-2.5 py-2 rounded-2xl bg-purple-900/40 border border-purple-700/40 text-slate-300 text-xs font-mono">
                      Requested
                    </span>
                  ) : (
                    <button
                      id="user-profile-add-friend-btn"
                      onClick={() => onSendFriendRequest(user.id)}
                      className="px-3 py-2 rounded-2xl bg-purple-900/40 border border-purple-700/50 hover:border-pink-500 text-pink-300 text-xs font-semibold transition-all hover:bg-pink-500/20 cursor-pointer"
                      title="Send Friend Request"
                    >
                      + Add Friend
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* User Name, Handle, and Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-bold text-xl text-white">
                {user.name}
              </h2>
              {user.badges?.[0] && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono">
                  {user.badges[0]}
                </span>
              )}
              {isBlocked && (
                <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-300 text-[10px] font-mono">
                  Blocked Contact
                </span>
              )}
            </div>
            <p className="text-xs text-pink-400 font-mono">{user.handle}</p>

            <div className="flex items-center gap-2 text-xs pt-1">
              <span
                className={`flex items-center gap-1.5 font-medium ${
                  isBlocked ? 'text-rose-400' : user.isOnline ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBlocked
                      ? 'bg-rose-500'
                      : user.isOnline
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-slate-500'
                  }`}
                />
                {isBlocked ? 'Blocked' : user.isOnline ? 'Online Now' : 'Offline'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 text-xs truncate">
                {user.statusText}
              </span>
            </div>
          </div>

          {/* Blocked banner notice */}
          {isBlocked && (
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-400 shrink-0" />
                <span>This user is blocked. Messages and game invites are restricted.</span>
              </div>
              <button
                type="button"
                onClick={() => onUnblockUser && onUnblockUser(user.id)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/60 text-emerald-300 font-bold text-[11px] shrink-0 cursor-pointer"
              >
                Unblock
              </button>
            </div>
          )}

          {/* Bio */}
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/30 text-xs text-slate-200 leading-relaxed">
            {user.bio}
            {user.tags && user.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {user.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-purple-900/40 text-cyan-300 text-[10px] font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-[#140e2e] border border-purple-800/30">
              <span className="font-display font-bold text-base text-white">
                {user.followersCount.toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Followers</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#140e2e] border border-purple-800/30">
              <span className="font-display font-bold text-base text-pink-400">
                {user.followingCount.toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Following</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#140e2e] border border-purple-800/30">
              <span className="font-display font-bold text-base text-cyan-400">
                {user.mutualFriendsCount || 8}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Mutual Friends</p>
            </div>
          </div>

          {/* THE 4 REQUIRED USER ACTIONS: Message, Voice Call, Video Call, Play Game */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-pink-400 font-bold">
                Direct Interaction Link
              </h4>
              {isBlocked && (
                <span className="text-[10px] text-rose-400 font-mono">Restricted (Blocked)</span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {/* 1. Message */}
              <button
                id="user-profile-action-message"
                disabled={isBlocked}
                onClick={() => {
                  onOpenChat(user);
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-purple-900/60 to-purple-950/70 border border-purple-600/40 hover:border-pink-500 text-white hover:scale-105 disabled:opacity-30 disabled:pointer-events-none transition-all group shadow-sm cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors mb-1.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold">Message</span>
              </button>

              {/* 2. Voice Call */}
              <button
                id="user-profile-action-voice"
                disabled={isBlocked}
                onClick={() => {
                  onStartVoiceCall(user);
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-purple-900/60 to-purple-950/70 border border-purple-600/40 hover:border-cyan-400 text-white hover:scale-105 disabled:opacity-30 disabled:pointer-events-none transition-all group shadow-sm cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors mb-1.5">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold">Voice Call</span>
              </button>

              {/* 3. Video Call */}
              <button
                id="user-profile-action-video"
                disabled={isBlocked}
                onClick={() => {
                  onStartVideoCall(user);
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-purple-900/60 to-purple-950/70 border border-purple-600/40 hover:border-pink-400 text-white hover:scale-105 disabled:opacity-30 disabled:pointer-events-none transition-all group shadow-sm cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors mb-1.5">
                  <Video className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold">Video Call</span>
              </button>

              {/* 4. Play Arcade Game */}
              <button
                id="user-profile-action-game"
                disabled={isBlocked}
                onClick={() => {
                  onPlayGame(user);
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-purple-900/60 to-purple-950/70 border border-purple-600/40 hover:border-amber-400 text-white hover:scale-105 disabled:opacity-30 disabled:pointer-events-none transition-all group shadow-sm cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors mb-1.5">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold">Play Game</span>
              </button>
            </div>
          </div>

          {/* Profile Anthem Player */}
          {user.anthem && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-pink-950/40 border border-pink-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsPlayingAnthem(!isPlayingAnthem)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-[0_0_10px_rgba(236,72,153,0.5)] hover:scale-105 transition-transform cursor-pointer"
                >
                  {isPlayingAnthem ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  )}
                </button>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-pink-400 uppercase tracking-wider flex items-center gap-1">
                    <Music className="w-3 h-3" /> Profile Anthem
                  </span>
                  <h5 className="font-semibold text-xs text-white truncate">
                    {user.anthem.title}
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user.anthem.artist}
                  </p>
                </div>
              </div>

              {isPlayingAnthem && (
                <div className="flex items-center gap-0.5 shrink-0 px-2 py-1 rounded bg-black/40 border border-pink-500/30">
                  <span className="w-1 h-3 bg-pink-500 animate-pulse rounded-full" />
                  <span className="w-1 h-4 bg-purple-400 animate-pulse delay-75 rounded-full" />
                  <span className="w-1 h-2 bg-cyan-400 animate-pulse delay-150 rounded-full" />
                </div>
              )}
            </div>
          )}

          {/* Block User Action button at bottom of profile */}
          <div className="pt-2">
            {isBlocked ? (
              <button
                type="button"
                onClick={() => onUnblockUser && onUnblockUser(user.id)}
                className="w-full py-2.5 rounded-xl bg-purple-950/40 hover:bg-emerald-950/30 border border-purple-800/40 hover:border-emerald-500 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Unblock {user.name}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-purple-950/20 hover:bg-rose-950/30 border border-purple-900/40 hover:border-rose-700 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5 text-rose-400" />
                Block {user.name}
              </button>
            )}
          </div>
        </div>

        {/* Block Confirmation Modal */}
        <ConfirmationModal
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          onConfirm={handleConfirmBlock}
          title={`Block ${user.name}?`}
          message={`Are you sure you want to block ${user.name}? They will not be able to message you, call you, or send game invites.`}
          confirmText="Block User"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};
