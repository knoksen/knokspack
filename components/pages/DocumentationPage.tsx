
import React from 'react';
import { NavLink } from 'react-router-dom';

const DOC_SECTIONS = [
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'security', title: 'Security Dashboard' },
    { id: 'performance', title: 'Performance Boost' },
    { id: 'ai-assistant', title: 'AI Assistant' },
    { id: 'newsletter', title: 'Newsletter Tools' },
    { id: 'crm', title: 'CRM' },
    { id: 'analytics', title: 'Site Analytics' },
];

const DocSection: React.FC<{ id: string, title: string, children: React.ReactNode }> = ({ id, title, children }) => (
    <section id={id} className="mb-12 scroll-mt-24">
        <h2 className="text-3xl font-bold text-knokspack-dark mb-6 pb-2 border-b-2 border-knokspack-primary">{title}</h2>
        <div className="space-y-4 text-knokspack-gray prose prose-lg max-w-none">
            {children}
        </div>
    </section>
);

const DocumentationPage: React.FC = () => {
    return (
        <div className="py-20 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                        Documentation
                    </h1>
                    <p className="mt-4 text-lg text-knokspack-gray">
                        Everything you need to know to get the most out of Knokspack.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar */}
                    <aside className="lg:w-1/4">
                        <div className="sticky top-24">
                            <h3 className="text-lg font-semibold text-knokspack-dark mb-4">On this page</h3>
                            <ul className="space-y-2">
                                {DOC_SECTIONS.map(section => (
                                     <li>
                                        <a href={`#/documentation#${section.id}`} className="block text-knokspack-gray hover:text-knokspack-primary font-medium transition-colors">
                                           {section.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:w-3/4">
                        <DocSection id="getting-started" title="Getting Started">
                            <p>Welcome to Knokspack! This guide will walk you through the essential steps to connect your WordPress site and start using our powerful features. The first step is to install the companion WordPress plugin, WP Site Suite, which allows the Knokspack dashboard to securely communicate with your website.</p>
                            <h4>Connecting Your Site</h4>
                            <ol>
                                <li>Install and activate the "WP Site Suite" plugin on your WordPress website.</li>
                                <li>Navigate to the Knokspack Integrations page.</li>
                                <li>Click "Connect" on the WordPress integration card.</li>
                                <li>Follow the on-screen prompts to authorize the connection. Once connected, your dashboard will populate with your site's data.</li>
                            </ol>
                        </DocSection>

                        <DocSection id="security" title="Security Dashboard">
                            <p>Our Security module is your all-in-one command center for website protection. It runs 24/7 to block threats and monitor for vulnerabilities.</p>
                            <ul>
                                <li><strong>Malware Scan:</strong> Performs deep scans of your WordPress core files, plugins, and themes. You can initiate a scan at any time from the dashboard.</li>
                                <li><strong>Firewall (WAF):</strong> Actively blocks malicious traffic, including SQL injection attempts and malicious user agents, before they can harm your site.</li>
                                <li><strong>Brute Force Protection:</strong> Automatically locks out IP addresses that have too many failed login attempts.</li>
                                <li><strong>Activity Log:</strong> Provides a comprehensive, time-stamped log of all major events on your site, such as user logins, plugin activations, and post updates.</li>
                            </ul>
                        </DocSection>
                        
                        <DocSection id="performance" title="Performance Boost">
                            <p>A faster website leads to better user experience and improved SEO. The Performance Dashboard gives you the tools to optimize your site's speed.</p>
                             <ul>
                                <li><strong>Page Caching:</strong> Creates static HTML versions of your pages to serve them to visitors instantly.</li>
                                <li><strong>Asset Minification:</strong> Reduces the file size of your CSS and JavaScript files by removing unnecessary characters, without changing functionality.</li>
                                <li><strong>Image Lazy Loading:</strong> Defers the loading of images that are not yet visible on the screen, speeding up the initial page load time.</li>
                            </ul>
                        </DocSection>

                        <DocSection id="ai-assistant" title="AI Assistant">
                            <p>The AI Assistant, powered by the Google Gemini API, is your creative partner. It can generate high-quality content, images, and code in seconds.</p>
                            <ul>
                                <li><strong>Content Generation:</strong> Create blog posts, press releases, job descriptions, and social media posts by simply providing a prompt. You can even select the desired tone of voice.</li>
                                <li><strong>Image Generation:</strong> Describe an image, and the AI will create it for you. Perfect for blog post headers, social media graphics, and more.</li>
                                <li><strong>Wireframe Generator:</strong> A powerful tool for developers and designers. Describe a UI component, and the AI will generate a responsive HTML and Tailwind CSS wireframe.</li>
                            </ul>
                        </DocSection>

                        <DocSection id="newsletter" title="Newsletter Tools">
                           <p>Build and engage your audience directly from your dashboard. Our newsletter tools make it easy to manage subscribers and send beautiful email campaigns.</p>
                           <ul>
                                <li><strong>Subscriber Management:</strong> Collect subscribers through forms on your website and manage them from a central dashboard.</li>
                                <li><strong>Campaign Creation:</strong> Design and send newsletters. You can create campaigns from scratch or use our AI Assistant to write the content for you.</li>
                                <li><strong>Analytics:</strong> Track key metrics like open rates and click rates to understand what content resonates with your audience.</li>
                           </ul>
                        </DocSection>

                        <DocSection id="crm" title="CRM">
                            <p>The built-in Customer Relationship Manager (CRM) is designed for businesses and freelancers. Track leads, manage contacts, and monitor your sales pipeline without ever leaving your dashboard.</p>
                            <ul>
                                <li><strong>Contact Management:</strong> Keep a detailed record of all your customers and leads.</li>
                                <li><strong>Task Management:</strong> Create and assign tasks related to specific contacts to stay on top of your workflow.</li>
                                <li><strong>WooCommerce Integration:</strong> Automatically sync your customers from WooCommerce into your CRM.</li>
                            </ul>
                        </DocSection>

                        <DocSection id="analytics" title="Site Analytics">
                            <p>Get a clear picture of your website's traffic and performance with our built-in analytics. Unlike external services, all data is collected and stored on your own server, ensuring privacy.</p>
                            <ul>
                                <li><strong>Traffic Trends:</strong> Visualize your page views and unique visitors over time with an easy-to-read chart.</li>
                                <li><strong>Top Content:</strong> See which posts and pages are most popular with your audience.</li>
                                <li><strong>Top Referrers:</strong> Understand where your traffic is coming from to focus your marketing efforts.</li>
                            </ul>
                        </DocSection>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DocumentationPage;
