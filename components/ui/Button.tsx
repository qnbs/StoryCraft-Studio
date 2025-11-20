import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'default' | 'sm';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'default', className, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95 touch-manipulation select-none";

  const variantClasses = {
    primary: "bg-gradient-to-br from-[var(--background-interactive)] to-indigo-700 text-[var(--foreground-interactive)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-glow)] hover:brightness-110 border border-transparent",
    secondary: "bg-[var(--background-secondary)]/80 border border-[var(--border-primary)]/70 text-[var(--foreground-primary)] hover:bg-[var(--background-secondary)] hover:border-[var(--border-primary)] hover:shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-[var(--shadow-md)] hover:shadow-lg hover:shadow-red-500/30 border border-transparent",
    ghost: "hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--foreground-primary)] text-[var(--foreground-secondary)]",
  };

  const sizeClasses = {
    default: "px-4 py-2 min-h-[44px] sm:min-h-[36px]",
    sm: "p-2 min-h-[36px] sm:min-h-[32px]",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};