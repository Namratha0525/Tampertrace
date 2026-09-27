import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import { authService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { data } = await authService.login({ username, password });
      login(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-[#00f0ff] rounded-full blur-[150px] opacity-10"></div>
        <div className="w-[600px] h-[600px] bg-[#8b5cf6] rounded-full blur-[150px] opacity-10 -ml-64"></div>
      </div>
      
      <div className="glass-card w-full max-w-md p-8 relative z-10 border-[#00f0ff]/20 shadow-[0_0_50px_rgba(0,240,255,0.1)]">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-[#1e293b] rounded-full border border-[#00f0ff]/30 mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <Shield className="w-10 h-10 text-[#00f0ff]" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wider">TAMPER<span className="text-[#00f0ff]">TRACE</span></h2>
          <p className="text-[#94a3b8] mt-2 text-sm text-center">Secure Document Verification Platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#ff3366]/10 border border-[#ff3366]/30 text-[#ff3366] rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-[#94a3b8]" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-[#334155] rounded-lg bg-[#111827] text-white placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] transition-colors"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#94a3b8]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-[#334155] rounded-lg bg-[#111827] text-white placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#94a3b8]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#00f0ff] hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
