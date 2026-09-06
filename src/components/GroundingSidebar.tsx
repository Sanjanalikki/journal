import React from "react";
import {
  Wind,
  Sparkles,
  Waves,
  Flower2,
  Gem,
  Volume2,
  Puzzle,
  ChevronRight,
  X,
  Heart,
} from "lucide-react";
import type { GroundingActivityId } from "./grounding/GroundingModal";

interface GroundingSidebarProps {
  onSelectActivity: (id: GroundingActivityId) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface GroundingItem {
  id: GroundingActivityId;
  title: string;
  badge: string;
  tagline: string;
  icon: React.ElementType;
}

const GROUNDING_ITEMS: GroundingItem[] = [
  {
    id: "breathing",
    title: "Breathing Space",
    badge: "Guided breathing · 1–5 min",
    tagline: "Slow down. Be present.",
    icon: Wind,
  },
  {
    id: "mindful-tap",
    title: "Mindful Tap",
    badge: "A moment of focus",
    tagline: "Simple, calming interaction.",
    icon: Sparkles,
  },
  {
    id: "color-flow",
    title: "Color Flow",
    badge: "Soothing visual experience",
    tagline: "Let the colors guide your mind.",
    icon: Waves,
  },
  {
    id: "word-garden",
    title: "Word Garden",
    badge: "Positive words and reflection",
    tagline: "Discover and reflect on gentle words.",
    icon: Flower2,
  },
  {
    id: "gratitude-pebbles",
    title: "Gratitude Pebbles",
    badge: "Gratitude interaction",
    tagline: "A small moment of appreciation.",
    icon: Gem,
  },
  {
    id: "calm-sounds",
    title: "Calm Sounds",
    badge: "Ambient sounds",
    tagline: "Rain, forest, ocean.",
    icon: Volume2,
  },
  {
    id: "puzzle-pause",
    title: "Puzzle Pause",
    badge: "Simple calming puzzle",
    tagline: "Clear your mind with a gentle challenge.",
    icon: Puzzle,
  },
];

export const GroundingSidebar: React.FC<GroundingSidebarProps> = ({
  onSelectActivity,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && onCloseMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#080D18]/80 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Grounding Right Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 right-0 w-80 xl:w-84 bg-[#0D1424] border-l border-[#1E2B45] z-40 lg:z-10 transition-transform duration-300 ease-in-out flex flex-col shrink-0 ${
          isOpenMobile ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2B45] bg-[#0D1424] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#18243A] border border-[#7887C7]/30 flex items-center justify-center text-rose-400 shadow-xs">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs uppercase font-bold tracking-wider text-[#F0F2F7]">
                  GROUNDING
                </h2>
                <p className="text-[11px] text-[#8A99B5]">
                  Take a small pause. Calm your mind.
                </p>
              </div>
            </div>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-xl transition-colors"
                title="Close Grounding panel"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Activities List (internal scroll only) */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {GROUNDING_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectActivity(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full text-left p-3 rounded-2xl bg-[#121B2D] hover:bg-[#18243A] border border-[#1E2B45] hover:border-[#7887C7]/40 transition-all duration-150 group flex items-center justify-between space-x-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7887C7]/30"
              >
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#18243A] group-hover:bg-[#20304c] border border-[#1E2B45] flex items-center justify-center text-[#7887C7] group-hover:text-[#91A8C7] shrink-0 transition-colors mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-serif-display font-medium text-[#F0F2F7] group-hover:text-[#91A8C7] transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#91A8C7]/90 font-medium truncate">
                      {item.badge}
                    </p>
                    <p className="text-[10px] text-[#8A99B5] truncate">
                      “{item.tagline}”
                    </p>
                  </div>
                </div>

                <div className="p-1 text-[#8A99B5] group-hover:text-[#F0F2F7] group-hover:translate-x-0.5 transition-all shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Calming bottom footer note */}
        <div className="p-3 border-t border-[#1E2B45] bg-[#0D1424] shrink-0 text-center">
          <p className="text-[10px] text-[#8A99B5]/80 italic">
            Gentle exercises to restore your quiet presence.
          </p>
        </div>
      </aside>
    </>
  );
};
