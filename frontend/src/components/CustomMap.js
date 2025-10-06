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
import PinForm from "./PinForm";
import polygons from "./polygons";
import * as turf from "@turf/turf";

// Generate/reuse session ID for this browser tab
let sessionId = sessionStorage.getItem("session_id");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem("session_id", sessionId);
}

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

// Double-click to add pin
function AddPinOnClick({ setNewPinCoords }) {
  useMapEvents({
    dblclick(e) {
      setNewPinCoords(e.latlng);
    },
  });
  return null;
}

// Zoom map to selected polygon
function ZoomToRegion({ polygons, selectedRegion, imageBounds }) {
  const map = useMap();
  const [lastRegion, setLastRegion] = React.useState(selectedRegion);

  useEffect(() => {
    // Only recenter if region actually changed
    if (selectedRegion === lastRegion) return;

    if (!selectedRegion) {
      map.fitBounds(imageBounds);
    } else {
      const poly = polygons.find((p) => p.name === selectedRegion);
      if (poly) map.fitBounds(L.latLngBounds(poly.coords));
    }

    setLastRegion(selectedRegion);
  }, [selectedRegion, lastRegion, polygons, imageBounds, map]);

  return null;
}


// Pan to pin from route
function PanToPin() {
  const location = useLocation();
  const map = useMap();
  useEffect(() => {
    if (location.state?.lat != null && location.state?.lng != null) {
      map.setView([location.state.lat, location.state.lng], 3);
    }
  }, [location.state, map]);
  return null;
}

