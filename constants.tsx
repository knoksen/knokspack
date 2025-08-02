
import React from 'react';
import type { Feature, SubscriptionPlan, ContentType, Tone, PlanName, Integration, FirewallRule, BlockedIP, ActivityLogEntry, Company, Invoice, SharedPost, VideoData, ActivityFeedItem, PricingPack, PromotionCampaign, Testimonial, PortfolioItem, ScanResult, ScanHistory, Backup, SearchAnalyticsQuery, PluginOrTheme, TeamMember, CampaignPerformanceDataPoint } from './types';

export const GUEST_NAV_LINKS = [
  { name: 'Security', href: '#/security' },
  { name: 'Performance', href: '#/performance' },
  { name: 'Backups', href: '#/backup' },
  { name: 'Search', href: '#/search' },
  { name: 'Newsletter', href: '#/newsletter' },
  { name: 'CRM', href: '#/crm' },
  { name: 'Analytics', href: '#/analytics' },
  { name: 'Promotion', href: '#/promotion' },
  { name: 'Growth', href: '#/growth' },
  { name: 'Social', href: '#/social' },
  { name: 'Video', href: '#/video' },
  { name: 'Mobile App', href: '#/mobile' },
  { name: 'Pricing', href: '#/pricing' },
  { name: 'AI Assistant', href: '#/ai-assistant' },
  { name: 'Wireframe', href: '#/wireframe' },
  { name: 'Integrations', href: '#/integrations' },
];

export const FOOTER_PLATFORM_LINKS = [
    { name: 'Security', href: '#/security' },
    { name: 'Performance', href: '#/performance' },
    { name: 'Backups', href: '#/backup' },
    { name: 'Analytics', href: '#/analytics' },
    { name: 'Integrations', href: '#/integrations' },
    { name: 'Pricing', href: '#/pricing' },
];

export const FOOTER_SOLUTIONS_LINKS = [
    { name: 'AI Assistant', href: '#/ai-assistant' },
    { name: 'Wireframe Tool', href: '#/wireframe' },
    { name: 'Newsletter', href: '#/newsletter' },
    { name: 'CRM', href: '#/crm' },
    { name: 'Growth Tools', href: '#/growth' },
    { name: 'Social Automation', href: '#/social' },
    { name: 'Video Hosting', href: '#/video' },
    { name: 'Promotions', href: '#/promotion' },
    { name: 'Mobile App', href: '#/mobile' },
    { name: 'Search', href: '#/search' },
];


export const USER_NAV_LINKS = [
    { name: 'Dashboard', href: '#/dashboard' },
    { name: 'AI Assistant', href: '#/ai-assistant' },
    { name: 'Integrations', href: '#/integrations' },
    { name: 'Pricing', href: '#/pricing' },
];

export const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-knokspack-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

export const AiIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-knokspack-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-knokspack-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.944c0 4.22-1.7 8.1-4.382 10.944a11.913 11.913 0 01-1.447-1.447" />
    </svg>
);

export const ZapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-knokspack-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

export const NewsletterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.184-1.268-.5-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.184-1.268.5-1.857m0 0a5.002 5.002 0 019 0m-4.5 4.5V17m0 0a2.25 2.25 0 00-4.5 0m4.5 0h-4.5m6.75-11.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
);

export const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.004a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75v-4.004M15.75 9.75h-7.5a.75.75 0 00-.75.75v4.5a.75.75 0 00.75.75h7.5a.75.75 0 00.75-.75v-4.5a.75.75 0 00-.75-.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 9.75v-2.625a3.375 3.375 0 00-3.375-3.375h-3.75a3.375 3.375 0 00-3.375 3.375v2.625" />
    </svg>
);

export const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);


export const BugIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 12a2 2 0 10-4 0v4a2 2 0 104 0v-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12a2 2 0 10-4 0v4a2 2 0 104 0v-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h.01M20.99 10h.01" />
    </svg>
);

