import { defineMiddleware } from 'astro:middleware';
import { clearSessionCookie, isAuthorized } from './lib/adminAuth';

export const onRequest = defineMiddleware((context, next) => {
  const pathname = new URL(context.request.url).pathname;
  const isProtected =
    pathname === '/admin' ||
    pathname === '/admin/' ||
    pathname.startsWith('/api/admin-content') ||
    pathname.startsWith('/api/admin-logout');

  if (isProtected && !isAuthorized(context)) {
    clearSessionCookie(context);
    return context.redirect('/admin-control');
  }

  return next();
});
