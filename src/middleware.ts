import { defineMiddleware } from 'astro:middleware';
import { clearSessionCookie, isAuthorized } from './lib/adminAuth';

function applySecurityHeaders(response: Response) {
  // Baseline CSP: allow existing inline scripts/styles (this project uses `is:inline`).
  // Tightening further (nonce-based CSP + SRI) can be done later once we refactor inline usage.
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      // Admin UI + site use CDN assets and inline scripts/styles.
      "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://www.youtube.com https://*.google.com https://widgets.leadconnectorhq.com",
      'style-src \'self\' \'unsafe-inline\' https://cdnjs.cloudflare.com https://fonts.googleapis.com',
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.github.com https: https://widgets.leadconnectorhq.com",
      "frame-src 'self' https://www.youtube.com https://widgets.leadconnectorhq.com",
    ].join('; ')
  );

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname;
  const isProtected =
    pathname === '/admin' ||
    pathname === '/admin/' ||
    pathname.startsWith('/api/admin-content') ||
    pathname.startsWith('/api/admin-logout');

  if (isProtected && !isAuthorized(context)) {
    clearSessionCookie(context);
    // Keep API semantics correct:
    // - admin-content is consumed as JSON by the admin editor UI
    // - admin-logout is submitted as JSON/fetch, so return JSON on unauthorized.
    if (pathname.startsWith('/api/admin-content')) {
      return applySecurityHeaders(
        new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    if (pathname.startsWith('/api/admin-logout')) {
      return applySecurityHeaders(
        new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    return context.redirect('/admin-control');
  }

  const response = await next();
  // Always add baseline headers so both HTML and API responses are covered.
  return applySecurityHeaders(response);
});
