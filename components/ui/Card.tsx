import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const Card: React.FC<CardProps> = ({ children, className, as: Component = 'div', ...props }) => {
  const isInteractive = Component === 'button';
  return (
    <Component 
      className={`bg-[var(--background-secondary)]/80 backdrop-blur-md border border-[var(--border-primary)] rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-out ${isInteractive ? "hover:shadow-lg hover:border-[var(--border-interactive)]/30 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer" : ""} ${className}`} 
      {...props}
    >
      {children}
    </Component>
  );
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
    return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
    return <div className={`p-4 sm:p-6 border-b border-[var(--border-primary)]/50 bg-[var(--background-tertiary)]/20 ${className}`}>{children}</div>
}