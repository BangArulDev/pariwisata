import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { destinations } from "../data/mockData";
import { MapPin, ArrowRight } from "lucide-react";

// Fix Leaflet marker icon issue in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Grobogan coordinates (approximate center)
const CENTER_POSITION = [-7.112, 110.924];

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MapScreen({ onSelectSpot }) {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  return (
    <div className="h-[calc(100vh-140px)] md:h-[600px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 relative z-0">
      <MapContainer
        center={CENTER_POSITION}
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker (if available) */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className:
                "bg-blue-500 rounded-full border-2 border-white shadow-md",
              iconSize: [16, 16],
            })}
          >
            <Popup>Lokasi Anda</Popup>
          </Marker>
        )}

        {destinations.map((spot) =>
          spot.coordinates ? (
            <Marker
              key={spot.id}
              position={[spot.coordinates.lat, spot.coordinates.lng]}
            >
              <Popup>
                <div className="w-48 text-left">
                  <div className="h-24 w-full mb-2 rounded-lg overflow-hidden">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    {spot.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 truncate">
                    {spot.type}
                  </p>
                  <button
                    onClick={() => onSelectSpot(spot)}
                    className="w-full bg-green-600 text-white text-xs py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-green-700 transition-colors"
                  >
                    Lihat Detail
                    <ArrowRight size={12} />
                  </button>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
