import { FiX, FiSend, FiMessageSquare } from "react-icons/fi";
import { Portal } from "./Portal";

type Message = {
  role: "user" | "ai";
  content: string;
};

type AskAIModalProps = {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  initialPrompt?: string;
};

export function AskAIModal({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  initialPrompt,
}: AskAIModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-[99999]"
        onClick={onClose}
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md pointer-events-none" />
        <div 
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[450px] bg-dark-surface/95 rounded-2xl border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FiMessageSquare className="text-maya" size={18} />
              <h2 className="text-base font-medium text-white">Ask AI Assistant</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <FiX size={18} className="text-white/70" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-[400px] overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 text-sm rounded-2xl ${
                    message.role === "user"
                      ? "bg-maya/20 text-white ml-4"
                      : "bg-white/10 text-white/90 mr-4"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem("message") as HTMLInputElement;
                if (input.value.trim()) {
                  onSendMessage(input.value);
                  input.value = "";
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                name="message"
                defaultValue={initialPrompt}
                placeholder="Type your message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-maya/50"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-maya/60 hover:bg-maya/70 text-white text-sm rounded-xl flex items-center gap-2 transition-colors font-medium"
              >
                <FiSend size={14} />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
}