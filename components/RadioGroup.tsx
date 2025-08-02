import React from 'react';

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block ml-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);


interface RadioGroupProps<T extends string> {
    label: string;
    options: readonly T[];
    selectedValue: T;
    onChange: (value: string) => void;
    name: string;
    disabledOptions?: readonly T[];
}

const RadioGroup = <T extends string>({ label, options, selectedValue, onChange, name, disabledOptions = [] }: RadioGroupProps<T>) => {
    return (
        <div>
            <label className="block text-sm font-medium text-knokspack-dark mb-2">{label}</label>
            <div className="flex flex-wrap gap-2 rounded-lg bg-knokspack-light-gray p-1">
                {options.map((option) => {
                    const isDisabled = disabledOptions.includes(option);
                    const isSelected = selectedValue === option;

                    const baseClasses = "cursor-pointer flex-1 text-center px-3 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap flex items-center justify-center";
                    let stateClasses = '';

                    if (isDisabled) {
                        stateClasses = 'bg-transparent text-gray-400 cursor-not-allowed';
                    } else if (isSelected) {
                        stateClasses = 'bg-white text-knokspack-primary shadow-sm';
                    } else {
                        stateClasses = 'bg-transparent text-knokspack-gray hover:bg-gray-200';
                    }

                    return (
                        <label
                            key={option}
                            htmlFor={`${name}-${option}`}
                            className={`${baseClasses} ${stateClasses}`}
                        >
                            {option}
                            {isDisabled && <LockIcon />}
                            <input
                                type="radio"
                                id={`${name}-${option}`}
                                name={name}
                                value={option}
                                checked={isSelected}
                                onChange={() => !isDisabled && onChange(option)}
                                className="sr-only"
                                aria-labelledby={`${name}-${option}-label`}
                                disabled={isDisabled}
                            />
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default RadioGroup;