export default function CustomMap({ backendUrl }) {
  const [pins, setPins] = useState([]);
  const [newPinCoords, setNewPinCoords] = useState(null);
  const [newPinDesc, setNewPinDesc] = useState("");
  const [newPinName, setNewPinName] = useState("");
  const [newPinCategory, setNewPinCategory] = useState("Lore");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([
    "Lore",
    "Quest",
    "Raid",
    "Dungeon",
  ]);
  // const [votedPins, setVotedPins] = useState({});

  const imageBounds = [
    [0, 0],
    [1500, 2000],
  ];
  const allCategories = ["Lore", "Quest", "Raid", "Dungeon"];

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

  const isPinInPolygon = (pin, coords) => {
    const polygon = turf.polygon([coords.map(([lat, lng]) => [lng, lat])]); 
    // pin.x = lat, pin.y = lng  (flip if needed)
    const point = turf.point([pin.y, pin.x]); 
    return turf.booleanPointInPolygon(point, polygon);
  };

  // Filter pins
  const filteredPins = pins.filter((pin) => {
    if (!selectedCategories.includes(pin.category)) return false;
    if (!selectedRegion) return true;
    const poly = polygons.find((p) => p.name === selectedRegion);
    if (!poly) return true;
    return isPinInPolygon(pin, poly.coords);
  });

  // const isPinInPolygon = (pin, coords) => {
  //   // ⚠️ Important: Leaflet wants (lat, lng) order
  //   const latlng = L.latLng(pin.y, pin.x);
  //   return L.polygon(coords).getBounds().contains(latlng);
  // };

  // const filteredPins = pins.filter((pin) => {
  //   if (!selectedCategories.includes(pin.category)) return false;
  //   if (!selectedRegion) return true;

  //   const poly = polygons.find((p) => p.name === selectedRegion);
  //   if (!poly) return true;

  //   return isPinInPolygon(pin, poly.coords);
  // });


  // Fetch pins
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await fetch(`${backendUrl}/pins/`);
        const data = await res.json();
        setPins(
          data.map((p) => ({
            ...p,
            upvotes: p.upvotes || 0,
            downvotes: p.downvotes || 0,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchPins();
  }, [backendUrl]);

  // --- Load pins and votes from backend ---
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await fetch(`${backendUrl}/pins/`);
        const data = await res.json();

        const enriched = data.map((pin) => ({
          ...pin,
          polygon: getPolygonName(pin),
          upvotes: pin.upvotes || 0,
          downvotes: pin.downvotes || 0,
        }));

        setPins(enriched);

        // Fetch votes for this session+IP
        const voteRes = await fetch(`${backendUrl}/pins/votes/${sessionId}`);
        const votes = await voteRes.json();
        const voteMap = {};
        votes.forEach((v) => {
          voteMap[v.pin_id] = v.vote_type;
        });
        setVotedPins(voteMap);
      } catch (err) {
        console.error("Failed to load pins or votes:", err);
      }
    };

    fetchPins();
    const interval = setInterval(fetchPins, 5000); // refresh every 5s

    return () => clearInterval(interval);
  }, [backendUrl]);
  
  // Save new pin
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
      console.error(err);
    }
    setNewPinCoords(null);
    setNewPinDesc("");
    setNewPinName("");
    setNewPinCategory("Lore");
  };

  const getPolygonName = (pin) => {
    const point = turf.point([pin.y, pin.x]);
    for (const poly of polygons) {
      const polygon = turf.polygon([poly.coords.map(([lat, lng]) => [lng, lat])]);
      if (turf.booleanPointInPolygon(point, polygon)) return poly.name;
    }
    return null;
  };
  const handleCancelPin = () => setNewPinCoords(null);
  
  const [votedPins, setVotedPins] = useState(() => {
    return JSON.parse(sessionStorage.getItem("votedPins") || "{}");
  });

  // Vote pins
  // --- Handle voting ---
  const votePin = async (pinId, type) => {
    const pin = pins.find((p) => p.id === pinId);
    if (!pin) return;

    const currentVote = votedPins[pinId];
    let updatedPin = { ...pin };

    try {
      const payload = {
        pin_id: pinId,
        session_id: sessionId,
        vote_type: type,
      };
      const res = await fetch(`${backendUrl}/pins/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Vote failed");

      const updated = await res.json();

      // Update pin counts locally
      updatedPin = {
        ...pin,
        upvotes: updated.upvotes,
        downvotes: updated.downvotes,
      };
      setPins((prev) => prev.map((p) => (p.id === pinId ? updatedPin : p)));

      // Update votedPins map
      setVotedPins((prev) => {
        const newVotes = { ...prev };

        if (currentVote === type) {
          delete newVotes[pinId]; // undo vote
        } else {
          newVotes[pinId] = type; // new vote or switch
        }

        // Persist in sessionStorage
        sessionStorage.setItem("votedPins", JSON.stringify(newVotes));

        return newVotes;
      });
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  // Reset
  const handleReset = (map) => {
    map.fitBounds(imageBounds);
    setSelectedRegion("");
    setSelectedCategories([...allCategories]);
  };

// Inside your MapContainer, somewhere at the top level
function ResetButton({ bounds, setSelectedRegion, setSelectedCategories, allCategories }) {
  const map = useMap(); // correct way to get map instance

  const handleReset = () => {
    map.fitBounds(bounds); // works correctly
    setSelectedRegion("");
    setSelectedCategories([...allCategories]);
  };

  return (
    <div
          style={{
            position: "absolute",
            top: 300,
            left: 10,
            zIndex: 1000,
            background: "lightgray",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
            width: 100,
            fontWeight: "bold",
            textAlign: "center",
          }}
      onClick={handleReset}
    >
      Reset
    </div>
  );
}

  return (
    <div style={{ paddingTop: "60px" }}>
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left: Map */}
      <div style={{ flex: 4, position: "relative" }}>
        <MapContainer
          crs={L.CRS.Simple}
          bounds={imageBounds}
          maxBounds={imageBounds}
          style={{
            width: "100%",
            height: "calc(100vh - 60px)", // subtract navbar height
            display: "block",
          }}
          doubleClickZoom={false}
        >
          <PanToPin />
          <ImageOverlay url="/map.jpg" bounds={imageBounds} />
          <ZoomToRegion
            polygons={polygons}
            selectedRegion={selectedRegion}
            imageBounds={imageBounds}
          />
          <AddPinOnClick setNewPinCoords={setNewPinCoords} />
          <ResetButton
            bounds={imageBounds}
            onReset={handleReset}
            setSelectedRegion={setSelectedRegion}
            setSelectedCategories={setSelectedCategories}
            allCategories={allCategories}
          />
          {/* Polygons */}
          {polygons.map((poly, idx) => (
            <Polygon
              key={idx}
              positions={poly.coords}
              pathOptions={{ color: "transparent", fillOpacity: 0 }}
            >
              <Popup>{poly.name}</Popup>
            </Polygon>
          ))}

          {/* Pins */}
          {filteredPins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.x, pin.y]}
              icon={markerIcons[getColor(pin.category)] || markerIcons.blue}
            >
              <Popup>
                <strong>{pin.name}</strong> ({pin.category})<br />
                {pin.description}
                <br />
                👍 {pin.upvotes} | 👎 {pin.downvotes}
                
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

        {/* Reset button */}
        {/* <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 1000,
            background: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => handleReset(L.map("map"))}
        >
          Reset
        </div> */}

        {/* Region dropdown */}
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 10,
            zIndex: 1000,
            background: "lightgray",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <strong>Region:</strong>
          <br />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="">All</option>
            {polygons.map((poly) => (
              <option key={poly.name} value={poly.name}>
                {poly.name}
              </option>
            ))}
          </select>
          <br />
          <strong>Categories:</strong>
          {allCategories.map((cat) => (
            <div key={cat}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={(e) =>
                    setSelectedCategories((prev) =>
                      e.target.checked
                        ? [...prev, cat]
                        : prev.filter((c) => c !== cat)
                    )
                  }
                />
                {cat}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Filtered pins list */}
      {/* Right: Filtered pins list */}
<div
  style={{
    flex: 1,
    top: 0,
    position: "relative",
    overflowY: "auto",
    padding: 10,
    borderLeft: "1px solid #000000ff",
    background: "lightgray",
  }}
>
  <h3>Filtered Pins</h3>
  {filteredPins.length === 0 ? (
    <p>No pins</p>
  ) : (
    filteredPins.map((pin) => (
      <div
        key={pin.id}
        style={{
          border: "1px solid #aaa",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
          background: "white",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>
          {pin.name} <span style={{ color: "#666", fontSize: "0.9em" }}>({pin.category})</span>
        </div>
        <div style={{ fontSize: "0.85em", marginTop: 5 }}>
          <div>Desc: {pin.description}</div>
          <div>Zone: {getPolygonName(pin) || "N/A"}</div>
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button
            onClick={() => votePin(pin.id, "up")}
            disabled={votedPins[pin.id] === "up"}
            style={{
              background: votedPins[pin.id] === "up" ? "green" : "",
              color: votedPins[pin.id] === "up" ? "white" : "",
              padding: "5px 10px",
              borderRadius: "3px",
              cursor: votedPins[pin.id] === "up" ? "default" : "pointer",
            }}
          >
            👍 {pin.upvotes}
          </button>
          <button
            onClick={() => votePin(pin.id, "down")}
            disabled={votedPins[pin.id] === "down"}
            style={{
              background: votedPins[pin.id] === "down" ? "red" : "",
              color: votedPins[pin.id] === "down" ? "white" : "",
              padding: "5px 10px",
              borderRadius: "3px",
              cursor: votedPins[pin.id] === "down" ? "default" : "pointer",
            }}
          >
            👎 {pin.downvotes}
          </button>
        </div>
      </div>
    ))
  )}
</div>

    </div>
    </div>
  );
}