export const FirewallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.944c0-2.066-.799-3.98-2.14-5.484z" />
        <path d="M1 12h22" />
        <path d="M12 3v18" />
    </svg>
);

export const LoginIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export const ActivityLogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

export const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-knokspack-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

export const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const GlobeAltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
    </svg>
);

export const UserCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const CreditCardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

export const SocialIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

export const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

export const EnvelopeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const BullhornIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-knokspack-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 3.94A2 2 0 0112 5.586l6.88 6.88a2 2 0 010 2.828l-6.88 6.88a2 2 0 01-2.828 0L3.46 15.29a2 2 0 010-2.828l6.88-6.88a2 2 0 011.414-.586z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h7a2 2 0 012 2v2a2 2 0 01-2 2h-7" />
    </svg>
);

export const RocketLaunchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-knokspack-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a6 6 0 01-2.56 5.84m-2.28 2.28l-2.28-2.28m0 0l-2.28 2.28m2.28-2.28l2.28 2.28m-2.28-2.28l-2.28-2.28m-2.28 2.28l-2.28 2.28" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zM9 10.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
    </svg>
);

export const ScanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-knokspack-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export const MobileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-knokspack-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

export const ArchiveBoxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-knokspack-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);

export const Cog6ToothIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.242 1.417l-1.07 1.07c-.246.246-.36.578-.36.91l0 .54c0 .33.114.662.36.91l1.07 1.07c.457.457.34 1.24-.242 1.417l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.332.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.242-1.417l1.07-1.07c.246-.246.36-.578.36-.91l0-.54c0-.33-.114-.662.36-.91l-1.07-1.07a1.125 1.125 0 01.242-1.417l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const PremiumIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-1.707 1.707A1 1 0 003 8v6a1 1 0 001 1h12a1 1 0 001-1V8a1 1 0 00-.293-.707L15 5.586V3a1 1 0 00-1-1H6a1 1 0 00-1-1H5zM6 4h8v1.586l-1.293 1.293A1 1 0 0012 8H8a1 1 0 00-.707.293L6 9.586V4z" clipRule="evenodd" />
    </svg>
);


export const WordpressLogo = () => <svg className="h-8 w-8 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path d="M2.366 10c0-4.223 3.411-7.634 7.634-7.634s7.634 3.411 7.634 7.634-3.411 7.634-7.634 7.634S2.366 14.223 2.366 10zm7.634-5.908c-3.26 0-5.908 2.648-5.908 5.908s2.648 5.908 5.908 5.908 5.908-2.648 5.908-5.908-2.648-5.908-5.908-5.908zM7.29 11.459l-1.096 3.328-2.03-6.22 3.126 2.892zm5.786-2.915c-.298 0-.54.242-.54.54s.242.54.54.54.54-.242.54-.54-.242-.54-.54-.54zm-2.22 1.097l-3.32-1.025 2.14 6.516 1.18-5.49zm2.76.541l-1.123 3.404L15.62 10l-3.004.625zM10.82 5.17l-1.114 5.162-3.328-1.025 4.442-4.137z"/></svg>;
export const SlackLogo = () => <svg className="h-8 w-8" fill="none" viewBox="0 0 54 54"><path d="M12.5 25.125a4.125 4.125 0 110-8.25h4.125V21a4.125 4.125 0 11-4.125 4.125v-4.125H8.375a4.125 4.125 0 110-8.25h8.25v4.125h-4.125a4.125 4.125 0 010 8.25v4.125a4.125 4.125 0 110 8.25H21a4.125 4.125 0 110-8.25h-4.125v-4.125h4.125a4.125 4.125 0 110 8.25z" fill="#36C5F0"></path><path d="M28.875 12.5a4.125 4.125 0 118.25 0v4.125H29a4.125 4.125 0 11-4.125-4.125h4.125V8.375a4.125 4.125 0 118.25 0v8.25h-4.125v-4.125a4.125 4.125 0 01-8.25 0h-4.125a4.125 4.125 0 118.25 0V21a4.125 4.125 0 11-8.25 0v-4.125h4.125a4.125 4.125 0 118.25 0z" fill="#2EB67D"></path><path d="M41.5 28.875a4.125 4.125 0 110 8.25h-4.125V33a4.125 4.125 0 114.125-4.125v4.125h4.125a4.125 4.125 0 110 8.25h-8.25v-4.125h4.125a4.125 4.125 0 010-8.25v-4.125a4.125 4.125 0 110-8.25H33a4.125 4.125 0 110 8.25h4.125v4.125h-4.125a4.125 4.125 0 110-8.25z" fill="#ECB22E"></path><path d="M25.125 41.5a4.125 4.125 0 11-8.25 0v-4.125H21a4.125 4.125 0 114.125 4.125h-4.125v4.125a4.125 4.125 0 11-8.25 0v-8.25h4.125v4.125a4.125 4.125 0 018.25 0h4.125a4.125 4.125 0 11-8.25 0V33a4.125 4.125 0 118.25 0v4.125h-4.125a4.125 4.125 0 11-8.25 0z" fill="#E01E5A"></path></svg>;
export const ZapierLogo = () => <svg className="h-8 w-8" viewBox="0 0 100 50"><path d="M0 16.66h66.66L100 0v33.33L0 50z" fill="#FF4A00"/></svg>;

