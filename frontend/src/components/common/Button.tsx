import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg outline-none';
  
  const variants = {
    primary: 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/50 hover:bg-[#00f0ff]/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]',
    danger: 'bg-[#ff3366]/10 text-[#ff3366] border border-[#ff3366]/50 hover:bg-[#ff3366]/20 hover:shadow-[0_0_15px_rgba(255,51,102,0.3)]',
    success: 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/50 hover:bg-[#00ff88]/20 hover:shadow-[0_0_15px_rgba(0,255,136,0.3)]',
    ghost: 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]',
    outline: 'border border-[#334155] text-white hover:border-[#94a3b8] hover:bg-[#1e293b]/50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
