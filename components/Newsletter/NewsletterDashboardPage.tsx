
import React, { useState } from 'react';
import Button from '../Button';
import Modal from '../common/Modal';
import type { Subscriber, NewsletterCampaign } from '../../types';
import { NewsletterIcon, UserIcon, ZapIcon } from '../../constants';

const INITIAL_CAMPAIGNS: NewsletterCampaign[] = [
    { id: '1', title: 'Weekly Digest: AI in 2024', status: 'Sent', sentAt: '3 days ago', recipients: 1250, openRate: 28.5 },
    { id: '2', title: 'New Feature Announcement!', status: 'Sent', sentAt: '1 week ago', recipients: 1180, openRate: 35.2 },
    { id: '3', title: 'Holiday Promotion', status: 'Scheduled', sentAt: 'in 2 days', recipients: 1300, openRate: 0 },
    { id: '4', title: 'Monthly Roundup', status: 'Draft', sentAt: '-', recipients: 0, openRate: 0 },
];

const MOCK_SUBSCRIBERS: Subscriber[] = [
    { id: 's1', name: 'Alice Johnson', email: 'alice.j@example.com', subscribedAt: '2 hours ago', status: 'Confirmed' },
    { id: 's2', name: 'Bob Williams', email: 'bob.w@example.com', subscribedAt: '1 day ago', status: 'Confirmed' },
    { id: 's3', name: 'Charlie Brown', email: 'charlie.b@example.com', subscribedAt: '3 days ago', status: 'Confirmed' },
    { id: 's4', name: 'Diana Miller', email: 'diana.m@example.com', subscribedAt: '5 days ago', status: 'Pending' },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-knokspack-gray">{title}</p>
            <p className="text-3xl font-bold text-knokspack-dark mt-1">{value}</p>
        </div>
        <div className="text-knokspack-primary bg-knokspack-primary-light p-3 rounded-full">
            {icon}
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: NewsletterCampaign['status'] | Subscriber['status'] }> = ({ status }) => {
    const styles = {
        Sent: 'bg-green-100 text-green-800',
        Confirmed: 'bg-green-100 text-green-800',
        Scheduled: 'bg-yellow-100 text-yellow-800',
        Draft: 'bg-gray-100 text-gray-800',
        Pending: 'bg-orange-100 text-orange-800',
    };
    const style = styles[status] || styles['Draft'];
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>{status}</span>;
};


const NewsletterDashboardPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>(INITIAL_CAMPAIGNS);
    const [newCampaignTitle, setNewCampaignTitle] = useState('');

    const handleCreateNewsletter = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCampaignTitle) return;

        const newCampaign: NewsletterCampaign = {
            id: `cam-${Date.now()}`,
            title: newCampaignTitle,
            status: 'Draft',
            sentAt: '-',
            recipients: 0,
            openRate: 0,
        };
        setCampaigns(prev => [newCampaign, ...prev]);
        setNewCampaignTitle('');
        setIsModalOpen(false);
    };

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-12">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                            Newsletter
                        </h1>
                        <p className="mt-2 text-lg text-knokspack-gray">
                            Engage your audience with beautiful email campaigns.
                        </p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <NewsletterIcon />
                        <span className="ml-2">Create Newsletter</span>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard title="Total Subscribers" value="1,287" icon={<UserIcon />} />
                    <StatCard title="Avg. Open Rate" value="31.2%" icon={<NewsletterIcon />} />
                    <StatCard title="Avg. Click Rate" value="4.8%" icon={<ZapIcon />} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {/* Recent Campaigns */}
                    <div>
                        <h2 className="text-2xl font-bold text-knokspack-dark mb-4">Recent Campaigns</h2>
                        <div className="bg-white rounded-lg shadow-md">
                            <ul className="divide-y divide-gray-200">
                                {campaigns.map(campaign => (
                                    <li key={campaign.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-knokspack-dark">{campaign.title}</p>
                                            <p className="text-sm text-knokspack-gray">
                                                {campaign.status === 'Sent' ? `Sent ${campaign.sentAt}` : campaign.status === 'Scheduled' ? `Scheduled for ${campaign.sentAt}` : 'Not sent'}
                                                {campaign.status === 'Sent' && `  ·  ${campaign.recipients} recipients`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={campaign.status} />
                                            {campaign.status === 'Sent' && (
                                                <p className="text-sm text-knokspack-gray mt-1">{campaign.openRate}% opened</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                     {/* Recent Subscribers */}
                     <div>
                        <h2 className="text-2xl font-bold text-knokspack-dark mb-4">Recent Subscribers</h2>
                        <div className="bg-white rounded-lg shadow-md">
                             <ul className="divide-y divide-gray-200">
                                {MOCK_SUBSCRIBERS.map(subscriber => (
                                    <li key={subscriber.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-knokspack-dark">{subscriber.name}</p>
                                            <p className="text-sm text-knokspack-gray">{subscriber.email}</p>
                                        </div>
                                        <div className="text-right">
                                             <StatusBadge status={subscriber.status} />
                                             <p className="text-sm text-knokspack-gray mt-1">{subscriber.subscribedAt}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Newsletter">
                <form onSubmit={handleCreateNewsletter} className="space-y-4">
                    <div>
                        <label htmlFor="campaignTitle" className="block text-sm font-medium text-knokspack-dark">Campaign Title</label>
                        <input
                            type="text"
                            id="campaignTitle"
                            value={newCampaignTitle}
                            onChange={(e) => setNewCampaignTitle(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary"
                            placeholder="e.g., May 2024 Roundup"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Save as Draft</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default NewsletterDashboardPage;
