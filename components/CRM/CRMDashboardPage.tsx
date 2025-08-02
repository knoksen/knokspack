
import React, { useState } from 'react';
import Button from '../Button';
import Modal from '../common/Modal';
import type { Contact, CrmTask, Company, Invoice } from '../../types';
import { UsersIcon, BriefcaseIcon, DocumentTextIcon, MOCK_COMPANIES, MOCK_INVOICES } from '../../constants';

const INITIAL_CONTACTS: Contact[] = [
    { id: 'c1', name: 'Elena Rodriguez', email: 'elena.r@techcorp.com', companyName: 'TechCorp', status: 'Lead', addedAt: '1 day ago' },
    { id: 'c2', name: 'Ben Carter', email: 'ben.c@innovateinc.com', companyName: 'Innovate Inc.', status: 'Active', addedAt: '3 days ago' },
    { id: 'c3', name: 'Sophia Chen', email: 'sophia.c@datasolutions.com', companyName: 'Data Solutions', status: 'Active', addedAt: '1 week ago' },
    { id: 'c4', name: 'Marcus Wright', email: 'marcus.w@apexglobal.com', companyName: 'Apex Global', status: 'Lead', addedAt: '2 weeks ago' },
];

const MOCK_TASKS: CrmTask[] = [
    { id: 't1', title: 'Follow up call with Elena', dueDate: 'Tomorrow', contactName: 'Elena Rodriguez' },
    { id: 't2', title: 'Prepare quote for Apex Global', dueDate: 'In 3 days', contactName: 'Marcus Wright' },
    { id: 't3', title: 'Onboarding session with Ben', dueDate: 'Next week', contactName: 'Ben Carter' },
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

const StatusBadge: React.FC<{ status: Contact['status'] | Invoice['status'] }> = ({ status }) => {
    const styles: Record<string, string> = {
        Lead: 'bg-blue-100 text-blue-800',
        Active: 'bg-green-100 text-green-800',
        Lost: 'bg-red-100 text-red-800',
        Paid: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        Overdue: 'bg-red-100 text-red-800',
    };
    const style = styles[status] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>{status}</span>;
};

const Table: React.FC<{ headers: string[], children: React.ReactNode }> = ({ headers, children }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    {headers.map(header => (
                        <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {children}
            </tbody>
        </table>
    </div>
);

const CRMDashboardPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);

    const showModal = (title: string, content: React.ReactNode) => {
        setModalTitle(title);
        setModalContent(content);
        setIsModalOpen(true);
    };

    const handleAddContact = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newContact: Contact = {
            id: `c-${Date.now()}`,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            companyName: formData.get('companyName') as string,
            status: 'Lead',
            addedAt: 'Just now',
        };
        setContacts(prev => [newContact, ...prev]);
        setIsModalOpen(false);
    };

    const addContactForm = (
        <form onSubmit={handleAddContact} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-knokspack-dark">Full Name</label>
                <input type="text" id="name" name="name" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary" />
            </div>
             <div>
                <label htmlFor="email" className="block text-sm font-medium text-knokspack-dark">Email</label>
                <input type="email" id="email" name="email" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary" />
            </div>
             <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-knokspack-dark">Company Name</label>
                <input type="text" id="companyName" name="companyName" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Add Contact</Button>
            </div>
        </form>
    );

    const companiesTable = (
         <Table headers={['Company Name', 'Industry']}>
            {MOCK_COMPANIES.map((c: Company) => (
                <tr key={c.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.industry}</td>
                </tr>
            ))}
        </Table>
    );

    const invoicesTable = (
         <Table headers={['Contact', 'Amount', 'Status', 'Due Date']}>
            {MOCK_INVOICES.map((inv: Invoice) => (
                <tr key={inv.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.contactName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${inv.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StatusBadge status={inv.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.dueDate}</td>
                </tr>
            ))}
        </Table>
    );

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                            CRM Dashboard
                        </h1>
                        <p className="mt-2 text-lg text-knokspack-gray">
                            Manage your customer relationships, sales, and tasks.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                         <Button variant="secondary" onClick={() => showModal('Companies', companiesTable)}>
                            <BriefcaseIcon />
                            <span className="ml-2">Companies</span>
                        </Button>
                         <Button variant="secondary" onClick={() => showModal('Invoices', invoicesTable)}>
                            <DocumentTextIcon />
                            <span className="ml-2">Invoices</span>
                        </Button>
                         <Button variant="primary" onClick={() => showModal('Add New Contact', addContactForm)}>
                            <UsersIcon />
                            <span className="ml-2">Add Contact</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard title="New Leads (30d)" value="14" icon={<UsersIcon />} />
                    <StatCard title="Open Invoices" value="$8,450" icon={<DocumentTextIcon />} />
                    <StatCard title="Revenue (30d)" value="$22,100" icon={<BriefcaseIcon />} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {/* Recent Contacts */}
                    <div>
                        <h2 className="text-2xl font-bold text-knokspack-dark mb-4">Recent Contacts</h2>
                        <div className="bg-white rounded-lg shadow-md">
                            <ul className="divide-y divide-gray-200">
                                {contacts.map(contact => (
                                    <li key={contact.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-knokspack-dark">{contact.name}</p>
                                            <p className="text-sm text-knokspack-gray">{contact.companyName}</p>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={contact.status} />
                                            <p className="text-sm text-knokspack-gray mt-1">{contact.addedAt}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                     {/* Upcoming Tasks */}
                     <div>
                        <h2 className="text-2xl font-bold text-knokspack-dark mb-4">Upcoming Tasks</h2>
                        <div className="bg-white rounded-lg shadow-md">
                             <ul className="divide-y divide-gray-200">
                                {MOCK_TASKS.map(task => (
                                    <li key={task.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-knokspack-dark">{task.title}</p>
                                            <p className="text-sm text-knokspack-gray">For: {task.contactName}</p>
                                        </div>
                                        <div className="text-right">
                                             <p className="text-sm font-medium text-knokspack-primary">{task.dueDate}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
                {modalContent}
            </Modal>
        </div>
    );
};

export default CRMDashboardPage;