export const FEATURES_DATA: Feature[] = [
  {
    icon: <ShieldIcon />,
    title: '24/7 Auto Security',
    description: 'Keep your site safe with automated malware scanning, vulnerability checks, and spam protection.',
  },
  {
    icon: <ZapIcon />,
    title: 'Blazing Fast Speed',
    description: 'Optimize your site performance with our global CDN, lazy image loading, and fast caching.',
  },
  {
    icon: <AiIcon />,
    title: 'AI Assistant',
    description: 'Create professional content with ease. Let our AI help you write posts, pages, and product descriptions.',
  },
];

export const PRICING_PLANS: SubscriptionPlan[] = [
    {
        name: 'Free',
        priceMonthly: '$0',
        priceYearly: '$0',
        description: 'For personal projects and getting started with the essentials.',
        features: [
            'Basic Security Scanning',
            'Core Performance Tweaks',
            '10 AI Generations / mo',
            'Community Support',
        ],
        isFeatured: false,
    },
    {
        name: 'Pro',
        priceMonthly: '$24',
        priceYearly: '$19',
        description: 'For professionals who need advanced tools and performance.',
        features: [
            'Everything in Free, plus:',
            'Advanced Security & WAF',
            'Full Performance Suite (CDN)',
            'Unlimited AI Generations',
            'AI Wireframe & Image Tools',
            'Email & Chat Support',
        ],
        isFeatured: true,
    },
    {
        name: 'Business',
        priceMonthly: '$59',
        priceYearly: '$49',
        description: 'The ultimate toolkit for businesses and agencies.',
        features: [
            'Everything in Pro, plus:',
            'Full CRM & Newsletter Tools',
            'Social Media Automation',
            'Advanced Analytics',
            'Priority Expert Support',
        ],
        isFeatured: false,
    },
    {
        name: 'Enterprise',
        priceMonthly: 'Custom',
        priceYearly: 'Custom',
        description: 'For large-scale deployments that require custom solutions and dedicated support.',
        features: [
            'Everything in Business, plus:',
            'Dedicated Account Manager',
            'Custom Integrations',
            'SAML/SSO Integration',
            'On-premise Options',
        ],
        isFeatured: false,
    }
];

export const PRICING_PACKS: PricingPack[] = [
    { name: 'Starter Pack', description: 'Perfect for trying out the AI tools.', price: '$5', credits: '50 AI Generations' },
    { name: 'Creator Pack', description: 'A solid boost for content creation.', price: '$15', credits: '200 AI Generations' },
    { name: 'Agency Pack', description: 'Bulk credits for heavy usage.', price: '$50', credits: '1,000 AI Generations' },
];


