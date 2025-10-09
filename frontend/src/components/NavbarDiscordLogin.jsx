import React, {useContext} from "react";
import { UserContext } from "./UserContext";

// const CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
// const FRONTEND_REDIRECT = process.env.REACT_APP_FRONTEND_REDIRECT;
const CLIENT_ID="1425731842442526733"
const FRONTEND_REDIRECT="https://classic-plus-site-frontend.onrender.com/auth/callback"

console.log("CLIENT_ID:", CLIENT_ID);
console.log("FRONTEND_REDIRECT:", FRONTEND_REDIRECT);

export default function NavbarDiscordLogin() {
  const { user, logout } = useContext(UserContext);

  const handleLogin = () => {
    const OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(FRONTEND_REDIRECT)}&response_type=code&scope=identify`;
    window.location.href = OAUTH_URL;
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {!user ? (
        <button onClick={handleLogin} style={{ backgroundColor: "#5865F2", color: "white", padding: "8px 16px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
          Login with Discord
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="avatar" width={32} height={32} style={{ borderRadius: "50%" }} />
          <span style={{ color: "white", fontWeight: "bold" }}>{user.username}#{user.discriminator}</span>
          <button onClick={logout} style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}