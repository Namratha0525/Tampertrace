import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, className = '' }) => {
  const variants = {
    success: 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30',
    danger: 'bg-[#ff3366]/10 text-[#ff3366] border-[#ff3366]/30',
    warning: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30',
    info: 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30',
    neutral: 'bg-[#334155]/30 text-[#e2e8f0] border-[#334155]'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
