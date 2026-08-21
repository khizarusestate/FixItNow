import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Loader2, X, MessageCircle } from "lucide-react";
import { aiService } from "../services/api.js";

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hello! I'm FixItNow AI Assistant. How can I help you today?",
};

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await aiService.chat(
        updatedMessages.map((message) => ({ role: message.role, content: message.content }))
      );
      const assistantContent =
        response?.message || response?.reply || response?.data?.message ||
        response?.data?.reply || "Sorry, I couldn't generate a response.";
      setMessages((current) => [...current, { role: "assistant", content: assistantContent }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: error?.message || "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button type="button" onClick={() => setIsOpen(true)} aria-label="Open FixItNow AI Assistant"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-105">
          <MessageCircle size={26} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[min(620px,calc(100vh-48px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2"><Bot size={22} /><span className="font-semibold">FixItNow AI Assistant</span></div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close AI Assistant" className="rounded p-1 hover:bg-white/10"><X size={20} /></button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role !== "user" && <Bot size={18} className="mt-1 shrink-0 text-blue-600" />}
                <div className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${message.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-800 shadow-sm"}`}>{message.content}</div>
                {message.role === "user" && <User size={18} className="mt-1 shrink-0 text-blue-600" />}
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-sm text-gray-500"><Bot size={18} className="text-blue-600" /><Loader2 size={16} className="animate-spin" />Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t bg-white p-3">
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} disabled={loading}
              placeholder="Ask FixItNow AI..." className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-50"><Send size={18} /></button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChat;
