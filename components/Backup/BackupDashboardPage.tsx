
import React, { useState } from 'react';
import Button from '../Button';
import ToggleSwitch from '../ToggleSwitch';
import Modal from '../common/Modal';
import type { Backup } from '../../types';
import { MOCK_BACKUPS } from '../../constants';
import { NavLink } from 'react-router-dom';

const BackupStatusBadge: React.FC<{ status: Backup['status'] }> = ({ status }) => {
    const styles = {
        Completed: 'bg-green-100 text-green-800',
        'In Progress': 'bg-blue-100 text-blue-800 animate-pulse',
        Failed: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

const RestoreModalContent: React.FC<{ backup: Backup; onRestore: (id: string) => void; onClose: () => void }> = ({ backup, onRestore, onClose }) => {
    const [confirmText, setConfirmText] = useState('');
    const isConfirmed = confirmText === 'RESTORE';
    return (
        <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-bold text-red-800">Warning: This is a destructive action.</h4>
                <p className="text-sm text-red-700 mt-1">
                    Restoring this backup will overwrite your current site's files and database. This cannot be undone.
                    It is highly recommended to take a fresh backup before proceeding.
                </p>
            </div>
            <p className="text-knokspack-gray">
                You are about to restore the backup from <span className="font-bold">{backup.date}</span>.
            </p>
            <div>
                <label htmlFor="confirmRestore" className="block text-sm font-medium text-knokspack-dark">
                    To confirm, please type "RESTORE" in the box below.
                </label>
                <input
                    type="text"
                    id="confirmRestore"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="button" variant="primary" onClick={() => onRestore(backup.id)} disabled={!isConfirmed}>
                    Restore Now
                </Button>
            </div>
        </div>
    );
};


const BackupDashboardPage: React.FC = () => {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [backups, setBackups] = useState<Backup[]>(MOCK_BACKUPS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

    const handleBackupNow = () => {
        setIsBackingUp(true);
        const newBackup: Backup = {
            id: `bkp-${Date.now()}`,
            date: new Date().toLocaleString(),
            type: 'Full Site',
            size: '...',
            status: 'In Progress',
        };
        setBackups(prev => [newBackup, ...prev]);

        setTimeout(() => {
            setBackups(prev => prev.map(b => b.id === newBackup.id ? { ...b, status: 'Completed', size: '1.2 GB' } : b));
            setIsBackingUp(false);
        }, 4000);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
            setBackups(prev => prev.filter(b => b.id !== id));
        }
    };
    
    const openRestoreModal = (backup: Backup) => {
        setSelectedBackup(backup);
        setIsModalOpen(true);
    };

    const handleRestore = (id: string) => {
        alert(`Restoring from backup ${id}. This is a demo action.`);
        setIsModalOpen(false);
    };

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="mb-12">
                     <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                        Backup & Restore
                    </h1>
                    <p className="mt-2 text-lg text-knokspack-gray">
                       Keep your site safe with automated and on-demand backups.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                     {/* Left Panel: Backup Management */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-knokspack-dark">Backup History</h2>
                            <Button onClick={handleBackupNow} variant="primary" disabled={isBackingUp}>
                                {isBackingUp ? 'Backing up...' : 'Backup Now'}
                            </Button>
                        </div>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {backups.map(backup => (
                                        <tr key={backup.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{backup.date}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{backup.type}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{backup.size}</td>
                                            <td className="px-4 py-4 whitespace-nowrap"><BackupStatusBadge status={backup.status} /></td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                                                <Button onClick={() => openRestoreModal(backup)} variant="secondary" disabled={backup.status !== 'Completed'}>Restore</Button>
                                                <Button onClick={() => {}} variant="outline" disabled={backup.status !== 'Completed'}>Download</Button>
                                                <Button onClick={() => handleDelete(backup.id)} variant="outline" disabled={backup.status !== 'Completed'}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Right Panel: Settings */}
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-knokspack-dark mb-4">Backup Settings</h3>
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-knokspack-dark">Automated Schedule</label>
                                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-knokspack-primary focus:border-knokspack-primary sm:text-sm rounded-md">
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                    <option>Disabled</option>
                                </select>
                            </div>
                            <div>
                                 <h4 className="font-semibold text-knokspack-dark">Cloud Storage (Coming Soon)</h4>
                                <p className="text-sm text-gray-500 mb-2">Automatically upload backups to your favorite cloud provider.</p>
                                <div className="space-y-2">
                                     <ToggleSwitch label="Google Drive" enabled={false} onChange={() => {}} disabled={true} />
                                     <ToggleSwitch label="Dropbox" enabled={false} onChange={() => {}} disabled={true} />
                                     <ToggleSwitch label="Amazon S3" enabled={false} onChange={() => {}} disabled={true} />
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
            {selectedBackup && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Restore Backup: ${selectedBackup.date}`}>
                    <RestoreModalContent backup={selectedBackup} onRestore={handleRestore} onClose={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default BackupDashboardPage;
