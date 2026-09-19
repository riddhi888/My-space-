import React from 'react';
import { Facebook, Youtube, Instagram, Plus, ExternalLink } from 'lucide-react';
import { UserSocialLinks } from '../types';

export const SpotifyIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = 'w-4 h-4',
  style,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.216.353-.674.467-1.027.251-2.812-1.718-6.352-2.106-10.523-1.153-.404.093-.807-.162-.9-.567-.093-.404.162-.808.567-.901 4.568-1.044 8.49-.606 11.632 1.314.354.216.468.674.251 1.056zm1.465-3.26c-.272.441-.852.581-1.293.309-3.218-1.978-8.124-2.55-11.93-1.394-.498.151-1.026-.135-1.177-.633-.151-.498.135-1.026.633-1.177 4.355-1.322 9.775-.682 13.458 1.583.441.272.581.852.309 1.312zm.126-3.41c-3.858-2.291-10.222-2.502-13.898-1.386-.59.18-1.222-.152-1.402-.743-.18-.59.152-1.222.743-1.402 4.225-1.282 11.248-1.037 15.696 1.603.531.315.704 1.002.389 1.533-.315.531-1.002.704-1.528.395z" />
  </svg>
);

export interface SocialPlatformConfig {
  key: keyof UserSocialLinks;
  name: string;
  label: string;
  brandColor: string;
  brandGlow: string;
  bgActive: string;
  borderActive: string;
  placeholder: string;
  defaultDomain: string;
  renderIcon: (className?: string) => React.ReactNode;
}

export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    key: 'facebook',
    name: 'Facebook',
    label: 'Facebook URL',
    brandColor: '#1877F2',
    brandGlow: 'rgba(24, 119, 242, 0.5)',
    bgActive: '#1877F2',
    borderActive: '#1877F2',
    placeholder: 'https://facebook.com/username',
    defaultDomain: 'facebook.com',
    renderIcon: (className = 'w-4 h-4') => <Facebook className={className} />,
  },
  {
    key: 'instagram',
    name: 'Instagram',
    label: 'Instagram URL',
    brandColor: '#E4405F',
    brandGlow: 'rgba(228, 64, 95, 0.55)',
    bgActive: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    borderActive: '#E4405F',
    placeholder: 'https://instagram.com/username',
    defaultDomain: 'instagram.com',
    renderIcon: (className = 'w-4 h-4') => <Instagram className={className} />,
  },
  {
    key: 'youtube',
    name: 'YouTube',
    label: 'YouTube URL',
    brandColor: '#FF0000',
    brandGlow: 'rgba(255, 0, 0, 0.55)',
    bgActive: '#FF0000',
    borderActive: '#FF0000',
    placeholder: 'https://youtube.com/@username',
    defaultDomain: 'youtube.com',
    renderIcon: (className = 'w-4 h-4') => <Youtube className={className} />,
  },
  {
    key: 'spotify',
    name: 'Spotify/Other',
    label: 'Spotify/Other URL',
    brandColor: '#1DB954',
    brandGlow: 'rgba(29, 185, 84, 0.55)',
    bgActive: '#1DB954',
    borderActive: '#1DB954',
    placeholder: 'https://open.spotify.com/artist/username',
    defaultDomain: 'spotify.com',
    renderIcon: (className = 'w-4 h-4') => <SpotifyIcon className={className} />,
  },
];

export const normalizeUrl = (rawUrl?: string): string => {
  if (!rawUrl || !rawUrl.trim()) return '';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const getStorageKey = (userId?: string): string => {
  return `myspace_social_links_${userId || 'default'}`;
};

export const loadSocialLinksFromStorage = (userId?: string, fallbackLinks?: UserSocialLinks): UserSocialLinks => {
  try {
    // 1. Check direct 'socialLinks' key as explicitly requested
    const directRaw = localStorage.getItem('socialLinks');
    if (directRaw) {
      const parsed = JSON.parse(directRaw);
      if (parsed && typeof parsed === 'object') {
        return {
          facebook: parsed.facebook || '',
          instagram: parsed.instagram || '',
          youtube: parsed.youtube || '',
          spotify: parsed.spotify || '',
        };
      }
    }

    // 2. User-specific fallback key
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          facebook: parsed.facebook || '',
          instagram: parsed.instagram || '',
          youtube: parsed.youtube || '',
          spotify: parsed.spotify || '',
        };
      }
    }
  } catch (e) {
    console.error('Failed to load social links from localStorage', e);
  }
  return {
    facebook: fallbackLinks?.facebook || '',
    instagram: fallbackLinks?.instagram || '',
    youtube: fallbackLinks?.youtube || '',
    spotify: fallbackLinks?.spotify || '',
  };
};

export const saveSocialLinksToStorage = (userId: string | undefined, links: UserSocialLinks): void => {
  try {
    // Save to localStorage under 'socialLinks' as requested
    localStorage.setItem('socialLinks', JSON.stringify(links));
    if (userId) {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(links));
    }
    // Notify listeners in same window
    window.dispatchEvent(new Event('socialLinks-updated'));
  } catch (e) {
    console.error('Failed to save social links to localStorage', e);
  }
};

