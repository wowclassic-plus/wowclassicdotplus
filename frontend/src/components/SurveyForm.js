import React, { useState } from "react";

function SurveyForm({ backendUrl }) {
  const [formData, setFormData] = useState({
    name: "",
    previousVersions: [],
    scalingRaids: "",
    newRaceClass: "",
    currentlyPlay: "",
    intendToPlay: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let updated = [...formData.previousVersions];
    if (checked) {
      updated.push(value);
    } else {
      updated = updated.filter((v) => v !== value);
    }
    setFormData({ ...formData, previousVersions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    // convert camelCase to snake_case
    const payload = {
      name: formData.name,
      previous_versions: formData.previousVersions,
      scaling_raids: formData.scalingRaids,
      new_race_class: formData.newRaceClass,
      currently_play: formData.currentlyPlay,
      intend_to_play: formData.intendToPlay,
    };
  
    try {
      const response = await fetch(`${backendUrl}/survey/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errText = await response.text();
        console.error("Backend error:", errText);
        setError("Failed to submit survey.");
        return;
      }
  
      setSubmitted(true);
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Check console for details.");
    }
  };  

  if (submitted)
    return (
      <div style={{ textAlign: "center", color: "white", marginTop: "50px" }}>
        <h2>Thank you for your feedback!</h2>
      </div>
    );

  const boxStyle = {
    backgroundColor: "#444", // lighter gray
    border: "1px solid black",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        backgroundColor: "#222", // dark gray page background
        minHeight: "100vh",
        padding: "40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "600px",
          width: "100%",
        }}
      >
        {/* Name/Character */}
        <div style={boxStyle}>
          <input
            name="name"
            placeholder="Name / Character"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #000",
            }}
          />
        </div>

        {/* Previous Versions */}
        <div style={boxStyle}>
          <label>
            <strong>What versions of Classic have you played before?</strong>
          </label>
          <div style={{ marginTop: "10px" }}>
            {["Hardcore", "SoD", "SoM", "Vanilla", "TBC", "WoTLK", "Cata", "MoP"].map(
              (version) => (
                <label key={version} style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    value={version}
                    checked={formData.previousVersions.includes(version)}
                    onChange={handleCheckboxChange}
                  />{" "}
                  {version}
                </label>
              )
            )}
          </div>
        </div>

        {/* Scaling Raids */}
        <div style={boxStyle}>
          <label>
            <strong>
              Do you think Classic Plus should have scaling difficulty levels in raids?
            </strong>
          </label>
          <div style={{ marginTop: "10px" }}>
            <label>
              <input
                type="radio"
                name="scalingRaids"
                value="Yes"
                checked={formData.scalingRaids === "Yes"}
                onChange={handleChange}
                required
              />{" "}
              Yes
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                name="scalingRaids"
                value="No"
                checked={formData.scalingRaids === "No"}
                onChange={handleChange}
              />{" "}
              No
            </label>
          </div>
        </div>

        {/* New Race/Class */}
        <div style={boxStyle}>
          <label>
            <strong>Do you think Classic Plus should have new race/class combinations?</strong>
          </label>
          <div style={{ marginTop: "10px" }}>
            <label>
              <input
                type="radio"
                name="newRaceClass"
                value="Yes"
                checked={formData.newRaceClass === "Yes"}
                onChange={handleChange}
                required
              />{" "}
              Yes
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                name="newRaceClass"
                value="No"
                checked={formData.newRaceClass === "No"}
                onChange={handleChange}
              />{" "}
              No
            </label>
          </div>
        </div>

        {/* Currently Play */}
        <div style={boxStyle}>
          <label>
            <strong>Do you currently play Classic?</strong>
          </label>
          <div style={{ marginTop: "10px" }}>
            <label>
              <input
                type="radio"
                name="currentlyPlay"
                value="Yes"
                checked={formData.currentlyPlay === "Yes"}
                onChange={handleChange}
                required
              />{" "}
              Yes
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                name="currentlyPlay"
                value="No"
                checked={formData.currentlyPlay === "No"}
                onChange={handleChange}
              />{" "}
              No
            </label>
          </div>
        </div>

        {/* Intend to Play */}
        <div style={boxStyle}>
          <label>
            <strong>Would you intend to play Classic Plus?</strong>
          </label>
          <div style={{ marginTop: "10px" }}>
            <label>
              <input
                type="radio"
                name="intendToPlay"
                value="Yes"
                checked={formData.intendToPlay === "Yes"}
                onChange={handleChange}
                required
              />{" "}
              Yes
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                name="intendToPlay"
                value="No"
                checked={formData.intendToPlay === "No"}
                onChange={handleChange}
              />{" "}
              No
            </label>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              fontSize: "1em",
              borderRadius: "5px",
              border: "1px solid black",
              backgroundColor: "#666",
              color: "white",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
      </form>
    </div>
  );
}

export default SurveyForm;
