import type { APIRoute } from 'astro';
import { getAdminCredentials, isAuthorized } from '../../lib/adminAuth';
import { validateCsrfToken } from '../../lib/adminCsrf';
import { readContentFile, writeContentFile } from '../../lib/githubContent';
import { validateAndSanitizeSiteData } from '../../lib/siteDataValidation';

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthorized({ cookies })) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data } = await readContentFile();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to load content.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthorized({ cookies })) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const csrfHeader = request.headers.get('x-csrf-token');
    if (!validateCsrfToken({ cookies }, csrfHeader)) {
      return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const sanitized = validateAndSanitizeSiteData(body);
    const { username } = getAdminCredentials();
    const saveResult = await writeContentFile(sanitized, username || 'admin');

    return new Response(JSON.stringify({ ok: true, saveResult }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const isValidationError = error && typeof error === 'object' && 'issues' in error;
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unable to save content.',
      }),
      { status: isValidationError ? 400 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
