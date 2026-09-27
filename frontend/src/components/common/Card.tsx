import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: 'cyan' | 'red' | 'green' | 'amber' | 'none';
}

export const Card: React.FC<CardProps> = ({ children, glowColor = 'none', className = '', ...props }) => {
  const glowStyles = {
    cyan: 'hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] border-[#00f0ff]/20',
    red: 'hover:shadow-[0_0_20px_rgba(255,51,102,0.15)] border-[#ff3366]/20',
    green: 'hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] border-[#00ff88]/20',
    amber: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] border-[#f59e0b]/20',
    none: 'border-[#334155] hover:border-[#475569]'
  };

  return (
    <div 
      className={`glass-card transition-all duration-300 ${glowStyles[glowColor]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
