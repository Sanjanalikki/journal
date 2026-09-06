import React from "react";
import { Compass, Sparkles, Heart, BookOpen, ArrowRight } from "lucide-react";
import type { JournalEntry, EntryMood } from "../types";

interface InsightsViewProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
}

const MOOD_CONFIG: Record<EntryMood, { label: string; text: string; bar: string }> = {
  reflective: { label: "Reflective", text: "text-[#91A8C7]", bar: "bg-[#7887C7]" },
  grateful: { label: "Grateful", text: "text-emerald-300", bar: "bg-emerald-600/80" },
  calm: { label: "Calm", text: "text-teal-300", bar: "bg-teal-600/80" },
  inspired: { label: "Inspired", text: "text-amber-300", bar: "bg-amber-600/80" },
  anxious: { label: "Anxious", text: "text-purple-300", bar: "bg-purple-600/80" },
  tired: { label: "Tired", text: "text-[#8A99B5]", bar: "bg-[#8A99B5]/60" },
  hopeful: { label: "Hopeful", text: "text-sky-300", bar: "bg-sky-600/80" },
  challenging: { label: "Challenged", text: "text-rose-300", bar: "bg-rose-600/80" },
};

export const InsightsView: React.FC<InsightsViewProps> = ({
  entries,
  onSelectEntry,
  onNewEntry,
}) => {
  // Compute mood counts
  const moodCounts: Partial<Record<EntryMood, number>> = {};
  entries.forEach((e) => {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });

  const totalEntries = entries.length;

  // Entries with summaries
  const synthesizedEntries = entries.filter((e) => Boolean(e.summary));

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 max-w-5xl mx-auto w-full space-y-10">
      {/* Header */}
      <div className="pb-4 border-b border-[#1E2B45] space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#F0F2F7]">
          Reflective Insights & Mood
        </h1>
        <p className="text-xs sm:text-sm text-[#8A99B5]">
          Observational patterns and personal rhythms gathered from your private thoughts.
        </p>
      </div>

      {totalEntries === 0 ? (
        <div className="p-8 rounded-2xl bg-[#121B2D] border border-[#1E2B45] text-center space-y-4">
          <Sparkles className="w-8 h-8 text-[#7887C7] mx-auto" />
          <h2 className="text-base font-serif-display font-medium text-[#F0F2F7]">
            Patterns will emerge as you write.
          </h2>
          <p className="text-xs text-[#8A99B5] max-w-sm mx-auto">
            Once you log entries and converse with your reflection partner, you'll see recurring emotional currents and synthesized takeaways here.
          </p>
          <button
            onClick={onNewEntry}
            className="px-4 py-2 bg-[#7887C7] text-white rounded-xl text-xs font-medium hover:bg-[#8796d7] transition-colors"
          >
            Start writing
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Mood Distribution */}
          <div className="p-6 rounded-2xl bg-[#121B2D] border border-[#1E2B45] space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-serif-display font-semibold text-[#F0F2F7]">
                <Heart className="w-4 h-4 text-[#7887C7]" />
                <span>Emotional Currents</span>
              </div>
              <span className="text-xs text-[#8A99B5]">
                Across {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(MOOD_CONFIG) as EntryMood[]).map((mKey) => {
                const count = moodCounts[mKey] || 0;
                const percentage = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
                const conf = MOOD_CONFIG[mKey];

                return (
                  <div key={mKey} className="p-3.5 rounded-xl bg-[#0D1424] border border-[#1E2B45] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${conf.text}`}>{conf.label}</span>
                      <span className="text-[#8A99B5]">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#18243A] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${conf.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Observation Card */}
          <div className="p-6 rounded-2xl bg-[#121B2D] border border-[#7887C7]/20 space-y-4 relative overflow-hidden">
            <div className="flex items-center space-x-2 text-[#91A8C7]">
              <Sparkles className="w-4 h-4 text-[#7887C7]" />
              <span className="font-serif-display text-sm font-semibold text-[#F0F2F7]">
                ✦ Observational Companion Summary
              </span>
            </div>

            <div className="text-xs sm:text-sm text-[#8A99B5] leading-relaxed space-y-2 font-light">
              <p>
                In your recent reflections, a recurring theme appears to be giving yourself space to slow down and listen to what matters most. Rather than rushing to immediate conclusions, your entries show an intentional effort to explore how daily choices align with your core values.
              </p>
              <p>
                As you continue journaling, you can use the{" "}
                <span className="text-[#91A8C7] font-medium">Summarize Entry</span> or{" "}
                <span className="text-[#91A8C7] font-medium">Deep Inquiry Questions</span> actions in the editor whenever you wish to unpack a complex topic.
              </p>
            </div>
          </div>

          {/* Synthesized Reflections Collection */}
          {synthesizedEntries.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-serif-display font-semibold text-[#F0F2F7] flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#91A8C7]" />
                <span>Executive Session Syntheses ({synthesizedEntries.length})</span>
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {synthesizedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => onSelectEntry(entry)}
                    className="p-5 rounded-2xl bg-[#121B2D] hover:bg-[#18243A] border border-[#1E2B45] hover:border-[#7887C7]/40 transition-all cursor-pointer group space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between text-xs text-[#8A99B5]">
                      <span className="font-serif-display text-[#91A8C7]">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-[#91A8C7] flex items-center space-x-1 group-hover:underline">
                        <span>Open entry</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    <h3 className="font-serif-display font-semibold text-base text-[#F0F2F7]">
                      {entry.title}
                    </h3>

                    <p className="text-xs text-[#8A99B5] line-clamp-3 leading-relaxed italic">
                      "{entry.summary}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