export const PLUGIN_GUIDELINES_CONTEXT = `
**WordPress Plugin Directory Developer Information**

If you have a new plugin, you can host it on the WordPress Plugin Directory to get exposure. By hosting it, you can:
- Track download counts.
- Allow users to leave comments and ratings.
- Gain exposure in a centralized repository.

**Hosting Restrictions & Guidelines**

There are some restrictions for plugins hosted on the directory:

1.  **GPL Compatibility:** Your plugin must be compatible with the GNU General Public License v2, or any later version. It's strongly recommended to use the same license as WordPress: “GPLv2 or later.” All code, data, and images must comply.

2.  **Responsibility:** Developers are responsible for the contents and actions of their plugins, including all included files and third-party libraries/APIs. Intentionally circumventing guidelines is prohibited.

3.  **Stable Version:** A stable version of the plugin must always be available from its WordPress Plugin Directory page.

4.  **Readable Code:** Code must be human-readable. Obfuscated code is not permitted. You must provide public access to your source code and any build tools.

5.  **No Trialware:** Plugins may not have locked functionality that requires payment to unlock. Functionality cannot be disabled after a trial period. Sandbox-only APIs are also considered trialware. Upselling is acceptable within limits.

6.  **Software as a Service (SaaS) is Permitted:** Plugins can interface with external paid services, provided the service has substantial functionality and is clearly documented. Services that only exist to validate a license key are not permitted.

7.  **No User Tracking Without Consent:** Plugins cannot track users or contact external servers without explicit, opt-in consent. A clear privacy policy should be provided. An exception is for SaaS where user consent is granted by configuring the service.

8.  **No Executable Code from Third Parties:** Sending executable code via third-party systems is not allowed. Serving updates from non-WordPress.org servers is prohibited. Using third-party CDNs is only allowed for things like font inclusions; JS/CSS must be local.

9.  **No Illegal, Dishonest, or Morally Offensive Actions:** This includes manipulating search results, compensating for reviews, taking other developers' work, or making false legal claims. It also covers violations of community codes of conduct and harassment.

10. **No Unauthorized External Links:** "Powered by" links or other credits on the public-facing site must be opt-in and default to off.

11. **Don't Hijack the Admin Dashboard:** Admin notices and upgrade prompts should be used sparingly and must be dismissible. Advertising should be limited and not interfere with the user experience.

12. **No Spam in Public Pages:** Readme files and other public-facing pages on WordPress.org must not contain spam, excessive affiliate links, or blackhat SEO tactics.

13. **Use WordPress's Default Libraries:** For security and stability, plugins must use the versions of libraries like jQuery that are packaged with WordPress, not include their own.

14. **Avoid Frequent Commits:** The SVN is a release repository, not a development one. Frequent minor commits can cause strain on the system.

15. **Increment Version Numbers:** Plugin version numbers must be increased for each new release to trigger the update notification for users.

16. **Submit a Complete Plugin:** A complete, working plugin must be submitted for review. Names cannot be reserved.

17. **Respect Trademarks:** Do not use another project's trademarked name as the beginning of your plugin slug unless you have the right to do so. This is to avoid user confusion.

18. **Right to Maintain the Directory:** The WordPress.org team reserves the right to remove any plugin, grant exceptions, or make changes in the interest of public safety.

**Version Control Requirement:**

You must use the Subversion (SVN) repository provided by WordPress.org for your plugin to be listed on the site. The WordPress Plugin Directory is a hosting site, not just a listing site.
`;

export const ALL_CONTENT_TYPES: readonly ContentType[] = ['Blog Post', 'Press Release', 'Job Description', 'Social Media Post', 'Plugin Guideline Q&A', 'Plugin Readme Q&A', 'Wireframe', 'WP Readme File', 'Image'];
export const CONTENT_TYPE_OPTIONS: readonly ContentType[] = ['Blog Post', 'Press Release', 'Job Description', 'Social Media Post', 'Image', 'Plugin Guideline Q&A', 'Plugin Readme Q&A', 'WP Readme File'];
export const TONE_OPTIONS: readonly Tone[] = ['Professional', 'Casual', 'Enthusiastic', 'Witty'];

