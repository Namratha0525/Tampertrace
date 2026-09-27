import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { documentService } from '../services/api';
import { Document } from '../types';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronRight } from 'lucide-react';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data } = await documentService.getAll();
        setDocuments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  if (loading) return <div className="text-center text-[#94a3b8]">Loading...</div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="text-[#00f0ff]" /> Document Repository
        </h2>
        <Button onClick={() => navigate('/sign')}>Sign New Document</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#1e293b] border-b border-[#334155]">
            <tr>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Name</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Version</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Root Hash</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Date</th>
              <th className="p-4 text-sm font-medium text-[#94a3b8]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-[#1e293b]/50 transition-colors">
                <td className="p-4 text-white font-medium">{doc.name}</td>
                <td className="p-4 text-[#94a3b8]">v{doc.version}</td>
                <td className="p-4">
                  <span className="font-mono text-xs text-[#00f0ff] bg-[#0a0e1a] px-2 py-1 rounded border border-[#334155]">
                    {doc.root_hash.substring(0, 16)}...
                  </span>
                </td>
                <td className="p-4 text-[#94a3b8] text-sm">{new Date(doc.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/documents/${doc.id}`)}>
                      Details <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#94a3b8]">No documents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
