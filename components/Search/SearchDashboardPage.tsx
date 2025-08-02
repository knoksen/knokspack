
import React, { useState } from 'react';
import Button from '../Button';
import ToggleSwitch from '../ToggleSwitch';
import type { SearchAnalyticsQuery } from '../../types';
import { MOCK_SEARCH_ANALYTICS } from '../../constants';
import { NavLink } from 'react-router-dom';

const SearchDashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'settings' | 'indexing' | 'analytics'>('analytics');
    const [isIndexing, setIsIndexing] = useState(false);
    const [indexStatus, setIndexStatus] = useState('Last indexed: 2 hours ago');
    const [searchSettings, setSearchSettings] = useState({
        instantSearch: true,
        searchPosts: true,
        searchPages: true,
        searchProducts: true,
    });

    const handleToggle = (key: keyof typeof searchSettings) => {
        setSearchSettings(prev => ({...prev, [key]: !prev[key]}));
    };

    const handleRebuildIndex = () => {
        setIsIndexing(true);
        setIndexStatus('Indexing in progress...');
        setTimeout(() => {
            setIsIndexing(false);
            setIndexStatus('Last indexed: Just now');
        }, 3500);
    };

    const handleExport = () => {
        const headers = "term,searches,clicks,ctr\n";
        const csvContent = MOCK_SEARCH_ANALYTICS.map(q => `${q.term},${q.searches},${q.clicks},${q.ctr}`).join('\n');
        const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'search-analytics.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'settings':
                return (
                    <div className="space-y-6">
                        <ToggleSwitch label="Enable Instant AJAX Search" enabled={searchSettings.instantSearch} onChange={() => handleToggle('instantSearch')} />
                        <div>
                            <h4 className="font-semibold text-knokspack-dark">Content to Index</h4>
                            <p className="text-sm text-gray-500 mb-4">Select which post types should be included in search results.</p>
                            <div className="space-y-3">
                                <label className="flex items-center"><input type="checkbox" checked={searchSettings.searchPosts} onChange={() => handleToggle('searchPosts')} className="h-4 w-4 rounded border-gray-300 text-knokspack-primary focus:ring-knokspack-primary" /> <span className="ml-2">Posts</span></label>
                                <label className="flex items-center"><input type="checkbox" checked={searchSettings.searchPages} onChange={() => handleToggle('searchPages')} className="h-4 w-4 rounded border-gray-300 text-knokspack-primary focus:ring-knokspack-primary" /> <span className="ml-2">Pages</span></label>
                                <label className="flex items-center"><input type="checkbox" checked={searchSettings.searchProducts} onChange={() => handleToggle('searchProducts')} className="h-4 w-4 rounded border-gray-300 text-knokspack-primary focus:ring-knokspack-primary" /> <span className="ml-2">Products (WooCommerce)</span></label>
                            </div>
                        </div>
                    </div>
                );
            case 'indexing':
                return (
                     <div className="text-center">
                        <p className="text-lg text-knokspack-gray">{indexStatus}</p>
                        <p className="text-sm text-gray-500 mt-2 mb-6">Your content is automatically indexed. Use this button to manually force a re-index of all selected content types.</p>
                        <Button variant="primary" onClick={handleRebuildIndex} disabled={isIndexing}>
                            {isIndexing ? 'Indexing...' : 'Re-build Index'}
                        </Button>
                    </div>
                );
            case 'analytics':
                 return (
                    <div>
                        <div className="flex justify-end mb-4">
                            <Button variant="secondary" onClick={handleExport}>Export CSV</Button>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Search Term</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Searches</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {MOCK_SEARCH_ANALYTICS.map(query => (
                                        <tr key={query.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{query.term}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{query.searches}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{query.clicks}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{query.ctr}</td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                            Advanced Search
                        </h1>
                        <p className="mt-2 text-lg text-knokspack-gray">
                           Configure your site's search engine and analyze user queries.
                        </p>
                    </div>

                     <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics' ? 'border-knokspack-primary text-knokspack-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Analytics
                                </button>
                                <button
                                    onClick={() => setActiveTab('indexing')}
                                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'indexing' ? 'border-knokspack-primary text-knokspack-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Indexing
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-knokspack-primary text-knokspack-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Settings
                                </button>
                            </nav>
                        </div>
                        <div className="pt-8">
                            {renderContent()}
                        </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default SearchDashboardPage;