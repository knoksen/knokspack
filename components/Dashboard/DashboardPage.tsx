
import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import Button from '../Button';
import Modal from '../common/Modal';
import { ShieldIcon, ZapIcon, NewsletterIcon, ChartBarIcon, MOCK_ACTIVITY_FEED, BullhornIcon, RocketLaunchIcon, MobileIcon, ArchiveBoxIcon, SearchIcon } from '../../constants';
import type { ActivityFeedItem } from '../../types';

const OverviewCard: React.FC<{ title: string, value: string, link: string, icon: React.ReactNode }> = ({ title, value, link, icon }) => (
    <NavLink to={link} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col justify-between">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-knokspack-dark">{title}</h3>
            <div className="text-knokspack-primary">{icon}</div>
        </div>
        <p className="text-4xl font-bold text-knokspack-dark mt-4">{value}</p>
        <p className="text-sm font-medium text-knokspack-primary mt-2">View Dashboard &rarr;</p>
    </NavLink>
);

const QuickActionButton: React.FC<{ children: React.ReactNode, onClick?: () => void, href?: string, disabled?: boolean }> = ({ children, onClick, href, disabled }) => {
    const content = (
        <button onClick={onClick} disabled={disabled} className="text-left w-full h-full bg-knokspack-primary-light p-4 rounded-lg flex items-center gap-3 hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {children}
        </button>
    );

    return href ? <NavLink to={href}>{content}</NavLink> : content;
};

const ActivityItem: React.FC<{ item: ActivityFeedItem }> = ({ item }) => {
    const categoryColors = {
        Security: 'bg-red-100 text-red-800',
        Social: 'bg-blue-100 text-blue-800',
        System: 'bg-gray-100 text-gray-800',
        Newsletter: 'bg-indigo-100 text-indigo-800',
        Performance: 'bg-green-100 text-green-800'
    };
    return (
        <li className="flex items-center gap-4 py-4">
            <div className={`p-2 rounded-full ${categoryColors[item.category]}`}>
                {item.icon}
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-knokspack-dark">{item.action}</p>
                <p className="text-sm text-knokspack-gray">{item.details}</p>
            </div>
            <p className="text-sm text-gray-400 whitespace-nowrap">{item.timestamp}</p>
        </li>
    );
};


const DashboardPage: React.FC = () => {
    const { user } = useContext(UserContext);
    const [isScanning, setIsScanning] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
        }, 2500);
    };

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                        Welcome back, {user?.name.split(' ')[0]}!
                    </h1>
                    <p className="mt-2 text-lg text-knokspack-gray">
                        Here's what's happening with your site today.
                    </p>
                </div>
                
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-6 mb-12">
                    <OverviewCard title="Security" value="Secure" link="/security" icon={<ShieldIcon />} />
                    <OverviewCard title="Performance" value="Fast" link="/performance" icon={<ZapIcon />} />
                    <OverviewCard title="Backups" value="Safe" link="/backup" icon={<ArchiveBoxIcon />} />
                    <OverviewCard title="Search" value="Indexed" link="/search" icon={<SearchIcon />} />
                    <OverviewCard title="Growth Tools" value="Active" link="/growth" icon={<RocketLaunchIcon />} />
                    <OverviewCard title="Analytics" value="48k" link="/analytics" icon={<ChartBarIcon />} />
                    <OverviewCard title="Mobile App" value="Ready" link="/mobile" icon={<MobileIcon />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Quick Actions */}
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-bold text-knokspack-dark mb-4">Quick Actions</h2>
                        <div className="space-y-4">
                            <QuickActionButton href="/ai-assistant">Create New Post</QuickActionButton>
                            <QuickActionButton onClick={handleScan} disabled={isScanning}>
                                {isScanning ? 'Scanning...' : 'Scan Site Now'}
                            </QuickActionButton>
                            <QuickActionButton href="/promotion">Manage Promotions</QuickActionButton>
                             <QuickActionButton href="/crm">Add a Contact</QuickActionButton>
                        </div>
                    </div>

                     {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-knokspack-dark mb-4">Recent Activity</h2>
                        <div className="bg-white rounded-lg shadow-md">
                            <ul className="divide-y divide-gray-200 px-6">
                                {MOCK_ACTIVITY_FEED.slice(0, 5).map(item => (
                                    <ActivityItem key={item.id} item={item} />
                                ))}
                            </ul>
                            <div className="p-4 text-center border-t border-gray-100">
                                <Button variant="secondary" onClick={() => setIsActivityModalOpen(true)}>View All Activity</Button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
             <Modal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} title="Full Activity Log">
                <div className="bg-white rounded-lg">
                    <ul className="divide-y divide-gray-200 -mt-6 -mx-6">
                        {MOCK_ACTIVITY_FEED.map(item => (
                            <ActivityItem key={item.id} item={item} />
                        ))}
                    </ul>
                </div>
            </Modal>
        </div>
    );
};

export default DashboardPage;