import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Note } from "../services/notes";
import { getApiUrl } from "../config/api";

interface UseLectureEditorProps {
  onProcessedText: (processedText: string) => void;
  selectedNote: Note | null;
}

export function useLectureEditor({ onProcessedText, selectedNote }: UseLectureEditorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const session = useSession();

  const processLecture = async (lectureContent: string) => {
    if (!selectedNote || !session) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`${getApiUrl()}/process-lecture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          noteId: selectedNote.id,
          currentContent: selectedNote.content,
          lectureContent: lectureContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process lecture');
      }

      const data = await response.json();
      onProcessedText(data.processedContent);
    } catch (error) {
      console.error('Error processing lecture:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processLecture,
  };
}