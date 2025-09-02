import React, { useState, useCallback, useEffect, useContext } from 'react';
import { generateContentStream, generateImage } from '../../services/geminiService';
import Button from '../Button';
import RadioGroup from '../RadioGroup';
import type { ContentType, Tone, ReadmeData } from '../../types';
import { CONTENT_TYPE_OPTIONS, TONE_OPTIONS, SUBSCRIPTION_LIMITS, AiIcon } from '../../constants';
import ToggleSwitch from '../ToggleSwitch';
import type { GenerateContentResponse } from '@google/generative-ai';
import { UserContext } from '../../contexts/UserContext';
import { NavLink } from 'react-router-dom';
import ReadmeForm from './ReadmeForm';

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);


const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-white animate-bounce animation-delay-0"></div>
        <div className="w-2 h-2 rounded-full bg-white animate-bounce animation-delay-200"></div>
        <div className="w-2 h-2 rounded-full bg-white animate-bounce animation-delay-400"></div>
        <span className="text-white">Generating...</span>
    </div>
);

const CopyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const AIAssistantPage: React.FC = () => {
    const { user, isAuthenticated, openAuthModal } = useContext(UserContext);
    const permissions = user ? SUBSCRIPTION_LIMITS[user.subscriptionPlan] : SUBSCRIPTION_LIMITS['Free'];
    
    const [prompt, setPrompt] = useState('');
    const [contentType, setContentType] = useState<ContentType>('Blog Post');
    const [tone, setTone] = useState<Tone>('Professional');
    const [useGoogleSearch, setUseGoogleSearch] = useState(false);
    const [sources, setSources] = useState<any[] | null>(null);
    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [readmeData, setReadmeData] = useState<ReadmeData>({
        pluginName: '',
        contributors: '',
        donateLink: '',
        tags: '',
        requiresAtLeast: '',
        testedUpTo: '',
        stableTag: '',
        requiresPHP: '',
        shortDescription: '',
        changelog: '',
    });

    const isContentTypeAllowed = permissions.allowedContentTypes === 'all' || permissions.allowedContentTypes.includes(contentType);
    const isGuidelineQA = contentType === 'Plugin Guideline Q&A';
    const isReadmeQA = contentType === 'Plugin Readme Q&A';
    const isReadmeGenerator = contentType === 'WP Readme File';
    const isImageGenerator = contentType === 'Image';

    const handleReadmeDataChange = (field: keyof ReadmeData, value: string) => {
        setReadmeData(prev => ({ ...prev, [field]: value }));
    };

    const assembleReadmeFile = (longDescription: string): string => {
        const {
            pluginName, contributors, donateLink, tags, requiresAtLeast,
            testedUpTo, stableTag, requiresPHP, shortDescription, changelog
        } = readmeData;
        
        return `=== ${pluginName || 'My Awesome Plugin'} ===
Contributors: ${contributors || 'your_wp_org_username'}
Donate link: ${donateLink || 'https://example.com/donate'}
Tags: ${tags || 'tag1, tag2'}
Requires at least: ${requiresAtLeast || '5.0'}
Tested up to: ${testedUpTo || '6.0'}
Stable tag: ${stableTag || '1.0.0'}
Requires PHP: ${requiresPHP || '7.4'}
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

${shortDescription || 'A short, snappy description of the plugin.'}

== Description ==

${longDescription || 'A detailed description of the plugin, its features, and why someone should use it.'}

== Changelog ==

${changelog || '= 1.0.0 =\n* Initial release.'}
`;
    };

    const handleGenerate = useCallback(async () => {
        if (!prompt || isLoading) return;
        if (!isAuthenticated) {
            openAuthModal('login');
            return;
        }
        if (!isContentTypeAllowed || (useGoogleSearch && !permissions.canUseGoogleSearch)) {
            setError("Your current plan doesn't support this feature. Please upgrade.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');
        setGeneratedImageUrl('');
        setSources(null);
        setIsCopied(false);

        try {
            if (isImageGenerator) {
                const imageUrl = await generateImage(prompt);
                setGeneratedImageUrl(imageUrl);
            } else if (isReadmeGenerator) {
                const stream = await generateContentStream(prompt, 'WP Readme File', tone, false);
                let longDescription = '';
                 for await (const chunk of stream) {
                    longDescription += chunk.text;
                }
                const fullReadmeContent = assembleReadmeFile(longDescription);
                setGeneratedContent(fullReadmeContent);
            } else {
                const stream = await generateContentStream(prompt, contentType, tone, useGoogleSearch);
                let lastChunk: GenerateContentResponse | null = null;
                for await (const chunk of stream) {
                    setGeneratedContent(prev => prev + chunk.text);
                    lastChunk = chunk;
                }

                if (lastChunk) {
                    const groundingMetadata = lastChunk.candidates?.[0]?.groundingMetadata;
                    if (groundingMetadata?.groundingChunks) {
                        setSources(groundingMetadata.groundingChunks);
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading, contentType, tone, useGoogleSearch, isAuthenticated, openAuthModal, isContentTypeAllowed, permissions.canUseGoogleSearch, readmeData, isReadmeGenerator, isImageGenerator]);

    const examplePrompts = isGuidelineQA 
    ? ["What are the rules about external links?", "Can I use trialware in my plugin?", "What license should my plugin use?"]
    : isReadmeGenerator
    ? ["A plugin that adds social sharing buttons", "A plugin that optimizes images on upload", "A plugin for creating contact forms"]
    : isReadmeQA
    ? ["What are the key features?", "How do I install this plugin?", "Is this plugin self-hosted?"]
    : isImageGenerator
    ? ["A photorealistic image of a cat wearing sunglasses", "A blue sports car driving on a coastal road, watercolor style", "A logo for a coffee shop called 'The Daily Grind'"]
    : ["The benefits of a minimalist website design", "Top 5 SEO tips for new bloggers in 2024", "Who won the last FIFA world cup?"];

    const handleExampleClick = (example: string) => {
        setPrompt(example);
    }

    const handleCopy = useCallback(async () => {
        if (!generatedContent) return;
        
        if (isReadmeGenerator) {
            try {
                await navigator.clipboard.writeText(generatedContent);
                setIsCopied(true);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                alert('Unable to copy to clipboard. Please try selecting and copying manually.');
            }
            return;
        }

        const contentHolder = document.createElement('div');
        contentHolder.innerHTML = generatedContent;
        document.body.appendChild(contentHolder);
        
        try {
            const selection = window.getSelection();
            if(selection){
                selection.removeAllRanges();
                const range = document.createRange();
                range.selectNode(contentHolder);
                selection.addRange(range);
            }
            
            const copyResult = document.execCommand('copy');
            if (!copyResult) {
                throw new Error('execCommand copy failed');
            }
            setIsCopied(true);
        } catch (err) {
            console.error('Failed to copy using execCommand: ', err);
            try {
                await navigator.clipboard.writeText(contentHolder.innerText);
                setIsCopied(true);
            } catch (clipboardErr) {
                console.error('Failed to copy using Clipboard API: ', clipboardErr);
                alert('Unable to copy to clipboard. Please try selecting and copying manually.');
            }
        } finally {
            document.body.removeChild(contentHolder);
            if(window.getSelection()) window.getSelection()?.removeAllRanges();
        }
    }, [generatedContent, isReadmeGenerator]);

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);
    
    useEffect(() => {
        // If the current selection is disabled, switch to the first available option.
        if (!isContentTypeAllowed && permissions.allowedContentTypes !== 'all' && Array.isArray(permissions.allowedContentTypes)) {
            setContentType(permissions.allowedContentTypes[0]);
        }
    }, [contentType, isContentTypeAllowed, permissions.allowedContentTypes]);


    const disabledContentTypes = permissions.allowedContentTypes === 'all' 
        ? [] 
        : CONTENT_TYPE_OPTIONS.filter(opt => !permissions.allowedContentTypes.includes(opt));

    const isOutputVisible = !!(generatedContent || generatedImageUrl);
    
    return (
        <div className="bg-knokspack-light-gray min-h-[calc(100vh-200px)]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
                    {/* Left Panel: Inputs */}
                    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                        <div className="space-y-6">
                            <h1 className="text-3xl font-bold text-knokspack-dark">AI Assistant</h1>
                            <RadioGroup
                                label="Content Type"
                                name="contentType"
                                options={CONTENT_TYPE_OPTIONS}
                                selectedValue={contentType}
                                onChange={(value) => setContentType(value as ContentType)}
                                disabledOptions={disabledContentTypes}
                            />

                            {!isContentTypeAllowed && (
                                 <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                                    <LockIcon /> This content type requires an upgrade. <NavLink to="/pricing" className="font-bold underline hover:text-yellow-900">View Plans</NavLink>.
                                 </div>
                            )}

                            { !isGuidelineQA && !isReadmeGenerator && !isReadmeQA && !isImageGenerator && (
                                <RadioGroup
                                    label="Tone of Voice"
                                    name="tone"
                                    options={TONE_OPTIONS}
                                    selectedValue={tone}
                                    onChange={(value) => setTone(value as Tone)}
                                />
                            )}
                            
                            <div>
                                <label htmlFor="prompt" className="block text-sm font-medium text-knokspack-dark mb-2">
                                  {isReadmeGenerator ? "Describe your plugin for the AI" 
                                    : isReadmeQA ? "Ask a question about the WP Site Suite plugin" 
                                    : isImageGenerator ? "Describe the image you want to create"
                                    : "What do you want to create?"}
                                </label>
                                <textarea
                                    id="prompt"
                                    rows={isReadmeGenerator ? 3 : 5}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={
                                        isReadmeGenerator ? "e.g., A plugin that automatically adds a table of contents to every blog post" 
                                        : isReadmeQA ? "e.g., Will this plugin slow down my site?"
                                        : isImageGenerator ? "e.g., A robot holding a red skateboard, 3d render"
                                        : "e.g., A blog post about the future of renewable energy"
                                    }
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary text-base"
                                    disabled={isLoading}
                                />
                                 <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="text-sm text-knokspack-gray mr-2 self-center">Try:</span>
                                    {examplePrompts.map(p => (
                                        <button 
                                            key={p} 
                                            onClick={() => handleExampleClick(p)}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 text-knokspack-gray font-medium py-1 px-3 rounded-full transition-colors disabled:opacity-50"
                                            disabled={isLoading}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                           {isReadmeGenerator && <ReadmeForm data={readmeData} onDataChange={handleReadmeDataChange} />}

                            {!isGuidelineQA && !isReadmeGenerator && !isReadmeQA && !isImageGenerator && (
                                <ToggleSwitch
                                    label="Enable Google Search"
                                    enabled={useGoogleSearch}
                                    onChange={setUseGoogleSearch}
                                    disabled={!permissions.canUseGoogleSearch}
                                />
                            )}

                            <div>
                                <Button onClick={handleGenerate} variant="primary" disabled={isLoading || !prompt || !isContentTypeAllowed} fullWidth>
                                    {isLoading ? <LoadingSpinner /> : (isReadmeGenerator ? 'Generate Readme File' : isImageGenerator ? 'Generate Image' : 'Generate Content')}
                                </Button>
                            </div>
                        </div>
                    </div>
                    {/* Right Panel: Output */}
                    <div className="bg-knokspack-dark p-6 md:p-8 rounded-lg shadow-lg relative flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                           <h2 className="text-xl font-bold text-white">Generated Output</h2>
                            {isOutputVisible && !isLoading && (
                                isImageGenerator ? (
                                    <a href={generatedImageUrl} download="generated-image.jpg" className="flex items-center gap-2 text-sm font-medium text-knokspack-primary-light hover:text-white transition-colors px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20">
                                        <DownloadIcon className="h-4 w-4" />
                                        <span>Download</span>
                                    </a>
                                ) : (
                                <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-medium text-knokspack-primary-light hover:text-white transition-colors px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-50" disabled={isCopied}>
                                    <CopyIcon className="h-4 w-4" />
                                    <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                                </button>
                                )
                            )}
                        </div>
                        <div className="bg-knokspack-dark text-white rounded-b-lg overflow-y-auto flex-grow prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-ul:text-gray-300 prose-li:marker:text-knokspack-primary min-h-[300px]">
                           {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <LoadingSpinner />
                                </div>
                           ) : error ? (
                                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                                    <strong>Error:</strong> {error}
                                </div>
                           ) : isImageGenerator ? (
                                generatedImageUrl ? (
                                    <img src={generatedImageUrl} alt="AI generated image" className="rounded-lg object-contain w-full h-full" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-knokspack-gray">
                                        <AiIcon/>
                                        <p className="mt-4">Your AI-generated image will appear here.</p>
                                    </div>
                                )
                           ) : generatedContent ? (
                               isReadmeGenerator 
                                ? <pre className="whitespace-pre-wrap text-sm font-mono"><code>{generatedContent}</code></pre>
                                : <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
                           ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-knokspack-gray">
                                    <AiIcon/>
                                    <p className="mt-4">Your AI-generated content will appear here.</p>
                                </div>
                           )}
                        </div>
                         {sources && sources.length > 0 && !isLoading && (
                            <div className="mt-4 pt-4 border-t border-gray-600">
                                <h3 className="text-sm font-semibold text-white mb-2">Sources:</h3>
                                <ul className="space-y-1 text-xs">
                                    {sources.map((source, index) => (
                                        <li key={index}>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-knokspack-primary-light hover:underline truncate block">
                                                {index + 1}. {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantPage;