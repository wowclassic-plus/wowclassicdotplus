import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "./UserContext";

export default function DiscordCallback({ backendUrl }) {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      navigate("/home");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${backendUrl}/auth/discord/callback?code=${code}`);
        login(res.data);

        // Clear the code from the URL to prevent reuse
        window.history.replaceState({}, "", "/home");

        navigate("/home");
      } catch (err) {
        console.error("Discord login failed:", err);
        navigate("/home");
      }
    };

    fetchUser();
  }, [login, navigate, backendUrl]);

  return <div>Logging in...</div>;
}
