import { GoogleGenAI } from "@google/genai";
import type { ContentType, Tone } from '../types';
import { PLUGIN_GUIDELINES_CONTEXT } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROMPT_TEMPLATES: Record<Exclude<ContentType, 'Plugin Guideline Q&A' | 'Plugin Readme Q&A' | 'Wireframe' | 'WP Readme File' | 'Image'>, string> = {
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
            const response = await fetch('/readme.txt');
            if (!response.ok) {
                throw new Error(`Failed to fetch readme.txt: ${response.statusText}`);
            }
            readmeContent = await response.text();
        } catch (error) {
            console.error("Error fetching readme.txt:", error);
            readmeContent = "Readme content is not available. Please ensure the file exists in the public directory.";
        }
    }
    return readmeContent;
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        if (!base64ImageBytes) {
             throw new Error("The API did not return an image. The prompt may have been blocked.");
        }
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        return imageUrl;

    } catch (error) {
        console.error("Error generating image from Gemini:", error);
        if (error instanceof Error && error.message.includes('blocked')) {
             throw new Error("Failed to generate image because the prompt was blocked for safety reasons. Please modify your prompt and try again.");
        }
        throw new Error("Failed to generate image. Please check your prompt and network connection.");
    }
};

export const generateContentStream = async (prompt: string, contentType: ContentType, tone: Tone, useGoogleSearch: boolean) => {
    try {
        const config: any = {
            thinkingConfig: { thinkingBudget: 0 }
        };

        let systemInstruction: string | undefined;
        let contents: string = prompt;

        if (contentType === 'Plugin Guideline Q&A') {
            systemInstruction = `You are an expert assistant for WordPress plugin developers. Your goal is to answer questions based on the provided WordPress Plugin Directory guidelines. Adhere strictly to the information given in the guidelines. If the answer isn't in the guidelines, say that you don't have enough information from the provided context. Format your answer using simple HTML tags like <p>, <ul>, and <li> where appropriate. The guidelines are:\n\n${PLUGIN_GUIDELINES_CONTEXT}`;
        } else if (contentType === 'Plugin Readme Q&A') {
            const readme = await getReadmeContent();
            systemInstruction = `You are an expert support assistant for the "WP Site Suite" WordPress plugin. Your goal is to answer questions based ONLY on the provided readme.txt file content. Be helpful and precise. If the answer is not in the provided content, state that the information is not available in the readme file. Do not invent information. Format your answer using simple HTML tags like <p>, <ul>, and <li> where appropriate. The readme.txt content is:\n\n${readme}`;
        } else if (contentType === 'Wireframe') {
             // For wireframe, the whole thing is the prompt, no system instruction
             contents = WIREFRAME_PROMPT_TEMPLATE.replace('{PROMPT}', prompt);
        } else if (contentType === 'WP Readme File') {
            systemInstruction = WP_README_DESCRIPTION_TEMPLATE.replace('{PROMPT}', prompt);
            contents = "Please generate the plugin description now based on the system instruction provided."; // Simple instruction to trigger the system prompt
        }
        else if (contentType !== 'Image') {
            systemInstruction = (PROMPT_TEMPLATES[contentType] || PROMPT_TEMPLATES['Blog Post']).replace('{TONE}', tone);
            if (useGoogleSearch) {
                config.tools = [{ googleSearch: {} }];
            }
        }
        
        if (systemInstruction) {
            config.systemInstruction = systemInstruction;
        }
        
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contents,
            config: config
        });
        return response;
    } catch (error) {
        console.error("Error generating content from Gemini:", error);
        throw new Error("Failed to generate content. Please check your API key and network connection.");
    }
};