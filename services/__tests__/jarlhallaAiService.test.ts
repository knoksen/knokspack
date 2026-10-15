import { streamJarlhallaAi } from '../jarlhallaAiService';

async function collect() {
  const chunks: string[] = [];
  for await (const chunk of streamJarlhallaAi({ prompt: 'Hi', provider: 'ollama' })) chunks.push(chunk);
  return chunks.join('');
}

describe('Jarlhalla AI streaming', () => {
  let releaseLock: jest.Mock;
  const originalDecoder = global.TextDecoder;
  beforeAll(() => { global.TextDecoder = require('util').TextDecoder; });
  afterAll(() => { global.TextDecoder = originalDecoder; });
  beforeEach(() => {
    releaseLock = jest.fn();
    global.fetch = jest.fn();
  });
  function respond(read: jest.Mock) {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, body: { getReader: () => ({ read, releaseLock }) } });
  }
  it('rejects HTTP 200 with no text', async () => {
    respond(jest.fn().mockResolvedValue({ done: true }));
    await expect(collect()).rejects.toThrow('returned no text');
    expect(releaseLock).toHaveBeenCalled();
  });
  it('preserves successful text and selected provider', async () => {
    respond(jest.fn().mockResolvedValueOnce({ done: false, value: new Uint8Array([79, 75]) }).mockResolvedValue({ done: true }));
    await expect(collect()).resolves.toBe('OK');
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/jarlhalla-ai/chat');
    expect(JSON.parse(init.body).provider).toBe('ollama');
    expect(releaseLock).toHaveBeenCalled();
  });
  it('surfaces interrupted streams and releases the reader', async () => {
    respond(jest.fn().mockRejectedValue(new Error('Connection interrupted')));
    await expect(collect()).rejects.toThrow('Connection interrupted');
    expect(releaseLock).toHaveBeenCalled();
  });
  it('surfaces backend startup errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503, json: async () => ({ detail: 'Provider unavailable' }) });
    await expect(collect()).rejects.toThrow('Provider unavailable');
  });
});
