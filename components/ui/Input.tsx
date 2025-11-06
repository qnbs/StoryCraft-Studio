import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={`flex h-10 w-full rounded-md border border-[var(--border-primary)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-[var(--foreground-primary)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--border-interactive)] focus:ring-2 focus:ring-[var(--ring-focus)] focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';