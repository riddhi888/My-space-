import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Camera,
  Check,
  ArrowRight,
  Music,
  Users,
  Gamepad2,
  Radio,
  Image as ImageIcon,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { UserProfile } from '../types';
import { presetAvatars, demoUsers } from '../data/mockData';
import { UserAvatar } from './UserAvatar';

interface AuthViewProps {
  onLoginSuccess: (user: UserProfile, message?: string) => void;
  registeredUsers: UserProfile[];
  onRegisterUser: (newUser: UserProfile) => void;
  initialMode?: 'welcome' | 'login' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  registeredUsers,
  onRegisterUser,
  initialMode = 'welcome',
}) => {
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup'>(initialMode);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sign up form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupBio, setSignupBio] = useState('✨ Navigating the neon cyberspace. Music, art & digital dreams.');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(presetAvatars[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState('');
  const [avatarMode, setAvatarMode] = useState<'preset' | 'upload' | 'initials' | 'custom'>('preset');
  const [signupError, setSignupError] = useState('');
  const avatarFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedAvatarUrl(reader.result as string);
        setAvatarMode('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  // Combine default demo users with dynamically registered users
  const allUsers = [...registeredUsers];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedId = loginIdentifier.trim().toLowerCase();
    const cleanHandle = trimmedId.startsWith('@') ? trimmedId : `@${trimmedId}`;

    if (!trimmedId) {
      setLoginError('Please enter your username or email');
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter your password');
      return;
    }

    // Check user in allUsers or default demo users
    const matchedUser = allUsers.find(
      (u) =>
        u.email?.toLowerCase() === trimmedId ||
        u.handle.toLowerCase() === cleanHandle ||
        u.handle.toLowerCase() === trimmedId
    );

    if (matchedUser) {
      if (matchedUser.password && matchedUser.password !== loginPassword) {
        setLoginError('Incorrect password. For demo users, use: password123');
        return;
      }
      onLoginSuccess(matchedUser, `Welcome back, ${matchedUser.name}!`);
    } else {
      // If not strictly matched, allow demo-style fallback or create a dynamic session user
      // But alert user if they want quick login
      setLoginError('Account not found. Try one of the 1-click demo buttons below or Sign Up!');
    }
  };

  const handleQuickDemoLogin = (user: UserProfile) => {
    onLoginSuccess(user, `Logged in as ${user.name}`);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    const trimmedUsername = signupUsername.trim();
    const trimmedEmail = signupEmail.trim();

    if (!trimmedUsername) {
      setSignupError('Please enter a username');
      return;
    }
    if (!trimmedEmail) {
      setSignupError('Please enter a valid email address');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setSignupError('Password must be at least 4 characters');
      return;
    }

    const cleanHandle = trimmedUsername.startsWith('@')
      ? trimmedUsername
      : `@${trimmedUsername.toLowerCase().replace(/\s+/g, '_')}`;

    // Check if handle already exists
    if (allUsers.some((u) => u.handle.toLowerCase() === cleanHandle.toLowerCase())) {
      setSignupError('This username is already claimed in cyberspace! Choose another.');
      return;
    }

    let finalAvatar = selectedAvatarUrl;
    if (avatarMode === 'upload' && uploadedAvatarUrl) {
      finalAvatar = uploadedAvatarUrl;
    } else if (avatarMode === 'initials') {
      finalAvatar = '';
    } else if (avatarMode === 'custom' && customAvatarUrl.trim()) {
      finalAvatar = customAvatarUrl.trim();
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: signupDisplayName.trim() || trimmedUsername,
      handle: cleanHandle,
      email: trimmedEmail,
      password: signupPassword,
      avatar: finalAvatar,
      coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      bio: signupBio.trim() || '⚡ Cyber voyager on MySpace.',
      profileSong: {
        title: 'Neon Horizon',
        artist: 'Cyberspace Soundworks',
        duration: '3:30',
      },
      stats: {
        friends: 0,
        followers: 0,
        following: 0,
        views: '1',
      },
      badges: ['🌟 Cyber Newcomer', '🚀 Neon Explorer'],
      top8Friends: [],
    };

    onRegisterUser(newUser);
    onLoginSuccess(newUser, `Welcome to MySpace, ${newUser.name}! Profile initialized.`);
  };

  return (
    <div className="min-h-[92vh] w-full flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden bg-[#090714]">
      {/* Background Neon Orbs */}
      <div className="absolute top-10 -left-20 w-72 h-72 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-pink-500/20 blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md mx-auto relative z-10">
        {/* =========================================================================
            SCREEN 1: WELCOME SCREEN
           ========================================================================= */}
        {mode === 'welcome' && (
          <div className="space-y-6 text-center animate-fadeIn">
            {/* Animated Brand Emblem */}
            <div className="flex flex-col items-center">
              <div className="relative p-1 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 shadow-[0_0_40px_rgba(236,72,153,0.45)] group">
                <div className="w-20 h-20 rounded-[22px] bg-[#0c081d] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/15 via-transparent to-cyan-400/15" />
                  <Sparkles className="w-10 h-10 text-pink-400 drop-shadow-[0_0_12px_rgba(244,114,182,0.9)] animate-pulse" />
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="mt-5 space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-pink-500/30 text-pink-300 text-xs font-mono mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  CYBERSPACE SOCIAL SYSTEM
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white">
                  Welcome to{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                    MySpace
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed pt-1">
                  Reinvented for 2026. Customize your profile, stream anthems, duel in the arcade & chat with your Top 8.
                </p>
              </div>
            </div>

            {/* Feature Highlights Bento Ribbon */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 backdrop-blur-md text-left">
              <div className="p-2 rounded-xl bg-purple-900/20 border border-purple-700/20">
                <Music className="w-4 h-4 text-pink-400 mb-1" />
                <p className="text-[11px] font-semibold text-white">Profile Anthems</p>
                <p className="text-[9px] text-slate-400">Song autoplay vibe</p>
              </div>
              <div className="p-2 rounded-xl bg-purple-900/20 border border-purple-700/20">
                <Users className="w-4 h-4 text-cyan-400 mb-1" />
                <p className="text-[11px] font-semibold text-white">Iconic Top 8</p>
                <p className="text-[9px] text-slate-400">Rank closest friends</p>
              </div>
              <div className="p-2 rounded-xl bg-purple-900/20 border border-purple-700/20">
                <Gamepad2 className="w-4 h-4 text-purple-300 mb-1" />
                <p className="text-[11px] font-semibold text-white">Neon Arcade</p>
                <p className="text-[9px] text-slate-400">Realtime mini-games</p>
              </div>
            </div>

            {/* Primary Action Buttons: Sign Up & Login */}
            <div className="space-y-3 pt-2">
              <button
                id="welcome-signup-btn"
                onClick={() => setMode('signup')}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:shadow-[0_0_35px_rgba(236,72,153,0.8)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Create New Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="welcome-login-btn"
                onClick={() => setMode('login')}
                className="w-full py-3 px-4 rounded-2xl bg-[#120c29] border border-purple-700/50 hover:border-pink-500/60 text-slate-200 hover:text-white font-semibold text-sm transition-all hover:bg-purple-950/40 flex items-center justify-center gap-2"
              >
                <span>Log In to Existing Account</span>
              </button>
            </div>

            {/* Fast Demo Logins for Instant Testing */}
            <div className="pt-2 border-t border-purple-900/40">
              <p className="text-[11px] text-slate-400 font-mono mb-2 flex items-center justify-center gap-1.5">
                <Radio className="w-3 h-3 text-pink-400 animate-pulse" />
                <span>Instant Demo Access (1-Tap Test)</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {demoUsers.map((user) => (
                  <button
                    key={user.id}
                    id={`demo-login-${user.id}`}
                    onClick={() => handleQuickDemoLogin(user)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-pink-500/20 border border-purple-800/50 hover:border-pink-500/40 text-xs text-slate-300 hover:text-white transition-all"
                  >
                    <UserAvatar
                      name={user.name}
                      avatar={user.avatar}
                      size="xs"
                    />
                    <span className="font-medium">{user.name}</span>
                    <span className="text-[10px] text-pink-400 font-mono">{user.handle}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 2: LOGIN SCREEN
           ========================================================================= */}
        {mode === 'login' && (
          <div className="p-6 rounded-3xl bg-[#0f0b24]/90 border border-purple-800/50 backdrop-blur-xl shadow-[0_0_35px_rgba(147,51,234,0.25)] space-y-5 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                id="login-back-btn"
                onClick={() => {
                  setMode('welcome');
                  setLoginError('');
                }}
                className="p-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <span className="text-[11px] font-mono text-pink-400 px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20">
                TERMINAL LOGIN
              </span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-display font-bold text-white">
                Log In to <span className="text-pink-400">MySpace</span>
              </h2>
              <p className="text-xs text-slate-300">
                Enter your credentials to access your profile & messages
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                <span className="text-rose-400 font-bold">!</span>
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Username or Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Username or Email</span>
                  <span className="text-[10px] text-pink-400 font-mono">e.g. @puchu</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    id="login-username-input"
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter @username or email"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#090714] border border-purple-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-slate-400 font-mono">Demo: password123</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    id="login-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#090714] border border-purple-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-xs shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.7)] transition-all flex items-center justify-center gap-2"
              >
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Pre-fill */}
            <div className="pt-2 border-t border-purple-900/40 space-y-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block text-center">
                Demo Account Access:
              </span>
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier(demoUsers[0].email || demoUsers[0].handle);
                  setLoginPassword('password123');
                  setLoginError('');
                }}
                className="w-full p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 text-xs text-slate-300 hover:text-white font-mono flex items-center justify-center gap-2 transition-colors"
                title={`Fill ${demoUsers[0].name}`}
              >
                <UserAvatar name={demoUsers[0].name} avatar={demoUsers[0].avatar} size="xs" />
                <span>Fill Credentials ({demoUsers[0].name})</span>
              </button>
            </div>

            {/* Switch to Sign Up */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  id="switch-to-signup-btn"
                  onClick={() => {
                    setMode('signup');
                    setLoginError('');
                  }}
                  className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-2 ml-1"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 3: CREATE ACCOUNT / SIGN UP SCREEN
           ========================================================================= */}
        {mode === 'signup' && (
          <div className="p-6 rounded-3xl bg-[#0f0b24]/95 border border-purple-800/50 backdrop-blur-xl shadow-[0_0_35px_rgba(236,72,153,0.25)] space-y-5 animate-fadeIn max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                id="signup-back-btn"
                onClick={() => {
                  setMode('welcome');
                  setSignupError('');
                }}
                className="p-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <span className="text-[11px] font-mono text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                CREATE IDENTITY
              </span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-display font-bold text-white">
                Create Your <span className="text-pink-400">MySpace</span>
              </h2>
              <p className="text-xs text-slate-300">
                Build your cyber persona, choose your avatar & join the matrix
              </p>
            </div>

            {/* Error Message */}
            {signupError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                <span className="text-rose-400 font-bold">!</span>
                <span>{signupError}</span>
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Profile Photo Option (Live Preview + Presets or Custom URL) */}
              <div className="p-3.5 rounded-2xl bg-[#090714] border border-purple-800/60 space-y-3">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-pink-400" />
                    <span>Profile Photo Option</span>
                  </span>
                  <span className="text-[10px] text-pink-400 font-mono">Live Preview</span>
                </label>

                {/* Hidden File Input for Avatar Upload */}
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  onChange={handleAvatarFile}
                  accept="image/*"
                  className="hidden"
                />

                {/* Avatar Preview Ring */}
                <div className="flex items-center gap-3">
                  <div className="relative p-1 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(236,72,153,0.5)] shrink-0">
                    <UserAvatar
                      name={signupDisplayName || signupUsername || 'User'}
                      avatar={
                        avatarMode === 'upload'
                          ? uploadedAvatarUrl
                          : avatarMode === 'initials'
                          ? ''
                          : avatarMode === 'custom' && customAvatarUrl.trim()
                          ? customAvatarUrl
                          : selectedAvatarUrl
                      }
                      size="lg"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#090714] rounded-full" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-semibold text-white">
                      {signupDisplayName || signupUsername || 'Your Cyber Alias'}
                    </p>
                    <p className="text-[11px] text-cyan-400 font-mono">
                      {signupUsername
                        ? signupUsername.startsWith('@')
                          ? signupUsername
                          : `@${signupUsername.toLowerCase().replace(/\s+/g, '_')}`
                        : '@username'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 ${
                          avatarMode === 'upload'
                            ? 'bg-pink-500 text-white shadow-sm'
                            : 'bg-purple-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-2.5 h-2.5" />
                        <span>Upload Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarMode('initials')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                          avatarMode === 'initials'
                            ? 'bg-pink-500 text-white shadow-sm'
                            : 'bg-purple-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        Initials Avatar
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarMode('preset')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                          avatarMode === 'preset'
                            ? 'bg-pink-500 text-white shadow-sm'
                            : 'bg-purple-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        Presets
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarMode('custom')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                          avatarMode === 'custom'
                            ? 'bg-pink-500 text-white shadow-sm'
                            : 'bg-purple-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Avatar Selection Sections */}
                {avatarMode === 'upload' && (
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-center">
                    <p className="text-slate-300 font-medium">Photo uploaded successfully!</p>
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="mt-1 text-pink-400 hover:text-pink-300 underline text-[11px]"
                    >
                      Choose a different photo
                    </button>
                  </div>
                )}

                {avatarMode === 'initials' && (
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-center text-slate-300">
                    Your clean initials avatar will automatically generate from your name!
                  </div>
                )}

                {avatarMode === 'preset' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 block">Select a neon avatar:</span>
                    <div className="grid grid-cols-6 gap-2">
                      {presetAvatars.map((preset) => {
                        const isSelected = selectedAvatarUrl === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSelectedAvatarUrl(preset.url)}
                            className={`relative p-0.5 rounded-full transition-all group ${
                              isSelected
                                ? 'ring-2 ring-pink-400 scale-105 shadow-[0_0_10px_rgba(236,72,153,0.8)]'
                                : 'opacity-70 hover:opacity-100 hover:scale-105'
                            }`}
                            title={preset.name}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 rounded-full bg-pink-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white drop-shadow" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {avatarMode === 'custom' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 block">Enter Custom Photo URL:</span>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400" />
                      <input
                        id="custom-avatar-url-input"
                        type="url"
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full pl-9 pr-3 py-2 bg-[#120c29] border border-purple-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Username</span>
                  <span className="text-[10px] text-pink-400 font-mono">Unique @handle</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    id="signup-username-input"
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="neo_rider"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-[#090714] border border-purple-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  />
                </div>
              </div>

              {/* Display Name (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Display Name</span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </label>
                <input
                  id="signup-displayname-input"
                  type="text"
                  value={signupDisplayName}
                  onChange={(e) => setSignupDisplayName(e.target.value)}
                  placeholder="e.g. Neo Rider"
                  className="w-full px-3 py-2.5 bg-[#090714] border border-purple-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-all"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Secure contact</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    id="signup-email-input"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@myspace.neon"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-[#090714] border border-purple-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-slate-400">Min 4 chars</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    id="signup-password-input"
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#090714] border border-purple-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>MySpace Bio</span>
                  <span className="text-[10px] text-pink-400 font-mono">Your profile story</span>
                </label>
                <textarea
                  id="signup-bio-input"
                  value={signupBio}
                  onChange={(e) => setSignupBio(e.target.value)}
                  rows={2}
                  placeholder="Share your music taste, hobbies, and digital vibe..."
                  className="w-full p-2.5 bg-[#090714] border border-purple-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              {/* Initial Stats Preview (Followers, Following, Friends) */}
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/30 flex items-center justify-around text-center">
                <div>
                  <span className="text-xs font-bold text-pink-400">0</span>
                  <p className="text-[10px] text-slate-400">Followers</p>
                </div>
                <div className="w-px h-5 bg-purple-800/40" />
                <div>
                  <span className="text-xs font-bold text-cyan-400">1</span>
                  <p className="text-[10px] text-slate-400">Following</p>
                </div>
                <div className="w-px h-5 bg-purple-800/40" />
                <div>
                  <span className="text-xs font-bold text-white">1</span>
                  <p className="text-[10px] text-slate-400">Friends</p>
                </div>
              </div>

              {/* Submit Create Account Button */}
              <button
                id="signup-submit-btn"
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-semibold text-xs shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)] transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Create Account & Enter MySpace</span>
              </button>
            </form>

            {/* Switch to Login */}
            <div className="text-center pt-1">
              <p className="text-xs text-slate-400">
                Already have a profile?{' '}
                <button
                  id="switch-to-login-btn"
                  onClick={() => {
                    setMode('login');
                    setSignupError('');
                  }}
                  className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-2 ml-1"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
