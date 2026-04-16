import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../lib/adminAuth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  clearSessionCookie({ cookies });
  return redirect('/admin-control', 302);
};
