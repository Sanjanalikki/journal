import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { JournalEntry, EntryMood } from "../types";

interface CalendarViewProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
}

// Subtle, muted mood color tokens preserving the Midnight DearU aesthetic
export const MOOD_COLOR_MAP: Record<
  string,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  reflective: {
    label: "Reflective",
    dot: "bg-[#A2A4E0]",
    text: "text-[#A2A4E0]",
    bg: "bg-[#18243A]",
    border: "border-[#A2A4E0]/30",
  },
  grateful: {
    label: "Grateful",
    dot: "bg-[#E2C376]",
    text: "text-[#E2C376]",
    bg: "bg-[#252216]",
    border: "border-[#E2C376]/30",
  },
  calm: {
    label: "Calm",
    dot: "bg-[#70C1B3]",
    text: "text-[#70C1B3]",
    bg: "bg-[#112727]",
    border: "border-[#70C1B3]/30",
  },
  inspired: {
    label: "Inspired",
    dot: "bg-[#7FA9E0]",
    text: "text-[#7FA9E0]",
    bg: "bg-[#14233D]",
    border: "border-[#7FA9E0]/30",
  },
  anxious: {
    label: "Anxious",
    dot: "bg-[#E6A073]",
    text: "text-[#E6A073]",
    bg: "bg-[#2A1D16]",
    border: "border-[#E6A073]/30",
  },
  hopeful: {
    label: "Hopeful",
    dot: "bg-[#86C49E]",
    text: "text-[#86C49E]",
    bg: "bg-[#13271D]",
    border: "border-[#86C49E]/30",
  },
  tired: {
    label: "Tired",
    dot: "bg-[#94A3B8]",
    text: "text-[#94A3B8]",
    bg: "bg-[#1E293B]",
    border: "border-[#94A3B8]/30",
  },
  challenging: {
    label: "Challenged",
    dot: "bg-[#DE7E7E]",
    text: "text-[#DE7E7E]",
    bg: "bg-[#2D161A]",
    border: "border-[#DE7E7E]/30",
  },
  challenged: {
    label: "Challenged",
    dot: "bg-[#DE7E7E]",
    text: "text-[#DE7E7E]",
    bg: "bg-[#2D161A]",
    border: "border-[#DE7E7E]/30",
  },
};

