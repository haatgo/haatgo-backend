import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startRenderKeepAlive } from '../src/render-keep-alive.js';

const environmentKeys = ['RENDER', 'RENDER_SERVICE_TYPE', 'RENDER_EXTERNAL_URL'] as const;
const originalEnvironment = Object.fromEntries(
  environmentKeys.map(key => [key, process.env[key]]),
);

beforeEach(() => {
  vi.useFakeTimers();
  for (const key of environmentKeys) delete process.env[key];
  vi.stubGlobal('fetch', vi.fn());
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  for (const key of environmentKeys) {
    const value = originalEnvironment[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Render keep-alive', () => {
  it('does not start outside Render web services', () => {
    expect(startRenderKeepAlive()).toBeUndefined();

    process.env.RENDER = 'true';
    process.env.RENDER_SERVICE_TYPE = 'worker';
    expect(startRenderKeepAlive()).toBeUndefined();
  });

  it('pings the public liveness endpoint every ten minutes and stops on cleanup', async () => {
    process.env.RENDER = 'true';
    process.env.RENDER_SERVICE_TYPE = 'web';
    process.env.RENDER_EXTERNAL_URL = 'https://haatgo-backend.onrender.com';
    vi.mocked(fetch).mockImplementation(async () => new Response(null, { status: 503 }));

    const stop = startRenderKeepAlive();
    expect(stop).toBeTypeOf('function');

    await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toBe(
      'https://haatgo-backend.onrender.com/health/live',
    );
    expect(vi.mocked(fetch).mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
    expect(console.error).toHaveBeenCalledWith(
      'Render keep-alive ping failed: /health/live returned 503',
    );

    await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    expect(fetch).toHaveBeenCalledTimes(2);
    stop?.();
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('logs a configuration error when a Render web service has no external URL', () => {
    process.env.RENDER = 'true';
    process.env.RENDER_SERVICE_TYPE = 'web';

    expect(startRenderKeepAlive()).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      'Render keep-alive not started: RENDER_EXTERNAL_URL is required',
    );
  });
});
