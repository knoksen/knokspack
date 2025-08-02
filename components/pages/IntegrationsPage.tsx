
import React from 'react';
import { INTEGRATIONS_DATA } from '../../constants';
import Button from '../Button';
import type { Integration } from '../../types';

const IntegrationCard: React.FC<{ integration: Integration }> = ({ integration }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-knokspack-dark">{integration.name}</h3>
            {integration.logo}
        </div>
        <p className="mt-4 text-base text-knokspack-gray flex-grow">{integration.description}</p>
        <div className="mt-6">
            <Button variant="outline" fullWidth>Connect</Button>
        </div>
    </div>
);

const IntegrationsPage: React.FC = () => {
    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                        Connect Your Favorite Tools
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-knokspack-gray">
                        Automate your workflows by connecting Knokspack with the services you already use.
                    </p>
                </div>
                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                    {INTEGRATIONS_DATA.map(integration => (
                        <IntegrationCard key={integration.name} integration={integration} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IntegrationsPage;
