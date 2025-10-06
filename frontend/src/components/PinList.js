import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as turf from "@turf/turf";
import polygons from "./polygons";

// Generate/reuse session ID for this browser tab
let sessionId = sessionStorage.getItem("session_id");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem("session_id", sessionId);
}

function PinsList({ backendUrl }) {
  const [pins, setPins] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });
  const [filters, setFilters] = useState({ description: "", category: "", polygon: "" });
  const [votedPins, setVotedPins] = useState({}); // { pinId: "up" | "down" }

  const navigate = useNavigate();

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

  const getPolygonName = (pin) => {
    const point = turf.point([pin.y, pin.x]);
    for (const poly of polygons) {
      const polygon = turf.polygon([poly.coords.map(([lat, lng]) => [lng, lat])]);
      if (turf.booleanPointInPolygon(point, polygon)) return poly.name;
    }
    return null;
  };

  const goToMap = (pin) => navigate("/map", { state: { lat: pin.x, lng: pin.y } });

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
        return newVotes;
      });
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  // --- Sorting ---
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") direction = "descending";
    setSortConfig({ key, direction });
  };

  const sortedPins = useMemo(() => {
    let sortablePins = [...pins];

    // Filtering
    sortablePins = sortablePins.filter((pin) => {
      return (
        pin.description.toLowerCase().includes(filters.description.toLowerCase()) &&
        pin.category.toLowerCase().includes(filters.category.toLowerCase()) &&
        (pin.polygon || "").toLowerCase().includes(filters.polygon.toLowerCase())
      );
    });

    // Sorting
    if (sortConfig.key) {
      sortablePins.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (typeof aValue === "string")
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        else return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue;
      });
    }

    return sortablePins;
  }, [pins, sortConfig, filters]);

  return (
    <div style={{ maxWidth: "900px", margin: "100px auto" }}>
      <h2>All Pins</h2>

      {/* Filters */}
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          placeholder="Filter Description"
          value={filters.description}
          onChange={(e) => setFilters({ ...filters, description: e.target.value })}
        />
        <input
          placeholder="Filter Category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <input
          placeholder="Filter Zone"
          value={filters.polygon}
          onChange={(e) => setFilters({ ...filters, polygon: e.target.value })}
        />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            {["#", "name", "description", "category", "x", "y", "zone"].map((col) => (
              <th
                key={col}
                style={{ borderBottom: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                onClick={() => requestSort(col === "#" ? "id" : col)}
              >
                {col.charAt(0).toUpperCase() + col.slice(1)}
                {sortConfig.key === (col === "#" ? "id" : col)
                  ? sortConfig.direction === "ascending"
                    ? " ▲"
                    : " ▼"
                  : null}
              </th>
            ))}
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedPins.map((pin, index) => (
            <tr key={pin.id}>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{index + 1}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{pin.name}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{pin.description}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{pin.category}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{pin.x.toFixed(1)}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{pin.y.toFixed(1)}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{pin.polygon || "None"}</td>
              <td
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  gap: "5px",
                  flexWrap: "wrap",
                }}
              >
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
                <button
                  onClick={() => goToMap(pin)}
                  style={{
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  Go to Map
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PinsList;
