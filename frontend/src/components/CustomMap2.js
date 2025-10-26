import React, { useEffect, useState, useContext, useRef } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  Polygon,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PinForm from "./PinForm";
import polygons from "./polygons";
import * as turf from "@turf/turf";
import { UserContext } from "./UserContext";
import "./CustomMap2.css";

// Zoom level constants
const ZOOM_LEVELS = {
  FULL_MAP: -1,     // Fully zoomed out (what we're seeing as -1)
  REGION_VIEW: 0,   // Regional view  
  DETAIL_VIEW: .1,   // Detailed area view
  CLOSE_UP: 2,      // Close-up view (what we're seeing as 2)
  MAX_ZOOM: 3      // Maximum zoom
};

// Updated custom hook for zoom-based conditions
function useZoomConditions(zoomLevel) {
  const isFullyZoomedOut = zoomLevel <= ZOOM_LEVELS.FULL_MAP;
  const isRegionalView = zoomLevel > ZOOM_LEVELS.FULL_MAP && zoomLevel <= ZOOM_LEVELS.REGION_VIEW;
  const isDetailView = zoomLevel > ZOOM_LEVELS.REGION_VIEW && zoomLevel <= ZOOM_LEVELS.DETAIL_VIEW;
  const isCloseUp = zoomLevel > ZOOM_LEVELS.DETAIL_VIEW;
  const shouldShowPins = zoomLevel > ZOOM_LEVELS.REGION_VIEW;
  const shouldShowDetailedPins = zoomLevel > ZOOM_LEVELS.DETAIL_VIEW;
  const isZoomed = zoomLevel > ZOOM_LEVELS.FULL_MAP;
  
  return {
    isFullyZoomedOut,
    isRegionalView,
    isDetailView,
    isCloseUp,
    shouldShowPins,
    isZoomed,
    shouldShowDetailedPins,
    currentZoomTier: isFullyZoomedOut ? 'full' : 
                    isRegionalView ? 'region' : 
                    isDetailView ? 'detail' : 'closeup'
  };
}

// Fix default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Marker icons (kept your original set)
const markerIcons = {
  Lore: new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/TRACKING/Profession.PNG?raw=true",
    iconSize: [40, 40],
    iconAnchor: [20, 41],
    popupAnchor: [1, -34],
  }),
  Raid: new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Raid_Icon.PNG?raw=true",
    iconSize: [75, 75],
    iconAnchor: [35, 55],
    popupAnchor: [1, -34],
  }),
  Quest: new L.Icon({
    iconUrl: "https://i.imgur.com/IPEOEew.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [12, 40],
    iconAnchor: [5, 31],
    popupAnchor: [1, -34],
  }),
  Dungeon: new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Dungeon_Icon.PNG?raw=true",
    iconSize: [75, 75],
    iconAnchor: [35, 55],
    popupAnchor: [1, -34],
  }),
  "Flight Path": new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/TRACKING/FlightMaster.PNG?raw=true",
    iconSize: [40, 40],
    iconAnchor: [25, 35],
    popupAnchor: [1, -34],
  }),
  Zone: new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/Buttons/UI-PlusButton-Up.PNG?raw=true",
    iconSize: [40, 40],
    iconAnchor: [20, 35],
    popupAnchor: [1, -34],
  }),
  PvP: new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/WorldStateFrame/CombatSwords.PNG?raw=true",
    iconSize: [100, 100],
    iconAnchor: [25, 45],
    popupAnchor: [1, -34],
  }),
  "World Boss": new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Minimap_skull_normal.PNG?raw=true",
    iconSize: [50, 50],
    iconAnchor: [25, 45],
    popupAnchor: [1, -34],
  }),
  "World Event": new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Minimap_shield_elite.PNG?raw=true",
    iconSize: [50, 50],
    iconAnchor: [25, 45],
    popupAnchor: [1, -34],
  }),
  Races: new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Minimap_shield_elite.PNG?raw=true",
    iconSize: [50, 50],
    iconAnchor: [25, 45],
    popupAnchor: [1, -34],
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

