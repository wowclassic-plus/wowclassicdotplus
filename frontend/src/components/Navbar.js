import React from "react";
import { Link } from "react-router-dom";
import NavbarDiscordLogin from "./NavbarDiscordLogin"; // your Discord login component

function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between", // space between links and login
        alignItems: "center",
        padding: "20px 40px",
        backgroundColor: "rgba(0,0,0,0.8)",
        zIndex: 1000,
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      }}
    >
      {/* Left: Links */}
      <div style={{ display: "flex", justifyContent: "center", flex: 1 }}>
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
      </div>

      {/* Absolute positioned Discord avatar */}
      <div
        style={{
          position: "absolute",
          right: "100px",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <NavbarDiscordLogin />
      </div>
    </nav>
  );
}

export default Navbar;
