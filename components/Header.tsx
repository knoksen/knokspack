
import React, { useState, useContext, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { GUEST_NAV_LINKS, USER_NAV_LINKS } from '../constants';
import Button from './Button';
import { UserContext } from '../contexts/UserContext';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { isAuthenticated, user, logout, openAuthModal } = useContext(UserContext);
    const profileRef = useRef<HTMLDivElement>(null);

    const activeLinkStyle = {
        color: '#3B82F6',
        fontWeight: '600'
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const navLinks = isAuthenticated ? USER_NAV_LINKS : GUEST_NAV_LINKS;

    const userActions = isAuthenticated ? (
        <div className="relative" ref={profileRef}>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 focus:outline-none">
                <span className="font-medium text-knokspack-dark">{user?.name}</span>
                <svg className={`w-5 h-5 text-knokspack-gray transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <NavLink to="/dashboard" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-knokspack-dark hover:bg-gray-100">Dashboard</NavLink>
                    <NavLink to="/account" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-knokspack-dark hover:bg-gray-100">Account</NavLink>
                    <button onClick={() => { logout(); setIsProfileOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-knokspack-dark hover:bg-gray-100">
                        Logout
                    </button>
                </div>
            )}
        </div>
    ) : (
        <div className="flex items-center gap-2">
            <Button onClick={() => openAuthModal('login')} variant="outline">Login</Button>
            <Button onClick={() => openAuthModal('signup')} variant="primary">Sign Up</Button>
        </div>
    );

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <NavLink to={isAuthenticated ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center gap-2">
                             <svg className="h-8 w-auto text-knokspack-primary" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M512 0C229.232 0 0 229.232 0 512s229.232 512 512 512 512-229.232 512-512S794.768 0 512 0zm-91.52 793.6l-117.76-117.76-85.376 85.376L99.328 643.2l204.8-204.8-204.8-204.8L217.344 115.2l85.376 85.376L420.48 82.56l172.032 172.032-221.184 221.184 221.184 221.184L420.48 793.6zM805.888 759.296l-85.376-85.376-117.76 117.76L420.48 941.44l313.344-313.344L938.656 423.2l-85.376-85.376-121.216 121.216-221.184-221.184 221.184-221.184L924.672 380.8l-204.8 204.8 204.8 204.8-118.784 118.016z"/>
                            </svg>
                            <span className="text-2xl font-bold text-knokspack-dark">Knokspack</span>
                        </NavLink>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.href.replace('#','')}
                                className="text-base font-medium text-knokspack-gray hover:text-knokspack-primary transition-colors"
                                style={({ isActive }) => isActive ? activeLinkStyle : {}}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>
                    <div className="hidden md:flex items-center">
                        {userActions}
                    </div>
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-knokspack-dark hover:text-knokspack-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-knokspack-primary"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.href.replace('#','')}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-knokspack-gray hover:text-knokspack-primary hover:bg-gray-50"
                                style={({ isActive }) => isActive ? activeLinkStyle : {}}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                         <div className="pt-4 px-3">
                             {isAuthenticated ? (
                                <Button onClick={() => { logout(); setIsMenuOpen(false); }} variant="primary" fullWidth>Logout</Button>
                             ) : (
                                <div className="flex gap-2">
                                     <Button onClick={() => { openAuthModal('login'); setIsMenuOpen(false);}} variant="outline" fullWidth>Login</Button>
                                     <Button onClick={() => { openAuthModal('signup'); setIsMenuOpen(false);}} variant="primary" fullWidth>Sign Up</Button>
                                </div>
                             )}
                         </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;