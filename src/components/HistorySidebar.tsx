import React, { useState } from "react";
import {
  Search,
  BookOpen,
  Calendar,
  Trash2,
  X,
  Plus,
  Sparkles,
} from "lucide-react";
import type { JournalEntry, EntryMood } from "../types";

interface HistorySidebarProps {
  entries: JournalEntry[];
  todayEntry?: JournalEntry | null;
  selectedEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onNewEntry?: () => void;
}

const MOOD_TAGS: Record<EntryMood, { label: string; bg: string; text: string }> = {
  reflective: { label: "Reflective", bg: "bg-[#18243A]", text: "text-[#91A8C7]" },
  grateful: { label: "Grateful", bg: "bg-emerald-950/50", text: "text-emerald-300" },
  calm: { label: "Calm", bg: "bg-teal-950/50", text: "text-teal-300" },
  inspired: { label: "Inspired", bg: "bg-amber-950/50", text: "text-amber-300" },
  anxious: { label: "Anxious", bg: "bg-purple-950/50", text: "text-purple-300" },
  tired: { label: "Tired", bg: "bg-[#18243A]", text: "text-[#8A99B5]" },
  hopeful: { label: "Hopeful", bg: "bg-sky-950/50", text: "text-sky-300" },
  challenging: { label: "Challenged", bg: "bg-rose-950/50", text: "text-rose-300" },
};

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  entries,
  todayEntry,
  selectedEntryId,
  onSelectEntry,
  onDeleteEntry,
  isOpen,
  onClose,
  onNewEntry,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isTodayDate = (isoString?: string) => {
    if (!isoString) return false;
    try {
      return new Date(isoString).toDateString() === new Date().toDateString();
    } catch {
      return false;
    }
  };

  const resolvedTodayEntry =
    todayEntry !== undefined
      ? todayEntry
      : entries.find(
          (e) =>
            isTodayDate(e.createdAt) ||
            isTodayDate(e.updatedAt) ||
            e.title.toLowerCase().includes("today's reflections") ||
            e.title.toLowerCase().includes("today")
        ) || null;

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.summary && entry.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMood =
      selectedMoodFilter === "all" || entry.mood === selectedMoodFilter;

    return matchesSearch && matchesMood;
  });

  // Filter out resolvedTodayEntry so it only appears once in the entire sidebar
  const pastEntries = filteredEntries.filter(
    (e) => !resolvedTodayEntry || e.id !== resolvedTodayEntry.id
  );

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#080D18]/80 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-80 sm:w-88 bg-[#0D1424] border-r border-[#1E2B45] z-30 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header with Search */}
        <div className="p-4 border-b border-[#1E2B45] space-y-3 bg-[#0D1424]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#F0F2F7] font-serif-display font-semibold text-sm">
              <BookOpen className="w-4 h-4 text-[#91A8C7]" />
              <span>Memories ({entries.length})</span>
            </div>
            <div className="flex items-center space-x-1">
              {onNewEntry && (
                <button
                  onClick={() => {
                    onNewEntry();
                    onClose();
                  }}
                  className="p-1.5 bg-[#18243A] hover:bg-[#20304c] text-[#91A8C7] hover:text-white rounded-lg transition-colors"
                  title="New Entry"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 text-[#8A99B5] hover:text-[#F0F2F7] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A99B5] absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search memories..."
              className="w-full pl-8 pr-4 py-2 bg-[#121B2D] hover:bg-[#18243A] focus:bg-[#18243A] border border-[#1E2B45] focus:border-[#7887C7]/60 rounded-xl text-xs text-[#F0F2F7] placeholder:text-[#8A99B5] transition-colors focus:outline-none"
            />
          </div>

          {/* Mood Filter Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <button
              onClick={() => setSelectedMoodFilter("all")}
              className={`px-2.5 py-1 rounded-full shrink-0 font-medium transition-colors ${
                selectedMoodFilter === "all"
                  ? "bg-[#7887C7] text-white"
                  : "bg-[#121B2D] text-[#8A99B5] hover:text-[#F0F2F7] border border-[#1E2B45]"
              }`}
            >
              All
            </button>
            {(Object.keys(MOOD_TAGS) as EntryMood[]).map((moodKey) => {
              const moodInfo = MOOD_TAGS[moodKey];
              const isSelected = selectedMoodFilter === moodKey;
              return (
                <button
                  key={moodKey}
                  onClick={() => setSelectedMoodFilter(moodKey)}
                  className={`px-2.5 py-1 rounded-full shrink-0 font-medium transition-colors border ${
                    isSelected
                      ? "bg-[#7887C7] text-white border-[#7887C7]"
                      : `bg-[#121B2D] ${moodInfo.text} border-[#1E2B45] hover:border-[#7887C7]/40`
                  }`}
                >
                  {moodInfo.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Dedicated Compact Contextual Card for Today's Reflections */}
          {resolvedTodayEntry && (
            <div className="space-y-1.5 pb-2.5 border-b border-[#1E2B45]/80">
              <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-[#91A8C7] uppercase tracking-wider">
                <span>Today's Reflection</span>
                <span className="text-[10px] text-emerald-400 font-normal flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Current Context</span>
                </span>
              </div>

              {/* The Single Compact Contextual Card */}
              {(() => {
                const isSelected = selectedEntryId === resolvedTodayEntry.id;
                const moodInfo =
                  MOOD_TAGS[resolvedTodayEntry.mood] || MOOD_TAGS.reflective;

                return (
                  <div
                    onClick={() => {
                      onSelectEntry(resolvedTodayEntry);
                      onClose();
                    }}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-[#18243A] border-[#7887C7] shadow-sm ring-1 ring-[#7887C7]/40"
                        : "bg-[#121B2D] hover:bg-[#18243A]/90 border-[#1E2B45] hover:border-[#7887C7]/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-xs font-semibold text-[#F0F2F7] truncate flex-1 font-serif-display">
                        {resolvedTodayEntry.title || "Today's Reflections"}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${moodInfo.bg} ${moodInfo.text} border border-[#1E2B45]`}
                      >
                        {moodInfo.label}
                      </span>
                    </div>

                    {resolvedTodayEntry.summary ? (
                      <p className="text-[11px] text-[#8A99B5] line-clamp-2 leading-relaxed mb-2 italic">
                        "{resolvedTodayEntry.summary}"
                      </p>
                    ) : resolvedTodayEntry.messages.length > 0 ? (
                      <p className="text-[11px] text-[#8A99B5] line-clamp-2 leading-relaxed mb-2">
                        {resolvedTodayEntry.messages[0].content}
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#8A99B5] italic mb-2">
                        Empty reflection waiting for your thoughts...
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-[#8A99B5] pt-1.5 border-t border-[#1E2B45]/70">
                      <span className="text-[#91A8C7] font-serif-display">
                        {formatDate(
                          resolvedTodayEntry.updatedAt || resolvedTodayEntry.createdAt
                        )}
                      </span>
                      <div className="flex items-center space-x-2">
                        {resolvedTodayEntry.summary ? (
                          <span className="flex items-center space-x-1 text-[#7887C7]">
                            <Sparkles className="w-3 h-3" />
                            <span>Synthesized</span>
                          </span>
                        ) : (
                          <span>{resolvedTodayEntry.messages.length} exchanges</span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirmDeleteId === resolvedTodayEntry.id) {
                              onDeleteEntry(resolvedTodayEntry.id);
                              setConfirmDeleteId(null);
                            } else {
                              setConfirmDeleteId(resolvedTodayEntry.id);
                            }
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            confirmDeleteId === resolvedTodayEntry.id
                              ? "bg-rose-900/60 text-rose-300"
                              : "opacity-0 group-hover:opacity-100 text-[#8A99B5] hover:text-rose-400"
                          }`}
                          title={
                            confirmDeleteId === resolvedTodayEntry.id
                              ? "Click again to confirm delete"
                              : "Delete entry"
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Past Memories Header */}
          {pastEntries.length > 0 && (
            <div className="px-1 text-[11px] font-semibold text-[#8A99B5] uppercase tracking-wider">
              <span>Earlier Memories ({pastEntries.length})</span>
            </div>
          )}

          {/* Past Entries List without duplicates */}
          {pastEntries.length === 0 && !resolvedTodayEntry ? (
            <div className="p-8 text-center text-[#8A99B5] space-y-2">
              <Calendar className="w-8 h-8 mx-auto opacity-30 text-[#91A8C7]" />
              <p className="text-xs font-medium text-[#F0F2F7]">
                {searchTerm || selectedMoodFilter !== "all"
                  ? "No memories match your filter."
                  : "No journal entries yet."}
              </p>
              <p className="text-[11px] text-[#8A99B5]">
                Write your thoughts to begin your private collection.
              </p>
            </div>
          ) : (
            pastEntries.map((entry) => {
              const isSelected = selectedEntryId === entry.id;
              const moodInfo = MOOD_TAGS[entry.mood] || MOOD_TAGS.reflective;

              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    onSelectEntry(entry);
                    onClose();
                  }}
                  className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-[#18243A] border-[#7887C7] shadow-xs"
                      : "bg-[#121B2D] hover:bg-[#18243A]/80 border-[#1E2B45] hover:border-[#7887C7]/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-xs font-semibold text-[#F0F2F7] truncate flex-1 font-serif-display">
                      {entry.title || "Untitled Reflection"}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${moodInfo.bg} ${moodInfo.text} border border-[#1E2B45]`}
                    >
                      {moodInfo.label}
                    </span>
                  </div>

                  {entry.summary ? (
                    <p className="text-[11px] text-[#8A99B5] line-clamp-2 leading-relaxed mb-2 italic">
                      "{entry.summary}"
                    </p>
                  ) : entry.messages.length > 0 ? (
                    <p className="text-[11px] text-[#8A99B5] line-clamp-2 leading-relaxed mb-2">
                      {entry.messages[0].content}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#8A99B5] italic mb-2">
                      Empty reflection...
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#8A99B5] pt-1.5 border-t border-[#1E2B45]/70">
                    <span className="text-[#91A8C7] font-serif-display">
                      {formatDate(entry.updatedAt || entry.createdAt)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span>{entry.messages.length} exchanges</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirmDeleteId === entry.id) {
                            onDeleteEntry(entry.id);
                            setConfirmDeleteId(null);
                          } else {
                            setConfirmDeleteId(entry.id);
                          }
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          confirmDeleteId === entry.id
                            ? "bg-rose-900/60 text-rose-300"
                            : "opacity-0 group-hover:opacity-100 text-[#8A99B5] hover:text-rose-400"
                        }`}
                        title={
                          confirmDeleteId === entry.id
                            ? "Click again to confirm delete"
                            : "Delete entry"
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};

