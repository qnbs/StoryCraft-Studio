import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--background-tertiary)] ${className}`}
    ></div>
  );
};