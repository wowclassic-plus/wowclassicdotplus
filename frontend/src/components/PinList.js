import React, { useEffect, useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as turf from "@turf/turf";
import polygons from "./polygons";
import { UserContext } from "./UserContext";

let sessionId = sessionStorage.getItem("session_id");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem("session_id", sessionId);
}

// Category color map
const CATEGORY_COLORS = {
  lore: "#3b82f6",
  quest: "#22c55e",
  raid: "#ef4444",
  dungeon: "#eab308",
  other: "#8b5cf6",
};

function PinsList({ backendUrl }) {
  const { user: discordUser } = useContext(UserContext);
  const [pins, setPins] = useState([]);
  const [filters, setFilters] = useState({ description: "", categories: [], polygon: "" });
  const [votedPins, setVotedPins] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();

  const getPolygonName = (pin) => {
    const point = turf.point([pin.y, pin.x]);
    for (const poly of polygons) {
      const polygon = turf.polygon([poly.coords.map(([lat, lng]) => [lng, lat])]);
      if (turf.booleanPointInPolygon(point, polygon)) return poly.name;
    }
    return null;
  };

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

        const voterId = discordUser?.username || sessionId;
        const voteRes = await fetch(`${backendUrl}/pins/votes/${voterId}`);
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
  }, [backendUrl, discordUser]);

  const goToMap = (pin) => navigate("/map", { state: { lat: pin.x, lng: pin.y } });

  const votePin = async (pinId, type) => {
    if (!discordUser) {
      setShowLoginPopup(true);
      return;
    }

    const pin = pins.find((p) => p.id === pinId);
    if (!pin) return;

    const currentVote = votedPins[pinId];

    try {
      const payload = {
        pin_id: pinId,
        discord_username: discordUser?.username,
        session_id: !discordUser ? sessionId : undefined,
        vote_type: type,
      };
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
      console.error("Failed to vote:", err);
    }
  };

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

  return (
    <div style={{ maxWidth: "900px", margin: "80px auto", padding: "0 20px", backgroundColor: "#949494", minHeight: "100vh", color: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>All Pins</h2>

      {/* Filters */}
      <div style={{ marginBottom: "25px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <input
          placeholder="Search description..."
          value={filters.description}
          onChange={(e) => setFilters({ ...filters, description: e.target.value })}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #555",
            backgroundColor: "#fff",
            color: "#000",
            width: "60%",
          }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
          {categories.map((cat) => (
            <label key={cat} style={{ color: "#fff", textTransform: "capitalize" }}>
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
            backgroundColor: "#fff",
            color: "#000",
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

      {/* Pins List */}
      {filteredPins.map((pin) => {
        const catColor = CATEGORY_COLORS[pin.category?.toLowerCase()] || CATEGORY_COLORS.other;

        return (
          <div
            key={pin.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: "18px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              padding: "16px",
              borderLeft: `8px solid ${catColor}`,
              color: "#000",
            }}
          >
            {/* Voting */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "16px", minWidth: "50px" }}>
              <button
                onClick={() => votePin(pin.id, "up")}
                style={{
                  background: votedPins[pin.id] === "up" ? "green" : "",
                  color: votedPins[pin.id] === "up" ? "#000" : "#000",
                  padding: "5px 10px",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                👍 {pin.upvotes}
              </button>
              <button
                onClick={() => votePin(pin.id, "down")}
                style={{
                  background: votedPins[pin.id] === "down" ? "red" : "",
                  color: votedPins[pin.id] === "down" ? "#000" : "#000",
                  padding: "5px 10px",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                👎 {pin.downvotes}
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: "8px" }}>
                <span
                  style={{
                    backgroundColor: catColor,
                    color: "#fff",
                    borderRadius: "6px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    marginRight: "8px",
                  }}
                >
                  {pin.category || "Other"}
                </span>
                <span style={{ color: "#555" }}>Zone: {pin.polygon || "Unassigned"}</span>
              </div>
              <h3 style={{ margin: "4px 0" }}>{pin.name}</h3>
              <p style={{ marginBottom: "8px" }}>{pin.description}</p>
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
        );
      })}

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

export default PinsList;

