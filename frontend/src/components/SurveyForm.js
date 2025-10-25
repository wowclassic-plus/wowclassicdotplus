import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "./UserContext.jsx";

// --------------------
// Question Components
// --------------------
function FieldBox({ label, required, children }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "2px solid #000000ff",
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {label && (
        <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
          {label} {required ? "*" : null}
        </label>
      )}
      {children}
    </div>
  );
}

function CheckboxGrid({ options, value = [], onChange }) {
  const handleToggle = (item) => {
    if (value.includes(item)) onChange(value.filter((v) => v !== item));
    else onChange([...value, item]);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
      {options.map((opt, i) => (
        <label key={i} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={value.includes(opt)}
            onChange={() => handleToggle(opt)}
            style={{ marginRight: 5 }}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {options.map((opt, i) => (
        <label key={i} style={{ display: "flex", alignItems: "center" }}>
          <input
            type="radio"
            checked={value === opt}
            onChange={() => onChange(opt)}
            style={{ marginRight: 5 }}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

// --------------------
// Collapsible Section
// --------------------
function Section({ section, responses, setResponses, color }) {
  const [collapsed, setCollapsed] = useState(section.locked);

  const totalQuestions = section.questions.length;
  const answeredCount = section.questions.filter((q) => {
    const val = responses[q.key];
    return val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0);
  }).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleChange = (key, value) => {
    if (section.locked) return;
    setResponses({ ...responses, [key]: value });
  };

  const toggleCollapsed = () => {
    if (!section.locked) setCollapsed(!collapsed);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      style={{
        backgroundColor: color || "#f5f5f5",
        padding: 20,
        borderRadius: 16,
        marginBottom: 25,
        border: "3px solid #000000ff",
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      <div
        onClick={toggleCollapsed}
        style={{
          fontWeight: "bold",
          cursor: section.locked ? "not-allowed" : "pointer",
          fontSize: 18,
          marginBottom: collapsed ? 0 : 15,
          userSelect: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: section.locked ? "#999" : "#222",
        }}
      >
        <span>
          {section.title}
          {section.locked && (
            <span
              style={{
                backgroundColor: "#ffdddd",
                color: "#ff0000",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 12,
                marginLeft: 10,
              }}
            >
              COMING SOON
            </span>
          )}
        </span>
        <span style={{ fontSize: 16 }}>{collapsed ? "▶" : "▼"}</span>
      </div>

      <div style={{ height: 12, backgroundColor: "#ddd", borderRadius: 6, marginBottom: 15 }}>
        <div
          style={{
            height: 12,
            width: `${progressPercent}%`,
            backgroundColor: "#4caf50",
            borderRadius: 6,
            transition: "width 0.3s",
          }}
        />
      </div>

      <AnimatePresence>
        {!collapsed && !section.locked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {section.questions.map((q) => (
              <FieldBox key={q.key} label={q.label} required={q.required}>
                {q.type === "text" && (
                  <input
                    type="text"
                    value={responses[q.key] || ""}
                    onChange={(e) => handleChange(q.key, e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 5, border: "1px solid #ccc" }}
                  />
                )}
                {q.type === "radio" && (
                  <RadioGroup
                    options={q.options || []}
                    value={responses[q.key]}
                    onChange={(val) => handleChange(q.key, val)}
                  />
                )}
                {q.type === "checkbox" && (
                  <CheckboxGrid
                    options={q.options || []}
                    value={responses[q.key] || []}
                    onChange={(val) => handleChange(q.key, val)}
                  />
                )}
              </FieldBox>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --------------------
// Main Dynamic Survey Form
// --------------------
export default function DynamicSurveyForm({ backendUrl }) {
  const { user } = useContext(UserContext);
  const [surveyDef, setSurveyDef] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [editing, setEditing] = useState(false); // only render form if editing
  const [error, setError] = useState(null);

  const sectionColors = ["#FFF9E6", "#E6F7FF", "#F0E6FF", "#E6FFE6"];

  useEffect(() => {
    if (!user) return;

    // fetch survey definition
    fetch(`${backendUrl}/survey/definition/`)
      .then((res) => res.json())
      .then(setSurveyDef)
      .catch(console.error);

    // preload user's existing survey
    fetch(`${backendUrl}/survey/user/${user.username}`)
      .then((res) => {
        if (res.status === 200) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setResponses(data.responses);
          setSubmitted(true); // mark as submitted already
        }
      })
      .catch(console.error);
  }, [backendUrl, user]);

  if (!user) return <p>Please log in with Discord to fill the survey.</p>;
  if (!surveyDef) return <p>Loading survey...</p>;

  const validate = () => {
    for (const section of surveyDef.sections) {
      for (const q of section.questions) {
        const val = responses[q.key];
        if (!section.locked && q.required && (val === undefined || val === "" || (Array.isArray(val) && val.length === 0))) {
          return `Please fill all required questions in section "${section.title}".`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    try {
      const res = await fetch(`${backendUrl}/survey/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discord_username: user.username, responses }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSubmitted(true);
      setEditing(false); // exit edit mode
    } catch (err) {
      console.error(err);
      setError("Submission failed.");
    }
  };

  return (
    <div style={{ backgroundColor: "#979797ff", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: 20,
          borderRadius: 10,
          backgroundColor: "#ccccccff",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}
      >
        {submitted && !editing ? (
          <>
            <h3 style={{ marginBottom: 20 }}>You have already submitted the survey.</h3>
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: "15px 20px",
                borderRadius: 5,
                border: "1px solid #000",
                backgroundColor: "#3d8d55ff",
                color: "white",
                cursor: "pointer",
                marginBottom: 20,
              }}
            >
              Edit Survey
            </button>
          </>
        ) : (
          <>
            <h3 style={{ marginBottom: 20 }}>
              {submitted ? "Edit your survey" : "Fill out the survey"}
            </h3>

            {surveyDef.sections.map((section, idx) => (
              <Section
                key={idx}
                section={section}
                responses={responses}
                setResponses={setResponses}
                color={sectionColors[idx % sectionColors.length]}
              />
            ))}

            <button
              onClick={handleSubmit}
              style={{
                padding: "15px 20px",
                borderRadius: 5,
                border: "1px solid #000",
                backgroundColor: "#3d8d55ff",
                color: "white",
                cursor: "pointer",
                marginTop: 0,
              }}
            >
              {submitted ? "Update Survey" : "Submit"}
            </button>

            {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
