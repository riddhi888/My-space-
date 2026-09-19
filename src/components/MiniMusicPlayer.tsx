import React from 'react';

interface MiniMusicPlayerProps {
  onOpenFullPlayer?: () => void;
  isVisible?: boolean;
}

export const MiniMusicPlayer: React.FC<MiniMusicPlayerProps> = () => {
  // Bottom player removed per user requirement
  return null;
};
