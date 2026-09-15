export interface JarlhallaAiRequest {
  prompt: string;
  mode?: 'chat' | 'wordpress' | 'seo' | 'operations';
  tone?: string;
  context?: string;
}

export interface JarlhallaAiHealth {
  status: string;
  provider: string;
  model: string;
}

export async function getJarlhallaAiHealth(): Promise<JarlhallaAiHealth> {
  const response = await fetch('/api/jarlhalla-ai/health', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`JarlhallaAI health check failed (${response.status})`);
  }

  return response.json();
}

export async function* streamJarlhallaAi(
  request: JarlhallaAiRequest,
): AsyncGenerator<string, void, unknown> {
  const response = await fetch('/api/jarlhalla-ai/chat', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/plain',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let message = `JarlhallaAI request failed (${response.status})`;
    try {
      const payload = await response.json();
      if (payload?.detail) message = String(payload.detail);
    } catch {
      // Keep the HTTP fallback message.
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error('JarlhallaAI returned an empty response stream.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        const text = decoder.decode(value, { stream: true });
        if (text) yield text;
      }
    }

    const tail = decoder.decode();
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}
