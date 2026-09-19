import React, { useState } from 'react';
import { RotateCcw, Info, Trophy, Sparkles, Hash, ArrowUp, ArrowDown, Check, Zap } from 'lucide-react';

interface GuessRecord {
  guess: number;
  hint: 'higher' | 'lower' | 'correct';
  message: string;
}

export const NumberGuessingGame: React.FC = () => {
  const [targetNumber, setTargetNumber] = useState<number>(() => Math.floor(Math.random() * 100) + 1);
  const [guessInput, setGuessInput] = useState<string>('');
  const [history, setHistory] = useState<GuessRecord[]>([]);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [minRange, setMinRange] = useState<number>(1);
  const [maxRange, setMaxRange] = useState<number>(100);

  const handleRestart = () => {
    const newTarget = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(newTarget);
    setGuessInput('');
    setHistory([]);
    setIsWon(false);
    setMinRange(1);
    setMaxRange(100);
  };

  const handleGuessSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseInt(guessInput, 10);
    if (isNaN(num) || num < 1 || num > 100 || isWon) return;

    if (num === targetNumber) {
      setIsWon(true);
      setHistory((prev) => [
        {
          guess: num,
          hint: 'correct',
          message: 'Decrypted! Exact frequency match!',
        },
        ...prev,
      ]);
    } else if (num < targetNumber) {
      if (num >= minRange) setMinRange(num + 1);
      setHistory((prev) => [
        {
          guess: num,
          hint: 'higher',
          message: 'Too Low! Go Higher ⬆️',
        },
        ...prev,
      ]);
    } else {
      if (num <= maxRange) setMaxRange(num - 1);
      setHistory((prev) => [
        {
          guess: num,
          hint: 'lower',
          message: 'Too High! Go Lower ⬇️',
        },
        ...prev,
      ]);
    }

    setGuessInput('');
  };

  const handleQuickStep = (step: number) => {
    const current = parseInt(guessInput || '50', 10);
    const updated = Math.min(Math.max(current + step, 1), 100);
    setGuessInput(updated.toString());
  };

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-b from-[#180f33] to-[#0c081e] border border-purple-800/50 shadow-[0_0_25px_rgba(168,85,247,0.15)] space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
              <span>Number Guessing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">1 - 100</span>
            </h3>
            <p className="text-[11px] text-slate-400">Decode the mainframe's secret numerical key</p>
          </div>
        </div>

        {/* Instructions button */}
        <button
          id="numguess-instructions-toggle-btn"
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
          <h4 className="font-bold text-amber-300 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Game Instructions
          </h4>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
            <li>The system chooses a random secret number between <strong>1 and 100</strong>.</li>
            <li>Enter your guess and hit <strong>Decode</strong>.</li>
            <li>If your guess is lower, you'll be told to <strong>Go Higher ⬆️</strong>.</li>
            <li>If your guess is higher, you'll be told to <strong>Go Lower ⬇️</strong>.</li>
            <li>Watch the range narrowing between <em>{minRange}</em> and <em>{maxRange}</em> to deduce the code in minimum attempts!</li>
          </ul>
        </div>
      )}

      {/* Secret Vault Display / Win Banner */}
      <div className="p-4 rounded-2xl bg-[#0a0618] border border-purple-800/40 text-center space-y-2 relative overflow-hidden shadow-inner">
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
          {isWon ? 'CODE DECRYPTED' : 'QUANTUM CODE TARGET'}
        </span>

        <div className="flex items-center justify-center gap-2">
          {isWon ? (
            <div className="text-4xl font-display font-extrabold text-emerald-400 tracking-wider animate-bounce drop-shadow-[0_0_15px_#34d399]">
              [ {targetNumber} ]
            </div>
          ) : (
            <div className="text-4xl font-display font-extrabold text-pink-400 tracking-wider drop-shadow-[0_0_15px_#ec4899]">
              [ ? ? ]
            </div>
          )}
        </div>

        {/* Range Indicator */}
        <div className="flex items-center justify-center gap-3 text-xs font-mono pt-1">
          <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-cyan-400">
            MIN: {minRange}
          </span>
          <span className="text-slate-500">↔</span>
          <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-pink-400">
            MAX: {maxRange}
          </span>
        </div>
      </div>

      {/* Interactive Input Form */}
      {!isWon ? (
        <form onSubmit={handleGuessSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              id="numguess-input-field"
              type="number"
              min="1"
              max="100"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="Enter number (1-100)..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[#0d0720] border border-purple-800/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 font-mono"
            />
            <button
              id="numguess-submit-btn"
              type="submit"
              disabled={!guessInput}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)] disabled:opacity-40 disabled:pointer-events-none transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Decode</span>
            </button>
          </div>

          {/* Quick Adjustment Chips */}
          <div className="flex justify-center gap-1.5 text-xs font-mono">
            {[-10, -5, -1, 1, 5, 10].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => handleQuickStep(step)}
                className="px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-800/40 text-slate-300 hover:text-white hover:border-pink-500/50 transition-colors cursor-pointer"
              >
                {step > 0 ? `+${step}` : step}
              </button>
            ))}
          </div>
        </form>
      ) : (
        /* Victory Screen */
        <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-1.5 animate-in zoom-in-95 duration-200">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto" />
          <h4 className="font-bold text-white text-sm">Congratulations!</h4>
          <p className="text-xs text-emerald-300 font-mono">
            You solved the code in {history.length} {history.length === 1 ? 'attempt' : 'attempts'}!
          </p>
        </div>
      )}

      {/* Attempts History Log */}
      {history.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>RECENT GUESSES ({history.length})</span>
            <span>HINTS</span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            {history.map((record, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-mono border transition-all ${
                  record.hint === 'correct'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                    : record.hint === 'higher'
                    ? 'bg-cyan-950/25 border-cyan-800/40 text-cyan-300'
                    : 'bg-pink-950/25 border-pink-800/40 text-pink-300'
                }`}
              >
                <span className="font-bold flex items-center gap-1.5">
                  <span className="text-slate-500 text-[10px]">#{history.length - index}</span>
                  <span>Guess: {record.guess}</span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-[11px]">
                  {record.hint === 'higher' && <ArrowUp className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />}
                  {record.hint === 'lower' && <ArrowDown className="w-3.5 h-3.5 text-pink-400 animate-bounce" />}
                  {record.hint === 'correct' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{record.message}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restart Button */}
      <div className="flex items-center justify-center pt-1">
        <button
          id="numguess-restart-btn"
          onClick={handleRestart}
          className="px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Secret Code</span>
        </button>
      </div>
    </div>
  );
};
