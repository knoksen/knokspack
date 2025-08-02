
import React, { useState } from 'react';
import Button from '../Button';
import Modal from '../common/Modal';
import type { SharedPost } from '../../types';
import { SocialIcon, MOCK_SOCIAL_POSTS } from '../../constants';

const StatusBadge: React.FC<{ status: SharedPost['status'] }> = ({ status }) => {
    const styles = {
        Success: 'bg-green-100 text-green-800',
        Scheduled: 'bg-yellow-100 text-yellow-800',
        Failed: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

const ConnectAccountsModalContent: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const [connections, setConnections] = useState({
        twitter: false,
        facebook: false,
        linkedin: true, // example of already connected
    });
    
    const handleConnect = (platform: keyof typeof connections) => {
        setConnections(prev => ({...prev, [platform]: !prev[platform]}));
    };

    return (
        <div className="space-y-4">
            <p className="text-knokspack-gray">Connect your social accounts to start auto-sharing posts.</p>
            <div className="flex justify-between items-center p-4 border rounded-lg">
                <span className="font-semibold">Twitter / X</span>
                <Button variant={connections.twitter ? 'secondary' : 'outline'} onClick={() => handleConnect('twitter')}>{connections.twitter ? 'Connected' : 'Connect'}</Button>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg">
                <span className="font-semibold">Facebook</span>
                <Button variant={connections.facebook ? 'secondary' : 'outline'} onClick={() => handleConnect('facebook')}>{connections.facebook ? 'Connected' : 'Connect'}</Button>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg">
                <span className="font-semibold">LinkedIn</span>
                <Button variant={connections.linkedin ? 'secondary' : 'outline'} onClick={() => handleConnect('linkedin')}>{connections.linkedin ? 'Connected' : 'Connect'}</Button>
            </div>
             <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={onClose}>Done</Button>
            </div>
        </div>
    );
};

const SocialDashboardPage: React.FC = () => {
    const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [posts, setPosts] = useState<SharedPost[]>(MOCK_SOCIAL_POSTS);
    const [newPostContent, setNewPostContent] = useState('');

    const handleRetry = (postId: string) => {
        setPosts(posts.map(p => p.id === postId ? { ...p, status: 'Scheduled' } : p));
        setTimeout(() => {
            setPosts(currentPosts => currentPosts.map(p => p.id === postId ? { ...p, status: 'Success', sharedAt: 'Just now' } : p));
        }, 1500);
    };

    const handleComposeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent) return;
        const newPost: SharedPost = {
            id: `sp-${Date.now()}`,
            title: newPostContent,
            platform: 'Twitter',
            status: 'Scheduled',
            sharedAt: 'Just now'
        };
        setPosts(prev => [newPost, ...prev]);
        setNewPostContent('');
        setIsComposeModalOpen(false);
    };

    const ComposeForm = (
        <form onSubmit={handleComposeSubmit}>
            <textarea
                rows={5}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-knokspack-primary focus:border-knokspack-primary"
                placeholder="What's on your mind?"
            />
            <div className="mt-4 flex justify-end">
                <Button type="submit" variant="primary" disabled={!newPostContent}>Schedule Post</Button>
            </div>
        </form>
    );

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="flex flex-col md:flex-row justify-between md:items-center mb-12">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                            Social Automation
                        </h1>
                        <p className="mt-2 text-lg text-knokspack-gray">
                           Automatically share your content across all your platforms.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setIsConnectModalOpen(true)}>Connect Accounts</Button>
                        <Button variant="primary" onClick={() => setIsComposeModalOpen(true)}>Compose Post</Button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-knokspack-dark mb-4">Share History</h2>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                           {posts.map(post => (
                                <li key={post.id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-semibold text-knokspack-dark truncate" title={post.title}>{post.title}</p>
                                        <p className="text-sm text-knokspack-gray">
                                            To {post.platform} &middot; {post.sharedAt}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <StatusBadge status={post.status} />
                                        {post.status === 'Failed' && (
                                            <Button variant="outline" onClick={() => handleRetry(post.id)}>Retry</Button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <Modal isOpen={isComposeModalOpen} onClose={() => setIsComposeModalOpen(false)} title="Compose New Post">
                {ComposeForm}
            </Modal>
             <Modal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} title="Connect Social Accounts">
                <ConnectAccountsModalContent onClose={() => setIsConnectModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default SocialDashboardPage;