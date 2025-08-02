
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Button from '../Button';
import ToggleSwitch from '../ToggleSwitch';
import type { PluginOrTheme } from '../../types';
import { MOCK_PLUGINS, MOCK_THEMES } from '../../constants';

const SecuritySettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'spam' | 'login' | 'updates'>('general');
    const [plugins, setPlugins] = useState<PluginOrTheme[]>(MOCK_PLUGINS);
    const [themes, setThemes] = useState<PluginOrTheme[]>(MOCK_THEMES);

    const handleToggle = (type: 'plugin' | 'theme', id: string) => {
        const updater = (items: PluginOrTheme[]) => items.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item);
        if (type === 'plugin') {
            setPlugins(updater);
        } else {
            setThemes(updater);
        }
    };

    const renderAutoUpdateTable = (type: 'plugin' | 'theme', items: PluginOrTheme[]) => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{type === 'plugin' ? 'Plugin' : 'Theme'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto-updates</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.map(item => (
                        <tr key={item.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.version}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <ToggleSwitch label={item.enabled ? 'On' : 'Off'} enabled={item.enabled} onChange={() => handleToggle(type, item.id)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <ToggleSwitch label="Uptime / Downtime Monitoring" enabled={true} onChange={() => {}} />
                        <div>
                            <label htmlFor="alertEmail" className="block text-sm font-medium text-knokspack-dark">Alert Recipient Email</label>
                            <input type="email" id="alertEmail" defaultValue="admin@example.com" className="mt-1 block w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary" />
                        </div>
                    </div>
                );
            case 'spam':
                return (
                    <div className="space-y-4">
                        <p className="text-knokspack-gray">Protect your comments and forms from spam using Akismet.</p>
                        <div>
                             <label htmlFor="akismetKey" className="block text-sm font-medium text-knokspack-dark">Akismet API Key</label>
                            <input type="text" id="akismetKey" placeholder="Enter your Akismet API Key" className="mt-1 block w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary" />
                        </div>
                    </div>
                );
            case 'login':
                return (
                     <div className="space-y-6">
                        <ToggleSwitch label="WordPress.com Secure Sign-On (SSO)" enabled={false} onChange={() => {}} />
                        <ToggleSwitch label="Require 2-Factor Authentication (2FA) for Admins" enabled={true} onChange={() => {}} />
                    </div>
                );
            case 'updates':
                return (
                    <div className="space-y-8">
                        <div>
                            <h4 className="font-semibold text-knokspack-dark mb-2">Plugins</h4>
                            {renderAutoUpdateTable('plugin', plugins)}
                        </div>
                         <div>
                            <h4 className="font-semibold text-knokspack-dark mb-2">Themes</h4>
                            {renderAutoUpdateTable('theme', themes)}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <NavLink to="/security" className="text-sm font-medium text-knokspack-primary hover:underline">&larr; Back to Security Dashboard</NavLink>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark mt-2">Security Settings</h1>
                        <p className="mt-2 text-lg text-knokspack-gray">Configure advanced security options for your site.</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button onClick={() => setActiveTab('general')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'general' ? 'border-knokspack-primary text-knokspack-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>General</button>
                                <button onClick={() => setActiveTab('spam')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'spam' ? 'border-knokspack-primary text-knokspack-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Spam Protection</button>
                                <button onClick={() => setActiveTab('login')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'login' ? 'border-knokspack-primary text-knokspack-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Login Security</button>
                                <button onClick={() => setActiveTab('updates')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'updates' ? 'border-knokspack-primary text-knokspack-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Auto-updates</button>
                            </nav>
                        </div>
                        <div className="pt-8">
                            {renderContent()}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                            <Button variant="primary">Save Settings</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettingsPage;
