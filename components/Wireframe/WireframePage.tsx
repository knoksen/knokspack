
import React, { useState, useCallback } from 'react';
import { generateContentStream } from '../../services/geminiService';
import Button from '../Button';
import type { GenerateContentResponse } from '@google/genai';

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        <span className="text-white">Generating...</span>
    </div>
);

const CopyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


const WireframePage: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!prompt || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedCode('');
        setIsCopied(false);

        try {
            const stream = await generateContentStream(prompt, 'Wireframe', 'Professional', false);
            for await (const chunk of stream) {
                setGeneratedCode(prev => prev + chunk.text);
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading]);

    const handleCopy = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    const examplePrompts = [
        "A responsive pricing table with 3 tiers",
        "A hero section with an image on the right",
        "A login form in a card",
    ];
    
    const handleExampleClick = (example: string) => {
        setPrompt(example);
    }

    return (
        <div className="bg-knokspack-light-gray min-h-[calc(100vh-200px)] py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">AI Wireframe Generator</h1>
                        <p className="mt-4 text-lg text-knokspack-gray">
                            Describe a component and watch it come to life. Rapid prototyping with AI.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Input Panel */}
                        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="prompt" className="block text-sm font-medium text-knokspack-dark mb-2">
                                        Describe the UI component you want to build
                                    </label>
                                    <textarea
                                        id="prompt"
                                        rows={5}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="e.g., 'A responsive navbar with a logo on the left and 3 links on the right'"
                                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary text-base"
                                        disabled={isLoading}
                                    />
                                     <div className="flex flex-wrap gap-2 mt-3">
                                        <span className="text-sm text-knokspack-gray mr-2 self-center">Try an example:</span>
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
                                <div>
                                    <Button onClick={handleGenerate} variant="primary" disabled={isLoading || !prompt} fullWidth>
                                        {isLoading ? <LoadingSpinner /> : 'Generate Wireframe'}
                                    </Button>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                                    <strong className="font-bold">Error: </strong>
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}

                             {generatedCode && !isLoading && (
                                <div className="mt-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="text-xl font-bold text-knokspack-dark">Generated Code</h2>
                                        <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-medium text-knokspack-primary hover:text-blue-700 transition-colors px-3 py-1.5 rounded-md bg-knokspack-primary-light hover:bg-blue-200 disabled:opacity-50" disabled={isCopied}>
                                            <CopyIcon className="h-4 w-4" />
                                            <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                                        </button>
                                    </div>
                                    <pre className="bg-knokspack-dark text-white p-4 rounded-lg overflow-x-auto text-sm">
                                        <code>{generatedCode}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                        {/* Output Panel */}
                        <div className="bg-white rounded-lg shadow-lg p-2">
                            <h2 className="text-xl font-bold text-knokspack-dark p-4">Preview</h2>
                             <div className="border-t border-gray-200">
                                {isLoading ? (
                                     <div className="flex justify-center items-center h-96">
                                         <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 rounded-full bg-knokspack-dark animate-bounce" style={{ animationDelay: '0s' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-knokspack-dark animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-knokspack-dark animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                            <span className="text-knokspack-gray">Building...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4" dangerouslySetInnerHTML={{ __html: generatedCode }} />
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WireframePage;