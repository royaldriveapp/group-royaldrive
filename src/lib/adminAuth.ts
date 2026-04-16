import { createHash, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'royal_drive_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function processEnv() {
  // @ts-ignore
  return typeof process !== 'undefined' ? process.env : {};
}

export function getAdminCredentials() {
  const env = processEnv();
  return {
    username: (import.meta.env.ADMIN_USERNAME || env.ADMIN_USERNAME || '').trim(),
    password: import.meta.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD || '',
  };
}

function sessionToken(username: string, password: string) {
  return createHash('sha256').update(`${username}:${password}`).digest('hex');
}

export function isConfigured() {
  const { username, password } = getAdminCredentials();
  return Boolean(username && password);
}

export function isAuthorized(context: any) {
  const { username, password } = getAdminCredentials();
  const cookieValue = context.cookies.get(SESSION_COOKIE)?.value;
  if (!username || !password || !cookieValue) return false;

  const expected = Buffer.from(sessionToken(username, password));
  const received = Buffer.from(cookieValue);
  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

export function setSessionCookie(context: any) {
  const { username, password } = getAdminCredentials();
  if (!username || !password) throw new Error('Missing ADMIN_USERNAME or ADMIN_PASSWORD.');

  context.cookies.set(SESSION_COOKIE, sessionToken(username, password), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.env.DEV,
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(context: any) {
  context.cookies.delete(SESSION_COOKIE, { path: '/' });
}
