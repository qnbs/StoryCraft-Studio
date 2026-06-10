import type React from 'react';

interface ProgressProps {
  value: number; // 0 to 100
  className?: string;
  /** QNBS-v3: C-P1 — accessible name for the progressbar (WCAG 2.2 AA: name, role, value). */
  'aria-label'?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className,
  'aria-label': ariaLabel,
}) => {
  const progress = Math.max(0, Math.min(100, value));

  return (
    <div
      // QNBS-v3: C-P1 — expose role + value so screen readers announce determinate progress.
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={`h-2 w-full overflow-hidden rounded-full bg-[var(--sc-surface-overlay)] ${className}`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
Progress.displayName = 'Progress';
