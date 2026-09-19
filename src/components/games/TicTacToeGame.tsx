import React, { useState } from 'react';
import { RotateCcw, Info, Trophy, Users, Bot, Sparkles, X as XIcon, Circle } from 'lucide-react';

interface TicTacToeGameProps {
  onGameWin?: (winner: string) => void;
}

type BoardValue = 'X' | 'O' | null;

export const TicTacToeGame: React.FC<TicTacToeGameProps> = () => {
  const [board, setBoard] = useState<BoardValue[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [isVsBot, setIsVsBot] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [scores, setScores] = useState({ x: 0, o: 0, ties: 0 });

  // Winning lines
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const calculateWinner = (squares: BoardValue[]) => {
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (squares.every((sq) => sq !== null)) {
      return { winner: 'Tie', line: null };
    }
    return null;
  };

  const winInfo = calculateWinner(board);
  const winner = winInfo?.winner;
  const winningLine = winInfo?.line;

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result) {
      if (result.winner === 'X') setScores((s) => ({ ...s, x: s.x + 1 }));
      else if (result.winner === 'O') setScores((s) => ({ ...s, o: s.o + 1 }));
      else if (result.winner === 'Tie') setScores((s) => ({ ...s, ties: s.ties + 1 }));
      return;
    }

    if (isVsBot && isXNext) {
      setIsXNext(false);
      // Cyber Bot Move
      setTimeout(() => {
        makeBotMove(newBoard);
      }, 400);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const makeBotMove = (currentBoard: BoardValue[]) => {
    // 1. Try to win
    for (const [a, b, c] of lines) {
      const vals = [currentBoard[a], currentBoard[b], currentBoard[c]];
      if (vals.filter((v) => v === 'O').length === 2 && vals.includes(null)) {
        const emptyIdx = [a, b, c].find((i) => currentBoard[i] === null);
        if (emptyIdx !== undefined) {
          executeBotStep(currentBoard, emptyIdx);
          return;
        }
      }
    }

    // 2. Block player X
    for (const [a, b, c] of lines) {
      const vals = [currentBoard[a], currentBoard[b], currentBoard[c]];
      if (vals.filter((v) => v === 'X').length === 2 && vals.includes(null)) {
        const emptyIdx = [a, b, c].find((i) => currentBoard[i] === null);
        if (emptyIdx !== undefined) {
          executeBotStep(currentBoard, emptyIdx);
          return;
        }
      }
    }

    // 3. Take center if open
    if (currentBoard[4] === null) {
      executeBotStep(currentBoard, 4);
      return;
    }

    // 4. Take random available
    const available = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((v): v is number => v !== null);

    if (available.length > 0) {
      const randomChoice = available[Math.floor(Math.random() * available.length)];
      executeBotStep(currentBoard, randomChoice);
    }
  };

  const executeBotStep = (currentBoard: BoardValue[], index: number) => {
    const updated = [...currentBoard];
    updated[index] = 'O';
    setBoard(updated);
    setIsXNext(true);

    const result = calculateWinner(updated);
    if (result) {
      if (result.winner === 'X') setScores((s) => ({ ...s, x: s.x + 1 }));
      else if (result.winner === 'O') setScores((s) => ({ ...s, o: s.o + 1 }));
      else if (result.winner === 'Tie') setScores((s) => ({ ...s, ties: s.ties + 1 }));
    }
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const resetAll = () => {
    handleRestart();
    setScores({ x: 0, o: 0, ties: 0 });
  };

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-b from-[#180f33] to-[#0c081e] border border-purple-800/50 shadow-[0_0_25px_rgba(168,85,247,0.15)] space-y-4">
      {/* Top Header & Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
              <span>Tic-Tac-Toe</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">NEON 3x3</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {isVsBot ? 'Player (X) vs Cyber Bot (O)' : 'Pass & Play: Player 1 (X) vs Player 2 (O)'}
            </p>
          </div>
        </div>

        {/* Instructions toggle button */}
        <button
          id="tictactoe-instructions-toggle-btn"
          onClick={() => setShowInstructions((prev) => !prev)}
          className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
            showInstructions
              ? 'bg-pink-500/20 border-pink-500 text-pink-300'
              : 'bg-purple-950/50 border-purple-800/40 text-slate-400 hover:text-white'
          }`}
          title="Game Instructions"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Switcher: Vs Cyber Bot vs 2-Player */}
      <div className="flex items-center justify-between gap-2 p-1 bg-[#100924] rounded-2xl border border-purple-900/40 text-xs">
        <button
          id="tictactoe-mode-bot-btn"
          onClick={() => {
            setIsVsBot(true);
            handleRestart();
          }}
          className={`flex-1 py-1.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            isVsBot
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Vs Cyber AI</span>
        </button>
        <button
          id="tictactoe-mode-2p-btn"
          onClick={() => {
            setIsVsBot(false);
            handleRestart();
          }}
          className={`flex-1 py-1.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            !isVsBot
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Pass & Play</span>
        </button>
      </div>

      {/* Collapsible Game Instructions */}
      {showInstructions && (
        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
          <h4 className="font-bold text-pink-300 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Game Instructions
          </h4>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
            <li>Players take turns placing their neon mark (<span className="text-cyan-400 font-bold">X</span> or <span className="text-pink-400 font-bold">O</span>) on an empty grid tile.</li>
            <li>First to connect 3 symbols horizontally, vertically, or diagonally wins the round.</li>
            <li>If all 9 squares are filled with no trio, the round ends in a Cyber Stalemate (Draw).</li>
            <li>Toggle between solo play against the <strong>Cyber AI</strong> or <strong>Pass & Play</strong> with a friend.</li>
          </ul>
        </div>
      )}

      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
        <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
          <span className="text-[10px] text-cyan-300">PLAYER (X)</span>
          <p className="text-base font-bold text-cyan-400 mt-0.5">{scores.x}</p>
        </div>
        <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40">
          <span className="text-[10px] text-slate-400">TIES</span>
          <p className="text-base font-bold text-slate-200 mt-0.5">{scores.ties}</p>
        </div>
        <div className="p-2 rounded-xl bg-pink-950/30 border border-pink-800/40">
          <span className="text-[10px] text-pink-300">{isVsBot ? 'CYBER BOT (O)' : 'PLAYER (O)'}</span>
          <p className="text-base font-bold text-pink-400 mt-0.5">{scores.o}</p>
        </div>
      </div>

      {/* Turn & Status Indicator Banner */}
      <div className="text-center py-1">
        {winner ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-pink-500/50 text-xs font-bold text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] animate-bounce">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>
              {winner === 'Tie'
                ? 'Cyber Tie! No winner this round'
                : `${winner === 'X' ? 'Player X' : isVsBot ? 'Cyber Bot (O)' : 'Player O'} Wins! 🎉`}
            </span>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-300 flex items-center justify-center gap-1.5">
            <span>Turn:</span>
            {isXNext ? (
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <XIcon className="w-3.5 h-3.5" /> Player X
              </span>
            ) : (
              <span className="text-pink-400 font-bold flex items-center gap-1">
                <Circle className="w-3.5 h-3.5" /> {isVsBot ? 'Cyber Bot' : 'Player O'}
              </span>
            )}
          </span>
        )}
      </div>

      {/* 3x3 Interactive Neon Grid */}
      <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto p-2 bg-[#090518] rounded-2xl border border-purple-800/40 shadow-inner">
        {board.map((cell, idx) => {
          const isWinningCell = winningLine?.includes(idx);
          return (
            <button
              key={idx}
              id={`tictactoe-cell-${idx}`}
              onClick={() => handleCellClick(idx)}
              disabled={!!cell || !!winner}
              className={`aspect-square rounded-xl text-3xl font-display font-extrabold flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isWinningCell
                  ? 'bg-gradient-to-tr from-pink-500 to-amber-400 text-white shadow-[0_0_20px_#ec4899] scale-105 border-2 border-white'
                  : cell
                  ? 'bg-purple-950/60 border border-purple-800/40'
                  : 'bg-purple-950/25 border border-purple-900/30 hover:border-pink-500/60 hover:bg-purple-900/30 active:scale-95'
              }`}
            >
              {cell === 'X' && (
                <span className="text-cyan-400 drop-shadow-[0_0_10px_#22d3ee]">X</span>
              )}
              {cell === 'O' && (
                <span className="text-pink-400 drop-shadow-[0_0_10px_#ec4899]">O</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Controls: Restart Button */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <button
          id="tictactoe-restart-btn"
          onClick={handleRestart}
          className="px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Game</span>
        </button>

        <button
          id="tictactoe-reset-scores-btn"
          onClick={resetAll}
          className="px-3 py-2 rounded-2xl bg-purple-950/60 border border-purple-800/40 hover:border-purple-600 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          title="Reset score counters"
        >
          Reset Scores
        </button>
      </div>
    </div>
  );
};
