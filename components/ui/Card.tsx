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
      className={`bg-[var(--background-secondary)] backdrop-blur-sm border border-[var(--border-primary)]/50 rounded-lg shadow-[var(--shadow-lg)] overflow-hidden transition-all duration-300 ${isInteractive ? "hover:shadow-[var(--shadow-glow)] hover:border-indigo-500/50" : ""} ${className}`} 
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
    return <div className={`p-4 sm:p-6 border-b border-[var(--border-primary)]/50 ${className}`}>{children}</div>
}