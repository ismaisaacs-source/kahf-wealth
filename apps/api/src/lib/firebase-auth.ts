import "./load-env";
import type { AuthenticatedUser } from "@kahf/domain";

let adminReady = false;
let firebaseAdmin:
  | {
      getApps: typeof import("firebase-admin/app").getApps;
      initializeApp: typeof import("firebase-admin/app").initializeApp;
      cert: typeof import("firebase-admin/app").cert;
      getAuth: typeof import("firebase-admin/auth").getAuth;
    }
  | undefined;

function requireVerifiedAuth() {
  return process.env.KAHF_REQUIRE_VERIFIED_FIREBASE_AUTH === "true";
}

function disableFirebaseAdmin() {
  return process.env.KAHF_DISABLE_FIREBASE_ADMIN === "true";
}

function hasAdminCredentials() {
  if (disableFirebaseAdmin()) {
    return false;
  }

  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      getPrivateKey(),
  );
}

export function getFirebaseAuthMode() {
  return hasAdminCredentials() ? "verified" : "decoded_unverified";
}

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

async function ensureAdmin() {
  if (adminReady) {
    return true;
  }

  if (disableFirebaseAdmin()) {
    if (requireVerifiedAuth()) {
      throw new Error(
        "Verified Firebase auth is required, but KAHF_DISABLE_FIREBASE_ADMIN is enabled.",
      );
    }
    return false;
  }

  if (!hasAdminCredentials()) {
    if (requireVerifiedAuth()) {
      throw new Error(
        "Verified Firebase auth is required, but FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY is missing.",
      );
    }
    return false;
  }

  try {
    if (!firebaseAdmin) {
      const app = await import("firebase-admin/app");
      const auth = await import("firebase-admin/auth");
      const appModule = {
        ...((app.default ?? {}) as typeof app),
        ...app,
      };
      const authModule = {
        ...((auth.default ?? {}) as typeof auth),
        ...auth,
      };

      firebaseAdmin = {
        getApps: appModule.getApps,
        initializeApp: appModule.initializeApp,
        cert: appModule.cert,
        getAuth: authModule.getAuth,
      };
    }
  } catch (error) {
    if (requireVerifiedAuth()) {
      throw error;
    }
    return false;
  }

  if (firebaseAdmin.getApps().length === 0) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getPrivateKey(),
      }),
    });
  }

  adminReady = true;
  return true;
}

export async function resolveFirebaseUser(
  idToken: string,
): Promise<AuthenticatedUser> {
  if (await ensureAdmin()) {
    const decoded = await firebaseAdmin!.getAuth().verifyIdToken(idToken);

    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      displayName: decoded.name,
      tokenMode: "verified",
    };
  }

  const [, payloadSegment] = idToken.split(".");
  if (!payloadSegment) {
    throw new Error("Invalid Firebase token payload.");
  }

  const payload = JSON.parse(
    Buffer.from(payloadSegment, "base64url").toString("utf8"),
  ) as {
    sub?: string;
    email?: string;
    name?: string;
  };

  if (!payload.sub || !payload.email) {
    throw new Error("Unable to resolve Firebase user from token.");
  }

  return {
    uid: payload.sub,
    email: payload.email,
    displayName: payload.name,
    tokenMode: "decoded_unverified",
  };
}
