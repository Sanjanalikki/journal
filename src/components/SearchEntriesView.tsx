import React, { useState } from "react";
import { Search, Filter, BookOpen, ArrowRight, X } from "lucide-react";
import type { JournalEntry, EntryMood } from "../types";

interface SearchEntriesViewProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
}

const MOODS: { key: EntryMood | "all"; label: string }[] = [
  { key: "all", label: "All Moods" },
  { key: "reflective", label: "Reflective" },
  { key: "grateful", label: "Grateful" },
  { key: "calm", label: "Calm" },
  { key: "inspired", label: "Inspired" },
  { key: "anxious", label: "Anxious" },
  { key: "hopeful", label: "Hopeful" },
  { key: "tired", label: "Tired" },
  { key: "challenging", label: "Challenged" },
];

export const SearchEntriesView: React.FC<SearchEntriesViewProps> = ({
  entries,
  onSelectEntry,
  onNewEntry,
}) => {
  const [query, setQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<EntryMood | "all">("all");

  const filtered = entries.filter((entry) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      entry.title.toLowerCase().includes(q) ||
      (entry.summary && entry.summary.toLowerCase().includes(q)) ||
      entry.messages.some((m) => m.content.toLowerCase().includes(q)) ||
      entry.tags.some((t) => t.toLowerCase().includes(q));

    const matchesMood = selectedMood === "all" || entry.mood === selectedMood;

    return matchesQuery && matchesMood;
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 max-w-5xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-[#1E2B45]">
        <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#F0F2F7]">
          Search Memories
        </h1>
        <p className="text-xs sm:text-sm text-[#8A99B5]">
          Find thoughts, dates, moods, or themes across all your past journal reflections.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="space-y-4">
        <div className="relative bg-[#121B2D] border border-[#1E2B45] rounded-2xl focus-within:border-[#7887C7]/60 transition-colors shadow-xs">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A99B5]">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your memories..."
            className="w-full pl-12 pr-10 py-3.5 bg-transparent border-none focus:outline-none text-sm sm:text-base text-[#F0F2F7] placeholder:text-[#8A99B5]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8A99B5] hover:text-[#F0F2F7]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mood filter pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] text-[#8A99B5] font-medium shrink-0 flex items-center space-x-1 mr-1">
            <Filter className="w-3 h-3 text-[#7887C7]" />
            <span>Filter:</span>
          </span>
          {MOODS.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMood(m.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                selectedMood === m.key
                  ? "bg-[#7887C7] text-white"
                  : "bg-[#121B2D] text-[#8A99B5] hover:text-[#F0F2F7] border border-[#1E2B45]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#8A99B5] pt-2">
        <span>
          Showing {filtered.length} of {entries.length} memories
        </span>
        {query && (
          <span>
            Searching for "<span className="text-[#91A8C7]">{query}</span>"
          </span>
        )}
      </div>

      {/* Results List */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#121B2D] border border-[#1E2B45] text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[#8A99B5] mx-auto opacity-50" />
          <h2 className="text-base font-serif-display font-medium text-[#F0F2F7]">
            No matching memories found.
          </h2>
          <p className="text-xs text-[#8A99B5] max-w-sm mx-auto">
            Try adjusting your search query or removing mood filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className="p-5 rounded-2xl bg-[#121B2D] hover:bg-[#18243A] border border-[#1E2B45] hover:border-[#7887C7]/40 transition-all cursor-pointer group flex flex-col justify-between space-y-3 text-left"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8A99B5]">
                  <span className="font-serif-display text-[#91A8C7]">
                    {formatDate(entry.createdAt)}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#18243A] text-[#91A8C7] border border-[#1E2B45] capitalize">
                    {entry.mood}
                  </span>
                </div>

                <h3 className="font-serif-display font-semibold text-base text-[#F0F2F7] group-hover:text-[#91A8C7] transition-colors line-clamp-1">
                  {entry.title}
                </h3>

                <p className="text-xs text-[#8A99B5] line-clamp-3 leading-relaxed italic">
                  "{entry.summary || entry.messages[0]?.content || "Empty reflection..."}"
                </p>
              </div>

              <div className="pt-2 border-t border-[#1E2B45]/60 flex items-center justify-between text-[11px] text-[#8A99B5]">
                <span>{entry.messages.length} exchanges</span>
                <span className="text-[#91A8C7] opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-0.5">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
