import React, { useEffect, useState } from "react";

function SurveyResults({ backendUrl }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/survey/`)
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.error("Error fetching survey results:", err));
  }, [backendUrl]);

  if (entries.length === 0)
    return (
      <p style={{ textAlign: "center", color: "white" }}>
        No survey entries yet.
      </p>
    );

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
        backgroundColor: "#222",
        color: "white",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Survey Results
      </h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#333",
          border: "1px solid black",
        }}
      >
        <thead style={{ backgroundColor: "#444" }}>
          <tr>
            <th style={{ border: "1px solid black", padding: "10px" }}>Name</th>
            <th style={{ border: "1px solid black", padding: "10px" }}>
              Previous Versions
            </th>
            <th style={{ border: "1px solid black", padding: "10px" }}>
              Scaling Raids
            </th>
            <th style={{ border: "1px solid black", padding: "10px" }}>
              New Race/Class
            </th>
            <th style={{ border: "1px solid black", padding: "10px" }}>
              Currently Play
            </th>
            <th style={{ border: "1px solid black", padding: "10px" }}>
              Intend to Play
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} style={{ backgroundColor: idx % 2 ? "#2a2a2a" : "#333" }}>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {entry.name}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {entry.previous_versions?.join(", ")}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {entry.scaling_raids}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {entry.new_race_class}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {entry.currently_play}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {entry.intend_to_play}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SurveyResults;
