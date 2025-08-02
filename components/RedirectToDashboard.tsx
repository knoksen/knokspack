
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import HomePage from './pages/HomePage';

const RedirectToDashboard: React.FC = () => {
    const { isAuthenticated } = useContext(UserContext);
    
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <HomePage />;
};

export default RedirectToDashboard;
