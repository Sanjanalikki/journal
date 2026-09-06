import React, { useState, useEffect, useRef } from "react";
import { Sparkles, RotateCcw } from "lucide-react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const MINDFUL_WHISPERS = [
  "You are here in this quiet moment.",
  "Notice your breath flowing gently.",
  "Soften your shoulders and jaw.",
  "There is nothing you need to rush right now.",
  "Let your thoughts drift like clouds.",
  "Stillness is already inside you.",
  "In this quiet breath, you are safe.",
  "Rest your mind. The day is behind you.",
  "Anchor your attention in the gentle now.",
  "Peace begins with a single soft breath.",
];

export const MindfulTapActivity: React.FC = () => {
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [tapCount, setTapCount] = useState<number>(0);
  const [currentWhisper, setCurrentWhisper] = useState<string>(
    "Gently tap the glowing moonlight dot whenever you feel ready."
  );
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Slowly and organically move the target every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTargetPos({
        x: 20 + Math.random() * 60, // 20% to 80%
        y: 20 + Math.random() * 60, // 20% to 80%
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setRipples((prev) => [
        ...prev.slice(-4),
        { id: now, x: clientX - rect.left, y: clientY - rect.top },
      ]);
    }

    setTapCount((prev) => prev + 1);
    const nextWhisper = MINDFUL_WHISPERS[tapCount % MINDFUL_WHISPERS.length];
    setCurrentWhisper(nextWhisper);

    // Gently glide target to a new peaceful spot on tap
    setTargetPos({
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
    });
  };

  const handleReset = () => {
    setTapCount(0);
    setCurrentWhisper("Gently tap the glowing moonlight dot whenever you feel ready.");
    setRipples([]);
    setTargetPos({ x: 50, y: 50 });
  };

  return (
    <div className="flex flex-col items-center justify-between max-w-xl w-full mx-auto h-[480px] sm:h-[520px] p-4 text-center select-none">
      {/* Top Status */}
      <div className="space-y-1.5 shrink-0">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0D1424] border border-[#1E2B45] text-xs text-[#91A8C7]">
          <Sparkles className="w-3.5 h-3.5 text-[#7887C7]" />
          <span>Present Moments: {tapCount}</span>
        </div>
        <p className="text-xs text-[#8A99B5]">
          No rush or score. Gently focus your eyes and touch the starlight.
        </p>
      </div>

      {/* Interactive Starlight Pond / Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full flex-1 max-h-[340px] my-3 rounded-2xl bg-[#0B111F] border border-[#1E2B45] overflow-hidden cursor-pointer"
        onClick={handleTap}
      >
        {/* Ambient background stars */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E2B45_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Visual Expanding Ripples */}
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute rounded-full border border-[#7887C7]/50 pointer-events-none animate-ping"
            style={{
              left: `${ripple.x - 24}px`,
              top: `${ripple.y - 24}px`,
              width: "48px",
              height: "48px",
              animationDuration: "1.2s",
            }}
          />
        ))}

        {/* Floating Moonlight Target Dot */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{
            left: `${targetPos.x}%`,
            top: `${targetPos.y}%`,
          }}
        >
          <div className="relative flex items-center justify-center w-14 h-14">
            {/* Soft glowing aura */}
            <div className="absolute inset-0 rounded-full bg-[#7887C7]/30 blur-md animate-pulse" />
            <div className="absolute w-8 h-8 rounded-full bg-[#9A91C9]/50 animate-ping opacity-60 duration-1000" />
            {/* Core luminous star */}
            <div className="relative w-5 h-5 rounded-full bg-[#F0F2F7] border-2 border-[#7887C7] shadow-[0_0_16px_rgba(240,242,247,0.8)]" />
          </div>
        </div>
      </div>

      {/* Bottom Mindful Whisper & Reset */}
      <div className="shrink-0 space-y-3 w-full px-2">
        <div className="min-h-[44px] flex items-center justify-center">
          <p className="text-sm sm:text-base font-serif-display text-[#F0F2F7] italic">
            “{currentWhisper}”
          </p>
        </div>

        {tapCount > 0 && (
          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-xl border border-[#1E2B45] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset session</span>
          </button>
        )}
      </div>
    </div>
  );
};
