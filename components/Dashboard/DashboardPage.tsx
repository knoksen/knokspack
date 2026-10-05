
import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import Button from '../Button';
import Modal from '../common/Modal';
import { ShieldIcon, ZapIcon, ChartBarIcon, ArchiveBoxIcon, SearchIcon } from '../../constants';
import { apiFetch, wpData } from '../../services/wpApi';

type Overview = {
    stats: { views30: number; visitors30: number };
    security: { blockedIps: number; lastScan: string | null; malware: number; changed: number };
    backups: { type: string; size: number; status: string; created_at: string }[];
    activity: { action: string; details: Record<string, string> | null; created_at: string }[];
    ai: { configured: boolean };
};
type ScanResult = { time: string; malware: string[]; changed: string[] };

const ACTION_LABELS: Record<string, string> = {
    login: 'Signed in',
    failed_login: 'Failed login',
    blocked_request: 'Request blocked by firewall',
};

const fmtDate = (value: string | null) => {
    if (!value) return 'never';
    const d = new Date(value.includes('T') ? value : value.replace(' ', 'T') + 'Z');
    return isNaN(d.getTime()) ? value : d.toLocaleString();
};

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

const ActivityItem: React.FC<{ item: Overview['activity'][number] }> = ({ item }) => {
    const details = item.details ? Object.entries(item.details).map(([k, v]) => `${k}: ${v}`).join(' · ') : '';
    return (
        <li className="flex items-center gap-4 py-4">
            <div className={`p-2 rounded-full ${item.action === 'login' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <ShieldIcon />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-knokspack-dark">{ACTION_LABELS[item.action] || item.action}</p>
                <p className="text-sm text-knokspack-gray">{details}</p>
            </div>
            <p className="text-sm text-gray-400 whitespace-nowrap">{fmtDate(item.created_at)}</p>
        </li>
    );
};


const DashboardPage: React.FC = () => {
    const { user } = useContext(UserContext);
    const [isScanning, setIsScanning] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [overview, setOverview] = useState<Overview | null>(null);
    const [error, setError] = useState('');
    const [scan, setScan] = useState<ScanResult | null>(null);

    const load = () => apiFetch<Overview>('overview').then(setOverview).catch((e: Error) => setError(e.message));
    useEffect(() => { if (wpData()) load(); }, []);

    const handleScan = async () => {
        setIsScanning(true);
        setError('');
        try {
            setScan(await apiFetch<ScanResult>('scan', {}));
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Scan failed');
        } finally {
            setIsScanning(false);
        }
    };

    const sec = overview?.security;
    const securityValue = !overview ? '…' : sec!.malware > 0 ? `${sec!.malware} issue${sec!.malware === 1 ? '' : 's'}` : sec!.lastScan ? 'Clean' : 'Not scanned';
    const lastBackup = overview?.backups.find(b => b.status === 'completed');
    const n = (v: number) => v >= 10000 ? `${Math.round(v / 1000)}k` : v.toLocaleString();

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
                    <OverviewCard title="Security" value={securityValue} link="/security" icon={<ShieldIcon />} />
                    <OverviewCard title="Blocked IPs" value={overview ? String(sec!.blockedIps) : '…'} link="/security/blocked-ips" icon={<ShieldIcon />} />
                    <OverviewCard title="Page views (30 d)" value={overview ? n(overview.stats.views30) : '…'} link="/analytics" icon={<ChartBarIcon />} />
                    <OverviewCard title="Visitors (30 d)" value={overview ? n(overview.stats.visitors30) : '…'} link="/analytics" icon={<ChartBarIcon />} />
                    <OverviewCard title="Last backup" value={!overview ? '…' : lastBackup ? new Date(lastBackup.created_at.replace(' ', 'T')).toLocaleDateString() : 'None'} link="/backup" icon={<ArchiveBoxIcon />} />
                    <OverviewCard title="AI assistant" value={!overview ? '…' : overview.ai.configured ? 'Ready' : 'Set up'} link="/ai-assistant" icon={<ZapIcon />} />
                    <OverviewCard title="Search" value="REST" link="/search" icon={<SearchIcon />} />
                </div>
                {error && <p className="mb-8 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
                {overview && !overview.ai.configured && wpData() && (
                    <p className="mb-8 rounded-lg bg-yellow-50 p-4 text-yellow-900">
                        The AI assistant needs an API key. <a className="underline" href={wpData()!.settingsUrl}>Open Knokspack settings</a>.
                    </p>
                )}
                {scan && (
                    <div className="mb-8 rounded-lg bg-white p-4 shadow-md">
                        <p className="font-semibold">Scan finished {fmtDate(scan.time)}: {scan.malware.length} suspicious file(s), {scan.changed.length} changed since last scan.</p>
                        {scan.malware.length > 0 && <ul className="mt-2 list-disc pl-6 text-sm text-red-800">{scan.malware.slice(0, 20).map(f => <li key={f}>{f}</li>)}</ul>}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Quick Actions */}
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-bold text-knokspack-dark mb-4">Quick Actions</h2>
                        <div className="space-y-4">
                            <QuickActionButton href="/ai-assistant">Create New Post</QuickActionButton>
                            <QuickActionButton onClick={handleScan} disabled={isScanning}>
                                {isScanning ? 'Scanning...' : 'Scan Site Now'}
                            </QuickActionButton>
                            <QuickActionButton onClick={() => { window.location.href = wpData()?.settingsUrl || '#'; }}>Settings</QuickActionButton>
                        </div>
                    </div>

                     {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-knokspack-dark mb-4">Recent Activity</h2>
                        <div className="bg-white rounded-lg shadow-md">
                            <ul className="divide-y divide-gray-200 px-6">
                                {overview?.activity.length === 0 && <li className="py-6 text-knokspack-gray">No activity logged yet. Logins and blocked requests will appear here.</li>}
                                {overview?.activity.slice(0, 5).map((item, i) => (
                                    <ActivityItem key={i} item={item} />
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
                        {overview?.activity.map((item, i) => (
                            <ActivityItem key={i} item={item} />
                        ))}
                    </ul>
                </div>
            </Modal>
        </div>
    );
};

export default DashboardPage;