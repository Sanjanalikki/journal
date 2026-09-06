import React, { useState, useEffect } from "react";
import { Puzzle, RefreshCw, Sparkles, Check, Info } from "lucide-react";

interface Tile {
  id: number;
  label: string;
  symbol: string;
}

const CELESTIAL_TILES: Tile[] = [
  { id: 1, label: "Crescent", symbol: "☽" },
  { id: 2, label: "Starlight", symbol: "✦" },
  { id: 3, label: "Aurora", symbol: "✺" },
  { id: 4, label: "Lotus", symbol: "✿" },
  { id: 5, label: "Zenith", symbol: "✧" },
  { id: 6, label: "Dewdrop", symbol: "◈" },
  { id: 7, label: "Ripple", symbol: "≈" },
  { id: 8, label: "Harmonics", symbol: "❋" },
  { id: 0, label: "Stillness", symbol: "" }, // 0 represents the empty space
];

export const PuzzlePauseActivity: React.FC = () => {
  // Grid of 9 positions (3x3), holding tile IDs 0..8
  const [board, setBoard] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Check if solved (1, 2, 3, 4, 5, 6, 7, 8, 0)
  const checkSolved = (currentBoard: number[]) => {
    for (let i = 0; i < 8; i++) {
      if (currentBoard[i] !== i + 1) return false;
    }
    return currentBoard[8] === 0;
  };

  // Gentle shuffle that ensures solvability by making random legal moves
  const shuffleBoard = () => {
    let current = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let emptyIdx = 8;
    const numMoves = 24; // gentle shuffle, easy to solve in under 1-2 minutes

    for (let i = 0; i < numMoves; i++) {
      const neighbors: number[] = [];
      const row = Math.floor(emptyIdx / 3);
      const col = emptyIdx % 3;

      if (row > 0) neighbors.push(emptyIdx - 3); // Up
      if (row < 2) neighbors.push(emptyIdx + 3); // Down
      if (col > 0) neighbors.push(emptyIdx - 1); // Left
      if (col < 2) neighbors.push(emptyIdx + 1); // Right

      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      current[emptyIdx] = current[randomNeighbor];
      current[randomNeighbor] = 0;
      emptyIdx = randomNeighbor;
    }

    setBoard([...current]);
    setMoves(0);
    setIsSolved(checkSolved(current));
  };

  const handleTileClick = (index: number) => {
    if (isSolved) return;
    const emptyIndex = board.indexOf(0);
    if (emptyIndex === -1) return;

    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    // Check if adjacent
    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newBoard = [...board];
      newBoard[emptyIndex] = newBoard[index];
      newBoard[index] = 0;
      setBoard(newBoard);
      setMoves((prev) => prev + 1);

      if (checkSolved(newBoard)) {
        setIsSolved(true);
      }
    }
  };

  const handleGentleSolve = () => {
    setBoard([1, 2, 3, 4, 5, 6, 7, 8, 0]);
    setIsSolved(true);
  };

  // Start with a gentle shuffle on initial mount
  useEffect(() => {
    shuffleBoard();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-5 py-2 max-w-md mx-auto">
      {/* Intro Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#18243A] text-[#91A8C7] border border-[#7887C7]/20 text-xs font-medium">
          <Puzzle className="w-3.5 h-3.5 text-[#7887C7]" />
          <span>Puzzle Pause</span>
        </div>
        <h3 className="text-lg font-serif-display font-medium text-[#F0F2F7]">
          Clear your mind with a gentle challenge
        </h3>
        <p className="text-xs text-[#8A99B5]">
          Slide the celestial symbols softly until each stone finds its peaceful place.
        </p>
      </div>

      {/* Solved Banner */}
      {isSolved && (
        <div className="w-full py-2.5 px-4 rounded-2xl bg-[#18243A] border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Harmony restored. Your mind is quiet and clear.</span>
          </div>
          <button
            onClick={shuffleBoard}
            className="text-[11px] underline text-[#91A8C7] hover:text-[#F0F2F7]"
          >
            Play again
          </button>
        </div>
      )}

      {/* 3x3 Puzzle Board */}
      <div className="p-3 rounded-3xl bg-[#121B2D] border border-[#1E2B45] shadow-xl">
        <div className="grid grid-cols-3 gap-2.5 w-64 h-64 sm:w-72 sm:h-72">
          {board.map((tileId, idx) => {
            const tile = CELESTIAL_TILES.find((t) => t.id === tileId);
            const isEmpty = tileId === 0;

            if (isEmpty) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="rounded-2xl border border-dashed border-[#1E2B45]/60 bg-[#080D18]/30 flex items-center justify-center transition-all"
                >
                  <span className="text-[10px] text-[#8A99B5]/30">empty</span>
                </div>
              );
            }

            const isCorrectPosition = tileId === idx + 1;

            return (
              <button
                key={tile?.id || idx}
                onClick={() => handleTileClick(idx)}
                className={`rounded-2xl p-2 flex flex-col items-center justify-center space-y-1 transition-all duration-200 select-none cursor-pointer active:scale-95 ${
                  isCorrectPosition
                    ? "bg-[#18243A] border border-[#7887C7]/40 text-[#F0F2F7] shadow-xs"
                    : "bg-[#0D1424] hover:bg-[#18243A] border border-[#1E2B45] text-[#91A8C7] hover:text-[#F0F2F7]"
                }`}
                title={tile?.label}
              >
                <span className="text-xl sm:text-2xl font-serif-display leading-none">
                  {tile?.symbol}
                </span>
                <span className="text-[10px] text-[#8A99B5] font-medium truncate max-w-full">
                  {tile?.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls & Calm Actions */}
      <div className="flex items-center space-x-3 text-xs">
        <button
          onClick={shuffleBoard}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#18243A] hover:bg-[#20304c] text-[#F0F2F7] border border-[#7887C7]/30 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#91A8C7]" />
          <span>Shuffle</span>
        </button>

        <button
          onClick={handleGentleSolve}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#121B2D] hover:bg-[#18243A] text-[#8A99B5] hover:text-[#F0F2F7] border border-[#1E2B45] transition-colors"
          title="Restore alignment instantly"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Restore Order</span>
        </button>

        <button
          onClick={() => setShowGuide((prev) => !prev)}
          className="p-2 rounded-xl bg-[#121B2D] hover:bg-[#18243A] text-[#8A99B5] hover:text-[#F0F2F7] border border-[#1E2B45] transition-colors"
          title="Toggle alignment guide"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Optional Alignment Guide */}
      {showGuide && (
        <div className="w-full p-3 rounded-2xl bg-[#0D1424] border border-[#1E2B45] text-xs text-[#8A99B5] space-y-1.5">
          <p className="font-medium text-[#F0F2F7]">Celestial Alignment Order:</p>
          <p className="text-[11px] leading-relaxed">
            Row 1: Crescent (☽), Starlight (✦), Aurora (✺)
            <br />
            Row 2: Lotus (✿), Zenith (✧), Dewdrop (◈)
            <br />
            Row 3: Ripple (≈), Harmonics (❋), Stillness (Void)
          </p>
        </div>
      )}

      {/* Gentle footer message */}
      <p className="text-[11px] text-[#8A99B5]/60 italic text-center">
        “A tranquil mind finds order in gentle steps.”
      </p>
    </div>
  );
};
