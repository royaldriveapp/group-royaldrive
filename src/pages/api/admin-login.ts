import type { APIRoute } from 'astro';
import { getAdminCredentials, setSessionCookie } from '../../middleware';

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const formData = await request.formData();
  const submittedUsername = String(formData.get('username') || '').trim();
  const submittedPassword = String(formData.get('password') || '');
  const { username, password } = getAdminCredentials();

  if (!username || !password) {
    return redirect('/admin-control?error=config', 302);
  }

  if (submittedUsername !== username || submittedPassword !== password) {
    cookies.delete('royal_drive_admin_session', { path: '/' });
    return redirect('/admin-control?error=invalid', 302);
  }

  setSessionCookie({ cookies } as any);
  return redirect('/keystatic', 302);
};
