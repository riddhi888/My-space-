import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  off,
  Database,
  Unsubscribe,
} from 'firebase/database';

export interface RoomParticipant {
  id: string;
  name: string;
  avatar: string;
  colorIndex: number; // 0: Red, 1: Green, 2: Yellow, 3: Blue
  isReady: boolean;
  isHost: boolean;
  joinedAt: number;
  score?: number;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor?: string;
  text: string;
  timestamp: number;
}

export interface GameRoom<T = any> {
  code: string; // 6-digit code e.g. "849201"
  gameType: 'ludo' | 'carrom' | 'tictactoe';
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  maxPlayers: number;
  players: Record<string, RoomParticipant>;
  gameState: T;
  chat: ChatMessage[];
  lastActivity: number;
}

export interface StoredPlayerProfile {
  id: string;
  name: string;
  avatar: string;
}

// Check if Firebase env vars exist
export function isFirebaseConfigured(): boolean {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;
  return Boolean(apiKey && (databaseURL || projectId));
}

let firebaseAppInstance: FirebaseApp | null = null;
let realtimeDbInstance: Database | null = null;

function getFirebaseDb(): Database | null {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (!realtimeDbInstance) {
    try {
      const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      if (!getApps().length) {
        firebaseAppInstance = initializeApp(config);
      } else {
        firebaseAppInstance = getApps()[0];
      }
      realtimeDbInstance = getDatabase(firebaseAppInstance);
    } catch (err) {
      console.warn('Could not initialize Firebase Realtime Database:', err);
      return null;
    }
  }
  return realtimeDbInstance;
}

// Local Storage Player Profile helper
export function getLocalPlayerProfile(): StoredPlayerProfile {
  try {
    const savedName = localStorage.getItem('myspace_player_name');
    const savedAvatar = localStorage.getItem('myspace_player_avatar');
    let savedId = localStorage.getItem('myspace_player_id');

    if (!savedId) {
      savedId = `p_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('myspace_player_id', savedId);
    }

    if (savedName && savedName.trim()) {
      return {
        id: savedId,
        name: savedName.trim(),
        avatar: savedAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      };
    }

    // Try reading myspace_user
    const userRaw = localStorage.getItem('myspace_user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      if (u && u.name) {
        const name = u.name.trim();
        const avatar = u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
        localStorage.setItem('myspace_player_name', name);
        localStorage.setItem('myspace_player_avatar', avatar);
        return { id: savedId, name, avatar };
      }
    }
  } catch (err) {
    console.warn('Failed reading player profile', err);
  }

  // Default fallback
  const randomNum = Math.floor(100 + Math.random() * 900);
  const defaultName = `NeonPlayer#${randomNum}`;
  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  localStorage.setItem('myspace_player_name', defaultName);
  localStorage.setItem('myspace_player_avatar', defaultAvatar);
  return {
    id: `p_${Date.now().toString(36)}`,
    name: defaultName,
    avatar: defaultAvatar,
  };
}

export function saveLocalPlayerProfile(name: string, avatar?: string): StoredPlayerProfile {
  const current = getLocalPlayerProfile();
  const trimmed = name.trim() || current.name;
  localStorage.setItem('myspace_player_name', trimmed);
  if (avatar) {
    localStorage.setItem('myspace_player_avatar', avatar);
  }
  return {
    id: current.id,
    name: trimmed,
    avatar: avatar || current.avatar,
  };
}

// Generate unique 6-digit room code
export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Memory & Local-Storage hybrid store for instant cross-tab / cross-window sync
const localRoomsMemory: Record<string, GameRoom> = {};
const activeListeners: Record<string, Set<(room: GameRoom) => void>> = {};

// Broadcast channel for multi-tab sync
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('myspace_arcade_multiplayer_bus');
    syncChannel.onmessage = (event) => {
      const { type, roomCode, data } = event.data || {};
      if (type === 'ROOM_UPDATE' && roomCode && data) {
        localRoomsMemory[roomCode] = data;
        localStorage.setItem(`myspace_room_${roomCode}`, JSON.stringify(data));
        notifySubscribers(roomCode, data);
      }
    };
  } catch {}
}

// Also hook storage event for browser windows without BroadcastChannel
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('myspace_room_') && e.newValue) {
      const code = e.key.replace('myspace_room_', '');
      try {
        const parsed = JSON.parse(e.newValue);
        localRoomsMemory[code] = parsed;
        notifySubscribers(code, parsed);
      } catch {}
    }
  });
}

function notifySubscribers(roomCode: string, room: GameRoom) {
  const set = activeListeners[roomCode];
  if (set) {
    set.forEach((cb) => {
      try {
        cb(room);
      } catch (err) {
        console.error('Subscriber callback error', err);
      }
    });
  }
}

function saveLocalRoom(room: GameRoom) {
  localRoomsMemory[room.code] = room;
  try {
    localStorage.setItem(`myspace_room_${room.code}`, JSON.stringify(room));
    if (syncChannel) {
      syncChannel.postMessage({ type: 'ROOM_UPDATE', roomCode: room.code, data: room });
    }
  } catch {}
}

