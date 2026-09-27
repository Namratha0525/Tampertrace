import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verificationService } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Shield, Printer, Download, ArrowLeft } from 'lucide-react';

export const VerificationReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (!id) return;
        const { data } = await verificationService.getReport(id);
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) return <div className="text-center text-[#94a3b8] mt-20">Loading Report...</div>;
  if (!report) return <div className="text-center text-[#ff3366] mt-20">Report not found</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button onClick={() => navigate(-1)} className="p-2 text-[#94a3b8] hover:text-white transition-colors bg-[#111827] rounded-lg border border-[#334155]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print PDF
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" /> Export JSON
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden bg-white text-black print:shadow-none print:border-none print:m-0" glowColor="none">
        {/* Report Header */}
        <div className="bg-[#111827] text-white p-8 border-b-4 border-[var(--status-color)]" style={{ '--status-color': report.valid ? '#00ff88' : '#ff3366' } as React.CSSProperties}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-[#00f0ff]" />
                <h1 className="text-3xl font-bold tracking-wider">TAMPER<span className="text-[#00f0ff]">TRACE</span></h1>
              </div>
              <p className="text-[#94a3b8]">Cryptographic Verification Report</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#94a3b8] uppercase tracking-widest mb-1">Status</p>
              <h2 className={`text-4xl font-black ${report.valid ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                {report.valid ? 'VERIFIED' : 'TAMPERED'}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 bg-white">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4 text-gray-800">1. Verification Subject</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr><td className="py-2 text-gray-500 font-medium w-1/3">Verification ID</td><td className="py-2 font-mono text-xs">{report.id}</td></tr>
                  <tr><td className="py-2 text-gray-500 font-medium">Timestamp</td><td className="py-2">{new Date(report.timestamp).toUTCString()}</td></tr>
                  <tr><td className="py-2 text-gray-500 font-medium">Document Name</td><td className="py-2 font-semibold">{report.document?.name || 'Unknown'}</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4 text-gray-800">2. Cryptographic Details</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr><td className="py-2 text-gray-500 font-medium w-1/3">Signature Valid</td><td className="py-2">{report.signature_valid ? '✅ Yes' : '❌ No'}</td></tr>
                  <tr><td className="py-2 text-gray-500 font-medium">Root Hash Match</td><td className="py-2">{report.root_hash_match ? '✅ Yes' : '❌ No'}</td></tr>
                  <tr><td className="py-2 text-gray-500 font-medium">Original Hash</td><td className="py-2 font-mono text-[10px] break-all">{report.original_root_hash || 'N/A'}</td></tr>
                  <tr><td className="py-2 text-gray-500 font-medium">Current Hash</td><td className="py-2 font-mono text-[10px] break-all">{report.current_root_hash}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4 text-gray-800">3. Integrity Analysis</h3>
            {!report.valid && report.affected_blocks?.length > 0 ? (
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-red-50 text-red-800">
                    <tr>
                      <th className="p-3">Page</th>
                      <th className="p-3">Block</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {report.affected_blocks.filter((b: any) => b.status !== 'match').map((block: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium">{block.page_number}</td>
                        <td className="p-3">{block.block_number}</td>
                        <td className="p-3 text-red-600 font-bold uppercase">{block.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : report.valid ? (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200 text-center font-medium">
                Complete structural and cryptographic integrity verified. All content blocks match the original signature.
              </div>
            ) : (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 text-center font-medium">
                Cryptographic signature is invalid or corrupt.
              </div>
            )}
          </div>

          <div className="pt-12 text-center text-xs text-gray-400 border-t border-gray-200">
            <p>Generated by TamperTrace Platform</p>
            <p className="font-mono mt-1">{report.id}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
