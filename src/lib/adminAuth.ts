import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'royal_drive_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const DEV_SESSION_SECRET = 'royal-drive-dev-session-secret';

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

function getSessionSecret() {
  const env = processEnv();
  const configuredSecret =
    import.meta.env.ADMIN_SESSION_SECRET ||
    env.ADMIN_SESSION_SECRET ||
    import.meta.env.SESSION_SECRET ||
    env.SESSION_SECRET ||
    '';

  if (configuredSecret) return configuredSecret;
  if (import.meta.env.DEV) return DEV_SESSION_SECRET;
  return '';
}

function sessionToken(username: string, sessionSecret: string) {
  return createHmac('sha256', sessionSecret).update(username).digest('hex');
}

export function isConfigured() {
  const { username, password } = getAdminCredentials();
  return Boolean(username && password && getSessionSecret());
}

export function isAuthorized(context: any) {
  const { username, password } = getAdminCredentials();
  const sessionSecret = getSessionSecret();
  const cookieValue = context.cookies.get(SESSION_COOKIE)?.value;
  if (!username || !password || !sessionSecret || !cookieValue) return false;

  const expected = Buffer.from(sessionToken(username, sessionSecret));
  const received = Buffer.from(cookieValue);
  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

export function setSessionCookie(context: any) {
  const { username, password } = getAdminCredentials();
  const sessionSecret = getSessionSecret();
  if (!username || !password || !sessionSecret) {
    throw new Error('Missing ADMIN_USERNAME, ADMIN_PASSWORD, or ADMIN_SESSION_SECRET.');
  }

  context.cookies.set(SESSION_COOKIE, sessionToken(username, sessionSecret), {
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
