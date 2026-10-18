import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// JWT Secret Key (Production me ye .env se aayegi, fallback dev key)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pulseengine_super_secret_jwt_key_2026_dev_only"
);

export const COOKIE_NAME = "pe_session";
const TOKEN_EXPIRY = "7d"; // 7 days session

export interface SessionPayload {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  organizationId: string;
  organizationName: string;
}

/**
 * 1. Creates a cryptographically signed JWT Token
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * 2. Verifies the JWT Token signature and returns the payload
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * 3. Sets the JWT inside a Secure, HTTP-Only Cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // JavaScript cannot read it (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax", // CSRF protection
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  });
}

/**
 * 4. Clears the session cookie on Logout
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * 5. Reads and verifies the active user session from cookies
 * Useful inside Server Components and Server Actions!
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return await verifySessionToken(token);
}
