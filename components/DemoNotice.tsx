import React from 'react';
import { useLocation } from 'react-router-dom';

// Pages that show real data from this WordPress site.
const LIVE = ['/dashboard', '/ai-assistant', '/wireframe', '/'];

/** Marks pages whose numbers are still sample data, so nobody mistakes them for the site's own. */
const DemoNotice: React.FC = () => {
    const { pathname } = useLocation();
    if (LIVE.includes(pathname) || pathname === '') return null;
    return (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm px-6 py-2">
            Preview: the figures on this page are sample data. Live data is on the Dashboard and in Knokspack → Settings.
        </div>
    );
};

export default DemoNotice;
