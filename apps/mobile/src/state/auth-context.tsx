import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import type { AuthSessionResponse } from "@kahf/domain";
import { apiClient } from "../lib/api-client";
import { firebaseAuth } from "../lib/firebase";
import { firebaseSetup, isFirebaseConfigured } from "../config/env";

type AuthContextValue = {
  isConfigured: boolean;
  configIssues: string[];
  isLoading: boolean;
  firebaseUser: User | null;
  session: AuthSessionResponse | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  getIdToken: () => Promise<string>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSessionResponse | null>(null);
  const isConfigured = isFirebaseConfigured();
  const [isLoading, setIsLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured || !firebaseAuth) {
      setFirebaseUser(null);
      setSession(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setSession(null);
        setIsLoading(false);
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const nextSession = await apiClient.createSession(idToken);
        setSession(nextSession);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [isConfigured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured,
      configIssues: [
        ...firebaseSetup.missingFields.map((field) => `missing:${field}`),
        ...firebaseSetup.invalidFields.map((field) => `invalid:${field}`),
      ],
      isLoading,
      firebaseUser,
      session,
      async signIn(email, password) {
        if (!firebaseAuth) {
          throw new Error("Firebase is not configured yet.");
        }
        setIsLoading(true);
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      async signUp(name, email, password) {
        if (!firebaseAuth) {
          throw new Error("Firebase is not configured yet.");
        }
        setIsLoading(true);
        const credential = await createUserWithEmailAndPassword(
          firebaseAuth,
          email,
          password,
        );
        await updateProfile(credential.user, { displayName: name });
      },
      async signOutUser() {
        if (!firebaseAuth) {
          return;
        }
        setIsLoading(true);
        await signOut(firebaseAuth);
        setSession(null);
        setIsLoading(false);
      },
      async getIdToken() {
        if (!firebaseAuth?.currentUser) {
          throw new Error("No authenticated user.");
        }
        return firebaseAuth.currentUser.getIdToken();
      },
    }),
    [firebaseUser, isConfigured, isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return value;
}
