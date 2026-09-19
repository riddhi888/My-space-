import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { SocialUser } from '../types';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SocialUser | null;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isVideoActive, setIsVideoActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [cyberFilter, setCyberFilter] = useState<'neon' | 'cyber' | 'synth'>('neon');

  useEffect(() => {
    if (!isOpen || !user) {
      setCallDuration(0);
      setCallStatus('connecting');
      setIsVideoActive(true);
      setIsMuted(false);
      return;
    }

    const timer = setTimeout(() => {
      setCallStatus('connected');
    }, 1500);

    return () => clearTimeout(timer);
  }, [isOpen, user]);

  useEffect(() => {
    let interval: any;
    if (isOpen && callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callStatus]);

  if (!isOpen || !user) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const cycleFilter = () => {
    const filters: ('neon' | 'cyber' | 'synth')[] = ['neon', 'cyber', 'synth'];
    const nextIdx = (filters.indexOf(cyberFilter) + 1) % filters.length;
    setCyberFilter(filters[nextIdx]);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md h-full sm:h-[90vh] bg-[#070512] border border-purple-800/50 rounded-none sm:rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.4)] flex flex-col justify-between">
        {/* Remote Video Stream Area */}
        <div className="relative flex-1 w-full bg-gradient-to-b from-[#150a2b] via-[#0b071a] to-[#080514] overflow-hidden flex flex-col items-center justify-center">
          {/* Cyberpunk Scanlines and Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.4)_51%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-black/60 to-black pointer-events-none" />

          {/* Futuristic HUD Elements */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/60 border border-purple-700/50 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
                {callStatus === 'connected' ? `LIVE • ${formatTime(callDuration)}` : 'ESTABLISHING LINK...'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-black/60 border border-pink-500/40 text-[10px] font-mono text-pink-300">
              <ShieldCheck className="w-3 h-3 text-pink-400" />
              <span>4K 60FPS</span>
            </div>
          </div>

          {/* Remote Video Content */}
          <div className="relative flex flex-col items-center justify-center space-y-4 z-10">
            {/* Animated Cyber Ring Avatar */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-full border border-pink-500/30 animate-spin" style={{ animationDuration: '10s' }} />
              <div className="absolute -inset-3 rounded-full border border-cyan-400/40 animate-ping opacity-30" />

              <div className="relative p-2 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 shadow-[0_0_50px_rgba(236,72,153,0.5)]">
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#090714]"
                />
                {user.isOnline && (
                  <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#090714] shadow-[0_0_10px_#34d399]" />
                )}
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-display font-bold text-2xl text-white tracking-wide">
                {user.name}
              </h3>
              <p className="text-xs text-cyan-400 font-mono mt-0.5">{user.handle}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-600/40 text-[10px] text-pink-300 font-mono">
                  {user.statusText}
                </span>
              </div>
            </div>
          </div>

          {/* Picture-in-Picture Local Camera Preview (Alex) */}
          <div className="absolute bottom-24 right-4 w-28 h-38 rounded-2xl overflow-hidden border-2 border-pink-500/60 shadow-[0_0_25px_rgba(236,72,153,0.4)] bg-[#120c29] z-20 group">
            {isVideoActive ? (
              <div className="relative w-full h-full bg-purple-950">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                  alt="You"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover ${
                    cyberFilter === 'neon'
                      ? 'contrast-125 hue-rotate-15'
                      : cyberFilter === 'synth'
                      ? 'contrast-110 saturate-150'
                      : 'brightness-110'
                  }`}
                />
                <span className="absolute top-1.5 left-1.5 text-[9px] font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded text-pink-300">
                  YOU
                </span>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-slate-400">
                <VideoOff className="w-6 h-6 text-rose-400" />
                <span className="text-[9px] mt-1 font-mono">Camera Off</span>
              </div>
            )}
          </div>
        </div>

        {/* Video Call Controls Bar */}
        <div className="bg-[#090714]/95 border-t border-purple-900/50 p-5 px-6 flex items-center justify-around z-30">
          {/* Toggle Video */}
          <button
            id="video-call-toggle-camera-btn"
            onClick={() => setIsVideoActive(!isVideoActive)}
            className={`p-3.5 rounded-2xl border transition-all ${
              !isVideoActive
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-purple-950/60 border-purple-700/50 text-white hover:bg-purple-900'
            }`}
            title={isVideoActive ? 'Turn off video' : 'Turn on video'}
          >
            {isVideoActive ? <Video className="w-5 h-5 text-cyan-300" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Toggle Mic */}
          <button
            id="video-call-toggle-mic-btn"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl border transition-all ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-purple-950/60 border-purple-700/50 text-white hover:bg-purple-900'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-300" />}
          </button>

          {/* Switch Cyber Filter */}
          <button
            id="video-call-filter-btn"
            onClick={cycleFilter}
            className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-700/50 text-pink-300 hover:text-white hover:bg-purple-900 transition-all flex items-center gap-1 text-xs font-mono"
            title="Cycle Neon Filter"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="uppercase text-[10px] hidden sm:inline">{cyberFilter}</span>
          </button>

          {/* End Video Call */}
          <button
            id="video-call-end-btn"
            onClick={handleEndCall}
            className="p-3.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_25px_rgba(225,29,72,0.6)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            title="End Video Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="text-xs font-bold">End</span>
          </button>
        </div>
      </div>
    </div>
  );
};
