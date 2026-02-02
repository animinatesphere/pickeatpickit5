import { useState, useEffect, useRef } from "react";
import { Navigation, Loader, MapPin, Target, X } from "lucide-react";
import { RiderNav } from "../component/RiderNav";
import { useToast } from "../../context/ToastContext";

type GoogleMap = google.maps.Map | null;
type GoogleMarker = google.maps.Marker | null;
type GooglePolyline = google.maps.Polyline | null;

const FoodDeliveryMap = () => {
  const toast = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<GoogleMap>(null);
  const [currentLocationMarker, setCurrentLocationMarker] =
    useState<GoogleMarker>(null);
  const [destinationMarker, setDestinationMarker] =
    useState<GoogleMarker>(null);
  const [routeLine, setRouteLine] = useState<GooglePolyline>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [destination, setDestination] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [isNavigating, setIsNavigating] = useState(false);

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || map) return;

    const googleMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 6.453, lng: 3.395 },
      zoom: 14,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

  setMap(googleMap as unknown as google.maps.Map);

    // Add click listener for map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (googleMap as any).addListener(
      "click",
      (e: { latLng: { lat: () => number; lng: () => number } }) => {
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();

        if (isSelectingLocation) {
          setCurrentLocation({ lat: clickedLat, lng: clickedLng });
          setIsSelectingLocation(false);
        } else if (isSelectingDestination) {
          setDestination({ lat: clickedLat, lng: clickedLng });
          setIsSelectingDestination(false);
        }
      }
    );
  }, [mapLoaded, map, isSelectingLocation, isSelectingDestination]);

  // Get User's Current Location
  const getUserLocation = () => {
    setLocationError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(userLocation);
          if (map) {
            map.panTo(userLocation);
            map.setZoom(15);
          }
        },
        (error) => {
          setLocationError(
            "Unable to get your location. Please select manually."
          );
          console.error("Error getting location:", error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  // Update Current Location Marker
  useEffect(() => {
    if (!map || !currentLocation) return;

    // Remove old marker
    if (currentLocationMarker) {
      currentLocationMarker.setMap(null);
    }

    // Create new marker
    const marker = new window.google.maps.Marker({
      position: currentLocation,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#10b981",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
    });
    setCurrentLocationMarker(marker);

    // Update route if destination exists
    if (destination) {
      updateRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation, map]);

  // Update Destination Marker
  useEffect(() => {
    if (!map || !destination) return;

    // Remove old marker
    if (destinationMarker) {
      destinationMarker.setMap(null);
    }

    // Create new marker
    const marker = new window.google.maps.Marker({
      position: destination,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#ef4444",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
    });
    setDestinationMarker(marker);

    // Update route if current location exists
    if (currentLocation) {
      updateRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, map]);

  // Update Route
  const updateRoute = () => {
    if (!map || !currentLocation || !destination) return;

    // Remove old route
    if (routeLine) {
      routeLine.setMap(null);
    }

    // Create new route line
    const route = new google.maps.Polyline({
      path: [currentLocation, destination],
      geodesic: true,
      strokeColor: "#3b82f6",
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: map,
    });
    setRouteLine(route);

    // Calculate distance
    const R = 6371; // Earth's radius in km
    const dLat = ((destination.lat - currentLocation.lat) * Math.PI) / 180;
    const dLon = ((destination.lng - currentLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((currentLocation.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    setDistance(dist.toFixed(2));
    setDuration((dist * 3).toFixed(0)); // Rough estimate: 3 min per km

    // Fit bounds to show both markers
  const bounds = new google.maps.LatLngBounds();
    bounds.extend(currentLocation);
    bounds.extend(destination);
    map.fitBounds(bounds);
  };

  // Start Navigation
  const startNavigation = () => {
    if (!currentLocation || !destination) return;
    setIsNavigating(true);

    // Simulate movement towards destination
    const interval = setInterval(() => {
      setCurrentLocation((prev) => {
        if (!prev || !destination) return prev;

        const newLat = prev.lat + (destination.lat - prev.lat) * 0.01;
        const newLng = prev.lng + (destination.lng - prev.lng) * 0.01;

        // Check if reached destination (within 0.0001 degrees ~ 10 meters)
        if (
          Math.abs(newLat - destination.lat) < 0.0001 &&
          Math.abs(newLng - destination.lng) < 0.0001
        ) {
          clearInterval(interval);
          setIsNavigating(false);
          toast.success("🎉 You have arrived at your destination!", "Arrived!");
          return prev;
        }

        const newPos = { lat: newLat, lng: newLng };
        if (map) {
          map.panTo(newPos);
        }
        return newPos;
      });
    }, 1000);
  };

  const clearRoute = () => {
    if (currentLocationMarker) currentLocationMarker.setMap(null);
    if (destinationMarker) destinationMarker.setMap(null);
    if (routeLine) routeLine.setMap(null);

    setCurrentLocation(null);
    setDestination(null);
    setCurrentLocationMarker(null);
    setDestinationMarker(null);
    setRouteLine(null);
    setDistance("");
    setDuration("");
    setIsNavigating(false);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
<RiderNav/>
      {/* Header */}
      <div className="bg-white shadow-lg px-4 py-3 border-b border-gray-200 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">Food Delivery Map</h1>
          {(currentLocation || destination) && (
            <button
              onClick={clearRoute}
              className="p-2 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-20">
            <div className="text-center">
              <Loader className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Loading Map...</p>
            </div>
          </div>
        )}

        {/* Selection Mode Overlay */}
        {(isSelectingLocation || isSelectingDestination) && (
          <div className="absolute inset-0 bg-black bg-opacity-20 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-white px-6 py-4 rounded-lg shadow-2xl">
              <p className="text-gray-800 font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500 animate-bounce" />
                {isSelectingLocation
                  ? "Tap on the map to set your location"
                  : "Tap on the map to set your destination"}
              </p>
            </div>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full"></div>
      </div>

      {/* Bottom Control Panel */}
      <div className="bg-white shadow-2xl rounded-t-3xl px-6 py-6 space-y-4 z-10">
        {/* Error Message */}
        {locationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{locationError}</p>
          </div>
        )}

        {/* Location Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={getUserLocation}
            disabled={isNavigating}
            className={`flex items-center justify-center gap-2 ${
              currentLocation ? "bg-emerald-500" : "bg-blue-500"
            } hover:opacity-90 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Target className="w-5 h-5" />
            {currentLocation ? "Update Location" : "Use My Location"}
          </button>

          <button
            onClick={() => setIsSelectingLocation(true)}
            disabled={isNavigating}
            className="flex items-center justify-center gap-2 bg-purple-500 hover:opacity-90 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MapPin className="w-5 h-5" />
            Set Location
          </button>
        </div>

        {/* Destination Button */}
        <button
          onClick={() => setIsSelectingDestination(true)}
          disabled={!currentLocation || isNavigating}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:opacity-90 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Navigation className="w-5 h-5" />
          {destination ? "Change Destination" : "Select Destination"}
        </button>

        {/* Route Info */}
        {currentLocation && destination && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Distance</p>
                <p className="text-2xl font-bold text-gray-800">
                  {distance} km
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Est. Time</p>
                <p className="text-2xl font-bold text-gray-800">
                  {duration} min
                </p>
              </div>
            </div>

            {!isNavigating ? (
              <button
                onClick={startNavigation}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Navigation className="w-6 h-6" />
                Start Navigation
              </button>
            ) : (
              <div className="bg-emerald-500 text-white px-6 py-4 rounded-xl font-bold text-center animate-pulse">
                <p className="flex items-center justify-center gap-2">
                  <Navigation className="w-6 h-6 animate-spin" />
                  Navigating...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!currentLocation && !destination && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 p-2 rounded-full">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Get Started</p>
                <p className="text-sm text-gray-600">
                  First, set your current location using GPS or by tapping on
                  the map. Then select your destination.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDeliveryMap;
