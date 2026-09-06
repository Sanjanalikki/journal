import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Wind } from "lucide-react";

interface BreathingSpaceProps {
  onFinishSession?: () => void;
}

type BreathPhase = "Inhale" | "Hold" | "Exhale" | "Pause";

export const BreathingSpaceActivity: React.FC<BreathingSpaceProps> = () => {
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(2);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [secondsRemainingInPhase, setSecondsRemainingInPhase] = useState<number>(4);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  const phases: { name: BreathPhase; instruction: string; scale: string; ringColor: string }[] = [
    {
      name: "Inhale",
      instruction: "Breathe in deeply and slowly through your nose...",
      scale: "scale-110",
      ringColor: "border-[#7887C7] shadow-[0_0_28px_rgba(120,135,199,0.45)]",
    },
    {
      name: "Hold",
      instruction: "Hold your breath softly in stillness...",
      scale: "scale-110",
      ringColor: "border-[#9A91C9] shadow-[0_0_28px_rgba(154,145,201,0.45)]",
    },
    {
      name: "Exhale",
      instruction: "Slowly release all tension through your mouth...",
      scale: "scale-90",
      ringColor: "border-[#91A8C7]/70 shadow-[0_0_15px_rgba(145,168,199,0.25)]",
    },
    {
      name: "Pause",
      instruction: "Rest in quiet awareness before the next breath...",
      scale: "scale-85",
      ringColor: "border-[#1E2B45] opacity-60",
    },
  ];

  const currentPhase = phases[phaseIndex];
  const targetTotalSeconds = targetDurationMinutes * 60;
  const isSessionComplete = elapsedSeconds >= targetTotalSeconds;

  useEffect(() => {
    if (!isActive || isSessionComplete) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      setSecondsRemainingInPhase((prev) => {
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
  }, [isActive, isSessionComplete]);

  const handleReset = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsRemainingInPhase(4);
    setElapsedSeconds(0);
    setCyclesCompleted(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg w-full mx-auto px-4 py-6 text-center space-y-6">
      {/* Session Length Selector */}
      <div className="flex items-center space-x-2 bg-[#0D1424] border border-[#1E2B45] p-1 rounded-xl text-xs">
        <span className="text-[#8A99B5] px-2 font-medium flex items-center space-x-1">
          <Wind className="w-3.5 h-3.5 text-[#7887C7]" />
          <span>Session:</span>
        </span>
        {[1, 2, 3, 5].map((mins) => (
          <button
            key={mins}
            onClick={() => {
              setTargetDurationMinutes(mins);
              handleReset();
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              targetDurationMinutes === mins
                ? "bg-[#7887C7] text-white"
                : "text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A]"
            }`}
          >
            {mins} min
          </button>
        ))}
      </div>

      {/* Breathing Ring */}
      <div className="relative w-52 h-52 sm:w-60 sm:h-60 mx-auto flex items-center justify-center my-2">
        {/* Ambient background glow */}
        <div
          className={`absolute inset-0 rounded-full transition-transform duration-1000 ease-in-out bg-radial from-[#7887C7]/15 to-transparent blur-xl ${
            isSessionComplete ? "scale-90 opacity-30" : currentPhase.scale
          }`}
        />

        {/* Outer Animated Border */}
        <div
          className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ease-in-out ${
            isSessionComplete
              ? "border-emerald-400/60 shadow-[0_0_20px_rgba(52,211,153,0.3)] scale-100"
              : `${currentPhase.scale} ${currentPhase.ringColor}`
          }`}
        />

        {/* Inner Counter & Phase */}
        <div className="flex flex-col items-center justify-center z-10 space-y-1">
          {isSessionComplete ? (
            <>
              <span className="text-3xl font-serif-display font-semibold text-emerald-300">
                Complete
              </span>
              <span className="text-xs text-[#8A99B5] max-w-[140px]">
                You took {cyclesCompleted} peaceful breaths
              </span>
            </>
          ) : (
            <>
              <span className="text-5xl font-serif-display font-semibold text-[#F0F2F7] tracking-tight">
                {secondsRemainingInPhase}s
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#91A8C7] pt-1">
                {currentPhase.name}
              </span>
              <span className="text-[11px] text-[#8A99B5]">
                Cycle {cyclesCompleted + 1}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Guidance Text */}
      <div className="min-h-[44px] flex items-center justify-center px-4">
        <p className="text-sm sm:text-base text-[#F0F2F7] font-serif-display font-medium italic">
          {isSessionComplete
            ? "“Notice the gentle calm resting in your chest. Return whenever you need.”"
            : `“${currentPhase.instruction}”`}
        </p>
      </div>

      {/* Progress & Controls */}
      <div className="space-y-3 w-full max-w-xs">
        {/* Progress Bar */}
        <div className="w-full bg-[#18243A] h-1.5 rounded-full overflow-hidden border border-[#1E2B45]">
          <div
            className="bg-[#7887C7] h-full transition-all duration-300 ease-linear rounded-full"
            style={{
              width: `${Math.min(100, (elapsedSeconds / targetTotalSeconds) * 100)}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#8A99B5] px-1">
          <span>{formatTime(elapsedSeconds)}</span>
          <span>{formatTime(targetTotalSeconds)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3 pt-1">
          {!isSessionComplete ? (
            <button
              onClick={() => setIsActive(!isActive)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#7887C7] hover:bg-[#8696d7] text-white rounded-xl text-xs font-medium shadow-sm transition-all active:scale-95"
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Resume</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#7887C7] hover:bg-[#8696d7] text-white rounded-xl text-xs font-medium shadow-sm transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Begin Again</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-2.5 text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-xl border border-[#1E2B45] transition-colors"
            title="Reset exercise"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
