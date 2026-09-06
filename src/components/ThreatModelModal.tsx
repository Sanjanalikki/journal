import React from "react";
import { ShieldCheck, X, Lock, Database, Cpu, Globe, KeyRound } from "lucide-react";

interface ThreatModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThreatModelModal: React.FC<ThreatModelModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const threatZones = [
    {
      zone: "Input Surfaces",
      icon: Lock,
      color: "text-amber-400 bg-amber-950/50 border border-amber-800/40",
      threats: "Untrusted user journal prompts, payload injection, zero-disclosure identifier leaks.",
      countermeasures: "Null-safe payload destructuring, client & server payload hygiene, and regex-based redaction of Indian Aadhaar, Korean RRN, and Japanese MyNumber digits (Zero-Disclosure Denylist).",
    },
    {
      zone: "Planning & Reasoning",
      icon: Cpu,
      color: "text-blue-400 bg-blue-950/50 border border-blue-800/40",
      threats: "Prompt injection, conversational hijacking, toxic advice or psychological harm.",
      countermeasures: "Strict system prompt bounding; conversational framing as an empathetic thought partner; automatic Micro-Wellness trigger (box breathing) when acute stress/overwhelm is detected.",
    },
    {
      zone: "Tool & API Execution",
      icon: ShieldCheck,
      color: "text-emerald-400 bg-emerald-950/50 border border-emerald-800/40",
      threats: "Privilege escalation, unauthorized Gemini access, resource exhaustion.",
      countermeasures: "Server-side proxy (/api/gemini/reflect) prevents frontend exposure of GEMINI_API_KEY. Multi-model fallback ladder (gemini-2.5-flash -> gemini-2.0-flash-lite -> gemini-2.0-flash -> gemini-2.5-pro).",
    },
    {
      zone: "Memory & State",
      icon: Database,
      color: "text-purple-400 bg-purple-950/50 border border-purple-800/40",
      threats: "Cross-tenant data leakage, unauthorized reads/writes to other users' private journals.",
      countermeasures: "Strict Firestore Security Rules enforcing path-level tenant isolation (/users/{userId}/entries/{entryId}) requiring request.auth.uid == userId. Zero insecure defaults. Automatic stripping of undefined values.",
    },
    {
      zone: "Inter-System Communication",
      icon: Globe,
      color: "text-sky-400 bg-sky-950/50 border border-sky-800/40",
      threats: "Secret leakage, MITM, unauthorized cloud service invocation.",
      countermeasures: "Gemini API keys stored solely in server environment variables (process.env.GEMINI_API_KEY). Firebase Auth handled via client-side OAuth popups with secure tokens.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D18]/85 backdrop-blur-md">
      <div className="bg-[#0D1424] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#1E2B45] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1E2B45] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#18243A] text-[#91A8C7] border border-[#7887C7]/30">
              <KeyRound className="w-5 h-5 text-[#7887C7]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif-display font-semibold text-[#F0F2F7]">
                DearU Security & Architecture Threat Model
              </h2>
              <p className="text-xs text-[#8A99B5]">
                5 Threat Zones & Implemented Production Countermeasures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8A99B5] hover:text-[#F0F2F7] rounded-lg transition-colors hover:bg-[#18243A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          <div className="grid gap-3.5">
            {threatZones.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.zone}
                  className="p-4 rounded-xl border border-[#1E2B45] bg-[#121B2D] hover:border-[#7887C7]/40 transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`p-1.5 rounded-md ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="font-serif-display font-semibold text-[#F0F2F7]">
                      {item.zone}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-rose-400 block mb-0.5">
                        Threat Analysis:
                      </span>
                      <p className="text-[#8A99B5] leading-relaxed">
                        {item.threats}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-400 block mb-0.5">
                        Active Countermeasures:
                      </span>
                      <p className="text-[#F0F2F7] font-light leading-relaxed">
                        {item.countermeasures}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#121B2D] border border-[#1E2B45] text-[#8A99B5] text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>
              <strong className="text-[#F0F2F7]">Zero-Disclosure Denylist:</strong> Aadhaar, RRN, and MyNumber are strictly redacted & never stored.
            </span>
            <span className="text-emerald-400 font-medium">
              Firestore Rules: Isolated by User ID
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1E2B45] bg-[#080D18] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#7887C7] hover:bg-[#8696d7] text-white rounded-xl text-xs font-medium transition-colors"
          >
            Close Threat Model
          </button>
        </div>
      </div>
    </div>
  );
};
