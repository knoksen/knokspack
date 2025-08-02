
import React, { useState } from 'react';
import Button from '../Button';
import ToggleSwitch from '../ToggleSwitch';
import { ZapIcon } from '../../constants';

const ScoreCircle: React.FC<{ score: number, isLoading: boolean }> = ({ score, isLoading }) => {
    const getScoreColor = (s: number) => {
        if (s >= 90) return 'text-green-500';
        if (s >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60" />
                <circle
                    className={`${getScoreColor(score)} transition-all duration-1000 ease-in-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={isLoading ? circumference : offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {isLoading ? (
                     <div className="w-5 h-5 border-4 border-knokspack-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
                )}
            </div>
        </div>
    );
};

interface PerformanceSetting {
    id: 'caching' | 'minifyCss' | 'minifyJs' | 'lazyLoad' | 'cdn';
    title: string;
    description: string;
}

const PERFORMANCE_SETTINGS: PerformanceSetting[] = [
    { id: 'caching', title: 'Page Caching', description: 'Store static versions of your pages to serve them to visitors much faster.' },
    { id: 'minifyCss', title: 'Minify CSS', description: 'Remove unnecessary characters from CSS files to reduce their size.' },
    { id: 'minifyJs', title: 'Minify JavaScript', description: 'Remove unnecessary characters from JavaScript files to reduce their size.' },
    { id: 'lazyLoad', title: 'Lazy Load Images', description: 'Defer loading of off-screen images until they are needed by the user.' },
    { id: 'cdn', title: 'CDN Integration', description: 'Serve assets from a global network of servers for faster delivery worldwide.' },
];

const PerformanceDashboardPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [desktopScore, setDesktopScore] = useState(78);
    const [mobileScore, setMobileScore] = useState(62);
    
    const initialSettings = {
        caching: true,
        minifyCss: true,
        minifyJs: false,
        lazyLoad: true,
        cdn: false,
    };
    const [settings, setSettings] = useState<Record<string, boolean>>(initialSettings);

    const handleAnalyze = () => {
        setIsLoading(true);
        setTimeout(() => {
            setDesktopScore(Math.floor(Math.random() * (99 - 70 + 1) + 70));
            setMobileScore(Math.floor(Math.random() * (95 - 55 + 1) + 55));
            setIsLoading(false);
        }, 2500);
    };

    const handleToggle = (id: string) => {
        setSettings(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                        Performance Dashboard
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-knokspack-gray">
                        Monitor and boost your site's speed. Faster sites improve SEO and user experience.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg mb-10">
                    <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-semibold mb-4 text-knokspack-dark">Desktop Score</h3>
                            <ScoreCircle score={desktopScore} isLoading={isLoading} />
                        </div>
                        <div className="flex flex-col items-center">
                             <h3 className="text-xl font-semibold mb-4 text-knokspack-dark">Mobile Score</h3>
                            <ScoreCircle score={mobileScore} isLoading={isLoading} />
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <Button onClick={handleAnalyze} variant="primary" disabled={isLoading}>
                             {isLoading ? 'Analyzing...' : 'Re-analyze Site'}
                        </Button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-knokspack-dark mb-6 text-center">Optimization Settings</h2>
                    <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
                        {PERFORMANCE_SETTINGS.map(setting => (
                            <div key={setting.id} className="p-6 flex flex-col md:flex-row items-center justify-between">
                                <div className="flex-1 mb-4 md:mb-0">
                                    <h4 className="text-lg font-semibold text-knokspack-dark">{setting.title}</h4>
                                    <p className="text-knokspack-gray mt-1">{setting.description}</p>
                                </div>
                                <div className="w-full md:w-auto">
                                    <ToggleSwitch
                                        label={settings[setting.id] ? 'Enabled' : 'Disabled'}
                                        enabled={settings[setting.id]}
                                        onChange={() => handleToggle(setting.id)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboardPage;