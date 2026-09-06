import React, { useState } from "react";
import { Sparkles, Plus, Compass } from "lucide-react";

interface WordGardenItem {
  id: string;
  word: string;
  reflection: string;
  category: "peace" | "strength" | "mind";
}

const DEFAULT_GARDEN: WordGardenItem[] = [
  {
    id: "calm",
    word: "Calm",
    reflection: "Peace is not the absence of trouble, but the presence of stillness within your center.",
    category: "peace",
  },
  {
    id: "gratitude",
    word: "Gratitude",
    reflection: "Notice the quiet gifts that held you up today — a warm breath, a kind word, the restful night.",
    category: "peace",
  },
  {
    id: "hope",
    word: "Hope",
    reflection: "Even in the darkest sky, the moon reminds us that light returns in quiet, steady phases.",
    category: "peace",
  },
  {
    id: "clarity",
    word: "Clarity",
    reflection: "You do not have to solve everything tonight. Rest allows the sediment to settle naturally.",
    category: "mind",
  },
  {
    id: "patience",
    word: "Patience",
    reflection: "All meaningful growth unfolds in quiet intervals that cannot be rushed by the clock.",
    category: "mind",
  },
  {
    id: "courage",
    word: "Courage",
    reflection: "It takes quiet courage simply to pause, feel your emotions, and speak your truth to the page.",
    category: "strength",
  },
  {
    id: "stillness",
    word: "Stillness",
    reflection: "In stillness, you put down the burden of striving and return home to yourself.",
    category: "peace",
  },
  {
    id: "compassion",
    word: "Compassion",
    reflection: "Offer your tired spirit the same gentle kindness you would grant to someone you cherish.",
    category: "strength",
  },
  {
    id: "release",
    word: "Release",
    reflection: "You have permission to gently put down the weight you carried through the day.",
    category: "mind",
  },
  {
    id: "acceptance",
    word: "Acceptance",
    reflection: "Everything that happened today has finished. In this quiet hour, you can simply rest.",
    category: "strength",
  },
];

export const WordGardenActivity: React.FC = () => {
  const [garden, setGarden] = useState<WordGardenItem[]>(DEFAULT_GARDEN);
  const [selectedWord, setSelectedWord] = useState<WordGardenItem>(DEFAULT_GARDEN[0]);
  const [customWordInput, setCustomWordInput] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);

  const handlePlantWord = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customWordInput.trim();
    if (!trimmed) return;

    const newItem: WordGardenItem = {
      id: `custom_${Date.now()}`,
      word: trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(),
      reflection: `Hold ${trimmed} gently in your awareness. Let it guide your quiet reflections tonight.`,
      category: "peace",
    };

    setGarden((prev) => [newItem, ...prev]);
    setSelectedWord(newItem);
    setCustomWordInput("");
    setShowInput(false);
  };

  return (
    <div className="flex flex-col items-center justify-between max-w-xl w-full mx-auto h-[480px] sm:h-[520px] p-4 text-center select-none space-y-4">
      {/* Header instructions */}
      <div className="space-y-1 shrink-0">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0D1424] border border-[#1E2B45] text-xs text-[#91A8C7]">
          <Compass className="w-3.5 h-3.5 text-[#7887C7]" />
          <span>Nocturnal Word Garden</span>
        </div>
        <p className="text-xs text-[#8A99B5]">
          Tap a word of intention to contemplate its quiet message.
        </p>
      </div>

      {/* Word Constellation Grid */}
      <div className="w-full flex-1 max-h-[220px] overflow-y-auto p-2 bg-[#0B111F] border border-[#1E2B45] rounded-2xl flex flex-wrap items-center justify-center gap-2 content-center no-scrollbar">
        {garden.map((item) => {
          const isSelected = selectedWord.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedWord(item)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif-display font-medium transition-all duration-300 transform active:scale-95 ${
                isSelected
                  ? "bg-[#7887C7] text-white shadow-[0_0_18px_rgba(120,135,199,0.5)] scale-105 border border-[#91A8C7]"
                  : "bg-[#121B2D] text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] border border-[#1E2B45] hover:border-[#7887C7]/40"
              }`}
            >
              {item.word}
            </button>
          );
        })}

        {/* Add intention button */}
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="px-3 py-1.5 rounded-full text-xs font-serif-display font-medium text-[#7887C7] hover:text-white bg-[#18243A]/50 hover:bg-[#18243A] border border-[#7887C7]/30 flex items-center space-x-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Plant word</span>
          </button>
        ) : (
          <form onSubmit={handlePlantWord} className="flex items-center space-x-1">
            <input
              type="text"
              value={customWordInput}
              onChange={(e) => setCustomWordInput(e.target.value)}
              placeholder="Your word..."
              autoFocus
              maxLength={20}
              className="px-3 py-1 bg-[#18243A] border border-[#7887C7] rounded-full text-xs text-[#F0F2F7] focus:outline-none placeholder:text-[#8A99B5]"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#7887C7] text-white rounded-full text-xs font-medium"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowInput(false)}
              className="text-xs text-[#8A99B5] hover:text-white px-1"
            >
              ✕
            </button>
          </form>
        )}
      </div>

      {/* Featured Blooming Card */}
      <div className="shrink-0 w-full p-5 rounded-2xl bg-[#0D1424] border border-[#7887C7]/30 shadow-md space-y-2 text-center transition-all duration-300">
        <div className="flex items-center justify-center space-x-1.5 text-xs text-[#91A8C7]">
          <Sparkles className="w-3.5 h-3.5 text-[#7887C7]" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Meditation on {selectedWord.word}
          </span>
        </div>

        <p className="text-sm sm:text-base font-serif-display text-[#F0F2F7] italic leading-relaxed max-w-md mx-auto">
          “{selectedWord.reflection}”
        </p>

        <p className="text-[11px] text-[#8A99B5] pt-1">
          Take three slow, gentle breaths while holding this thought.
        </p>
      </div>
    </div>
  );
};
