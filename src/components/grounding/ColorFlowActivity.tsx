import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, Waves } from "lucide-react";

type FlowPalette = "midnight-aurora" | "nocturnal-ocean" | "starlight-mist";

export const ColorFlowActivity: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [palette, setPalette] = useState<FlowPalette>("midnight-aurora");
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  const palettes: Record<FlowPalette, { name: string; colors: string[] }> = {
    "midnight-aurora": {
      name: "Midnight Aurora",
      colors: ["#080D18", "#121B2D", "#18243A", "#7887C7", "#9A91C9"],
    },
    "nocturnal-ocean": {
      name: "Nocturnal Ocean",
      colors: ["#060B14", "#0F1E36", "#173154", "#3D6B8C", "#6FA3B8"],
    },
    "starlight-mist": {
      name: "Starlight Mist",
      colors: ["#0A0F1D", "#151B30", "#24254A", "#5B5B8A", "#8F93B8"],
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      if (isPlaying) {
        timeRef.current += 0.008; // very slow, calming flow
      }

      const t = timeRef.current;
      const mouse = mousePosRef.current;
      const currentColors = palettes[palette].colors;

      // Base night background
      ctx.fillStyle = currentColors[0];
      ctx.fillRect(0, 0, width, height);

      // Draw 4 organic undulating translucent flowing ribbons
      for (let layer = 0; layer < 4; layer++) {
        ctx.beginPath();
        const baseOffset = (layer * Math.PI) / 2.5;
        const color = currentColors[layer + 1] || currentColors[1];

        // Create gradient along vertical
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, color + "20"); // 12% opacity
        grad.addColorStop(0.5, color + "55"); // 35% opacity
        grad.addColorStop(1, color + "15");

        ctx.fillStyle = grad;
        ctx.moveTo(0, height);

        const segments = 40;
        const step = width / segments;

        for (let i = 0; i <= segments; i++) {
          const x = i * step;
          const normX = x / width;

          // Influence from gentle mouse cursor position
          const distToMouse = Math.abs(normX - mouse.x);
          const mouseInfluence = Math.exp(-distToMouse * 3) * (mouse.y - 0.5) * 40;

          // Wave equation
          const wave1 = Math.sin(normX * 3.5 + t + baseOffset) * 35;
          const wave2 = Math.cos(normX * 2.0 - t * 0.7 + layer) * 25;
          const wave3 = Math.sin(normX * 5.0 + t * 1.2) * 12;

          const y = height * (0.45 + layer * 0.12) + wave1 + wave2 + wave3 + mouseInfluence;

          if (i === 0) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }

      // Soft luminous moonlight reflection in the center
      const centerX = width * (0.3 + mouse.x * 0.4);
      const centerY = height * (0.3 + mouse.y * 0.4);
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        Math.min(width, height) * 0.6
      );
      glowGrad.addColorStop(0, currentColors[3] + "35");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, palette]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    mousePosRef.current = { x, y };
  };

  return (
    <div className="flex flex-col items-center justify-between max-w-xl w-full mx-auto h-[480px] sm:h-[520px] p-4 text-center select-none space-y-4">
      {/* Header controls: Palette picker */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center space-x-1.5 bg-[#0D1424] border border-[#1E2B45] p-1 rounded-xl text-xs">
          <Waves className="w-3.5 h-3.5 text-[#91A8C7] ml-2" />
          <span className="text-[#8A99B5] text-[11px] pr-1">Theme:</span>
          {(Object.keys(palettes) as FlowPalette[]).map((pKey) => (
            <button
              key={pKey}
              onClick={() => setPalette(pKey)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                palette === pKey
                  ? "bg-[#7887C7] text-white"
                  : "text-[#8A99B5] hover:text-[#F0F2F7] hover:bg-[#18243A]"
              }`}
            >
              {palettes[pKey].name}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#121B2D] hover:bg-[#18243A] text-xs text-[#F0F2F7] border border-[#1E2B45] rounded-xl transition-colors"
          title={isPlaying ? "Pause motion" : "Play motion"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3 text-[#91A8C7]" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-[#7887C7]" />
              <span>Flow</span>
            </>
          )}
        </button>
      </div>

      {/* Canvas viewport */}
      <div
        onPointerMove={handlePointerMove}
        className="relative w-full flex-1 max-h-[340px] rounded-2xl border border-[#1E2B45] overflow-hidden shadow-inner cursor-crosshair"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute bottom-3 left-0 right-0 pointer-events-none text-center">
          <span className="text-[11px] text-[#8A99B5]/80 bg-[#080D18]/70 px-3 py-1 rounded-full backdrop-blur-xs border border-[#1E2B45]/60">
            Slowly glide your cursor or touch to guide the nocturnal current
          </span>
        </div>
      </div>

      {/* Footer message */}
      <div className="shrink-0 text-center">
        <p className="text-xs text-[#8A99B5] font-serif-display italic">
          “Allow your gaze to soften and follow the quiet ebb and flow of the night.”
        </p>
      </div>
    </div>
  );
};
