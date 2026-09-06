import React from "react";
import { Shield, LogOut, CheckCircle2, CloudUpload, Menu } from "lucide-react";
import type { UserProfile } from "../types";

interface NavbarProps {
  user: UserProfile | null;
  onSignOut: () => void;
  onOpenThreatModel: () => void;
  onGoogleSignIn?: () => void;
  isSaving: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignOut,
  onOpenThreatModel,
  onGoogleSignIn,
  isSaving,
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0D1424]/90 backdrop-blur-md border-b border-[#1E2B45]">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile menu toggle for sidebar on smaller screens */}
        <div className="flex items-center">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-xl transition-colors"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Right: Essential controls (Sync Status, Threat Model, Profile, Logout) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Real-time Save / Sync Status */}
          <div className="flex items-center space-x-1.5 text-xs text-[#8A99B5] mr-1 sm:mr-2">
            {user?.isLocalDemo ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#18243A] text-[#91A8C7] border border-[#7887C7]/30 text-[11px] font-medium">
                Guest Mode (Local)
              </span>
            ) : isSaving ? (
              <>
                <CloudUpload className="w-3.5 h-3.5 text-[#7887C7] animate-bounce" />
                <span className="text-[#91A8C7] hidden sm:inline">Syncing to Firestore...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[#8A99B5] hidden sm:inline">Encrypted in Firestore</span>
              </>
            )}
          </div>

          {user?.isLocalDemo && onGoogleSignIn && (
            <button
              onClick={onGoogleSignIn}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-[#7887C7] hover:bg-[#8696d7] text-white rounded-xl text-xs font-medium shadow-xs transition-colors"
            >
              <span>Sign In with Google</span>
            </button>
          )}

          {/* Threat Model Security Button */}
          <button
            onClick={onOpenThreatModel}
            className="flex items-center space-x-1 px-2.5 py-2 text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A] rounded-xl text-xs font-medium border border-[#1E2B45] transition-colors"
            title="View Security Threat Model"
          >
            <Shield className="w-3.5 h-3.5 text-[#7887C7]" />
            <span className="hidden md:inline">Threat Model</span>
          </button>

          {/* User Profile & Sign Out */}
          {user && (
            <div className="flex items-center space-x-2 pl-2 border-l border-[#1E2B45]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User Avatar"}
                  className="w-8 h-8 rounded-full border border-[#1E2B45] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#18243A] text-[#91A8C7] border border-[#1E2B45] font-semibold text-xs flex items-center justify-center">
                  {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}

              <button
                onClick={onSignOut}
                className="p-2 text-[#8A99B5] hover:text-rose-400 hover:bg-[#18243A] rounded-xl transition-colors"
                title="Sign out of your journal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
