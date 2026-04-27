/**
 * AuthContext — Firebase Authentication provider for React.
 *
 * Initialises the Firebase app, listens to auth state changes via
 * onAuthStateChanged, and provides:
 *  - user: the current Firebase user (or null)
 *  - loading: true while the initial auth check is in progress
 *  - getToken(): returns the current ID token string (or null)
 *  - loginWithEmail(email, password)
 *  - signupWithEmail(email, password)
 *  - loginWithGoogle()
 *  - loginAsGuest()
 *  - logout()
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

// ── Firebase config from Vite env ──────────────────────────────────────────

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getToken = useCallback(async () => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }, [user]);

  const loginWithEmail = useCallback(
    (email, password) => signInWithEmailAndPassword(auth, email, password),
    [],
  );

  const signupWithEmail = useCallback(
    (email, password) => createUserWithEmailAndPassword(auth, email, password),
    [],
  );

  const loginWithGoogle = useCallback(() => signInWithPopup(auth, googleProvider), []);

  const loginAsGuest = useCallback(() => signInAnonymously(auth), []);

  const logout = useCallback(() => signOut(auth), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      getToken,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      loginAsGuest,
      logout,
    }),
    [
      user,
      loading,
      getToken,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      loginAsGuest,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
