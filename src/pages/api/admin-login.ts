import type { APIRoute } from 'astro';
import { getAdminCredentials, isConfigured, setSessionCookie } from '../../lib/adminAuth';
import { rotateCsrfToken, validateCsrfToken } from '../../lib/adminCsrf';
import { checkRateLimit } from '../../lib/adminRateLimit';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');

  if (!isConfigured()) {
    if (wantsJson) {
      return new Response(JSON.stringify({ error: 'Admin not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return redirect('/admin-control?error=config', 302);
  }

  const formData = await request.formData();
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');
  const csrf = String(formData.get('_csrf') || '');

  // Rate limiting (per-IP + username if present).
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0]?.trim() || 'unknown';
  const key = username ? `${ip}:${username}` : ip;
  const rate = checkRateLimit(key);
  if (!rate.allowed) {
    if (wantsJson) {
      return new Response(JSON.stringify({ error: 'Too many login attempts', retryAfterSeconds: rate.retryAfterSeconds }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return redirect('/admin-control?error=rate', 302);
  }

  if (!validateCsrfToken({ cookies }, csrf)) {
    if (wantsJson) {
      return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return redirect('/admin-control?error=csrf', 302);
  }

  const credentials = getAdminCredentials();

  if (username !== credentials.username || password !== credentials.password) {
    cookies.delete('royal_drive_admin_session', { path: '/' });
    if (wantsJson) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return redirect('/admin-control?error=invalid', 302);
  }

  setSessionCookie({ cookies });
  // Rotate CSRF token after successful login to reduce token fixation risk.
  rotateCsrfToken({ cookies });

  if (wantsJson) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return redirect('/admin', 302);
};
