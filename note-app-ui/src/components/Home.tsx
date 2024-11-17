import { useState, useEffect, useCallback, useRef } from "react";
import {
  FiPlus,
  FiSearch,
  FiLogOut,
  FiUser,
  FiMic,
  FiMicOff,
  FiSend,
  FiClock,
  FiHeadphones,
  FiSettings,
  FiActivity,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { noteService, Note } from "../services/notes";
import { useDebounce } from "../hooks/useDebounce";
import { useHumeAI } from "../hooks/useHumeAI";
import { authService } from "../services/auth";
import getCaretCoordinates from "textarea-caret/index.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./markdown-styles.css";
import AnimatedNoteContent from "./AnimatedNoteContent";
import { Dropdown } from './Dropdown';
import { FiFile, FiEdit3, FiEye, FiShare2, FiDownload, FiTrash2, FiCopy, FiPrinter } from 'react-icons/fi';
import { useProcessLecture } from "../hooks/useProcessLecture";
import { AskAIModal } from "./AskAIModal";
import { getApiUrl } from "../config/api";
import { NoteModal } from "./NoteModal";
import { DiagramModal } from "./DiagramModal";

function Home() {
  const navigate = useNavigate();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [selectedText, setSelectedText] = useState("");
  const editableRef = useRef<HTMLDivElement>(null);

  const [toolbarPosition, setToolbarPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null); // Reference to the scrollable container

  const [isEditingContent, setIsEditingContent] = useState(false); // Added state for editing
  const [tempContent, setTempContent] = useState(""); // State to hold temporary content during editing

  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleNoteUpdate = useCallback(async (updatedNote: Note) => {
    try {
      const updated = await noteService.updateNote(updatedNote.id, updatedNote);
      setSelectedNote(updated);
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === updated.id ? updated : note))
      );
    } catch (error) {
      console.error("Error updating note:", error);
    }
  }, []);


  const handleProcessedText = useCallback(
    (processedText: string, animate?: boolean) => {
      if (selectedNote) {
        const updatedNote = {
          ...selectedNote,
          content: animate
            ? processedText
            : `${selectedNote.content}\n\n${processedText}`,
        };
        handleNoteUpdate(updatedNote);
      }
    },
    [selectedNote, handleNoteUpdate]
  );

  useEffect(() => {
    if (isEditingContent && editableRef.current) {
      editableRef.current.innerHTML = tempContent.replace(/\n/g, "<br>");
      editableRef.current.focus();

      // Move cursor to the end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditingContent]);

  const handleContentChange = (event: React.FormEvent<HTMLDivElement>) => {
    const newContent = event.currentTarget.innerText;
    setTempContent(newContent);
  };

  const handleEditSubmit = async (suggestion: string) => {
    if (!selectedNote) return;

    await submitEdit(selectedText, suggestion);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Welcome to Quill AI",
      content: "Start writing your thoughts...",
      user_id: "",
      created_at: "",
      updated_at: "",
    },
  ]);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const fetchedNotes = await noteService.getNotes();
        setNotes(fetchedNotes || []);
      } catch (error) {
        console.error("Error loading notes:", error);
      }
    };

    loadNotes();
  }, []);

  const handleCreateNote = async (title: string) => {
    try {
      const newNote = await noteService.createNote(title, "");
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setIsNoteModalOpen(false);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const debouncedNoteUpdate = useDebounce(async (updatedNote: Note) => {
    try {
      await noteService.updateNote(updatedNote.id, updatedNote);
      setNotes(
        notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
    } catch (error) {
      console.error("Error updating note:", error);
    }
  }, 500);

  const handleNoteContentChange = (updatedContent: string) => {
    setTempContent(updatedContent);
  };

  const setToolbarPositionSafe = (x: number, y: number) => {
    const toolbarWidth = 200; // Approximate width of the toolbar
    const toolbarHeight = 50; // Approximate height of the toolbar
    const padding = 10; // Padding from the edges

    const containerWidth =
      mainContentRef.current?.clientWidth || window.innerWidth;
    const containerHeight =
      mainContentRef.current?.clientHeight || window.innerHeight;

    let safeX = x;
    let safeY = y;

    // Ensure the toolbar doesn't go off the right or left edge
    if (x + toolbarWidth / 2 > containerWidth - padding) {
      safeX = containerWidth - toolbarWidth / 2 - padding;
    } else if (x - toolbarWidth / 2 < padding) {
      safeX = toolbarWidth / 2 + padding;
    }

    // Ensure the toolbar doesn't go above or below the container
    if (y - toolbarHeight - padding < 0) {
      safeY = y + toolbarHeight + padding;
    } else if (y + toolbarHeight + padding > containerHeight) {
      safeY = containerHeight - toolbarHeight - padding;
    }

    setToolbarPosition({
      x: safeX,
      y: safeY,
    });
  };

  const isMouseEvent = (
    event:
      | React.MouseEvent<HTMLTextAreaElement | HTMLDivElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ): event is React.MouseEvent<HTMLTextAreaElement | HTMLDivElement> => {
    return (event as React.MouseEvent).clientY !== undefined;
  };

  const handleTextSelection = (
    event:
      | React.MouseEvent<HTMLTextAreaElement | HTMLDivElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    let selected = "";
    let x = 0;
    let y = 0;

    if (event.currentTarget instanceof HTMLTextAreaElement) {
      const textarea = event.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;

      // Clear toolbar if there's no selection
      if (
        selectionStart === null ||
        selectionEnd === null ||
        selectionStart === selectionEnd
      ) {
        setToolbarPosition(null);
        setSelectedText("");
        return;
      }

      selected = value.substring(selectionStart, selectionEnd).trim();
      if (selected) {
        // Get the caret coordinates at the end of the selection
        const coordinates = getCaretCoordinates(textarea, selectionEnd);
        const { top, left } = coordinates;

        // Get bounding rectangles
        const textareaRect = textarea.getBoundingClientRect();
        const containerRect = mainContentRef.current?.getBoundingClientRect();

        if (containerRect) {
          // Calculate X position as before
          x = textareaRect.left - containerRect.left + left;

          if (isMouseEvent(event)) {
            // For MouseEvent, use clientY
            y = event.clientY - containerRect.top - 40; // Adjust Y as needed
          } else {
            // For KeyboardEvent, fallback to caret coordinates
            y = textareaRect.top - containerRect.top + top - 40; // Adjust Y to position the toolbar above the selection
          }
        }
      }
    } else if (event.currentTarget instanceof HTMLDivElement) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        selected = selection.toString().trim();

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = mainContentRef.current?.getBoundingClientRect();

        if (containerRect) {
          x = rect.left - containerRect.left + rect.width / 2;
          y = rect.top - containerRect.top - 40; // Adjust Y to position the toolbar above the selection
        }
      }
    }

    if (selected) {
      setSelectedText(selected);
      setToolbarPositionSafe(x, y);
    } else {
      setToolbarPosition(null);
      setSelectedText("");
    }
  };

  const {
    isListening,
    isMuted,
    error: humeError,
    startListening,
    stopListening,
    toggleMute,
    cleanup: cleanupHumeAI,
  } = useHumeAI({
    onTranscriptReceived: (transcript) => {
      if (transcript.trim()) {
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { role: "user", content: transcript },
        ]);
      }
    },
    onAudioReceived: (audioBlob) => {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    },
    onAIResponse: (response) => {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { role: "ai", content: response },
      ]);
    },
  });

  const handleCloseChatMenu = useCallback(() => {
    setIsChatOpen(false);
    if (isListening) {
      cleanupHumeAI();
    }
  }, [isListening, cleanupHumeAI]);

  const renderChatInput = () => (
    <div className="p-4 border-t border-maya/10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem(
            "message"
          ) as HTMLInputElement;
          if (input.value.trim()) {
            setChatMessages([
              ...chatMessages,
              { role: "user", content: input.value },
            ]);
            input.value = "";
          }
        }}
        className="space-y-3"
      >
        {humeError && (
          <div className="p-2 bg-pink/10 text-pink rounded-lg text-sm">
            {humeError}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            name="message"
            placeholder="Ask about this note..."
            className="flex-1 px-4 py-2 bg-white/50 border border-maya/20 rounded-lg focus:outline-none focus:border-maya"
          />

          <button
            type="button"
            onClick={() => {
              if (!isListening) {
                startListening();
              } else {
                toggleMute();
              }
            }}
            className={`p-2 rounded-lg transition-all ${
              isListening
                ? isMuted
                  ? "bg-pink text-white hover:bg-pink/90"
                  : "bg-maya text-white hover:bg-maya/90"
                : "border border-maya/20 text-jet/70 dark:text-dark-text/70 hover:bg-pink/10 hover:text-pink hover:border-pink"
            }`}
          >
            {isListening ? (
              isMuted ? (
                <FiMicOff size={20} />
              ) : (
                <FiMic size={20} />
              )
            ) : (
              <FiMic size={20} />
            )}
          </button>

          <button
            type="submit"
            className="p-2 bg-maya text-white rounded-lg hover:bg-maya/90 transition-all"
          >
            <FiSend size={20} />
          </button>
        </div>
      </form>
    </div>
  );

  const handleEditBlur = async () => {
    if (isEditingContent && selectedNote) {
      await handleNoteUpdate({
        ...selectedNote,
        content: tempContent,
      });
      setIsEditingContent(false);
    }
  };

  const renderMainContent = () => {
    if (!selectedNote) {
      return (
        <div className="h-full flex items-center justify-center text-jet/50">
          <p>Select a note or create a new one</p>
        </div>
      );
    }

    const contentClassName = 
      "w-full h-[calc(100vh-12rem)] overflow-y-auto rounded-lg p-6 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-maya/10 dark:border-maya/5 shadow-sm";

    return (
      <div className="w-[800px] mx-auto relative flex flex-col h-full p-6">
        <div className={`transition-all duration-300 ${isChatOpen ? "mr-80" : ""}`}>
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) =>
                  handleNoteUpdate({
                    ...selectedNote,
                    title: e.target.value,
                  })
                }
                className="flex-1 text-3xl font-bold bg-transparent border-none outline-none text-jet dark:text-dark-text hover:bg-white/30 dark:hover:bg-dark-surface/30 p-2 pl-0 rounded-lg transition-colors"
                placeholder="Note title"
              />
              <div className="flex items-center gap-2 ml-4">
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isProcessing}
                  className={`p-2 rounded-lg transition-all ${
                    isRecording
                      ? "bg-pink text-white hover:bg-pink/90"
                      : "border border-maya/20 text-jet/70 dark:text-dark-text/70 hover:bg-pink/10 hover:text-pink hover:border-pink"
                  }`}
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? <FiMicOff size={20} /> : <FiMic size={20} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isListening) {
                      startListening();
                    } else {
                      toggleMute();
                    }
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    isListening
                      ? isMuted
                        ? "bg-pink text-white hover:bg-pink/90"
                        : "bg-maya text-white hover:bg-maya/90"
                      : "border border-maya/20 text-jet/70 dark:text-dark-text/70 hover:bg-pink/10 hover:text-pink hover:border-pink"
                  }`}
                  title="Talk to AI assistant"
                >
                  {isListening ? (
                    isMuted ? (
                      <FiMicOff size={20} />
                    ) : (
                      <FiHeadphones size={20} />
                    )
                  ) : (
                    <FiHeadphones size={20} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-jet/50 dark:text-dark-text/50 text-sm">
              <FiClock className="w-4 h-4" />
              <span>
                {selectedNote.updated_at
                  ? `Last updated ${new Date(selectedNote.updated_at).toLocaleDateString()}`
                  : "Just created"}
              </span>
            </div>
          </div>

          {isEditingContent ? (
            <div className={contentClassName}>
              <AnimatedNoteContent
                note={selectedNote}
                onContentChange={(updatedNote) => {
                  setTempContent(updatedNote.content);
                  handleNoteUpdate(updatedNote);
                }}
                onTextSelection={handleTextSelection}
                animate={false}
                onBlur={() => {
                  handleEditBlur();
                  setIsEditingContent(false);
                }}
                onAskAI={handleAskAI}
                onEdit={handleEdit}
                onGenerateDiagram={handleGenerateDiagram}
                setToolbarPositionSafe={setToolbarPositionSafe}
                setChatMessages={setChatMessages}
                setIsChatOpen={setIsChatOpen}
                selectedText={selectedText}
              />
            </div>
          ) : (
            <div
              onClick={() => {
                setIsEditingContent(true);
                setTempContent(selectedNote.content);
              }}
              className={`${contentClassName} hover:bg-white/60 dark:hover:bg-dark-surface/60 transition-colors cursor-text`}
            >
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold mb-6 text-jet dark:text-dark-text" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-jet dark:text-dark-text mb-6 leading-relaxed" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-6 mb-6 text-jet dark:text-dark-text space-y-3" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-6 mb-6 text-jet dark:text-dark-text space-y-3" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="text-jet dark:text-dark-text" {...props} />
                    ),
                  }}
                >
                  {selectedNote.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const fileMenuItems = [
    { label: 'New', onClick: () => {/* handle new */}, icon: <FiFile size={14} /> },
    { label: 'Save', onClick: () => {/* handle save */}, icon: <FiDownload size={14} /> },
    { label: 'Delete', onClick: () => {/* handle delete */}, icon: <FiTrash2 size={14} /> },
  ];

  const editMenuItems = [
    { label: 'Copy', onClick: () => {/* handle copy */}, icon: <FiCopy size={14} /> },
    { label: 'Edit', onClick: () => {/* handle edit */}, icon: <FiEdit3 size={14} /> },
  ];

  const viewMenuItems = [
    { label: 'Preview', onClick: () => {/* handle preview */}, icon: <FiEye size={14} /> },
    { label: 'Print', onClick: () => {/* handle print */}, icon: <FiPrinter size={14} /> },
  ];

  const shareMenuItems = [
    { label: 'Share Link', onClick: () => {/* handle share link */}, icon: <FiShare2 size={14} /> },
    { label: 'Export', onClick: () => {/* handle export */}, icon: <FiDownload size={14} /> },
  ];

  const { isProcessing, isRecording, toggleRecording } = useProcessLecture({
    onProcessedText: handleProcessedText,
    selectedNote,
  });

  const handleGenerateDiagram = useCallback(() => {
    if (selectedText) {
      setShowDiagramModal(true);
    }
  }, [selectedText]);

  const { sendMessage } = useHumeAI({
    onAIResponse: (response) => {
      setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
    }
  });

  const handleAskAI = useCallback(async () => {
    console.log('handleAskAI called, selectedText:', selectedText);
    if (selectedText) {
      try {
        console.log('Setting chat messages and opening chat');
        setChatMessages(prev => [...prev, { role: 'user', content: selectedText }]);
        setIsChatOpen(true);
        
        console.log('Sending message to HumeAI');
        await sendMessage(selectedText);
        
      } catch (error) {
        console.error('Error getting AI response:', error);
        setChatMessages(prev => [...prev, 
          { role: 'ai', content: 'Sorry, I encountered an error processing your request.' }
        ]);
      }
    }
  }, [selectedText, sendMessage]);

  const handleEdit = async (editPrompt: string, selectedText: string) => {
    if (!selectedNote) return;

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/lecture/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wholeLecture: selectedNote.content,
          partToModify: selectedText,
          suggestion: editPrompt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to edit text');
      }

      const data = await response.json();
      
      if (!data.modifiedText) {
        throw new Error('Invalid response from server');
      }

      // Update the note with the modified text
      await handleNoteUpdate({
        ...selectedNote,
        content: data.modifiedText
      });

      // Close the toolbar after successful edit
      setToolbarPosition(null);
      
    } catch (error) {
      console.error('Error editing text:', error);
    }
  };

  const handleNewNote = async () => {
    try {
      const newNote = await noteService.createNote("Untitled Note", "");
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent note selection when clicking delete
    try {
      await noteService.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const [showDiagramModal, setShowDiagramModal] = useState(false);

  return (
    <div className="h-screen bg-white dark:bg-dark-bg flex flex-col">
      {/* Top Navbar */}
      <nav className="h-[56px] border-b border-jet/5 dark:border-white/5 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm flex items-center">
        {/* Left section - Logo and Menu Items */}
        <div className="flex-1 flex items-center gap-6 px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-maya/80 to-pink/80 rounded-lg flex items-center justify-center text-white">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-jet dark:text-dark-text">Notable</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-jet/70 dark:text-dark-text/70">
            <Dropdown trigger="File" items={fileMenuItems} />
            <Dropdown trigger="Edit" items={editMenuItems} />
            <Dropdown trigger="View" items={viewMenuItems} />
            <Dropdown trigger="Share" items={shareMenuItems} />
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4">
          <button
            onClick={() => {/* handle settings */}}
            className="p-2.5 rounded-lg hover:bg-jet/5 dark:hover:bg-white/5 text-jet/70 dark:text-dark-text/70 transition-colors"
          >
            <FiSettings size={20} />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="p-2.5 rounded-lg hover:bg-jet/5 dark:hover:bg-white/5 text-jet/70 dark:text-dark-text/70 transition-colors"
          >
            <FiUser size={20} />
          </button>
          <div className="w-px h-7 bg-jet/10 dark:bg-white/10 mx-1" />
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-lg hover:bg-jet/5 dark:hover:bg-white/5 text-jet/70 dark:text-dark-text/70 transition-colors"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 flex flex-col bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm border-r border-jet/5 dark:border-white/5">
          <div className="p-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-jet/50 dark:text-dark-text/50" />
              <input
                type="text"
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-dark-surface/50 rounded-xl border border-jet/10 dark:border-white/10 focus:outline-none focus:border-jet/20 dark:focus:border-white/20 transition-colors"
              />
            </div>
          </div>

          <div className="p-4 space-y-4 flex-grow overflow-y-auto">
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-jet/5 dark:hover:bg-white/5 transition-all text-jet/70 dark:text-dark-text/70"
            >
              <FiPlus />
              <span>New Note</span>
            </button>

            <div className="space-y-2">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`w-full p-4 text-left rounded-xl transition-all ${
                    selectedNote?.id === note.id
                      ? "bg-white dark:bg-dark-surface border-jet/10 dark:border-white/10 shadow-sm"
                      : "hover:bg-white/50 dark:hover:bg-dark-surface/50 border-transparent"
                  } border group relative`}
                >
                  <h3 className="font-medium text-jet dark:text-dark-text">{note.title}</h3>
                  <p className="text-sm mt-1 text-jet/70 dark:text-dark-text/70 line-clamp-2">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-jet/50 dark:text-dark-text/50 text-xs">
                      <FiClock className="w-3 h-3" />
                      <span>{note.created_at ? new Date(note.created_at).toLocaleDateString() : ""}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-pink/10 text-pink/70 hover:text-pink transition-all"
                      title="Delete note"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto relative h-screen flex flex-col bg-white/90 dark:bg-dark-surface/90" ref={mainContentRef}>
          {renderMainContent()}
        </div>
      </div>

      <AskAIModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={async (message) => {
          try {
            setChatMessages(prev => [...prev, { role: 'user', content: message }]);
            await sendMessage(message);
          } catch (error) {
            console.error('Error sending message:', error);
            setChatMessages(prev => [...prev, 
              { role: 'ai', content: 'Sorry, I encountered an error processing your request.' }
            ]);
          }
        }}
        initialPrompt={selectedText}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleCreateNote}
      />

      <DiagramModal
        isOpen={showDiagramModal}
        onClose={() => setShowDiagramModal(false)}
        selectedText={selectedText}
      />
    </div>
  );
}

export default Home;
