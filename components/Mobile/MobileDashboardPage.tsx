
import React, { useState } from 'react';
import Button from '../Button';
import ToggleSwitch from '../ToggleSwitch';
import { NavLink } from 'react-router-dom';

const Card: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white p-6 rounded-lg shadow-lg ${className}`}>
        <h3 className="text-xl font-bold text-knokspack-dark mb-4 pb-3 border-b border-gray-200">{title}</h3>
        <div className="space-y-4 text-knokspack-gray">
            {children}
        </div>
    </div>
);


const MobileDashboardPage: React.FC = () => {
    const [fcmKey, setFcmKey] = useState('');
    const [pushSettings, setPushSettings] = useState({
        newPost: true,
        newComment: true,
        securityAlert: false,
    });
    
    const handleToggle = (id: keyof typeof pushSettings) => {
        setPushSettings(prev => ({...prev, [id]: !prev[id]}));
    };

    const handleSendTest = () => {
        if (!fcmKey) {
            alert('Please enter your FCM Server Key first.');
            return;
        }
        alert('Sending test push notification... (This is a demo)');
    };

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                        Mobile App
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-knokspack-gray">
                        Connect your native app, manage push notifications, and access your site's API.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                         <Card title="Push Notification Settings">
                            <div>
                                <label htmlFor="fcmKey" className="block text-sm font-medium text-knokspack-dark">FCM Server Key</label>
                                <input
                                    type="text"
                                    id="fcmKey"
                                    value={fcmKey}
                                    onChange={e => setFcmKey(e.target.value)}
                                    placeholder="Enter your Firebase Cloud Messaging server key"
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                            </div>
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h4 className="font-semibold text-knokspack-dark">Notification Events</h4>
                                <ToggleSwitch label="Notify on New Post" enabled={pushSettings.newPost} onChange={() => handleToggle('newPost')} />
                                <ToggleSwitch label="Notify on New Comment" enabled={pushSettings.newComment} onChange={() => handleToggle('newComment')} />
                                <ToggleSwitch label="Notify on Security Alert" enabled={pushSettings.securityAlert} onChange={() => handleToggle('securityAlert')} />
                            </div>
                             <div className="pt-4 border-t border-gray-100">
                                <Button variant="primary" onClick={handleSendTest}>Send Test Notification</Button>
                             </div>
                        </Card>

                        <Card title="API Status">
                            <p>Your custom mobile API endpoints are active and ready for use.</p>
                            <div>
                                <label className="block text-sm font-medium text-knokspack-dark">API Base URL</label>
                                <pre className="p-2 bg-gray-100 rounded-md text-sm break-words mt-1">/wp-json/wpsitesuite/v1/mobile/</pre>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-knokspack-dark">Example Endpoint</label>
                                <pre className="p-2 bg-gray-100 rounded-md text-sm break-words mt-1">/dashboard</pre>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1">
                        <Card title="Authentication Guide">
                            <h4 className="font-semibold text-knokspack-dark">How to Authenticate</h4>
                            <p>For secure communication with your mobile app, we strongly recommend using WordPress's built-in **Application Passwords** feature.</p>
                            <ol className="list-decimal list-inside space-y-2 mt-2">
                                <li>In your WordPress admin, go to <span className="font-mono bg-gray-100 px-1 rounded">Users &rarr; Profile</span>.</li>
                                <li>Scroll down to the "Application Passwords" section.</li>
                                <li>Enter a name for your app (e.g., "My iOS App") and click "Add New Application Password".</li>
                                <li>A new password will be generated. Copy this password immediately, as it will not be shown again.</li>
                                <li>Use this password for Basic Authentication in your mobile app's API requests.</li>
                            </ol>
                            <div className="mt-4">
                                <Button href="https://wordpress.org/documentation/article/application-passwords/" variant="secondary">Learn More</Button>
                            </div>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MobileDashboardPage;
