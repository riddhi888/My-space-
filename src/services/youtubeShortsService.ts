import { Reel } from '../types';

export interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId?: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    channelTitle: string;
  };
}

/**
 * Curated list of verified YouTube Shorts for seamless fallback
 * when VITE_YOUTUBE_API_KEY is not yet supplied or hits Google quota limit.
 */
export const FALLBACK_YOUTUBE_SHORTS: Reel[] = [
  {
    id: 'yt_short_1',
    creator: {
      name: 'Retro Neon Beats',
      handle: '@retroneon',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    videoThumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    externalUrl: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    caption: 'Tokyo late night neon walk with 2008 synthwave soundtrack ⚡🌃',
    audioTrack: 'MGMT - Kids (2008 Cyber Remix)',
    likes: '84.2k',
    comments: '3,410',
    tags: ['#Shorts', '#CyberVibe', '#Y2K', '#MySpaceReels', '#RetroWave'],
    platform: 'youtube',
  },
  {
    id: 'yt_short_2',
    creator: {
      name: 'Indie Basement Garage',
      handle: '@garageband08',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    videoThumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/shorts/aCyGvGEtOwc',
    externalUrl: 'https://www.youtube.com/shorts/aCyGvGEtOwc',
    caption: 'Live basement jam session with full tube amps & analog reverb 🎸🔥',
    audioTrack: 'The Killers - Mr. Brightside (Live Basement)',
    likes: '62.9k',
    comments: '2,890',
    tags: ['#Shorts', '#IndieRock', '#LiveMusic', '#BasementJam'],
    platform: 'youtube',
  },
  {
    id: 'yt_short_3',
    creator: {
      name: 'Cyber Arcade Zone',
      handle: '@arcadevoyager',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    },
    videoThumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/shorts/5qap5aO4i9A',
    externalUrl: 'https://www.youtube.com/shorts/5qap5aO4i9A',
    caption: 'Lo-Fi beatmaking on 90s vintage sampler machine 🎹🎧',
    audioTrack: 'Nujabes Tribute - Rainy Day Beat',
    likes: '45.1k',
    comments: '1,720',
    tags: ['#Shorts', '#LoFiBeats', '#MusicProduction', '#Chillhop'],
    platform: 'youtube',
  },
  {
    id: 'yt_short_4',
    creator: {
      name: 'Skate 2008 Crew',
      handle: '@skate08',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
    videoThumbnail: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/shorts/e_04ZrNroTo',
    externalUrl: 'https://www.youtube.com/shorts/e_04ZrNroTo',
    caption: 'Sunset half-pipe tricks captured on vintage miniDV camcorder 🛹🌇',
    audioTrack: 'Blink-182 - All The Small Things',
    likes: '71.5k',
    comments: '2,430',
    tags: ['#Shorts', '#Skateboarding', '#Y2KAesthetic', '#MiniDV'],
    platform: 'youtube',
  },
  {
    id: 'yt_short_5',
    creator: {
      name: 'Paramore Tribute Club',
      handle: '@hayleyscene',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    },
    videoThumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/shorts/kXYiU_JCYtU',
    externalUrl: 'https://www.youtube.com/shorts/kXYiU_JCYtU',
    caption: '2008 Emo anthem acoustic cover in the rain 🖤🌧️',
    audioTrack: 'Linkin Park - Numb (Acoustic)',
    likes: '93.7k',
    comments: '4,150',
    tags: ['#Shorts', '#EmoNostalgia', '#SceneKids', '#2008Vibes'],
    platform: 'youtube',
  },
];

/**
 * Fetch YouTube Shorts via YouTube Data API v3
 * Search query: videoCategoryId=24 (Entertainment), type=video, videoDuration=short
 */
export async function fetchYouTubeShorts(query: string = 'shorts'): Promise<Reel[]> {
  const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_YOUTUBE_API_KEY) || '';

  if (!apiKey || apiKey.trim() === '') {
    console.info('VITE_YOUTUBE_API_KEY not set, using curated YouTube Shorts feed.');
    return FALLBACK_YOUTUBE_SHORTS;
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('videoDuration', 'short');
    url.searchParams.set('videoCategoryId', '24'); // Entertainment category
    url.searchParams.set('maxResults', '25');
    url.searchParams.set('q', query);
    url.searchParams.set('key', apiKey.trim());

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.warn(`YouTube Data API returned status ${response.status}. Using fallback feed.`);
      return FALLBACK_YOUTUBE_SHORTS;
    }

    const data = await response.json();
    const items: YouTubeSearchItem[] = data.items || [];

    if (items.length === 0) {
      return FALLBACK_YOUTUBE_SHORTS;
    }

    return items
      .filter((item) => item.id?.videoId)
      .map((item, index) => {
        const videoId = item.id.videoId!;
        const snippet = item.snippet;
        const thumbnail =
          snippet.thumbnails.high?.url ||
          snippet.thumbnails.medium?.url ||
          snippet.thumbnails.default?.url ||
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        // Generate lively 2008-style like/comment numbers
        const likesNum = (Math.floor(Math.random() * 80) + 15).toFixed(1);
        const commentsNum = (Math.floor(Math.random() * 2000) + 300).toLocaleString();

        return {
          id: `yt_${videoId}_${index}`,
          creator: {
            name: snippet.channelTitle || 'YouTube Creator',
            handle: `@${(snippet.channelTitle || 'creator').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(snippet.channelTitle || videoId)}`,
          },
          videoThumbnail: thumbnail,
          videoUrl: `https://www.youtube.com/shorts/${videoId}`,
          externalUrl: `https://www.youtube.com/shorts/${videoId}`,
          caption: snippet.title || 'Trending YouTube Short',
          audioTrack: `${snippet.channelTitle} - Original Audio`,
          likes: `${likesNum}k`,
          comments: commentsNum,
          tags: ['#YouTubeShorts', '#Shorts', '#Viral', '#Trending'],
          platform: 'youtube',
        };
      });
  } catch (error) {
    console.warn('Failed to fetch from YouTube Data API:', error);
    return FALLBACK_YOUTUBE_SHORTS;
  }
}
