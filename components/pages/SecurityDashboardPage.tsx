
import React, { useState } from 'react';
import Button from '../Button';
import { BugIcon, FirewallIcon, LoginIcon, ActivityLogIcon } from '../../constants';

interface SecurityCardProps {
    icon: React.ReactNode;
    title: string;
    statusText: string;
    statusColor: 'green' | 'yellow' | 'red';
    description: string;
    buttonText: string;
    onButtonClick: () => void;
    isLoading?: boolean;
}

const StatusIndicator: React.FC<{ color: 'green' | 'yellow' | 'red' }> = ({ color }) => {
    const colorClasses = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
    };
    return <span className={`w-3 h-3 rounded-full ${colorClasses[color]}`}></span>;
};

const SecurityCard: React.FC<SecurityCardProps> = ({ icon, title, statusText, statusColor, description, buttonText, onButtonClick, isLoading }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="text-knokspack-primary">{icon}</div>
                <h3 className="text-lg font-semibold text-knokspack-dark">{title}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <StatusIndicator color={statusColor} />
                <span className={`font-medium text-gray-600`}>{statusText}</span>
            </div>
        </div>
        <p className="text-base text-knokspack-gray flex-grow">{description}</p>
        <div className="mt-6">
            <Button onClick={onButtonClick} variant="secondary" fullWidth disabled={isLoading}>
                {isLoading ? 'Processing...' : buttonText}
            </Button>
        </div>
    </div>
);

const SecurityDashboardPage: React.FC = () => {
    const [scanLoading, setScanLoading] = useState(false);
    const [lastScan, setLastScan] = useState('2 hours ago');

    const handleScanNow = () => {
        setScanLoading(true);
        setTimeout(() => {
            setLastScan('Just now');
            setScanLoading(false);
        }, 2000);
    };

    const securityModules = [
        {
            icon: <BugIcon />,
            title: 'Malware Scan',
            statusText: 'Clean',
            statusColor: 'green' as 'green',
            description: `Your files are clean. Last checked ${lastScan}. Schedule automated scans to keep your site safe.`,
            buttonText: 'Scan Now',
            onButtonClick: handleScanNow,
            isLoading: scanLoading,
        },
        {
            icon: <FirewallIcon />,
            title: 'Firewall (WAF)',
            statusText: 'Active',
            statusColor: 'green' as 'green',
            description: 'The web application firewall is actively blocking malicious traffic. 1,283 threats blocked this month.',
            buttonText: 'Manage Rules',
            onButtonClick: () => alert('Manage Firewall Rules (Not Implemented)'),
        },
        {
            icon: <LoginIcon />,
            title: 'Brute Force Protection',
            statusText: 'Enabled',
            statusColor: 'green' as 'green',
            description: 'Login attempts are monitored. 2 IPs currently locked out. 2FA is recommended for all admins.',
            buttonText: 'View Blocked IPs',
            onButtonClick: () => alert('View Blocked IPs (Not Implemented)'),
        },
         {
            icon: <ActivityLogIcon />,
            title: 'Activity Log',
            statusText: 'Logging',
            statusColor: 'yellow' as 'yellow',
            description: 'Tracking all major changes on your site. 30-day log retention. New plugin activated yesterday.',
            buttonText: 'View Full Log',
            onButtonClick: () => alert('View Full Activity Log (Not Implemented)'),
        },
    ];

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                        Security Dashboard
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-knokspack-gray">
                        An overview of your site's security status. All systems are currently operational.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                    {securityModules.map((module, index) => (
                        <SecurityCard key={index} {...module} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboardPage;