interface BannerSocialLinksProps {
  socialLinks?: UserSocialLinks;
  userId?: string;
  isPreviewMode?: boolean;
  onOpenEditModal?: () => void;
}

export const BannerSocialLinks: React.FC<BannerSocialLinksProps> = ({
  socialLinks,
  userId,
  isPreviewMode = false,
  onOpenEditModal,
}) => {
  const activeLinks = socialLinks || {};

  // Find connected platforms that have a valid URL
  const connectedPlatforms = SOCIAL_PLATFORMS.filter((platform) => {
    const url = activeLinks[platform.key];
    return Boolean(url && url.trim().length > 0);
  });

  const hasConnected = connectedPlatforms.length > 0;

  if (!hasConnected) {
    // If empty, show "Add" button as requested
    return (
      <div id="profile-banner-social-container" className="flex items-center">
        {!isPreviewMode && onOpenEditModal ? (
          <button
            type="button"
            id="banner-add-social-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenEditModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-[#1f0f38] text-pink-300 hover:text-pink-200 border border-pink-500/50 hover:border-pink-400 backdrop-blur-md text-[11px] font-mono font-medium shadow-[0_0_15px_rgba(236,72,153,0.35)] transition-all cursor-pointer group hover:scale-102"
            title="Add your Facebook, YouTube, Instagram & Spotify links"
          >
            <Plus className="w-3.5 h-3.5 text-pink-400 group-hover:rotate-90 transition-transform" />
            <span className="tracking-wide">+ Add Social Links</span>
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      id="profile-banner-social-container"
      className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/75 backdrop-blur-md border border-purple-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.7)]"
    >
      {connectedPlatforms.map((platform) => {
        const rawUrl = activeLinks[platform.key];
        const finalUrl = normalizeUrl(rawUrl);

        return (
          <a
            key={platform.key}
            id={`banner-social-link-${platform.key}`}
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 shadow-md relative group cursor-pointer"
            style={{
              background: platform.bgActive,
              boxShadow: `0 0 12px ${platform.brandGlow}`,
              border: `1px solid ${platform.borderActive}`,
            }}
            title={`${platform.name}: ${finalUrl}`}
          >
            {platform.renderIcon('w-4 h-4')}
            {/* Tooltip on hover */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#0c071a] border border-purple-600/60 text-[10px] font-mono text-cyan-300 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-30">
              {platform.name}
            </span>
          </a>
        );
      })}

      {/* Quick Add / Manage Button for profile owner if not in preview mode */}
      {!isPreviewMode && onOpenEditModal && (
        <button
          type="button"
          id="banner-manage-social-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenEditModal();
          }}
          className="w-8 h-8 rounded-xl bg-purple-950/70 hover:bg-purple-800/80 text-pink-300 hover:text-white border border-purple-700/60 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
          title="Add or Edit Social Links"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export interface ProfileHeaderSocialLinksProps {
  socialLinks?: UserSocialLinks;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Renders connected social icons on the profile header with authentic brand colors.
 * Clickable to open real external profiles in a new tab.
 * If a link is empty, its icon is NOT rendered. If all are empty, returns null.
 */
export const ProfileHeaderSocialLinks: React.FC<ProfileHeaderSocialLinksProps> = ({
  socialLinks,
  className = '',
  size = 'md',
}) => {
  const activeLinks = socialLinks || {};

  // If link is empty, don't show icon
  const connectedPlatforms = SOCIAL_PLATFORMS.filter((platform) => {
    const url = activeLinks[platform.key];
    return Boolean(url && url.trim().length > 0);
  });

  if (connectedPlatforms.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-6 h-6 rounded-lg',
    md: 'w-7 h-7 rounded-xl',
    lg: 'w-8 h-8 rounded-xl',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div
      id="profile-header-social-links-bar"
      className={`inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#0e0720]/80 backdrop-blur-md border border-purple-800/50 shadow-sm ${className}`}
    >
      {connectedPlatforms.map((platform) => {
        const rawUrl = activeLinks[platform.key];
        const finalUrl = normalizeUrl(rawUrl);

        return (
          <a
            key={platform.key}
            id={`profile-header-icon-${platform.key}`}
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`${sizeClasses} flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 shadow-md relative group cursor-pointer`}
            style={{
              background: platform.bgActive,
              boxShadow: `0 0 10px ${platform.brandGlow}`,
              border: `1px solid ${platform.borderActive}`,
            }}
            title={`${platform.name}: ${finalUrl}`}
            aria-label={`${platform.name} profile`}
          >
            {platform.renderIcon(iconSizes)}
            {/* Hover tooltip */}
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#0c071a] border border-purple-600/70 text-[9px] font-mono text-cyan-300 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-30">
              {platform.name}
            </span>
          </a>
        );
      })}
    </div>
  );
};

