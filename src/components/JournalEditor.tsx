import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Send,
  Sparkles,
  Lightbulb,
  FileText,
  Compass,
  Copy,
  Check,
  RefreshCw,
  Menu,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import type { JournalEntry, EntryMood, ChatMessage, MicroWellness } from "../types";
import { BoxBreathingWidget } from "./BoxBreathingWidget";

interface JournalEditorProps {
  entry: JournalEntry;
  onUpdateEntry: (updated: Partial<JournalEntry>) => void;
  onSendMessage: (content: string, action?: "reflect" | "summarize" | "brainstorm" | "prompts") => Promise<void>;
  isGenerating: boolean;
  activeWellnessPrompt: MicroWellness | null;
  onDismissWellness: () => void;
  onToggleSidebar?: () => void;
  isSaving?: boolean;
}

const MOODS: { key: EntryMood; label: string }[] = [
  { key: "reflective", label: "Reflective" },
  { key: "grateful", label: "Grateful" },
  { key: "calm", label: "Calm" },
  { key: "inspired", label: "Inspired" },
  { key: "anxious", label: "Anxious" },
  { key: "hopeful", label: "Hopeful" },
  { key: "tired", label: "Tired" },
  { key: "challenging", label: "Challenged" },
];

export const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onUpdateEntry,
  onSendMessage,
  isGenerating,
  activeWellnessPrompt,
  onDismissWellness,
  onToggleSidebar,
  isSaving = false,
}) => {
  const [inputText, setInputText] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entry.messages, isGenerating]);

  const handleSend = async (action: "reflect" | "summarize" | "brainstorm" | "prompts" = "reflect") => {
    if (isGenerating) return;
    const textToSend = inputText.trim();

    if (action === "reflect" && !textToSend) return;

    setInputText("");
    await onSendMessage(textToSend, action);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend("reflect");
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;

  const formattedDate = (() => {
    try {
      const d = new Date(entry.createdAt);
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Current Reflection";
    }
  })();

  return (
    <main className="flex-1 flex flex-col h-full bg-[#080D18] overflow-hidden night-sky-bg">
      {/* Top Meta Bar: Date, Title, Mood, Grounding */}
      <div className="bg-[#0D1424]/90 backdrop-blur-md border-b border-[#1E2B45] px-4 sm:px-8 py-3.5 shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1 min-w-[260px]">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-xl transition-colors"
              title="Open Grounding activities"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1 space-y-0.5">
            <div className="flex items-center space-x-2 text-xs text-[#91A8C7]">
              <Calendar className="w-3.5 h-3.5 text-[#7887C7]" />
              <span className="font-serif-display">{formattedDate}</span>
              <span className="text-[#1E2B45]">·</span>
              <span className="text-[11px] text-[#8A99B5] flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{isSaving ? "Syncing..." : "Saved to private vault"}</span>
              </span>
            </div>

            {/* Title Editor */}
            <input
              type="text"
              value={entry.title}
              onChange={(e) => onUpdateEntry({ title: e.target.value })}
              placeholder="Title of this reflection..."
              className="font-serif-display font-semibold text-lg sm:text-xl text-[#F0F2F7] bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder:text-[#8A99B5]/40"
            />
          </div>
        </div>

        {/* Mood Selector & Manual Breathing trigger */}
        <div className="flex items-center space-x-2.5">
          {/* Mood Selector */}
          <div className="flex items-center bg-[#121B2D] px-2.5 py-1.5 rounded-xl border border-[#1E2B45]">
            <span className="text-[11px] text-[#8A99B5] mr-2">Mood:</span>
            <select
              value={entry.mood}
              onChange={(e) => onUpdateEntry({ mood: e.target.value as EntryMood })}
              className="bg-transparent text-xs font-medium text-[#F0F2F7] focus:outline-none cursor-pointer"
            >
              {MOODS.map((m) => (
                <option key={m.key} value={m.key} className="bg-[#0D1424] text-[#F0F2F7]">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* AI-triggered Box Breathing for acute stress */}
      {activeWellnessPrompt?.needed && (
        <div className="px-4 pt-3 shrink-0">
          <BoxBreathingWidget
            onClose={onDismissWellness}
          />
        </div>
      )}

      {/* Main Reading & Conversation Space */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Entry Summary Card (Structured Executive Synthesis) */}
        {entry.summary && (
          <div className="max-w-3xl mx-auto bg-[#121B2D] border border-[#7887C7]/30 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-[#91A8C7] font-serif-display font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-[#7887C7]" />
              <span>Session Synthesis</span>
            </div>
            <div className="text-[#F0F2F7] text-xs sm:text-sm leading-relaxed prose prose-invert max-w-none font-light">
              <Markdown>{entry.summary}</Markdown>
            </div>
          </div>
        )}

        {/* Empty State: Invitation to Reflect */}
        {entry.messages.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-12 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-[#121B2D] border border-[#1E2B45] text-[#91A8C7] mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#7887C7]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif-display font-semibold text-[#F0F2F7]">
                How was your day?
              </h2>
              <p className="text-xs sm:text-sm text-[#8A99B5] max-w-md mx-auto leading-relaxed">
                Take a quiet breath and write whatever is on your mind. DearU is your calm, private listener—reflecting back with care whenever you wish.
              </p>
            </div>

            {/* Prompt Starter Pills */}
            <div className="pt-4 flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {[
                "Tonight I'm feeling torn between two decisions...",
                "Today I noticed an unexpected habit resurfacing...",
                "A quiet moment I felt truly grateful for today was...",
                "I want to unpack something that's been weighing on me...",
              ].map((starter, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(starter);
                    textareaRef.current?.focus();
                  }}
                  className="px-3.5 py-2 bg-[#121B2D] hover:bg-[#18243A] border border-[#1E2B45] hover:border-[#7887C7]/40 rounded-full text-xs text-[#8A99B5] hover:text-[#F0F2F7] transition-all text-left shadow-2xs"
                >
                  "{starter}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chronological Writing & AI Reflection Cards */}
        <div className="max-w-3xl mx-auto space-y-6">
          {entry.messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {msg.role === "user" ? (
                /* User Journal Entry Block: Clean personal writing */
                <div className="bg-[#121B2D]/90 border border-[#1E2B45] rounded-2xl p-5 text-sm sm:text-base leading-relaxed text-[#F0F2F7] shadow-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E2B45]/50 text-[11px] text-[#8A99B5]">
                    <span className="font-medium text-[#91A8C7]">Your Journal Reflection</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="whitespace-pre-wrap font-sans font-light">
                    {msg.content}
                  </div>
                </div>
              ) : (
                /* AI Observational Card: NOT a chat bubble, an elegant reflection card */
                <div className="bg-[#0D1424] border border-[#7887C7]/30 rounded-2xl p-5 shadow-xs space-y-3 relative group">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1E2B45] text-xs">
                    <div className="flex items-center space-x-2 text-[#91A8C7]">
                      <Sparkles className="w-3.5 h-3.5 text-[#7887C7]" />
                      <span className="font-serif-display font-medium text-[#F0F2F7]">
                        ✦ Reflection
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 text-[#8A99B5] hover:text-[#F0F2F7] transition-opacity p-1 rounded-md"
                      title="Copy reflection"
                    >
                      {copiedMessageId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#F0F2F7] leading-relaxed font-light">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* AI Generating Indicator */}
          {isGenerating && (
            <div className="bg-[#0D1424] border border-[#7887C7]/30 rounded-2xl p-5 shadow-xs flex items-center space-x-3 text-xs text-[#91A8C7]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#7887C7]" />
              <span>DearU is listening and gathering thoughts...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Action Chips & Writing Input Bar */}
      <div className="bg-[#0D1424] border-t border-[#1E2B45] px-4 sm:px-8 py-3.5 shrink-0">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Quick AI Action Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-[11px] font-semibold text-[#8A99B5] uppercase tracking-wider shrink-0 mr-1">
              Actions:
            </span>

            <button
              onClick={() => handleSend("summarize")}
              disabled={isGenerating || entry.messages.length === 0}
              className="px-3.5 py-1.5 bg-[#121B2D] hover:bg-[#18243A] text-[#F0F2F7] border border-[#1E2B45] hover:border-[#7887C7]/40 rounded-full font-medium transition-colors shrink-0 flex items-center space-x-1.5 disabled:opacity-30"
              title="Generate a structured synthesis of this journal"
            >
              <FileText className="w-3.5 h-3.5 text-[#91A8C7]" />
              <span>Summarize Entry</span>
            </button>

            <button
              onClick={() => handleSend("brainstorm")}
              disabled={isGenerating || entry.messages.length === 0}
              className="px-3.5 py-1.5 bg-[#121B2D] hover:bg-[#18243A] text-[#F0F2F7] border border-[#1E2B45] hover:border-[#7887C7]/40 rounded-full font-medium transition-colors shrink-0 flex items-center space-x-1.5 disabled:opacity-30"
              title="Brainstorm actionable ideas based on what you wrote"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#7887C7]" />
              <span>Brainstorm Next Steps</span>
            </button>

            <button
              onClick={() => handleSend("prompts")}
              disabled={isGenerating || entry.messages.length === 0}
              className="px-3.5 py-1.5 bg-[#121B2D] hover:bg-[#18243A] text-[#F0F2F7] border border-[#1E2B45] hover:border-[#7887C7]/40 rounded-full font-medium transition-colors shrink-0 flex items-center space-x-1.5 disabled:opacity-30"
              title="Get deep follow-up questions to explore further"
            >
              <Compass className="w-3.5 h-3.5 text-[#9A91C9]" />
              <span>Deep Inquiry Questions</span>
            </button>
          </div>

          {/* Textarea Notebook Input Container */}
          <div className="relative bg-[#121B2D] rounded-2xl border border-[#1E2B45] focus-within:border-[#7887C7]/70 focus-within:ring-1 focus-within:ring-[#7887C7]/30 transition-all shadow-xs">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What are you noticing right now? Take your time..."
              rows={3}
              className="w-full px-4 pt-3 pb-10 bg-transparent border-none focus:outline-none resize-none text-sm sm:text-base text-[#F0F2F7] placeholder:text-[#8A99B5]/40 leading-relaxed font-light"
            />

            {/* Bottom Input Controls */}
            <div className="absolute bottom-2.5 left-4 right-3 flex items-center justify-between pointer-events-none">
              <span className="text-[11px] text-[#8A99B5]">
                {wordCount > 0 ? `${wordCount} words` : "Shift + Enter for new line"}
              </span>

              <button
                onClick={() => handleSend("reflect")}
                disabled={isGenerating || !inputText.trim()}
                className="pointer-events-auto p-2 rounded-xl bg-[#7887C7] text-white hover:bg-[#8696d7] disabled:opacity-20 disabled:hover:bg-[#7887C7] transition-all shadow-xs flex items-center justify-center"
                title="Send reflection to companion"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