export const SUBSCRIPTION_LIMITS: Record<PlanName, {
    canUseGoogleSearch: boolean;
    canUseWireframe: boolean;
    allowedContentTypes: ContentType[] | 'all';
}> = {
    'Free': {
        canUseGoogleSearch: false,
        canUseWireframe: false,
        allowedContentTypes: ['Blog Post', 'Social Media Post'],
    },
    'Pro': {
        canUseGoogleSearch: true,
        canUseWireframe: true,
        allowedContentTypes: 'all',
    },
    'Business': {
        canUseGoogleSearch: true,
        canUseWireframe: true,
        allowedContentTypes: 'all',
    },
    'Enterprise': {
        canUseGoogleSearch: true,
        canUseWireframe: true,
        allowedContentTypes: 'all',
    },
};

export const INTEGRATIONS_DATA: Integration[] = [
    {
        name: 'WordPress',
        description: 'Connect Knokspack directly to your WordPress site to publish content and manage security seamlessly.',
        logo: <WordpressLogo />,
    },
    {
        name: 'Slack',
        description: 'Receive security alerts and notifications directly in your team\'s Slack channels.',
        logo: <SlackLogo />,
    },
    {
        name: 'Zapier',
        description: 'Connect Knokspack to thousands of other apps with Zapier and automate your workflows.',
        logo: <ZapierLogo />,
    },
];

export const MOCK_FIREWALL_RULES: FirewallRule[] = [
    { id: '1', rule: 'Block SQL Injection Attempts', status: 'Active', createdAt: '2023-01-01' },
    { id: '2', rule: 'Limit Login Attempts', status: 'Active', createdAt: '2023-01-01' },
    { id: '3', rule: 'Block Malicious User Agents', status: 'Active', createdAt: '2023-02-15' },
    { id: '4', rule: 'Disable XML-RPC', status: 'Inactive', createdAt: '2023-03-10' },
];

export const MOCK_BLOCKED_IPS: BlockedIP[] = [
    { id: '1', ipAddress: '198.51.100.24', reason: 'Failed login attempts', blockedAt: '2 hours ago' },
    { id: '2', ipAddress: '203.0.113.10', reason: 'Spam comments', blockedAt: '1 day ago' },
];

export const MOCK_ACTIVITY_LOG: ActivityLogEntry[] = [
    { id: '1', timestamp: '2024-05-21 10:30:00', user: 'admin', action: 'Plugin "WP Site Suite" activated', ipAddress: '127.0.0.1' },
    { id: '2', timestamp: '2024-05-21 09:15:23', user: 'demo_user', action: 'Post "My New Blog Post" published', ipAddress: '192.168.1.10' },
    { id: '3', timestamp: '2024-05-20 16:45:10', user: 'admin', action: 'User logged in', ipAddress: '127.0.0.1' },
    { id: '4', timestamp: '2024-05-20 11:05:00', user: 'admin', action: 'Widget settings updated', ipAddress: '127.0.0.1' },
];

export const MOCK_COMPANIES: Company[] = [
    { id: 'comp1', name: 'TechCorp', industry: 'Technology' },
    { id: 'comp2', name: 'Innovate Inc.', industry: 'Software' },
    { id: 'comp3', name: 'Data Solutions', industry: 'Data Analytics' },
    { id: 'comp4', name: 'Apex Global', industry: 'Logistics' },
];

export const MOCK_INVOICES: Invoice[] = [
    { id: 'inv1', contactName: 'Ben Carter', amount: 5000, status: 'Paid', dueDate: '2024-05-01' },
    { id: 'inv2', contactName: 'Sophia Chen', amount: 3450, status: 'Pending', dueDate: '2024-06-15' },
    { id: 'inv3', contactName: 'Old Client LLC', amount: 1200, status: 'Overdue', dueDate: '2024-04-20' },
];

