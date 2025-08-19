import React, { useEffect, useRef } from "react";
import L from "leaflet";

const CaseMap = ({ report, userLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const center = [report.location.lat, report.location.lng];
    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      center,
      15
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    const sosIcon = L.divIcon({
      className: "sos-marker",
      html: "🚨",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker(center, { icon: sosIcon }).addTo(map);
    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: "user-marker",
          html: "📍",
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        }),
      }).addTo(map);
    }
    mapInstanceRef.current = map;
    return () => {
      mapInstanceRef.current && mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    };
  }, [report, userLocation]);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${
    report.location.lat
  },${report.location.lng}${
    userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ""
  }`;

  return (
    <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-800">{report.userName}</div>
          <div className="text-sm text-gray-600">
            {new Date(report.timestamp).toLocaleString()} • {report.type}
          </div>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Get Directions
        </a>
      </div>
      <div ref={mapRef} className="w-full h-64"></div>
    </div>
  );
};

export default CaseMap;
