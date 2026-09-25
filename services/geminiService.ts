// AI calls go through the plugin's own REST endpoint (knokspack/v1/ai/*).
// The API key is stored server-side in WordPress (Knokspack → Settings) and
// never reaches the browser.
import type { ContentType, Tone } from '../types';
import { PLUGIN_GUIDELINES_CONTEXT } from '../constants';
import { apiFetch } from './wpApi';

const PROMPT_TEMPLATES: Record<string, string> = {
    'Blog Post': 'You are a professional blog writer. Your tone should be {TONE}. Write a high-quality, engaging, and well-structured blog post based on the following topic. Format the output in simple HTML tags like <p>, <h1>, <h2>, <ul>, and <li>. Do not include <html>, <head>, or <body> tags.',
    'Press Release': 'You are an expert PR professional. Your tone should be {TONE}. Write a formal, newsworthy press release on the following subject. It must include a headline, dateline, introduction, body, and a boilerplate. Format the output in simple HTML tags. Do not include <html>, <head>, or <body> tags.',
    'Job Description': 'You are a helpful hiring manager. Your tone should be {TONE}. Create a comprehensive and appealing job description for the given role. Include sections for Responsibilities, Qualifications, and Benefits. Format the output in simple HTML tags. Do not include <html>, <head>, or <body> tags.',
    'Social Media Post': 'You are a savvy social media manager. Your tone should be {TONE}. Write a short, punchy, and engaging social media post for platforms like Twitter or LinkedIn. Include relevant hashtags. Keep it concise. Format the output in simple HTML tags.',
};

const WIREFRAME_PROMPT_TEMPLATE = `You are an expert frontend developer specializing in Tailwind CSS. Your task is to generate a single, self-contained HTML structure based on the user's request.
- Use only HTML elements and Tailwind CSS classes.
- Do NOT include \`<html>\`, \`<head>\`, or \`<body>\` tags.
- Do NOT include any JavaScript (\`<script>\` tags) or custom CSS (\`<style>\` tags).
- The output should be a single block of HTML code that can be directly rendered.
- Use placeholder content and images where appropriate (e.g., from picsum.photos or similar).
- Make the component responsive and aesthetically pleasing.
- The user's request is: "{PROMPT}"`;

const WP_README_DESCRIPTION_TEMPLATE = `You are a helpful assistant for WordPress developers. Your task is to write a compelling "Description" section for a WordPress plugin's readme.txt file.
- The description should be written in Markdown.
- It should clearly and enthusiastically explain what the plugin does, its main features, and why a user would want to install it.
- Use headings, lists, and bold text to structure the content and make it easy to read.
- Do not include the "== Description ==" header itself, just the content that goes under it.
- The user's prompt about the plugin is: "{PROMPT}"`;

let readmeContent: string | null = null;
const getReadmeContent = async (): Promise<string> => {
    if (readmeContent === null) {
        try {
            const base = (typeof window !== 'undefined' && window.knokspackData?.pluginUrl) || '/';
            const response = await fetch(base + 'readme.txt');
            if (!response.ok) throw new Error(response.statusText);
            readmeContent = await response.text();
        } catch {
            readmeContent = 'Readme content is not available.';
        }
    }
    return readmeContent;
};

/** Builds the full prompt for a content type. Exported for tests. */
export async function buildPrompt(prompt: string, contentType: ContentType, tone: Tone): Promise<string> {
    if (contentType === 'Plugin Guideline Q&A') {
        return `You are an expert assistant for WordPress plugin developers. Answer questions based on the provided WordPress Plugin Directory guidelines only. If the answer isn't in the guidelines, say that you don't have enough information from the provided context. Format your answer using simple HTML tags like <p>, <ul>, and <li> where appropriate. The guidelines are:\n\n${PLUGIN_GUIDELINES_CONTEXT}\n\nQuestion: ${prompt}`;
    }
    if (contentType === 'Plugin Readme Q&A') {
        const readme = await getReadmeContent();
        return `You are a support assistant for the Knokspack WordPress plugin. Answer based ONLY on the provided readme.txt content. If the answer is not in it, say so. Do not invent information. Format your answer using simple HTML tags. The readme.txt content is:\n\n${readme}\n\nQuestion: ${prompt}`;
    }
    if (contentType === 'Wireframe') return WIREFRAME_PROMPT_TEMPLATE.replace('{PROMPT}', prompt);
    if (contentType === 'WP Readme File') {
        return WP_README_DESCRIPTION_TEMPLATE.replace('{PROMPT}', prompt) + '\n\nPlease generate the plugin description now based on the provided instructions.';
    }
    const template = PROMPT_TEMPLATES[contentType] || PROMPT_TEMPLATES['Blog Post'];
    return template.replace('{TONE}', tone) + '\n\n' + prompt;
}

/** Web sources used when Google Search grounding is on (Gemini's groundingChunks shape). */
export type Source = { web?: { uri: string; title?: string } };
type GenerateResponse = { text: string; sources?: Source[] };
type ImageResponse = { dataUrl: string };

/**
 * Returns an async iterable of `{ text }` chunks so existing callers can keep
 * using `for await (const chunk of stream)`. The server answers in one piece.
 */
export const generateContentStream = async (
    prompt: string,
    contentType: ContentType,
    tone: Tone,
    useGoogleSearch: boolean,
): Promise<AsyncIterable<{ text: string; sources?: Source[] }>> => {
    const fullPrompt = await buildPrompt(prompt, contentType, tone);
    const result = await apiFetch<GenerateResponse>('ai/generate', {
        prompt: fullPrompt,
        google_search: useGoogleSearch && contentType in PROMPT_TEMPLATES,
    });
    return (async function* () {
        yield { text: result.text, sources: result.sources };
    })();
};

export const generateImage = async (prompt: string): Promise<string> => {
    const result = await apiFetch<ImageResponse>('ai/image', { prompt });
    if (!result.dataUrl) throw new Error('The AI did not return an image.');
    return result.dataUrl;
};
