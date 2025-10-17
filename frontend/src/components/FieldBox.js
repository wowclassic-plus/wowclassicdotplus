// FieldBox.js
export function FieldBox({ children, label, required }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "2px solid #ccc",
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
