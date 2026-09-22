import React, { useState } from 'react';
import { RotateCcw, Info, Trophy, Sparkles, Flame, Shield, Swords, Zap } from 'lucide-react';

type Choice = 'rock' | 'paper' | 'scissors';

interface ChoiceData {
  id: Choice;
  name: string;
  emoji: string;
  color: string;
  beats: Choice;
  description: string;
}

const choices: ChoiceData[] = [
  {
    id: 'rock',
    name: 'Cyber Rock',
    emoji: '🪨',
    color: 'from-amber-500 to-rose-600',
    beats: 'scissors',
    description: 'Crushes Laser Scissors',
  },
  {
    id: 'paper',
    name: 'Holo Paper',
    emoji: '📄',
    color: 'from-cyan-400 to-blue-600',
    beats: 'rock',
    description: 'Wraps & Disables Rock',
  },
  {
    id: 'scissors',
    name: 'Neon Scissors',
    emoji: '✂️',
    color: 'from-pink-500 to-purple-600',
    beats: 'paper',
    description: 'Slices Holo Paper',
  },
];

export const RockPaperScissorsGame: React.FC = () => {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [botChoice, setBotChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [scores, setScores] = useState({ wins: 0, losses: 0, draws: 0 });
  const [showInstructions, setShowInstructions] = useState(false);

  const handlePlayChoice = (selected: Choice) => {
    if (isShuffling) return;

    setPlayerChoice(selected);
    setIsShuffling(true);
    setResult(null);

    // Simulated shuffling effect for Bot
    setTimeout(() => {
      const options: Choice[] = ['rock', 'paper', 'scissors'];
      const randomBot = options[Math.floor(Math.random() * options.length)];
      setBotChoice(randomBot);
      setIsShuffling(false);

      if (selected === randomBot) {
        setResult('draw');
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      } else {
        const playerObj = choices.find((c) => c.id === selected);
        if (playerObj?.beats === randomBot) {
          setResult('win');
          setStreak((prev) => {
            const next = prev + 1;
            if (next > bestStreak) setBestStreak(next);
            return next;
          });
          setScores((s) => ({ ...s, wins: s.wins + 1 }));
        } else {
          setResult('lose');
          setStreak(0);
          setScores((s) => ({ ...s, losses: s.losses + 1 }));
        }
      }
    }, 600);
  };

  const handleRestart = () => {
    setPlayerChoice(null);
    setBotChoice(null);
    setResult(null);
    setIsShuffling(false);
  };

  const handleResetScores = () => {
    handleRestart();
    setStreak(0);
    setScores({ wins: 0, losses: 0, draws: 0 });
  };

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-b from-[#180f33] to-[#0c081e] border border-purple-800/50 shadow-[0_0_25px_rgba(168,85,247,0.15)] space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
              <span>Rock Paper Scissors</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono">CYBER ARENA</span>
            </h3>
            <p className="text-[11px] text-slate-400">Battle against the Cyber Bot & build your win streak</p>
          </div>
        </div>

        {/* Instructions button */}
        <button
          id="rps-instructions-toggle-btn"
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

      {/* Collapsible Game Instructions */}
      {showInstructions && (
        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
          <h4 className="font-bold text-cyan-300 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Game Instructions
          </h4>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
            <li>Select one of three holographic weapons: <strong>Rock 🪨</strong>, <strong>Paper 📄</strong>, or <strong>Scissors ✂️</strong>.</li>
            <li><strong className="text-amber-400">Rock</strong> crushes Scissors.</li>
            <li><strong className="text-pink-400">Scissors</strong> cuts Paper.</li>
            <li><strong className="text-cyan-400">Paper</strong> wraps and disarms Rock.</li>
            <li>Consecutive wins increase your <strong>Neon Streak</strong> multiplier!</li>
          </ul>
        </div>
      )}

      {/* Scoreboard & Streak Bar */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
        <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
          <span className="text-[10px] text-emerald-400 font-semibold">WINS</span>
          <p className="text-base font-bold text-emerald-400 mt-0.5">{scores.wins}</p>
        </div>
        <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-800/40">
          <span className="text-[10px] text-rose-400 font-semibold">LOSSES</span>
          <p className="text-base font-bold text-rose-400 mt-0.5">{scores.losses}</p>
        </div>
        <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40">
          <span className="text-[10px] text-slate-400">DRAWS</span>
          <p className="text-base font-bold text-slate-300 mt-0.5">{scores.draws}</p>
        </div>
        <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-800/40">
          <span className="text-[10px] text-amber-400 font-semibold flex items-center justify-center gap-0.5">
            <Flame className="w-3 h-3 text-amber-400" /> STREAK
          </span>
          <p className="text-base font-bold text-amber-300 mt-0.5">x{streak}</p>
        </div>
      </div>

      {/* Showdown Duel Ring */}
      <div className="p-4 rounded-2xl bg-[#0a0618] border border-purple-800/40 flex items-center justify-around relative overflow-hidden shadow-inner min-h-[140px]">
        {/* Player side */}
        <div className="flex flex-col items-center gap-1.5 z-10">
          <span className="text-[11px] font-mono font-semibold text-cyan-300">YOU</span>
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border-2 border-cyan-400/60 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            {playerChoice ? (
              choices.find((c) => c.id === playerChoice)?.emoji
            ) : (
              <span className="text-slate-600 text-sm">Pick...</span>
            )}
          </div>
          <span className="text-[11px] text-slate-300 font-semibold capitalize">
            {playerChoice || 'Awaiting'}
          </span>
        </div>

        {/* VS / Outcome Center */}
        <div className="flex flex-col items-center justify-center text-center z-10 px-2">
          {isShuffling ? (
            <div className="space-y-1">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto animate-spin" />
              <span className="text-[10px] text-yellow-400 font-mono animate-pulse">CLASHING...</span>
            </div>
          ) : result ? (
            <div className="space-y-1 animate-in zoom-in-50 duration-200">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  result === 'win'
                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_#10b981]'
                    : result === 'lose'
                    ? 'bg-rose-500 text-white shadow-[0_0_15px_#f43f5e]'
                    : 'bg-purple-600 text-white shadow-[0_0_15px_#9333ea]'
                }`}
              >
                {result === 'win' ? 'Victory! 🎉' : result === 'lose' ? 'Defeat 💥' : 'Neon Tie! ⚡'}
              </span>
              <p className="text-[10px] font-mono text-slate-300 pt-1">
                {result === 'win' && '+100 Cyber XP'}
                {result === 'lose' && 'Streak broken'}
                {result === 'draw' && 'Equal power'}
              </p>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-700/50 flex items-center justify-center text-xs font-mono font-bold text-pink-400">
              VS
            </div>
          )}
        </div>

        {/* Cyber Bot side */}
        <div className="flex flex-col items-center gap-1.5 z-10">
          <span className="text-[11px] font-mono font-semibold text-pink-300">CYBER BOT</span>
          <div className="w-16 h-16 rounded-2xl bg-pink-950/40 border-2 border-pink-400/60 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            {isShuffling ? (
              <span className="animate-bounce">🤖</span>
            ) : botChoice ? (
              choices.find((c) => c.id === botChoice)?.emoji
            ) : (
              <span className="text-slate-600 text-sm">Bot</span>
            )}
          </div>
          <span className="text-[11px] text-slate-300 font-semibold capitalize">
            {isShuffling ? 'Deciding...' : botChoice || 'Ready'}
          </span>
        </div>
      </div>

      {/* Choice Buttons */}
      <div className="space-y-1.5">
        <p className="text-center text-[11px] font-mono text-slate-400">CHOOSE YOUR WEAPON</p>
        <div className="grid grid-cols-3 gap-2">
          {choices.map((c) => (
            <button
              key={c.id}
              id={`rps-choice-${c.id}-btn`}
              onClick={() => handlePlayChoice(c.id)}
              disabled={isShuffling}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group active:scale-95 ${
                playerChoice === c.id
                  ? 'bg-gradient-to-t from-pink-500/30 to-purple-600/30 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                  : 'bg-purple-950/30 border-purple-800/40 hover:border-pink-500/60 hover:bg-purple-900/30'
              }`}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-150">
                {c.emoji}
              </span>
              <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                {c.name}
              </span>
              <span className="text-[9px] text-slate-400 text-center leading-tight">
                {c.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Restart Button */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <button
          id="rps-restart-btn"
          onClick={handleRestart}
          className="px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Round</span>
        </button>

        <button
          id="rps-reset-scores-btn"
          onClick={handleResetScores}
          className="px-3 py-2 rounded-2xl bg-purple-950/60 border border-purple-800/40 hover:border-purple-600 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          title="Reset streak and scores"
        >
          Reset Streak
        </button>
      </div>
    </div>
  );
};
