import React, { useContext } from "react";
import { UserContext } from "./UserContext";

const CLIENT_ID = "1425731842442526733";
const FRONTEND_REDIRECT = "https://classic-plus-site-frontend.onrender.com/auth/callback";

console.log("CLIENT_ID:", CLIENT_ID);
console.log("FRONTEND_REDIRECT:", FRONTEND_REDIRECT);

export default function NavbarDiscordLogin() {
  const { user, logout } = useContext(UserContext);

  const handleLogin = () => {
    const OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      FRONTEND_REDIRECT
    )}&response_type=code&scope=identify`;
    window.location.href = OAUTH_URL;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1vw", // relative gap
      }}
    >
      {!user ? (
        <button
          onClick={handleLogin}
          style={{
            backgroundColor: "#5865F2",
            color: "white",
            padding: "0.6vw 1.2vw", // scales with viewport
            border: "none",
            borderRadius: "0.6vw",
            fontWeight: "bold",
            fontSize: "1vw", // responsive text
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 0 1vw rgba(88, 101, 242, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1.0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Login with Discord
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8vw",
            flexWrap: "wrap", // helps on mobile
          }}
        >
          <img
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
            alt="avatar"
            style={{
              width: "2.2vw",
              height: "2.2vw",
              borderRadius: "50%",
              objectFit: "cover",
              border: "0.15vw solid rgba(255,255,255,0.8)",
            }}
          />
          <span
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: "1vw",
              whiteSpace: "nowrap",
            }}
          >
            {user.username}#{user.discriminator}
          </span>
          <button
            onClick={logout}
            style={{
              backgroundColor: "#ff4d4d",
              color: "white",
              border: "none",
              padding: "0.4vw 0.8vw",
              borderRadius: "0.4vw",
              cursor: "pointer",
              fontSize: "0.9vw",
              transition: "transform 0.2s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 0 0.8vw rgba(255, 77, 77, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1.0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
