function processEnv() {
  // @ts-ignore
  return typeof process !== 'undefined' ? process.env : {};
}

function deployHookUrl() {
  const env = processEnv();
  return import.meta.env.NETLIFY_BUILD_HOOK_URL || env.NETLIFY_BUILD_HOOK_URL || '';
}

export async function triggerDeployHook() {
  const hook = deployHookUrl();
  if (!hook) {
    return { triggered: false, reason: 'missing_hook' as const };
  }

  const response = await fetch(hook, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Netlify deploy hook failed: ${response.status}`);
  }

  return { triggered: true, reason: 'ok' as const };
}
