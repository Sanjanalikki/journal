import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, X, Heart } from "lucide-react";

interface BoxBreathingWidgetProps {
  onClose?: () => void;
}

type BreathPhase = "Inhale" | "Hold" | "Exhale" | "Pause";

export const BoxBreathingWidget: React.FC<BoxBreathingWidgetProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(true);
  const [seconds, setSeconds] = useState(4);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  const phases: { name: BreathPhase; instruction: string }[] = [
    { name: "Inhale", instruction: "Breathe in slowly through your nose..." },
    { name: "Hold", instruction: "Gently hold your breath in stillness..." },
    { name: "Exhale", instruction: "Slowly release all tension through your mouth..." },
    { name: "Pause", instruction: "Rest in quiet awareness before the next breath..." },
  ];

  const currentPhase = phases[phaseIndex];

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setPhaseIndex((pIndex) => {
            const next = (pIndex + 1) % 4;
            if (next === 0) {
              setCyclesCompleted((c) => c + 1);
            }
            return next;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const handleReset = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setSeconds(4);
    setCyclesCompleted(0);
  };

  return (
    <div className="bg-[#0D1424]/95 backdrop-blur-md border border-[#1E2B45] rounded-2xl p-6 shadow-xl max-w-md w-full mx-auto my-3 text-center">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-[#91A8C7]">
          <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8A99B5]">
            Quiet Grounding Exercise
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#8A99B5] hover:text-[#F0F2F7] p-1 rounded-lg transition-colors"
            title="Close grounding"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Visual Pulsing Breathing Ring */}
      <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ease-in-out ${
            currentPhase.name === "Inhale"
              ? "scale-105 border-[#7887C7] shadow-[0_0_20px_rgba(120,135,199,0.4)] opacity-100"
              : currentPhase.name === "Hold"
              ? "scale-105 border-[#9A91C9] shadow-[0_0_20px_rgba(154,145,201,0.4)] opacity-95"
              : currentPhase.name === "Exhale"
              ? "scale-90 border-[#91A8C7]/60 opacity-80"
              : "scale-90 border-[#1E2B45] opacity-60"
          }`}
        />
        <div className="flex flex-col items-center justify-center z-10">
          <span className="text-4xl font-serif-display font-semibold text-[#F0F2F7]">
            {seconds}s
          </span>
          <span className="text-xs font-medium tracking-widest uppercase mt-1 text-[#91A8C7]">
            {currentPhase.name}
          </span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#8A99B5] mb-5 min-h-[38px] flex items-center justify-center px-4 font-light">
        {currentPhase.instruction}
      </p>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#7887C7] hover:bg-[#8696d7] text-white rounded-full text-xs font-medium transition-colors"
        >
          {isActive ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Resume</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="p-1.5 text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-full transition-colors"
          title="Reset counter"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs text-[#8A99B5] pl-2">
          Cycles: {cyclesCompleted}
        </span>
      </div>
    </div>
  );
};
