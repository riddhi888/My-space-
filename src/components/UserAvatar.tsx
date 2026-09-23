import React, { useState } from 'react';

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  isOnline?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnline?: boolean;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  avatar,
  isOnline = false,
  size = 'md',
  showOnline = false,
  className = '',
  glow = false,
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold',
    '2xl': 'w-24 h-24 text-2xl font-extrabold',
  }[size];

  const onlineDotSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-4 h-4',
  }[size];

  const initials = getInitials(name);
  const showImage = avatar && avatar.trim().length > 0 && !hasError;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${sizeClasses} ${
        glow ? 'shadow-[0_0_15px_rgba(236,72,153,0.5)]' : ''
      } ${className}`}
    >
      {showImage ? (
        <img
          src={avatar}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full rounded-full object-cover border border-purple-500/30"
        />
      ) : (
        <div
          className="w-full h-full rounded-full bg-gradient-to-tr from-purple-800 via-pink-600 to-indigo-600 border border-purple-400/40 flex items-center justify-center text-white font-display tracking-wider shadow-inner"
        >
          {initials}
        </div>
      )}

      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 ${onlineDotSizes} rounded-full border-2 border-[#090714] ${
            isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-500'
          }`}
        />
      )}
    </div>
  );
};
