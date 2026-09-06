import React, { useState } from "react";
import { Sparkles, Plus, RotateCcw } from "lucide-react";

interface Pebble {
  id: string;
  text: string;
  x: number; // percentage in pond
  y: number;
  shade: string;
}

const QUICK_PROMPTS = [
  "A quiet breath",
  "Warm cup of tea",
  "A kind word received",
  "The peaceful night",
  "Comfortable bed",
  "Fresh air outside",
  "A good memory",
];

const PEBBLE_SHADES = [
  "from-[#1E2B45] to-[#121B2D] border-[#7887C7]/40 text-[#91A8C7]",
  "from-[#18243A] to-[#0D1424] border-[#9A91C9]/40 text-[#B5ADC8]",
  "from-[#223352] to-[#162136] border-[#7887C7]/50 text-[#F0F2F7]",
  "from-[#1A2E40] to-[#101D2A] border-[#3D6B8C]/50 text-[#85B5CF]",
];

export const GratitudePebblesActivity: React.FC = () => {
  const [pebbles, setPebbles] = useState<Pebble[]>([
    {
      id: "init_1",
      text: "A quiet breath",
      x: 35,
      y: 45,
      shade: PEBBLE_SHADES[0],
    },
    {
      id: "init_2",
      text: "The calm night",
      x: 62,
      y: 55,
      shade: PEBBLE_SHADES[2],
    },
  ]);
  const [inputText, setInputText] = useState<string>("");

  const handleAddPebble = (textToAdd: string) => {
    const trimmed = textToAdd.trim();
    if (!trimmed) return;

    const shade = PEBBLE_SHADES[pebbles.length % PEBBLE_SHADES.length];
    // Random calm placement in the pond
    const x = 20 + Math.random() * 60;
    const y = 25 + Math.random() * 50;

    const newPebble: Pebble = {
      id: `pebble_${Date.now()}`,
      text: trimmed,
      x,
      y,
      shade,
    };

    setPebbles((prev) => [...prev.slice(-7), newPebble]);
    setInputText("");
  };

  const handleClear = () => {
    setPebbles([]);
  };

  return (
    <div className="flex flex-col items-center justify-between max-w-xl w-full mx-auto h-[480px] sm:h-[520px] p-4 text-center select-none space-y-3">
      {/* Header */}
      <div className="space-y-1 shrink-0">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0D1424] border border-[#1E2B45] text-xs text-[#91A8C7]">
          <Sparkles className="w-3.5 h-3.5 text-[#7887C7]" />
          <span>Pebbles of Gratitude</span>
        </div>
        <p className="text-xs text-[#8A99B5]">
          Place a small stone in the moonlit pool for each thing you are thankful for.
        </p>
      </div>

      {/* Moonlit Pond Surface */}
      <div className="relative w-full flex-1 max-h-[260px] rounded-2xl bg-[#080E1A] border border-[#1E2B45] overflow-hidden shadow-inner flex items-center justify-center">
        {/* Soft water ripples background */}
        <div className="absolute inset-0 bg-[radial-gradient(#18243A_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-30" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0D1424]/80 to-transparent pointer-events-none" />

        {/* Empty state */}
        {pebbles.length === 0 && (
          <p className="text-xs text-[#8A99B5] font-serif-display italic z-0">
            The water is calm and waiting. Place your first gratitude pebble below.
          </p>
        )}

        {/* Placed Pebbles */}
        {pebbles.map((pebble) => (
          <div
            key={pebble.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-gradient-to-b ${pebble.shade} border shadow-lg text-xs font-serif-display transition-all duration-700 ease-out animate-in fade-in zoom-in-95 cursor-default hover:scale-105`}
            style={{
              left: `${pebble.x}%`,
              top: `${pebble.y}%`,
            }}
          >
            <span>{pebble.text}</span>
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center space-x-1.5 overflow-x-auto w-full py-1 no-scrollbar text-xs shrink-0">
        <span className="text-[11px] text-[#8A99B5] shrink-0 pr-1">Prompts:</span>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleAddPebble(prompt)}
            className="px-2.5 py-1 rounded-full bg-[#121B2D] hover:bg-[#18243A] text-[#8A99B5] hover:text-[#F0F2F7] border border-[#1E2B45] shrink-0 text-[11px] transition-colors"
          >
            + {prompt}
          </button>
        ))}
      </div>

      {/* Custom input & controls */}
      <div className="shrink-0 w-full space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddPebble(inputText);
          }}
          className="flex items-center space-x-2 w-full max-w-md mx-auto"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Something I appreciate tonight..."
            maxLength={40}
            className="flex-1 px-4 py-2 bg-[#121B2D] border border-[#1E2B45] focus:border-[#7887C7] rounded-xl text-xs text-[#F0F2F7] placeholder:text-[#8A99B5] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-[#7887C7] disabled:opacity-40 hover:bg-[#8696d7] text-white rounded-xl text-xs font-medium transition-colors flex items-center space-x-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Place Stone</span>
          </button>
        </form>

        {pebbles.length > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex items-center space-x-1 text-[11px] text-[#8A99B5] hover:text-[#F0F2F7] transition-colors pt-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear pond</span>
          </button>
        )}
      </div>
    </div>
  );
};
