import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";

const DEFAULT_ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];
const CALL_TIMEOUT_MS = 30000;

function getIceServers() {
  try {
    const value = import.meta.env.VITE_ICE_SERVERS;
    if (!value) return DEFAULT_ICE_SERVERS;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_ICE_SERVERS;
  } catch {
    return DEFAULT_ICE_SERVERS;
  }
}

const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const durationText = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function VoiceCallPanel() {
  const [call, setCall] = useState(null);
  const [status, setStatus] = useState("idle");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(0);

  const callRef = useRef(null);
  const statusRef = useRef("idle");
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pendingIceRef = useRef([]);
  const answerRequestedRef = useRef(false);
  const answeringRef = useRef(false);
  const answerSentRef = useRef(false);
  const applyingRemoteAnswerRef = useRef(false);
  const timeoutRef = useRef(null);
  const durationRef = useRef(null);

  useEffect(() => { statusRef.current = status; }, [status]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (durationRef.current) clearInterval(durationRef.current);
    timeoutRef.current = null;
    durationRef.current = null;
  }, []);

  const cleanup = useCallback((notify = false) => {
    const current = callRef.current;
    clearTimers();
    if (notify && current?.bookingId && current?.targetUserId) {
      emit("fixitnow-voice-call-end-send", { bookingId: current.bookingId, targetUserId: current.targetUserId, callId: current.callId });
    }
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    pendingIceRef.current = [];
    answerRequestedRef.current = false;
    answeringRef.current = false;
    answerSentRef.current = false;
    applyingRemoteAnswerRef.current = false;
    callRef.current = null;
    setCall(null);
    setStatus("idle");
    setMuted(false);
    setDuration(0);
    setError("");
  }, [clearTimers]);

  const armTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (["calling", "incoming", "connecting"].includes(statusRef.current)) {
        setError("The call could not connect. Check microphone permission and both internet connections.");
        setTimeout(() => cleanup(true), 1800);
      }
    }, CALL_TIMEOUT_MS);
  }, [cleanup]);

  const startTimer = useCallback(() => {
    if (durationRef.current) return;
    setDuration(0);
    durationRef.current = setInterval(() => setDuration((value) => value + 1), 1000);
  }, []);

  const getMicrophone = useCallback(async (pc) => {
    if (localStreamRef.current) return localStreamRef.current;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone calls require HTTPS and browser microphone support.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
      video: false,
    });
    localStreamRef.current = stream;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = true;
      pc.addTrack(track, stream);
    });
    return stream;
  }, []);

  const flushIce = useCallback(async (pc) => {
    const candidates = pendingIceRef.current.splice(0);
    for (const candidate of candidates) {
      try { await pc.addIceCandidate(candidate); } catch { /* stale candidate */ }
    }
  }, []);

  const createPeer = useCallback(async (current) => {
    pcRef.current?.close();
    const pc = new RTCPeerConnection({ iceServers: getIceServers() });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      emit("fixitnow-voice-call-signal-send", {
        bookingId: current.bookingId,
        targetUserId: current.targetUserId,
        callId: current.callId,
        signal: { type: "ice-candidate", candidate: event.candidate.toJSON() },
      });
    };

    pc.ontrack = (event) => {
      const stream = event.streams?.[0];
      if (!remoteAudioRef.current || !stream) return;
      remoteAudioRef.current.srcObject = stream;
      remoteAudioRef.current.volume = 1;
      remoteAudioRef.current.play().catch(() => {});
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        clearTimers();
        setStatus("connected");
        startTimer();
      } else if (["failed", "closed"].includes(pc.connectionState)) {
        setError("Voice connection was lost.");
        setTimeout(() => cleanup(false), 900);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") setError("Network negotiation failed. A TURN server may be required on restrictive networks.");
    };

    return pc;
  }, [cleanup, clearTimers, startTimer]);

  const acceptIncoming = useCallback(async (incoming) => {
    if (!incoming) return;
    answerRequestedRef.current = true;
    if (!incoming.offer) {
      setError("Preparing the call…");
      return;
    }
    if (answeringRef.current || answerSentRef.current) return;

    answeringRef.current = true;
    try {
      setError("");
      let pc = pcRef.current;
      if (!pc) pc = await createPeer(incoming);

      if (pc.signalingState !== "stable") {
        if (pc.signalingState !== "have-remote-offer") {
          throw new Error(`Call negotiation is already in progress (${pc.signalingState}).`);
        }
      } else {
        await pc.setRemoteDescription(incoming.offer);
      }

      if (pc.signalingState !== "have-remote-offer") {
        if (pc.remoteDescription?.type !== "offer") throw new Error("Incoming call offer is no longer valid.");
      }

      await getMicrophone(pc);
      await flushIce(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      answerSentRef.current = true;
      emit("fixitnow-voice-call-signal-send", {
        bookingId: incoming.bookingId,
        targetUserId: incoming.targetUserId,
        callId: incoming.callId,
        signal: { type: "answer", sdp: answer },
      });
      answerRequestedRef.current = false;
      setStatus("connecting");
      armTimeout();
    } catch (err) {
      setError(err?.name === "NotAllowedError" ? "Microphone permission was denied." : err?.message || "Could not answer the call.");
    } finally {
      answeringRef.current = false;
    }
  }, [armTimeout, createPeer, flushIce, getMicrophone]);

  const startOutgoing = useCallback(async (detail) => {
    try {
      setError("");
      const pc = await createPeer(detail);
      await getMicrophone(pc);
      setStatus("calling");
      armTimeout();
      emit("fixitnow-voice-call-start-send", { bookingId: detail.bookingId, targetUserId: detail.targetUserId, callId: detail.callId, participantName: detail.participantName });
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      emit("fixitnow-voice-call-signal-send", {
        bookingId: detail.bookingId,
        targetUserId: detail.targetUserId,
        callId: detail.callId,
        signal: { type: "offer", sdp: offer },
      });
    } catch (err) {
      setError(err?.name === "NotAllowedError" ? "Microphone permission was denied. Allow microphone access and try again." : err?.message || "Could not start the call.");
      setTimeout(() => cleanup(false), 1800);
    }
  }, [armTimeout, cleanup, createPeer, getMicrophone]);

  useEffect(() => {
    const onStart = (event) => {
      const detail = event.detail || {};
      if (!detail.bookingId || !detail.targetUserId || callRef.current) return;
      const callId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const next = { ...detail, callId, targetUserId: String(detail.targetUserId) };
      callRef.current = next;
      setCall(next);
      setStatus("calling");
      void startOutgoing(next);
    };

    const onIncoming = (event) => {
      const data = event.detail || {};
      if (!data.callId || callRef.current) return;
      const next = { ...data, targetUserId: String(data.callerId), offer: data.signal?.sdp || data.offer || null };
      callRef.current = next;
      setCall(next);
      setError("");
      setStatus("incoming");
      armTimeout();
    };

    const onSignal = async (event) => {
      const data = event.detail || {};
      const current = callRef.current;
      if (!current || data.callId !== current.callId || !data.signal) return;

      try {
        if (data.signal.type === "offer") {
          current.offer = data.signal.sdp;
          if (statusRef.current === "incoming" && answerRequestedRef.current) await acceptIncoming(current);
          return;
        }

        if (data.signal.type === "ice-candidate") {
          if (!pcRef.current || !pcRef.current.remoteDescription) pendingIceRef.current.push(data.signal.candidate);
          else await pcRef.current.addIceCandidate(data.signal.candidate);
          return;
        }

        if (data.signal.type === "answer") {
          const pc = pcRef.current;
          if (!pc || pc.signalingState !== "have-local-offer" || applyingRemoteAnswerRef.current) return;
          applyingRemoteAnswerRef.current = true;
          try {
            if (pc.signalingState !== "have-local-offer") return;
            await pc.setRemoteDescription(data.signal.sdp);
            await flushIce(pc);
            setStatus("connecting");
            armTimeout();
          } finally {
            applyingRemoteAnswerRef.current = false;
          }
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
  }, [acceptIncoming, armTimeout, cleanup, flushIce, startOutgoing]);

  const answer = () => void acceptIncoming(callRef.current);
  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks?.()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  if (!call) return <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />;

  const connected = status === "connected";
  const incoming = status === "incoming";
  const name = call.callerName || call.participantName || "Voice call";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <>
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md">
        <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-slate-900 via-slate-950 to-black px-6 py-8 text-white shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-orange-500/20 to-transparent" />
          <div className="relative text-center">
            <div className="mb-8 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
              <span>FixItNow Voice</span>
              <span className="flex items-center gap-1.5 normal-case tracking-normal"><span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "animate-pulse bg-orange-400"}`} />{connected ? "Connected" : incoming ? "Incoming" : "Connecting"}</span>
            </div>
            <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center">
              {!connected && <span className="absolute inset-0 animate-ping rounded-full bg-orange-500/10" />}
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-orange-400 to-orange-600 text-2xl font-bold shadow-[0_0_45px_rgba(249,115,22,0.25)]">{initials || <Phone size={28} />}</div>
            </div>
            <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
            <p className="mt-1 text-sm text-white/50">{connected ? durationText(duration) : incoming ? "Incoming voice call" : status === "calling" ? "Calling…" : "Connecting…"}</p>
            {error ? <div className="mx-auto mt-5 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-3 text-xs leading-5 text-red-200">{error}</div> : <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/35"><Volume2 size={14} /> Voice only · No camera</div>}
            <div className="mt-8 flex items-center justify-center gap-4">
              {connected && <button type="button" onClick={toggleMute} className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/10 transition hover:bg-white/15" aria-label={muted ? "Unmute microphone" : "Mute microphone"}>{muted ? <MicOff size={21} /> : <Mic size={21} />}</button>}
              {incoming && <button type="button" onClick={answer} disabled={answeringRef.current} className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition hover:scale-105 hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60" aria-label="Answer call"><Check size={25} /></button>}
              <button type="button" onClick={() => cleanup(true)} className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/25 transition hover:scale-105 hover:bg-red-400" aria-label="End call"><PhoneOff size={24} /></button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
