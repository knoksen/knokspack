import React, { useEffect, useMemo, useState } from 'react';
import {
  getJarlhallaAiHealth,
  streamJarlhallaAi,
  type JarlhallaAiHealth,
} from '../../services/jarlhallaAiService';

const MODES = [
  ['chat', 'General'],
  ['wordpress', 'WordPress'],
  ['seo', 'SEO'],
  ['operations', 'Operations'],
] as const;

type Mode = (typeof MODES)[number][0];

const JarlhallaAIPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<JarlhallaAiHealth | null>(null);

  useEffect(() => {
    getJarlhallaAiHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const statusText = useMemo(() => {
    if (!health) return 'Backend unavailable';
    return `${health.provider} · ${health.model}`;
  }, [health]);

  const generate = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setOutput('');

    try {
      for await (const chunk of streamJarlhallaAi({
        prompt: cleanPrompt,
        mode,
        tone: 'professional, concise and technically precise',
      })) {
        setOutput((previous) => previous + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JarlhallaAI request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-knokspack-light-gray min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-widest text-knokspack-primary font-semibold">Jarlhalla Control Plane</p>
            <h1 className="text-4xl font-bold text-knokspack-dark mt-1">JarlhallaAI</h1>
            <p className="text-knokspack-gray mt-2">Private AI workspace for publishing, WordPress, SEO and site operations.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://jarlhalla.com/wp-admin/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-md bg-white border border-gray-300 text-knokspack-dark font-medium hover:border-knokspack-primary"
            >
              WordPress Admin
            </a>
            <a
              href="https://mail.jarlhalla.com/admin"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-md bg-white border border-gray-300 text-knokspack-dark font-medium hover:border-knokspack-primary"
            >
              Mail Admin
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-xl font-bold text-knokspack-dark">Ask JarlhallaAI</h2>
              <span className={`text-xs px-3 py-1 rounded-full ${health ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {statusText}
              </span>
            </div>

            <label className="block text-sm font-medium text-knokspack-dark mb-2" htmlFor="jarlhalla-mode">
              Workspace
            </label>
            <select
              id="jarlhalla-mode"
              value={mode}
              onChange={(event) => setMode(event.target.value as Mode)}
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-5 bg-white"
            >
              {MODES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <label className="block text-sm font-medium text-knokspack-dark mb-2" htmlFor="jarlhalla-prompt">
              Prompt
            </label>
            <textarea
              id="jarlhalla-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={12}
              disabled={isLoading}
              placeholder="Example: Review the current Jarlhalla publishing plan and propose the three highest-value SEO actions for this week."
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-knokspack-primary focus:border-knokspack-primary"
            />

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-md px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={generate}
              disabled={isLoading || !prompt.trim()}
              className="mt-5 w-full bg-knokspack-primary text-white font-semibold py-3 px-4 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'JarlhallaAI is working…' : 'Run'}
            </button>
          </section>

          <section className="bg-knokspack-dark rounded-xl shadow-sm p-6 min-h-[520px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Output</h2>
              {output && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-sm text-knokspack-primary-light hover:text-white"
                >
                  Copy
                </button>
              )}
            </div>
            <pre className="whitespace-pre-wrap break-words text-gray-100 font-sans leading-relaxed overflow-auto flex-1">
              {output || 'JarlhallaAI output will appear here.'}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
};

export default JarlhallaAIPage;
