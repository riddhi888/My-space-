import React, { useState } from 'react';
import {
  Instagram,
  Facebook,
  Youtube,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LogOut,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ConnectedPlatform, ConnectedAppAccount, UserProfile } from '../types';
import { ConnectedAppsService, PlatformConfig } from '../services/connectedAppsService';

interface ConnectedAppsViewProps {
  user: UserProfile;
  connectedApps: Record<ConnectedPlatform, ConnectedAppAccount>;
  onUpdateConnectedApp: (platform: ConnectedPlatform, account: ConnectedAppAccount) => void;
  onBackToHome?: () => void;
  onBack?: () => void;
}

export const ConnectedAppsView: React.FC<ConnectedAppsViewProps> = ({
  user,
  connectedApps,
  onUpdateConnectedApp,
  onBackToHome,
  onBack,
}) => {
  const handleBack = onBack || onBackToHome;
  const configs = ConnectedAppsService.getPlatformConfigs();
  const [expandedPlatform, setExpandedPlatform] = useState<ConnectedPlatform | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    platform: ConnectedPlatform;
    type: 'info' | 'error' | 'success';
    text: string;
  } | null>(null);

  const toggleExpand = (platform: ConnectedPlatform) => {
    setExpandedPlatform((prev) => (prev === platform ? null : platform));
  };

  const handleOpenPlatform = (platform: ConnectedPlatform) => {
    ConnectedAppsService.openOfficialPlatform(platform);
  };

  const handleConnect = (platform: ConnectedPlatform) => {
    const config = configs[platform];

    ConnectedAppsService.initiateConnect(
      platform,
      connectedApps[platform],
      user.handle,
      (updatedAccount) => {
        onUpdateConnectedApp(platform, updatedAccount);
        setActionMessage({
          platform,
          type: 'success',
          text: `Connected to ${config.name} (100% Demo Mode — no credentials needed)!`,
        });
      }
    );
  };

  const handleDisconnect = (platform: ConnectedPlatform) => {
    onUpdateConnectedApp(platform, {
      platform,
      isConnected: false,
    });
    setActionMessage({
      platform,
      type: 'info',
      text: `Disconnected ${configs[platform].name} account from MySpace.`,
    });
  };

  const handleSimulateToggleForTesting = (platform: ConnectedPlatform) => {
    const current = connectedApps[platform];
    const isNowConnected = !current?.isConnected;
    const config = configs[platform];

    onUpdateConnectedApp(platform, {
      platform,
      isConnected: isNowConnected,
      username: isNowConnected ? `${user.handle.replace('@', '')}_${platform}` : undefined,
      connectedAt: isNowConnected ? 'Just now (Sandbox Simulation)' : undefined,
      profileUrl: isNowConnected ? `${config.officialUrl}` : undefined,
      grantedScopes: isNowConnected ? config.requiredScopes : [],
    });

    setActionMessage({
      platform,
      type: isNowConnected ? 'success' : 'info',
      text: isNowConnected
        ? `[Sandbox Simulation] Connected ${config.name}. (Notice: This is for UI preview only. Production requires official Meta/Google OAuth approval).`
        : `Disconnected ${config.name} in Sandbox.`,
    });
  };

  const platforms: ConnectedPlatform[] = ['instagram', 'facebook', 'youtube'];

  return (
    <div className="space-y-5 pb-24 animate-in fade-in">
      {/* Top Header Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-b from-[#180f33] via-[#100a26] to-[#0b0818] border border-purple-800/40 shadow-[0_0_30px_rgba(168,85,247,0.15)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-0.5 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              <div className="w-full h-full bg-[#0b0818] rounded-[14px] flex items-center justify-center text-pink-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="font-display font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                Connected Apps
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-300">
                  OFFICIAL HUBS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Access external platforms safely via supported official integrations
              </p>
            </div>
          </div>
        </div>

        {/* Security & Architecture Transparency Banner */}
        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/50 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-pink-300 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Zero-Credential Security Architecture</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            MySpace strictly implements official OAuth 2.0. We <strong>never collect, store, or solicit</strong> your external passwords for Instagram, Facebook, or Google. External actions are handled via official website link-outs or verified platform APIs.
          </p>
        </div>

        {/* Action message banner */}
        {actionMessage && (
          <div
            className={`p-3 rounded-2xl border text-xs flex items-start gap-2 animate-in fade-in ${
              actionMessage.type === 'error'
                ? 'bg-rose-950/60 border-rose-800/70 text-rose-200'
                : actionMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800/70 text-emerald-200'
                : 'bg-cyan-950/60 border-cyan-800/70 text-cyan-200'
            }`}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold block mb-0.5">
                {actionMessage.type === 'error' ? 'Configuration Notice' : 'System Update'}
              </span>
              <p className="text-[11px] leading-relaxed">{actionMessage.text}</p>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Platform Integration Cards */}
      <div className="space-y-4">
        {platforms.map((platformId) => {
          const config = configs[platformId];
          const account = connectedApps[platformId] || { platform: platformId, isConnected: false };
          const isConnected = account.isConnected;
          const isExpanded = expandedPlatform === platformId;

          // Theme styling per platform
          const platformStyles = {
            instagram: {
              gradient: 'from-pink-500 via-purple-600 to-amber-500',
              badgeBg: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/40',
              icon: Instagram,
              glow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]',
            },
            facebook: {
              gradient: 'from-blue-600 to-cyan-500',
              badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
              icon: Facebook,
              glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
            },
            youtube: {
              gradient: 'from-red-600 to-rose-500',
              badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
              icon: Youtube,
              glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]',
            },
          }[platformId];

          const IconComponent = platformStyles.icon;

          return (
            <div
              key={platformId}
              id={`connected-app-card-${platformId}`}
              className={`p-4 rounded-3xl bg-[#0f0b21] border transition-all duration-300 ${
                isConnected
                  ? 'border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                  : 'border-purple-800/40 hover:border-purple-700/60'
              }`}
            >
              {/* Main Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Platform Icon with gradient */}
                  <div
                    className={`w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr ${platformStyles.gradient} shadow-lg`}
                  >
                    <div className="w-full h-full bg-[#0b0818] rounded-[14px] flex items-center justify-center text-white">
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-white text-base">{config.name}</h3>
                      {isConnected ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700/60 text-slate-400">
                          <XCircle className="w-3 h-3 text-slate-500" />
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isConnected && account.username
                        ? `Linked: @${account.username}`
                        : config.authMethod}
                    </p>
                  </div>
                </div>

                {/* Open Official Website Link */}
                <button
                  id={`open-official-${platformId}-btn`}
                  onClick={() => handleOpenPlatform(platformId)}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/50 hover:border-pink-500/50 text-slate-300 hover:text-pink-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title={`Open official ${config.name} website`}
                >
                  <span className="text-[11px] font-medium hidden sm:inline">Open {config.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-4 pt-3 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!isConnected ? (
                    <button
                      id={`connect-btn-${platformId}`}
                      onClick={() => handleConnect(platformId)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-pink-300" />
                      Connect {config.name}
                    </button>
                  ) : (
                    <button
                      id={`disconnect-btn-${platformId}`}
                      onClick={() => handleDisconnect(platformId)}
                      className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/50 text-rose-300 text-xs font-semibold hover:border-rose-600 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Disconnect Account
                    </button>
                  )}

                  {/* Sandbox Preview Toggle */}
                  <button
                    id={`test-toggle-${platformId}`}
                    onClick={() => handleSimulateToggleForTesting(platformId)}
                    className="px-2.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 text-[10px] text-slate-400 hover:text-pink-300 font-mono transition-all cursor-pointer"
                    title="Toggle connection in sandbox state"
                  >
                    Sandbox Toggle
                  </button>
                </div>

                {/* Expand / Details Toggle */}
                <button
                  onClick={() => toggleExpand(platformId)}
                  className="text-xs text-pink-400 hover:text-pink-300 font-medium flex items-center gap-1 transition-colors cursor-pointer py-1"
                >
                  <span>{isExpanded ? 'Hide Details' : 'Permissions & Guide'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Collapsible Details & Setup Guide */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-purple-900/40 space-y-3.5 animate-in fade-in">
                  {/* Important Platform Policy Notice */}
                  <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/50 text-[11px] text-amber-200/90 leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Official Platform Policy</span>
                    </div>
                    <p>{config.importantNotice}</p>
                  </div>

                  {/* Required Scopes & Explanations */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      Required Official Permissions & Scopes:
                    </h4>
                    <div className="space-y-1.5">
                      {config.scopeDescriptions.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-black/40 border border-purple-900/40 text-[11px] flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2"
                        >
                          <code className="text-cyan-300 font-mono font-bold shrink-0">
                            {item.scope}
                          </code>
                          <span className="text-slate-300">{item.purpose}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Integration Configuration Status */}
                  <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        Demo Mode Status:
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50">
                        100% DEMO READY
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Instant client-side integration active. No environment variables, API keys, or developer console credentials required.
                    </p>

                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 pl-1">
                      {config.configurationGuide.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>

                    <div className="pt-1">
                      <a
                        href={config.developerDashboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-pink-400 hover:text-pink-300 underline flex items-center gap-1 font-medium inline-block"
                      >
                        Official {config.name} Documentation →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Backend & Architecture Readiness Accordion */}
      <div className="p-4 rounded-3xl bg-[#0e0a1f] border border-purple-800/40 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-bold text-white text-sm">
            Backend Readiness & Architecture Specifications
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          MySpace separates local client-side state from server-side requirements. Local browser storage provides per-user state isolation in this demo. Real online interactions (cross-device messaging, live video calling, multi-user gaming, and official OAuth tokens) require dedicated backend microservices.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/30">
            <span className="font-bold text-pink-300 block mb-0.5">Active Client Features:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li>Independent user accounts & profiles</li>
              <li>Camera capture & photo post creation</li>
              <li>Vertical Reels video player & creation</li>
              <li>Local mini-games & high scores</li>
              <li>Cyber beats music player & playlist</li>
            </ul>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/30">
            <span className="font-bold text-cyan-300 block mb-0.5">Production Server Needs:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li>PostgreSQL/Firestore database & auth</li>
              <li>WebRTC Signaling & STUN/TURN servers</li>
              <li>Meta Graph API & Google OAuth backend</li>
              <li>Multiplayer WebSocket room service</li>
              <li>Cloud media storage (S3/GCS bucket)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
