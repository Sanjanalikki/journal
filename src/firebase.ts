import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocFromServer,
  type Firestore,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use named database if firestoreDatabaseId is provided, else default
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Test connection per Firebase Skill requirements
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    // Attempting a server read verifies network connectivity to the database
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error: any) {
    // Note: permission-denied is normal because security rules lock down test collection,
    // but indicates successful connectivity to the Firestore service.
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore client is offline. Please check your network or configuration.");
      return false;
    }
    return true;
  }
}

// Initial connection test
testFirestoreConnection();

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
};
