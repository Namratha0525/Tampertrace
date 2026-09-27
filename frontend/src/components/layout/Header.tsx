import React from 'react';
import { Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/sign': return 'Sign Document';
      case '/verify': return 'Verify Document';
      case '/documents': return 'Documents';
      case '/keys': return 'Key Management';
      default:
        if (location.pathname.startsWith('/documents/')) return 'Document Details';
        if (location.pathname.startsWith('/reports/')) return 'Verification Report';
        return '';
    }
  };

  return (
    <header className="h-16 border-b border-[#334155] bg-[#111827]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 text-[#94a3b8] hover:text-[#00f0ff] transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00f0ff] rounded-full animate-pulse"></span>
        </button>
      </div>
    </header>
  );
};
