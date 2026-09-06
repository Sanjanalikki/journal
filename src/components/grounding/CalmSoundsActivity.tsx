import React, { useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, CloudRain, Trees, Waves } from "lucide-react";
import { ambientAudio } from "../../utils/ambientAudio";

type SoundType = "rain" | "breeze" | "ocean";

export const CalmSoundsActivity: React.FC = () => {
  const [selectedSound, setSelectedSound] = useState<SoundType>("rain");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);

  const soundOptions: {
    id: SoundType;
    name: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      id: "rain",
      name: "Midnight Rain",
      description: "Soft, tranquil rain falling against a quiet window",
      icon: CloudRain,
    },
    {
      id: "breeze",
      name: "Night Breeze",
      description: "Gentle rustle of twilight woodland winds",
      icon: Trees,
    },
    {
      id: "ocean",
      name: "Deep Ocean",
      description: "Slow, rhythmic moonlight waves ebbing on the shore",
      icon: Waves,
    },
  ];

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      ambientAudio.stop();
      setIsPlaying(false);
    } else {
      ambientAudio.play(selectedSound, volume);
      setIsPlaying(true);
    }
  };

  const handleSelectSound = (type: SoundType) => {
    setSelectedSound(type);
    if (isPlaying) {
      ambientAudio.play(type, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientAudio.setVolume(newVol);
  };

  return (
    <div className="flex flex-col items-center justify-between max-w-xl w-full mx-auto h-[480px] sm:h-[520px] p-4 text-center select-none space-y-4">
      {/* Header */}
      <div className="space-y-1 shrink-0">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0D1424] border border-[#1E2B45] text-xs text-[#91A8C7]">
          <Volume2 className="w-3.5 h-3.5 text-[#7887C7]" />
          <span>Ambient Nocturnal Soundscapes</span>
        </div>
        <p className="text-xs text-[#8A99B5]">
          Synthesized gentle soundscapes. No downloads or autoplay.
        </p>
      </div>

      {/* Sound selector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full my-auto">
        {soundOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedSound === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectSound(opt.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-[#18243A] border-[#7887C7] shadow-md ring-1 ring-[#7887C7]/50"
                  : "bg-[#121B2D] border-[#1E2B45] hover:border-[#7887C7]/30 hover:bg-[#18243A]/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? "bg-[#7887C7] text-white"
                      : "bg-[#18243A] text-[#91A8C7]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && isPlaying && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7887C7] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7887C7]" />
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-serif-display font-semibold text-sm text-[#F0F2F7]">
                  {opt.name}
                </h4>
                <p className="text-[11px] text-[#8A99B5] line-clamp-2 mt-0.5 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Primary Play/Pause and Volume Controls */}
      <div className="shrink-0 w-full max-w-sm p-4 rounded-2xl bg-[#0D1424] border border-[#1E2B45] space-y-4">
        <div className="flex items-center justify-center">
          <button
            onClick={handleTogglePlay}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-md active:scale-95 ${
              isPlaying
                ? "bg-[#18243A] text-[#F0F2F7] border border-[#7887C7]/40 hover:bg-[#20304c]"
                : "bg-[#7887C7] hover:bg-[#8696d7] text-white"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 text-[#91A8C7]" />
                <span>Pause Ambient Sound</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Play {soundOptions.find((s) => s.id === selectedSound)?.name}</span>
              </>
            )}
          </button>
        </div>

        {/* Volume slider */}
        <div className="flex items-center space-x-3 px-2">
          {volume === 0 ? (
            <VolumeX className="w-4 h-4 text-[#8A99B5] shrink-0" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#91A8C7] shrink-0" />
          )}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-[#7887C7] bg-[#18243A] h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[11px] text-[#8A99B5] w-8 text-right font-mono">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
