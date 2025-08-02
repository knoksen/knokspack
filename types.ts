
export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export type PlanName = 'Free' | 'Pro' | 'Business' | 'Enterprise';

export interface SubscriptionPlan {
  name: PlanName;
  priceMonthly: string;
  priceYearly: string;
  description: string;
  features: string[];
  isFeatured: boolean;
}

export interface PricingPack {
    name: string;
    description: string;
    price: string;
    credits: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionPlan: PlanName;
}

export interface Integration {
    name: string;
    description: string;
    logo: React.ReactNode;
}

export type ContentType = 'Blog Post' | 'Press Release' | 'Job Description' | 'Social Media Post' | 'Plugin Guideline Q&A' | 'Plugin Readme Q&A' | 'Wireframe' | 'WP Readme File' | 'Image';
export type Tone = 'Professional' | 'Casual' | 'Enthusiastic' | 'Witty';

export interface ReadmeData {
    pluginName: string;
    contributors: string;
    donateLink: string;
    tags: string;
    requiresAtLeast: string;
    testedUpTo: string;
    stableTag: string;
    requiresPHP: string;
    shortDescription: string;
    changelog: string;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  subscribedAt: string;
  status: 'Confirmed' | 'Pending';
}

export interface NewsletterCampaign {
  id:string;
  title: string;
  status: 'Sent' | 'Draft' | 'Scheduled';
  sentAt: string;
  recipients: number;
  openRate: number;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  companyName: string;
  status: 'Lead' | 'Active' | 'Lost';
  addedAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
}

export interface CrmTask {
  id: string;
  title: string;
  dueDate: string;
  contactName: string;
}

export interface AnalyticsDataPoint {
    date: string;
    views: number;
}

export interface TopContent {
    id: string;
    title: string;
    url: string;
    views: number;
}

export interface TopReferrer {
    id: string;
    domain: string;
    views: number;
}

export interface FirewallRule {
  id: string;
  rule: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface BlockedIP {
  id: string;
  ipAddress: string;
  reason: string;
  blockedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ipAddress: string;
}

export interface Invoice {
    id: string;
    contactName: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    dueDate: string;
}

export interface SharedPost {
    id: string;
    title: string;
    platform: 'Facebook' | 'Twitter' | 'LinkedIn';
    status: 'Success' | 'Failed' | 'Scheduled';
    sharedAt: string;
}

export interface VideoData {
    id: string;
    title: string;
    uploadedAt: string;
    views: number;
    duration: string;
}

export interface ActivityFeedItem {
    id: string;
    icon: React.ReactNode;
    action: string;
    details: string;
    timestamp: string;
    category: 'Security' | 'Social' | 'System' | 'Newsletter' | 'Performance';
}

export interface PromotionCampaign {
    id: string;
    target: string;
    status: 'Active' | 'Scheduled' | 'Ended' | 'Draft' | 'Pending Review';
    budget: string;
    impressions: number;
    clicks: number;
    startDate: string;
    endDate: string;
    isPremium?: boolean;
}

export interface CampaignPerformanceDataPoint {
    date: string;
    impressions: number;
    clicks: number;
}

export interface Testimonial {
    id: string;
    authorName: string;
    authorRole: string;
    content: string;
    rating: number; // 1-5
}

export interface PortfolioItem {
    id: string;
    title: string;
    imageUrl: string;
    projectUrl: string;
}

export interface ScanResult {
    id: string;
    file: string;
    issue: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Outstanding' | 'Fixed' | 'Ignored';
}

export interface ScanHistory {
    id: string;
    date: string;
    threatsFound: number;
    status: 'Completed' | 'In Progress';
}

export interface Backup {
    id: string;
    date: string;
    type: 'Full Site' | 'Database Only';
    size: string;
    status: 'Completed' | 'In Progress' | 'Failed';
}

export interface SearchAnalyticsQuery {
    id: string;
    term: string;
    searches: number;
    clicks: number;
    ctr: string;
}

export interface PluginOrTheme {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Member';
}
