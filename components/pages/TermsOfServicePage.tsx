
import React from 'react';

const LegalSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-knokspack-dark mb-4">{title}</h2>
        <div className="space-y-4 text-knokspack-gray prose prose-lg">
            {children}
        </div>
    </div>
);

const TermsOfServicePage: React.FC = () => {
    return (
        <div className="py-20 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                            Terms of Service
                        </h1>
                        <p className="mt-4 text-lg text-knokspack-gray">Last Updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="bg-knokspack-light-gray p-8 rounded-lg">
                        <LegalSection title="1. Introduction">
                            <p>
                                Welcome to Knokspack AI ("we," "us," or "our"). These Terms of Service ("Terms") govern your use of our website, services, and applications (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
                            </p>
                        </LegalSection>

                        <LegalSection title="2. User Accounts">
                            <p>
                                To access certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                            </p>
                        </LegalSection>

                        <LegalSection title="3. Subscriptions and Payments">
                            <p>
                                Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select.
                            </p>
                            <p>
                                At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or we cancel it. You may cancel your Subscription renewal either through your online account management page or by contacting our customer support team.
                            </p>
                        </LegalSection>

                        <LegalSection title="4. AI Generated Content">
                            <p>
                                Our Service utilizes the Google Gemini API to generate content, including text and images ("Generated Content"). While we strive to provide high-quality and accurate results, we do not guarantee the uniqueness, accuracy, or appropriateness of the Generated Content.
                            </p>
                            <p>
                                You are responsible for reviewing and ensuring that any Generated Content meets your needs and complies with any applicable laws or regulations before use. You retain ownership of the prompts you provide, and subject to the terms of the Google Gemini API, you may use the Generated Content for your own purposes.
                            </p>
                        </LegalSection>

                        <LegalSection title="5. Prohibited Activities">
                            <p>
                                You agree not to use the Service for any unlawful purpose or to engage in any activity that could harm, disable, overburden, or impair the Service. This includes, but is not limited to:
                            </p>
                            <ul>
                                <li>Generating content that is illegal, defamatory, or infringes on the rights of others.</li>
                                <li>Attempting to gain unauthorized access to our systems or user accounts.</li>
                                <li>Using the service to create spam or other unsolicited communications.</li>
                            </ul>
                        </LegalSection>

                         <LegalSection title="6. Termination">
                            <p>
                                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                        </LegalSection>

                        <LegalSection title="7. Limitation of Liability">
                            <p>
                                In no event shall Knokspack AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                            </p>
                        </LegalSection>
                        
                        <LegalSection title="8. Changes to Terms">
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice before any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                            </p>
                        </LegalSection>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;
