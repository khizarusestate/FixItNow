import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Radio } from "lucide-react";
import { SOCKET_URL } from "../../config/env.js";
import { apiRequestWithAuth } from "../../services/api.js";
import { getToken } from "../../utils/jwt.js";

const ACTIVE_STATUSES = new Set(["worker-assigned", "in-progress"]);

function isValidPoint(point) {
  return Number.isFinite(Number(point?.latitude)) && Number.isFinite(Number(point?.longitude));
}

export default function LiveWorkerTracking({ bookingId }) {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const workerMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!bookingId) return undefined;
    let cancelled = false;

    const loadInitial = async () => {
      try {
        const response = await apiRequestWithAuth(`/live-tracking/customer/${bookingId}`, { role: "customer" });
        if (!cancelled) setData(response?.data || null);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Unable to load live tracking.");
      }
    };

    loadInitial();
    return () => { cancelled = true; };
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) return undefined;
    const token = getToken("customer");
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
    });

    socket.on("connect", () => socket.emit("join-user", { token }));
    socket.on("worker-location-update", (location) => {
      if (String(location?.bookingId) !== String(bookingId)) return;
      setData((current) => ({
        ...(current || {}),
        active: true,
        status: location.status || current?.status,
        worker: location,
      }));
      setLastUpdated(location.updatedAt || new Date().toISOString());
    });

    return () => socket.disconnect();
  }, [bookingId]);

  useEffect(() => {
    if (!mapNodeRef.current || !data?.destination || !isValidPoint(data.destination)) return undefined;

    const destination = [Number(data.destination.latitude), Number(data.destination.longitude)];
    const worker = isValidPoint(data.worker)
      ? [Number(data.worker.latitude), Number(data.worker.longitude)]
      : null;

    if (!mapRef.current) {
      const map = L.map(mapNodeRef.current, { zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
    }

    const map = mapRef.current;
    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = L.circleMarker(destination, { radius: 9, weight: 3 })
        .bindPopup("Your service location")
        .addTo(map);
    } else {
      destinationMarkerRef.current.setLatLng(destination);
    }

    if (worker) {
      if (!workerMarkerRef.current) {
        workerMarkerRef.current = L.circleMarker(worker, { radius: 10, weight: 3 })
          .bindPopup("Worker — live location")
          .addTo(map);
      } else {
        workerMarkerRef.current.setLatLng(worker);
      }
    }

    map.fitBounds(L.latLngBounds(worker ? [destination, worker] : [destination]), {
      padding: [35, 35],
      maxZoom: 15,
    });

    return undefined;
  }, [data]);

  useEffect(() => () => {
    if (mapRef.current) mapRef.current.remove();
    mapRef.current = null;
    workerMarkerRef.current = null;
    destinationMarkerRef.current = null;
  }, []);

  if (!data || !ACTIVE_STATUSES.has(data.status)) return null;

  if (!data.destination || !isValidPoint(data.destination)) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Live tracking is active, but this booking does not have a map coordinate.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Radio size={17} className="text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-slate-900">Live worker tracking</p>
            <p className="text-xs text-slate-500">
              {data.worker ? "Worker location is updating in real time." : "Waiting for the worker's GPS location…"}
            </p>
          </div>
        </div>
        {lastUpdated || data.worker?.updatedAt ? (
          <span className="text-[11px] text-slate-400 whitespace-nowrap">
            {new Date(lastUpdated || data.worker.updatedAt).toLocaleTimeString("en-PK", {
              hour: "2-digit", minute: "2-digit", second: "2-digit",
            })}
          </span>
        ) : null}
      </div>
      <div ref={mapNodeRef} className="h-72 w-full" />
      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Navigation size={15} className="text-orange-500" />
          <span>Your service location</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <MapPin size={15} className="text-emerald-600" />
          <span>{data.worker ? "Worker live location" : "Worker location pending"}</span>
        </div>
      </div>
      {error ? <p className="px-4 pb-3 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
