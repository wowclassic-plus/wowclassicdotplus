import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",  // instead of fixed
        top: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "rgba(0,0,0,0.8)",
        zIndex: 1000,
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      }}
    >
      {["Home", "Survey", "Results", "Map", "Pins"].map((page) => (
        <Link
          key={page}
          to={`/${page.toLowerCase()}`}
          style={{
            color: "#fff",
            margin: "0 20px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          {page}
        </Link>
      ))}
    </nav>
  );
}

export default Navbar;

