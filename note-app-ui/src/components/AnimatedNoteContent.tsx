import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note } from '../services/notes';
import debounce from 'lodash/debounce';
import { FloatingToolbar } from './FloatingToolbar';
import getCaretCoordinates from 'textarea-caret';

interface AnimatedNoteContentProps {
  note: Note;
  onContentChange: (note: Note) => void;
  onTextSelection: (
    event: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>
  ) => void;
  animate: boolean;
  onBlur: () => void;
  onAskAI?: () => void;
  onEdit?: (editPrompt: string, selectedText: string) => void;
  onGenerateDiagram?: () => void;
  setToolbarPositionSafe?: (x: number, y: number) => void;
  setChatMessages: React.Dispatch<
    React.SetStateAction<{ role: 'user' | 'ai'; content: string }[]>
  >;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedText: string;
}

function AnimatedNoteContent({
  note,
  onContentChange,
  onTextSelection,
  onBlur,
  onAskAI,
  onEdit,
  onGenerateDiagram,
  selectedText,
}: AnimatedNoteContentProps) {
  const [content, setContent] = useState(note.content);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);

  const handleTextSelection = useCallback(
    (
      e:
        | React.MouseEvent<HTMLTextAreaElement>
        | React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd } = textarea;

      if (selectionStart === selectionEnd) {
        setToolbarPosition(null);
        return;
      }


      const textareaRect = textarea.getBoundingClientRect();
      const startCoords = getCaretCoordinates(textarea, selectionStart);
      const endCoords = getCaretCoordinates(textarea, selectionEnd);

      const selectionWidth = Math.abs(endCoords.left - startCoords.left);
      const x = textareaRect.left + startCoords.left + selectionWidth / 2;
      const y = textareaRect.top + startCoords.top;

      setToolbarPosition({ x, y });
      onTextSelection(e);
    },
    [onTextSelection]
  );

  // Memoize the debounced update function
  const debouncedUpdate = useMemo(
    () =>
      debounce((value: string) => {
        onContentChange({
          ...note,
          content: value,
        });
      }, 300),
    [note, onContentChange]
  );

  // Handle local state immediately but debounce the parent update
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    debouncedUpdate(newValue);
  };

  // Sync local state with prop changes
  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  const handleAskAI = () => {
    console.log('AnimatedNoteContent: handleAskAI called');
    if (onAskAI) {
      onAskAI();
    }
  };

  const handleEdit = (editPrompt: string) => {
    console.log('AnimatedNoteContent: handleEdit called with prompt:', editPrompt);
    if (selectedText && onEdit) {
      onEdit(editPrompt, selectedText);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (
        document.activeElement &&
        (document.activeElement as HTMLElement).closest('.floating-toolbar')
      ) {
        // Focus moved to the toolbar; don't close it
        return;
      }
      setToolbarPosition(null);
      onBlur(); // Call the onBlur prop to switch back to markdown view
    }, 0);
  };

  return (
    <>
      <textarea
        value={content}
        onChange={handleChange}
        onMouseUp={handleTextSelection}
        onKeyUp={handleTextSelection}
        onBlur={handleBlur}
        className="w-full h-[calc(100vh-200px)] bg-transparent border-none outline-none text-jet dark:text-dark-text resize-none scrollbar-hide overflow-x-hidden whitespace-pre-wrap break-words"
        placeholder="Start writing..."
        style={{ maxWidth: '100%', wordWrap: 'break-word' }}
      />
      <FloatingToolbar
        position={toolbarPosition}
        onAskAI={handleAskAI}
        onEdit={handleEdit}
        onGenerateDiagram={onGenerateDiagram || (() => {})}
        onCloseToolbar={() => setToolbarPosition(null)}
        selectedText={selectedText}
      />
    </>
  );
}

export default AnimatedNoteContent;
