import React, { useState } from 'react';
import { Download, Share, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    }
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-semibold">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>Installed!</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'header') {
      return (
        <button
          id="pwa-header-install-btn"
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 hover:from-pink-500/30 hover:to-cyan-500/30 border border-pink-500/40 hover:border-pink-400 text-pink-200 hover:text-white text-xs font-semibold shadow-[0_0_15px_rgba(236,72,153,0.25)] transition-all active:scale-95 focus:outline-none"
          title="Install MySpace App"
        >
          <Download className="w-3.5 h-3.5 text-pink-400 animate-bounce" />
          <span className="hidden sm:inline">Install</span>
        </button>
      );
    }

    return (
      <div className="mx-4 my-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#150e2e]/90 to-blue-950/80 border border-purple-700/50 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-cyan-400 p-0.5 shrink-0 shadow-md shadow-pink-500/30">
            <img src="/icon.png" alt="MySpace" className="w-full h-full object-cover rounded-[10px]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Install MySpace App</div>
            <div className="text-[11px] text-slate-300">Add to home screen for full-screen neon vibe</div>
          </div>
        </div>
        <button
          onClick={handleInstallClick}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-pink-500/40 transition-transform active:scale-95 whitespace-nowrap"
        >
          Install
        </button>
      </div>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-header-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-700/50 text-pink-200 text-xs font-medium transition-all focus:outline-none"
          title="Install on iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#120d26] border border-purple-500/40 p-5 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
                    <Share className="w-4 h-4 text-pink-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">Install on iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Install MySpace to your Home Screen for the full standalone app experience:
              </p>
              <div className="space-y-2.5 text-xs bg-purple-950/40 p-3 rounded-xl border border-purple-800/30">
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-pink-500/30 text-pink-300 font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button in Safari's navigation bar.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-pink-500/30 text-pink-300 font-bold flex items-center justify-center shrink-0">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-pink-500/30 text-pink-300 font-bold flex items-center justify-center shrink-0">3</span>
                  <span>Confirm with <strong>Add</strong> in the top right.</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold hover:brightness-110 shadow-md shadow-pink-500/30 transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
