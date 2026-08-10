const DEFAULT_MAX_ATTEMPTS = 4;
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_BASE_DELAY_MS = 250;
const DEFAULT_MAX_DELAY_MS = 4_000;

function errorSummary(value) {
  return value?.error_summary ?? value?.error_description ?? value?.error?.['.tag'] ?? 'unknown_error';
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error_description: `invalid_json_response:${text.slice(0, 160)}` };
  }
}

function retryAfterMs(response) {
  const header = response.headers?.get?.('retry-after');
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);
  const timestamp = Date.parse(header);
  if (Number.isFinite(timestamp)) return Math.max(0, timestamp - Date.now());
  return null;
}

function backoffMs(attempt, baseDelayMs, maxDelayMs) {
  return Math.min(maxDelayMs, baseDelayMs * (2 ** Math.max(0, attempt - 1)));
}

function isTransientStatus(status) {
  return status === 429 || (status >= 500 && status <= 599);
}

export async function refreshDropboxAccessToken({
  appKey = process.env.DROPBOX_APP_KEY,
  appSecret = process.env.DROPBOX_APP_SECRET,
  refreshToken = process.env.DROPBOX_REFRESH_TOKEN,
  fetchImpl = globalThis.fetch,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  signalFactory = (milliseconds) => AbortSignal.timeout(milliseconds),
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  baseDelayMs = DEFAULT_BASE_DELAY_MS,
  maxDelayMs = DEFAULT_MAX_DELAY_MS,
} = {}) {
  if (!appKey || !appSecret || !refreshToken) {
    throw new Error('DROPBOX_APP_KEY, DROPBOX_APP_SECRET and DROPBOX_REFRESH_TOKEN are required.');
  }
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required for Dropbox token refresh.');
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 8) throw new Error('Dropbox token refresh maxAttempts must be an integer between 1 and 8.');
  if (!Number.isSafeInteger(requestTimeoutMs) || requestTimeoutMs < 1) throw new Error('Dropbox token refresh requestTimeoutMs must be a positive integer.');

  let lastFailure = 'unknown_error';
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response;
    try {
      response = await fetchImpl('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
        signal: signalFactory(requestTimeoutMs),
      });
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
      if (attempt >= maxAttempts) {
        throw new Error(`Dropbox access token refresh failed after ${attempt} attempts: ${lastFailure}`);
      }
      await sleep(backoffMs(attempt, baseDelayMs, maxDelayMs));
      continue;
    }

    const value = await parseResponseBody(response);
    if (response.ok) {
      if (!value.access_token) throw new Error('Dropbox token refresh returned no access token.');
      return value.access_token;
    }

    lastFailure = `HTTP ${response.status}: ${errorSummary(value)}`;
    if (!isTransientStatus(response.status) || attempt >= maxAttempts) {
      throw new Error(`Dropbox access token refresh failed (${lastFailure})${attempt > 1 ? ` after ${attempt} attempts` : ''}.`);
    }

    const delay = retryAfterMs(response) ?? backoffMs(attempt, baseDelayMs, maxDelayMs);
    await sleep(Math.min(maxDelayMs, delay));
  }

  throw new Error(`Dropbox access token refresh failed: ${lastFailure}`);
}
