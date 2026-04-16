import type { APIRoute } from 'astro';
import { getAdminCredentials, isConfigured, setSessionCookie } from '../../lib/adminAuth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!isConfigured()) {
    return redirect('/admin-control?error=config', 302);
  }

  const formData = await request.formData();
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');
  const credentials = getAdminCredentials();

  if (username !== credentials.username || password !== credentials.password) {
    cookies.delete('royal_drive_admin_session', { path: '/' });
    return redirect('/admin-control?error=invalid', 302);
  }

  setSessionCookie({ cookies });
  return redirect('/admin', 302);
};
