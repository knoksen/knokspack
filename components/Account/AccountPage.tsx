
import React, { useContext } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import Button from '../Button';
import { UserCircleIcon, CreditCardIcon, UsersIcon } from '../../constants';

const AccountPage: React.FC = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    if (!user) {
        // This should theoretically not be reached due to ProtectedRoute
        return <div>Loading user data...</div>;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const canManageTeam = user.subscriptionPlan === 'Business' || user.subscriptionPlan === 'Enterprise';

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                            My Account
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-knokspack-gray">
                            Manage your profile, subscription, and settings.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
                        {/* Profile Section */}
                        <div className="pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                <UserCircleIcon />
                                <h2 className="text-2xl font-bold text-knokspack-dark">Profile Information</h2>
                            </div>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-knokspack-gray">Full Name</label>
                                    <p className="mt-1 text-lg text-knokspack-dark">{user.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-knokspack-gray">Email Address</label>
                                    <p className="mt-1 text-lg text-knokspack-dark">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Section */}
                        <div className="pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                <CreditCardIcon />
                                <h2 className="text-2xl font-bold text-knokspack-dark">Subscription Plan</h2>
                            </div>
                            <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-knokspack-primary-light p-6 rounded-lg">
                                <div>
                                    <p className="text-lg font-semibold text-knokspack-primary">{user.subscriptionPlan} Plan</p>
                                    <p className="text-knokspack-gray mt-1">
                                        {user.subscriptionPlan === 'Free' ? 'You are on the free plan.' : 'Your subscription is active.'}
                                    </p>
                                </div>
                                <Button href="#/pricing" variant="primary">
                                    {user.subscriptionPlan === 'Free' ? 'Upgrade Plan' : 'Manage Subscription'}
                                </Button>
                            </div>
                        </div>
                        
                        {/* Team Management Section */}
                        {canManageTeam && (
                            <div className="pb-8 border-b border-gray-200">
                                <div className="flex items-center gap-4">
                                    <UsersIcon />
                                    <h2 className="text-2xl font-bold text-knokspack-dark">Team Management</h2>
                                </div>
                                <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <p className="text-knokspack-gray">Invite and manage your team members.</p>
                                     <NavLink to="/team">
                                        <Button variant="secondary">Manage Team</Button>
                                    </NavLink>
                                </div>
                            </div>
                        )}
                        
                        {/* Logout Button */}
                        <div>
                            <Button onClick={handleLogout} variant="outline">
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
