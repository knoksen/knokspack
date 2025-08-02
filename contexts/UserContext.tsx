
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User, PlanName } from '../types';

// Mock user database
const MOCK_USERS: Record<string, Omit<User, 'id'>> = {
    'pro@example.com': { name: 'Pro User', email: 'pro@example.com', subscriptionPlan: 'Pro' },
    'free@example.com': { name: 'Free User', email: 'free@example.com', subscriptionPlan: 'Free' },
    'biz@example.com': { name: 'Business User', email: 'biz@example.com', subscriptionPlan: 'Business' },
    'enterprise@example.com': { name: 'Enterprise User', email: 'enterprise@example.com', subscriptionPlan: 'Enterprise' },
};

interface UserContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string) => boolean;
    logout: () => void;
    signup: (name: string, email: string) => boolean;
    updateSubscription: (plan: PlanName) => void;
    isAuthModalOpen: boolean;
    openAuthModal: (initialState: 'login' | 'signup') => void;
    closeAuthModal: () => void;
    authModalState: 'login' | 'signup';
}

export const UserContext = createContext<UserContextType>({
    user: null,
    isAuthenticated: false,
    login: () => false,
    logout: () => {},
    signup: () => false,
    updateSubscription: () => {},
    isAuthModalOpen: false,
    openAuthModal: () => {},
    closeAuthModal: () => {},
    authModalState: 'login',
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalState, setAuthModalState] = useState<'login' | 'signup'>('login');

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('knokspackUser');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // A simple check to ensure the stored user has a valid plan name, falling back to Free if not.
                const validPlans: PlanName[] = ['Free', 'Pro', 'Business', 'Enterprise'];
                if (!validPlans.includes(parsedUser.subscriptionPlan)) {
                    parsedUser.subscriptionPlan = 'Free';
                }
                setUser(parsedUser);
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('knokspackUser');
        }
    }, []);

    const updateUserInStateAndStorage = (userData: User | null) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem('knokspackUser', JSON.stringify(userData));
        } else {
            localStorage.removeItem('knokspackUser');
        }
    };

    const login = (email: string): boolean => {
        const foundUser = Object.values(MOCK_USERS).find(u => u.email === email);
        if (foundUser) {
            const userData: User = { ...foundUser, id: `user_${Date.now()}` };
            updateUserInStateAndStorage(userData);
            return true;
        }
        // Fallback for old user@example.com
        if (email === 'user@example.com') {
             const userData: User = { ...MOCK_USERS['pro@example.com'], id: `user_${Date.now()}` };
            updateUserInStateAndStorage(userData);
            return true;
        }
        return false;
    };

    const logout = () => {
        updateUserInStateAndStorage(null);
    };

    const signup = (name: string, email: string): boolean => {
        if (MOCK_USERS[email] || Object.values(MOCK_USERS).find(u => u.email === email)) {
            return false; // User already exists
        }
        const newUser: User = {
            id: `user_${Date.now()}`,
            name,
            email,
            subscriptionPlan: 'Free',
        };
        // In a real app, you'd save this to a backend. Here, we just log them in.
        MOCK_USERS[email] = newUser; // Add to mock DB for this session
        updateUserInStateAndStorage(newUser);
        return true;
    };

    const updateSubscription = (plan: PlanName) => {
        if (user && plan !== 'Enterprise') {
            const updatedUser = { ...user, subscriptionPlan: plan };
            updateUserInStateAndStorage(updatedUser);
        }
    };

    const openAuthModal = (initialState: 'login' | 'signup' = 'login') => {
        setAuthModalState(initialState);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        signup,
        updateSubscription,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalState,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};