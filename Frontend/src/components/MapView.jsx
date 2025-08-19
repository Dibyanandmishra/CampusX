import React, { useEffect, useRef } from "react";
import L from "leaflet";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapView = ({
  sosReports,
  userLocation,
  showOnlyActive = false,
  focusLocation = null,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Determine center as [lat, lng] array
    const defaultCenter = [40.7128, -74.006];
    const center = userLocation
      ? [userLocation.lat, userLocation.lng]
      : defaultCenter;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, 13);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation]);

  // Center on focus location when provided
  useEffect(() => {
    if (mapInstanceRef.current && focusLocation) {
      mapInstanceRef.current.setView(
        [focusLocation.lat, focusLocation.lng],
        16
      );
    }
  }, [focusLocation]);

  // Update markers when SOS reports change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add user location marker
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: "user-marker",
          html: "📍",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
      }).addTo(mapInstanceRef.current);

      userMarker.bindPopup("<b>Your Location</b>").openPopup();
      markersRef.current.push(userMarker);
    }

    // Filter by status if needed
    const reportsToShow = showOnlyActive
      ? sosReports.filter((r) => r.status === "active")
      : sosReports;

    // Add SOS report markers
    reportsToShow.forEach((report) => {
      const markerIcon = L.divIcon({
        className: "sos-marker",
        html: `🚨`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([report.location.lat, report.location.lng], {
        icon: markerIcon,
      }).addTo(mapInstanceRef.current);

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${
        report.location.lat
      },${report.location.lng}${
        userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ""
      }`;

      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-lg">${
            report.status === "active" ? "🚨 ACTIVE SOS" : "✅ RESOLVED"
          }</h3>
          <p><strong>User:</strong> ${report.userName}</p>
          <p><strong>Type:</strong> ${report.type}</p>
          <p><strong>Time:</strong> ${new Date(
            report.timestamp
          ).toLocaleString()}</p>
          ${
            report.description
              ? `<p><strong>Description:</strong> ${report.description}</p>`
              : ""
          }
          <div class="mt-2">
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Get Directions</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Fit map to show all markers (unless we have a focus location)
    if (!focusLocation && markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [sosReports, userLocation, showOnlyActive, focusLocation]);

  return (
    <div className="map-container">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Live SOS Reports Map
        </h3>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            <span>Active SOS</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span>Resolved</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">📍</span>
            <span>Your Location</span>
          </div>
        </div>
      </div>
      <div
        ref={mapRef}
        className="w-full h-80 border-2 border-gray-300 rounded-lg"
      ></div>
    </div>
  );
};

export default MapView;
