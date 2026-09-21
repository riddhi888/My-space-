/**
 * Reels helper utilities: Sharing, URL parsing, and platform redirection
 */

/**
 * Shares a reel using the Web Share API if supported;
 * otherwise copies the link to the clipboard with user feedback.
 */
export async function shareReel(reelLink: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Ei Reels ta dekho!',
        text: 'Amar app theke share korlam',
        url: reelLink,
      });
    } catch (err: any) {
      // If the user cancelled the share dialog, do nothing; otherwise fallback to clipboard
      if (err?.name !== 'AbortError') {
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(reelLink);
            alert('Link copy hoye geche!');
          }
        } catch {
          // fallback copy
          copyToClipboardFallback(reelLink);
          alert('Link copy hoye geche!');
        }
      }
    }
  } else {
    // copy link
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(reelLink);
      } else {
        copyToClipboardFallback(reelLink);
      }
    } catch {
      copyToClipboardFallback(reelLink);
    }
    alert('Link copy hoye geche!');
  }
}

/**
 * Opens Instagram or Facebook Reels in a new tab/app
 */
export function openReels(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Extracts 11-char YouTube or YouTube Shorts ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

function copyToClipboardFallback(text: string): void {
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
