/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { onAuthStateChanged, signOut, signInWithPopup, googleProvider, auth, type User } from "./firebase";
import {
  syncUserProfile,
  subscribeToUserEntries,
  saveJournalEntry,
  deleteJournalEntry,
} from "./services/firestoreService";
import { requestGeminiReflection } from "./services/geminiService";
import type { JournalEntry, UserProfile, MicroWellness, ChatMessage } from "./types";
import { Navbar } from "./components/Navbar";
import { Sidebar, type ActiveNavTab } from "./components/Sidebar";
import { AuthLanding } from "./components/AuthLanding";
import { GroundingSidebar } from "./components/GroundingSidebar";
import { JournalEditor } from "./components/JournalEditor";
import { DashboardView } from "./components/DashboardView";
import { CalendarView } from "./components/CalendarView";
import { InsightsView } from "./components/InsightsView";
import { SearchEntriesView } from "./components/SearchEntriesView";
import { ThreatModelModal } from "./components/ThreatModelModal";
import { GroundingModal, type GroundingActivityId } from "./components/grounding/GroundingModal";
import { DearULogo } from "./components/DearULogo";
import { Moon, BookOpen, Calendar, Search, Compass, Plus, Heart } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [currentTab, setCurrentTab] = useState<ActiveNavTab>("dashboard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isGroundingMobileOpen, setIsGroundingMobileOpen] = useState(false);
  const [isThreatModelOpen, setIsThreatModelOpen] = useState(false);
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);
  const [groundingInitialActivity, setGroundingInitialActivity] = useState<GroundingActivityId | null>(null);
  const [activeWellness, setActiveWellness] = useState<MicroWellness | null>(null);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute resolved Today's Reflection entry to prevent duplication across views
  const todayEntry = useMemo(() => {
    const isTodayDate = (isoString?: string) => {
      if (!isoString) return false;
      try {
        return new Date(isoString).toDateString() === new Date().toDateString();
      } catch {
        return false;
      }
    };

    if (activeEntry && (isTodayDate(activeEntry.createdAt) || activeEntry.title.toLowerCase().includes("today's reflections"))) {
      return activeEntry;
    }

    return (
      entries.find(
        (e) =>
          isTodayDate(e.createdAt) ||
          isTodayDate(e.updatedAt) ||
          e.title.toLowerCase().includes("today's reflections") ||
          e.title.toLowerCase().includes("today")
      ) || (entries.length > 0 && isTodayDate(entries[0].createdAt) ? entries[0] : null)
    );
  }, [entries, activeEntry]);

  // Helper to create a new empty journal entry
  const createNewEntry = useCallback((userId: string): JournalEntry => {
    const newId = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    return {
      id: newId,
      userId,
      title: "Today's Reflections",
      mood: "reflective",
      summary: "",
      tags: ["daily"],
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
  }, []);

  // Handler for instant Guest / Demo session
  const handleStartGuestDemo = useCallback(() => {
    const demoUser: UserProfile = {
      uid: "guest_demo_user",
      displayName: "Guest Reflector",
      email: null,
      photoURL: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isLocalDemo: true,
    };
    setCurrentUser(demoUser);

    try {
      const stored =
        localStorage.getItem("dearu_demo_entries") ||
        localStorage.getItem("reflectai_demo_entries");
      if (stored) {
        const parsed: JournalEntry[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
          setActiveEntry(parsed[0]);
          return;
        }
      }
    } catch {
      // Ignore local storage error
    }

    const fresh = createNewEntry("guest_demo_user");
    setEntries([fresh]);
    setActiveEntry(fresh);
    setCurrentTab("journal");
  }, [createNewEntry]);

  // Handler for Google Sign In from anywhere in app
  const handleGoogleSignIn = async () => {
    try {
      setIsSaving(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        alert(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || "Reflector",
          email: firebaseUser.email || null,
          photoURL: firebaseUser.photoURL,
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isLocalDemo: false,
        };
        setCurrentUser(profile);

        // Sync root user profile document to /users/{userId}
        try {
          await syncUserProfile(profile);
        } catch (err) {
          console.warn("Could not sync user profile:", err);
        }
      } else {
        // If not in local demo mode, reset to unauthenticated
        setCurrentUser((prev) => (prev?.isLocalDemo ? prev : null));
        if (!currentUser?.isLocalDemo) {
          setActiveEntry(null);
          setEntries([]);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore subscription to /users/{userId}/entries (for authenticated Firebase users)
  useEffect(() => {
    if (!currentUser?.uid || currentUser.isLocalDemo) return;

    const unsubscribe = subscribeToUserEntries(
      currentUser.uid,
      (fetchedEntries) => {
        setEntries(fetchedEntries);

        // If no active entry is selected, pick the latest or create a new one
        setActiveEntry((prevActive) => {
          if (prevActive) {
            const matching = fetchedEntries.find((e) => e.id === prevActive.id);
            return matching || prevActive;
          }

          if (fetchedEntries.length > 0) {
            return fetchedEntries[0];
          }

          return createNewEntry(currentUser.uid);
        });
      },
      (error) => {
        console.error("Firestore subscription error:", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, currentUser?.isLocalDemo, createNewEntry]);

  // Debounced auto-save function
  const queueAutoSave = useCallback(
    (entryToSave: JournalEntry) => {
      if (!currentUser?.uid) return;
      setIsSaving(true);

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(async () => {
        try {
          if (currentUser.isLocalDemo) {
            // Save to localStorage for demo user
            setEntries((prev) => {
              const updated = prev.map((e) => (e.id === entryToSave.id ? entryToSave : e));
              localStorage.setItem("dearu_demo_entries", JSON.stringify(updated));
              localStorage.setItem("reflectai_demo_entries", JSON.stringify(updated));
              return updated;
            });
          } else {
            // Save to Cloud Firestore
            await saveJournalEntry(currentUser.uid, entryToSave);
          }
        } catch (err) {
          console.error("Failed to auto-save journal entry:", err);
        } finally {
          setIsSaving(false);
        }
      }, 800);
    },
    [currentUser]
  );

  // Update active entry metadata (title, mood)
  const handleUpdateActiveEntry = (updatedFields: Partial<JournalEntry>) => {
    setActiveEntry((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        ...updatedFields,
        updatedAt: new Date().toISOString(),
      };
      queueAutoSave(updated);
      return updated;
    });
  };

  // Start a fresh new entry
  const handleStartNewEntry = () => {
    if (!currentUser?.uid) return;
    const freshEntry = createNewEntry(currentUser.uid);
    setActiveEntry(freshEntry);
    setEntries((prev) => [freshEntry, ...prev.filter((e) => e.id !== freshEntry.id)]);
    setCurrentTab("journal");

    if (currentUser.isLocalDemo) {
      const updated = [freshEntry, ...entries.filter((e) => e.id !== freshEntry.id)];
      localStorage.setItem("dearu_demo_entries", JSON.stringify(updated));
      localStorage.setItem("reflectai_demo_entries", JSON.stringify(updated));
    } else {
      setIsSaving(true);
      saveJournalEntry(currentUser.uid, freshEntry)
        .catch((err) => console.error("Error creating entry:", err))
        .finally(() => setIsSaving(false));
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser?.uid) return;
    try {
      if (currentUser.isLocalDemo) {
        const updated = entries.filter((e) => e.id !== entryId);
        setEntries(updated);
        localStorage.setItem("dearu_demo_entries", JSON.stringify(updated));
        localStorage.setItem("reflectai_demo_entries", JSON.stringify(updated));
      } else {
        await deleteJournalEntry(currentUser.uid, entryId);
      }

      if (activeEntry?.id === entryId) {
        const remaining = entries.filter((e) => e.id !== entryId);
        if (remaining.length > 0) {
          setActiveEntry(remaining[0]);
        } else {
          handleStartNewEntry();
        }
      }
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  // Switch to an entry and open the editor
  const handleSelectEntryAndOpen = (entry: JournalEntry) => {
    setActiveEntry(entry);
    setCurrentTab("journal");
  };

  // Handle Multi-Turn Dialogue and Actions with Gemini API
  const handleSendMessage = async (
    content: string,
    action: "reflect" | "summarize" | "brainstorm" | "prompts" = "reflect"
  ) => {
    if (!currentUser?.uid || !activeEntry) return;

    const userMessage: ChatMessage | null = content
      ? {
          id: `msg_${Date.now()}_user`,
          role: "user",
          content,
          timestamp: new Date().toISOString(),
        }
      : null;

    const updatedMessages = userMessage
      ? [...activeEntry.messages, userMessage]
      : [...activeEntry.messages];

    const entryWithUserMsg: JournalEntry = {
      ...activeEntry,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };
    setActiveEntry(entryWithUserMsg);
    setIsGenerating(true);

    try {
      const response = await requestGeminiReflection({
        prompt: content,
        messages: updatedMessages,
        entryTitle: entryWithUserMsg.title,
        entryMood: entryWithUserMsg.mood,
        action,
      });

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: "assistant",
        content: response.text,
        timestamp: new Date().toISOString(),
      };

      const finalSummary =
        action === "summarize" ? response.text : entryWithUserMsg.summary;

      const finalEntry: JournalEntry = {
        ...entryWithUserMsg,
        summary: finalSummary,
        messages: [...updatedMessages, assistantMessage],
        updatedAt: new Date().toISOString(),
      };

      setActiveEntry(finalEntry);
      setEntries((prev) =>
        prev.map((e) => (e.id === finalEntry.id ? finalEntry : e))
      );

      if (response.microWellness?.needed) {
        setActiveWellness(response.microWellness);
      }

      setIsSaving(true);
      if (currentUser.isLocalDemo) {
        setEntries((prev) => {
          const updated = prev.map((e) => (e.id === finalEntry.id ? finalEntry : e));
          localStorage.setItem("dearu_demo_entries", JSON.stringify(updated));
          localStorage.setItem("reflectai_demo_entries", JSON.stringify(updated));
          return updated;
        });
      } else {
        await saveJournalEntry(currentUser.uid, finalEntry);
      }
    } catch (err: any) {
      console.error("Gemini reflection failed:", err);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: "assistant",
        content: `*I encountered an issue connecting with Gemini: ${
          err?.message || "Please check your network connection."
        }*\n\nYour reflection has been safely preserved in your private vault.`,
        timestamp: new Date().toISOString(),
      };
      const fallbackEntry: JournalEntry = {
        ...entryWithUserMsg,
        messages: [...updatedMessages, errorMessage],
        updatedAt: new Date().toISOString(),
      };
      setActiveEntry(fallbackEntry);
      if (!currentUser.isLocalDemo) {
        await saveJournalEntry(currentUser.uid, fallbackEntry);
      }
    } finally {
      setIsGenerating(false);
      setIsSaving(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      if (currentUser?.isLocalDemo) {
        setCurrentUser(null);
        setActiveEntry(null);
        setEntries([]);
      } else {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Auth Loading Screen in Midnight theme
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080D18] night-sky-bg flex flex-col items-center justify-center p-6 text-[#F0F2F7] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#121B2D] border border-[#1E2B45] text-[#91A8C7] flex items-center justify-center shadow-lg animate-pulse">
          <DearULogo className="w-[35px] h-[35px] text-[#7887C7]" />
        </div>
        <p className="font-serif-display font-medium text-sm text-[#8A99B5]">
          Opening your private midnight journal...
        </p>
      </div>
    );
  }

  // Unauthenticated: Show Landing Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#080D18] flex flex-col selection:bg-[#7887C7]/30 text-[#F0F2F7]">
        <AuthLanding
          onOpenThreatModel={() => setIsThreatModelOpen(true)}
          onStartGuestDemo={handleStartGuestDemo}
        />
        <ThreatModelModal
          isOpen={isThreatModelOpen}
          onClose={() => setIsThreatModelOpen(false)}
        />
      </div>
    );
  }

  // Authenticated: Midnight Private Journal Shell
  return (
    <div className="min-h-screen h-screen bg-[#080D18] text-[#F0F2F7] flex selection:bg-[#7887C7]/30 overflow-hidden">
      {/* Desktop & Mobile Persistent Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onNewEntry={handleStartNewEntry}
        entriesCount={entries.length}
        user={currentUser}
        onSignOut={handleSignOut}
        onOpenThreatModel={() => setIsThreatModelOpen(true)}
        onGoogleSignIn={handleGoogleSignIn}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      {/* Main App Column: Top Navbar + (Center Active View + Right Grounding Sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar Header */}
        <Navbar
          user={currentUser}
          onSignOut={handleSignOut}
          onOpenThreatModel={() => setIsThreatModelOpen(true)}
          onGoogleSignIn={handleGoogleSignIn}
          isSaving={isSaving}
          onToggleSidebar={() => setIsSidebarMobileOpen((prev) => !prev)}
        />

        {/* Center Content & Right Sidebar Container */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Content Region */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-14 lg:pb-0">
            {currentTab === "journal" && activeEntry && (
              <JournalEditor
                entry={activeEntry}
                onUpdateEntry={handleUpdateActiveEntry}
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
                activeWellnessPrompt={activeWellness}
                onDismissWellness={() => setActiveWellness(null)}
                onToggleSidebar={() => setIsGroundingMobileOpen((prev) => !prev)}
                isSaving={isSaving}
              />
            )}

            {currentTab === "journal" && !activeEntry && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-[#8A99B5] text-center space-y-4">
                <Moon className="w-10 h-10 text-[#7887C7] opacity-60" />
                <p className="font-serif-display text-base text-[#F0F2F7]">
                  No reflection is currently open.
                </p>
                <button
                  onClick={handleStartNewEntry}
                  className="px-4 py-2 bg-[#7887C7] hover:bg-[#8696d7] text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Create New Entry
                </button>
              </div>
            )}

            {currentTab === "dashboard" && (
              <DashboardView
                entries={entries}
                todayEntryId={todayEntry?.id}
                onSelectEntry={handleSelectEntryAndOpen}
                userName={currentUser.displayName}
              />
            )}

            {currentTab === "entries" && (
              <SearchEntriesView
                entries={entries}
                onSelectEntry={handleSelectEntryAndOpen}
                onNewEntry={handleStartNewEntry}
              />
            )}

            {currentTab === "calendar" && (
              <CalendarView
                entries={entries}
                onSelectEntry={handleSelectEntryAndOpen}
              />
            )}

            {currentTab === "insights" && (
              <InsightsView
                entries={entries}
                onSelectEntry={handleSelectEntryAndOpen}
                onNewEntry={handleStartNewEntry}
              />
            )}

            {currentTab === "search" && (
              <SearchEntriesView
                entries={entries}
                onSelectEntry={handleSelectEntryAndOpen}
                onNewEntry={handleStartNewEntry}
              />
            )}
          </div>

          {/* RIGHT SIDEBAR: Grounding Panel */}
          <GroundingSidebar
            onSelectActivity={(actId) => {
              setGroundingInitialActivity(actId);
              setIsGroundingOpen(true);
            }}
            isOpenMobile={isGroundingMobileOpen}
            onCloseMobile={() => setIsGroundingMobileOpen(false)}
          />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0D1424] border-t border-[#1E2B45] flex items-center justify-around z-30 px-2">
        <button
          onClick={() => setCurrentTab("dashboard")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] ${
            currentTab === "dashboard" ? "text-[#7887C7]" : "text-[#8A99B5]"
          }`}
        >
          <Moon className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentTab("journal")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] ${
            currentTab === "journal" ? "text-[#7887C7]" : "text-[#8A99B5]"
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Journal</span>
        </button>

        <button
          onClick={handleStartNewEntry}
          className="flex items-center justify-center w-10 h-10 -mt-3 rounded-full bg-[#7887C7] text-white shadow-md active:scale-95 transition-transform"
          title="New Entry"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsGroundingMobileOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] text-[#8A99B5] hover:text-[#F0F2F7]"
        >
          <Heart className="w-4 h-4 mb-0.5 text-rose-400" />
          <span>Grounding</span>
        </button>

        <button
          onClick={() => setCurrentTab("search")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] ${
            currentTab === "search" || currentTab === "entries" ? "text-[#7887C7]" : "text-[#8A99B5]"
          }`}
        >
          <Search className="w-4 h-4 mb-0.5" />
          <span>Search</span>
        </button>
      </div>

      {/* Security Threat Model Modal */}
      <ThreatModelModal
        isOpen={isThreatModelOpen}
        onClose={() => setIsThreatModelOpen(false)}
      />

      {/* Grounding Space Activity Selector & Calm Experiences Modal */}
      <GroundingModal
        isOpen={isGroundingOpen}
        onClose={() => setIsGroundingOpen(false)}
        initialActivity={groundingInitialActivity}
      />
    </div>
  );
}
