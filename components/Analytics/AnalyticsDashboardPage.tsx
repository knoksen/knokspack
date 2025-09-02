
import React, { useState } from 'react';
import Button from '../Button';
import type { AnalyticsDataPoint, TopContent, TopReferrer } from '../../types';
import { EyeIcon, UsersIcon, ClockIcon, ChartBarIcon, GlobeAltIcon } from '../../constants';

// MOCK DATA
const MOCK_ANALYTICS_DATA: AnalyticsDataPoint[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * (1500 - 300 + 1) + 300),
    };
});

const MOCK_TOP_CONTENT: TopContent[] = [
    { id: '1', title: 'The Ultimate Guide to WordPress Security', url: '/blog/wordpress-security', views: 2450 },
    { id: '2', title: 'Our New AI Assistant Feature', url: '/features/ai-assistant', views: 1890 },
    { id: '3', title: 'Performance Tuning for High Traffic Sites', url: '/blog/performance-tuning', views: 1520 },
    { id: '4', title: 'Home Page', url: '/', views: 1280 },
    { id: '5', title: 'Pricing Plans', url: '/pricing', views: 980 },
];

const MOCK_TOP_REFERRERS: TopReferrer[] = [
    { id: '1', domain: 'google.com', views: 3200 },
    { id: '2', domain: 'twitter.com', views: 1540 },
    { id: '3', domain: 'github.com', views: 890 },
    { id: '4', domain: 'dev.to', views: 650 },
    { id: '5', domain: 'Direct Traffic', views: 2100 },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="stats-card flex items-center gap-4">
        <div className="text-knokspack-primary bg-knokspack-primary-light p-3 rounded-full">
            {icon}
        </div>
        <div>
            <h3>{title}</h3>
            <div className="stats-value">{value}</div>
        </div>
    </div>
);

const AnalyticsChart: React.FC<{ data: AnalyticsDataPoint[] }> = ({ data }) => {
    const maxViews = Math.max(...data.map(d => d.views), 0);
    return (
        <div className="chart-container">
            <div className="w-full h-full relative">
                {/* Y-Axis lines and labels */}
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="absolute w-full" style={{ bottom: `${(i / 4) * 100}%` }}>
                        <div className="flex items-center">
                            <span className="text-xs text-gray-400 pr-2">{Math.round((maxViews / 4) * i)}</span>
                            <div className="flex-1 border-t border-gray-200 border-dashed"></div>
                        </div>
                    </div>
                ))}
                {/* Bars */}
                <div className="w-full h-full flex items-end justify-between gap-1 absolute bottom-0">
                    {data.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                                className="w-full bg-knokspack-primary hover:bg-blue-600 rounded-t-sm"
                                style={{ height: `${(d.views / maxViews) * 100}%` }}
                                title={`${d.date}: ${d.views} views`}
                            />
                            <span className="text-xs text-gray-400 mt-1 transform rotate-45">{ (i % 3 === 0) ? d.date : ''}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const AnalyticsDashboardPage: React.FC = () => {
    const [dateRange, setDateRange] = useState('Last 30 days');
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = () => {
        const headers = "date,views\n";
        const csvContent = MOCK_ANALYTICS_DATA.map(d => `${d.date},${d.views}`).join('\n');
        const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'analytics-export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="knokspack-analytics">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                            Analytics
                        </h1>
                        <p className="mt-2 text-lg text-knokspack-gray">
                            Your website's performance at a glance.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="period-selector relative">
                            <Button variant="outline" onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}>{dateRange}</Button>
                             {isDateRangeOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    {['Last 7 days', 'Last 30 days', 'Last 90 days'].map(range => (
                                        <button 
                                            key={range}
                                            onClick={() => { setDateRange(range); setIsDateRangeOpen(false); }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button variant="primary" onClick={handleExport}>Export CSV</Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-overview">
                    <StatCard title="Total Views" value="48,291" icon={<EyeIcon />} />
                    <StatCard title="Unique Visitors" value="32,812" icon={<UsersIcon />} />
                    <StatCard title="Bounce Rate" value="42.5%" icon={<ChartBarIcon />} />
                    <StatCard title="Avg. Session" value="2m 15s" icon={<ClockIcon />} />
                </div>
                
                {/* Main Chart */}
                <div className="chart-grid">
                    <div>
                        <h2 className="text-2xl font-bold text-knokspack-dark mb-4">Traffic Trend</h2>
                        <AnalyticsChart data={MOCK_ANALYTICS_DATA} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Top Content */}
                    <div className="top-pages">
                        <h2>Top Content</h2>
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left">Page</th>
                                    <th className="text-right">Views</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_TOP_CONTENT.map(content => (
                                    <tr key={content.id}>
                                        <td className="py-2">
                                            <div className="truncate">
                                                <p className="font-semibold text-knokspack-dark truncate" title={content.title}>{content.title}</p>
                                                <p className="text-sm text-knokspack-gray truncate">{content.url}</p>
                                            </div>
                                        </td>
                                        <td className="text-right py-2">
                                            <p className="font-bold text-knokspack-dark">{content.views.toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">views</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     {/* Top Referrers */}
                     <div className="top-pages">
                        <h2>Top Referrers</h2>
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left">Source</th>
                                    <th className="text-right">Views</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_TOP_REFERRERS.map(referrer => (
                                    <tr key={referrer.id}>
                                        <td className="py-2">
                                            <div className="flex items-center gap-3">
                                                <GlobeAltIcon />
                                                <p className="font-semibold text-knokspack-dark">{referrer.domain}</p>
                                            </div>
                                        </td>
                                        <td className="text-right py-2">
                                            <p className="font-bold text-knokspack-dark">{referrer.views.toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">views</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsDashboardPage;
