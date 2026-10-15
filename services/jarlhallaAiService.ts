const aiBase = () => window.location.pathname.startsWith('/workspace/knokspack/') ? '/workspace' : '/api/jarlhalla-ai';

export type JarlhallaAiProvider = 'openai' | 'anthropic' | 'ollama';

export interface JarlhallaAiRequest {
  prompt: string;
  mode?: 'chat' | 'wordpress' | 'seo' | 'operations';
  provider?: JarlhallaAiProvider;
  model?: string;
  tone?: string;
  context?: string;
}

export interface JarlhallaAiProviderHealth {
  configured: boolean;
  model: string;
}

export interface JarlhallaAiHealth {
  status: string;
  provider: JarlhallaAiProvider;
  model: string;
  providers: Record<JarlhallaAiProvider, JarlhallaAiProviderHealth>;
}

export async function getJarlhallaAiHealth(): Promise<JarlhallaAiHealth> {
  const response = await fetch(`${aiBase()}/health`, {
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
  const response = await fetch(`${aiBase()}/chat`, {
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
  let receivedText = false;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        const text = decoder.decode(value, { stream: true });
        if (text) {
          receivedText = true;
          yield text;
        }
      }
    }

    const tail = decoder.decode();
    if (tail) {
      receivedText = true;
      yield tail;
    }
    if (!receivedText) {
      throw new Error('JarlhallaAI returned no text. Check the selected provider; for local Ollama, keep the PC and SSH tunnel running.');
    }
  } finally {
    reader.releaseLock();
  }
}
