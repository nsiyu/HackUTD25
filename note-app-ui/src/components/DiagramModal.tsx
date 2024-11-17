import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Mermaid from './Mermaid';
import { getApiUrl } from '../config/api';

interface DiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
}

export function DiagramModal({ isOpen, onClose, selectedText }: DiagramModalProps) {
  const [diagram, setDiagram] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && selectedText) {
      generateDiagram();
    }
  }, [isOpen, selectedText]);

  const generateDiagram = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/diagram/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diagram');
      }

      const data = await response.json();
      console.log('Diagram response:', data);
      setDiagram(data.diagram);
    } catch (err) {
      console.error('Error generating diagram:', err);
      setError('Failed to generate diagram. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-jet/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-jet dark:text-dark-text">Generated Diagram</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-jet/5 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="bg-white/50 dark:bg-dark-surface/50 rounded-lg p-4">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maya"></div>
            </div>
          ) : error ? (
            <div className="h-64 flex items-center justify-center text-pink">{error}</div>
          ) : (
            <Mermaid chart={diagram} />
          )}
        </div>
      </div>
    </div>
  );
}