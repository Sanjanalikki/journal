import React, { useState, useEffect } from "react";
import {
  X,
  ArrowLeft,
  Wind,
  Sparkles,
  Waves,
  Flower2,
  Gem,
  Volume2,
  Heart,
  Puzzle,
} from "lucide-react";
import { BreathingSpaceActivity } from "./BreathingSpaceActivity";
import { MindfulTapActivity } from "./MindfulTapActivity";
import { ColorFlowActivity } from "./ColorFlowActivity";
import { WordGardenActivity } from "./WordGardenActivity";
import { GratitudePebblesActivity } from "./GratitudePebblesActivity";
import { CalmSoundsActivity } from "./CalmSoundsActivity";
import { PuzzlePauseActivity } from "./PuzzlePauseActivity";
import { ambientAudio } from "../../utils/ambientAudio";

export type GroundingActivityId =
  | "breathing"
  | "mindful-tap"
  | "color-flow"
  | "word-garden"
  | "gratitude-pebbles"
  | "calm-sounds"
  | "puzzle-pause";

interface GroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialActivity?: GroundingActivityId | null;
}

interface ActivityConfig {
  id: GroundingActivityId;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge: string;
}

const ACTIVITIES: ActivityConfig[] = [
  {
    id: "breathing",
    title: "Breathing Space",
    subtitle: "Guided box breathing in stillness · 1–5 min",
    icon: Wind,
    badge: "Breathwork",
  },
  {
    id: "mindful-tap",
    title: "Mindful Tap",
    subtitle: "A moment of focus & anchored presence",
    icon: Sparkles,
    badge: "Focus",
  },
  {
    id: "color-flow",
    title: "Color Flow",
    subtitle: "Slow visual nocturnal grounding current",
    icon: Waves,
    badge: "Visual Calm",
  },
  {
    id: "word-garden",
    title: "Word Garden",
    subtitle: "Explore a positive thought and intention",
    icon: Flower2,
    badge: "Reflection",
  },
  {
    id: "gratitude-pebbles",
    title: "Gratitude Pebbles",
    subtitle: "Quiet stones of appreciation in a moonlit pool",
    icon: Gem,
    badge: "Appreciation",
  },
  {
    id: "calm-sounds",
    title: "Calm Sounds",
    subtitle: "Ambient soothing rain, breeze, and ocean waves",
    icon: Volume2,
    badge: "Soundscapes",
  },
  {
    id: "puzzle-pause",
    title: "Puzzle Pause",
    subtitle: "Simple calming puzzle · Clear your mind with a gentle challenge",
    icon: Puzzle,
    badge: "Mindful Play",
  },
];

export const GroundingModal: React.FC<GroundingModalProps> = ({
  isOpen,
  onClose,
  initialActivity = null,
}) => {
  const [activeActivity, setActiveActivity] = useState<GroundingActivityId | null>(
    initialActivity
  );

  // Sync initialActivity if prop changes
  useEffect(() => {
    if (initialActivity) {
      setActiveActivity(initialActivity);
    }
  }, [initialActivity]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    ambientAudio.stop();
    setActiveActivity(null);
    onClose();
  };

  const handleBackToMenu = () => {
    ambientAudio.stop();
    setActiveActivity(null);
  };

  if (!isOpen) return null;

  const currentActivityConfig = ACTIVITIES.find((a) => a.id === activeActivity);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#080D18]/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0D1424] border border-[#1E2B45] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#F0F2F7] relative animate-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#1E2B45] bg-[#0D1424]/90 flex items-center justify-between shrink-0">
          {activeActivity ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToMenu}
                className="p-1.5 text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-xl transition-colors flex items-center space-x-1 text-xs font-medium"
                title="Back to grounding menu"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Grounding Menu</span>
              </button>
              <div className="h-4 w-px bg-[#1E2B45]" />
              <div className="flex items-center space-x-2">
                {currentActivityConfig && (
                  <>
                    <currentActivityConfig.icon className="w-4 h-4 text-[#7887C7]" />
                    <span className="font-serif-display font-semibold text-sm sm:text-base text-[#F0F2F7]">
                      {currentActivityConfig.title}
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#18243A] border border-[#7887C7]/30 flex items-center justify-center text-rose-400">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif-display font-bold text-base sm:text-lg text-[#F0F2F7] tracking-tight">
                  Grounding Space
                </h2>
                <p className="text-xs text-[#8A99B5]">Take a small pause.</p>
              </div>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={handleClose}
            className="p-2 text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-xl transition-colors"
            title="Close grounding modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Region */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Menu Selector Mode */}
          {!activeActivity && (
            <div className="space-y-5">
              <div className="space-y-1.5 px-1">
                <p className="text-xs uppercase tracking-widest text-[#91A8C7] font-semibold">
                  Restore quiet balance
                </p>
                <p className="text-xs sm:text-sm text-[#8A99B5] leading-relaxed">
                  Choose a gentle activity to ease your mind, anchor your senses, and return softly to the present moment.
                </p>
              </div>

              {/* Activity Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {ACTIVITIES.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={() => setActiveActivity(act.id)}
                      className="p-4 rounded-2xl bg-[#121B2D] hover:bg-[#18243A] border border-[#1E2B45] hover:border-[#7887C7]/50 text-left transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#18243A] group-hover:bg-[#20304c] border border-[#1E2B45] flex items-center justify-center text-[#91A8C7] group-hover:text-[#F0F2F7] transition-colors">
                          <Icon className="w-5 h-5 text-[#7887C7]" />
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#18243A] text-[#91A8C7] border border-[#1E2B45]">
                          {act.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-serif-display font-semibold text-sm sm:text-base text-[#F0F2F7] group-hover:text-[#91A8C7] transition-colors">
                          {act.title}
                        </h3>
                        <p className="text-xs text-[#8A99B5] leading-relaxed">
                          {act.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Calming footer note */}
              <div className="pt-2 text-center text-xs text-[#8A99B5]/80 font-serif-display italic">
                “Peace is not somewhere else. It is right here within this breath.”
              </div>
            </div>
          )}

          {/* Active Activity Views */}
          {activeActivity === "breathing" && <BreathingSpaceActivity />}
          {activeActivity === "mindful-tap" && <MindfulTapActivity />}
          {activeActivity === "color-flow" && <ColorFlowActivity />}
          {activeActivity === "word-garden" && <WordGardenActivity />}
          {activeActivity === "gratitude-pebbles" && <GratitudePebblesActivity />}
          {activeActivity === "calm-sounds" && <CalmSoundsActivity />}
          {activeActivity === "puzzle-pause" && <PuzzlePauseActivity />}
        </div>
      </div>
    </div>
  );
};
