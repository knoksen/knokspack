
import React, { useState } from 'react';
import Button from '../Button';
import ToggleSwitch from '../ToggleSwitch';
import type { ScanResult, ScanHistory } from '../../types';
import { MOCK_SCAN_RESULTS, MOCK_SCAN_HISTORY, ScanIcon } from '../../constants';
import { NavLink } from 'react-router-dom';

const SeverityBadge: React.FC<{ severity: ScanResult['severity'] }> = ({ severity }) => {
    const styles = {
        Critical: 'bg-red-200 text-red-800 border-red-400',
        High: 'bg-orange-200 text-orange-800 border-orange-400',
        Medium: 'bg-yellow-200 text-yellow-800 border-yellow-400',
        Low: 'bg-blue-200 text-blue-800 border-blue-400',
    };
    return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${styles[severity]}`}>{severity}</span>;
};

const ScanDashboardPage: React.FC = () => {
    const [scanLoading, setScanLoading] = useState(false);
    const [scanResults, setScanResults] = useState<ScanResult[]>(MOCK_SCAN_RESULTS);
    const [scanHistory, setScanHistory] = useState<ScanHistory[]>(MOCK_SCAN_HISTORY);
    
    const handleScanNow = () => {
        setScanLoading(true);
        setTimeout(() => {
            setScanLoading(false);
        }, 3000);
    };

    const handleFix = (id: string) => {
        setScanResults(prev => prev.map(r => r.id === id ? { ...r, status: 'Fixed' } : r));
    };

    const handleIgnore = (id: string) => {
        setScanResults(prev => prev.map(r => r.id === id ? { ...r, status: 'Ignored' } : r));
    };

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <NavLink to="/security" className="text-sm font-medium text-knokspack-primary hover:underline">&larr; Back to Security Dashboard</NavLink>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark mt-2">
                        Malware Scanner
                    </h1>
                    <p className="mt-2 text-lg text-knokspack-gray">
                        Scan your site for threats and manage scan settings.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Scan Results */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-knokspack-dark">Latest Scan Results</h2>
                                <Button onClick={handleScanNow} variant="primary" disabled={scanLoading}>
                                    <ScanIcon />
                                    <span className="ml-2">{scanLoading ? 'Scanning...' : 'Start New Scan'}</span>
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {scanResults.filter(r => r.status === 'Outstanding').map(result => (
                                            <tr key={result.id}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-700 truncate" title={result.file}>{result.file}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{result.issue}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm"><SeverityBadge severity={result.severity} /></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                                                    <Button onClick={() => handleFix(result.id)} variant="primary">Fix Now</Button>
                                                    <Button onClick={() => handleIgnore(result.id)} variant="outline">Ignore</Button>
                                                </td>
                                            </tr>
                                        ))}
                                         {scanResults.filter(r => r.status === 'Outstanding').length === 0 && (
                                            <tr><td colSpan={4} className="text-center py-10 text-gray-500">No outstanding issues found. Your site is clean!</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Settings & History */}
                    <div className="space-y-8">
                         <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold text-knokspack-dark mb-4">Scan Settings</h3>
                             <div className="space-y-4">
                                <ToggleSwitch label="Daily Automated Scans" enabled={true} onChange={() => {}} />
                                <ToggleSwitch label="Weekly Scan Summary" enabled={true} onChange={() => {}} />
                                <ToggleSwitch label="Instant Email Alerts" enabled={false} onChange={() => {}} />
                             </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                             <h3 className="text-xl font-bold text-knokspack-dark mb-4">Scan History</h3>
                             <ul className="divide-y divide-gray-200">
                                {scanHistory.map(scan => (
                                    <li key={scan.id} className="py-3 flex justify-between items-center">
                                        <p className="text-sm text-gray-600">{scan.date}</p>
                                        <p className={`text-sm font-bold ${scan.threatsFound > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {scan.threatsFound} threats found
                                        </p>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScanDashboardPage;
