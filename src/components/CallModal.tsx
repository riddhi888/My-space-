import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Gamepad2,
  Shield,
  Wifi,
} from 'lucide-react';
import { Friend, CallType, CallState } from '../types';
import { UserAvatar } from './UserAvatar';

interface CallModalProps {
  callFriend: Friend;
  callType: CallType;
  callState: CallState;
  onAcceptCall: () => void;
  onEndCall: () => void;
  onSwitchCallType: (newType: CallType) => void;
  onOpenGame?: () => void;
  onShowToast?: (msg: string) => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  callFriend,
  callType,
  callState,
  onAcceptCall,
  onEndCall,
  onSwitchCallType,
  onOpenGame,
  onShowToast,
}) => {
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  // Call timer when connected
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setDurationSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    onShowToast?.(next ? 'Microphone muted' : 'Microphone unmuted');
  };

  const handleToggleSpeaker = () => {
    const next = !isSpeakerOn;
    setIsSpeakerOn(next);
    onShowToast?.(next ? 'Speakerphone enabled' : 'Earpiece enabled');
  };

  const handleToggleVideo = () => {
    const next = !isVideoDisabled;
    setIsVideoDisabled(next);
    onShowToast?.(next ? 'Camera stopped' : 'Camera started');
  };

  const handleFlipCamera = () => {
    setIsFrontCamera((prev) => !prev);
    onShowToast?.('Camera flipped');
  };

  // 1. INCOMING CALL DEMO SCREEN
  if (callState === 'incoming') {
    return (
      <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-6 max-w-md mx-auto animate-in fade-in duration-300">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pt-6">
          <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs font-mono text-pink-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" />
            Incoming Cyber {callType === 'video' ? 'Video' : 'Voice'} Call
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400" /> 256-bit Encrypted
          </span>
        </div>

        {/* Center Ringing Avatar & Information */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            {/* Animated ringing pulse rings */}
            <div className="absolute inset-0 -m-6 rounded-full border-2 border-pink-500/40 animate-ping" />
            <div className="absolute inset-0 -m-3 rounded-full border-2 border-purple-500/50 animate-pulse" />
            
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_35px_rgba(236,72,153,0.6)]">
              <UserAvatar
                name={callFriend.name}
                avatar={callFriend.avatar}
                size="xl"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-display text-white tracking-wide">
              {callFriend.name}
            </h2>
            <p className="text-sm font-mono text-pink-400 mt-1">
              {callFriend.handle}
            </p>
            <p className="text-xs text-slate-300 mt-2 flex items-center justify-center gap-1">
              {callFriend.statusText || 'Calling your MySpace terminal...'}
            </p>
          </div>

          {/* Sound pulse graphic */}
          <div className="flex items-center gap-1.5 h-6">
            {[40, 75, 90, 60, 100, 70, 85, 45, 95, 60].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className="w-1 rounded-full bg-gradient-to-t from-pink-500 to-cyan-400 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Bottom Accept / Decline Buttons */}
        <div className="w-full pb-8">
          <div className="flex items-center justify-around">
            {/* Decline Button */}
            <button
              id="decline-call-btn"
              onClick={onEndCall}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-rose-600/90 border-2 border-rose-400 text-white flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.6)] group-hover:scale-110 group-active:scale-95 transition-all">
                <PhoneOff className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-rose-300">Decline</span>
            </button>

            {/* Accept Button */}
            <button
              id="accept-call-btn"
              onClick={onAcceptCall}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 border-2 border-emerald-300 text-white flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.7)] group-hover:scale-110 group-active:scale-95 transition-all animate-bounce">
                {callType === 'video' ? (
                  <Video className="w-7 h-7" />
                ) : (
                  <Phone className="w-7 h-7" />
                )}
              </div>
              <span className="text-xs font-semibold text-emerald-300">Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. VIDEO CALL DEMO SCREEN
  if (callType === 'video') {
    return (
      <div className="fixed inset-0 z-[80] bg-[#090714] flex flex-col justify-between max-w-md mx-auto animate-in fade-in duration-300 overflow-hidden">
        {/* Main Friend Video Stream Simulation */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1b0d3a] via-[#100726] to-[#090714]">
          {(callFriend.coverImage || callFriend.storyImage || callFriend.avatar) ? (
            <img
              src={callFriend.coverImage || callFriend.storyImage || callFriend.avatar}
              alt="Video Feed"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserAvatar
                name={callFriend.name}
                avatar={callFriend.avatar}
                size="xl"
              />
            </div>
          )}
          {/* Neon scanlines & cyberpunk overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-[#090714] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(9,7,20,0.85)_100%)] pointer-events-none" />
        </div>

        {/* Top Video Call Bar */}
        <div className="relative z-10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-xs font-semibold text-white">{callFriend.name}</p>
              <p className="text-[10px] font-mono text-cyan-400">
                {formatDuration(durationSeconds)} • HD 1080p
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/30 text-cyan-400">
              <Wifi className="w-4 h-4" />
            </span>
            {onOpenGame && (
              <button
                id="video-call-arcade-duel-btn"
                onClick={onOpenGame}
                className="px-3 py-1.5 rounded-full bg-pink-500/80 border border-pink-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:scale-105 transition-transform"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Duel</span>
              </button>
            )}
          </div>
        </div>

        {/* User PiP (Picture in Picture) Camera Preview */}
        <div className="relative z-10 self-end mr-4 mb-2">
          <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-pink-500/80 shadow-[0_0_20px_rgba(236,72,153,0.4)] bg-black/80">
            {isVideoDisabled ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 bg-purple-950/80">
                <VideoOff className="w-6 h-6 text-pink-400" />
                <span className="text-[10px] font-mono">Camera Off</span>
              </div>
            ) : (
              <>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  alt="You"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-emerald-400">
                  You ({isFrontCamera ? 'Front' : 'Rear'})
                </div>
              </>
            )}

            <button
              id="flip-camera-pip-btn"
              onClick={handleFlipCamera}
              className="absolute bottom-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:text-cyan-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Video Call Action Controls */}
        <div className="relative z-10 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div className="flex items-center justify-center gap-4">
            {/* Toggle Mic */}
            <button
              id="video-toggle-mic-btn"
              onClick={handleToggleMute}
              className={`p-3.5 rounded-full transition-all ${
                isMuted
                  ? 'bg-rose-500/30 border border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-purple-950/80 border border-purple-600/40 text-white hover:bg-purple-900/80'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Toggle Video */}
            <button
              id="video-toggle-cam-btn"
              onClick={handleToggleVideo}
              className={`p-3.5 rounded-full transition-all ${
                isVideoDisabled
                  ? 'bg-rose-500/30 border border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-purple-950/80 border border-purple-600/40 text-white hover:bg-purple-900/80'
              }`}
            >
              {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Switch to Voice Only */}
            <button
              id="switch-to-voice-btn"
              onClick={() => onSwitchCallType('voice')}
              className="p-3.5 rounded-full bg-purple-950/80 border border-purple-600/40 text-slate-300 hover:text-cyan-400 transition-colors"
              title="Switch to Voice"
            >
              <Phone className="w-5 h-5" />
            </button>

            {/* End Video Call */}
            <button
              id="end-video-call-btn"
              onClick={onEndCall}
              className="p-4 rounded-full bg-rose-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.7)] hover:bg-rose-500 hover:scale-105 active:scale-95 transition-all"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. VOICE CALL DEMO SCREEN
  return (
    <div className="fixed inset-0 z-[80] bg-[#090714] flex flex-col justify-between p-6 max-w-md mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Encrypted Voice Call</span>
        </div>
        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-full">
          HD Audio
        </div>
      </div>

      {/* Center Voice Call Body */}
      <div className="flex flex-col items-center text-center space-y-6 my-auto">
        <div className="relative">
          {/* Animated sound aura */}
          <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 animate-pulse blur-xl" />
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 shadow-[0_0_35px_rgba(168,85,247,0.5)]">
            <UserAvatar
              name={callFriend.name}
              avatar={callFriend.avatar}
              size="xl"
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-wide">
            {callFriend.name}
          </h2>
          <p className="text-xs font-mono text-pink-400 mt-1">{callFriend.handle}</p>
          <div className="mt-3 px-4 py-1.5 rounded-full bg-purple-950/40 border border-purple-800/30 inline-block">
            <span className="font-mono text-lg text-white font-bold tracking-wider">
              {formatDuration(durationSeconds)}
            </span>
          </div>
        </div>

        {/* Live animated audio waveform */}
        <div className="w-full max-w-[240px] px-2 py-3 rounded-2xl bg-purple-950/30 border border-purple-800/30 flex items-center justify-center gap-1.5">
          {[30, 60, 95, 45, 80, 100, 70, 40, 90, 65, 85, 50, 95, 40, 70].map((height, i) => (
            <div
              key={i}
              style={{
                height: isMuted ? '4px' : `${Math.max(8, height * (0.4 + (i % 3) * 0.2))}%`,
                transition: 'height 0.2s ease',
              }}
              className="w-1.5 rounded-full bg-gradient-to-t from-pink-500 via-purple-400 to-cyan-400 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-6 pb-6">
        {onOpenGame && (
          <div className="flex justify-center">
            <button
              id="voice-call-play-game-btn"
              onClick={onOpenGame}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/40 text-pink-300 text-xs font-semibold flex items-center gap-2 hover:border-pink-500 transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)]"
            >
              <Gamepad2 className="w-4 h-4 text-pink-400" />
              <span>Play Arcade Mini-Game with {callFriend.name.split(' ')[0]}</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          {/* Mute Button */}
          <button
            id="voice-mute-btn"
            onClick={handleToggleMute}
            className={`p-4 rounded-full transition-all ${
              isMuted
                ? 'bg-rose-500/30 border border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-purple-950/80 border border-purple-800/50 text-slate-300 hover:text-white'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Speaker Button */}
          <button
            id="voice-speaker-btn"
            onClick={handleToggleSpeaker}
            className={`p-4 rounded-full transition-all ${
              isSpeakerOn
                ? 'bg-purple-950/80 border border-cyan-500/60 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-purple-950/80 border border-purple-800/50 text-slate-400'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          {/* Switch to Video */}
          <button
            id="switch-to-video-btn"
            onClick={() => onSwitchCallType('video')}
            className="p-4 rounded-full bg-purple-950/80 border border-purple-800/50 text-slate-300 hover:text-pink-400 transition-colors"
            title="Switch to Video"
          >
            <Video className="w-6 h-6" />
          </button>

          {/* End Call Button */}
          <button
            id="end-voice-call-btn"
            onClick={onEndCall}
            className="p-4 rounded-full bg-rose-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.7)] hover:bg-rose-500 hover:scale-105 active:scale-95 transition-all"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
