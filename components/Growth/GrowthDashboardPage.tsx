
import React, { useState } from 'react';
import Button from '../Button';
import Modal from '../common/Modal';
import ToggleSwitch from '../ToggleSwitch';
import type { Testimonial } from '../../types';
import { MOCK_TESTIMONIALS } from '../../constants';

const Card: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <h3 className="text-xl font-bold text-knokspack-dark mb-4 pb-2 border-b border-gray-200">{title}</h3>
        {children}
    </div>
);

const SEOPreview: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="p-4 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-500">https://yoursite.com/blog/your-post-slug</p>
        <h4 className="text-xl text-blue-800 truncate hover:underline cursor-pointer">{title || 'Your SEO Title Appears Here'}</h4>
        <p className="text-sm text-gray-600 mt-1">{description || 'Your meta description will appear here. Aim for around 155 characters.'}</p>
    </div>
);

const StarRating: React.FC<{ rating: number, setRating?: (r: number) => void }> = ({ rating, setRating }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <svg
                key={star}
                onClick={() => setRating && setRating(star)}
                className={`w-5 h-5 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} ${setRating ? 'cursor-pointer' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

const AddTestimonialForm: React.FC<{ onAdd: (t: Testimonial) => void, onClose: () => void }> = ({ onAdd, onClose }) => {
    const [rating, setRating] = useState(5);
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newTestimonial: Testimonial = {
            id: `test-${Date.now()}`,
            authorName: formData.get('authorName') as string,
            authorRole: formData.get('authorRole') as string,
            content: formData.get('content') as string,
            rating: rating
        };
        onAdd(newTestimonial);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-knokspack-dark">Author Name</label>
                <input type="text" name="authorName" required className="mt-1 w-full p-2 border rounded-md" />
            </div>
             <div>
                <label className="block text-sm font-medium text-knokspack-dark">Author Role/Company</label>
                <input type="text" name="authorRole" required className="mt-1 w-full p-2 border rounded-md" />
            </div>
             <div>
                <label className="block text-sm font-medium text-knokspack-dark">Testimonial</label>
                <textarea name="content" rows={4} required className="mt-1 w-full p-2 border rounded-md" />
            </div>
             <div>
                <label className="block text-sm font-medium text-knokspack-dark">Rating</label>
                <StarRating rating={rating} setRating={setRating} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary">Add Testimonial</Button>
            </div>
        </form>
    );
};

const GrowthDashboardPage: React.FC = () => {
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');
    const [utmUrl, setUtmUrl] = useState('');
    const [utmResult, setUtmResult] = useState('');
    const [testimonials, setTestimonials] = useState<Testimonial[]>(MOCK_TESTIMONIALS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const buildUtm = () => {
        if (!utmUrl) {
            setUtmResult('Please enter a URL.');
            return;
        }
        try {
            const url = new URL(utmUrl);
            // In a real app, we'd get these from form fields
            url.searchParams.set('utm_source', 'newsletter');
            url.searchParams.set('utm_medium', 'email');
            url.searchParams.set('utm_campaign', 'summer_sale');
            setUtmResult(url.toString());
        } catch (error) {
            setUtmResult('Invalid URL. Please enter a full URL (e.g., https://example.com)');
        }
    };

    const handleAddTestimonial = (testimonial: Testimonial) => {
        setTestimonials(prev => [testimonial, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <div className="py-20 md:py-24 bg-knokspack-light-gray">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-knokspack-dark">
                        Growth Tools
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-knokspack-gray">
                        Optimize your SEO, manage social proof, and track your marketing efforts.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        <Card title="SEO Post Preview">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-knokspack-dark">SEO Title</label>
                                    <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Your Post Title" className="w-full mt-1 p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-knokspack-dark">Meta Description</label>
                                    <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} rows={3} placeholder="A short summary of your post" className="w-full mt-1 p-2 border rounded-md" />
                                </div>
                                <SEOPreview title={seoTitle} description={seoDesc} />
                            </div>
                        </Card>
                         <Card title="Feature Toggles">
                            <div className="space-y-4">
                                <ToggleSwitch label="XML Sitemap" enabled={true} onChange={() => {}}/>
                                <ToggleSwitch label="Infinite Scroll" enabled={false} onChange={() => {}}/>
                                <ToggleSwitch label="Related Posts Widget" enabled={true} onChange={() => {}}/>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                         <Card title="Testimonials Manager">
                            <div className="space-y-4">
                                {testimonials.map(t => (
                                    <div key={t.id} className="p-4 bg-knokspack-light-gray rounded-lg">
                                        <p className="italic">"{t.content}"</p>
                                        <div className="flex justify-between items-center mt-3">
                                            <p className="font-bold text-sm">{t.authorName}, <span className="font-normal text-gray-500">{t.authorRole}</span></p>
                                            <StarRating rating={t.rating} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6">
                                <Button variant="secondary" fullWidth onClick={() => setIsModalOpen(true)}>Add Testimonial</Button>
                            </div>
                        </Card>
                        <Card title="UTM Link Builder">
                             <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-knokspack-dark">Website URL</label>
                                    <input type="url" value={utmUrl} onChange={e => setUtmUrl(e.target.value)} placeholder="https://example.com/my-page" className="w-full mt-1 p-2 border rounded-md" />
                                </div>
                                <Button variant="primary" onClick={buildUtm}>Generate UTM Link</Button>
                                {utmResult && (
                                     <pre className="p-2 bg-gray-100 rounded-md text-sm break-words">{utmResult}</pre>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Testimonial">
                <AddTestimonialForm onAdd={handleAddTestimonial} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default GrowthDashboardPage;
