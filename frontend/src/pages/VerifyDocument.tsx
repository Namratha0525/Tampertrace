import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ShieldCheck, UploadCloud, FileJson, Key, FileText, CheckCircle, AlertTriangle, FileArchive, Search } from 'lucide-react';
import { verificationService } from '../services/api';
import { VerificationResult } from '../types';
import { useNavigate } from 'react-router-dom';

export const VerifyDocument: React.FC = () => {
  const [mode, setMode] = useState<'package' | 'manual'>('package');
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [manifestFile, setManifestFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'package' && packageFile) {
        const { data } = await verificationService.verifyPackage(packageFile);
        setResult(data);
      } else if (mode === 'manual' && docFile && sigFile && keyFile && manifestFile) {
        const { data } = await verificationService.verifyManual(docFile, sigFile, keyFile, manifestFile);
        setResult(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setPackageFile(null);
    setDocFile(null);
    setSigFile(null);
    setKeyFile(null);
    setManifestFile(null);
  };

  // Dropzone components logic omitted for brevity, using standard inputs
  
  if (result) {
    const isTampered = result.tampering_detected || !result.valid;
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card glowColor={isTampered ? 'red' : 'green'} className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Verification Result</h2>
            <Button variant="outline" onClick={resetForm}>Verify Another</Button>
          </div>
          
          <div className={`p-6 rounded-xl border mb-8 flex items-center gap-6 ${
            isTampered ? 'bg-[#ff3366]/10 border-[#ff3366]/30' : 'bg-[#00ff88]/10 border-[#00ff88]/30'
          }`}>
            <div className={`p-4 rounded-full ${isTampered ? 'bg-[#ff3366]/20' : 'bg-[#00ff88]/20'}`}>
              {isTampered ? (
                <AlertTriangle className={`w-12 h-12 text-[#ff3366] animate-pulse`} />
              ) : (
                <CheckCircle className={`w-12 h-12 text-[#00ff88]`} />
              )}
            </div>
            <div>
              <h3 className={`text-3xl font-bold mb-1 ${isTampered ? 'text-[#ff3366]' : 'text-[#00ff88]'}`}>
                {isTampered ? 'INVALID / TAMPERED' : 'VALID / INTEGRITY INTACT'}
              </h3>
              <p className="text-[#e2e8f0]">
                {isTampered 
                  ? 'The document has been modified since it was signed, or the signature is invalid.' 
                  : 'The document matches the original signature perfectly. No tampering detected.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111827] p-4 rounded-lg border border-[#334155]">
              <p className="text-sm text-[#94a3b8] mb-1">Signature Status</p>
              <div className="flex items-center gap-2">
                {result.signature_valid ? <CheckCircle className="w-4 h-4 text-[#00ff88]" /> : <AlertTriangle className="w-4 h-4 text-[#ff3366]" />}
                <span className="text-white font-medium">{result.signature_valid ? 'Valid' : 'Invalid'}</span>
              </div>
            </div>
            <div className="bg-[#111827] p-4 rounded-lg border border-[#334155]">
              <p className="text-sm text-[#94a3b8] mb-1">Root Hash Match</p>
              <div className="flex items-center gap-2">
                {result.root_hash_match ? <CheckCircle className="w-4 h-4 text-[#00ff88]" /> : <AlertTriangle className="w-4 h-4 text-[#ff3366]" />}
                <span className="text-white font-medium">{result.root_hash_match ? 'Match' : 'Mismatch'}</span>
              </div>
            </div>
            <div className="bg-[#111827] p-4 rounded-lg border border-[#334155]">
              <p className="text-sm text-[#94a3b8] mb-1">Blocks Tampered</p>
              <p className="text-white font-medium">{result.blocks_summary.modified + result.blocks_summary.added + result.blocks_summary.deleted} / {result.blocks_summary.total}</p>
            </div>
          </div>

          {isTampered && result.affected_blocks.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Tamper Details</h3>
              <div className="bg-[#111827] rounded-lg border border-[#334155] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#1e293b] border-b border-[#334155]">
                    <tr>
                      <th className="p-3 text-sm font-medium text-[#94a3b8]">Page</th>
                      <th className="p-3 text-sm font-medium text-[#94a3b8]">Block</th>
                      <th className="p-3 text-sm font-medium text-[#94a3b8]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {result.affected_blocks.filter(b => b.status !== 'match').map((block, idx) => (
                      <tr key={idx} className="hover:bg-[#1e293b]/50 transition-colors">
                        <td className="p-3 text-white">{block.page_number}</td>
                        <td className="p-3 text-white">{block.block_number}</td>
                        <td className="p-3">
                          <Badge variant="danger">{block.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate(`/reports/${result.verification_id}`)}>View Full Report</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#8b5cf6]" /> Verify Document
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-[#ff3366]/10 border border-[#ff3366]/30 text-[#ff3366] rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex bg-[#111827] rounded-lg p-1 mb-6">
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'package' ? 'bg-[#1e293b] text-[#8b5cf6] shadow-sm' : 'text-[#94a3b8] hover:text-white'}`}
            onClick={() => setMode('package')}
          >
            Verification Package (ZIP)
          </button>
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-[#1e293b] text-[#8b5cf6] shadow-sm' : 'text-[#94a3b8] hover:text-white'}`}
            onClick={() => setMode('manual')}
          >
            Manual Upload
          </button>
        </div>

        <div className="space-y-6">
          {mode === 'package' ? (
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">Upload ZIP Package</label>
              <div className="border-2 border-dashed border-[#334155] rounded-xl p-8 text-center cursor-pointer hover:border-[#8b5cf6]/50 bg-[#111827] hover:bg-[#111827]/80 transition-colors">
                <input type="file" accept=".zip" onChange={(e) => setPackageFile(e.target.files?.[0] || null)} className="hidden" id="pkg-upload" />
                <label htmlFor="pkg-upload" className="cursor-pointer flex flex-col items-center">
                  <FileArchive className="w-10 h-10 text-[#8b5cf6] mb-3" />
                  <p className="text-white font-medium">{packageFile ? packageFile.name : 'Select Verification Package (.zip)'}</p>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Document File</label>
                <input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="block w-full text-sm text-[#94a3b8] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1e293b] file:text-white hover:file:bg-[#334155]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Signature JSON</label>
                <input type="file" accept=".json" onChange={(e) => setSigFile(e.target.files?.[0] || null)} className="block w-full text-sm text-[#94a3b8] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1e293b] file:text-white hover:file:bg-[#334155]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Public Key PEM</label>
                <input type="file" accept=".pem" onChange={(e) => setKeyFile(e.target.files?.[0] || null)} className="block w-full text-sm text-[#94a3b8] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1e293b] file:text-white hover:file:bg-[#334155]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Manifest JSON</label>
                <input type="file" accept=".json" onChange={(e) => setManifestFile(e.target.files?.[0] || null)} className="block w-full text-sm text-[#94a3b8] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1e293b] file:text-white hover:file:bg-[#334155]" />
              </div>
            </div>
          )}

          <Button 
            className="w-full !bg-[#8b5cf6]/10 !text-[#8b5cf6] !border-[#8b5cf6]/50 hover:!bg-[#8b5cf6]/20" 
            size="lg" 
            onClick={handleVerify} 
            isLoading={isLoading}
            disabled={isLoading || (mode === 'package' ? !packageFile : (!docFile || !sigFile || !keyFile || !manifestFile))}
          >
            <Search className="w-5 h-5 mr-2" /> Verify Integrity
          </Button>
        </div>
      </Card>
    </div>
  );
};
