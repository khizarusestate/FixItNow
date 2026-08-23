import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Loader2,
  Mic,
  MicOff,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Volume2,
} from "lucide-react";

const DEFAULT_ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];
const CALL_TIMEOUT_MS = 30000;

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

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remaining = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

export default function VoiceCallPanel() {
  const [call, setCall] = useState(null);
  const [status, setStatus] = useState("idle");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(0);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const callRef = useRef(null);
  const statusRef = useRef("idle");
  const timeoutRef = useRef(null);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    timeoutRef.current = null;
    durationIntervalRef.current = null;
  }, []);

  const startDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) return;
    setDuration(0);
    durationIntervalRef.current = setInterval(() => setDuration((value) => value + 1), 1000);
  }, []);

  const cleanup = useCallback((notify = false) => {
    const current = callRef.current;
    clearTimers();
    if (notify && current?.bookingId && current?.targetUserId) {
      window.dispatchEvent(
        new CustomEvent("fixitnow-voice-call-end-send", {
          detail: {
            bookingId: current.bookingId,
            targetUserId: current.targetUserId,
            callId: current.callId,
          },
        }),
      );
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
    setDuration(0);
    setError("");
  }, [clearTimers]);

  const armConnectionTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (["calling", "connecting", "incoming"].includes(statusRef.current)) {
        setError("The call could not connect. Please check both users are online and try again.");
        setTimeout(() => cleanup(true), 1800);
      }
    }, CALL_TIMEOUT_MS);
  }, [cleanup]);

  const createPeer = useCallback(async (currentCall) => {
    const pc = new RTCPeerConnection({ iceServers: iceServers() });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signal({
          bookingId: currentCall.bookingId,
          targetUserId: currentCall.targetUserId,
          callId: currentCall.callId,
          signal: { type: "ice-candidate", candidate: event.candidate.toJSON() },
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams?.[0];
      if (remoteAudioRef.current && stream) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        clearTimers();
        setStatus("connected");
        startDurationTimer();
      }
      if (["failed", "closed"].includes(pc.connectionState)) {
        setError("Voice connection was lost.");
        setTimeout(() => cleanup(false), 900);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        setError("Network negotiation failed. Please try the call again.");
      }
    };

    return pc;
  }, [cleanup, clearTimers, startDurationTimer]);

  const ensureLocalAudio = useCallback(async (pc) => {
    if (streamRef.current) return streamRef.current;
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone calls require HTTPS and browser microphone support.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    streamRef.current = stream;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    return stream;
  }, []);

  const flushCandidates = useCallback(async (pc) => {
    const pending = pendingCandidatesRef.current.splice(0);
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        // Ignore stale candidates from a closed negotiation.
      }
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
      signal({
        bookingId: incoming.bookingId,
        targetUserId: incoming.targetUserId,
        callId: incoming.callId,
        signal: { type: "answer", sdp: answer },
      });
      setStatus("connecting");
      armConnectionTimeout();
    } catch (err) {
      setError(err?.message || "Could not answer the call.");
    }
  }, [armConnectionTimeout, createPeer, ensureLocalAudio, flushCandidates]);

  const startOutgoing = useCallback(async (detail) => {
    try {
      setError("");
      const pc = await createPeer(detail);
      await ensureLocalAudio(pc);
      setStatus("calling");
      armConnectionTimeout();
      window.dispatchEvent(
        new CustomEvent("fixitnow-voice-call-start-send", {
          detail: {
            bookingId: detail.bookingId,
            targetUserId: detail.targetUserId,
            callId: detail.callId,
            participantName: detail.participantName,
          },
        }),
      );
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      signal({
        bookingId: detail.bookingId,
        targetUserId: detail.targetUserId,
        callId: detail.callId,
        signal: { type: "offer", sdp: offer },
      });
    } catch (err) {
      setError(err?.message || "Could not start the call.");
      setTimeout(() => cleanup(false), 1200);
    }
  }, [armConnectionTimeout, cleanup, createPeer, ensureLocalAudio]);

  useEffect(() => {
    const onStart = (event) => {
      const detail = event.detail || {};
      if (!detail.bookingId || !detail.targetUserId || callRef.current) return;
      const callId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const next = { ...detail, callId, targetUserId: String(detail.targetUserId) };
      callRef.current = next;
      setCall(next);
      setStatus("calling");
      startOutgoing(next);
    };

    const onIncoming = (event) => {
      const data = event.detail || {};
      if (!data.callId || callRef.current) return;
      const next = {
        ...data,
        targetUserId: String(data.callerId),
        offer: data.signal?.sdp || data.offer,
      };
      callRef.current = next;
      setCall(next);
      setStatus("incoming");
      armConnectionTimeout();
    };

    const onSignal = async (event) => {
      const data = event.detail || {};
      const current = callRef.current;
      if (!current || data.callId !== current.callId || !data.signal) return;

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
          armConnectionTimeout();
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

    const onError = (event) => {
      setError(event.detail?.message || "Voice call failed.");
      setTimeout(() => cleanup(false), 1500);
    };

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
  }, [acceptIncoming, armConnectionTimeout, cleanup, flushCandidates, startOutgoing]);

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

  const isConnected = status === "connected";
  const isIncoming = status === "incoming";
  const displayName = call.callerName || call.participantName || "Voice call";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
        <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-orange-500/20 to-transparent" />

          <div className="relative px-6 pb-7 pt-8 text-center">
            <div className="mb-7 flex items-center justify-between">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                FixItNow Voice
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400" : "animate-pulse bg-orange-400"}`} />
                {isConnected ? "Secure connection" : "Connecting"}
              </div>
            </div>

            <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center">
              {!isConnected && <span className="absolute inset-0 animate-ping rounded-full bg-orange-500/10" />}
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-orange-400 to-orange-600 text-2xl font-bold shadow-[0_0_45px_rgba(249,115,22,0.25)]">
                {initials || <PhoneCall size={28} />}
              </div>
            </div>

            <h3 className="text-2xl font-bold tracking-tight">{displayName}</h3>
            <p className="mt-1 text-sm text-white/50">
              {isConnected
                ? formatDuration(duration)
                : isIncoming
                  ? "Incoming voice call"
                  : status === "calling"
                    ? "Calling…"
                    : "Connecting…"}
            </p>

            {error ? (
              <div className="mx-auto mt-5 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-3 text-xs leading-5 text-red-200">
                {error}
              </div>
            ) : (
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/35">
                <Volume2 size={14} />
                Voice only · No camera
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-4">
              {isConnected && (
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                  aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <MicOff size={21} /> : <Mic size={21} />}
                </button>
              )}

              {isIncoming && (
                <button
                  type="button"
                  onClick={answer}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition hover:scale-105 hover:bg-emerald-400"
                  aria-label="Answer call"
                  title="Answer"
                >
                  <Check size={25} />
                </button>
              )}

              {!isConnected && !isIncoming && !error && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10">
                  <Loader2 size={24} className="animate-spin text-orange-300" />
                </div>
              )}

              <button
                type="button"
                onClick={() => cleanup(true)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/25 transition hover:scale-105 hover:bg-red-400"
                aria-label="End call"
                title="End call"
              >
                <PhoneOff size={23} />
              </button>
            </div>

            <p className="mt-7 text-[10px] uppercase tracking-[0.18em] text-white/25">
              Booking-secured voice channel
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
