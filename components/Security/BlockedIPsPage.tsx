
import React from 'react';
import { NavLink } from 'react-router-dom';
import type { BlockedIP } from '../../types';
import { MOCK_BLOCKED_IPS } from '../../constants';
import Button from '../Button';

const BlockedIPsPage: React.FC = () => {
    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                         <NavLink to="/security" className="text-sm font-medium text-knokspack-primary hover:underline">&larr; Back to Security Dashboard</NavLink>
                         <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark mt-2">
                            Blocked IPs
                        </h1>
                        <p className="mt-2 text-lg text-knokspack-gray">
                           IP addresses temporarily blocked by the Brute Force Protection module.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg">
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blocked At</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {MOCK_BLOCKED_IPS.map((ip: BlockedIP) => (
                                        <tr key={ip.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{ip.ipAddress}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ip.reason}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ip.blockedAt}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button variant="outline">Unblock</Button>
                                            </td>
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

export default BlockedIPsPage;
