import { readFile, writeFile } from 'node:fs/promises';

const CONTENT_PATH = 'src/data/siteData.json';
const LOCAL_CONTENT_URL = new URL('../data/siteData.json', import.meta.url);

// Bundled fallback for serverless environments:
// Vercel may not include `src/data/siteData.json` at runtime for fs reads.
// This import is resolved at build time, so admin UI can still load.
import localSiteData from '../data/siteData.json';

function processEnv() {
  // @ts-ignore
  return typeof process !== 'undefined' ? process.env : {};
}

function githubConfig() {
  const env = processEnv();
  return {
    token: import.meta.env.GITHUB_TOKEN || env.GITHUB_TOKEN || '',
    repo: import.meta.env.GITHUB_REPO || env.GITHUB_REPO || 'marketing-it/group.royaldrive',
    branch: import.meta.env.GITHUB_BRANCH || env.GITHUB_BRANCH || 'main',
  };
}

function hasGitHubToken() {
  return Boolean(githubConfig().token);
}

function requirePersistentStorageInProd() {
  if (import.meta.env.PROD && !hasGitHubToken()) {
    throw new Error('Missing GITHUB_TOKEN in production. Configure GitHub env vars for persistent live CMS saves.');
  }
}

function headers() {
  const { token } = githubConfig();
  if (!token) throw new Error('Missing GITHUB_TOKEN.');

  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

function endpoint() {
  const { repo } = githubConfig();
  return `https://api.github.com/repos/${repo}/contents/${CONTENT_PATH}`;
}

export async function readContentFile() {
  if (!hasGitHubToken()) {
    try {
      const raw = await readFile(LOCAL_CONTENT_URL, 'utf-8');
      return {
        sha: '',
        data: JSON.parse(raw),
      };
    } catch {
      return {
        sha: '',
        data: localSiteData,
      };
    }
  }

  const { branch } = githubConfig();
  const response = await fetch(`${endpoint()}?ref=${encodeURIComponent(branch)}`, {
    headers: headers(),
  });
  if (!response.ok) throw new Error(`GitHub read failed: ${response.status}`);

  const payload = await response.json();
  return {
    sha: payload.sha as string,
    data: JSON.parse(Buffer.from(payload.content, 'base64').toString('utf-8')),
  };
}

export async function writeContentFile(data: unknown, actor: string) {
  requirePersistentStorageInProd();

  if (!hasGitHubToken()) {
    await writeFile(LOCAL_CONTENT_URL, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
    return {
      ok: true,
      mode: 'local',
      actor,
    };
  }

  const { sha } = await readContentFile();
  const { branch } = githubConfig();
  const response = await fetch(endpoint(), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      message: `Update site content via admin (${actor})`,
      content: Buffer.from(`${JSON.stringify(data, null, 2)}\n`, 'utf-8').toString('base64'),
      sha,
      branch,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub write failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}
