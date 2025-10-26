import React, { useEffect, useState, useContext, useRef  } from "react";
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
    iconUrl:
      "https://i.imgur.com/IPEOEew.png",
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
  'Flight Path': new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/TRACKING/FlightMaster.PNG?raw=true",
    iconSize: [40, 40],
    iconAnchor: [25, 35],
    popupAnchor: [1, -34],
  }),
  'Zone': new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/Buttons/UI-PlusButton-Up.PNG?raw=true",
    iconSize: [40, 40],
    iconAnchor: [20, 35],
    popupAnchor: [1, -34],
  }),
  'PvP': new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/WorldStateFrame/CombatSwords.PNG?raw=true",
    iconSize: [100, 100],
    iconAnchor: [25, 45],
    popupAnchor: [1, -34],
  }),
  'World Boss': new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Minimap_skull_normal.PNG?raw=true",
    iconSize: [50, 50],
    iconAnchor: [25, 45],
    popupAnchor: [1, -34],
  }),
  'World Event': new L.Icon({
    iconUrl:
      "https://github.com/Gethe/wow-ui-textures/blob/live/MINIMAP/Minimap_shield_elite.PNG?raw=true",
    iconSize: [50, 50],
    iconAnchor: [25, 45],
    popupAnchor: [1, -34],
  }),
  'Races': new L.Icon({
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

// Zoom map to selected polygon
function ZoomToRegion({ polygons, selectedRegion, imageBounds }) {
  const map = useMap();
  const [lastRegion, setLastRegion] = React.useState(selectedRegion);

  useEffect(() => {
    if (selectedRegion === lastRegion) return;
    if (!selectedRegion) map.fitBounds(imageBounds);
    else {
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

// Reset button
function ResetButton({ bounds, setSelectedRegion, setSelectedCategories, allCategories }) {
  const map = useMap();
  const handleReset = () => {
    map.fitBounds(bounds);
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

export default function CustomMap({ backendUrl }) {
  const [pins, setPins] = useState([]);
  const [newPinCoords, setNewPinCoords] = useState(null);
  const [newPinDesc, setNewPinDesc] = useState("");
  const [newPinName, setNewPinName] = useState("");
  const [newPinCategory, setNewPinCategory] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // ✅ keep this for dropdowns
  const [votedPins, setVotedPins] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [minUpvotes, setMinUpvotes] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef();
  

  const goToMap = (pin) => {
    if (location.pathname === "/map") {
      // Already on the map → send an event or update a shared state
      window.dispatchEvent(new CustomEvent("map:focus", {
        detail: { lat: pin.x, lng: pin.y }
      }));
    } else {
      navigate("/map", { state: { lat: pin.x, lng: pin.y } });
    }
  };

  useEffect(() => {
    const handleMapFocus = (e) => {
      const { lat, lng } = e.detail;
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 3); // Adjust zoom as desired
      }
    };

    window.addEventListener("map:focus", handleMapFocus);
    return () => window.removeEventListener("map:focus", handleMapFocus);
  }, []);


  const { user: discordUser } = useContext(UserContext);

  const imageBounds = [
    [0, 0],
    [1500, 2000],
  ];

  // ✅ Fetch available categories from backend once
  useEffect(() => {
    fetch(`${backendUrl}/pins/categories`)
      .then((res) => res.json())
      .then((data) => {
        setAllCategories(data);
        setSelectedCategories(data);
        // Only set default category once
        setNewPinCategory((prev) => prev || data[0]);
      })
      .catch((err) => console.error("Failed to fetch categories", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  const isPinInPolygon = (pin, coords) => {
    const polygon = turf.polygon([coords.map(([lat, lng]) => [lng, lat])]);
    const point = turf.point([pin.y, pin.x]);
    return turf.booleanPointInPolygon(point, polygon);
  };

  const getPolygonName = (pin) => {
    const point = turf.point([pin.y, pin.x]);
    for (const poly of polygons) {
      const polygon = turf.polygon([poly.coords.map(([lat, lng]) => [lng, lat])]);
      if (turf.booleanPointInPolygon(point, polygon)) return poly.name;
    }
    return null;
  };

  // Filter pins
  const filteredPins = pins
    .filter((pin) => selectedCategories.includes(pin.category))
    .filter((pin) => !selectedRegion || isPinInPolygon(pin, polygons.find((p) => p.name === selectedRegion)?.coords || []))
    .filter((pin) => pin.upvotes >= minUpvotes) // <-- apply slider filter
    .sort((a, b) => b.upvotes - a.upvotes);
    

  // Fetch pins and votes
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

  const handleCancelPin = () => setNewPinCoords(null);

  // Voting
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
        prev.map((p) =>
          p.id === pinId ? { ...p, upvotes: updated.upvotes, downvotes: updated.downvotes } : p
        )
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

  const paddedBounds = [
  [-150, -150], // top-left outside the image
  [1650, 2150], // bottom-right outside the image
  ];

  return (
    <div style={{ paddingTop: "75px" }}>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Map Area */}
        <div style={{ flex: 4, position: "relative", background: "#153b65" }}>
          <MapContainer
            ref={mapRef} // 👈 attach ref
            crs={L.CRS.Simple}
            bounds={imageBounds}
            maxBounds={paddedBounds}
            style={{ width: "100%", height: "calc(100vh - 75px)" }}
            doubleClickZoom={false}
            maxBoundsViscosity={0.5}
            minZoom={-1}
            maxZoom={10}
          >
            <PanToPin />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "#167C8B" }} />
            <ImageOverlay url="/map.jpg" bounds={imageBounds} />
            <ZoomToRegion polygons={polygons} selectedRegion={selectedRegion} imageBounds={imageBounds} />
            <AddPinOnClick setNewPinCoords={setNewPinCoords} />
            <ResetButton
              bounds={imageBounds}
              setSelectedRegion={setSelectedRegion}
              setSelectedCategories={setSelectedCategories}
              allCategories={allCategories}
            />
            <div style={{
              position: "absolute",
              top: 335,
              left: 10,
              zIndex: 1000,
              background: "darkgray",
              padding: "10px",
              borderRadius: "8px",
              width: 180,
              fontWeight: "bold",
              textAlign: "center"
            }}>
              <div style={{ marginBottom: 10, fontSize: 12 }}>Filter by Pin Popularity</div>
              <input
                type="range"
                min={0}
                max={Math.max(...pins.map(p => p.upvotes), 50)}
                value={minUpvotes}
                onChange={(e) => setMinUpvotes(Number(e.target.value))}
                style={{ width: "100%" }}
                list="tickmarks"
              />
              {/* Tick labels */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 5,
                fontSize: 14,
                fontWeight: "bold"
              }}>
                <span>0</span>
                <span>5</span>
                <span>10</span>
                <span>20</span>
                <span>50+</span>
              </div>
            </div>
            {polygons.map((poly, idx) => (
              <Polygon
                key={idx}
                positions={poly.coords}
                pathOptions={{ color: "transparent", fillOpacity: 0, interactive: false }}
              />
            ))}
            {filteredPins.map((pin) => (
              <Marker
                key={pin.id}
                position={[pin.x, pin.y]}
                icon={markerIcons[pin.category] || markerIcons.blue}
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
                  </button> | <button
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
                    categories={allCategories} // 👈 pass your dynamically fetched categories here
                    onSave={handleSavePin}
                    onCancel={handleCancelPin}
                  />
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Filters */}
          <div style={{ position: "absolute", top: 80, left: 10, zIndex: 1000, background: "darkgray", padding: "10px", borderRadius: "8px", fontSize: "12px"}}>
            <strong>Region:</strong>
            <br />
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
              <option value="">All</option>
              {polygons.map((poly) => <option key={poly.name} value={poly.name}>{poly.name}</option>)}
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
          </div>
        </div>

        {/* Right Panel: Pins List */}
        <div style={{ flex: 1, top: 0, position: "relative", overflowY: "auto", padding: 10, borderLeft: "1px solid #000", background: "darkgray" }}>
          <h3>Filtered Pins</h3>
          {filteredPins.length === 0 ? (
            <p>No pins</p>
          ) : (
            filteredPins.map((pin) => (
              <div key={pin.id} style={{ border: "1px solid #aaa", borderRadius: 8, padding: 10, marginBottom: 10, background: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
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
        </div>
      </div>

      {/* Login Popup */}
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
            <p><strong>You must be logged in with Discord to vote.</strong></p>
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

