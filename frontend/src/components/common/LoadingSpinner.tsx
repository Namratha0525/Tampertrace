import React from 'react';
import { Shield } from 'lucide-react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className={`absolute inset-0 rounded-full border-t-2 border-[#00f0ff] animate-spin`}></div>
        <div className={`absolute inset-0 rounded-full border-r-2 border-[#8b5cf6] animate-spin animation-delay-150`}></div>
        <Shield className={`${sizes[size]} text-[#00f0ff] animate-pulse`} />
      </div>
    </div>
  );
};
