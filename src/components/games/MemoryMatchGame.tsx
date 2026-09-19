import React, { useState, useEffect } from 'react';
import { RotateCcw, Info, Trophy, Sparkles, Brain, Clock, Award, Star } from 'lucide-react';

interface CardItem {
  id: number;
  pairId: number;
  icon: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const symbols = [
  { icon: '👾', name: 'Alien Glitch' },
  { icon: '🚀', name: 'Cyber Rocket' },
  { icon: '⚡', name: 'Neon Bolt' },
  { icon: '🔮', name: 'Crystal Orb' },
  { icon: '💎', name: 'Cyber Gem' },
  { icon: '👑', name: 'VIP Crown' },
];

export const MemoryMatchGame: React.FC = () => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Initialize and shuffle deck
  const initializeDeck = () => {
    const deck: CardItem[] = [];
    let idCounter = 0;

    symbols.forEach((symbol, pairIdx) => {
      // Create 2 cards per symbol
      deck.push({
        id: idCounter++,
        pairId: pairIdx,
        icon: symbol.icon,
        name: symbol.name,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: idCounter++,
        pairId: pairIdx,
        icon: symbol.icon,
        name: symbol.name,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck with Fisher-Yates
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIds([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setIsGameActive(false);
    setIsCompleted(false);
  };

  useEffect(() => {
    initializeDeck();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (isGameActive && !isCompleted) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive, isCompleted]);

  const handleCardClick = (cardId: number) => {
    if (!isGameActive && !isCompleted) {
      setIsGameActive(true);
    }

    // Guard: already 2 flipped, or card already flipped/matched
    if (flippedIds.length === 2) return;
    const clickedCard = cards.find((c) => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip the card
    const nextCards = cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c));
    setCards(nextCards);

    const nextFlippedIds = [...flippedIds, cardId];
    setFlippedIds(nextFlippedIds);

    // If 2 cards are now flipped, compare them
    if (nextFlippedIds.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = nextFlippedIds;
      const card1 = nextCards.find((c) => c.id === firstId);
      const card2 = nextCards.find((c) => c.id === secondId);

      if (card1 && card2 && card1.pairId === card2.pairId) {
        // MATCH!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c))
          );
          setFlippedIds([]);
          setMatches((prevMatches) => {
            const updated = prevMatches + 1;
            if (updated === symbols.length) {
              setIsCompleted(true);
              setIsGameActive(false);
            }
            return updated;
          });
        }, 350);
      } else {
        // NO MATCH -> unflip after short delay
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c))
          );
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-b from-[#180f33] to-[#0c081e] border border-purple-800/50 shadow-[0_0_25px_rgba(168,85,247,0.15)] space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
              <span>Memory Match</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">12 TILES</span>
            </h3>
            <p className="text-[11px] text-slate-400">Find and match all cyber pairs in minimum moves</p>
          </div>
        </div>

        {/* Instructions button */}
        <button
          id="memory-instructions-toggle-btn"
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
          <h4 className="font-bold text-purple-300 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Game Instructions
          </h4>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
            <li>Tap any card to reveal its cyber symbol.</li>
            <li>Tap a second card. If both match, they stay unlocked with a neon glow!</li>
            <li>If they don't match, they flip back face down. Remember their spots!</li>
            <li>Clear all 6 pairs in the fewest moves to achieve a 3-star rating.</li>
          </ul>
        </div>
      )}

      {/* Status & Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
        <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-800/40">
          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> TIME
          </span>
          <p className="text-base font-bold text-cyan-400 mt-0.5">{formatTime(timer)}</p>
        </div>
        <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-800/40">
          <span className="text-[10px] text-slate-400">MOVES</span>
          <p className="text-base font-bold text-pink-400 mt-0.5">{moves}</p>
        </div>
        <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-800/40">
          <span className="text-[10px] text-slate-400">PAIRS</span>
          <p className="text-base font-bold text-emerald-400 mt-0.5">
            {matches} / {symbols.length}
          </p>
        </div>
      </div>

      {/* 4x3 Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5 max-w-[320px] mx-auto p-2.5 bg-[#090518] rounded-2xl border border-purple-800/40 shadow-inner">
        {cards.map((card) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              id={`memory-card-${card.id}`}
              onClick={() => handleCardClick(card.id)}
              disabled={isRevealed}
              className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all duration-300 transform cursor-pointer select-none ${
                card.isMatched
                  ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 border-2 border-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-95'
                  : card.isFlipped
                  ? 'bg-gradient-to-tr from-purple-600 to-pink-600 border-2 border-pink-400 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)] rotate-y-180 scale-100'
                  : 'bg-[#150d2b] border border-purple-800/50 hover:border-pink-500/60 hover:bg-purple-900/40 active:scale-95 text-slate-600'
              }`}
            >
              {isRevealed ? (
                <span className="animate-in zoom-in-75 duration-200">{card.icon}</span>
              ) : (
                <span className="text-xs font-mono font-bold text-purple-400/70">✦</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Celebration Overlay Banner */}
      {isCompleted && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-purple-950/80 to-pink-950/80 border border-emerald-500/50 text-center space-y-1.5 animate-in zoom-in-95 duration-200">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto animate-bounce" />
          <h4 className="font-display font-bold text-base text-white">Matrix Cleared! 🎉</h4>
          <p className="text-xs text-emerald-300 font-mono">
            Solved in {moves} moves & {formatTime(timer)}!
          </p>
          <div className="flex justify-center gap-1 pt-1">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  moves <= 10 || (moves <= 15 && star <= 2) || star === 1
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Restart Button */}
      <div className="flex items-center justify-center pt-1">
        <button
          id="memory-restart-btn"
          onClick={initializeDeck}
          className="px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart & Shuffle</span>
        </button>
      </div>
    </div>
  );
};
