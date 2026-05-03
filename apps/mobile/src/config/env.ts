import Constants from "expo-constants";

const extra =
  (Constants.expoConfig?.extra as {
    apiBaseUrl?: string;
    firebaseConfig?: {
      apiKey?: string;
      authDomain?: string;
      projectId?: string;
      storageBucket?: string;
      messagingSenderId?: string;
      appId?: string;
    };
  }) ?? {};

const firebaseConfig = {
  apiKey:
    extra.firebaseConfig?.apiKey?.trim() ??
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ??
    "",
  authDomain:
    extra.firebaseConfig?.authDomain?.trim() ??
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ??
    "",
  projectId:
    extra.firebaseConfig?.projectId?.trim() ??
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ??
    "",
  storageBucket:
    extra.firebaseConfig?.storageBucket?.trim() ??
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ??
    "",
  messagingSenderId:
    extra.firebaseConfig?.messagingSenderId?.trim() ??
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ??
    "",
  appId:
    extra.firebaseConfig?.appId?.trim() ??
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ??
    "",
};

const placeholderPatterns = [
  /^changeme$/i,
  /^replace[-_ ]?me$/i,
  /^your[-_ ].+/i,
  /^example$/i,
  /^example[-_ ].+/i,
  /^todo$/i,
  /^<.+>$/,
];

function looksLikePlaceholder(value: string) {
  return placeholderPatterns.some((pattern) => pattern.test(value));
}

function validateFirebaseConfig() {
  const missingFields = Object.entries(firebaseConfig)
    .filter(([, value]) => value.length === 0)
    .map(([key]) => key);

  const invalidFields = Object.entries(firebaseConfig)
    .filter(([, value]) => value.length > 0 && looksLikePlaceholder(value))
    .map(([key]) => key);

  const formatIssues = [
    firebaseConfig.apiKey && firebaseConfig.apiKey.length < 20 ? "apiKey" : null,
    firebaseConfig.authDomain &&
    !firebaseConfig.authDomain.includes(".")
      ? "authDomain"
      : null,
    firebaseConfig.appId && !firebaseConfig.appId.includes(":")
      ? "appId"
      : null,
  ].filter((value): value is string => Boolean(value));

  return {
    missingFields,
    invalidFields: [...new Set([...invalidFields, ...formatIssues])],
  };
}

export const appEnv = {
  apiBaseUrl:
    extra.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api",
  firebaseConfig,
};

export const firebaseSetup = validateFirebaseConfig();

export function isFirebaseConfigured() {
  return (
    firebaseSetup.missingFields.length === 0 &&
    firebaseSetup.invalidFields.length === 0
  );
}
