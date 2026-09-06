import React from "react";

interface DearULogoProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * DearU Official Brand Mark
 *
 * Exact Visual Reference from User Asset:
 * - Minimalist feather / quill pen
 * - Flowing curved ink stroke underneath
 * - Small four-point outline sparkle near the end of the curve
 *
 * Strict Outline & Line-Art Only:
 * - NO filled shapes (fill="none")
 * - NO solid interior
 * - NO shading or gradients
 * - NO 3D effects or internal glow
 * - Clean strokes with open negative space
 * - Fully responsive and scalable
 */
export const DearULogo: React.FC<DearULogoProps> = ({
  className = "w-6 h-6 text-[#7887C7]",
  size,
  strokeWidth = 1.5,
}) => {
  return (
    <svg
      viewBox="13 13 45 43"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="DearU Logo"
    >
      {/* 1. Feather Quill Pen */}
      {/* Central rachis (spine) of the feather leading to the quill nib */}
      <path d="M26.8 50.2 C28.8 44.5 33.2 32 42.8 15.2" />

      {/* Nib point and lower shaft */}
      <path d="M25.6 44.2 L26.8 50.2 L28.6 43.8" />

      {/* Right vane with distinct feather notches/barbs */}
      <path d="M42.8 15.2 C42.2 19 41.5 22.8 38.6 24.2 C40.8 26.8 40.2 30.5 37.2 32.8 C38.8 35.2 37.5 39.2 34.2 41.2 C31.8 42.6 29.8 43.4 28.6 43.8" />

      {/* Left vane with natural slit and contour */}
      <path d="M27.2 43.2 C26.6 37.5 28.2 31.8 32.2 26.5 C34.5 23.5 37.8 19 42.8 15.2" />
      <path d="M29.2 36.8 C30.2 32.5 32.8 28.2 35.8 25.2" />

      {/* 2. Flowing Curved Ink Stroke Underneath */}
      <path d="M25.8 44.8 C21.5 44.8 15.2 46.2 15.2 49.8 C15.2 53.6 20.8 54.8 27.6 53.6 C35.8 52.2 42.5 47.8 46.8 47.4 C50.5 47 52.2 49.2 52.5 52.5" />

      {/* 3. Small Four-Point Outline Sparkle */}
      <path d="M52.5 37.5 C52.5 40.2 51.2 41.8 48.5 42.5 C51.2 43.2 52.5 44.8 52.5 47.5 C52.5 44.8 53.8 43.2 56.5 42.5 C53.8 41.8 52.5 40.2 52.5 37.5 Z" />
    </svg>
  );
};

