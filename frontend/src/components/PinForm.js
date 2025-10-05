// src/components/PinForm.js
import React from "react";

function PinForm({ description, setDescription, name, setName, category, setCategory, onSave, onCancel }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minWidth: "200px",
      maxWidth: "250px",
      gap: "8px",
      padding: "10px"
    }}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: "8px",
          fontSize: "14px",
          borderRadius: "4px",
          border: "1px solid #ccc"
        }}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{
          padding: "8px",
          fontSize: "14px",
          borderRadius: "4px",
          border: "1px solid #ccc"
        }}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          padding: "8px",
          fontSize: "14px",
          borderRadius: "4px",
          border: "1px solid #ccc"
        }}
      >
        <option>Lore</option>
        <option>Quest</option>
        <option>Raid</option>
        <option>Dungeon</option>
      </select>
      <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
        <button
          onClick={onSave}
          style={{
            flex: 1,
            padding: "8px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "8px",
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PinForm;
