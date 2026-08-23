import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { messengerService } from "../services/messenger.js";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function shortPreview(value = "") {
  return value.length > 42 ? `${value.slice(0, 42)}…` : value;
}

export default function Messenger() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [booking, setBooking] = useState(null);
  const [text, setText] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const conversationsRequestRef = useRef(false);
  const messagesRequestRef = useRef(null);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0),
    [conversations],
  );

  const loadConversations = useCallback(async () => {
    if (
      !isAuthenticated ||
      !user?.type ||
      (user.type !== "customer" && user.type !== "worker") ||
      conversationsRequestRef.current
    ) {
      return;
    }

    conversationsRequestRef.current = true;
    setLoadingList(true);
    try {
      const response = await messengerService.getConversations();
      setConversations(response?.data || []);
      setError("");
    } catch (err) {
      setError(err?.message || "Unable to load messages.");
    } finally {
      conversationsRequestRef.current = false;
      setLoadingList(false);
    }
  }, [isAuthenticated, user?.type]);

  const loadMessages = useCallback(async (bookingId, markRead = true) => {
    if (!bookingId) return;

    const requestId = String(bookingId);
    if (messagesRequestRef.current === requestId) return;
    messagesRequestRef.current = requestId;
    setLoadingMessages(true);

    try {
      const response = await messengerService.getMessages(bookingId);
      setBooking(response?.data?.booking || null);
      setMessages(response?.data?.messages || []);
      setError("");

      if (markRead) {
        await messengerService.markRead(bookingId).catch(() => {});
        setConversations((current) =>
          current.map((item) =>
            String(item.bookingId) === String(bookingId)
              ? { ...item, unreadCount: 0 }
              : item,
          ),
        );
      }
    } catch (err) {
      setError(err?.message || "Unable to load this conversation.");
    } finally {
      messagesRequestRef.current = null;
      setLoadingMessages(false);
    }
  }, []);

  // Initial load only. New messages are delivered through the existing
  // AuthContext Socket.IO connection via fixitnow-notification-new.
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Real-time message handling. AuthContext already owns the single Socket.IO
  // connection and converts notification-new into this browser event, so the
  // messenger does not create another socket connection.
  useEffect(() => {
    const handleNotification = (event) => {
      const data = event.detail || {};
      if (data.type !== "message") return;

      const relatedBookingId = data.relatedEntityId || data.bookingId;
      if (
        selectedBookingId &&
        relatedBookingId &&
        String(relatedBookingId) === String(selectedBookingId)
      ) {
        // The conversation is open, so immediately fetch the new message and
        // mark it read. This keeps the active chat real-time without polling.
        loadMessages(selectedBookingId, true);
      } else {
        // Conversation is closed; refresh only the lightweight conversation
        // list so the unread badge and last-message preview update.
        loadConversations();
      }
    };

    window.addEventListener("fixitnow-notification-new", handleNotification);
    return () => window.removeEventListener("fixitnow-notification-new", handleNotification);
  }, [loadConversations, loadMessages, selectedBookingId]);

  useEffect(() => {
    if (!open) return;
    loadConversations();
  }, [open, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingMessages]);

  const openConversation = async (conversation) => {
    const bookingId = conversation.bookingId;
    setSelectedBookingId(bookingId);
    setError("");
    await loadMessages(bookingId);
  };

  const closeConversation = () => {
    setSelectedBookingId(null);
    setBooking(null);
    setMessages([]);
    setText("");
    setError("");
  };

  const send = async (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || !selectedBookingId || sending) return;

    setSending(true);
    setError("");
    try {
      const response = await messengerService.sendMessage(selectedBookingId, value);
      if (response?.data) {
        setMessages((current) => {
          const incomingId = String(response.data._id || "");
          if (incomingId && current.some((item) => String(item._id) === incomingId)) {
            return current;
          }
          return [...current, response.data];
        });
      }
      setText("");
      await loadConversations();
    } catch (err) {
      setError(err?.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated || (user?.type !== "customer" && user?.type !== "worker")) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 font-semibold text-white shadow-xl transition hover:bg-orange-600"
        aria-label="Open messages"
      >
        <span className="text-lg">💬</span>
        <span>Messages</span>
        {totalUnread > 0 && (
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-orange-600">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] bg-slate-950/45 p-3 sm:p-6" onMouseDown={() => setOpen(false)}>
          <div
            className="mx-auto flex h-[min(760px,calc(100vh-24px))] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <aside className={`w-full border-r border-slate-200 bg-slate-50 sm:w-[330px] ${selectedBookingId ? "hidden sm:block" : "block"}`}>
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Messages</h2>
                  <p className="text-xs text-slate-500">Customer ↔ Worker</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button>
              </div>

              <div className="h-[calc(100%-73px)] overflow-y-auto p-2">
                {loadingList && conversations.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">Loading conversations…</div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No conversations yet. Messaging becomes available after a worker is assigned to your booking.
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.bookingId}
                      type="button"
                      onClick={() => openConversation(conversation)}
                      className={`mb-1 w-full rounded-xl p-3 text-left transition ${selectedBookingId === conversation.bookingId ? "bg-orange-50" : "hover:bg-white"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">{conversation.participant?.name || (user.type === "customer" ? "Worker" : "Customer")}</div>
                          <div className="truncate text-xs text-slate-500">{conversation.serviceTitle || "Booking"}</div>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">{conversation.unreadCount}</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="truncate">{shortPreview(conversation.lastMessage?.text || "Start a conversation")}</span>
                        <span className="shrink-0">{formatTime(conversation.lastMessage?.createdAt)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className={`flex min-w-0 flex-1 flex-col ${selectedBookingId ? "flex" : "hidden sm:flex"}`}>
              {!selectedBookingId ? (
                <div className="flex h-full items-center justify-center p-8 text-center text-slate-500">
                  <div>
                    <div className="mb-3 text-4xl">💬</div>
                    <p className="font-semibold text-slate-700">Select a conversation</p>
                    <p className="mt-1 text-sm">Your customer/worker messages will appear here.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
                    <button type="button" onClick={closeConversation} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 sm:hidden">←</button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-lg">👤</div>
                    <div className="min-w-0">
                      <div className="truncate font-bold text-slate-900">{booking?.participant?.name || (user.type === "customer" ? "Worker" : "Customer")}</div>
                      <div className="truncate text-xs text-slate-500">{booking?.serviceTitle || "Booking"} · {booking?.status || ""}</div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
                    {loadingMessages ? (
                      <div className="text-center text-sm text-slate-500">Loading messages…</div>
                    ) : messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">No messages yet.<br />Say hello 👋</div>
                    ) : (
                      messages.map((message) => {
                        const mine = String(message.senderId) === String(user?._id || user?.id);
                        return (
                          <div key={String(message._id)} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine ? "rounded-br-md bg-orange-500 text-white" : "rounded-bl-md bg-white text-slate-800"}`}>
                              <div className="whitespace-pre-wrap break-words">{message.text}</div>
                              <div className={`mt-1 text-[10px] ${mine ? "text-orange-100" : "text-slate-400"}`}>{formatTime(message.createdAt)}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {error && <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">{error}</div>}

                  {booking?.status === "completed" ? (
                    <div className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
                      This booking is completed. Messaging is closed.
                    </div>
                  ) : (
                    <form onSubmit={send} className="flex gap-2 border-t border-slate-200 bg-white p-3">
                      <input
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        maxLength={2000}
                        placeholder="Type a message…"
                        className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                      <button type="submit" disabled={!text.trim() || sending} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
                        {sending ? "…" : "Send"}
                      </button>
                    </form>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
