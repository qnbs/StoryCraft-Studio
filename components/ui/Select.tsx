import React from 'react';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={`flex h-10 w-full items-center justify-between rounded-md border border-[var(--border-primary)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-[var(--foreground-primary)] focus:outline-none focus:border-[var(--border-interactive)] focus:ring-2 focus:ring-[var(--ring-focus)] focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';