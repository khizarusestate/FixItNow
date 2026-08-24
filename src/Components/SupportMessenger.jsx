import { useCallback, useEffect, useRef, useState } from "react";
import { Headset, MessageCircle, Send, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supportMessengerService } from "../services/supportMessenger.js";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function SupportMessenger() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  const loadConversation = useCallback(async () => {
    if (!isAuthenticated || !["customer", "worker"].includes(user?.type)) return;
    try {
      setLoading(true);
      const response = await supportMessengerService.getConversation();
      const conversation = response?.data?.[0];
      if (!conversation?.id) return;
      setConversationId(String(conversation.id));
      const detail = await supportMessengerService.getMessages(conversation.id);
      setMessages(detail?.data?.messages || []);
      await supportMessengerService.markRead(conversation.id).catch(() => {});
      setError("");
    } catch (err) {
      setError(err?.message || "Unable to load support chat.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.type]);

  useEffect(() => {
    if (!open) return undefined;
    loadConversation();
    const timer = window.setInterval(loadConversation, 5000);
    return () => window.clearInterval(timer);
  }, [open, loadConversation]);

  useEffect(() => {
    const onNotification = (event) => {
      if (event.detail?.type === "support-message" && open) loadConversation();
    };
    window.addEventListener("fixitnow-notification-new", onNotification);
    return () => window.removeEventListener("fixitnow-notification-new", onNotification);
  }, [open, loadConversation]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || !conversationId || sending) return;
    try {
      setSending(true);
      const response = await supportMessengerService.sendMessage(conversationId, value);
      if (response?.data) setMessages((current) => [...current, response.data]);
      setText("");
      setError("");
    } catch (err) {
      setError(err?.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated || !["customer", "worker"].includes(user?.type)) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600"
        aria-label="Contact admin support"
      >
        <Headset size={18} /> Support
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] bg-slate-950/45 p-3 sm:p-6" onMouseDown={() => setOpen(false)}>
          <div className="mx-auto flex h-[min(760px,calc(100vh-24px))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600"><Headset size={20} /></div>
              <div className="flex-1"><div className="font-bold text-slate-900">FixItNow Support</div><div className="text-xs text-slate-500">Chat with an admin</div></div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={19} /></button>
            </header>

            <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
              {loading && messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading support chat…</div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center text-sm text-slate-500"><div><MessageCircle size={32} className="mx-auto mb-2 text-slate-300" /><div className="font-semibold text-slate-700">Need help?</div><div className="mt-1">Send a message to FixItNow support.</div></div></div>
              ) : messages.map((message) => {
                const mine = String(message.senderId) === String(user?._id || user?.id);
                return <div key={String(message._id)} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine ? "rounded-br-md bg-orange-500 text-white" : "rounded-bl-md bg-white text-slate-800"}`}><div className="whitespace-pre-wrap break-words">{message.text}</div><div className={`mt-1 text-[10px] ${mine ? "text-orange-100" : "text-slate-400"}`}>{formatTime(message.createdAt)}</div></div></div>;
              })}
              <div ref={endRef} />
            </div>

            {error && <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">{error}</div>}
            <form onSubmit={send} className="flex gap-2 border-t border-slate-200 bg-white p-3">
              <input value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} placeholder="Type a message…" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
              <button type="submit" disabled={!text.trim() || sending || !conversationId} className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message"><Send size={17} /></button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
