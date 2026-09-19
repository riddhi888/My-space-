import React, { useState } from 'react';
import { Sparkles, Lock, User, Eye, EyeOff, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  user: UserProfile;
  onLogin: () => void;
  currentDemoPassword?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  user,
  onLogin,
  currentDemoPassword = 'CyberNeon2026!',
}) => {
  const [handle, setHandle] = useState(user.handle);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!handle.trim()) {
      setError('Please enter your handle or username');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    // Simulate authentication verification against demo password
    setTimeout(() => {
      setIsLoading(false);
      // Allow demo password or any non-empty password in demo mode, but warn if mismatch
      if (password !== currentDemoPassword && password !== 'CyberNeon2026!') {
        // If they changed it or want exact match
        const savedPw = localStorage.getItem('myspace_demo_password_v1');
        if (savedPw && password !== savedPw) {
          setError(`Incorrect password. Demo password is: ${savedPw}`);
          return;
        } else if (!savedPw && password !== 'CyberNeon2026!') {
          setError('Incorrect password. Demo password is: CyberNeon2026!');
          return;
        }
      }

      onLogin();
    }, 450);
  };

  const handleQuickDemoLogin = () => {
    const savedPw = localStorage.getItem('myspace_demo_password_v1') || currentDemoPassword;
    setPassword(savedPw);
    setHandle(user.handle);
    setTimeout(() => {
      onLogin();
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#090714] text-slate-100 flex items-center justify-center p-4">
      {/* Background glow ambiance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-96 h-96 rounded-full bg-pink-600/10 blur-[120px] -translate-x-20 -translate-y-20" />
        <div className="w-96 h-96 rounded-full bg-purple-600/15 blur-[120px] translate-x-20 translate-y-20" />
        <div className="w-96 h-96 rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#120a26] via-[#0e0720] to-[#090516] border border-purple-800/50 shadow-[0_0_50px_rgba(168,85,247,0.25)] space-y-6">
        {/* Neon Logo & Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 shadow-[0_0_30px_rgba(236,72,153,0.5)]">
              <div className="w-full h-full bg-[#0b0818] rounded-[14px] flex items-center justify-center font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                M
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 border-2 border-[#090714]" />
            </span>
          </div>

          <div>
            <h1 className="font-display font-black text-2xl text-white tracking-wide">
              MY<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">SPACE</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center gap-1.5 font-mono">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>Cyberpunk Social Network</span>
            </p>
          </div>
        </div>

        {/* Demo Notification Box */}
        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-pink-300 font-semibold flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
              Local Demo Authentication
            </span>
            <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
              SANDBOX
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Default Demo Password: <code className="text-cyan-300 font-mono bg-black/40 px-1 py-0.5 rounded text-[10px]">CyberNeon2026!</code>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs animate-in fade-in">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Handle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Username / Handle</label>
            <div className="relative">
              <User className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
              <input
                id="login-handle-input"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@username"
                className="w-full pl-9 pr-3 py-2.5 bg-black/50 border border-purple-800/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">Password</label>
              <button
                type="button"
                onClick={() => {
                  const savedPw = localStorage.getItem('myspace_demo_password_v1') || currentDemoPassword;
                  setPassword(savedPw);
                }}
                className="text-[10px] text-pink-400 hover:text-pink-300 underline"
              >
                Auto-fill demo password
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-black/50 border border-purple-800/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
              <button
                type="button"
                id="login-toggle-show-pw"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to MySpace</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo One-Click Sign In */}
        <div className="pt-2 border-t border-purple-900/30 text-center space-y-3">
          <p className="text-[11px] text-slate-400">Quick prototype testing:</p>
          <button
            id="quick-demo-login-btn"
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 border border-purple-700/40 hover:border-pink-500/60 text-pink-300 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            <span>Continue as <strong>{user.name}</strong></span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
