
import React from 'react';
import { NavLink } from 'react-router-dom';
import type { ActivityLogEntry } from '../../types';
import { MOCK_ACTIVITY_LOG } from '../../constants';

const ActivityLogPage: React.FC = () => {
    // In a real app, you'd have pagination here
    const fullLog = [...MOCK_ACTIVITY_LOG, ...MOCK_ACTIVITY_LOG, ...MOCK_ACTIVITY_LOG];
    
    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                         <NavLink to="/security" className="text-sm font-medium text-knokspack-primary hover:underline">&larr; Back to Security Dashboard</NavLink>
                         <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark mt-2">
                            Activity Log
                        </h1>
                        <p className="mt-2 text-lg text-knokspack-gray">
                           A detailed log of all major events occurring on your website.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg">
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fullLog.map((log: ActivityLogEntry, index) => (
                                        <tr key={`${log.id}-${index}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.user}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.action}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{log.ipAddress}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogPage;
