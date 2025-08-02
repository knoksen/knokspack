
import React from 'react';
import { NavLink } from 'react-router-dom';
import type { FirewallRule } from '../../types';
import { MOCK_FIREWALL_RULES } from '../../constants';
import Button from '../Button';

const FirewallPage: React.FC = () => {
    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                         <NavLink to="/security" className="text-sm font-medium text-knokspack-primary hover:underline">&larr; Back to Security Dashboard</NavLink>
                         <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark mt-2">
                            Firewall (WAF)
                        </h1>
                        <p className="mt-2 text-lg text-knokspack-gray">
                           Manage rules for the Web Application Firewall.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg">
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Toggle</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {MOCK_FIREWALL_RULES.map((r: FirewallRule) => (
                                        <tr key={r.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.rule}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.createdAt}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button variant="outline">
                                                    {r.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                </Button>
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

export default FirewallPage;
