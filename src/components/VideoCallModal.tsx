import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, RefreshCw, Sparkles, ShieldCheck, Camera, Info } from 'lucide-react';
import { SocialUser, UserProfile } from '../types';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SocialUser | null;
  currentUser?: UserProfile;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUser,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isVideoActive, setIsVideoActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [cyberFilter, setCyberFilter] = useState<'neon' | 'cyber' | 'synth'>('neon');
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [showWebRtcNotice, setShowWebRtcNotice] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen || !user) {
      setCallDuration(0);
      setCallStatus('connecting');
      setIsVideoActive(true);
      setIsMuted(false);
      setUseRealCamera(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
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

  // Handle live webcam toggle
  const toggleRealCamera = async () => {
    if (useRealCamera) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      setUseRealCamera(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play();
          }
          setUseRealCamera(true);
        }
      } catch (e) {
        console.warn('Could not acquire real camera stream:', e);
      }
    }
  };

  if (!isOpen || !user) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-md h-[90vh] max-h-[700px] bg-[#090714] border border-pink-500/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(236,72,153,0.35)] flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
        {/* Call Header */}
        <div className="bg-gradient-to-b from-[#090714] via-[#090714]/80 to-transparent p-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-pink-300 uppercase">
              WebRTC Video Hub
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Info toggle for WebRTC architecture note */}
            <button
              onClick={() => setShowWebRtcNotice(!showWebRtcNotice)}
              className="px-2 py-1 rounded-lg bg-purple-900/60 border border-purple-700/50 text-[10px] text-cyan-300 font-mono flex items-center gap-1 hover:bg-purple-800/60 transition-colors cursor-pointer"
              title="View Signaling Architecture Details"
            >
              <Info className="w-3 h-3" />
              <span>WebRTC Info</span>
            </button>

            {/* Filter Switcher */}
            <button
              onClick={() =>
                setCyberFilter((prev) =>
                  prev === 'neon' ? 'cyber' : prev === 'cyber' ? 'synth' : 'neon'
                )
              }
              className="p-1.5 rounded-xl bg-purple-950/60 border border-purple-700/50 text-xs text-pink-300 hover:text-white transition-colors cursor-pointer"
              title="Switch Cyber Lens"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WebRTC Architecture Notice Banner */}
        {showWebRtcNotice && (
          <div className="mx-4 mb-2 p-2.5 rounded-2xl bg-purple-950/90 border border-cyan-500/40 text-[11px] text-cyan-200 font-sans z-30 shadow-lg space-y-1">
            <p className="font-bold flex items-center gap-1 text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5" /> WebRTC Signaling Architecture
            </p>
            <p className="text-[10px] leading-relaxed text-slate-300">
              MySpace provides peer-to-peer call interfaces. For real-time production calling between separate devices, integrate a WebRTC signaling service (via WebSocket/STUN/TURN) to exchange SDP offers/answers and ICE candidates.
            </p>
          </div>
        )}

        {/* Main Stage View (Remote User Simulation + Status) */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          {/* Neon backdrop ambiance */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090714] via-transparent to-transparent z-10" />

          {/* Call Status Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/30 text-xs font-mono">
              {callStatus === 'connecting' && (
                <>
                  <RefreshCw className="w-3 h-3 text-pink-400 animate-spin" />
                  <span className="text-pink-300">Connecting link...</span>
                </>
              )}
              {callStatus === 'connected' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-bold">{formatTime(callDuration)}</span>
                </>
              )}
              {callStatus === 'ended' && (
                <span className="text-rose-400">Call Terminated</span>
              )}
            </div>
          </div>

          {/* Remote Video / Avatar Content */}
          <div className="relative flex flex-col items-center justify-center space-y-4 z-10">
            {/* Animated Cyber Ring Avatar */}
            <div className="relative">
              <div
                className="absolute -inset-6 rounded-full border border-pink-500/30 animate-spin"
                style={{ animationDuration: '10s' }}
              />
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
                <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-600/40 text-[10px] text-pink-300 font-mono">
                  {user.statusText}
                </span>
              </div>
            </div>
          </div>

          {/* Picture-in-Picture Local Camera Preview */}
          <div className="absolute bottom-6 right-4 w-28 h-38 rounded-2xl overflow-hidden border-2 border-pink-500/60 shadow-[0_0_25px_rgba(236,72,153,0.4)] bg-[#120c29] z-20 group">
            {isVideoActive ? (
              <div className="relative w-full h-full bg-purple-950">
                {useRealCamera ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                ) : (
                  <img
                    src={
                      currentUser?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={currentUser?.name || 'You'}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover ${
                      cyberFilter === 'neon'
                        ? 'contrast-125 hue-rotate-15'
                        : cyberFilter === 'synth'
                        ? 'contrast-110 saturate-150'
                        : 'brightness-110'
                    }`}
                  />
                )}
                <button
                  onClick={toggleRealCamera}
                  className="absolute top-1.5 left-1.5 text-[9px] font-mono font-bold bg-black/70 hover:bg-pink-600 px-1.5 py-0.5 rounded text-pink-300 hover:text-white transition-colors flex items-center gap-0.5 cursor-pointer"
                  title="Toggle real camera feed"
                >
                  <Camera className="w-2.5 h-2.5" />
                  {useRealCamera ? 'CAM ON' : 'YOU'}
                </button>
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
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
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
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-purple-950/60 border-purple-700/50 text-white hover:bg-purple-900'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-cyan-300" />}
          </button>

          {/* End Call Button */}
          <button
            id="video-call-hangup-btn"
            onClick={handleEndCall}
            className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="End Video Link"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
