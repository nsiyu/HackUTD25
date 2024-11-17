import { FiMessageSquare, FiEdit2, FiActivity, FiX, FiCheck } from 'react-icons/fi';
import { Portal } from './Portal';
import { useState } from 'react';

type FloatingToolbarProps = {
  position: { x: number; y: number } | null;
  onAskAI: () => void;
  onEdit: (editPrompt: string, selectedText: string) => void;
  onGenerateDiagram: () => void;
  onCloseToolbar: () => void;
  selectedText: string;
};

export function FloatingToolbar({
  position,
  onAskAI,
  onEdit,
  onGenerateDiagram,
  onCloseToolbar,
  selectedText,
}: FloatingToolbarProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');

  if (!position) {
    return null;
  }

  const handleEditSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editPrompt.trim()) {
      onEdit(editPrompt, selectedText);
      setEditPrompt('');
      setIsEditMode(false);
      onCloseToolbar();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditMode(true);
  };

  return (
    <Portal>
      <div
        className="fixed z-[99999] flex gap-1.5 p-1.5 bg-dark-surface/95 shadow-lg border border-white/10 rounded-lg backdrop-blur-sm floating-toolbar"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          transform: 'translate(-50%, -100%) translateY(-2px)',
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {isEditMode ? (
          <div className="flex gap-1.5">
            <input
              type="text"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="How should this be edited?"
              className="w-64 px-3 py-1.5 text-xs text-white bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-1 focus:ring-maya/50"
              autoFocus
              onMouseDown={(e) => e.stopPropagation()}
            />
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleEditSubmit}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white/90 hover:text-white bg-maya/60 hover:bg-maya/70 rounded-md transition-all"
            >
              <FiCheck size={14} />
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditMode(false);
                setEditPrompt('');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white/90 hover:text-white bg-pink/60 hover:bg-pink/70 rounded-md transition-all"
            >
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAskAI();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white/90 hover:text-white bg-maya/60 hover:bg-maya/70 rounded-md transition-all cursor-pointer select-none"
            >
              <FiMessageSquare size={14} />
              Ask AI
            </button>
            <button
              onMouseDown={handleEditClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white/90 hover:text-white bg-pink/60 hover:bg-pink/70 rounded-md transition-all"
            >
              <FiEdit2 size={14} />
              Edit
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onGenerateDiagram();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white/90 hover:text-white bg-maya/50 hover:bg-maya/60 rounded-md transition-all"
            >
              <FiActivity size={14} />
              Diagram
            </button>
          </>
        )}
      </div>
    </Portal>
  );
}
