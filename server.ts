import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Upstream body parsers for defensive request ingestion
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment.");
    }
    geminiClient = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return geminiClient;
}

// Fallback ladder ordered by availability and latency per Enterprise Directives
const MODEL_LADDER = [
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.1-pro-preview",
  "gemini-2.5-flash",
];

// Sensitive Identifiers Redaction (Zero-Disclosure Denylist: Aadhaar, RRN, MyNumber)
function redactSensitiveIdentifiers(text: string): string {
  if (!text || typeof text !== "string") return "";

  let cleaned = text;

  // Aadhaar (12 digits, often grouped in 4-4-4)
  cleaned = cleaned.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[Aadhaar Redacted]");

  // Korean Resident Registration Number (RRN: 6 digits - 7 digits)
  cleaned = cleaned.replace(/\b\d{6}[\s-]?[1-8]\d{6}\b/g, "[RRN Omitted]");

  // Japanese MyNumber (12 digits with contextual check or format)
  cleaned = cleaned.replace(/(?:my\s*number|individual\s*number)[\s:]*(\d{4}[\s-]?\d{4}[\s-]?\d{4}|\d{12})/gi, "[MyNumber Redacted]");

  return cleaned;
}

// Micro-Wellness Detection for acute stress / overwhelm
function checkMicroWellnessNeed(text: string): { needed: boolean; exerciseType?: string; suggestion?: string } {
  const stressTriggers = [
    /\b(panic|panicking|panic attack)\b/i,
    /\b(can'?t breathe|hyperventilat\w+)\b/i,
    /\b(overwhelm\w*|breakdown|breaking down)\b/i,
    /\b(extreme(ly)? stressed|severe anxiety|anxious attack)\b/i,
    /\b(so tired of everything|drowning in work|can'?t take it)\b/i,
  ];

  const hasTrigger = stressTriggers.some((rgx) => rgx.test(text));
  if (hasTrigger) {
    return {
      needed: true,
      exerciseType: "box-breathing",
      suggestion: "I noticed you're feeling deeply overwhelmed right now. Before diving into reflections, take 60 seconds with this guided box-breathing rhythm to steady your heart rate.",
    };
  }

  return { needed: false };
}

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Primary Reflection & AI Dialogue Endpoint
app.post("/api/gemini/reflect", async (req, res) => {
  try {
    // Null-safe payload destructuring per Enterprise Directive
    const data = (req.body && typeof req.body === "object") ? req.body : {};
    const {
      prompt = "",
      messages = [],
      entryTitle = "",
      entryMood = "",
      action = "reflect", // "reflect" | "summarize" | "brainstorm" | "prompts"
    } = data;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please configure it in the Secrets panel.",
      });
    }

    const ai = getGeminiClient();

    // Redact incoming prompt and sanitize
    const sanitizedPrompt = redactSensitiveIdentifiers(String(prompt || ""));
    const microWellness = checkMicroWellnessNeed(sanitizedPrompt);

    // Build system instruction based on action
    let systemInstruction = `You are DearU, an empathetic, calm, observational, and thoughtful personal reflection companion.
Your goal is to help the user unpack their thoughts, emotions, dilemmas, and aspirations in their private midnight journal.
- Speak in a warm, grounded, observational, and quiet tone.
- Avoid robotic platitudes or shallow generic praise (e.g. never say "That's awesome! Good for you!").
- Offer deep perspectives, gentle clarifying questions, and balanced insights.
- Never output, guess, or verify Aadhaar, RRN, or MyNumber identifiers under any circumstances.`;

    if (action === "summarize") {
      systemInstruction += `\nThe user wants a concise, elegant synthesis of this journal session.
Provide:
1. **Core Theme**: A 1-2 sentence distillation of the central dilemma, realization, or feeling.
2. **Key Insights**: 2-3 bullet points highlighting shifts in perspective or recurring patterns.
3. **Gentle Takeaway**: One grounding takeaway or intention for the days ahead.`;
    } else if (action === "brainstorm") {
      systemInstruction += `\nThe user wants to brainstorm actionable paths forward or creative angles related to their journal entry.
Provide structured, low-friction, practical ideas organized into clear categories, with encouragement to start small.`;
    } else if (action === "prompts") {
      systemInstruction += `\nThe user wants 3-4 thoughtful, deep follow-up journaling prompts inspired by what they've shared so far to help them explore uncharted corners of this topic.`;
    }

    // Format conversation history for Gemini contents
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    // Include recent messages (up to last 12 turns)
    const recentMessages = Array.isArray(messages) ? messages.slice(-12) : [];
    for (const msg of recentMessages) {
      if (!msg || typeof msg.content !== "string") continue;
      const role = msg.role === "assistant" ? "model" : "user";
      const cleanContent = redactSensitiveIdentifiers(msg.content);
      contents.push({
        role,
        parts: [{ text: cleanContent }],
      });
    }

    // Add current user prompt
    let userMessageContent = sanitizedPrompt;
    if (action === "summarize" && !userMessageContent) {
      userMessageContent = "Please synthesize and summarize my reflections so far in this journal entry.";
    } else if (action === "brainstorm" && !userMessageContent) {
      userMessageContent = "Please provide brainstorming angles and actionable paths forward based on what I've written.";
    } else if (action === "prompts" && !userMessageContent) {
      userMessageContent = "Please suggest thoughtful deeper inquiry questions and journal prompts for me.";
    }

    // Context prefix if metadata is available
    let contextHeader = "";
    if (entryTitle || entryMood) {
      contextHeader = `[Context - Title: "${entryTitle || "Untitled"}", Current Mood: "${entryMood || "Reflective"}"]\n\n`;
    }

    contents.push({
      role: "user",
      parts: [{ text: contextHeader + userMessageContent }],
    });

    // Execute with Fallback Ladder
    let lastError: any = null;
    let successfulResult: string | null = null;
    let modelUsed = "";

    for (const modelName of MODEL_LADDER) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: action === "summarize" ? 0.3 : 0.7,
          },
        });

        if (response && response.text) {
          successfulResult = response.text;
          modelUsed = modelName;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed, attempting next in ladder...`, err?.message || err);
        // Sequential attempt to next model
      }
    }

    if (!successfulResult) {
      throw lastError || new Error("Failed to generate reflection across all models in fallback ladder.");
    }

    // Redact response output for safety per Zero-Disclosure Denylist
    const safeOutput = redactSensitiveIdentifiers(successfulResult);

    return res.json({
      text: safeOutput,
      model: modelUsed,
      microWellness,
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/reflect:", error);
    return res.status(500).json({
      error: error?.message || "An unexpected error occurred while generating reflections.",
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ReflectAI server listening on port ${PORT}`);
  });
}

startServer();
