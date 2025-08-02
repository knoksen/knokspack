
import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import Button from './Button';
import type { PlanName } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    paidOnly?: boolean;
    allowedPlans?: PlanName[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, paidOnly = true, allowedPlans }) => {
    const { isAuthenticated, user, openAuthModal } = useContext(UserContext);

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h2 className="text-3xl font-bold text-knokspack-dark">Access Denied</h2>
                <p className="mt-4 text-lg text-knokspack-gray">You must be logged in to view this page.</p>
                <div className="mt-8">
                    <Button onClick={() => openAuthModal('login')} variant="primary">Login to Continue</Button>
                </div>
            </div>
        );
    }
    
    const userPlan = user?.subscriptionPlan || 'Free';

    if (allowedPlans && !allowedPlans.includes(userPlan)) {
        return (
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="max-w-2xl mx-auto bg-white p-10 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold text-knokspack-dark">Upgrade Required</h2>
                    <p className="mt-4 text-lg text-knokspack-gray">
                        This feature requires a <span className="font-bold">{allowedPlans.join(' or ')}</span> plan. Please upgrade to access this page.
                    </p>
                    <div className="mt-8">
                        <Button href="#/pricing" variant="primary">View Plans & Upgrade</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (paidOnly && userPlan === 'Free') {
         return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="max-w-2xl mx-auto bg-white p-10 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold text-knokspack-dark">Upgrade Required</h2>
                    <p className="mt-4 text-lg text-knokspack-gray">
                        This premium feature is not available on the Free plan. Please upgrade to unlock more powerful tools and features.
                    </p>
                    <div className="mt-8">
                        <Button href="#/pricing" variant="primary">View Plans & Upgrade</Button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
