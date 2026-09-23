import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/90 border border-amber-400 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md animate-pulse">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline Mode — Cached data is active</span>
    </div>
  );
};
