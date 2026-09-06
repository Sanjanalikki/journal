import React, { useMemo } from "react";
import { BookOpen, Sparkles, ArrowRight, ShieldCheck, Moon } from "lucide-react";
import type { JournalEntry, EntryMood } from "../types";
import { getThoughtOfTheDay } from "../utils/dailyThoughts";

interface DashboardViewProps {
  entries: JournalEntry[];
  todayEntryId?: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  userName?: string | null;
}

const MOOD_TAGS: Record<EntryMood, { label: string; text: string; bg: string; dot: string }> = {
  reflective: { label: "Reflective", text: "text-[#A2A4E0]", bg: "bg-[#18243A]", dot: "bg-[#A2A4E0]" },
  grateful: { label: "Grateful", text: "text-[#E2C376]", bg: "bg-[#252216]", dot: "bg-[#E2C376]" },
  calm: { label: "Calm", text: "text-[#70C1B3]", bg: "bg-[#112727]", dot: "bg-[#70C1B3]" },
  inspired: { label: "Inspired", text: "text-[#7FA9E0]", bg: "bg-[#14233D]", dot: "bg-[#7FA9E0]" },
  anxious: { label: "Anxious", text: "text-[#E6A073]", bg: "bg-[#2A1D16]", dot: "bg-[#E6A073]" },
  tired: { label: "Tired", text: "text-[#94A3B8]", bg: "bg-[#1E293B]", dot: "bg-[#94A3B8]" },
  hopeful: { label: "Hopeful", text: "text-[#86C49E]", bg: "bg-[#13271D]", dot: "bg-[#86C49E]" },
  challenging: { label: "Challenged", text: "text-[#DE7E7E]", bg: "bg-[#2D161A]", dot: "bg-[#DE7E7E]" },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  entries,
  todayEntryId,
  onSelectEntry,
  userName,
}) => {
  const isTodayDate = (isoString?: string) => {
    if (!isoString) return false;
    try {
      return new Date(isoString).toDateString() === new Date().toDateString();
    } catch {
      return false;
    }
  };

  const resolvedTodayId =
    todayEntryId !== undefined
      ? todayEntryId
      : entries.find(
          (e) =>
            isTodayDate(e.createdAt) ||
            isTodayDate(e.updatedAt) ||
            e.title.toLowerCase().includes("today's reflections") ||
            e.title.toLowerCase().includes("today")
        )?.id || null;

  // Show recent reflections
  const recentEntries = entries
    .filter((e) => !resolvedTodayId || e.id !== resolvedTodayId)
    .slice(0, 6);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Deterministically select today's thought
  const dailyThought = useMemo(() => getThoughtOfTheDay(new Date()), []);

  // Compute a gentle overview of recent mood counts
  const recentMoodCounts = useMemo(() => {
    const counts: Partial<Record<EntryMood, number>> = {};
    entries.slice(0, 10).forEach((e) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    return counts;
  }, [entries]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 max-w-6xl mx-auto w-full space-y-8">
      {/* Editorial Header */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-[#91A8C7] font-semibold">
          Quiet Room · DearU
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif-display font-bold text-[#F0F2F7]">
          {getGreeting()}{userName ? `, ${userName}` : ""}.
        </h1>
        <p className="text-[#8A99B5] text-sm sm:text-base font-light">
          Take a moment to write something for yourself.
        </p>
      </div>

      {/* Thought of the Day Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121B2D] via-[#0E1626] to-[#121B2D] border border-[#7887C7]/25 p-5 sm:p-6 shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#7887C7]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center space-x-2 text-[#91A8C7]">
            <span className="text-xs">✦</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#91A8C7]">
              Thought of the Day
            </span>
          </div>

          <blockquote className="font-serif-display text-lg sm:text-xl font-medium text-[#F0F2F7] leading-relaxed italic">
            “{dailyThought.quote}”
          </blockquote>

          <p className="text-xs sm:text-sm text-[#8A99B5] font-light">
            {dailyThought.reflection}
          </p>
        </div>
      </div>

      {/* Main Content Layout: Previous Reflections + Supporting Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Previous Reflections */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2B45]">
            <h2 className="text-base font-serif-display font-semibold text-[#F0F2F7] flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#91A8C7]" />
              <span>Previous Reflections</span>
            </h2>
            <span className="text-xs text-[#8A99B5]">
              {recentEntries.length} {recentEntries.length === 1 ? "memory" : "memories"}
            </span>
          </div>

          {recentEntries.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#121B2D] border border-[#1E2B45] text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#18243A] text-[#91A8C7] mx-auto flex items-center justify-center">
                <Moon className="w-5 h-5 text-[#7887C7]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif-display font-medium text-[#F0F2F7]">
                  Tonight is a good night to begin.
                </h3>
                <p className="text-xs text-[#8A99B5] max-w-sm mx-auto">
                  Your thoughts will appear here in quiet confidentiality. Use the New Entry button in the left sidebar whenever you're ready.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentEntries.map((entry) => {
                const moodConfig = MOOD_TAGS[entry.mood] || MOOD_TAGS.reflective;
                const snippet =
                  entry.summary ||
                  entry.messages[0]?.content ||
                  "Empty page waiting for your reflections...";

                return (
                  <div
                    key={entry.id}
                    onClick={() => onSelectEntry(entry)}
                    className="p-5 rounded-2xl bg-[#121B2D] hover:bg-[#18243A] border border-[#1E2B45] hover:border-[#7887C7]/40 transition-all cursor-pointer group flex flex-col justify-between space-y-3 text-left"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#8A99B5]">
                        <span className="font-serif-display text-[13px] text-[#91A8C7]">
                          {formatDate(entry.createdAt)}
                        </span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium flex items-center space-x-1.5 ${moodConfig.bg} ${moodConfig.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${moodConfig.dot}`} />
                          <span>{moodConfig.label}</span>
                        </span>
                      </div>

                      <h3 className="font-serif-display font-semibold text-base text-[#F0F2F7] group-hover:text-[#91A8C7] transition-colors line-clamp-1">
                        {entry.title || "Untitled Reflection"}
                      </h3>

                      <p className="text-xs text-[#8A99B5] line-clamp-3 leading-relaxed italic">
                        "{snippet}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#1E2B45]/60 flex items-center justify-between text-[11px] text-[#8A99B5]">
                      <div className="flex items-center space-x-1.5">
                        {entry.summary ? (
                          <span className="flex items-center space-x-1 text-[#7887C7]">
                            <Sparkles className="w-3 h-3" />
                            <span>Synthesized</span>
                          </span>
                        ) : (
                          <span>{entry.messages.length} exchanges</span>
                        )}
                      </div>
                      <span className="text-[#91A8C7] opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-0.5">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Journal Rhythm Summary & Privacy Assurance */}
        <div className="space-y-5">
          {/* Recent Mood Pattern Summary */}
          <div className="p-5 rounded-2xl bg-[#121B2D] border border-[#1E2B45] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif-display text-sm font-semibold text-[#F0F2F7]">
                Journal Rhythm
              </span>
              <span className="text-xs text-[#8A99B5]">
                {entries.length} total {entries.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            <p className="text-xs text-[#8A99B5] leading-relaxed">
              Recent emotional markers identified across your recorded reflections:
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(Object.keys(MOOD_TAGS) as EntryMood[]).map((moodKey) => {
                const count = recentMoodCounts[moodKey] || 0;
                if (count === 0 && entries.length > 0) return null;
                const cfg = MOOD_TAGS[moodKey];
                return (
                  <span
                    key={moodKey}
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-medium ${cfg.bg} ${cfg.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span>{cfg.label}</span>
                    {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Privacy Reassurance Note */}
          <div className="p-4 rounded-xl bg-[#0D1424] border border-[#1E2B45] text-xs text-[#8A99B5] space-y-1.5">
            <p className="font-semibold text-[#F0F2F7] flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Your thoughts belong to you.</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              Every journal entry is stored in user-isolated Firestore rules. No other user or entity can access your private reflections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
