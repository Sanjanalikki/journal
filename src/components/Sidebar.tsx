import React from "react";
import {
  BookOpen,
  Calendar,
  Sparkles,
  Search,
  Plus,
  ShieldCheck,
  Lock,
  LogOut,
  Moon,
  Clock,
  X,
  Compass,
} from "lucide-react";
import type { UserProfile, JournalEntry } from "../types";
import { DearULogo } from "./DearULogo";

export type ActiveNavTab = "journal" | "dashboard" | "entries" | "calendar" | "insights" | "search";

interface SidebarProps {
  currentTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onNewEntry: () => void;
  entriesCount: number;
  user: UserProfile | null;
  onSignOut: () => void;
  onOpenThreatModel: () => void;
  onGoogleSignIn?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNewEntry,
  entriesCount,
  user,
  onSignOut,
  onOpenThreatModel,
  onGoogleSignIn,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: "journal" as ActiveNavTab,
      label: "My Journal",
      icon: BookOpen,
      desc: "Distraction-free writing room",
    },
    {
      id: "dashboard" as ActiveNavTab,
      label: "Home",
      icon: Moon,
      desc: "Evening overview & recent thoughts",
    },
    {
      id: "entries" as ActiveNavTab,
      label: "Entries",
      icon: Clock,
      badge: entriesCount > 0 ? entriesCount : undefined,
      desc: "All recorded memories",
    },
    {
      id: "calendar" as ActiveNavTab,
      label: "Calendar",
      icon: Calendar,
      desc: "Reflections by date",
    },
    {
      id: "insights" as ActiveNavTab,
      label: "Mood & Insights",
      icon: Compass,
      desc: "Patterns & reflections",
    },
    {
      id: "search" as ActiveNavTab,
      label: "Search Memories",
      icon: Search,
      desc: "Find past writings",
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#080D18]/80 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-68 bg-[#0D1424] border-r border-[#1E2B45] z-40 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1E2B45] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-[#18243A] border border-[#7887C7]/30 flex items-center justify-center text-[#91A8C7] shadow-xs shrink-0">
              <DearULogo className="w-[35px] h-[35px] text-[#91A8C7]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif-display text-lg font-bold text-[#F0F2F7] tracking-tight">
                  DearU
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#18243A] text-[#91A8C7] border border-[#7887C7]/20 tracking-wider">
                  Private
                </span>
              </div>
              <p className="text-[11px] text-[#8A99B5]">
                Secure Personal AI Journal
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action: + New Entry */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewEntry();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#7887C7] hover:bg-[#8696d7] text-white rounded-xl text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#7887C7]/40 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left group ${
                  isActive
                    ? "bg-[#18243A] text-[#F0F2F7] border border-[#7887C7]/30 shadow-xs"
                    : "text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#121B2D]"
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-[#7887C7]" : "text-[#8A99B5] group-hover:text-[#91A8C7]"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#121B2D] text-[#91A8C7] border border-[#1E2B45]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Panel: Privacy Status & User Profile */}
        <div className="p-4 border-t border-[#1E2B45] space-y-3 bg-[#0D1424]">
          {/* Subtle Privacy Status */}
          <div
            onClick={onOpenThreatModel}
            className="p-2.5 rounded-xl bg-[#121B2D]/80 border border-[#1E2B45] cursor-pointer hover:border-[#7887C7]/40 transition-colors"
            title="Inspect Privacy & Threat Model"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-[#91A8C7]">
                <Lock className="w-3.5 h-3.5 text-[#7887C7]" />
                <span className="font-medium text-[11px] text-[#F0F2F7]">
                  Your journal is private
                </span>
              </div>
              <span className="text-[10px] text-[#8A99B5] underline">Details</span>
            </div>
            <p className="text-[10px] text-[#8A99B5] mt-1 leading-tight">
              Isolated in Firestore. Only you can access your entries.
            </p>
          </div>

          {/* User Account Bar */}
          {user && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full border border-[#1E2B45] object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#18243A] text-[#91A8C7] border border-[#1E2B45] font-semibold text-xs flex items-center justify-center shrink-0">
                    {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F0F2F7] truncate">
                    {user.displayName || "Reflector"}
                  </p>
                  <p className="text-[10px] text-[#8A99B5] truncate">
                    {user.isLocalDemo ? "Guest (Local Mode)" : user.email || "Private User"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={onSignOut}
                  className="p-1.5 text-[#8A99B5] hover:text-rose-400 hover:bg-[#18243A] rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {user?.isLocalDemo && onGoogleSignIn && (
            <button
              onClick={onGoogleSignIn}
              className="w-full py-1.5 px-2.5 bg-[#18243A] hover:bg-[#20304c] text-[#91A8C7] hover:text-white rounded-lg text-[11px] font-medium border border-[#7887C7]/30 transition-colors flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#7887C7]" />
              <span>Connect Google Account</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
