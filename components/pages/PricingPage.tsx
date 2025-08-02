
import React, { useContext, useState } from 'react';
import type { SubscriptionPlan, PlanName, PricingPack } from '../../types';
import { PRICING_PLANS, PRICING_PACKS, CheckIcon, AiIcon } from '../../constants';
import Button from '../Button';
import Modal from '../common/Modal';
import { UserContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const SubscriptionCard: React.FC<{ plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly' }> = ({ plan, billingCycle }) => {
    const { isAuthenticated, user, updateSubscription, openAuthModal } = useContext(UserContext);
    const navigate = useNavigate();

    const isCurrentPlan = user?.subscriptionPlan === plan.name;
    const isEnterprise = plan.name === 'Enterprise';
    const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

    const handleChoosePlan = () => {
        if (isEnterprise) {
            navigate('/contact');
            return;
        }
        if (!isAuthenticated) {
            openAuthModal('signup');
        } else {
            updateSubscription(plan.name as PlanName);
            navigate('/dashboard');
        }
    };
    
    const cardClasses = `border rounded-lg p-8 flex flex-col h-full transition-all duration-300 ${
        plan.isFeatured 
        ? 'bg-white border-knokspack-primary shadow-2xl relative lg:scale-105' 
        : 'bg-knokspack-light-gray border-transparent'
    }`;
    
    return (
        <div className={cardClasses}>
            {plan.isFeatured && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold text-white bg-knokspack-primary">
                        Most Popular
                    </span>
                </div>
            )}
            <h3 className="text-2xl font-bold text-knokspack-dark">{plan.name}</h3>
            <p className="mt-4 text-knokspack-gray flex-grow">{plan.description}</p>
            <div className="mt-6">
                <span className="text-5xl font-extrabold text-knokspack-dark">{price}</span>
                { !isEnterprise && <span className="text-base font-medium text-knokspack-gray ml-1">/ month</span>}
            </div>
            <ul className="mt-8 space-y-4 text-knokspack-gray flex-grow">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                            <CheckIcon />
                        </div>
                        <span className="ml-3">{feature}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-10">
                <Button 
                    onClick={handleChoosePlan} 
                    variant={plan.isFeatured ? 'primary' : 'outline'} 
                    fullWidth
                    disabled={isCurrentPlan}
                >
                    {isCurrentPlan ? 'Current Plan' : (isEnterprise ? 'Contact Sales' : 'Choose Plan')}
                </Button>
            </div>
        </div>
    );
};

const PackCard: React.FC<{ pack: PricingPack, onPurchase: (pack: PricingPack) => void }> = ({ pack, onPurchase }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col text-center items-center">
            <div className="text-knokspack-primary bg-knokspack-primary-light p-3 rounded-full">
                <AiIcon/>
            </div>
            <h4 className="text-xl font-bold text-knokspack-dark mt-4">{pack.name}</h4>
            <p className="text-knokspack-gray mt-2">{pack.description}</p>
            <p className="text-3xl font-extrabold text-knokspack-dark my-4">{pack.price}</p>
            <p className="font-semibold text-knokspack-primary">{pack.credits}</p>
             <div className="mt-6 w-full">
                <Button variant="secondary" fullWidth onClick={() => onPurchase(pack)}>Purchase Pack</Button>
            </div>
        </div>
    );
};

const BillingToggle: React.FC<{ billingCycle: 'monthly' | 'yearly', setBillingCycle: (cycle: 'monthly' | 'yearly') => void }> = ({ billingCycle, setBillingCycle }) => (
    <div className="relative flex items-center p-1 bg-knokspack-light-gray rounded-full w-max">
        <button
            onClick={() => setBillingCycle('monthly')}
            className={`relative px-6 py-2 text-sm font-semibold z-10 transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-knokspack-gray'}`}
        >
            Monthly
        </button>
        <button
            onClick={() => setBillingCycle('yearly')}
            className={`relative px-6 py-2 text-sm font-semibold z-10 transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-knokspack-gray'}`}
        >
            Yearly
        </button>
        <div 
            className="absolute top-1 bottom-1 bg-knokspack-primary rounded-full transition-transform duration-300 ease-in-out"
            style={{ 
                width: 'calc(50% - 4px)',
                transform: billingCycle === 'yearly' ? 'translateX(calc(100% - 4px))' : 'translateX(4px)'
            }}
        />
        <span className="absolute -top-2 -right-8 transform -rotate-12 bg-yellow-300 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-md">Save 20%</span>
    </div>
);


const PricingPage: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
    const [isPackModalOpen, setIsPackModalOpen] = useState(false);
    const [selectedPack, setSelectedPack] = useState<PricingPack | null>(null);
    
    const handlePurchaseClick = (pack: PricingPack) => {
        setSelectedPack(pack);
        setIsPackModalOpen(true);
    };

    return (
        <div className="py-20 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                        Find the Right Plan for You
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-knokspack-gray">
                        Simple, transparent pricing. Get started for free, then upgrade as you grow.
                    </p>
                </div>
                
                 <div className="mt-12 flex justify-center">
                    <BillingToggle billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
                </div>

                <div className="mt-16 grid gap-10 lg:grid-cols-4 max-w-7xl mx-auto items-start">
                    {PRICING_PLANS.map(plan => (
                        <SubscriptionCard key={plan.name} plan={plan} billingCycle={billingCycle} />
                    ))}
                </div>

                <div className="mt-24 pt-16 border-t border-gray-200">
                     <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-knokspack-dark">
                            Need More AI Power?
                        </h2>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-knokspack-gray">
                            Top up your account with one-time credit packs. No subscription required.
                        </p>
                    </div>
                     <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                        {PRICING_PACKS.map(pack => (
                            <PackCard key={pack.name} pack={pack} onPurchase={handlePurchaseClick} />
                        ))}
                    </div>
                </div>
            </div>
            
            <Modal isOpen={isPackModalOpen} onClose={() => setIsPackModalOpen(false)} title={`Confirm Purchase: ${selectedPack?.name}`}>
                {selectedPack && (
                    <div className="text-center">
                        <p className="text-lg text-knokspack-gray">You are about to purchase the <span className="font-bold">{selectedPack.name}</span> for <span className="font-bold">{selectedPack.price}</span>.</p>
                        <p className="mt-2 font-semibold text-knokspack-primary">{selectedPack.credits}</p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Button variant="outline" onClick={() => setIsPackModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => { alert('Purchase Complete!'); setIsPackModalOpen(false); }}>Confirm Purchase</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PricingPage;