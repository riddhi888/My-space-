import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  Upload,
  Trash2,
  Camera,
  Image as ImageIcon,
  Sparkles,
  User,
  AtSign,
  FileText,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { UserProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updatedData: {
    name: string;
    handle: string;
    bio: string;
    avatar: string;
    coverImage: string;
  }) => void;
}

// Curated avatar presets with cyberpunk & neon vibes
const AVATAR_PRESETS = [
  {
    name: 'Cyberpunk Rebel',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Neon Shinjuku',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Synthwave Glitch',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Retro Arcade',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Violet Hologram',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Digital Nomad',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
];

// Curated cover presets
const COVER_PRESETS = [
  {
    name: 'Neo Shinjuku Skyline',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Purple Highway at Night',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Retro Synthwave Grid',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Underground Cyber Club',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Neon Matrix Lasers',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Retro Gaming Rig',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  },
];

// Default fallback avatar and cover when removed
const DEFAULT_FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
const DEFAULT_FALLBACK_COVER = '';

const BIO_SUGGESTIONS = [
  '⚡ Neon nomad & synthesizer addict.',
  '🌌 Creating the next wave of cyberspace.',
  '🕹️ Arcade champion & retro gaming purist.',
  '🎧 Living for 80s tape warmth and analog synths.',
  '✨ Connecting worlds on the new MySpace.',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle.startsWith('@') ? user.handle : `@${user.handle}`);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);
  const [coverImage, setCoverImage] = useState(user.coverImage);
  const [activeTab, setActiveTab] = useState<'info' | 'avatar' | 'cover' | 'preview'>('info');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle uploading avatar from local device
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle uploading cover photo from local device
  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile picture
  const handleRemoveAvatar = () => {
    setAvatar(DEFAULT_FALLBACK_AVATAR);
  };

  // Remove cover photo
  const handleRemoveCover = () => {
    setCoverImage(DEFAULT_FALLBACK_COVER);
  };

  // Reset to original
  const handleResetToOriginal = () => {
    setName(user.name);
    setHandle(user.handle.startsWith('@') ? user.handle : `@${user.handle}`);
    setBio(user.bio);
    setAvatar(user.avatar);
    setCoverImage(user.coverImage);
    setErrorMsg(null);
  };

  // Handle Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Display name cannot be empty');
      setActiveTab('info');
      return;
    }
    if (!handle.trim()) {
      setErrorMsg('Username cannot be empty');
      setActiveTab('info');
      return;
    }

    const cleanHandle = handle.trim().startsWith('@')
      ? handle.trim()
      : `@${handle.trim()}`;

    onSave({
      name: name.trim(),
      handle: cleanHandle,
      bio: bio.trim(),
      avatar: avatar.trim() || DEFAULT_FALLBACK_AVATAR,
      coverImage: coverImage.trim(),
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0e0a1f] border border-purple-800/60 rounded-t-3xl sm:rounded-3xl shadow-[0_0_50px_rgba(236,72,153,0.3)] flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/50 flex items-center justify-between bg-gradient-to-r from-[#140b2b] via-[#100924] to-[#160b2e] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-white">
                Customize Profile
              </h2>
              <p className="text-[10px] text-cyan-400 font-mono">
                Update avatar, cover, name & bio
              </p>
            </div>
          </div>
          <button
            id="close-edit-profile-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-purple-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation for Editing Sections */}
        <div className="flex bg-[#0a0717] px-3 pt-2 border-b border-purple-900/40 gap-1 shrink-0 overflow-x-auto">
          <button
            id="edit-tab-info-btn"
            onClick={() => setActiveTab('info')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'info'
                ? 'bg-[#150d30] text-pink-400 border-t-2 border-pink-500 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Info & Bio
          </button>
          <button
            id="edit-tab-avatar-btn"
            onClick={() => setActiveTab('avatar')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'avatar'
                ? 'bg-[#150d30] text-pink-400 border-t-2 border-pink-500 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Profile Picture
          </button>
          <button
            id="edit-tab-cover-btn"
            onClick={() => setActiveTab('cover')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cover'
                ? 'bg-[#150d30] text-pink-400 border-t-2 border-pink-500 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Cover Photo
          </button>
          <button
            id="edit-tab-preview-btn"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'preview'
                ? 'bg-[#150d30] text-cyan-400 border-t-2 border-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>

        {/* Scrollable Content Form */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: DISPLAY NAME, USERNAME & BIO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-400" />
                  Display Name
                </label>
                <input
                  id="edit-display-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="e.g. Alex Rivera"
                  maxLength={40}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090714] border border-purple-800/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors shadow-inner"
                />
              </div>

              {/* Username (@handle) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-cyan-400" />
                  Username
                </label>
                <div className="relative">
                  <input
                    id="edit-username-input"
                    type="text"
                    value={handle}
                    onChange={(e) => {
                      let val = e.target.value.toLowerCase().replace(/\s+/g, '_');
                      if (!val.startsWith('@') && val.length > 0) {
                        val = `@${val}`;
                      }
                      setHandle(val);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="@username"
                    maxLength={30}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#090714] border border-purple-800/60 text-cyan-300 font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-500">
                    handle
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Bio & Status
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      bio.length > 200 ? 'text-rose-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {bio.length} / 250
                  </span>
                </div>
                <textarea
                  id="edit-bio-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your Top 8 and visitors about yourself, your vibe, or music taste..."
                  rows={4}
                  maxLength={250}
                  className="w-full p-3 rounded-xl bg-[#090714] border border-purple-800/60 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors shadow-inner resize-none leading-relaxed"
                />

                {/* Quick Bio Suggestions */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-pink-400" /> Quick Bio Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {BIO_SUGGESTIONS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBio(preset)}
                        className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/40 text-[10px] text-slate-300 hover:text-pink-300 hover:border-pink-500/50 transition-all text-left truncate max-w-full"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE PICTURE CUSTOMIZATION */}
          {activeTab === 'avatar' && (
            <div className="space-y-4">
              {/* Current Avatar Display & Quick Controls */}
              <div className="p-3 rounded-2xl bg-[#090714] border border-purple-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative p-1 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                    <img
                      src={avatar}
                      alt="Avatar Preview"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#090714]"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Current Profile Picture</h4>
                    <p className="text-[10px] text-slate-400">
                      Square format recommended (1:1 ratio)
                    </p>
                  </div>
                </div>

                {/* Remove Avatar Button */}
                <button
                  type="button"
                  id="remove-avatar-btn"
                  onClick={handleRemoveAvatar}
                  className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-400 hover:bg-rose-900/60 hover:text-white transition-all text-xs flex items-center gap-1"
                  title="Remove Profile Picture"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Remove</span>
                </button>
              </div>

              {/* Upload from Device */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-pink-400" />
                  Upload from Device
                </label>
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                  id="avatar-file-input"
                />
                <button
                  type="button"
                  id="select-avatar-file-btn"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-purple-700/60 hover:border-pink-500 bg-purple-950/20 text-xs text-pink-300 font-semibold flex items-center justify-center gap-2 transition-all hover:bg-purple-950/40"
                >
                  <Upload className="w-4 h-4" />
                  Select Image from Device / Gallery
                </button>
              </div>

              {/* Curated Neon Avatar Presets */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Or Choose from Neon Avatars
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {AVATAR_PRESETS.map((preset, idx) => {
                    const isSelected = avatar === preset.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(preset.url)}
                        className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-pink-950/50 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                            : 'bg-[#090714] border-purple-800/40 hover:border-purple-600'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-purple-700/50">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] text-slate-300 truncate max-w-full font-medium">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COVER PHOTO CUSTOMIZATION */}
          {activeTab === 'cover' && (
            <div className="space-y-4">
              {/* Current Cover Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    Cover Banner Preview
                  </label>
                  {coverImage && (
                    <button
                      type="button"
                      id="remove-cover-btn"
                      onClick={handleRemoveCover}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/40 border border-rose-800/30"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove Cover
                    </button>
                  )}
                </div>

                <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-purple-800/50 bg-[#090714]">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-950 via-[#180f33] to-pink-950 flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6 opacity-40 mb-1" />
                      <span className="text-[11px] font-mono">No cover photo set (Using Neon Mesh)</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090714]/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Upload Cover from Device */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-pink-400" />
                  Upload Cover Photo from Device
                </label>
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileSelect}
                  className="hidden"
                  id="cover-file-input"
                />
                <button
                  type="button"
                  id="select-cover-file-btn"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-purple-700/60 hover:border-pink-500 bg-purple-950/20 text-xs text-pink-300 font-semibold flex items-center justify-center gap-2 transition-all hover:bg-purple-950/40"
                >
                  <Upload className="w-4 h-4" />
                  Select Banner Image from Device
                </button>
              </div>

              {/* Curated Cover Presets */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Or Choose from Neon Banners
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COVER_PRESETS.map((preset, idx) => {
                    const isSelected = coverImage === preset.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCoverImage(preset.url)}
                        className={`p-1.5 rounded-xl border text-left transition-all overflow-hidden ${
                          isSelected
                            ? 'bg-pink-950/50 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                            : 'bg-[#090714] border-purple-800/40 hover:border-purple-600'
                        }`}
                      >
                        <div className="h-14 w-full rounded-lg overflow-hidden border border-purple-800/40 mb-1">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] text-slate-300 truncate block font-medium">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE PROFILE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Live Preview Card
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  How your card looks to everyone
                </span>
              </div>

              <div className="rounded-2xl bg-[#090714] border border-purple-800/50 overflow-hidden shadow-lg">
                {/* Cover Preview */}
                <div className="relative h-24 w-full bg-purple-950">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="Cover"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-950 via-[#180f33] to-pink-950" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090714] via-transparent to-transparent" />
                </div>

                {/* Avatar & Info */}
                <div className="px-3.5 pb-4 -mt-8 relative z-10 space-y-2">
                  <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-cyan-400 shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                    <img
                      src={avatar}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover border-2 border-[#090714]"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090714]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-white">{name || 'Your Name'}</h3>
                      <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 text-[9px] font-mono border border-pink-500/40">
                        VIP
                      </span>
                    </div>
                    <p className="text-[11px] text-cyan-400 font-mono">{handle || '@username'}</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {bio || 'No bio written yet. Tell people about your vibe!'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-purple-900/50 bg-gradient-to-r from-[#140b2b] via-[#100924] to-[#160b2e] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            id="reset-profile-edits-btn"
            onClick={handleResetToOriginal}
            className="px-3 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="cancel-edit-profile-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/50 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="save-profile-changes-btn"
              onClick={handleSubmit}
              disabled={saveSuccess}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-80"
            >
              <Check className="w-4 h-4" />
              {saveSuccess ? 'Changes Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
