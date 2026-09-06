import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import type { JournalEntry, UserProfile } from "../types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Database Payload Hygiene: Strips all undefined fields to prevent Firestore serialization errors
export function sanitizePayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = sanitizePayload(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item !== null && typeof item === "object" ? sanitizePayload(item) : item
      );
    } else {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}

/**
 * Saves or updates a user's root profile in /users/{userId}
 */
export async function syncUserProfile(profile: UserProfile): Promise<void> {
  if (!profile.uid) throw new Error("Missing user UID for profile sync.");
  const path = `users/${profile.uid}`;
  const userRef = doc(db, "users", profile.uid);
  const sanitized = sanitizePayload({
    uid: profile.uid,
    displayName: profile.displayName || "Reflective Soul",
    email: profile.email || "",
    photoURL: profile.photoURL || "",
    createdAt: profile.createdAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });

  try {
    await setDoc(userRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to real-time updates of the user's private journal entries
 * Strict tenant isolation: only listens to /users/{userId}/entries
 */
export function subscribeToUserEntries(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError?: (error: Error) => void
) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const path = `users/${userId}/entries`;
  const entriesRef = collection(db, "users", userId, "entries");
  const entriesQuery = query(entriesRef, orderBy("updatedAt", "desc"));

  return onSnapshot(
    entriesQuery,
    (snapshot) => {
      const entries: JournalEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        entries.push({
          id: docSnap.id,
          userId: data.userId || userId,
          title: data.title || "Untitled Reflection",
          mood: data.mood || "reflective",
          summary: data.summary || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          messages: Array.isArray(data.messages) ? data.messages : [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      onUpdate(entries);
    },
    (err) => {
      console.error("Error subscribing to entries:", err);
      if (onError) {
        try {
          handleFirestoreError(err, OperationType.LIST, path);
        } catch (wrapped) {
          onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    }
  );
}

/**
 * Saves or updates a journal entry in /users/{userId}/entries/{entryId}
 */
export async function saveJournalEntry(userId: string, entry: JournalEntry): Promise<void> {
  if (!userId) throw new Error("User must be authenticated to save journal entries.");
  if (!entry.id) throw new Error("Journal entry requires a valid ID.");

  const path = `users/${userId}/entries/${entry.id}`;
  const entryRef = doc(db, "users", userId, "entries", entry.id);

  const payload = sanitizePayload({
    id: entry.id,
    userId,
    title: entry.title.trim() || "Untitled Reflection",
    mood: entry.mood || "reflective",
    summary: entry.summary || "",
    tags: entry.tags || [],
    messages: entry.messages || [],
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  try {
    await setDoc(entryRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a journal entry
 */
export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) return;
  const path = `users/${userId}/entries/${entryId}`;
  const entryRef = doc(db, "users", userId, "entries", entryId);
  try {
    await deleteDoc(entryRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
