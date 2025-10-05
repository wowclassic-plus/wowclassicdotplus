import React, { useEffect, useState } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  Polygon,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PinForm from "./PinForm"; // form for adding new pins
import polygons from "./polygons"; // your polygons.js

// Fix default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Colored markers
const markerIcons = {
  blue: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  red: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  green: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  purple: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

// Double-click to add a pin
function AddPinOnClick({ setNewPinCoords }) {
  useMapEvents({
    dblclick(e) {
      setNewPinCoords(e.latlng);
    },
  });
  return null;
}

// Reset map button
function ResetButton({ bounds, onReset }) {
  const map = useMap();
  const handleReset = () => {
    map.fitBounds(bounds);
    onReset();
  };
  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        left: 10,
        zIndex: 1000,
        background: "white",
        padding: "5px 10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        cursor: "pointer",
      }}
      onClick={handleReset}
    >
      Reset
    </div>
  );
}

// Zoomable polygon component
function ZoomablePolygon({ coords, children, onClick, visible }) {
  // const map = useMap();
  if (!visible) return null;

  return (
    <Polygon
      positions={coords}
      pathOptions={{ color: "transparent", fillOpacity: 0 }}
      interactive={false} // makes it click-through
    >
      <Popup>{children}</Popup>
    </Polygon>
  );
}

// Pan to pin if location.state exists
function PanToPin() {
  const location = useLocation();
  const map = useMap();

  useEffect(() => {
    if (location.state?.lat != null && location.state?.lng != null) {
      map.setView([location.state.lat, location.state.lng], 3); // adjust zoom
    }
  }, [location.state, map]);

  return null;
}

function CustomMap({ backendUrl }) {
  const [pins, setPins] = useState([]);
  const [newPinCoords, setNewPinCoords] = useState(null);
  const [newPinDesc, setNewPinDesc] = useState("");
  const [newPinName, setNewPinName] = useState("");
  const [newPinCategory, setNewPinCategory] = useState("Lore");
  const [activePolygon, setActivePolygon] = useState(null);

  const imageWidth = 2000;
  const imageHeight = 1500;
  const imageBounds = [
    [0, 0],
    [imageHeight, imageWidth],
  ];

  const getColor = (category) => {
    switch ((category || "").toLowerCase()) {
      case "lore":
        return "blue";
      case "quest":
        return "green";
      case "raid":
        return "red";
      case "dungeon":
        return "purple";
      default:
        return "gray";
    }
  };

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await fetch(`${backendUrl}/pins/`);
        const data = await res.json();
        setPins(data);
      } catch (err) {
        console.error("Failed to fetch pins:", err);
      }
    };
    fetchPins();
  }, [backendUrl]);

  const handleSavePin = async () => {
    if (!newPinCoords || !newPinDesc) return;

    const newPin = {
      x: newPinCoords.lat,
      y: newPinCoords.lng,
      description: newPinDesc,
      category: newPinCategory,
      name: newPinName,
      upvotes: 0,
      downvotes: 0,
    };

    try {
      const res = await fetch(`${backendUrl}/pins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPin),
      });
      const savedPin = await res.json();
      setPins([...pins, savedPin]);
    } catch (err) {
      console.error("Failed to save pin:", err);
    }

    setNewPinCoords(null);
    setNewPinName("");
    setNewPinDesc("");
    setNewPinCategory("Lore");
  };

  const handleCancelPin = () => setNewPinCoords(null);

  const handleReset = () => setActivePolygon(null);

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={imageBounds}
      maxBounds={imageBounds}
      style={{ width: "100vw", height: "100vh" }}
      doubleClickZoom={false}
    >
      <PanToPin />
      <ImageOverlay url="/map.jpg" bounds={imageBounds} />
      <ResetButton bounds={imageBounds} onReset={handleReset} />
      <AddPinOnClick setNewPinCoords={setNewPinCoords} />

      {/* Polygons */}
      {polygons.map((poly, idx) => (
        <ZoomablePolygon
          key={idx}
          coords={poly.coords}
          children={poly.name}
          visible={!activePolygon}
          onClick={() => setActivePolygon(poly)}
        />
      ))}

      {/* Existing pins */}
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.x, pin.y]}
          icon={markerIcons[getColor(pin.category)] || markerIcons.blue}
        >
          <Popup>
            <strong>{pin.category}</strong>: {pin.description}
          </Popup>
        </Marker>
      ))}

      {/* New pin */}
      {newPinCoords && (
        <Marker position={newPinCoords}>
          <Popup>
            <PinForm
              name={newPinName}
              setName={setNewPinName}
              description={newPinDesc}
              setDescription={setNewPinDesc}
              category={newPinCategory}
              setCategory={setNewPinCategory}
              onSave={handleSavePin}
              onCancel={handleCancelPin}
            />
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default CustomMap;
