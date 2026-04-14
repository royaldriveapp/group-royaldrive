import { defineMiddleware } from 'astro:middleware';
import { createHash, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE = 'royal_drive_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getAdminCredentials() {
  // @ts-ignore
  const processEnv = typeof process !== 'undefined' ? process.env : {};

  const username = import.meta.env.ADMIN_USERNAME || processEnv.ADMIN_USERNAME;
  const password = import.meta.env.ADMIN_PASSWORD || processEnv.ADMIN_PASSWORD;

  return {
    username: username?.trim(),
    password,
  };
}

function createSessionToken(username: string, password: string) {
  return createHash('sha256')
    .update(`${username}:${password}`)
    .digest('hex');
}

function isAuthorized(context: Parameters<typeof defineMiddleware>[0] extends never ? never : any) {
  const { username, password } = getAdminCredentials();
  const cookieValue = context.cookies.get(SESSION_COOKIE)?.value;

  if (!username || !password || !cookieValue) {
    return false;
  }

  const expected = Buffer.from(createSessionToken(username, password));
  const received = Buffer.from(cookieValue);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

function clearSessionCookie(context: any) {
  context.cookies.delete(SESSION_COOKIE, {
    path: '/',
  });
}

function setSessionCookie(context: any) {
  const { username, password } = getAdminCredentials();

  if (!username || !password) {
    throw new Error('Missing ADMIN_USERNAME or ADMIN_PASSWORD environment variables.');
  }

  context.cookies.set(SESSION_COOKIE, createSessionToken(username, password), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.env.DEV,
    maxAge: SESSION_TTL_SECONDS,
  });
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS, clearSessionCookie, getAdminCredentials, isAuthorized, setSessionCookie };

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const isAdminLoginRoute = url.pathname === '/admin-control';
  const isProtectedAdminRoute =
    url.pathname.startsWith('/keystatic') ||
    url.pathname.startsWith('/api/keystatic');

  if (isAdminLoginRoute) {
    clearSessionCookie(context);
    return next();
  }

  if (isProtectedAdminRoute) {
    if (isAuthorized(context)) {
      return next();
    }

    if (url.pathname.startsWith('/api/keystatic')) {
      return new Response('Unauthorized', { status: 401 });
    }

    return context.redirect('/admin-control');
  }

  return next();
});
