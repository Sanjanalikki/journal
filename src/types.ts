export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export type EntryMood =
  | "reflective"
  | "grateful"
  | "calm"
  | "inspired"
  | "anxious"
  | "tired"
  | "hopeful"
  | "challenging";

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  mood: EntryMood;
  summary: string;
  tags: string[];
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt: string;
  isLocalDemo?: boolean;
}

export interface MicroWellness {
  needed: boolean;
  exerciseType?: string;
  suggestion?: string;
}

export interface GeminiReflectResponse {
  text: string;
  model: string;
  microWellness?: MicroWellness;
}
