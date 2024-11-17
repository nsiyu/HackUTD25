import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export function NoteModal({ isOpen, onClose, onSubmit }: NoteModalProps) {
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-dark-surface/95 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-white">Create New Note</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiX size={20} className="text-white/70" />
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(title);
          setTitle('');
          onClose();
        }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-maya/50"
            autoFocus
          />
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-white/70 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-maya/60 hover:bg-maya/70 text-white text-sm rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!title.trim()}
            >
              Create Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
