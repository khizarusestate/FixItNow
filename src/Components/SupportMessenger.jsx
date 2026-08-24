import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supportMessengerService } from "../services/supportMessenger.js";

export default function SupportMessenger() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  const load = async (id) => {
    setLoading(true);
    try {
      const response = await supportMessengerService.getMessages(id);
      setMessages(response?.data?.messages || []);
      await supportMessengerService.markRead(id).catch(() => {});
      setError("");
    } catch (err) {
      setError(err?.message || "Unable to load support chat.");
    } finally {
      setLoading(false);
    }
  };

  const openChat = async () => {
    setOpen(true);
    setError("");
    try {
      const response = await supportMessengerService.open();
      const id = response?.data?.conversationId;
      if (!id) throw new Error("Support conversation could not be opened.");
      setConversationId(String(id));
      await load(String(id));
    } catch (err) {
      setError(err?.message || "Unable to open support chat.");
    }
  };

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || !conversationId || sending) return;
    setSending(true);
    try {
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
      <button type="button" onClick={openChat} className="fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-orange-600">
        <MessageCircle size={18} /> Contact Admin
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] bg-slate-950/45 p-3 sm:p-6" onMouseDown={() => setOpen(false)}>
          <div className="mx-auto flex h-[min(700px,calc(100vh-24px))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div><div className="font-bold text-slate-900">FixItNow Support</div><div className="text-xs text-slate-500">Chat with an administrator</div></div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={19} /></button>
            </header>
            <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
              {loading ? <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading…</div> : messages.map((message) => {
                const mine = String(message.senderId) === String(user?._id || user?.id);
                return <div key={String(message._id)} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${mine ? "rounded-br-md bg-orange-500 text-white" : "rounded-bl-md bg-white text-slate-800 shadow-sm"}`}><div className="whitespace-pre-wrap break-words">{message.text}</div></div></div>;
              })}
              {!loading && messages.length === 0 && <div className="flex h-full items-center justify-center text-sm text-slate-500">Start a conversation with support.</div>}
              <div ref={endRef} />
            </div>
            {error && <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">{error}</div>}
            <form onSubmit={send} className="flex gap-2 border-t border-slate-200 bg-white p-3">
              <input value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} placeholder="Type a message…" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" />
              <button type="submit" disabled={!text.trim() || sending || !conversationId} className="rounded-xl bg-orange-500 px-4 py-3 text-white disabled:opacity-50"><Send size={17} /></button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
