
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FOOTER_PLATFORM_LINKS, FOOTER_SOLUTIONS_LINKS } from '../constants';

const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-knokspack-primary transition-colors">
        {children}
    </a>
);

const FooterLink: React.FC<{ to: string; children: React.ReactNode; isExternal?: boolean }> = ({ to, children, isExternal }) => {
    const className = "text-sm text-gray-300 hover:text-white transition-colors";
    if (isExternal) {
        return <a href={to} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
    }
    return <NavLink to={to} className={className}>{children}</NavLink>;
};


const Footer: React.FC = () => {
    return (
        <footer className="bg-knokspack-dark text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold">Knokspack</h3>
                        <p className="mt-2 text-sm text-gray-300">The ultimate toolkit for the modern web.</p>
                        <div className="flex space-x-4 mt-4">
                            <SocialIcon href="https://facebook.com">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                            </SocialIcon>
                            <SocialIcon href="https://twitter.com">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                            </SocialIcon>
                        </div>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-semibold">Platform</h4>
                            <ul className="mt-4 space-y-2">
                                {FOOTER_PLATFORM_LINKS.map(link => (
                                    <li key={link.name}><FooterLink to={link.href.replace('#', '')}>{link.name}</FooterLink></li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold">Solutions</h4>
                            <ul className="mt-4 space-y-2">
                                {FOOTER_SOLUTIONS_LINKS.map(link => (
                                    <li key={link.name}><FooterLink to={link.href.replace('#', '')}>{link.name}</FooterLink></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold">Resources</h4>
                            <ul className="mt-4 space-y-2">
                                <li><FooterLink to="https://jarlhalla.no/blog/" isExternal>Blog</FooterLink></li>
                                <li><FooterLink to="/documentation">Documentation</FooterLink></li>
                                <li><FooterLink to="/contact">Contact Us</FooterLink></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold">Legal</h4>
                            <ul className="mt-4 space-y-2">
                                <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
                                <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Knokspack AI. All rights reserved. A project for demonstration purposes.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;