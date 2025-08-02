
import React from 'react';
import Button from '../Button';
import { EnvelopeIcon, MapPinIcon } from '../../constants';

const InfoCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-knokspack-primary-light text-knokspack-primary">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-knokspack-dark">{title}</h3>
            <div className="mt-1 text-knokspack-gray">{children}</div>
        </div>
    </div>
);

const ContactPage: React.FC = () => {
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you shortly.');
        e.currentTarget.reset();
    };

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                            Get in Touch
                        </h1>
                        <p className="mt-4 text-lg text-knokspack-gray">
                            Have a question or need support? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-8 rounded-lg shadow-lg">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <InfoCard icon={<EnvelopeIcon />} title="Email Us">
                                <p>General Inquiries: <a href="mailto:hello@knokspack.com" className="text-knokspack-primary hover:underline">hello@knokspack.com</a></p>
                                <p>Support: <a href="mailto:support@knokspack.com" className="text-knokspack-primary hover:underline">support@knokspack.com</a></p>
                            </InfoCard>
                            <InfoCard icon={<MapPinIcon />} title="Our Office">
                                <p>123 Innovation Drive<br />Tech City, 12345</p>
                            </InfoCard>
                            <div>
                                <h3 className="text-lg font-semibold text-knokspack-dark mb-2">Business Hours</h3>
                                <p className="text-knokspack-gray">Monday - Friday: 9am - 5pm</p>
                                <p className="text-knokspack-gray">Saturday - Sunday: Closed</p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-knokspack-dark">Full Name</label>
                                    <input type="text" id="name" name="name" required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-knokspack-dark">Email Address</label>
                                    <input type="email" id="email" name="email" required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary" />
                                </div>
                                 <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-knokspack-dark">Subject</label>
                                    <input type="text" id="subject" name="subject" required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-knokspack-dark">Message</label>
                                    <textarea id="message" name="message" rows={5} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary"></textarea>
                                </div>
                                <div>
                                    <Button type="submit" variant="primary" fullWidth>Send Message</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
