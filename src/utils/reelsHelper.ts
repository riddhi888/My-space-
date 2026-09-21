/**
 * Reels helper utilities: Sharing, URL parsing, and platform in-app embeds
 */

/**
 * Shares a reel using the Web Share API if supported;
 * otherwise copies the link to the clipboard with user feedback.
 */
export async function shareReel(reelLink: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Check out this Reel on MySpace!',
        text: 'Shared from MySpace 2008 Reels',
        url: reelLink,
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        copyToClipboardFallback(reelLink);
        alert('Reel link copied to clipboard!');
      }
    }
  } else {
    copyToClipboardFallback(reelLink);
    alert('Reel link copied to clipboard!');
  }
}

/**
 * Extracts 11-char YouTube or YouTube Shorts ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

/**
 * Formats YouTube Shorts embed URL for iframe
 */
export function getYouTubeEmbedUrl(
  videoIdOrUrl: string,
  options: { autoplay?: boolean; muted?: boolean; loop?: boolean } = {}
): string {
  const videoId = extractYouTubeId(videoIdOrUrl) || videoIdOrUrl;
  const autoplay = options.autoplay ? 1 : 0;
  const mute = options.muted ? 1 : 0;
  const loop = options.loop !== false ? 1 : 0;
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&mute=${mute}&loop=${loop}&playlist=${videoId}&enablejsapi=1&playsinline=1&controls=1&rel=0`;
}

/**
 * Extracts Instagram reel/post shortcode ID from URL
 */
export function extractInstagramId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p|tv|stories\/[^/]+)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Converts Instagram reel or post link to https://www.instagram.com/reel/ID/embed/
 */
export function getInstagramEmbedUrl(url: string): string {
  if (!url) return 'https://www.instagram.com/explore/embed/';
  const shortcode = extractInstagramId(url);
  if (shortcode) {
    return `https://www.instagram.com/reel/${shortcode}/embed/`;
  }
  // If it's already an embed link
  if (url.includes('/embed')) {
    return url;
  }
  const cleanUrl = url.split('?')[0].replace(/\/$/, '');
  return `${cleanUrl}/embed/`;
}

/**
 * Generates an Instagram embed code fallback
 */
export function getInstagramEmbedCode(url: string): string {
  const embedUrl = getInstagramEmbedUrl(url);
  return `<iframe src="${embedUrl}" width="100%" height="480" frameborder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>`;
}

/**
 * Converts Facebook reel or video URL to Facebook embedded video plugin iframe URL
 * https://www.facebook.com/plugins/video.php?href=URL&show_text=false
 */
export function getFacebookEmbedUrl(url: string): string {
  if (!url) return 'https://www.facebook.com/plugins/video.php?show_text=false';
  // Standardize full URL
  let fullUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    fullUrl = `https://${url}`;
  }
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(fullUrl)}&show_text=false&t=0&autoplay=0`;
}

function copyToClipboardFallback(text: string): void {
  try {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackExecCopy(text);
      });
      return;
    }
  } catch {}
  fallbackExecCopy(text);
}

function fallbackExecCopy(text: string): void {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.warn('Fallback clipboard copy failed', err);
  }
  document.body.removeChild(textArea);
}

