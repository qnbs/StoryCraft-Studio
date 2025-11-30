import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/10 ${className}`}
    ></div>
  );
};