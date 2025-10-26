import React from "react";
import { Link } from "react-router-dom";
import NavbarDiscordLogin from "./NavbarDiscordLogin";

function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.2vw 3vw", // relative padding
        backgroundColor: "rgba(0,0,0,0.8)",
        zIndex: 1000,
        boxShadow: "0 0.2vw 1vw rgba(0,0,0,0.3)",
      }}
    >
      {/* Left: Logo */}
      <div
        style={{
          position: "absolute",
          left: "3vw",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <Link to="/" style={{ display: "inline-block" }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: "3.5vw", // scales with viewport width
              height: "auto",
              cursor: "pointer",
              borderRadius: "0.2vw",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow =
                "0 0 0.8vw rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1.0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </Link>
      </div>

      {/* Center: Links */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flex: 1,
          flexWrap: "wrap", // helps on small screens
          gap: "2.3vw",
        }}
      >
        {["Home","Dashboard", "Survey", "Results", "Map", "Map2", "Pins"].map((page) => (
          <Link
            key={page}
            to={`/${page.toLowerCase()}`}
            style={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1.1vw", // responsive font size
              transition: "color 0.2s",
            }}
          >
            {page}
          </Link>
        ))}
      </div>

      {/* Right: Discord avatar/login */}
      <div
        style={{
          position: "absolute",
          right: "10vw",
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
