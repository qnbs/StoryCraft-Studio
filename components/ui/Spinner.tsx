
import React from 'react';

export const Spinner: React.FC<{className?: string}> = ({className}) => (
  <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-white ${className}`}></div>
);
