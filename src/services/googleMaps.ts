const LEGACY_WEB_MAPS_KEY = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";

export const GOOGLE_MAPS_BROWSER_KEY = String(
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || LEGACY_WEB_MAPS_KEY,
).trim();

let loaderPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps-api]');
    const onReady = () => window.google?.maps
      ? resolve()
      : reject(new Error("Google Maps loaded without Maps JavaScript API"));

    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps script failed to load")), { once: true });
      return;
    }

    const previousAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      previousAuthFailure?.();
      reject(new Error("Google Maps rejected this API key or website domain"));
    };

    const script = document.createElement("script");
    script.dataset.googleMapsApi = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_BROWSER_KEY)}&v=weekly`;
    script.async = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error("Google Maps script failed to load"));
    document.head.appendChild(script);
  }).catch((error) => {
    loaderPromise = null;
    throw error;
  });

  return loaderPromise;
}

type MovingMarker = {
  getPosition?: () => { lat: () => number; lng: () => number } | null;
  setPosition: (position: { lat: number; lng: number }) => void;
};

export function animateGoogleMarker(marker: MovingMarker, destination: { lat: number; lng: number }, duration = 4000) {
  const current = marker.getPosition?.();
  if (!current) {
    marker.setPosition(destination);
    return;
  }
  const origin = { lat: current.lat(), lng: current.lng() };
  const startedAt = performance.now();
  const frame = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    marker.setPosition({
      lat: origin.lat + (destination.lat - origin.lat) * eased,
      lng: origin.lng + (destination.lng - origin.lng) * eased,
    });
    if (progress < 1) window.requestAnimationFrame(frame);
  };
  window.requestAnimationFrame(frame);
}
