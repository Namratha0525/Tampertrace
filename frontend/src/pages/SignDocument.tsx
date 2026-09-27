import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { UploadCloud, File, Shield, Download, CheckCircle } from 'lucide-react';
import { keyService, documentService } from '../services/api';
import { KeyPair, SignResponse } from '../types';

export const SignDocument: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [keys, setKeys] = useState<KeyPair[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SignResponse | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const { data } = await keyService.getAll();
        setKeys(data);
        if (data.length > 0) setSelectedKey(data[0].id);
      } catch (err) {
        console.error('Failed to fetch keys', err);
      }
    };
    fetchKeys();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      if (!documentName) {
        setDocumentName(acceptedFiles[0].name.split('.')[0]);
      }
    }
  }, [documentName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1
  });

  const handleSign = async () => {
    if (!file || !selectedKey || !documentName) {
      setError('Please provide file, document name, and select a key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data } = await documentService.sign(file, selectedKey, documentName);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signing failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPackage = async () => {
    if (!result) return;
    try {
      const response = await documentService.downloadPackage(result.document_id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${result.name}_package.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download package', err);
    }
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card glowColor="green" className="p-8 text-center animate-in zoom-in duration-500">
          <div className="mx-auto w-16 h-16 bg-[#00ff88]/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-[#00ff88]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Document Signed Successfully</h2>
          <p className="text-[#94a3b8] mb-8">The document has been securely hashed and signed.</p>
          
          <div className="bg-[#111827] rounded-lg p-4 text-left border border-[#334155] mb-8 space-y-4">
            <div>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Document Name</p>
              <p className="text-white font-medium">{result.name}</p>
            </div>
            <div>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Root Hash</p>
              <p className="text-[#00f0ff] font-mono text-sm break-all bg-[#0a0e1a] p-2 rounded border border-[#334155]">{result.root_hash}</p>
            </div>
            <div>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Blocks Processed</p>
              <p className="text-white font-medium">{result.blocks.length}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="success" onClick={handleDownloadPackage} className="gap-2">
              <Download className="w-4 h-4" /> Download Verification Package
            </Button>
            <Button variant="outline" onClick={() => { setResult(null); setFile(null); setDocumentName(''); }}>
              Sign Another
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#00f0ff]" /> Sign Document
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-[#ff3366]/10 border border-[#ff3366]/30 text-[#ff3366] rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* File Upload Zone */}
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">Document File</label>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-[#00f0ff] bg-[#00f0ff]/5' : file ? 'border-[#00ff88] bg-[#00ff88]/5' : 'border-[#334155] hover:border-[#00f0ff]/50 hover:bg-[#111827]'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex flex-col items-center">
                  <File className="w-10 h-10 text-[#00ff88] mb-3" />
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-[#94a3b8] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-10 h-10 text-[#00f0ff] mb-3" />
                  <p className="text-white font-medium mb-1">Drag & drop your document here</p>
                  <p className="text-sm text-[#94a3b8]">Supports PDF, TXT</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">Document Name</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="block w-full px-4 py-2 border border-[#334155] rounded-lg bg-[#111827] text-white placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff]"
              placeholder="e.g. Q3 Financial Report"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">Signing Key</label>
            {keys.length > 0 ? (
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="block w-full px-4 py-2 border border-[#334155] rounded-lg bg-[#111827] text-white focus:outline-none focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff]"
              >
                {keys.map(key => (
                  <option key={key.id} value={key.id}>{key.name} (RSA-{key.key_size})</option>
                ))}
              </select>
            ) : (
              <div className="p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg text-[#f59e0b] text-sm flex items-center justify-between">
                <span>No keys available. Generate a key first.</span>
                <Button size="sm" variant="outline" onClick={() => navigate('/keys')}>Go to Keys</Button>
              </div>
            )}
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleSign} 
            isLoading={isLoading}
            disabled={!file || !documentName || !selectedKey}
          >
            Sign & Hash Document
          </Button>
        </div>
      </Card>
    </div>
  );
};
