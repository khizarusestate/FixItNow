import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  PhoneCall,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { messengerService } from "../services/messenger.js";
import VoiceCallPanel from "./VoiceCallPanel.jsx";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Messenger() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [booking, setBooking] = useState(null);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const messagesRequestRef = useRef(null);

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
      }
    } catch (err) {
      setError(err?.message || "Unable to load this conversation.");
    } finally {
      messagesRequestRef.current = null;
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    const openBooking = (event) => {
      const bookingId = event.detail?.bookingId;
      if (!bookingId) return;

      setOpen(true);
      setSelectedBookingId(String(bookingId));
      setMessages([]);
      setBooking(null);
      setText("");
      setError("");
      loadMessages(String(bookingId));
    };

    window.addEventListener("fixitnow-open-messenger", openBooking);
    return () => window.removeEventListener("fixitnow-open-messenger", openBooking);
  }, [loadMessages]);

  // AuthContext owns the single Socket.IO connection. The messenger only
  // reacts to message notifications for the currently open booking.
  useEffect(() => {
    const handleNotification = (event) => {
      const data = event.detail || {};
      if (data.type !== "message" || !selectedBookingId) return;

      const relatedBookingId = data.relatedEntityId || data.bookingId;
      if (String(relatedBookingId) === String(selectedBookingId)) {
        loadMessages(selectedBookingId, true);
      }
    };

    window.addEventListener("fixitnow-notification-new", handleNotification);
    return () => window.removeEventListener("fixitnow-notification-new", handleNotification);
  }, [loadMessages, selectedBookingId]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingMessages, open]);

  const closeMessenger = () => {
    setOpen(false);
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
    } catch (err) {
      setError(err?.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated || (user?.type !== "customer" && user?.type !== "worker")) return null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[80] bg-slate-950/45 p-3 sm:p-6"
          onMouseDown={closeMessenger}
        >
          <div
            className="mx-auto flex h-[min(760px,calc(100vh-24px))] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <section className="flex min-w-0 flex-1 flex-col">
              {!selectedBookingId ? (
                <div className="flex h-full items-center justify-center p-8 text-center text-slate-500">
                  <div>
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                      <MessageCircle size={24} />
                    </div>
                    <p className="font-semibold text-slate-700">Open a booking chat</p>
                    <p className="mt-1 text-sm">Start a conversation from one of your assigned bookings.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
                    <button
                      type="button"
                      onClick={closeMessenger}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      aria-label="Close chat"
                    >
                      <ArrowLeft size={19} />
                    </button>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      <UserRound size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-slate-900">
                        {booking?.participant?.name || (user.type === "customer" ? "Worker" : "Customer")}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {booking?.serviceTitle || "Booking"} · {booking?.status || ""}
                      </div>
                    </div>

                    {booking?.participant?.id && booking?.status !== "completed" && (
                      <button
                        type="button"
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("fixitnow-start-voice-call", {
                              detail: {
                                bookingId: String(booking.id),
                                targetUserId: String(booking.participant.id),
                                participantName:
                                  booking.participant.name ||
                                  (user.type === "customer" ? "Worker" : "Customer"),
                              },
                            }),
                          )
                        }
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                        title="Start voice call"
                      >
                        <PhoneCall size={15} />
                        Call
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={closeMessenger}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Close chat"
                    >
                      <X size={19} />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
                    {loadingMessages ? (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        Loading messages…
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                        <div>
                          <MessageCircle size={30} className="mx-auto mb-2 text-slate-300" />
                          <div>No messages yet.</div>
                          <div className="mt-1">Start the conversation below.</div>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const mine = String(message.senderId) === String(user?._id || user?.id);
                        return (
                          <div key={String(message._id)} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                                mine
                                  ? "rounded-br-md bg-orange-500 text-white"
                                  : "rounded-bl-md bg-white text-slate-800"
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words">{message.text}</div>
                              <div className={`mt-1 text-[10px] ${mine ? "text-orange-100" : "text-slate-400"}`}>
                                {formatTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {error && (
                    <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
                      {error}
                    </div>
                  )}

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
                      <button
                        type="submit"
                        disabled={!text.trim() || sending}
                        className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Send message"
                        title="Send message"
                      >
                        <Send size={17} />
                      </button>
                    </form>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      )}
      <VoiceCallPanel />
    </>
  );
}
