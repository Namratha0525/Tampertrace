import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { FileSignature, ShieldCheck, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { statService } from '../services/api';
import { DashboardStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await statService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Mock chart data for visualization
  const chartData = [
    { name: 'Mon', verifications: 12, valid: 10, tampered: 2 },
    { name: 'Tue', verifications: 19, valid: 18, tampered: 1 },
    { name: 'Wed', verifications: 15, valid: 15, tampered: 0 },
    { name: 'Thu', verifications: 22, valid: 19, tampered: 3 },
    { name: 'Fri', verifications: 30, valid: 28, tampered: 2 },
    { name: 'Sat', verifications: 18, valid: 17, tampered: 1 },
    { name: 'Sun', verifications: 25, valid: 24, tampered: 1 },
  ];

  if (loading) return <div className="animate-pulse flex gap-4"><div className="h-32 bg-[#1e293b] w-full rounded-xl"></div></div>;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card glowColor="cyan" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm font-medium mb-1">Documents Signed</p>
              <h3 className="text-3xl font-bold text-white">{stats?.documents_signed || 0}</h3>
            </div>
            <div className="p-3 bg-[#00f0ff]/10 rounded-lg">
              <FileSignature className="w-6 h-6 text-[#00f0ff]" />
            </div>
          </div>
        </Card>
        
        <Card glowColor="cyan" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm font-medium mb-1">Total Verified</p>
              <h3 className="text-3xl font-bold text-white">{stats?.documents_verified || 0}</h3>
            </div>
            <div className="p-3 bg-[#8b5cf6]/10 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-[#8b5cf6]" />
            </div>
          </div>
        </Card>

        <Card glowColor="green" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm font-medium mb-1">Valid Integrity</p>
              <h3 className="text-3xl font-bold text-white">{stats?.valid_signatures || 0}</h3>
            </div>
            <div className="p-3 bg-[#00ff88]/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-[#00ff88]" />
            </div>
          </div>
        </Card>

        <Card glowColor="red" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94a3b8] text-sm font-medium mb-1">Tampered Found</p>
              <h3 className="text-3xl font-bold text-white">{stats?.tampered_documents || 0}</h3>
            </div>
            <div className="p-3 bg-[#ff3366]/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-[#ff3366]" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Verification Activity</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTampered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff3366" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff3366" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="valid" stroke="#00ff88" fillOpacity={1} fill="url(#colorValid)" />
                <Area type="monotone" dataKey="tampered" stroke="#ff3366" fillOpacity={1} fill="url(#colorTampered)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-[#00f0ff]" />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {stats?.recent_activity?.length ? (
              stats.recent_activity.map((act) => (
                <div key={act.id} className="flex items-start gap-4 p-3 rounded-lg bg-[#111827]/50 border border-[#334155]/50">
                  <div className={`mt-1 w-2 h-2 rounded-full ${act.status === 'valid' ? 'bg-[#00ff88]' : act.status === 'tampered' ? 'bg-[#ff3366]' : 'bg-[#00f0ff]'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{act.name}</p>
                    <p className="text-xs text-[#94a3b8] capitalize">{act.type} • {new Date(act.timestamp).toLocaleString()}</p>
                  </div>
                  <Badge variant={act.status === 'valid' ? 'success' : act.status === 'tampered' ? 'danger' : 'info'}>
                    {act.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-[#94a3b8] text-sm text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
