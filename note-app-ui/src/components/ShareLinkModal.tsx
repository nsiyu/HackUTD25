import { useState } from 'react';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareLink: string;
}

export function ShareLinkModal({ isOpen, onClose, shareLink }: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-dark-surface/95 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-white">Share Note</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiX size={20} className="text-white/70" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
          />
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-maya/60 hover:bg-maya/70 text-white transition-colors"
          >
            {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
          </button>
        </div>

        <p className="text-sm text-white/50">
          Anyone with this link will be able to view this note.
        </p>
      </div>
    </div>
  );
}