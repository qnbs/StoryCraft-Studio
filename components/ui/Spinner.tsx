import React from 'react';

export const Spinner: React.FC<{className?: string}> = ({className}) => (
  <div className={`relative flex items-center justify-center ${className || 'w-5 h-5'}`}>
      <div className="absolute w-full h-full rounded-full border-2 border-[var(--border-primary)] opacity-30"></div>
      <div className="absolute w-full h-full rounded-full border-t-2 border-[var(--background-interactive)] animate-spin"></div>
      {/* Optional inner pulse for a 'breathing' AI feel */}
      <div className="w-1/2 h-1/2 bg-[var(--background-interactive)] rounded-full animate-pulse opacity-50"></div>
  </div>
);