export const MOCK_SOCIAL_POSTS: SharedPost[] = [
    { id: 'sp1', title: 'Our New AI Assistant is Here!', platform: 'Twitter', status: 'Success', sharedAt: '2 days ago' },
    { id: 'sp2', title: 'Weekly Performance Tips', platform: 'LinkedIn', status: 'Success', sharedAt: '5 days ago' },
    { id: 'sp3', title: 'Check out our new pricing plans', platform: 'Facebook', status: 'Failed', sharedAt: '1 week ago' },
    { id: 'sp4', title: 'How to secure your WordPress site', platform: 'Twitter', status: 'Scheduled', sharedAt: 'in 3 hours' },
];

export const MOCK_VIDEOS: VideoData[] = [
    { id: 'vid1', title: 'Introduction to WP Site Suite', uploadedAt: '1 week ago', views: 12890, duration: '5:42' },
    { id: 'vid2', title: 'How to Use the AI Assistant', uploadedAt: '3 weeks ago', views: 8734, duration: '12:15' },
    { id: 'vid3', title: 'Configuring the Firewall', uploadedAt: '1 month ago', views: 4501, duration: '8:30' },
];

export const MOCK_ACTIVITY_FEED: ActivityFeedItem[] = [
    { id: 'af1', icon: <ShieldIcon/>, action: 'Security Scan Completed', details: 'No threats found.', timestamp: '2m ago', category: 'Security' },
    { id: 'af2', icon: <SocialIcon/>, action: 'Post Shared', details: '"Our New AI Assistant is Here!" shared to Twitter.', timestamp: '5h ago', category: 'Social' },
    { id: 'af3', icon: <LoginIcon/>, action: 'User Logged In', details: 'User admin logged in from 127.0.0.1', timestamp: '1 day ago', category: 'System' },
    { id: 'af4', icon: <BugIcon/>, action: 'Threat Blocked', details: 'SQL Injection attempt from 198.51.100.24 was blocked.', timestamp: '2 days ago', category: 'Security' },
    { id: 'af5', icon: <SocialIcon/>, action: 'Post Scheduled', details: '"Weekly Performance Tips" scheduled for LinkedIn.', timestamp: '3 days ago', category: 'Social' },
    { id: 'af6', icon: <NewsletterIcon />, action: 'Campaign Sent', details: '"New Feature Announcement!" sent to 1,180 subscribers.', timestamp: '4 days ago', category: 'Newsletter'},
    { id: 'af7', icon: <ZapIcon />, action: 'Cache Cleared', details: 'Page cache was automatically cleared after post update.', timestamp: '5 days ago', category: 'Performance'},
    { id: 'af8', icon: <LoginIcon/>, action: 'Failed Login', details: 'Failed login attempt for user "admin" from 203.0.113.10', timestamp: '5 days ago', category: 'System' },
];

export const MOCK_CAMPAIGNS: PromotionCampaign[] = [
    { id: 'promo1', target: 'Post: "The Ultimate Guide..."', status: 'Active', budget: '$10/day', impressions: 15280, clicks: 450, startDate: '2024-05-15', endDate: '2024-06-15', isPremium: true },
    { id: 'promo2', target: 'Product: "Pro Plan"', status: 'Pending Review', budget: '$25/day', impressions: 0, clicks: 0, startDate: '2024-05-10', endDate: '2024-06-10', isPremium: true },
    { id: 'promo3', target: 'Page: "New AI Features"', status: 'Scheduled', budget: '$15/day', impressions: 0, clicks: 0, startDate: '2024-06-01', endDate: '2024-07-01' },
    { id: 'promo4', target: 'Post: "Why Knokspack is awesome"', status: 'Ended', budget: '$5/day', impressions: 8500, clicks: 150, startDate: '2024-04-01', endDate: '2024-05-01' },
];

export const MOCK_PERFORMANCE_DATA: CampaignPerformanceDataPoint[] = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: Math.floor(Math.random() * (1200 - 400 + 1) + 400),
        clicks: Math.floor(Math.random() * (50 - 10 + 1) + 10),
    };
});