const ORDERED_LEGEND = [
  { key: "reflective", label: "Reflective", dot: "bg-[#A2A4E0]" },
  { key: "grateful", label: "Grateful", dot: "bg-[#E2C376]" },
  { key: "calm", label: "Calm", dot: "bg-[#70C1B3]" },
  { key: "inspired", label: "Inspired", dot: "bg-[#7FA9E0]" },
  { key: "anxious", label: "Anxious", dot: "bg-[#E6A073]" },
  { key: "hopeful", label: "Hopeful", dot: "bg-[#86C49E]" },
  { key: "tired", label: "Tired", dot: "bg-[#94A3B8]" },
  { key: "challenging", label: "Challenged", dot: "bg-[#DE7E7E]" },
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  entries,
  onSelectEntry,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEntries, setSelectedDayEntries] = useState<JournalEntry[] | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Map entries by YYYY-MM-DD
  const entriesByDate: Record<string, JournalEntry[]> = {};
  entries.forEach((e) => {
    try {
      const d = new Date(e.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!entriesByDate[key]) entriesByDate[key] = [];
      entriesByDate[key].push(e);
    } catch {
      // Ignore invalid date
    }
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEntries(null);
    setSelectedDayKey(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEntries(null);
    setSelectedDayKey(null);
  };

  const handleDayClick = (dayNum: number) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    setSelectedDayKey(key);
    setSelectedDayEntries(entriesByDate[key] || []);
  };

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const getMoodConfig = (mood?: string) => {
    const key = (mood || "reflective").toLowerCase();
    return MOOD_COLOR_MAP[key] || MOOD_COLOR_MAP.reflective;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2B45]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#F0F2F7]">
            Memory Calendar
          </h1>
          <p className="text-xs sm:text-sm text-[#8A99B5] mt-1">
            Days with recorded reflections are illuminated by their emotional mood.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-2 bg-[#121B2D] border border-[#1E2B45] p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-lg transition-colors"
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-serif-display text-sm font-semibold text-[#F0F2F7] px-3 min-w-[130px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-lg transition-colors"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mood Legend */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#121B2D] border border-[#1E2B45] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#91A8C7] mr-1">
          Mood
        </span>
        {ORDERED_LEGEND.map((m) => (
          <div key={m.key} className="inline-flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${m.dot}`} />
            <span className="text-[11px] text-[#8A99B5]">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-[#121B2D] border border-[#1E2B45] rounded-2xl p-4 sm:p-6 shadow-sm">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-medium text-[#8A99B5] pb-3 border-b border-[#1E2B45]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Month cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-3">
          {calendarDays.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty_${idx}`} className="h-14 sm:h-16" />;
            }

            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const dayEntries = entriesByDate[dateKey] || [];
            const hasEntries = dayEntries.length > 0;
            const isSelected = selectedDayKey === dateKey;

            // Compute tooltip and accessible label
            const moodSummary = hasEntries
              ? dayEntries.map((e) => getMoodConfig(e.mood).label).join(", ")
              : "No reflections";
            const accessibleTooltip = hasEntries
              ? `${monthNames[month]} ${dayNum}\nMood: ${moodSummary}\n${dayEntries.length} ${dayEntries.length === 1 ? "journal entry" : "journal entries"}`
              : `${monthNames[month]} ${dayNum}`;

            // Primary mood border / tint if selected or has entries
            const primaryMoodConfig = hasEntries ? getMoodConfig(dayEntries[0].mood) : null;

            return (
              <button
                key={`day_${dayNum}`}
                onClick={() => handleDayClick(dayNum)}
                title={accessibleTooltip}
                aria-label={accessibleTooltip}
                className={`h-14 sm:h-16 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all text-left relative ${
                  isSelected
                    ? "bg-[#18243A] border-2 border-[#7887C7] text-white shadow-xs"
                    : hasEntries
                    ? `bg-[#0D1424] hover:bg-[#18243A] border ${primaryMoodConfig?.border || "border-[#7887C7]/30"} text-[#F0F2F7]`
                    : "hover:bg-[#18243A]/40 text-[#8A99B5] border border-transparent"
                }`}
              >
                <span className="text-xs font-semibold">{dayNum}</span>

                {/* Mood Dot Indicator(s) */}
                {hasEntries && (
                  <div className="flex items-center justify-center space-x-1 pb-1">
                    {dayEntries.slice(0, 3).map((e, dotIdx) => {
                      const mConfig = getMoodConfig(e.mood);
                      return (
                        <span
                          key={`${e.id}_${dotIdx}`}
                          className={`w-2 h-2 rounded-full ${mConfig.dot} transition-transform hover:scale-125`}
                          title={`Mood: ${mConfig.label}`}
                        />
                      );
                    })}
                    {dayEntries.length > 3 && (
                      <span className="text-[9px] text-[#91A8C7] leading-none">
                        +{dayEntries.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Entries Inspection */}
      {selectedDayKey && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2B45]">
            <h2 className="text-sm sm:text-base font-serif-display font-semibold text-[#F0F2F7]">
              Reflections on {selectedDayKey}
            </h2>
            <span className="text-xs text-[#8A99B5]">
              {selectedDayEntries?.length || 0} {selectedDayEntries?.length === 1 ? "entry" : "entries"} found
            </span>
          </div>

          {selectedDayEntries && selectedDayEntries.length > 0 ? (
            <div className="space-y-3">
              {selectedDayEntries.map((e) => {
                const moodConfig = getMoodConfig(e.mood);
                return (
                  <div
                    key={e.id}
                    onClick={() => onSelectEntry(e)}
                    className="p-4 rounded-xl bg-[#121B2D] hover:bg-[#18243A] border border-[#1E2B45] hover:border-[#7887C7]/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1.5 min-w-0 pr-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center space-x-1 ${moodConfig.bg} ${moodConfig.text} border ${moodConfig.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${moodConfig.dot}`} />
                          <span>{moodConfig.label}</span>
                        </span>
                        <h3 className="text-sm font-serif-display font-semibold text-[#F0F2F7] group-hover:text-[#91A8C7] transition-colors truncate">
                          {e.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[#8A99B5] line-clamp-1 italic">
                        "{e.summary || e.messages[0]?.content || "No message content"}"
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-xs text-[#91A8C7] font-medium flex items-center space-x-1">
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#121B2D] border border-[#1E2B45] text-center">
              <p className="text-xs text-[#8A99B5]">
                No journal reflections were recorded on this date.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
