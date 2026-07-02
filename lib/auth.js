/**
 * Auth helpers
 * ------------------------------------
 * Replaces PHP $_SESSION based auth with a signed, httpOnly JWT cookie.
 * Works both in Node.js API routes and the Edge middleware because it
 * only relies on the `jose` library (no native/node-only APIs).
 */
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'lms_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days, mirrors a typical PHP session lifetime

function getSecretKey() {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  return new TextEncoder().encode(secret);
}

/**
 * createSessionToken(user)
 * Signs a JWT containing the same fields the PHP version stored in
 * $_SESSION (user_id, full_name, username, role).
 */
export async function createSessionToken(user) {
  return await new SignJWT({
    user_id: user.user_id,
    full_name: user.full_name,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

/**
 * verifySessionToken(token)
 * Returns the decoded payload, or null if invalid/expired.
 */
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};
