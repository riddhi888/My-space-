import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowManualGuide(true);
    }
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Installed!
      </div>
    );
  }

  return (
    <>
      {variant === 'compact' && (
        <button
          id="pwa-install-compact-btn"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-500/20 via-purple-600/20 to-cyan-500/20 border border-pink-500/40 hover:border-pink-400 text-white text-xs font-medium transition-all shadow-[0_0_12px_rgba(236,72,153,0.25)] hover:shadow-[0_0_16px_rgba(236,72,153,0.4)] cursor-pointer group shrink-0 ${className}`}
          title="Install MySpace 2008 as an App"
        >
          <Download className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform animate-bounce" />
          <span className="hidden sm:inline font-mono text-[11px] text-pink-200">Install</span>
        </button>
      )}

      {variant === 'full' && (
        <button
          id="pwa-install-full-btn"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-cyan-950/40 border border-pink-500/40 hover:border-pink-400 text-white transition-all shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:shadow-[0_0_25px_rgba(236,72,153,0.35)] cursor-pointer group ${className}`}
        >
          <div className="flex items-center gap-3">
            <img
              src="/IMG-20260922-WA2869.jpg"
              alt="MySpace Icon"
              className="w-11 h-11 rounded-xl object-cover ring-1 ring-pink-500/50 shadow-md group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="text-left">
              <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                Install MySpace 2008
              </h4>
              <p className="text-xs text-slate-400">
                Run fullscreen on home screen with offline music & cache
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-pink-400 bg-pink-500/10 px-3 py-1.5 rounded-xl border border-pink-500/30">
            <Download className="w-3.5 h-3.5 animate-pulse" />
            <span>Install</span>
          </div>
        </button>
      )}

      {variant === 'banner' && (
        <div
          id="pwa-install-banner"
          className={`p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/50 via-purple-950/60 to-cyan-950/50 border border-pink-500/40 relative overflow-hidden shadow-lg ${className}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/IMG-20260922-WA2869.jpg"
                alt="MySpace Icon"
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-pink-500/40 shadow-md shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Install MySpace 2008 App</p>
                <p className="text-[11px] text-slate-400 truncate">Instant launch & full offline support</p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold shadow-md hover:brightness-110 transition cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e0921] border border-pink-500/50 p-6 shadow-[0_0_50px_rgba(236,72,153,0.3)] relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src="/IMG-20260922-WA2869.jpg"
                alt="MySpace Icon"
                className="w-12 h-12 rounded-2xl object-cover ring-1 ring-pink-500/50 shadow-lg shrink-0"
              />
              <div>
                <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
                <p className="text-xs text-pink-400 font-mono">Safari Home Screen App</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-200">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/30">
                <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white">Step 1:</span> Tap the <strong className="text-pink-300">Share</strong> icon in the bottom Safari toolbar.
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/30">
                <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white">Step 2:</span> Scroll down and tap <strong className="text-pink-300">"Add to Home Screen"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/30">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white">Step 3:</span> Tap <strong className="text-emerald-300">"Add"</strong> in the top right. MySpace 2008 will appear on your home screen!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold hover:brightness-110 transition cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Manual Android / Browser Install Guide Modal if deferredPrompt hasn't fired yet */}
      {showManualGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e0921] border border-cyan-500/50 p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative">
            <button
              onClick={() => setShowManualGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Install MySpace 2008</h3>
                <p className="text-xs text-cyan-400 font-mono">Add to Phone Home Screen</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              To install this application on your device right now:
            </p>

            <div className="space-y-2.5 text-xs text-slate-200">
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/30">
                1. Tap the browser menu (<strong className="text-cyan-300">⋮</strong> or <strong className="text-cyan-300">Share</strong>) at the top or bottom of your browser.
              </div>
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/30">
                2. Tap <strong className="text-pink-300">"Install App"</strong> or <strong className="text-pink-300">"Add to Home Screen"</strong>.
              </div>
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/30">
                3. Confirm the prompt to launch MySpace 2008 in standalone app mode!
              </div>
            </div>

            <button
              onClick={() => setShowManualGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold hover:brightness-110 transition cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};
