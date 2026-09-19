import React, { useState } from 'react';
import { UserAccount } from '../types';
import { AccountService } from '../services/accountService';
import {
  Sparkles,
  ShieldCheck,
  User,
  Users,
  ArrowRight,
  UserPlus,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (account: UserAccount) => void;
  allAccounts: UserAccount[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  allAccounts,
}) => {
  const [activeTab, setActiveTab] = useState<'guest' | 'create'>('guest');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    return allAccounts[0]?.id || 'user_alex';
  });

  // Create Guest Profile State (NO passwords or secrets!)
  const [guestName, setGuestName] = useState('');
  const [guestHandle, setGuestHandle] = useState('');
  const [guestBio, setGuestBio] = useState('');
  const [guestAvatar, setGuestAvatar] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
  ];

  const currentSelectedAccount =
    allAccounts.find((a) => a.id === selectedAccountId) || allAccounts[0];

  const handleInstantGuestLogin = (accountToUse?: UserAccount) => {
    setIsLoading(true);
    const targetAccount = accountToUse || currentSelectedAccount || allAccounts[0];
    setTimeout(() => {
      setIsLoading(false);
      AccountService.setActiveUserId(targetAccount.id);
      onLoginSuccess(targetAccount);
    }, 250);
  };

  const handleCreateGuestProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!guestName.trim()) {
      setCreateError('Please enter a display name.');
      return;
    }

    if (!guestHandle.trim()) {
      setCreateError('Please enter a handle/username.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = AccountService.registerAccount({
        name: guestName.trim(),
        handle: guestHandle.trim(),
        bio: guestBio.trim(),
        avatar: guestAvatar,
      });

      if (!res.success || !res.account) {
        setCreateError(res.error || 'Failed to initialize guest profile.');
        return;
      }

      AccountService.setActiveUserId(res.account.id);
      onLoginSuccess(res.account);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#090714] text-slate-100 flex items-center justify-center p-4 py-8">
      {/* Background neon ambient blur */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-96 h-96 rounded-full bg-pink-600/10 blur-[130px] -translate-x-24 -translate-y-20" />
        <div className="w-96 h-96 rounded-full bg-purple-600/15 blur-[130px] translate-x-24 translate-y-20" />
        <div className="w-96 h-96 rounded-full bg-cyan-600/10 blur-[130px]" />
      </div>

      <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#130b28] via-[#0e0720] to-[#090516] border border-purple-800/50 shadow-[0_0_60px_rgba(168,85,247,0.25)] space-y-5">
        {/* Neon Logo & Header */}
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 shadow-[0_0_30px_rgba(236,72,153,0.5)]">
              <div className="w-full h-full bg-[#0b0818] rounded-[14px] flex items-center justify-center font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                M
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-cyan-300 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div>
            <h1 className="font-display font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 tracking-tight">
              MySpace Cyber
            </h1>
            <p className="text-xs text-slate-400">
              100% Demo Mode • Guest Access Only
            </p>
          </div>

          {/* Guest Mode Indicator Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Guest Login • No Passwords or Secrets</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-2xl bg-black/50 p-1 border border-purple-900/50">
          <button
            type="button"
            id="tab-guest-login-btn"
            onClick={() => setActiveTab('guest')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'guest'
                ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/30 border border-pink-500/50 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Guest Access
          </button>
          <button
            type="button"
            id="tab-create-guest-btn"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/30 border border-pink-500/50 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Guest Profile
          </button>
        </div>

        {/* GUEST ACCESS VIEW */}
        {activeTab === 'guest' ? (
          <div className="space-y-4">
            {/* Primary One-Click Action */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-pink-950/20 to-black/60 border border-purple-800/60 text-center space-y-3 shadow-inner">
              <div className="flex items-center justify-center gap-3">
                <img
                  src={currentSelectedAccount?.profile.avatar}
                  alt={currentSelectedAccount?.profile.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                />
                <div className="text-left">
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {currentSelectedAccount?.profile.name}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/30 text-pink-300 font-mono">
                      Selected
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {currentSelectedAccount?.profile.handle}
                  </div>
                </div>
              </div>

              <button
                id="guest-login-hero-btn"
                type="button"
                disabled={isLoading}
                onClick={() => handleInstantGuestLogin()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_0_25px_rgba(236,72,153,0.5)] flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entering MySpace...
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>Continue as Guest (Instant Enter)</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Guest Profile Selector */}
            <div className="pt-2 border-t border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  Or Select a Demo Guest Profile:
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {allAccounts.length} Available
                </span>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {allAccounts.map((acc) => {
                  const isSelected = acc.id === selectedAccountId;
                  return (
                    <button
                      key={acc.id}
                      id={`guest-select-${acc.id}`}
                      type="button"
                      onClick={() => {
                        setSelectedAccountId(acc.id);
                        handleInstantGuestLogin(acc);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all group text-left cursor-pointer ${
                        isSelected
                          ? 'bg-purple-900/60 border-pink-500/70 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                          : 'bg-purple-950/40 hover:bg-purple-900/40 border-purple-800/40 hover:border-pink-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={acc.profile.avatar}
                          alt={acc.profile.name}
                          referrerPolicy="no-referrer"
                          className={`w-9 h-9 rounded-full object-cover border shrink-0 ${
                            isSelected ? 'border-pink-400' : 'border-purple-700/50'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-pink-300 truncate flex items-center gap-1.5">
                            {acc.profile.name}
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {acc.profile.handle} • {acc.profile.stats.followers} followers
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-pink-400 opacity-80 group-hover:opacity-100 shrink-0">
                        <span>Enter</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* CREATE CUSTOM GUEST PROFILE (NO SECRETS / PASSWORDS) */
          <div className="space-y-4">
            {createError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-200 text-xs animate-in fade-in">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateGuestProfile} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Display Name
                </label>
                <input
                  id="guest-name-input"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Jordan Vane"
                  className="w-full px-3 py-2 bg-black/50 border border-purple-800/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Username / Handle
                </label>
                <input
                  id="guest-handle-input"
                  type="text"
                  value={guestHandle}
                  onChange={(e) => setGuestHandle(e.target.value)}
                  placeholder="@jordan_v"
                  className="w-full px-3 py-2 bg-black/50 border border-purple-800/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Short Bio (Optional)
                </label>
                <input
                  id="guest-bio-input"
                  type="text"
                  value={guestBio}
                  onChange={(e) => setGuestBio(e.target.value)}
                  placeholder="Music producer, cyberpunk nomad, tech voyager"
                  className="w-full px-3 py-2 bg-black/50 border border-purple-800/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Avatar Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Choose Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {presetAvatars.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGuestAvatar(url)}
                      className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 border transition-all ${
                        guestAvatar === url
                          ? 'border-pink-400 scale-110 shadow-[0_0_10px_#ec4899]'
                          : 'border-purple-800/60 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Preset ${i}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="create-guest-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Initializing Guest Profile...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Enter MySpace as New Guest</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Demo Mode Notice Banner */}
        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-pink-300 font-semibold flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
              100% Guest Demo Mode
            </span>
            <span className="text-[9px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
              NO SECRETS REQUIRED
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Authentication operates via instant Guest login. No passwords, client secrets, or external API keys are collected or required.
          </p>
        </div>
      </div>
    </div>
  );
};
