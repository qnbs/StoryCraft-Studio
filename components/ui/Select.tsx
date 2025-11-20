import React from 'react';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={`flex h-10 sm:h-10 min-h-[44px] sm:min-h-[40px] w-full items-center justify-between rounded-md border border-[var(--border-primary)] bg-[var(--background-secondary)] px-3 py-2 text-base sm:text-sm text-[var(--foreground-primary)] focus:outline-none focus:border-[var(--border-interactive)] focus:ring-2 focus:ring-[var(--ring-focus)] focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation transition-all duration-200 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';