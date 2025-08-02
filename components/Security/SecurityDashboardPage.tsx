
import React from 'react';
import Button from '../Button';
import { FirewallIcon, LoginIcon, ActivityLogIcon, ScanIcon, Cog6ToothIcon } from '../../constants';

interface SecurityCardProps {
    icon: React.ReactNode;
    title: string;
    statusText: string;
    statusColor: 'green' | 'yellow' | 'red';
    description: string;
    buttonText: string;
    link: string;
}

const StatusIndicator: React.FC<{ color: 'green' | 'yellow' | 'red' }> = ({ color }) => {
    const colorClasses = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
    };
    return <span className={`w-3 h-3 rounded-full ${colorClasses[color]}`}></span>;
};

const SecurityCard: React.FC<SecurityCardProps> = ({ icon, title, statusText, statusColor, description, buttonText, link }) => (
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
            <Button href={link} variant="secondary" fullWidth>
                {buttonText}
            </Button>
        </div>
    </div>
);

const SecurityDashboardPage: React.FC = () => {
    
    const securityModules = [
        {
            icon: <ScanIcon />,
            title: 'Malware Scanner',
            statusText: '3 Issues Found',
            statusColor: 'red' as 'red',
            description: `A recent scan found potential issues. Review the results to take action and secure your site.`,
            buttonText: 'View Scan Results',
            link: '#/security/scan',
        },
        {
            icon: <FirewallIcon />,
            title: 'Firewall (WAF)',
            statusText: 'Active',
            statusColor: 'green' as 'green',
            description: 'The web application firewall is actively blocking malicious traffic. 1,283 threats blocked this month.',
            buttonText: 'Manage Rules',
            link: '#/security/firewall',
        },
        {
            icon: <LoginIcon />,
            title: 'Brute Force Protection',
            statusText: 'Enabled',
            statusColor: 'green' as 'green',
            description: 'Login attempts are monitored. 2 IPs currently locked out. 2FA is recommended for all admins.',
            buttonText: 'View Blocked IPs',
            link: '#/security/blocked-ips',
        },
         {
            icon: <ActivityLogIcon />,
            title: 'Activity Log',
            statusText: 'Logging',
            statusColor: 'yellow' as 'yellow',
            description: 'Tracking all major changes on your site. 30-day log retention. New plugin activated yesterday.',
            buttonText: 'View Full Log',
            link: '#/security/activity-log',
        },
        {
            icon: <Cog6ToothIcon />,
            title: 'Security Settings',
            statusText: 'Configured',
            statusColor: 'green' as 'green',
            description: 'Manage spam protection, login security, auto-updates, and other advanced settings.',
            buttonText: 'Manage Settings',
            link: '#/security/settings',
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
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                    {securityModules.map((module, index) => (
                        <SecurityCard key={index} {...module} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboardPage;
