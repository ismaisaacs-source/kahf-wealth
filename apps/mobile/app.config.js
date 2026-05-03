const fs = require("fs");
const path = require("path");

function loadRootEnv() {
  const envPath = path.resolve(__dirname, "../../.env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const source = fs.readFileSync(envPath, "utf8");
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadRootEnv();

module.exports = {
  expo: {
    name: "Kahf Wealth",
    slug: "kahf-wealth",
    scheme: "kahfwealth",
    orientation: "portrait",
    userInterfaceStyle: "light",
    platforms: ["ios", "android"],
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api",
      firebaseConfig: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
        messagingSenderId:
          process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
      },
    },
  },
};
