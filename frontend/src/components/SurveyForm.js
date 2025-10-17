// SurveyForm.js
import React, { useState } from "react";
import Form from "@rjsf/core";
import Ajv8Validator from "@rjsf/validator-ajv8";
import { schemaSections, uiSchemas, sectionColors } from "./SurveySchema";
import { motion, AnimatePresence } from "framer-motion";

// Each question is a card
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

// Checkboxes as grid
function CheckboxesGridWidget({ options, value, onChange }) {
  const { enumOptions } = options;

  const handleToggle = (itemValue) => {
    if (value?.includes(itemValue)) {
      onChange(value.filter((v) => v !== itemValue));
    } else {
      onChange([...(value || []), itemValue]);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
      {enumOptions.map((opt, i) => (
        <label
          key={i}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
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

// ObjectFieldTemplate: wraps each property in a FieldBox
function ObjectFieldBox({ properties }) {
  return (
    <>
      {properties.map(({ content, name }) => (
        <FieldBox
          key={name}
          label={content.props.schema.title}
          required={content.props.required}
        >
          {content.props.children || content}
        </FieldBox>
      ))}
    </>
  );
}

// Collapsible section with progress bar
function CollapsibleSection({ title, schema, uiSchema, formData, onChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const sectionColor = sectionColors[title] || "#f5f5f5";

  const allKeys = Object.keys(schema.properties);
  const answeredCount = allKeys.filter(
    (k) => formData[k] !== undefined && formData[k] !== ""
  ).length;
  const totalCount = allKeys.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      style={{
        backgroundColor: sectionColor,
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
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 18,
          marginBottom: collapsed ? 0 : 15,
          userSelect: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#222",
        }}
      >
        {title} 
        <span style={{ fontSize: 16 }}>{collapsed ? "▶" : "▼"}</span>
      </div>

      {/* Progress bar */}
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

      {/* Collapsible content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Form
              schema={schema}
              uiSchema={uiSchema}
              validator={Ajv8Validator}
              FieldTemplate={FieldBox}
              ObjectFieldTemplate={ObjectFieldBox}
              formData={formData}
              onChange={(e) => onChange({ ...formData, ...e.formData })}
              showErrorList={false}
              children={() => null}
              widgets={{ CheckboxesWidget: CheckboxesGridWidget }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main SurveyForm
export default function SurveyForm({ backendUrl }) {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

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
        {Object.keys(schemaSections).map((section) => (
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
            padding: "15px 20px",
            borderRadius: 5,
            border: "1px solid #000",
            backgroundColor: "#3d8d55ff",
            color: "white",
            cursor: "pointer",
            marginTop: 0,
          }}
        >
          Submit
        </button>

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      </div>
    </div>
  );
}
