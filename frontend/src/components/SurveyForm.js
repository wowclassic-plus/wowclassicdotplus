import React, { useState } from "react";
import Form from "@rjsf/core";
import Ajv8Validator from "@rjsf/validator-ajv8";

// Schema sections
const schemaSections = {
  Lore: {
    title: "Lore",
    properties: {
      name: { type: "string", title: "Name / Character" },
      previous_versions: {
        type: "array",
        title: "What versions of Classic have you played before?",
        items: {
          type: "string",
          enum: ["Hardcore", "SoD", "SoM", "Vanilla", "TBC", "WoTLK", "Cata", "MoP"],
        },
        uniqueItems: true,
      },
    },
    required: ["name", "previous_versions"],
  },
  Quests: {
    title: "Quests",
    properties: {
      scaling_raids: {
        type: "string",
        title: "Do you think Classic Plus should have scaling difficulty levels in raids?",
        enum: ["Yes", "No"],
      },
    },
    required: ["scaling_raids"],
  },
  Raids: {
    title: "Raids",
    properties: {
      new_race_class: {
        type: "string",
        title: "Do you think Classic Plus should have new race/class combinations?",
        enum: ["Yes", "No"],
      },
    },
    required: ["new_race_class"],
  },
  Dungeons: {
    title: "Dungeons",
    properties: {
      currently_play: { type: "string", title: "Do you currently play Classic?", enum: ["Yes", "No"] },
      intend_to_play: { type: "string", title: "Would you intend to play Classic Plus?", enum: ["Yes", "No"] },
    },
    required: ["currently_play", "intend_to_play"],
  },
};

// Section colors
const sectionColors = {
  Lore: "#FFF9E6",
  Quests: "#E6F7FF",
  Raids: "#F0E6FF",
  Dungeons: "#E6FFE6",
};

// Custom field wrapper
function FieldBox({ label, required, children }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #ccc",
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

// Collapsible section with progress
function CollapsibleSection({ title, schema, uiSchema, formData, onChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const sectionColor = sectionColors[title] || "#f5f5f5";

  const allKeys = Object.keys(schema.properties);
  const answeredCount = allKeys.filter((k) => formData[k] !== undefined && formData[k] !== "").length;
  const totalCount = allKeys.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  return (
    <div
      style={{
        backgroundColor: sectionColor,
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        border: "1px solid #ccc",
      }}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 16,
          marginBottom: collapsed ? 0 : 10,
          userSelect: "none",
        }}
      >
        {title} {collapsed ? "▲ Click to expand" : "▼ Click to collapse"}
      </div>

      <div style={{ height: 10, backgroundColor: "#ddd", borderRadius: 5, marginBottom: 10 }}>
        <div
          style={{
            height: 10,
            width: `${progressPercent}%`,
            backgroundColor: "#4caf50",
            borderRadius: 5,
            transition: "width 0.3s",
          }}
        ></div>
      </div>

      {!collapsed && (
        <Form
          schema={schema}
          uiSchema={uiSchema}
          validator={Ajv8Validator}
          FieldTemplate={FieldBox}
          formData={formData}
          onChange={(e) => onChange({ ...formData, ...e.formData })}
          showErrorList={false}
        >
          {/* Pass null so the default submit button is not rendered */}
          {() => null}
        </Form>
      )}
    </div>
  );
}

// Full survey component
export default function SurveyForm({ backendUrl }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  // UI schemas
  const uiSchemas = {
    Lore: { previous_versions: { "ui:widget": "checkboxes", "ui:options": { inline: false } } },
    Quests: { scaling_raids: { "ui:widget": "radio" } },
    Raids: { new_race_class: { "ui:widget": "radio" } },
    Dungeons: { currently_play: { "ui:widget": "radio" }, intend_to_play: { "ui:widget": "radio" } },
  };

  // Validate required fields in all sections
  const validateAll = () => {
    for (let sectionName in schemaSections) {
      const req = schemaSections[sectionName].required || [];
      for (let key of req) {
        if (!formData[key] || (Array.isArray(formData[key]) && formData[key].length === 0)) {
          return `Please fill all required questions in section "${sectionName}".`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateAll();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/survey/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(await res.text());
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Submission failed.");
    }
  };

  if (submitted)
    return <h2 style={{ color: "#222" }}>Thank you for your feedback!</h2>;

  return (
    <div style={{ backgroundColor: "#f7f7f7", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: 20,
          borderRadius: 10,
          backgroundColor: "#fff",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}
      >
        {Object.keys(schemaSections).map((section, index, arr) => (
          <div key={section}>
            <CollapsibleSection
              title={section}
              schema={schemaSections[section]}
              uiSchema={uiSchemas[section] || {}}
              formData={formData}
              onChange={setFormData}
              children={null}
            />

            {/* Only show submit on the last section */}
            {index === arr.length - 1 && (
              <button
                onClick={handleSubmit}
                style={{
                  padding: "10px 20px",
                  borderRadius: 5,
                  border: "1px solid #000",
                  backgroundColor: "#666",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            )}
          </div>
        ))}

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      </div>
    </div>
  );
}
