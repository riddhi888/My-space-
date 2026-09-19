import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Sparkles, Radio } from 'lucide-react';
import { SocialUser } from '../types';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SocialUser | null;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  useEffect(() => {
    if (!isOpen || !user) {
      setCallDuration(0);
      setCallStatus('connecting');
      setIsMuted(false);
      return;
    }

    // Connect after 1.8 seconds
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 1800);

    return () => clearTimeout(connectTimer);
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

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-[#0e0924] border border-pink-500/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(236,72,153,0.35)] flex flex-col items-center p-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Cyber Grid background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-pink-500/15 via-purple-900/10 to-transparent pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/50 border border-purple-600/40 text-[11px] font-mono text-pink-300">
          <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>CYBER VOICE LINK • ENCRYPTED</span>
        </div>

        {/* User Avatar with pulsing neon soundwave rings */}
        <div className="relative my-4">
          {callStatus === 'connected' && (
            <>
              <div className="absolute -inset-4 rounded-full border-2 border-pink-500/30 animate-ping opacity-50" />
              <div className="absolute -inset-8 rounded-full border border-cyan-400/20 animate-pulse" />
            </>
          )}

          <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 shadow-[0_0_35px_rgba(236,72,153,0.6)]">
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-28 h-28 rounded-full object-cover border-4 border-[#0e0924]"
            />
            {user.isOnline && (
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#0e0924] shadow-[0_0_10px_#34d399]" />
            )}
          </div>
        </div>

        {/* Caller Info */}
        <div className="space-y-1 z-10">
          <h3 className="font-display font-bold text-xl text-white tracking-wide">
            {user.name}
          </h3>
          <p className="text-xs text-cyan-400 font-mono">{user.handle}</p>
          <div className="pt-2">
            {callStatus === 'connecting' && (
              <p className="text-xs text-pink-300 font-mono flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Calling cyber frequency...
              </p>
            )}
            {callStatus === 'connected' && (
              <p className="text-sm text-emerald-400 font-mono font-bold tracking-widest">
                {formatTime(callDuration)}
              </p>
            )}
            {callStatus === 'ended' && (
              <p className="text-xs text-rose-400 font-mono">Call Ended</p>
            )}
          </div>
        </div>

        {/* Animated Audio Equalizer Bars */}
        {callStatus === 'connected' && (
          <div className="flex items-center justify-center gap-1 h-8 z-10">
            {[40, 75, 100, 50, 90, 60, 85, 45, 95, 30].map((h, idx) => (
              <div
                key={idx}
                className="w-1 bg-gradient-to-t from-pink-500 to-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${idx * 120}ms`,
                  animationDuration: '600ms',
                }}
              />
            ))}
          </div>
        )}

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-5 pt-2 z-10 w-full">
          {/* Mute Button */}
          <button
            id="voice-call-mute-btn"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full border transition-all ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-purple-950/60 border-purple-700/50 text-slate-300 hover:text-white hover:bg-purple-900/60'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            id="voice-call-end-btn"
            onClick={handleEndCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_25px_rgba(225,29,72,0.6)] hover:scale-105 transition-all cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Speaker Button */}
          <button
            id="voice-call-speaker-btn"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3.5 rounded-full border transition-all ${
              isSpeakerOn
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                : 'bg-purple-950/60 border-purple-700/50 text-slate-400 hover:text-white'
            }`}
            title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
