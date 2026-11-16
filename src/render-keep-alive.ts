const PING_INTERVAL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10 * 1000;

export function startRenderKeepAlive(
  environment: NodeJS.ProcessEnv = process.env,
): (() => void) | undefined {
  if (environment.RENDER !== 'true' || environment.RENDER_SERVICE_TYPE !== 'web') return;

  const externalUrl = environment.RENDER_EXTERNAL_URL;
  if (!externalUrl) {
    console.error('Render keep-alive not started: RENDER_EXTERNAL_URL is required');
    return;
  }

  let healthUrl: URL;
  try {
    healthUrl = new URL('/health/live', externalUrl);
  } catch {
    console.error('Render keep-alive not started: RENDER_EXTERNAL_URL is invalid');
    return;
  }
  if (healthUrl.protocol !== 'https:') {
    console.error('Render keep-alive not started: RENDER_EXTERNAL_URL must use HTTPS');
    return;
  }

  const timer = setInterval(() => {
    void ping(healthUrl);
  }, PING_INTERVAL_MS);
  timer.unref();

  return () => clearInterval(timer);
}

async function ping(url: URL): Promise<void> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) {
      console.error(`Render keep-alive ping failed: /health/live returned ${response.status}`);
    }
    await response.body?.cancel();
  } catch (error) {
    console.error(
      'Render keep-alive ping failed:',
      error instanceof Error ? error.message : error,
    );
  }
}