// Pan to pin from route state
function PanToPin() {
  const location = useLocation();
  const map = useMap();
  useEffect(() => {
    if (location.state?.lat != null && location.state?.lng != null) {
      map.flyTo([location.state.lat, location.state.lng], 3, { duration: 0.7 });
    }
  }, [location.state, map]);
  return null;
}

// Reset button (uses flyToBounds for animated reset)
function ResetButton({ bounds, setSelectedRegion, setSelectedCategories, allCategories }) {
  const map = useMap();
  const handleReset = () => {
    map.flyToBounds(bounds, { duration: 0.7 });
    setSelectedRegion("");
    setSelectedCategories([...allCategories]);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 450,
        left: 10,
        zIndex: 1000,
        background: "darkgray",
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

// Global right-click to zoom out
function ZoomOutOnRightClick({ setSelectedRegion, imageBounds }) {
  const map = useMap();
  
  useMapEvents({
    contextmenu(e) {
      e.originalEvent.preventDefault(); // prevent context menu
      setSelectedRegion("");
      map.flyToBounds(imageBounds, { duration: 0.7 });
    },
  });
  return null;
}

// // Region labels component
// function RegionLabels({ polygons }) {
//   return polygons.map(poly => {
//     const center = L.latLngBounds(poly.coords).getCenter();
//     return (
//       <div key={poly.name} style={{
//         position: "absolute",
//         left: `${(center.lng / 2000) * 100}%`,
//         top: `${(center.lat / 1500) * 100}%`,
//         transform: "translate(-50%, -50%)",
//         color: "white",
//         fontWeight: "bold",
//         textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
//         pointerEvents: "none",
//         zIndex: 500,
//         textAlign: "center",
//         fontSize: "14px"
//       }}>
//         {poly.name}
//       </div>
//     );
//   });
// }

// Simple statistics component
function MapStatistics({ pins, polygons }) {
  const totalPins = pins.length;
  const pinsThisWeek = pins.filter(pin => {
    const pinDate = new Date(pin.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return pinDate > weekAgo;
  }).length;

  return (
    <div style={{ background: "white", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}>
      <h4>Map Statistics</h4>
      <div>Total Pins: {totalPins}</div>
      <div>New This Week: {pinsThisWeek}</div>
      <div>Regions: {polygons.length}</div>
    </div>
  );
}

// Region list component
function RegionList({ polygons, pinCounts, onRegionClick }) {
  return (
    <div>
      <h4>Regions</h4>
      {polygons.map(poly => (
        <div 
          key={poly.name}
          style={{
            padding: "8px",
            margin: "5px 0",
            background: "white",
            borderRadius: "5px",
            cursor: "pointer",
            border: "1px solid #ccc"
          }}
          onClick={() => onRegionClick(poly)}
        >
          <strong>{poly.name}</strong>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Pins: {pinCounts[poly.name] || 0}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CustomMap2({ backendUrl }) {
  // --- preserved states (your original logic) ---
  const [pins, setPins] = useState([]);
  const [newPinCoords, setNewPinCoords] = useState(null);
  const [newPinDesc, setNewPinDesc] = useState("");
  const [newPinName, setNewPinName] = useState("");
  const [newPinCategory, setNewPinCategory] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // for dropdowns
  const [votedPins, setVotedPins] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [minUpvotes, setMinUpvotes] = useState(0);

  // --- new UI-related states ---
  const [zoomLevel, setZoomLevel] = useState(0); // track zoom to show/hide pins
  const [hoveredRegion, setHoveredRegion] = useState(null); // hover glow state

  const { user: discordUser } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef(null); // will hold Leaflet map instance via whenCreated

  const imageBounds = [
    [0, 0],
    [1500, 2000],
  ];

  const paddedBounds = [
    [-150, -150],
    [1650, 2150],
  ];

  // Use zoom conditions
  const zoomConditions = useZoomConditions(zoomLevel);

    // geometry helpers (preserved)
  const isPinInPolygon = (pin, coords) => {
    if (!coords?.length) return false;
    const polygon = turf.polygon([coords.map(([lat, lng]) => [lng, lat])]);
    const point = turf.point([pin.y, pin.x]);
    return turf.booleanPointInPolygon(point, polygon);
  };
  
  // Calculate pin counts per region
  const calculatePinCounts = () => {
    const counts = {};
    polygons.forEach(poly => {
      counts[poly.name] = pins.filter(pin => 
        isPinInPolygon(pin, poly.coords)
      ).length;
    });
    return counts;
  };

  const pinCounts = calculatePinCounts();

  // Zoom tracker component
  function ZoomTracker({ setZoomLevel }) {
    const map = useMap();
    
    useMapEvents({
      zoomend() {
        setZoomLevel(map.getZoom());
      },
      moveend() {
        // Also update on move in case zoom changes during movement
        setZoomLevel(map.getZoom());
      }
    });

    // Initial zoom level
    useEffect(() => {
      setZoomLevel(map.getZoom());
    }, [map, setZoomLevel]);

    return null;
  }

  // pan to map programmatic focus event (keeps your previous dispatch logic)
  useEffect(() => {
    const handleMapFocus = (e) => {
      const { lat, lng } = e.detail;
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lng], 3, { duration: 0.7 });
      }
    };
    window.addEventListener("map:focus", handleMapFocus);
    return () => window.removeEventListener("map:focus", handleMapFocus);
  }, []);

  const goToMap = (pin) => {
    if (location.pathname === "/map2") {
      // Already on the map → send event to focus
      window.dispatchEvent(
        new CustomEvent("map:focus", {
          detail: { lat: pin.x, lng: pin.y },
        })
      );
    } else {
      navigate("/map2", { state: { lat: pin.x, lng: pin.y } });
    }
  };

  // fetch categories (unchanged)
  useEffect(() => {
    fetch(`${backendUrl}/pins/categories`)
      .then((res) => res.json())
      .then((data) => {
        setAllCategories(data);
        setSelectedCategories(data);
        setNewPinCategory((prev) => prev || data[0]);
      })
      .catch((err) => console.error("Failed to fetch categories", err));
  }, [backendUrl]);

  const getPolygonName = (pin) => {
    const point = turf.point([pin.y, pin.x]);
    for (const poly of polygons) {
      const polygon = turf.polygon([poly.coords.map(([lat, lng]) => [lng, lat])]);
      if (turf.booleanPointInPolygon(point, polygon)) return poly.name;
    }
    return null;
  };

  // capture map instance when created
  const onMapCreated = (mapInstance) => {
    mapRef.current = mapInstance;
    // Zoom tracking is now handled by ZoomTracker component
  };

  // Enhanced filtering with zoom-based importance
  const filteredPins = pins
    .filter((pin) => selectedCategories.includes(pin.category))
    .filter(
      (pin) =>
        !selectedRegion ||
        isPinInPolygon(pin, polygons.find((p) => p.name === selectedRegion)?.coords || [])
    )
    .filter((pin) => pin.upvotes >= minUpvotes)
    .sort((a, b) => b.upvotes - a.upvotes);

  // fetch pins + votes (preserved)
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await fetch(`${backendUrl}/pins/`);
        const data = await res.json();
        setPins(
          data.map((p) => ({
            ...p,
            polygon: getPolygonName(p),
            upvotes: p.upvotes || 0,
            downvotes: p.downvotes || 0,
          }))
        );

        if (discordUser) {
          const voteRes = await fetch(`${backendUrl}/pins/votes/${discordUser.username}`);
          const votes = await voteRes.json();
          const voteMap = {};
          votes.forEach((v) => (voteMap[v.pin_id] = v.vote_type));
          setVotedPins(voteMap);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPins();
    const interval = setInterval(fetchPins, 10000);
    return () => clearInterval(interval);
  }, [backendUrl, discordUser]);

  // save new pin (preserved)
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
      setPins((prev) => [...prev, savedPin]);
    } catch (err) {
      console.error(err);
    }
    setNewPinCoords(null);
    setNewPinDesc("");
    setNewPinName("");
    setNewPinCategory("Lore");
  };

  // voting (preserved)
  const votePin = async (pinId, type) => {
    if (!discordUser) {
      setShowLoginPopup(true);
      return;
    }

    const pin = pins.find((p) => p.id === pinId);
    if (!pin) return;

    const currentVote = votedPins[pinId];

    try {
      const payload = { pin_id: pinId, discord_username: discordUser.username, vote_type: type };
      const res = await fetch(`${backendUrl}/pins/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Vote failed");

      const updated = await res.json();
      setPins((prev) =>
        prev.map((p) => (p.id === pinId ? { ...p, upvotes: updated.upvotes, downvotes: updated.downvotes } : p))
      );

      setVotedPins((prev) => {
        const newVotes = { ...prev };
        if (currentVote === type) delete newVotes[pinId];
        else newVotes[pinId] = type;
        return newVotes;
      });
    } catch (err) {
      console.error(err);
    }
  };

  // polygon click -> flyToBounds + setSelectedRegion
  const handlePolygonClick = (poly) => {
    if (selectedRegion === poly.name) return; // already selected; ignore
    setSelectedRegion(poly.name);
    if (mapRef.current) {
      const bounds = L.latLngBounds(poly.coords);
      mapRef.current.flyToBounds(bounds, { duration: 0.7 });
    }
  };

  // Updated polygon styling function
  const getPolygonStyle = (poly) => {
    const isCurrentRegion = selectedRegion === poly.name;
    const isHovered = hoveredRegion === poly.name;
    
    if (zoomConditions.isZoomed) {
      // When zoomed in - only show hover glow if it's NOT the current region
      if (isHovered && !isCurrentRegion) {
        return {
          color: "#2f2f2f", // Dark goldenrod for edges
          weight: 3, 
          fillOpacity: 0.15,
          fillColor: "#2f2f2f", // Dark gray fill
          opacity: 0.30,
          // dashArray: "10, 10", // Creates faded dashed effect
          // lineCap: "round",
          // lineJoin: "round",
          className: "faded-glow-polygon"
        };
      } else {
        return {
          color: "transparent",
          weight: 1,
          fillOpacity: 0,
          fillColor: "transparent"
        };
      }
    } else {
      // When zoomed out - show hover glow for any polygon
      if (isHovered) {
        return {
          color: "#2f2f2f", // Dark goldenrod for edges
          weight: 3, 
          fillOpacity: 0.30,
          fillColor: "#3a3a3a", // Medium gray fill
          opacity: 0.12,
          // dashArray: "10, 10", // More spaced for faded effect
          // lineCap: "round",
          // lineJoin: "round",
          className: "faded-glow-polygon"
        };
      } else {
        return {
          color: "transparent",
          weight: 1,
          fillOpacity: 0,
          fillColor: "transparent"
        };
      }
    }
  };
  

  // Render
  return (
    <div style={{ paddingTop: "75px" }}>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Map area */}
        <div style={{ flex: 4, position: "relative", background: "#167C8B" }}>
          <MapContainer
            whenCreated={onMapCreated}
            crs={L.CRS.Simple}
            bounds={imageBounds}
            maxBounds={paddedBounds}
            style={{ width: "100%", height: "calc(100vh - 75px)" }}
            doubleClickZoom={false}
            zoomControl={false} // Disable zoom control
            scrollWheelZoom={false} // Disable mouse wheel zoom
            dragging={false} // Disable map dragging
            maxBoundsViscosity={0.5}
            minZoom={-1}
            maxZoom={10}
          >
          {/* Add ZoomTracker component */}
          <ZoomTracker setZoomLevel={setZoomLevel} />
          
          {/* Add this component for global right-click zoom out */}
          <ZoomOutOnRightClick 
            setSelectedRegion={setSelectedRegion}
            imageBounds={imageBounds}
          />
          
          {/* programmatic pan-to-pin support */}
          <PanToPin />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "#167C8B" }} />
          {/* image overlay */}
          <ImageOverlay url="/map.jpg" bounds={imageBounds} />
          {/* zoom to region helper (keeps flyToBounds when selectedRegion changes) */}
          <ZoomToRegionInternal
            polygons={polygons}
            selectedRegion={selectedRegion}
            imageBounds={imageBounds}
          />
          {/* Add pin via double-click */}
          <AddPinOnClick setNewPinCoords={setNewPinCoords} />
          {/* Reset button */}
          <ResetButton
            bounds={imageBounds}
            setSelectedRegion={setSelectedRegion}
            setSelectedCategories={setSelectedCategories}
            allCategories={allCategories}
          />

            {/* Show region labels only when zoomed out
            {zoomConditions.isRegionalView && (
              <RegionLabels polygons={polygons} />
            )} */}

            {/* Simplified polygon event handlers */}
            {polygons.map((poly, idx) => {
              const isCurrentRegion = selectedRegion === poly.name;
              
              return (
                <Polygon
                  key={idx}
                  positions={poly.coords}
                  pathOptions={getPolygonStyle(poly)}
                  eventHandlers={{
                    mouseover: () => {
                      // Only set hover if it's NOT the current region (when zoomed in) OR when zoomed out
                      if (!isCurrentRegion || !zoomConditions.isZoomed) {
                        setHoveredRegion(poly.name);
                      }
                    },
                    mouseout: () => {
                      if (!isCurrentRegion || !zoomConditions.isZoomed) {
                        setHoveredRegion(null);
                      }
                    },
                    click: () => handlePolygonClick(poly),
                  }}
                />
              );
            })}
            {/* Pins: Show different markers based on zoom level */}
            {zoomConditions.shouldShowPins &&
              filteredPins.map((pin) => (
                <Marker
                  key={pin.id}
                  position={[pin.x, pin.y]}
                  icon={
                    (markerIcons[pin.category] || markerIcons.Lore)
                
                  }
                >
                  <Popup>
                    <strong>{pin.name}</strong> ({pin.category})
                    <br />
                    {pin.description}
                    <br />
                    <button
                      onClick={() => votePin(pin.id, "up")}
                      style={{
                        background: votedPins[pin.id] === "up" ? "green" : "",
                        color: votedPins[pin.id] === "up" ? "black" : "",
                        padding: "5px 10px",
                        borderRadius: "3px",
                        cursor: votedPins[pin.id] === "up" ? "default" : "pointer",
                      }}
                    >
                      👍 {pin.upvotes}
                    </button>{" "}
                    |{" "}
                    <button
                      onClick={() => votePin(pin.id, "down")}
                      style={{
                        background: votedPins[pin.id] === "down" ? "red" : "",
                        color: votedPins[pin.id] === "down" ? "black" : "",
                        padding: "5px 10px",
                        borderRadius: "3px",
                        cursor: votedPins[pin.id] === "down" ? "default" : "pointer",
                      }}
                    >
                      👎 {pin.downvotes}
                    </button>
                  </Popup>
                </Marker>
              ))}

            {/* New pin creation */}
            {newPinCoords && (
              <Marker position={newPinCoords}>
                <Popup>
                  <PinForm
                    description={newPinDesc}
                    setDescription={setNewPinDesc}
                    name={newPinName}
                    setName={setNewPinName}
                    category={newPinCategory}
                    setCategory={setNewPinCategory}
                    categories={allCategories}
                    onSave={handleSavePin}
                    onCancel={() => setNewPinCoords(null)}
                  />
                </Popup>
              </Marker>
            )}
          </MapContainer>
          {/* Updated zoom level display */}
          <div style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1000,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "12px",
            minWidth: "200px"
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "8px", borderBottom: "1px solid #555", paddingBottom: "5px" }}>
              Map Info
            </div>
            
            <div>Zoom Level: {zoomLevel.toFixed(1)}</div>
            <div>State: {zoomConditions.isZoomed ? 'ZOOMED IN' : 'ZOOMED OUT'}</div>
            
            <div style={{ marginTop: "8px" }}>
              <div>Selected: <span style={{ color: "#ffd700" }}>{selectedRegion || "None"}</span></div>
              <div>Hovered: <span style={{ color: "#00ffff" }}>{hoveredRegion || "None"}</span></div>
            </div>
            
            <div style={{ marginTop: "8px", fontSize: "10px", opacity: 0.7, borderTop: "1px solid #555", paddingTop: "5px" }}>
              {!zoomConditions.isZoomed && (
                <div>🔍 Click regions to zoom in</div>
              )}
              {zoomConditions.isZoomed && (
                <div>📍 Right-click to zoom out</div>
              )}
              <div>Use buttons to navigate</div>
            </div>
          </div>

          {/* Filter UI (unchanged) */}
          <div
            style={{
              position: "absolute",
              top: 80,
              left: 10,
              zIndex: 1000,
              background: "darkgray",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          >
            <strong>Region:</strong>
            <br />
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
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
                        e.target.checked ? [...prev, cat] : prev.filter((c) => c !== cat)
                      )
                    }
                  />
                  {cat}
                </label>
              </div>
            ))}
            {/* popularity slider (preserved from your version) */}
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 10, fontSize: 12 }}>Filter by Pin Popularity</div>
              <input
                type="range"
                min={0}
                max={Math.max(...pins.map((p) => p.upvotes), 50)}
                value={minUpvotes}
                onChange={(e) => setMinUpvotes(Number(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span>0</span>
                <span>5</span>
                <span>10</span>
                <span>20</span>
                <span>50+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Dynamic content based on zoom */}
        <div
          style={{
            flex: 1,
            top: 0,
            position: "relative",
            overflowY: "auto",
            padding: 10,
            borderLeft: "1px solid #000",
            background: "darkgray",
          }}
        >
          <h3>
            {zoomConditions.isFullyZoomedOut && "Map Overview"}
            {zoomConditions.isRegionalView && "Regions"}
            {(zoomConditions.isDetailView || zoomConditions.isCloseUp) && "Area Pins"}
          </h3>
          
          {zoomConditions.isFullyZoomedOut && (
            <MapStatistics pins={pins} polygons={polygons} />
          )}
          
          {zoomConditions.isFullyZoomedOut && (
            <RegionList 
              polygons={polygons} 
              pinCounts={pinCounts}
              onRegionClick={handlePolygonClick}
            />
          )}
          
          {(zoomConditions.isDetailView || zoomConditions.isCloseUp) && (
            <>
              {filteredPins.length === 0 ? (
                <p>No pins in this area</p>
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
                        style={{
                          background: votedPins[pin.id] === "up" ? "green" : "",
                          color: votedPins[pin.id] === "up" ? "black" : "",
                          padding: "5px 10px",
                          borderRadius: "3px",
                          cursor: votedPins[pin.id] === "up" ? "default" : "pointer",
                        }}
                      >
                        👍 {pin.upvotes}
                      </button>
                      <button
                        onClick={() => votePin(pin.id, "down")}
                        style={{
                          background: votedPins[pin.id] === "down" ? "red" : "",
                          color: votedPins[pin.id] === "down" ? "black" : "",
                          padding: "5px 10px",
                          borderRadius: "3px",
                          cursor: votedPins[pin.id] === "down" ? "default" : "pointer",
                        }}
                      >
                        👎 {pin.downvotes}
                      </button>
                      <button
                        onClick={() => goToMap(pin)}
                        style={{
                          marginTop: "6px",
                          backgroundColor: "#2563eb",
                          border: "none",
                          borderRadius: "5px",
                          color: "#fff",
                          padding: "6px 12px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        View on Map
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Login Popup (preserved) */}
      {showLoginPopup && (
        <div
          onClick={() => setShowLoginPopup(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ecececff",
              color: "#000",
              padding: "15px",
              borderRadius: "8px",
              maxWidth: "20%",
              textAlign: "center",
            }}
          >
            <p>
              <strong>You must be logged in with Discord to vote.</strong>
            </p>
            <button
              onClick={() => setShowLoginPopup(false)}
              style={{
                marginTop: "3px",
                padding: "6px 6px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Internal helper component for responding to selectedRegion changes.
 * It uses the map instance from useMap() and triggers a fast flyToBounds
 * whenever selectedRegion changes. Kept separate so effect runs in map context.
 */
function ZoomToRegionInternal({ polygons, selectedRegion, imageBounds }) {
  const map = useMap();
  const last = useRef("");

  useEffect(() => {
    if (selectedRegion === last.current) return;
    if (!selectedRegion) {
      map.flyToBounds(imageBounds, { duration: 0.7 });
    } else {
      const poly = polygons.find((p) => p.name === selectedRegion);
      if (poly) {
        map.flyToBounds(L.latLngBounds(poly.coords), { duration: 0.7 });
      }
    }
    last.current = selectedRegion;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion]);

  return null;
}