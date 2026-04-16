import { randomBytes, timingSafeEqual } from 'node:crypto';

export const CSRF_COOKIE = 'royal_drive_admin_csrf';
const CSRF_TTL_SECONDS = 60 * 60 * 24; // 24h

function generateToken() {
  return randomBytes(32).toString('hex');
}

function cookieOptions() {
  return {
    path: '/',
    // CSRF double-submit pattern: cookie must be readable by the browser JS.
    httpOnly: false,
    sameSite: 'lax',
    secure: !import.meta.env.DEV,
    maxAge: CSRF_TTL_SECONDS,
  };
}

export function ensureCsrfToken(context: any) {
  const existing = context.cookies.get(CSRF_COOKIE)?.value;
  if (existing) return existing;

  const token = generateToken();
  context.cookies.set(CSRF_COOKIE, token, cookieOptions());
  return token;
}

export function rotateCsrfToken(context: any) {
  const token = generateToken();
  context.cookies.set(CSRF_COOKIE, token, cookieOptions());
  return token;
}

export function validateCsrfToken(context: any, providedToken: string | undefined | null) {
  const expected = context.cookies.get(CSRF_COOKIE)?.value;
  const received = typeof providedToken === 'string' ? providedToken : '';

  if (!expected || !received) return false;
  if (expected.length !== received.length) return false;

  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