export const MOCK_TESTIMONIALS: Testimonial[] = [
    { id: 'test1', authorName: 'Jane Doe', authorRole: 'Marketing Manager, TechCorp', content: 'Knokspack has been a game-changer for our content workflow. The AI assistant is brilliant!', rating: 5 },
    { id: 'test2', authorName: 'John Smith', authorRole: 'Freelance Developer', content: 'The security and performance tools are top-notch. I use it on all my client sites.', rating: 5 },
];

export const MOCK_PORTFOLIO_ITEMS: PortfolioItem[] = [
    { id: 'port1', title: 'E-commerce Website Redesign', imageUrl: 'https://picsum.photos/seed/port1/400/300', projectUrl: '#' },
    { id: 'port2', title: 'Corporate Branding Project', imageUrl: 'https://picsum.photos/seed/port2/400/300', projectUrl: '#' },
];

export const MOCK_SCAN_RESULTS: ScanResult[] = [
    { id: 'res1', file: 'wp-includes/class-wp.php', issue: 'Core file mismatch', severity: 'Critical', status: 'Outstanding' },
    { id: 'res2', file: 'wp-content/plugins/some-plugin/main.php', issue: 'Known malware signature detected', severity: 'High', status: 'Outstanding' },
    { id: 'res3', file: 'wp-content/uploads/2023/05/image.php', issue: 'Suspicious code pattern (eval)', severity: 'Medium', status: 'Outstanding' },
];

export const MOCK_SCAN_HISTORY: ScanHistory[] = [
    { id: 'hist1', date: '2024-05-21 10:00', threatsFound: 3, status: 'Completed' },
    { id: 'hist2', date: '2024-05-20 10:00', threatsFound: 0, status: 'Completed' },
    { id: 'hist3', date: '2024-05-19 10:00', threatsFound: 0, status: 'Completed' },
];

export const MOCK_BACKUPS: Backup[] = [
    { id: 'bkp1', date: '2024-05-21 04:00', type: 'Full Site', size: '1.2 GB', status: 'Completed' },
    { id: 'bkp2', date: '2024-05-20 04:00', type: 'Full Site', size: '1.2 GB', status: 'Completed' },
    { id: 'bkp3', date: '2024-05-19 04:00', type: 'Full Site', size: '1.1 GB', status: 'Completed' },
    { id: 'bkp4', date: '2024-05-18 11:30', type: 'Database Only', size: '45 MB', status: 'Completed' },
];

export const MOCK_SEARCH_ANALYTICS: SearchAnalyticsQuery[] = [
    { id: 'sa1', term: 'wordpress security', searches: 125, clicks: 80, ctr: '64.0%' },
    { id: 'sa2', term: 'how to speed up my site', searches: 98, clicks: 55, ctr: '56.1%' },
    { id: 'sa3', term: 'ai content generator', searches: 72, clicks: 45, ctr: '62.5%' },
    { id: 'sa4', term: 'contact form', searches: 45, clicks: 12, ctr: '26.7%' },
    { id: 'sa5', term: 'pricing', searches: 30, clicks: 25, ctr: '83.3%' },
];

export const MOCK_PLUGINS: PluginOrTheme[] = [
    { id: 'p1', name: 'WooCommerce', version: '8.8.2', enabled: true },
    { id: 'p2', name: 'Yoast SEO', version: '22.6', enabled: true },
    { id: 'p3', name: 'Contact Form 7', version: '5.9.3', enabled: false },
];

export const MOCK_THEMES: PluginOrTheme[] = [
    { id: 't1', name: 'Twenty Twenty-Four', version: '1.1', enabled: true },
    { id: 't2', name: 'Astra', version: '4.6.11', enabled: false },
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
    { id: 'tm1', name: 'Business User', email: 'biz@example.com', role: 'Admin' },
    { id: 'tm2', name: 'Jane Doe', email: 'jane@example.com', role: 'Member' },
    { id: 'tm3', name: 'John Smith', email: 'john@example.com', role: 'Member' },
];
