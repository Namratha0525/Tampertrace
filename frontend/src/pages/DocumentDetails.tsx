import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../services/api';
import { Document, ContentBlock } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MerkleTreeViz } from '../components/crypto/MerkleTreeViz';
import { ArrowLeft, Download, ShieldCheck } from 'lucide-react';

export const DocumentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Document | null>(null);
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const [docRes, treeRes] = await Promise.all([
          documentService.getDetails(id),
          documentService.getMerkleTree(id)
        ]);
        setDoc(docRes.data);
        setTree(treeRes.data.tree);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDownload = async () => {
    if (!id || !doc) return;
    try {
      const response = await documentService.downloadPackage(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${doc.name}_package.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download package', err);
    }
  };

  if (loading) return <div className="text-center text-[#94a3b8]">Loading...</div>;
  if (!doc) return <div className="text-center text-[#ff3366]">Document not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/documents')} className="p-2 text-[#94a3b8] hover:text-white transition-colors bg-[#111827] rounded-lg border border-[#334155]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-white">{doc.name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Metadata</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111827] p-4 rounded-lg border border-[#334155]">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Document ID</p>
              <p className="text-sm font-mono text-[#e2e8f0] break-all">{doc.id}</p>
            </div>
            <div className="bg-[#111827] p-4 rounded-lg border border-[#334155]">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Filename</p>
              <p className="text-sm text-[#e2e8f0] truncate">{doc.filename}</p>
            </div>
            <div className="bg-[#111827] p-4 rounded-lg border border-[#334155] col-span-2">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Root Hash</p>
              <p className="text-sm font-mono text-[#00f0ff] break-all">{doc.root_hash}</p>
            </div>
            <div className="bg-[#111827] p-4 rounded-lg border border-[#334155]">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Created At</p>
              <p className="text-sm text-[#e2e8f0]">{new Date(doc.created_at).toLocaleString()}</p>
            </div>
            <div className="bg-[#111827] p-4 rounded-lg border border-[#334155]">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Version</p>
              <p className="text-sm text-[#e2e8f0]">v{doc.version}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-center items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center border border-[#8b5cf6]/50">
            <ShieldCheck className="w-8 h-8 text-[#8b5cf6]" />
          </div>
          <h3 className="text-lg font-semibold text-white">Verification Ready</h3>
          <p className="text-sm text-[#94a3b8]">Download the verification package to verify this document's integrity.</p>
          <div className="flex flex-col gap-3 w-full mt-2">
            <Button className="w-full justify-center" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download Package
            </Button>
            <Button variant="outline" className="w-full justify-center" onClick={() => navigate('/verify')}>
              Go to Verification
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Merkle Tree Structure</h3>
        {tree ? (
          <MerkleTreeViz tree={tree} />
        ) : (
          <div className="text-center text-[#94a3b8] py-12">Tree visualization not available.</div>
        )}
      </Card>
    </div>
  );
};
