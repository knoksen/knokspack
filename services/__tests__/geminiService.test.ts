import { buildPrompt, generateContentStream, generateImage } from '../geminiService';

const okJson = (body: unknown) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });

describe('geminiService (via WordPress REST)', () => {
  beforeEach(() => {
    (window as any).knokspackData = {
      restUrl: 'http://site.test/wp-json/knokspack/v1/',
      nonce: 'n0nce',
      pluginUrl: 'http://site.test/wp-content/plugins/knokspack/',
    };
    global.fetch = jest.fn() as any;
  });

  afterEach(() => {
    delete (window as any).knokspackData;
  });

  it('never sends an API key from the browser', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ text: '<p>Hello</p>' }));
    await generateContentStream('Topic', 'Blog Post', 'Professional' as any, false);
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('http://site.test/wp-json/knokspack/v1/ai/generate');
    expect(init.headers['X-WP-Nonce']).toBe('n0nce');
    expect(JSON.stringify(init)).not.toMatch(/api[_-]?key/i);
  });

  it('yields the reply as a single { text } chunk', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ text: '<p>Hello</p>' }));
    const stream = await generateContentStream('Topic', 'Blog Post', 'Professional' as any, true);
    const chunks: string[] = [];
    for await (const c of stream) chunks.push(c.text);
    expect(chunks).toEqual(['<p>Hello</p>']);
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.google_search).toBe(true);
    expect(body.prompt).toContain('Topic');
  });

  it('turns off search for non-writing content types', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ text: 'x' }));
    await generateContentStream('a hero section', 'Wireframe', 'Professional' as any, true);
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.google_search).toBe(false);
  });

  it('surfaces the server message on errors', async () => {
    (global.fetch as jest.Mock).mockReturnValue(Promise.resolve({
      ok: false, status: 412, json: () => Promise.resolve({ message: 'AI is not set up yet.' }),
    }));
    await expect(generateContentStream('x', 'Blog Post', 'Professional' as any, false)).rejects.toThrow('AI is not set up yet.');
  });

  it('returns a data URL for images', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ dataUrl: 'data:image/png;base64,AAAA' }));
    await expect(generateImage('a cat')).resolves.toBe('data:image/png;base64,AAAA');
  });

  it('builds tone into writing prompts', async () => {
    const p = await buildPrompt('Launch', 'Press Release', 'Witty' as any);
    expect(p).toContain('Witty');
    expect(p).toContain('Launch');
  });
});
