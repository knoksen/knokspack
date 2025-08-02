
import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'base' | 'sm';
    fullWidth?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, href, variant = 'primary', size = 'base', fullWidth = false, disabled = false, type = 'button', className = '' }) => {
    const baseClasses = "inline-flex items-center justify-center border border-transparent font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105";
    
    const sizeClasses = {
        base: 'px-6 py-3 text-base',
        sm: 'px-3 py-1.5 text-sm'
    };

    const variantClasses = {
        primary: 'text-white bg-knokspack-primary hover:bg-blue-700 focus:ring-knokspack-primary',
        secondary: 'text-knokspack-dark bg-knokspack-primary-light hover:bg-blue-200 focus:ring-knokspack-primary',
        outline: 'text-knokspack-dark bg-white border-gray-300 hover:bg-gray-50 focus:ring-knokspack-primary'
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`;

    if (href) {
        return (
            <a href={href} className={classes}>
                {children}
            </a>
        );
    }

    return (
        <button type={type} onClick={onClick} className={classes} disabled={disabled}>
            {children}
        </button>
    );
};

export default Button;
