import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as turf from "@turf/turf";
import polygons from "./polygons";

let sessionId = sessionStorage.getItem("session_id");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem("session_id", sessionId);
}

// --- Category color map ---
const CATEGORY_COLORS = {
  lore: "#3b82f6",
  quest: "#22c55e",
  raid: "#ef4444",
  dungeon: "#eab308",
  other: "#8b5cf6",
};

function PinsList({ backendUrl }) {
  const [pins, setPins] = useState([]);
  const [filters, setFilters] = useState({ description: "", categories: [], polygon: "" });
  const [votedPins, setVotedPins] = useState({});
  const navigate = useNavigate();

  // --- Load pins and votes ---
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

        const voteRes = await fetch(`${backendUrl}/pins/votes/${sessionId}`);
        const votes = await voteRes.json();
        const voteMap = {};
        votes.forEach((v) => (voteMap[v.pin_id] = v.vote_type));
        setVotedPins(voteMap);
      } catch (err) {
        console.error("Failed to load pins or votes:", err);
      }
    };

    fetchPins();
    const interval = setInterval(fetchPins, 5000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  // --- Helper: determine polygon for each pin ---
  const getPolygonName = (pin) => {
    const point = turf.point([pin.y, pin.x]);
    for (const poly of polygons) {
      const polygon = turf.polygon([poly.coords.map(([lat, lng]) => [lng, lat])]);
      if (turf.booleanPointInPolygon(point, polygon)) return poly.name;
    }
    return null;
  };

  const goToMap = (pin) => navigate("/map", { state: { lat: pin.x, lng: pin.y } });

  // --- Voting ---
  const votePin = async (pinId, type) => {
    const pin = pins.find((p) => p.id === pinId);
    if (!pin) return;

    const currentVote = votedPins[pinId];
    let updatedPin = { ...pin };

    try {
      const payload = { pin_id: pinId, session_id: sessionId, vote_type: type };
      const res = await fetch(`${backendUrl}/pins/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Vote failed");

      const updated = await res.json();
      updatedPin = { ...pin, upvotes: updated.upvotes, downvotes: updated.downvotes };

      setPins((prev) => prev.map((p) => (p.id === pinId ? updatedPin : p)));

      setVotedPins((prev) => {
        const newVotes = { ...prev };
        if (currentVote === type) delete newVotes[pinId];
        else newVotes[pinId] = type;
        return newVotes;
      });
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  // --- Unique category list ---
  const categories = useMemo(
    () => [...new Set(pins.map((p) => p.category).filter(Boolean))],
    [pins]
  );

  const handleCategoryChange = (cat) => {
    setFilters((prev) => {
      const updated = prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: updated };
    });
  };

  // --- Filter + sort (highest upvotes first) ---
  const filteredPins = useMemo(() => {
    return pins
      .filter((pin) => {
        const desc = (pin.description || "").toLowerCase();
        const cat = (pin.category || "").toLowerCase();
        const poly = (pin.polygon || "").toLowerCase();

        const matchesDesc = desc.includes(filters.description.toLowerCase());
        const matchesCat =
          filters.categories.length === 0 ||
          filters.categories.map((c) => c.toLowerCase()).includes(cat);
        const matchesPoly =
          !filters.polygon || poly === filters.polygon.toLowerCase();

        return matchesDesc && matchesCat && matchesPoly;
      })
      .sort((a, b) => b.upvotes - a.upvotes);
  }, [pins, filters]);

  // --- Styles ---
  const containerStyle = {
    maxWidth: "900px",
    margin: "80px auto",
    padding: "0 20px",
    color: "#000000ff",
    backgroundColor: "#0e0e0eff",
    fontFamily: "system-ui, sans-serif",
  };

  const cardBaseStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "18px",
    backgroundColor: "#2d2d2d",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#f8fafc" }}>
        All Pins
      </h2>

      {/* Filters */}
      <div
        style={{
          marginBottom: "25px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          placeholder="Search description..."
          value={filters.description}
          onChange={(e) => setFilters({ ...filters, description: e.target.value })}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #555",
            backgroundColor: "#333",
            color: "#f1f5f9",
            width: "60%",
          }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
          {categories.map((cat) => (
            <label key={cat} style={{ color: "#ddd", textTransform: "capitalize" }}>
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
              />{" "}
              {cat}
            </label>
          ))}
        </div>

        <select
          value={filters.polygon}
          onChange={(e) => setFilters({ ...filters, polygon: e.target.value })}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #555",
            backgroundColor: "#333",
            color: "#f1f5f9",
            width: "200px",
          }}
        >
          <option value="">All Zones</option>
          {polygons.map((poly) => (
            <option key={poly.name} value={poly.name}>
              {poly.name}
            </option>
          ))}
        </select>
      </div>

      {/* Forum-style pins */}
      {filteredPins.map((pin) => {
        const catColor =
          CATEGORY_COLORS[pin.category?.toLowerCase()] || CATEGORY_COLORS.other;

        return (
          <div
            key={pin.id}
            style={{
              ...cardBaseStyle,
              borderLeft: `8px solid ${catColor}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.01)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
            }}
          >
            {/* Left column: votes */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginRight: "16px",
                color: "#e2e8f0",
                minWidth: "50px",
              }}
            >
              <button
                onClick={() => votePin(pin.id, "up")}
                disabled={votedPins[pin.id] === "up"}
                style={{
                  background: "none",
                  border: "none",
                  color: votedPins[pin.id] === "up" ? "#4ade80" : "#94a3b8",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ▲
              </button>
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                {pin.upvotes - pin.downvotes}
              </div>
              <button
                onClick={() => votePin(pin.id, "down")}
                disabled={votedPins[pin.id] === "down"}
                style={{
                  background: "none",
                  border: "none",
                  color: votedPins[pin.id] === "down" ? "#f87171" : "#94a3b8",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ▼
              </button>
            </div>

            {/* Right column: content */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: "8px" }}>
                <span
                  style={{
                    backgroundColor: catColor,
                    color: "white",
                    borderRadius: "6px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    marginRight: "8px",
                  }}
                >
                  {pin.category || "Other"}
                </span>
                <span style={{ color: "#9ca3af" }}>
                  Zone: {pin.polygon || "Unassigned"}
                </span>
              </div>

              <h3 style={{ margin: "4px 0", color: "#f1f5f9" }}>{pin.name}</h3>
              <p style={{ color: "#cbd5e1", marginBottom: "8px" }}>
                {pin.description}
              </p>

              <button
                onClick={() => goToMap(pin)}
                style={{
                  marginTop: "6px",
                  backgroundColor: "#2563eb",
                  border: "none",
                  borderRadius: "5px",
                  color: "white",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                View on Map
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PinsList;
