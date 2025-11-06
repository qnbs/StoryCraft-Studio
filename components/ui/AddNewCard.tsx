import React from 'react';

interface AddNewCardProps {
    title: string;
    description: string;
    onClick: () => void;
    icon: React.ReactNode;
    variant?: 'default' | 'primary';
}

export const AddNewCard: React.FC<AddNewCardProps> = ({ title, description, onClick, icon, variant = 'primary' }) => {
    
    const baseClasses = "flex flex-col items-center justify-center text-center border-2 border-dashed hover:border-solid transition-all cursor-pointer group rounded-lg min-h-[300px] p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-primary)] hover:-translate-y-1 duration-300";
    
    const variantClasses = {
        default: 'border-[var(--border-primary)]/80 hover:border-[var(--foreground-muted)] bg-[var(--background-secondary)]/50 hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] focus-visible:ring-[var(--foreground-muted)]',
        primary: 'bg-[var(--background-interactive)]/10 border-[var(--background-interactive)]/50 hover:border-[var(--background-interactive)] hover:bg-[var(--background-interactive)]/20 focus-visible:ring-[var(--background-interactive)]'
    };

    const iconContainerClasses = {
        default: 'bg-[var(--background-tertiary)] text-[var(--foreground-secondary)]',
        primary: 'bg-[var(--background-interactive)]/20 text-[var(--background-interactive)] dark:text-indigo-300'
    };

    const titleClasses = 'text-xl font-bold text-[var(--foreground-primary)]';
    
    const descriptionClasses = {
        default: 'text-[var(--foreground-muted)]',
        primary: 'text-[var(--background-interactive)]/80 dark:text-indigo-200/80'
    }

    return (
        <button 
            onClick={onClick} 
            className={`${baseClasses} ${variantClasses[variant]}`}
        >
            <div className={`mx-auto rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${iconContainerClasses[variant]}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    {icon}
                </svg>
            </div>
            <h3 className={titleClasses}>{title}</h3>
            <p className={`mt-1 ${descriptionClasses[variant]}`}>{description}</p>
        </button>
    );
};