import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, FileSignature, ShieldCheck, FileText, Key, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/sign', icon: FileSignature, label: 'Sign Document' },
    { to: '/verify', icon: ShieldCheck, label: 'Verify Document' },
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/keys', icon: Key, label: 'Key Management' },
  ];

  return (
    <div className="w-64 h-screen bg-[#111827] border-r border-[#334155] flex flex-col flex-shrink-0">
      <div className="p-6 flex items-center gap-3">
        <Shield className="text-[#00f0ff] w-8 h-8 animate-pulse-glow rounded-full" />
        <span className="text-xl font-bold text-white tracking-wider">TAMPER<span className="text-[#00f0ff]">TRACE</span></span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-[#1e293b] text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#334155]">
        <div className="flex items-center gap-3 px-4 py-3 text-[#94a3b8]">
          <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center border border-[#334155]">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-white truncate">{user?.username || 'User'}</p>
          </div>
          <button onClick={logout} className="p-1 hover:text-[#ff3366] transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
