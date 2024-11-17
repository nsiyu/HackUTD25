import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note } from '../services/notes';
import { useTextAnimation } from '../hooks/useTextAnimation';
import debounce from 'lodash/debounce';

interface AnimatedNoteContentProps {
  note: Note;
  onContentChange: (note: Note) => void;
  onTextSelection: (event: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => void;
  animate: boolean;
  onBlur: () => void;
}

function AnimatedNoteContent({
  note,
  onContentChange,
  onTextSelection,
  animate,
  onBlur
}: AnimatedNoteContentProps) {
  const [content, setContent] = useState(note.content);
  
  // Memoize the debounced update function
  const debouncedUpdate = useMemo(
    () => debounce((value: string) => {
      onContentChange({
        ...note,
        content: value
      });
    }, 300),
    [note, onContentChange]
  );

  // Only use animation when explicitly needed
  const displayText = animate ? useTextAnimation({
    originalText: content,
    newText: note.content,
    speed: 30,
    onComplete: () => setContent(note.content),
  }) : content;

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

  return (
    <textarea
      value={content}
      onChange={handleChange}
      onMouseUp={onTextSelection}
      onKeyUp={onTextSelection}
      onBlur={onBlur}
      className="w-full h-[calc(100vh-200px)] bg-transparent border-none outline-none text-jet dark:text-dark-text resize-none scrollbar-hide"
      placeholder="Start writing..."
    />
  );
}

export default AnimatedNoteContent;