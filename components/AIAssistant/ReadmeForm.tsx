import React from 'react';
import type { ReadmeData } from '../../types';

interface ReadmeFormProps {
    data: ReadmeData;
    onDataChange: (field: keyof ReadmeData, value: string) => void;
}

const FormInput: React.FC<{ label: string; name: keyof ReadmeData; value: string; onChange: (field: keyof ReadmeData, value: string) => void; placeholder?: string; maxLength?: number }> = ({ label, name, value, onChange, placeholder, maxLength }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-knokspack-dark">{label}</label>
        <div className="relative mt-1">
            <input
                type="text"
                id={name}
                name={name}
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-knokspack-primary focus:border-knokspack-primary"
            />
            {maxLength && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 pointer-events-none">
                    {value.length} / {maxLength}
                </div>
            )}
        </div>
    </div>
);

const FormTextarea: React.FC<{ label: string; name: keyof ReadmeData; value: string; onChange: (field: keyof ReadmeData, value: string) => void; placeholder?: string; rows?: number }> = ({ label, name, value, onChange, placeholder, rows = 4 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-knokspack-dark">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-knokspack-primary focus:border-knokspack-primary text-base"
        />
    </div>
);


const ReadmeForm: React.FC<ReadmeFormProps> = ({ data, onDataChange }) => {
    return (
        <div className="space-y-4 mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-knokspack-dark">Readme.txt Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Plugin Name" name="pluginName" value={data.pluginName} onChange={onDataChange} placeholder="My Awesome Plugin" />
                <FormInput label="Contributors" name="contributors" value={data.contributors} onChange={onDataChange} placeholder="your_wp_org_username" />
                <FormInput label="Donate Link" name="donateLink" value={data.donateLink} onChange={onDataChange} placeholder="https://example.com/donate" />
                <FormInput label="Tags" name="tags" value={data.tags} onChange={onDataChange} placeholder="tag1, tag2, tag3" />
                <FormInput label="Requires at least" name="requiresAtLeast" value={data.requiresAtLeast} onChange={onDataChange} placeholder="5.0" />
                <FormInput label="Tested up to" name="testedUpTo" value={data.testedUpTo} onChange={onDataChange} placeholder="6.0" />
                <FormInput label="Stable Tag" name="stableTag" value={data.stableTag} onChange={onDataChange} placeholder="1.0.0" />
                <FormInput label="Requires PHP" name="requiresPHP" value={data.requiresPHP} onChange={onDataChange} placeholder="7.4" />
             </div>
             <FormInput label="Short Description" name="shortDescription" value={data.shortDescription} onChange={onDataChange} placeholder="A short, snappy description (150 chars)." maxLength={150} />
             <FormTextarea label="Changelog" name="changelog" value={data.changelog} onChange={onDataChange} placeholder={`= 1.0.0 =\n* Initial release.\n\n= 0.5 =\n* Another change.`} rows={6} />
        </div>
    );
};

export default ReadmeForm;