import type { APIRoute } from 'astro';
import { clearSessionCookie, isAuthorized } from '../../lib/adminAuth';
import { validateCsrfToken } from '../../lib/adminCsrf';

export const POST: APIRoute = async ({ cookies, request }) => {
  if (!isAuthorized({ cookies })) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const csrfHeader = request.headers.get('x-csrf-token');
  if (!validateCsrfToken({ cookies }, csrfHeader)) {
    return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  clearSessionCookie({ cookies });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
