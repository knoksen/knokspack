import React from 'react';

interface ToggleSwitchProps {
    label: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange, disabled = false }) => {
    const handleToggle = () => {
        if (!disabled) {
            onChange(!enabled);
        }
    };

    return (
        <div className={`flex items-center justify-between ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
            <span className="text-sm font-medium text-knokspack-dark" onClick={handleToggle}>
                {label}
            </span>
            <button
                type="button"
                onClick={handleToggle}
                className={`${
                    enabled ? 'bg-knokspack-primary' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-knokspack-primary focus:ring-offset-2`}
                role="switch"
                aria-checked={enabled}
                disabled={disabled}
            >
                <span
                    aria-hidden="true"
                    className={`${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
    );
};

export default ToggleSwitch;
