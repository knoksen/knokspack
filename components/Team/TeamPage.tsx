
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Button from '../Button';
import Modal from '../common/Modal';
import type { TeamMember } from '../../types';
import { MOCK_TEAM_MEMBERS, UsersIcon } from '../../constants';

const TeamPage: React.FC = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

    const handleInviteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newMember: TeamMember = {
            id: `tm-${Date.now()}`,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as 'Admin' | 'Member',
        };
        setTeamMembers(prev => [...prev, newMember]);
        setIsInviteModalOpen(false);
    };

    const openRemoveModal = (member: TeamMember) => {
        setMemberToRemove(member);
        setIsRemoveModalOpen(true);
    };

    const handleRemoveMember = () => {
        if (memberToRemove) {
            setTeamMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
            setIsRemoveModalOpen(false);
            setMemberToRemove(null);
        }
    };
    
    const InviteForm = (
        <form onSubmit={handleInviteSubmit} className="space-y-4">
             <div>
                <label htmlFor="name" className="block text-sm font-medium text-knokspack-dark">Full Name</label>
                <input type="text" name="name" id="name" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
             <div>
                <label htmlFor="email" className="block text-sm font-medium text-knokspack-dark">Email</label>
                <input type="email" name="email" id="email" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
             <div>
                <label htmlFor="role" className="block text-sm font-medium text-knokspack-dark">Role</label>
                 <select name="role" id="role" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm">
                    <option>Member</option>
                    <option>Admin</option>
                </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Send Invite</Button>
            </div>
        </form>
    );

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <NavLink to="/account" className="text-sm font-medium text-knokspack-primary hover:underline">&larr; Back to Account</NavLink>
                        <div className="flex flex-col md:flex-row justify-between md:items-center mt-2">
                            <div className="mb-4 md:mb-0">
                                <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">Team Management</h1>
                                <p className="mt-2 text-lg text-knokspack-gray">Invite and manage your team members.</p>
                            </div>
                            <Button variant="primary" onClick={() => setIsInviteModalOpen(true)}>
                                <UsersIcon />
                                <span className="ml-2">Invite Member</span>
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {teamMembers.map(member => (
                                    <tr key={member.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                            <div className="text-sm text-gray-500">{member.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button size="sm" variant="outline" onClick={() => openRemoveModal(member)}>Remove</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite New Team Member">
                {InviteForm}
            </Modal>
            
            {memberToRemove && (
                 <Modal isOpen={isRemoveModalOpen} onClose={() => setIsRemoveModalOpen(false)} title={`Remove ${memberToRemove.name}?`}>
                    <p>Are you sure you want to remove {memberToRemove.name} from your team? Their access will be revoked immediately.</p>
                     <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={() => setIsRemoveModalOpen(false)}>Cancel</Button>
                        <Button type="button" variant="primary" onClick={handleRemoveMember}>Confirm Remove</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default TeamPage;
