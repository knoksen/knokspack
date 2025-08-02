
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { login, signup, authModalState } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState(authModalState);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setActiveTab(authModalState);
    }, [authModalState]);

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setEmail('');
            setPassword('');
            setName('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!login(email)) {
            setError('Invalid credentials. Try "user@example.com" or "free@example.com".');
        } else {
            onClose();
            navigate('/dashboard');
        }
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!signup(name, email)) {
            setError('An account with this email already exists.');
        } else {
            onClose();
            navigate('/dashboard');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-8">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-knokspack-dark">
                            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                    
                    <div className="border-b border-gray-200 mt-4">
                        <nav className="-mb-px flex space-x-6">
                            <button
                                onClick={() => setActiveTab('login')}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'login' ? 'border-knokspack-primary text-knokspack-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setActiveTab('signup')}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'signup' ? 'border-knokspack-primary text-knokspack-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Sign Up
                            </button>
                        </nav>
                    </div>

                    <div className="mt-6">
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        {activeTab === 'login' ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label htmlFor="email-login" className="sr-only">Email</label>
                                    <input type="email" id="email-login" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-knokspack-primary focus:border-knokspack-primary" />
                                </div>
                                <div>
                                    <label htmlFor="password-login" className="sr-only">Password</label>
                                    <input type="password" id="password-login" placeholder="Password (any)" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-knokspack-primary focus:border-knokspack-primary" />
                                </div>
                                <Button variant="primary" fullWidth type="submit">Login</Button>
                            </form>
                        ) : (
                            <form onSubmit={handleSignup} className="space-y-4">
                                 <div>
                                    <label htmlFor="name-signup" className="sr-only">Full Name</label>
                                    <input type="text" id="name-signup" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-knokspack-primary focus:border-knokspack-primary" />
                                </div>
                                <div>
                                    <label htmlFor="email-signup" className="sr-only">Email</label>
                                    <input type="email" id="email-signup" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-knokspack-primary focus:border-knokspack-primary" />
                                </div>
                                <div>
                                    <label htmlFor="password-signup" className="sr-only">Password</label>
                                    <input type="password" id="password-signup" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-knokspack-primary focus:border-knokspack-primary" />
                                </div>
                                <Button variant="primary" fullWidth type="submit">Create Account</Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;