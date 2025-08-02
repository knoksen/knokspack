
import React, { useState } from 'react';
import Button from '../Button';
import Modal from '../common/Modal';
import type { VideoData } from '../../types';
import { VideoIcon, MOCK_VIDEOS } from '../../constants';

const VideoDashboardPage: React.FC = () => {
    const [videos, setVideos] = useState<VideoData[]>(MOCK_VIDEOS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [modalTitle, setModalTitle] = useState('');
    
    const handleGetCode = (videoId: string) => {
        const shortcode = `[wpsitesuite_video id="${videoId}"]`;
        setModalTitle("Embed Video");
        setModalContent(
            <div>
                <p className="text-knokspack-gray mb-4">Copy and paste this shortcode into your post or page editor.</p>
                <pre className="bg-gray-100 p-4 rounded-md text-knokspack-dark font-mono">{shortcode}</pre>
                <div className="mt-4 flex justify-end">
                    <Button variant="primary" onClick={() => { 
                        navigator.clipboard.writeText(shortcode);
                        alert('Shortcode copied!');
                        setIsModalOpen(false);
                    }}>Copy Code</Button>
                </div>
            </div>
        );
        setIsModalOpen(true);
    };

    const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get('videoTitle') as string;

        if (!title) return;

        const newVideo: VideoData = {
            id: `vid-${Date.now()}`,
            title: title,
            uploadedAt: 'Just now',
            views: 0,
            duration: '0:00',
        };
        setVideos(prev => [newVideo, ...prev]);
        setIsModalOpen(false);
    };

    const UploadForm = (
        <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
                <label htmlFor="videoTitle" className="block text-sm font-medium text-knokspack-dark">Video Title</label>
                <input type="text" name="videoTitle" id="videoTitle" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary"/>
            </div>
             <div>
                <label htmlFor="videoFile" className="block text-sm font-medium text-knokspack-dark">Video File</label>
                <input type="file" name="videoFile" id="videoFile" required className="mt-1 block w-full text-sm text-knokspack-gray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-knokspack-primary-light file:text-knokspack-primary hover:file:bg-blue-200"/>
            </div>
             <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Add Video</Button>
            </div>
        </form>
    );

    const handleUploadClick = () => {
        setModalTitle("Upload New Video");
        setModalContent(UploadForm);
        setIsModalOpen(true);
    };

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="flex flex-col md:flex-row justify-between md:items-center mb-12">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                            Video Manager
                        </h1>
                        <p className="mt-2 text-lg text-knokspack-gray">
                           Host and manage your videos directly on your site.
                        </p>
                    </div>
                    <Button variant="primary" onClick={handleUploadClick}>
                        <VideoIcon />
                        <span className="ml-2">Upload Video</span>
                    </Button>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video Title</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {videos.map((video) => (
                                    <tr key={video.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{video.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{video.uploadedAt}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{video.views.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{video.duration}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button variant="secondary" onClick={() => handleGetCode(video.id)}>Get Code</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
                {modalContent}
            </Modal>
        </div>
    );
};

export default VideoDashboardPage;