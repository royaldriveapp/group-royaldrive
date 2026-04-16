import type { APIRoute } from 'astro';
import { getAdminCredentials } from '../../lib/adminAuth';
import { readContentFile, writeContentFile } from '../../lib/githubContent';

export const GET: APIRoute = async () => {
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { username } = getAdminCredentials();
    await writeContentFile(body, username || 'admin');
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to save content.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
