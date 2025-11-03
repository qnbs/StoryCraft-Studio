
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
    return <div className={`p-6 ${className}`}>{children}</div>
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
    return <div className={`p-6 border-b border-gray-700 ${className}`}>{children}</div>
}
