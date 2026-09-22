import React from 'react';
import {
  RotateCcw,
  Trophy,
  Sparkles,
  X as XIcon,
  Circle,
  HelpCircle,
  Users,
} from 'lucide-react';
import {
  GameRoom,
  broadcastGameState,
  getLocalPlayerProfile,
} from '../../services/multiplayerService';
import { gameAudio } from '../../services/gameAudio';
import { GameRoomChatAndPlayers } from './GameRoomChatAndPlayers';

export type BoardValue = 'X' | 'O' | null;

export interface TicTacToeGameState {
  board: BoardValue[];
  isXNext: boolean;
  winner: 'X' | 'O' | 'Tie' | null;
  winningLine: number[] | null;
  scores: {
    x: number;
    o: number;
    ties: number;
  };
  lastMoveLog: string;
}

interface TicTacToeMultiplayerGameProps {
  room: GameRoom<TicTacToeGameState>;
  onLeaveRoom: () => void;
}

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const createInitialTicTacToeState = (): TicTacToeGameState => ({
  board: Array(9).fill(null),
  isXNext: true,
  winner: null,
  winningLine: null,
  scores: { x: 0, o: 0, ties: 0 },
  lastMoveLog: 'Match started! Player X goes first.',
});

export const TicTacToeMultiplayerGame: React.FC<TicTacToeMultiplayerGameProps> = ({
  room,
  onLeaveRoom,
}) => {
  const myProfile = getLocalPlayerProfile();
  const gameState: TicTacToeGameState =
    room.gameState || createInitialTicTacToeState();

  const players = Object.values(room.players || {});
  const hostPlayer = players.find((p) => p.isHost) || players[0];
  const challengerPlayer = players.find((p) => !p.isHost) || null;

  const isHost = room.hostId === myProfile.id;
  const mySymbol: 'X' | 'O' = isHost ? 'X' : 'O';
  const currentTurnSymbol: 'X' | 'O' = gameState.isXNext ? 'X' : 'O';
  const isMyTurn = mySymbol === currentTurnSymbol && gameState.winner === null;

  const checkWinner = (squares: BoardValue[]) => {
    for (const [a, b, c] of WINNING_LINES) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (squares.every((sq) => sq !== null)) {
      return { winner: 'Tie' as const, line: null };
    }
    return null;
  };

  const handleCellClick = async (index: number) => {
    if (!isMyTurn || gameState.board[index] !== null || gameState.winner !== null) {
      return;
    }

    const newBoard = [...gameState.board];
    newBoard[index] = mySymbol;
    gameAudio.playPieceStep();

    const winResult = checkWinner(newBoard);
    const updatedScores = { ...gameState.scores };
    let log = `${myProfile.name} played ${mySymbol} at position ${index + 1}.`;

    if (winResult) {
      if (winResult.winner === 'X') {
        updatedScores.x += 1;
        log = `🏆 Player X (${hostPlayer?.name || 'Host'}) Won the Round!`;
        gameAudio.playWin();
      } else if (winResult.winner === 'O') {
        updatedScores.o += 1;
        log = `🏆 Player O (${challengerPlayer?.name || 'Challenger'}) Won the Round!`;
        gameAudio.playWin();
      } else {
        updatedScores.ties += 1;
        log = `🤝 It's a Tie Draw!`;
      }
    }

    await broadcastGameState(room.code, {
      ...gameState,
      board: newBoard,
      isXNext: !gameState.isXNext,
      winner: winResult?.winner || null,
      winningLine: winResult?.line || null,
      scores: updatedScores,
      lastMoveLog: log,
    });
  };

  const handlePlayAgain = async () => {
    await broadcastGameState(room.code, {
      ...gameState,
      board: Array(9).fill(null),
      isXNext: true,
      winner: null,
      winningLine: null,
      lastMoveLog: 'Rematch started! Player X goes first.',
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Match Scoreboard */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-r from-purple-950 via-[#140a2c] to-purple-950 border border-purple-800/40 shadow-xl flex items-center justify-between gap-3">
        {/* Host (X) */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src={hostPlayer?.avatar || myProfile.avatar}
              alt="Player X"
              className="w-9 h-9 rounded-full object-cover border-2 border-pink-500"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white font-black text-[9px] flex items-center justify-center">
              X
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>{hostPlayer?.name || 'Host'}</span>
              {currentTurnSymbol === 'X' && !gameState.winner && (
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              )}
            </div>
            <div className="text-[11px] font-mono text-pink-300 font-extrabold">
              {gameState.scores.x} WINS
            </div>
          </div>
        </div>

        {/* Center Round Info */}
        <div className="text-center">
          <span className="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800/50 text-[10px] font-mono text-cyan-300 font-bold">
            TICTACTOE 1v1
          </span>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Draws: {gameState.scores.ties}
          </p>
        </div>

        {/* Challenger (O) */}
        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
              {currentTurnSymbol === 'O' && !gameState.winner && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
              <span>{challengerPlayer?.name || 'Waiting...'}</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-300 font-extrabold">
              {gameState.scores.o} WINS
            </div>
          </div>
          <div className="relative">
            <img
              src={
                challengerPlayer?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
              }
              alt="Player O"
              className="w-9 h-9 rounded-full object-cover border-2 border-cyan-500"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-black font-black text-[9px] flex items-center justify-center">
              O
            </span>
          </div>
        </div>
      </div>

      {/* Main 3x3 Neon Grid Arena */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#090314] border border-purple-800/50 shadow-[0_0_35px_rgba(139,92,246,0.15)] flex flex-col items-center">
        {/* Turn Status Banner */}
        <div className="mb-4">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-lg inline-flex items-center gap-2 ${
              gameState.winner
                ? 'bg-amber-500/20 text-yellow-300 border-yellow-500/50'
                : isMyTurn
                ? 'bg-pink-500/80 text-white border-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse'
                : 'bg-purple-950/60 text-slate-300 border-purple-800/40'
            }`}
          >
            {gameState.winner
              ? gameState.winner === 'Tie'
                ? "🤝 Round Tied! Play again!"
                : `🏆 Player ${gameState.winner} won this round!`
              : isMyTurn
              ? `⚡ YOUR TURN (You are ${mySymbol})`
              : `Waiting for Opponent (${currentTurnSymbol})...`}
          </span>
        </div>

        {/* The 3x3 Board */}
        <div className="w-full max-w-[340px] aspect-square grid grid-cols-3 gap-3 p-3 bg-[#13092b] rounded-3xl border-2 border-purple-800/50 shadow-inner">
          {gameState.board.map((cell, index) => {
            const isWinningCell = gameState.winningLine?.includes(index);
            const isClickable = isMyTurn && cell === null && gameState.winner === null;

            return (
              <button
                key={index}
                id={`cell-${index}`}
                disabled={!isClickable}
                onClick={() => handleCellClick(index)}
                className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isWinningCell
                    ? 'bg-gradient-to-tr from-yellow-500 to-amber-400 text-black shadow-[0_0_25px_#eab308] scale-105 ring-2 ring-white'
                    : cell === 'X'
                    ? 'bg-pink-950/60 border-2 border-pink-500/80 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                    : cell === 'O'
                    ? 'bg-cyan-950/60 border-2 border-cyan-500/80 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : isClickable
                    ? 'bg-purple-950/40 border border-purple-800/40 hover:border-pink-500/60 hover:bg-purple-900/30'
                    : 'bg-purple-950/20 border border-purple-900/30 cursor-not-allowed opacity-50'
                }`}
              >
                {cell === 'X' && <XIcon className="w-12 h-12 stroke-[3]" />}
                {cell === 'O' && <Circle className="w-12 h-12 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Rematch Button */}
        {gameState.winner && (
          <div className="mt-4">
            <button
              onClick={handlePlayAgain}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Next Round</span>
            </button>
          </div>
        )}
      </div>

      {/* In-Game Chat & Roster */}
      <GameRoomChatAndPlayers
        room={room}
        currentPlayerId={myProfile.id}
        onLeaveRoom={onLeaveRoom}
        accentGradient="from-pink-500 to-cyan-500"
      />
    </div>
  );
};
