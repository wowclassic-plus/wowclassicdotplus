import React, { useState } from "react";
import Form from "@rjsf/core";
import Ajv8Validator from "@rjsf/validator-ajv8";
import { schemaSections, uiSchemas, sectionColors } from "./SurveySchema";

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

// Custom Checkboxes widget for table/grid layout
function CheckboxesGridWidget({ options, value, onChange }) {
  const { enumOptions } = options;

  const handleToggle = (itemValue) => {
    if (value?.includes(itemValue)) {
      onChange(value.filter(v => v !== itemValue));
    } else {
      onChange([...(value || []), itemValue]);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
      {enumOptions.map((opt, i) => (
        <label key={i} 
        style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={value?.includes(opt.value) || false}
            onChange={() => handleToggle(opt.value)}
            style={{ marginRight: 5 }}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

// Collapsible section with progress bar
function CollapsibleSection({ title, schema, uiSchema, formData, onChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const sectionColor = sectionColors[title] || "#f5f5f5";

  const allKeys = Object.keys(schema.properties);
  const answeredCount = allKeys.filter(k => formData[k] !== undefined && formData[k] !== "").length;
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
        />
      </div>

      {!collapsed && (
        <Form
          schema={schema}
          uiSchema={uiSchema}
          validator={Ajv8Validator}
          FieldTemplate={FieldBox}
          formData={formData}
          onChange={e => onChange({ ...formData, ...e.formData })}
          showErrorList={false}
          children={() => null} // REMOVE default submit
          widgets={{ CheckboxesWidget: CheckboxesGridWidget }} // custom grid widget
        />
      )}
    </div>
  );
}

// Main SurveyForm
export default function SurveyForm({ backendUrl }) {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Check all required fields
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

  if (submitted) return <h2 style={{ color: "#222" }}>Thank you for your feedback!</h2>;

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
        {Object.keys(schemaSections).map(section => (
          <CollapsibleSection
            key={section}
            title={section}
            schema={schemaSections[section]}
            uiSchema={uiSchemas[section] || {}}
            formData={formData}
            onChange={setFormData}
          />
        ))}

        <button
          onClick={handleSubmit}
          style={{
            padding: "10px 20px",
            borderRadius: 5,
            border: "1px solid #000",
            backgroundColor: "#666",
            color: "white",
            cursor: "pointer",
            marginTop: 20,
          }}
        >
          Submit
        </button>

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      </div>
    </div>
  );
}
