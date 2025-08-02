
import React, { useState, useContext } from 'react';
import Button from '../Button';
import Modal from '../common/Modal';
import type { PromotionCampaign, CampaignPerformanceDataPoint } from '../../types';
import { MOCK_CAMPAIGNS, MOCK_PERFORMANCE_DATA, BullhornIcon, PremiumIcon } from '../../constants';
import { UserContext } from '../../contexts/UserContext';

const StatusBadge: React.FC<{ status: PromotionCampaign['status'] }> = ({ status }) => {
    const styles = {
        Active: 'bg-green-100 text-green-800',
        Scheduled: 'bg-blue-100 text-blue-800',
        Ended: 'bg-gray-100 text-gray-800',
        Draft: 'bg-yellow-100 text-yellow-800',
        'Pending Review': 'bg-orange-100 text-orange-800',
    };
    const style = styles[status] || styles.Draft;
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>{status}</span>;
};

const StatsChart: React.FC<{ data: CampaignPerformanceDataPoint[] }> = ({ data }) => {
    const maxImpressions = Math.max(...data.map(d => d.impressions), 0);
    const maxClicks = Math.max(...data.map(d => d.clicks), 0);
    
    return (
        <div className="h-60 w-full bg-gray-50 p-4 rounded-lg relative">
            <div className="w-full h-full flex items-end justify-between gap-1">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group" title={`${d.date}\nImpressions: ${d.impressions}\nClicks: ${d.clicks}`}>
                         <div className="flex items-end w-full h-full gap-1">
                            <div className="w-1/2 bg-blue-200 hover:bg-blue-400 rounded-t-sm" style={{ height: `${(d.impressions / maxImpressions) * 100}%` }} />
                            <div className="w-1/2 bg-green-200 hover:bg-green-400 rounded-t-sm" style={{ height: `${(d.clicks / maxClicks) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 mt-1">{ (i % 3 === 0) ? d.date.split(',')[0] : ''}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CampaignStatsModal: React.FC<{ campaign: PromotionCampaign, onClose: () => void }> = ({ campaign, onClose }) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
                 <div><p className="text-sm text-gray-500">Impressions</p><p className="text-2xl font-bold">{campaign.impressions.toLocaleString()}</p></div>
                 <div><p className="text-sm text-gray-500">Clicks</p><p className="text-2xl font-bold">{campaign.clicks.toLocaleString()}</p></div>
                 <div><p className="text-sm text-gray-500">CTR</p><p className="text-2xl font-bold">{campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0.00'}%</p></div>
            </div>
            <StatsChart data={MOCK_PERFORMANCE_DATA} />
            <div className="flex justify-end pt-4">
                <Button variant="primary" onClick={onClose}>Close</Button>
            </div>
        </div>
    );
};


const CreateCampaignForm: React.FC<{ onSave: (campaign: PromotionCampaign) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const { user } = useContext(UserContext);
    const isPremium = user?.subscriptionPlan === 'Pro' || user?.subscriptionPlan === 'Business' || user?.subscriptionPlan === 'Enterprise';
    
    const [step, setStep] = useState(1);
    const [campaignData, setCampaignData] = useState<Partial<PromotionCampaign>>({
        target: 'Post: "The Ultimate Guide..."',
        budget: '10', // Store as string for input
    });
    
    const dailyBudget = parseInt(campaignData.budget || '0', 10);
    const estimatedImpressionsMin = isPremium ? dailyBudget * 2000 : dailyBudget * 1000;
    const estimatedImpressionsMax = isPremium ? dailyBudget * 2500 : dailyBudget * 1200;

    const handleSave = () => {
        const newCampaign: PromotionCampaign = {
            id: `promo-${Date.now()}`,
            target: campaignData.target || 'New Campaign Post',
            status: 'Pending Review',
            budget: `$${campaignData.budget}/day`,
            impressions: 0,
            clicks: 0,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(new Date().setDate(new Date().getDate() + 28)).toISOString().split('T')[0],
            isPremium: isPremium,
        };
        onSave(newCampaign);
    };

    const renderStep = () => {
        // ... (omitting step 1-3 for brevity as they are simple forms)
        switch(step) {
            case 1: // Content,
            case 2: // Creative
            case 3: // Audience
                return <div className="text-center p-8 text-gray-500">Step {step}: Content, Creative, and Audience forms would be here.</div>;
            case 4: // Budget & Schedule
                return (
                    <div>
                        <h4 className="font-semibold mb-2">Set Budget & Schedule</h4>
                        <div className="space-y-4">
                             <div>
                                <label className="text-sm" htmlFor="budget">Daily Budget ($)</label>
                                <input id="budget" type="number" value={campaignData.budget} onChange={(e) => setCampaignData({...campaignData, budget: e.target.value})} className="w-full p-2 border rounded-md"/>
                             </div>
                             <div className="p-4 bg-knokspack-primary-light rounded-lg text-center">
                                <p className="font-semibold text-knokspack-dark">Estimated Daily Impressions</p>
                                <p className="text-2xl font-bold text-knokspack-primary">{estimatedImpressionsMin.toLocaleString()} - {estimatedImpressionsMax.toLocaleString()}</p>
                                {!isPremium && (
                                    <p className="text-sm text-blue-700 mt-2">
                                        <a href="#/pricing" className="font-bold underline">Upgrade to Pro</a> for up to 2x more reach!
                                    </p>
                                )}
                             </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between text-sm">
                {['Content', 'Creative', 'Audience', 'Budget'].map((s, i) => (
                     <div key={s} className={`flex-1 text-center ${i + 1 <= step ? 'text-knokspack-primary font-bold' : 'text-gray-400'}`}>
                        {s}
                        <div className={`mt-1 h-1 w-full ${i + 1 <= step ? 'bg-knokspack-primary' : 'bg-gray-200'}`}/>
                    </div>
                ))}
            </div>
            <div className="min-h-[200px]">{renderStep()}</div>
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>Back</Button>
                {step < 4 ? (
                    <Button variant="primary" onClick={() => setStep(s => Math.min(4, s + 1))}>Next</Button>
                ) : (
                    <Button variant="primary" onClick={handleSave}>Submit for Review</Button>
                )}
            </div>
        </div>
    );
};

const PromotionDashboardPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<PromotionCampaign[]>(MOCK_CAMPAIGNS);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<PromotionCampaign | null>(null);
    
    const handleSaveCampaign = (campaign: PromotionCampaign) => {
        setCampaigns(prev => [campaign, ...prev]);
        setIsCreateModalOpen(false);
    };

    const handleViewStats = (campaign: PromotionCampaign) => {
        setSelectedCampaign(campaign);
        setIsStatsModalOpen(true);
    };

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-12">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">Promotions</h1>
                        <p className="mt-2 text-lg text-knokspack-gray">Create and manage ad campaigns to grow your audience.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                        <BullhornIcon/>
                        <span className="ml-2">Create Campaign</span>
                    </Button>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {campaigns.map(campaign => (
                                <tr key={campaign.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                                        {campaign.target}
                                        {campaign.isPremium && <span title="Premium Campaign"><PremiumIcon /></span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={campaign.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.budget}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.impressions.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.clicks.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleViewStats(campaign)}>View Stats</Button>
                                        <Button size="sm" variant="outline" onClick={() => alert('Edit not implemented')}>Edit</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Campaign">
                <CreateCampaignForm onSave={handleSaveCampaign} onClose={() => setIsCreateModalOpen(false)} />
            </Modal>
            {selectedCampaign && (
                <Modal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} title={`Stats for: ${selectedCampaign.target}`}>
                    <CampaignStatsModal campaign={selectedCampaign} onClose={() => setIsStatsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default PromotionDashboardPage;
