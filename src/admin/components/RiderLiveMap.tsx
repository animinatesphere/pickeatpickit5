/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import api, { getAdminWebSocketUrl } from "../../services/api";
import { animateGoogleMarker, loadGoogleMaps } from "../../services/googleMaps";

type Props = { riderId?: string; orderId?: string; className?: string };

const utcTimestampMs = (value?: string | null) => {
  if (!value) return null;
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`;
  const timestamp = Date.parse(normalized);
  return Number.isFinite(timestamp) ? timestamp : null;
};

export default function RiderLiveMap({ riderId, orderId, className = "" }: Props) {
  const [tracking, setTracking] = useState<any>(null);
  const [trackingError, setTrackingError] = useState("");
  const [mapError, setMapError] = useState("");
  const [connected, setConnected] = useState(false);
  const [, setClock] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const riderMarker = useRef<any>(null);
  const destinationMarker = useRef<any>(null);
  const connectedRef = useRef(false);
  const endpoint = orderId ? `/admin/orders/${orderId}/live-location` : `/admin/riders/${riderId}/live-location`;
  const topic = orderId ? `order_location:${orderId}` : `rider_location:${riderId}`;

  useEffect(() => {
    const timer = window.setInterval(() => setClock((value) => value + 1), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await api.get(endpoint);
        if (!cancelled) { setTracking(response.data); setTrackingError(""); }
      } catch (error: any) {
        if (!cancelled) setTrackingError(error.response?.data?.detail || "Live rider location unavailable");
      }
    };
    void load();
    const fallback = window.setInterval(() => {
      if (!connectedRef.current) void load();
    }, 60000);
    return () => { cancelled = true; window.clearInterval(fallback); };
  }, [endpoint]);

  useEffect(() => {
    if (!localStorage.getItem("authToken")) return;
    let socket: WebSocket | null = null;
    let retryTimer: number | null = null;
    let pingTimer: number | null = null;
    let stopped = false;

    const connect = () => {
      const currentToken = localStorage.getItem("authToken");
      if (!currentToken) return;
      socket = new WebSocket(`${getAdminWebSocketUrl()}?token=${encodeURIComponent(currentToken)}`);
      socket.onopen = () => {
        connectedRef.current = true;
        setConnected(true);
        socket?.send(JSON.stringify({ type: "subscribe", topic }));
        pingTimer = window.setInterval(() => socket?.readyState === WebSocket.OPEN && socket.send(JSON.stringify({ type: "ping" })), 25000);
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "rider_location" && message.rider?.id) {
            setTracking((current: any) => ({ ...(current || {}), ...message, rider: { ...(current?.rider || {}), ...message.rider } }));
            setTrackingError("");
          }
        } catch { /* Ignore malformed non-location messages. */ }
      };
      socket.onclose = () => {
        connectedRef.current = false;
        setConnected(false);
        if (pingTimer) window.clearInterval(pingTimer);
        if (!stopped) retryTimer = window.setTimeout(connect, 3000);
      };
      socket.onerror = () => socket?.close();
    };
    connect();
    return () => {
      stopped = true;
      connectedRef.current = false;
      if (retryTimer) window.clearTimeout(retryTimer);
      if (pingTimer) window.clearInterval(pingTimer);
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "unsubscribe", topic }));
      socket?.close();
    };
  }, [topic]);

  useEffect(() => {
    if (tracking?.rider?.latitude == null || tracking?.rider?.longitude == null || !mapRef.current) return;
    let cancelled = false;
    const draw = () => {
      if (cancelled || !mapRef.current || !window.google?.maps) return;
      const riderPoint = { lat: Number(tracking.rider.latitude), lng: Number(tracking.rider.longitude) };
      const isNewMap = !mapInstance.current;
      if (isNewMap) mapInstance.current = new window.google.maps.Map(mapRef.current, { center: riderPoint, zoom: 15, mapTypeControl: false, streetViewControl: false, fullscreenControl: true });
      if (!riderMarker.current) riderMarker.current = new window.google.maps.Marker({ map: mapInstance.current, position: riderPoint, title: `${tracking.rider.name} · live rider`, label: { text: "R", color: "white", fontWeight: "700" } });
      else animateGoogleMarker(riderMarker.current, riderPoint);
      const destination = tracking.destination;
      if (destination?.latitude != null && destination?.longitude != null) {
        const destinationPoint = { lat: Number(destination.latitude), lng: Number(destination.longitude) };
        if (!destinationMarker.current) destinationMarker.current = new window.google.maps.Marker({ map: mapInstance.current, position: destinationPoint, title: "Delivery destination", label: { text: "D", color: "white", fontWeight: "700" } });
        if (isNewMap) mapInstance.current.fitBounds(new window.google.maps.LatLngBounds(riderPoint, destinationPoint));
      } else if (isNewMap) mapInstance.current.panTo(riderPoint);
      setMapError("");
    };
    void loadGoogleMaps().then(draw).catch((error) => { if (!cancelled) setMapError(error.message || "Google Maps failed to load"); });
    return () => { cancelled = true; };
  }, [tracking]);

  const lastSeenMs = utcTimestampMs(tracking?.rider?.last_seen_at);
  const age = lastSeenMs != null
    ? Math.max(0, Math.floor((Date.now() - lastSeenMs) / 1000))
    : tracking?.rider?.location_age_seconds;
  const isFresh = age != null && age <= 30;
  const mapsUrl = tracking?.rider?.latitude != null ? `https://www.google.com/maps?q=${tracking.rider.latitude},${tracking.rider.longitude}` : "";
  return <section className={`rounded-3xl bg-slate-950 p-5 text-white ${className}`}><div className="flex items-start justify-between gap-3"><div><p className="font-black">{tracking?.rider?.name || "Live rider location"}</p><p className={`text-xs font-bold ${connected || isFresh ? "text-green-400" : "text-amber-400"}`}>{connected ? "Live via WebSocket" : age != null ? `Last update ${age}s ago` : "Waiting for rider app location"}</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${connected ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"}`}>{connected ? "Live" : "Reconnecting"}</span></div>{trackingError && <p className="mt-3 rounded-xl bg-red-500/15 p-3 text-xs font-bold text-red-300">{trackingError}</p>}{mapError && <p className="mt-3 rounded-xl bg-amber-500/15 p-3 text-xs font-bold text-amber-300">{mapError}. Enable Maps JavaScript API and allow this admin domain.</p>}<div ref={mapRef} className="mt-4 h-80 overflow-hidden rounded-2xl bg-slate-800" />{mapError && mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-3 block rounded-xl bg-green-600 p-3 text-center text-xs font-black">Open current position in Google Maps</a>}
 
  </section>;
}
