import type { Request } from "express";
import { resolveFirebaseUser } from "./firebase-auth";

export async function requireAuth(request: Request) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;

  if (!token) {
    throw new Error("Missing bearer token.");
  }

  return resolveFirebaseUser(token);
}
