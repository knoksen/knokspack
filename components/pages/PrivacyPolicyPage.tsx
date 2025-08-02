
import React from 'react';

const LegalSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-knokspack-dark mb-4">{title}</h2>
        <div className="space-y-4 text-knokspack-gray prose prose-lg">
            {children}
        </div>
    </div>
);

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="py-20 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                            Privacy Policy
                        </h1>
                        <p className="mt-4 text-lg text-knokspack-gray">Last Updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="bg-knokspack-light-gray p-8 rounded-lg">
                        <LegalSection title="1. Information We Collect">
                            <p>
                                We collect information that you provide directly to us when you use our Service. This includes:
                            </p>
                             <ul>
                                <li><strong>Account Information:</strong> When you register for an account, we collect your name, email address, and password.</li>
                                <li><strong>Subscription Information:</strong> If you subscribe to a paid plan, we collect payment information, which is processed by our third-party payment processor.</li>
                                <li><strong>User Prompts:</strong> We collect the prompts and inputs you provide to our AI tools to generate content.</li>
                            </ul>
                        </LegalSection>
                        
                        <LegalSection title="2. How We Use Your Information">
                            <p>
                                We use the information we collect to:
                            </p>
                             <ul>
                                <li>Provide, maintain, and improve our Service.</li>
                                <li>Process your transactions and manage your subscription.</li>
                                <li>Communicate with you, including sending service-related notices and responding to your inquiries.</li>
                                <li>Personalize your experience with the Service.</li>
                                <li>Monitor and analyze trends, usage, and activities in connection with our Service.</li>
                            </ul>
                        </LegalSection>

                        <LegalSection title="3. Sharing of Information & Third-Party Services">
                             <p>
                                We do not share your personal information with third parties except in the following circumstances:
                            </p>
                             <ul>
                                <li><strong>With Your Consent:</strong> We may share information about you with your consent or at your direction.</li>
                                <li><strong>Third-Party Vendors:</strong> We work with third-party service providers to perform services on our behalf, such as payment processing and hosting.</li>
                                <li><strong>Google Gemini API:</strong> To provide our AI features, your prompts are sent to the Google Gemini API. Google may use this data in accordance with its own privacy policies. We do not send any personal identifying information (like your name or email) with these API requests. We encourage you to review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-knokspack-primary hover:underline">Google's Privacy Policy</a>.</li>
                                 <li><strong>Legal Requirements:</strong> We may disclose information if we believe it is necessary to comply with a law, regulation, legal process, or governmental request.</li>
                            </ul>
                        </LegalSection>

                        <LegalSection title="4. Data Security">
                            <p>
                                We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
                            </p>
                        </LegalSection>

                         <LegalSection title="5. Your Data Rights">
                            <p>
                                You have the right to access, update, or delete the personal information we hold about you. You can manage your account information from your account settings page. If you wish to delete your account, please contact us.
                            </p>
                        </LegalSection>
                        
                        <LegalSection title="6. Contact Us">
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@knokspack.com" className="text-knokspack-primary hover:underline">privacy@knokspack.com</a>.
                            </p>
                        </LegalSection>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
