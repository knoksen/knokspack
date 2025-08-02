
import React from 'react';
import Button from '../Button';
import { FEATURES_DATA } from '../../constants';
import { NavLink } from 'react-router-dom';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-knokspack-primary-light mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-knokspack-dark">{title}</h3>
        <p className="mt-2 text-base text-knokspack-gray">{description}</p>
    </div>
);

const HomePage: React.FC = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="bg-knokspack-light-gray overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-knokspack-dark leading-tight">
                                The Ultimate Toolkit for <span className="text-knokspack-primary">the Modern Web</span>
                            </h1>
                            <p className="mt-6 max-w-xl mx-auto md:mx-0 text-lg md:text-xl text-knokspack-gray">
                                Get everything you need for security, performance, and content creation. Knokspack makes your site safer, faster, and helps you build and grow.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4">
                                <Button href="#/pricing" variant="primary">View Plans</Button>
                                <Button href="#/ai-assistant" variant="secondary">Try AI Assistant</Button>
                            </div>
                        </div>
                        <div className="hidden md:block relative w-full h-80">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                                <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                                <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Features Section */}
            <section className="py-20 md:py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-knokspack-dark">Powerful Features, Simplified</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-knokspack-gray">
                            Everything you need to succeed, all in one place.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {FEATURES_DATA.map(feature => (
                            <FeatureCard key={feature.title} {...feature} />
                        ))}
                    </div>
                </div>
            </section>
            
             {/* Wireframe CTA Section */}
             <section className="bg-knokspack-light-gray">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-knokspack-dark">From Idea to UI in Seconds</h2>
                            <p className="mt-4 max-w-lg mx-auto lg:mx-0 text-lg text-knokspack-gray">
                                Describe your component, and our new AI Wireframe tool will build it instantly.
                            </p>
                            <div className="mt-8">
                                 <NavLink to="/wireframe">
                                    <Button variant="primary">Try the Wireframe Tool</Button>
                                </NavLink>
                            </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 shadow-2xl transform lg:rotate-3">
                            <div className="flex items-center gap-1.5 mb-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <pre className="text-sm text-white overflow-x-auto"><code>
<span className="text-gray-500">&lt;div <span className="text-blue-400">class</span>=<span className="text-yellow-300">"bg-white p-6 rounded-lg"</span>&gt;</span>
  <span className="text-gray-500">&lt;h3 <span className="text-blue-400">class</span>=<span className="text-yellow-300">"text-lg font-bold"</span>&gt;</span>Login<span className="text-gray-500">&lt;/h3&gt;</span>
  <span className="text-gray-500">&lt;input <span className="text-blue-400">type</span>=<span className="text-yellow-300">"email"</span> <span className="text-blue-400">placeholder</span>=<span className="text-yellow-300">"Email"</span> /&gt;</span>
  <span className="text-gray-500">&lt;button <span className="text-blue-400">class</span>=<span className="text-yellow-300">"..."</span>&gt;</span>Sign In<span className="text-gray-500">&lt;/button&gt;</span>
<span className="text-gray-500">&lt;/div&gt;</span>
                            </code></pre>
                        </div>
                    </div>
                </div>
            </section>


             {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl font-bold text-white">Ready to Supercharge Your Workflow?</h2>
                    <p className="mt-4 text-lg text-blue-200">Join thousands of users who trust Knokspack.</p>
                    <div className="mt-8">
                        <NavLink to="/pricing">
                           <Button 
                                variant="outline" 
                                className="bg-white !text-knokspack-primary !py-4 !px-8 !text-lg !font-semibold hover:!bg-gray-100"
                            >
                                Get Knokspack Now
                            </Button>
                        </NavLink>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;