import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, PhoneCall, PhoneIncoming, PhoneOff } from "lucide-react";

const DEFAULT_ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

function iceServers() {
  try {
    const raw = import.meta.env.VITE_ICE_SERVERS;
    if (!raw) return DEFAULT_ICE_SERVERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_ICE_SERVERS;
  } catch {
    return DEFAULT_ICE_SERVERS;
  }
}

function signal(detail) {
  window.dispatchEvent(new CustomEvent("fixitnow-voice-call-signal-send", { detail }));
}

export default function VoiceCallPanel() {
  const [call, setCall] = useState(null);
  const [status, setStatus] = useState("idle");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const callRef = useRef(null);
  const statusRef = useRef("idle");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const cleanup = useCallback((notify = false) => {
    const current = callRef.current;
    if (notify && current?.bookingId && current?.targetUserId) {
      window.dispatchEvent(new CustomEvent("fixitnow-voice-call-end-send", { detail: {
        bookingId: current.bookingId,
        targetUserId: current.targetUserId,
        callId: current.callId,
      }}));
    }
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    pendingCandidatesRef.current = [];
    callRef.current = null;
    setCall(null);
    setStatus("idle");
    setMuted(false);
    setError("");
  }, []);

  const createPeer = useCallback(async (currentCall) => {
    const pc = new RTCPeerConnection({ iceServers: iceServers() });
    pcRef.current = pc;
    pc.onicecandidate = (event) => {
      if (event.candidate) signal({
        bookingId: currentCall.bookingId,
        targetUserId: currentCall.targetUserId,
        callId: currentCall.callId,
        signal: { type: "ice-candidate", candidate: event.candidate.toJSON() },
      });
    };
    pc.ontrack = (event) => {
      const stream = event.streams?.[0];
      if (remoteAudioRef.current && stream) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => {});
      }
    };
    pc.onconnectionstatechange = () => {
      if (["connected"].includes(pc.connectionState)) setStatus("connected");
      if (["failed", "closed"].includes(pc.connectionState)) cleanup(false);
    };
    return pc;
  }, [cleanup]);

  const ensureLocalAudio = useCallback(async (pc) => {
    if (streamRef.current) return streamRef.current;
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone calls require a secure HTTPS connection and browser microphone support.");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    streamRef.current = stream;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    return stream;
  }, []);

  const flushCandidates = useCallback(async (pc) => {
    const pending = pendingCandidatesRef.current.splice(0);
    for (const candidate of pending) {
      try { await pc.addIceCandidate(candidate); } catch { /* stale candidate */ }
    }
  }, []);

  const acceptIncoming = useCallback(async (incoming) => {
    try {
      setError("");
      const pc = await createPeer(incoming);
      await pc.setRemoteDescription(incoming.offer);
      await ensureLocalAudio(pc);
      await flushCandidates(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signal({ bookingId: incoming.bookingId, targetUserId: incoming.targetUserId, callId: incoming.callId, signal: { type: "answer", sdp: answer } });
      setStatus("connecting");
    } catch (err) {
      setError(err?.message || "Could not answer the call.");
    }
  }, [createPeer, ensureLocalAudio, flushCandidates]);

  const startOutgoing = useCallback(async (detail) => {
    try {
      setError("");
      const pc = await createPeer(detail);
      await ensureLocalAudio(pc);
      setStatus("calling");
      window.dispatchEvent(new CustomEvent("fixitnow-voice-call-start-send", { detail: {
        bookingId: detail.bookingId,
        targetUserId: detail.targetUserId,
        callId: detail.callId,
      }}));
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      signal({ bookingId: detail.bookingId, targetUserId: detail.targetUserId, callId: detail.callId, signal: { type: "offer", sdp: offer } });
    } catch (err) {
      setError(err?.message || "Could not start the call.");
      cleanup(false);
    }
  }, [cleanup, createPeer, ensureLocalAudio]);

  useEffect(() => {
    const onStart = (event) => {
      const detail = event.detail || {};
      if (!detail.bookingId || !detail.targetUserId || callRef.current) return;
      const callId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const next = { ...detail, callId, targetUserId: String(detail.targetUserId) };
      callRef.current = next;
      setCall(next);
      startOutgoing(next);
    };
    const onIncoming = (event) => {
      const data = event.detail || {};
      if (!data.callId || callRef.current) return;
      const next = { ...data, targetUserId: String(data.callerId), offer: data.signal?.sdp || data.offer };
      callRef.current = next;
      setCall(next);
      setStatus("incoming");
    };
    const onSignal = async (event) => {
      const data = event.detail || {};
      const current = callRef.current;
      if (!current || data.callId !== current.callId) return;
      if (!data.signal) return;
      if (data.signal.type === "ice-candidate" && !pcRef.current) {
        pendingCandidatesRef.current.push(data.signal.candidate);
        return;
      }
      const pc = pcRef.current;
      if (!pc) return;
      try {
        if (data.signal.type === "offer") {
          current.offer = data.signal.sdp;
          if (statusRef.current === "incoming") await acceptIncoming(current);
          return;
        }
        if (data.signal.type === "answer") {
          await pc.setRemoteDescription(data.signal.sdp);
          await flushCandidates(pc);
          setStatus("connecting");
          return;
        }
        if (data.signal.type === "ice-candidate") {
          const candidate = data.signal.candidate;
          if (pc.remoteDescription) await pc.addIceCandidate(candidate);
          else pendingCandidatesRef.current.push(candidate);
        }
      } catch (err) {
        setError(err?.message || "Voice connection negotiation failed.");
      }
    };
    const onEnded = (event) => {
      const data = event.detail || {};
      if (callRef.current && (!data.callId || data.callId === callRef.current.callId)) cleanup(false);
    };
    const onError = (event) => setError(event.detail?.message || "Voice call failed.");

    window.addEventListener("fixitnow-start-voice-call", onStart);
    window.addEventListener("fixitnow-voice-call-incoming", onIncoming);
    window.addEventListener("fixitnow-voice-call-signal", onSignal);
    window.addEventListener("fixitnow-voice-call-ended", onEnded);
    window.addEventListener("fixitnow-voice-call-error", onError);
    return () => {
      window.removeEventListener("fixitnow-start-voice-call", onStart);
      window.removeEventListener("fixitnow-voice-call-incoming", onIncoming);
      window.removeEventListener("fixitnow-voice-call-signal", onSignal);
      window.removeEventListener("fixitnow-voice-call-ended", onEnded);
      window.removeEventListener("fixitnow-voice-call-error", onError);
      cleanup(false);
    };
  }, [acceptIncoming, cleanup, flushCandidates, startOutgoing]);

  const answer = async () => {
    const current = callRef.current;
    if (!current?.offer) return;
    await acceptIncoming(current);
  };

  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks?.()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  if (!call) return <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />;

  return (
    <>
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      <div className="fixed inset-x-4 bottom-5 z-[120] mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            {status === "incoming" ? <PhoneIncoming size={20} /> : <PhoneCall size={20} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-slate-900">{call.callerName || call.participantName || "Voice call"}</p>
            <p className="text-xs text-slate-500">{status === "incoming" ? "Incoming voice call" : status === "connected" ? "Connected" : "Calling…"}</p>
          </div>
          {status === "connected" && (
            <button type="button" onClick={toggleMute} className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label={muted ? "Unmute microphone" : "Mute microphone"}>
              {muted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
        </div>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <div className="mt-3 flex gap-2">
          {status === "incoming" && (
            <button type="button" onClick={answer} className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Answer</button>
          )}
          {status !== "connected" && status !== "incoming" && (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-600"><Loader2 size={16} className="animate-spin" />Connecting</div>
          )}
          <button type="button" onClick={() => cleanup(true)} className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"><PhoneOff size={16} className="mr-1 inline" />End call</button>
        </div>
      </div>
    </>
  );
}
