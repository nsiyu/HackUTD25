import { useState, useCallback } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Note } from "../services/notes";
import { getApiUrl } from "../config/api";
import { useDeepgram } from "./useDeepgram";

interface UseProcessLectureProps {
  onProcessedText: (processedText: string, isNew: boolean) => void;
  selectedNote: Note | null;
}

export function useProcessLecture({ onProcessedText, selectedNote }: UseProcessLectureProps) {
  const session = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");

  const handleTranscriptReceived = useCallback((transcript: string) => {
    setTranscribedText(prev => prev + " " + transcript);
  }, []);

  const { isRecording, startRecording, stopRecording: originalStopRecording } = useDeepgram({
    onTranscriptReceived: handleTranscriptReceived
  });

  const processLecture = async (lectureContent: string) => {
    if (!selectedNote || !session?.access_token) {
      console.error("No selected note or authentication token.");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/lecture/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          noteId: selectedNote.id,
          currentContent: selectedNote.content,
          lectureContent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      const { processedContent } = await response.json();
      onProcessedText(processedContent, true);
    } catch (error) {
      console.error("Error processing lecture:", error);
    } finally {
      setIsProcessing(false);
      setTranscribedText("");
    }
  };

  const stopRecording = useCallback(async () => {
    originalStopRecording();
    if (transcribedText.trim()) {
      await processLecture(transcribedText);
    }
  }, [originalStopRecording, transcribedText, processLecture]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      setTranscribedText("");
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);

  return {
    isProcessing,
    isRecording,
    toggleRecording,
    transcribedText
  };
}