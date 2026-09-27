import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { keyService, verificationService } from '../services/api';
import { KeyPair } from '../types';
import { Key, Download, Plus } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const KeyManagement: React.FC = () => {
  const [keys, setKeys] = useState<KeyPair[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchKeys = async () => {
    try {
      const { data } = await keyService.getAll();
      setKeys(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async () => {
    if (!newKeyName) return;
    setIsLoading(true);
    try {
      await keyService.generate(newKeyName);
      setIsModalOpen(false);
      setNewKeyName('');
      fetchKeys();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      const response = await keyService.downloadPublicKey(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name}_public.pem`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download key', err);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Key className="text-[#f59e0b]" /> Key Management
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="!bg-[#f59e0b]/10 !text-[#f59e0b] !border-[#f59e0b]/50">
          <Plus className="w-4 h-4 mr-2" /> Generate New Key
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keys.map((key) => (
          <div key={key.id} className="bg-[#111827] border border-[#334155] rounded-xl p-5 hover:border-[#f59e0b]/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-medium">{key.name}</h3>
                <p className="text-xs text-[#94a3b8] mt-1">{key.algorithm}-{key.key_size}</p>
              </div>
              <Key className="w-5 h-5 text-[#334155] group-hover:text-[#f59e0b] transition-colors" />
            </div>
            <div className="mb-4">
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-1">Key ID</p>
              <p className="font-mono text-xs text-[#e2e8f0] break-all">{key.id}</p>
            </div>
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => handleDownload(key.id, key.name)}>
              <Download className="w-3 h-3 mr-2" /> Download Public Key
            </Button>
          </div>
        ))}
        {keys.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#94a3b8]">
            No keys generated yet.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate New Key Pair">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Key Name</label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="block w-full px-3 py-2 border border-[#334155] rounded-lg bg-[#111827] text-white focus:outline-none focus:ring-1 focus:ring-[#f59e0b] focus:border-[#f59e0b]"
              placeholder="e.g. Production Key 2024"
            />
          </div>
          <Button className="w-full !bg-[#f59e0b]/10 !text-[#f59e0b] !border-[#f59e0b]/50" onClick={handleGenerate} isLoading={isLoading}>
            Generate RSA-2048 Key
          </Button>
        </div>
      </Modal>
    </Card>
  );
};