function getStoredLocalRoom(code: string): GameRoom | null {
  if (localRoomsMemory[code]) return localRoomsMemory[code];
  try {
    const raw = localStorage.getItem(`myspace_room_${code}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      localRoomsMemory[code] = parsed;
      return parsed;
    }
  } catch {}
  return null;
}

// -------------------------------------------------------------
// CORE MULTIPLAYER API (Seamlessly bridges Firebase RTDB & Local Bus)
// -------------------------------------------------------------

export async function createMultiplayerRoom<T>(
  gameType: 'ludo' | 'carrom' | 'tictactoe',
  maxPlayers: number,
  initialGameState: T
): Promise<GameRoom<T>> {
  const player = getLocalPlayerProfile();
  const code = generate6DigitCode();

  const participant: RoomParticipant = {
    id: player.id,
    name: player.name,
    avatar: player.avatar,
    colorIndex: 0,
    isReady: true,
    isHost: true,
    joinedAt: Date.now(),
    score: 0,
    isOnline: true,
  };

  const room: GameRoom<T> = {
    code,
    gameType,
    hostId: player.id,
    status: 'waiting',
    createdAt: Date.now(),
    maxPlayers,
    players: {
      [player.id]: participant,
    },
    gameState: initialGameState,
    chat: [
      {
        id: `msg_${Date.now()}`,
        senderId: 'system',
        senderName: 'Arcade System',
        senderColor: '#ec4899',
        text: `Room ${code} created by ${player.name}. Share the 6-digit code with friends!`,
        timestamp: Date.now(),
      },
    ],
    lastActivity: Date.now(),
  };

  // 1. Save to Local Bus
  saveLocalRoom(room);

  // 2. Save to Firebase RTDB if configured
  const db = getFirebaseDb();
  if (db) {
    try {
      const roomRef = ref(db, `myspace_rooms/${code}`);
      await set(roomRef, room);
    } catch (err) {
      console.warn('Firebase RTDB room creation fallback:', err);
    }
  }

  return room;
}

export async function joinMultiplayerRoom(
  code: string,
  preferredColor?: number
): Promise<{ success: boolean; error?: string; room?: GameRoom }> {
  const player = getLocalPlayerProfile();
  const cleanCode = code.trim().toUpperCase();

  // Try fetching from Firebase first if available
  const db = getFirebaseDb();
  let room: GameRoom | null = null;

  if (db) {
    try {
      const roomRef = ref(db, `myspace_rooms/${cleanCode}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        room = snapshot.val() as GameRoom;
      }
    } catch (err) {
      console.warn('Error fetching room from Firebase RTDB:', err);
    }
  }

  // Fallback to local
  if (!room) {
    room = getStoredLocalRoom(cleanCode);
  }

  if (!room) {
    return { success: false, error: 'Room not found! Check the 6-digit code.' };
  }

  const existingPlayers = Object.values(room.players || {});
  const alreadyInRoom = room.players && room.players[player.id];

  if (!alreadyInRoom && existingPlayers.length >= room.maxPlayers) {
    return { success: false, error: 'Room is already full!' };
  }

  // Assign color slot
  const usedColorIndexes = existingPlayers
    .filter((p) => p.id !== player.id)
    .map((p) => p.colorIndex);

  let assignedColor = preferredColor ?? 0;
  if (usedColorIndexes.includes(assignedColor) || assignedColor >= room.maxPlayers) {
    for (let i = 0; i < room.maxPlayers; i++) {
      if (!usedColorIndexes.includes(i)) {
        assignedColor = i;
        break;
      }
    }
  }

  const updatedPlayer: RoomParticipant = {
    id: player.id,
    name: player.name,
    avatar: player.avatar,
    colorIndex: assignedColor,
    isReady: true,
    isHost: room.hostId === player.id,
    joinedAt: alreadyInRoom?.joinedAt || Date.now(),
    score: alreadyInRoom?.score || 0,
    isOnline: true,
  };

  const updatedPlayers = {
    ...(room.players || {}),
    [player.id]: updatedPlayer,
  };

  const updatedChat: ChatMessage[] = [
    ...(room.chat || []),
    ...(!alreadyInRoom
      ? [
          {
            id: `msg_${Date.now()}`,
            senderId: 'system',
            senderName: 'Arcade System',
            senderColor: '#06b6d4',
            text: `${player.name} joined the room!`,
            timestamp: Date.now(),
          },
        ]
      : []),
  ];

  const updatedRoom: GameRoom = {
    ...room,
    players: updatedPlayers,
    chat: updatedChat,
    lastActivity: Date.now(),
  };

  // Save to local
  saveLocalRoom(updatedRoom);
  notifySubscribers(cleanCode, updatedRoom);

  // Sync to Firebase
  if (db) {
    try {
      const roomRef = ref(db, `myspace_rooms/${cleanCode}`);
      await update(roomRef, {
        [`players/${player.id}`]: updatedPlayer,
        chat: updatedChat,
        lastActivity: Date.now(),
      });
    } catch (err) {
      console.warn('Failed to update player in Firebase RTDB:', err);
    }
  }

  return { success: true, room: updatedRoom };
}

