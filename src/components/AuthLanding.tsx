import React, { useState } from "react";
import { ArrowRight, MessageSquare, BookOpen, AlertCircle, Compass, History } from "lucide-react";
import { signInWithPopup, googleProvider, auth } from "../firebase";
import { DearULogo } from "./DearULogo";

interface AuthLandingProps {
  onOpenThreatModel?: () => void;
  onStartGuestDemo: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  onStartGuestDemo,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setErrorMessage(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      if (err.code === "auth/popup-blocked") {
        setErrorMessage(
          "Sign-in popup was blocked by your browser. Please allow popups or use Guest Mode to explore instantly."
        );
      } else if (
        err.code === "auth/cancelled-popup-request" ||
        err.code === "auth/popup-closed-by-user"
      ) {
        setErrorMessage("Sign-in was cancelled. Click below to try again.");
      } else {
        setErrorMessage(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGuestSignIn = () => {
    setErrorMessage(null);
    onStartGuestDemo();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 night-sky-bg text-[#F0F2F7]">
      <div className="max-w-4xl w-full mx-auto text-center space-y-8">
        {/* Product Name */}
        <div className="flex items-center justify-center space-x-3 text-2xl sm:text-3xl font-serif-display font-bold text-[#F0F2F7] tracking-tight">
          <DearULogo className="w-[32px] h-[32px] sm:w-[39px] sm:h-[39px] text-[#7887C7] shrink-0" />
          <span>DearU</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-display font-bold text-[#F0F2F7] tracking-tight leading-[1.15]">
          A penny for your thoughts?
        </h1>

        {/* Supporting Line */}
        <p className="max-w-xl mx-auto text-base sm:text-lg text-[#8A99B5] leading-relaxed font-light">
          Write it down. Reflect on it. Make it yours.
        </p>

        {errorMessage && (
          <div className="max-w-md mx-auto p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          {/* Primary CTA */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full sm:w-auto min-w-[170px] py-3.5 px-6 bg-[#7887C7] hover:bg-[#8696d7] text-white rounded-2xl text-sm font-medium transition-all shadow-md flex items-center justify-center space-x-2 group disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <span>{isSigningIn ? "Signing in..." : "Start Writing"}</span>
            <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Secondary CTA */}
          <button
            onClick={handleGuestSignIn}
            disabled={isSigningIn}
            className="w-full sm:w-auto min-w-[170px] py-3.5 px-6 bg-[#121B2D] hover:bg-[#18243A] text-[#F0F2F7] border border-[#1E2B45] rounded-2xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#91A8C7]" />
            <span>See How It Works</span>
          </button>
        </div>

        {/* Feature Highlights Bento */}
        <div className="grid sm:grid-cols-3 gap-5 text-left pt-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-[#121B2D]/80 border border-[#1E2B45] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#18243A] text-[#7887C7] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-serif-display font-semibold text-[#F0F2F7] text-sm">
              Write Privately
            </h3>
            <p className="text-xs text-[#8A99B5] leading-relaxed font-light">
              Capture whatever is on your mind — a long reflection, a small moment, or simply how today felt.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121B2D]/80 border border-[#1E2B45] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#18243A] text-[#91A8C7] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="font-serif-display font-semibold text-[#F0F2F7] text-sm">
              Reflect with Perspective
            </h3>
            <p className="text-xs text-[#8A99B5] leading-relaxed font-light">
              Use DearU's AI companion to explore what you've written from another perspective and uncover deeper questions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121B2D]/80 border border-[#1E2B45] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#18243A] text-emerald-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h3 className="font-serif-display font-semibold text-[#F0F2F7] text-sm">
              Remember & Ground
            </h3>
            <p className="text-xs text-[#8A99B5] leading-relaxed font-light">
              Return to your memories, notice your mood patterns, or take a gentle pause with calming grounding exercises.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
