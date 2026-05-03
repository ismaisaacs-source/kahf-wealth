import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { appEnv, isFirebaseConfigured } from "../config/env";

const app = isFirebaseConfigured()
  ? getApps()[0] ?? initializeApp(appEnv.firebaseConfig)
  : null;

export const firebaseApp: FirebaseApp | null = app;

export const firebaseAuth = (() => {
  if (!app || !isFirebaseConfigured()) {
    return null;
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})() as Auth | null;