export function subscribeToRoom(
  code: string,
  onUpdate: (room: GameRoom) => void
): () => void {
  const cleanCode = code.trim().toUpperCase();

  if (!activeListeners[cleanCode]) {
    activeListeners[cleanCode] = new Set();
  }
  activeListeners[cleanCode].add(onUpdate);

  // Initial push of existing local data
  const local = getStoredLocalRoom(cleanCode);
  if (local) {
    onUpdate(local);
  }

  // Firebase Realtime Listener
  const db = getFirebaseDb();
  let firebaseUnsub: Unsubscribe | null = null;

  if (db) {
    try {
      const roomRef = ref(db, `myspace_rooms/${cleanCode}`);
      firebaseUnsub = onValue(
        roomRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const remoteRoom = snapshot.val() as GameRoom;
            localRoomsMemory[cleanCode] = remoteRoom;
            saveLocalRoom(remoteRoom);
            onUpdate(remoteRoom);
          }
        },
        (error) => {
          console.warn('Firebase RTDB subscription error:', error);
        }
      );
    } catch (err) {
      console.warn('Failed to attach Firebase RTDB listener:', err);
    }
  }

  return () => {
    if (activeListeners[cleanCode]) {
      activeListeners[cleanCode].delete(onUpdate);
      if (activeListeners[cleanCode].size === 0) {
        delete activeListeners[cleanCode];
      }
    }
    if (firebaseUnsub) {
      firebaseUnsub();
    }
  };
}

export async function broadcastGameState<T>(
  code: string,
  newGameState: T,
  additionalRoomUpdates?: Partial<GameRoom<T>>
): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const current = getStoredLocalRoom(cleanCode);
  if (!current) return;

  const updatedRoom: GameRoom<T> = {
    ...current,
    ...additionalRoomUpdates,
    gameState: newGameState,
    lastActivity: Date.now(),
  };

  saveLocalRoom(updatedRoom);
  notifySubscribers(cleanCode, updatedRoom);

  const db = getFirebaseDb();
  if (db) {
    try {
      const roomRef = ref(db, `myspace_rooms/${cleanCode}`);
      await update(roomRef, {
        gameState: newGameState,
        ...(additionalRoomUpdates || {}),
        lastActivity: Date.now(),
      });
    } catch (err) {
      console.warn('Firebase sync error:', err);
    }
  }
}

export async function sendChatMessage(
  code: string,
  text: string
): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const player = getLocalPlayerProfile();
  const current = getStoredLocalRoom(cleanCode);
  if (!current) return;

  const currentParticipant = current.players?.[player.id];
  const colorMap = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'];
  const senderColor = currentParticipant ? colorMap[currentParticipant.colorIndex % 4] : '#ec4899';

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderId: player.id,
    senderName: player.name,
    senderColor,
    text: text.trim(),
    timestamp: Date.now(),
  };

  const updatedChat = [...(current.chat || []), newMsg];
  const updatedRoom: GameRoom = {
    ...current,
    chat: updatedChat,
    lastActivity: Date.now(),
  };

  saveLocalRoom(updatedRoom);
  notifySubscribers(cleanCode, updatedRoom);

  const db = getFirebaseDb();
  if (db) {
    try {
      const roomRef = ref(db, `myspace_rooms/${cleanCode}`);
      await update(roomRef, {
        chat: updatedChat,
        lastActivity: Date.now(),
      });
    } catch (err) {
      console.warn('Firebase chat sync error:', err);
    }
  }
}

export async function leaveMultiplayerRoom(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const player = getLocalPlayerProfile();
  const current = getStoredLocalRoom(cleanCode);
  if (!current) return;

  const remainingPlayers = { ...(current.players || {}) };
  delete remainingPlayers[player.id];

  const remainingKeys = Object.keys(remainingPlayers);
  const newHostId = current.hostId === player.id && remainingKeys.length > 0 ? remainingKeys[0] : current.hostId;

  if (newHostId && remainingPlayers[newHostId]) {
    remainingPlayers[newHostId].isHost = true;
  }

  const updatedRoom: GameRoom = {
    ...current,
    hostId: newHostId,
    players: remainingPlayers,
    chat: [
      ...(current.chat || []),
      {
        id: `msg_${Date.now()}`,
        senderId: 'system',
        senderName: 'Arcade System',
        senderColor: '#ef4444',
        text: `${player.name} left the room.`,
        timestamp: Date.now(),
      },
    ],
    lastActivity: Date.now(),
  };

  saveLocalRoom(updatedRoom);
  notifySubscribers(cleanCode, updatedRoom);

  const db = getFirebaseDb();
  if (db) {
    try {
      const roomRef = ref(db, `myspace_rooms/${cleanCode}`);
      if (remainingKeys.length === 0) {
        // Can optionally remove room
      } else {
        await set(roomRef, updatedRoom);
      }
    } catch (err) {
      console.warn('Error on room leave:', err);
    }
  }
}
